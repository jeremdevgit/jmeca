#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::{json, Value};
use std::{fs, io::{Read, Write}, path::{Path, PathBuf}, sync::Mutex, time::Duration};
use tauri::{Manager, State};
const MAX_VAULT: usize = 96 * 1024 * 1024;
struct Store(Mutex<()>);
fn validate_envelope(text: &str) -> Result<(), String> {
    if text.len() > MAX_VAULT { return Err("Coffre trop volumineux (96 Mo maximum).".into()); }
    let v: Value = serde_json::from_str(text).map_err(|_| "Fichier de coffre invalide.")?;
    if v["format"] != "jmeca-v1" || v["iterations"] != 600000 || v["cipher"] != "AES-256-GCM" { return Err("Format de coffre non reconnu.".into()); }
    for (key, size) in [("salt",16),("iv",12)] {
        let bytes = STANDARD.decode(v[key].as_str().ok_or("En-tête incomplet.")?).map_err(|_| "En-tête invalide.")?;
        if bytes.len() != size { return Err("En-tête invalide.".into()); }
    }
    let c = v["data"].as_str().ok_or("Données absentes.")?;
    if c.len() < 24 || c.len() % 4 != 0 || !c.bytes().all(|b| b.is_ascii_alphanumeric() || b"+/=".contains(&b)) { return Err("Contenu chiffré invalide.".into()); }
    Ok(())
}
fn data_path(app: &tauri::AppHandle) -> Result<PathBuf,String> {
    let dir = app.path().app_data_dir().map_err(|_| "Dossier de données inaccessible.")?;
    fs::create_dir_all(&dir).map_err(|_| "Impossible de créer le dossier du coffre.")?;
    #[cfg(unix)] { use std::os::unix::fs::PermissionsExt; fs::set_permissions(&dir, fs::Permissions::from_mode(0o700)).map_err(|_| "Permissions du dossier impossibles.")?; }
    Ok(dir.join("garage.jmeca"))
}
fn read_bounded(path: &Path) -> Result<String,String> {
    let f = fs::File::open(path).map_err(|_| "Impossible de lire le fichier.")?;
    if f.metadata().map_err(|_| "Fichier inaccessible.")?.len() > MAX_VAULT as u64 { return Err("Fichier trop volumineux.".into()); }
    let mut text = String::new();
    f.take(MAX_VAULT as u64 + 1).read_to_string(&mut text).map_err(|_| "Lecture impossible.")?;
    validate_envelope(&text)?;
    Ok(text)
}
fn atomic_write(path: &Path, text: &str) -> Result<(),String> {
    let mut f = tempfile::NamedTempFile::new_in(path.parent().ok_or("Dossier invalide.")?).map_err(|_| "Création du fichier temporaire impossible.")?;
    f.write_all(text.as_bytes()).and_then(|_| f.as_file().sync_all()).map_err(|_| "Écriture impossible. Vérifiez l'espace disque.")?;
    f.persist(path).map_err(|_| "Enregistrement impossible. Le coffre précédent est conservé.")?;
    #[cfg(unix)] { let dir = fs::File::open(path.parent().unwrap()).map_err(|_| "Dossier inaccessible.")?; dir.sync_all().map_err(|_| "Synchronisation du dossier impossible.")?; }
    Ok(())
}
#[tauri::command]
fn load_vault(app: tauri::AppHandle, store: State<Store>) -> Result<Option<String>,String> {
    let _guard = store.0.lock().map_err(|_| "Coffre occupé.")?;
    let path = data_path(&app)?;
    if !path.exists() { return Ok(None); }
    read_bounded(&path).map(Some)
}
#[tauri::command]
fn save_vault(app: tauri::AppHandle, store: State<Store>, envelope: String) -> Result<(),String> {
    validate_envelope(&envelope)?;
    let _guard = store.0.lock().map_err(|_| "Coffre occupé.")?;
    let path = data_path(&app)?;
    if path.exists() { if let Ok(old) = read_bounded(&path) { atomic_write(&path.with_extension("jmeca.bak"), &old)?; } }
    atomic_write(&path,&envelope)
}
#[tauri::command]
async fn export_vault(envelope: String) -> Result<bool,String> {
    validate_envelope(&envelope)?;
    let file = rfd::AsyncFileDialog::new().add_filter("Coffre JMeca", &["jmeca"]).set_file_name("Sauvegarde-JMeca.jmeca").save_file().await;
    if let Some(file) = file { atomic_write(file.path(),&envelope)?; return Ok(true); }
    Ok(false)
}
#[tauri::command]
async fn import_vault() -> Result<Option<String>,String> {
    if let Some(file) = rfd::AsyncFileDialog::new().add_filter("Coffre JMeca", &["jmeca","bak"]).pick_file().await { return read_bounded(file.path()).map(Some); }
    Ok(None)
}
#[tauri::command]
async fn export_attachment(name: String, data: String) -> Result<bool,String> {
    if data.len() > 14 * 1024 * 1024 { return Err("Pièce jointe trop volumineuse.".into()); }
    let bytes = STANDARD.decode(data).map_err(|_| "Pièce jointe invalide.")?;
    let name = Path::new(&name).file_name().and_then(|s|s.to_str()).unwrap_or("piece-jointe");
    if let Some(file) = rfd::AsyncFileDialog::new().set_file_name(name).save_file().await { file.write(&bytes).await.map_err(|_| "Export impossible.")?; return Ok(true); }
    Ok(false)
}
#[tauri::command]
async fn search_stations(postcode: String, fuel: String, lat: Option<f64>, lon: Option<f64>) -> Result<Value,String> {
    let allowed = ["gazole","e10","sp98","sp95","e85","gplc"];
    if !allowed.contains(&fuel.as_str()) { return Err("Carburant invalide.".into()); }
    let filter = match (lat,lon) {
        (Some(a),Some(b)) if a.is_finite() && b.is_finite() && (-90.0..=90.0).contains(&a) && (-180.0..=180.0).contains(&b) => format!("within_distance(geom, GEOM'POINT({b} {a})', 20km)"),
        (None,None) if postcode.len()==5 && postcode.bytes().all(|b|b.is_ascii_digit()) => format!("cp = '{postcode}'"),
        _ => return Err("Indiquez un code postal français à 5 chiffres ou une position valide.".into())
    };
    let client = reqwest::Client::builder().timeout(Duration::from_secs(20)).redirect(reqwest::redirect::Policy::none()).build().map_err(|_| "Réseau indisponible.")?;
    let mut response = client.get("https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records")
        .query(&[("where",format!("({filter}) AND {fuel}_prix IS NOT NULL")),("order_by",format!("{fuel}_prix ASC")),("limit","30".into())]).send().await.map_err(|_| "Service des stations indisponible. Vérifiez votre connexion.")?.error_for_status().map_err(|_| "Le service officiel a refusé la requête.")?;
    if response.content_length().unwrap_or(0) > 2_000_000 { return Err("Réponse trop volumineuse.".into()); }
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|_| "Réponse interrompue.")? { if bytes.len()+chunk.len()>2_000_000 { return Err("Réponse trop volumineuse.".into()); } bytes.extend_from_slice(&chunk); }
    let data: Value = serde_json::from_slice(&bytes).map_err(|_| "Réponse officielle invalide.")?;
    let results: Vec<Value> = data["results"].as_array().ok_or("Réponse officielle invalide.")?.iter().map(|s|json!({"id":s["id"],"address":s["adresse"],"city":s["ville"],"postcode":s["cp"],"price":s[format!("{fuel}_prix")],"updated":s[format!("{fuel}_maj")],"outage":s[format!("{fuel}_rupture_debut")],"location":s["geom"],"services":s["services_service"]})).collect();
    Ok(json!({"results":results,"total":data["total_count"]}))
}
fn main() {
    tauri::Builder::default().plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| { if let Some(w) = app.get_webview_window("main") { let _ = w.show(); let _ = w.set_focus(); } })).manage(Store(Mutex::new(())))
        .invoke_handler(tauri::generate_handler![load_vault,save_vault,export_vault,import_vault,export_attachment,search_stations])
        .run(tauri::generate_context!()).expect("Impossible de démarrer JMeca");
}
#[cfg(test)]
mod tests {
    use super::*;
    fn envelope() -> String { json!({"format":"jmeca-v1","iterations":600000,"cipher":"AES-256-GCM","salt":STANDARD.encode([0u8;16]),"iv":STANDARD.encode([1u8;12]),"data":STANDARD.encode([2u8;32])}).to_string() }
    #[test] fn rejects_plaintext_and_wrong_kdf() { assert!(validate_envelope("carte grise privée").is_err()); assert!(validate_envelope(&envelope()).is_ok()); assert!(validate_envelope(&envelope().replace("600000","1")).is_err()); }
    #[test] fn atomic_replace_and_read() { let dir=tempfile::tempdir().unwrap(); let p=dir.path().join("test.jmeca"); atomic_write(&p,&envelope()).unwrap(); atomic_write(&p,&envelope()).unwrap(); assert_eq!(read_bounded(&p).unwrap(),envelope()); }
}
