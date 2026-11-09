import {due,today,type Vehicle,type Vault} from './domain';

export function fleetQueue(vault:Vault,vehicles:Vehicle[],now=today()){
 const ids=new Set(vehicles.map(v=>v.id));
 const cars=new Map(vehicles.map(v=>[v.id,v]));
 return vault.parts.filter(p=>ids.has(p.vehicleId)).map(part=>{
  const vehicle=cars.get(part.vehicleId)!;
  return {vehicle,part,due:due(part,vehicle.odometer,now,vault.settings.leadDays,vault.settings.leadKm)};
 }).filter(row=>row.due.status!=='ok').sort((a,b)=>{
  const rank=(s:string)=>s==='overdue'?0:1;
  return rank(a.due.status)-rank(b.due.status)||(a.due.days??Infinity)-(b.due.days??Infinity)||(a.due.km??Infinity)-(b.due.km??Infinity)||a.vehicle.make.localeCompare(b.vehicle.make);
 });
}

function cell(value:unknown){
 let text=String(value??'').replace(/\r\n?/g,'\n');
 // Spreadsheet programs may execute formulas from user-entered vehicle fields.
 if(/^[\s\u0000-\u001f]*[=+\-@]/u.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}

export function fleetCsv(vault:Vault,vehicles:Vehicle[],now=today()){
 const folders=new Map(vault.folders.map(f=>[f.id,f.name]));
 const header=['Dossier','Marque','Modèle','Version','Année','Immatriculation','Kilométrage actuel','Pièce / opération','État','Date échéance','Kilomètres restants','Dernière intervention','Kilométrage dernière intervention','Source'];
 const rows:unknown[][]=[];
 for(const vehicle of vehicles){
  const prefix=[folders.get(vehicle.folderId)??'',vehicle.make,vehicle.model,vehicle.version,vehicle.year,vehicle.registration,vehicle.odometer];
  const parts=vault.parts.filter(p=>p.vehicleId===vehicle.id);
  if(!parts.length)rows.push([...prefix,'','','','','','','']);
  for(const part of parts){
   const status=due(part,vehicle.odometer,now,vault.settings.leadDays,vault.settings.leadKm);
   rows.push([...prefix,part.name,status.status,status.date??'',status.km??'',part.lastDate,part.lastKm,part.source]);
  }
 }
 return '\ufeff'+[header,...rows].map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n';
}
