"""Fetch licensed public catalogue and Kenney models. Never uses personal vehicle data."""
import urllib.request, json, re, zipfile, io, hashlib, struct, posixpath
from pathlib import Path
from datetime import datetime, timezone
root=Path(__file__).resolve().parents[1]
def fetch(url):
    return urllib.request.urlopen(url,timeout=60).read()
url='https://data.ademe.fr/data-fair/api/v1/datasets/ademe-car-labelling/lines?size=10000'
data=json.loads(fetch(url))
rows=[]
for r in data['results']:
    rows.append({'id':r['_id'],'make':r.get('Marque',''),'model':r.get('Modèle',''),'version':r.get('Description_Commerciale',''),'energy':r.get('Energie',''),'cc':r.get('Cylindrée'),'kw':r.get('Puissance_maximale'),'fiscal':r.get('Puissance_fiscale'),'gearbox':r.get('Type_de_boite',''),'gears':r.get('Nombre_rapports'),'body':r.get('Carrosserie',''),'wltp':r.get('Conso_vitesse_mixte_Min')})
(root/'public/catalogue.json').write_text(json.dumps({'source':'ADEME — Car Labelling','url':'https://data.ademe.fr/datasets/ademe-car-labelling','license':'Licence Ouverte 2.0','retrieved':datetime.now(timezone.utc).isoformat(),'count':len(rows),'vehicles':rows},ensure_ascii=False,separators=(',',':')))
print('Catalogue:',len(rows),'versions')
page=fetch('https://kenney.nl/assets/car-kit').decode()
links=re.findall(r'(?:href|data-url)=[\"\x27]([^\"\x27]+)[\"\x27]',page)
links=[x for x in links if '.zip' in x or 'download' in x]
print('Download links',links)
# Author's own OpenGameArt mirror (Kenney) when original download uses a form.
page=fetch('https://opengameart.org/content/car-kit').decode()
zipurls=re.findall(r'href="([^"]+\.zip)"',page)
zipurl=next(x for x in zipurls if 'car' in x)
blob=fetch(zipurl)
z=zipfile.ZipFile(io.BytesIO(blob))
print('Models', [x for x in z.namelist() if x.endswith('.glb') or x.endswith('.gltf')][:70])
(root/'asset-download.json').write_text(json.dumps({'url':zipurl,'sha256':hashlib.sha256(blob).hexdigest()}))
(root/'car-kit.zip').write_bytes(blob)
# glTF models share a small embedded/external palette. Copy selected files plus texture.
models=['sedan','hatchback-sports','suv','suv-luxury','truck','van','sedan-sports','race','taxi']
manifest=[]
for name in models:
    matches=[x for x in z.namelist() if x.endswith('/'+name+'.glb') or x.endswith('/'+name+'.gltf')]
    if not matches: continue
    entry=matches[0]; dest=root/'public/models'/Path(entry).name
    content=z.read(entry)
    if entry.endswith('.glb'):
        length=struct.unpack_from('<I',content,12)[0]
        meta=json.loads(content[20:20+length]);offset=20+length
        binlen=struct.unpack_from('<I',content,offset)[0]
        binary=bytearray(content[offset+8:offset+8+binlen])
        for img in meta.get('images',[]):
            if 'uri' not in img: continue
            resource=posixpath.normpath(posixpath.join(posixpath.dirname(entry),img.pop('uri')))
            imagebytes=z.read(resource)
            while len(binary)%4: binary.append(0)
            meta.setdefault('bufferViews',[]).append({'buffer':0,'byteOffset':len(binary),'byteLength':len(imagebytes)})
            img['bufferView']=len(meta['bufferViews'])-1;img['mimeType']='image/png'
            binary.extend(imagebytes)
        meta['buffers'][0]['byteLength']=len(binary)
        while len(binary)%4: binary.append(0)
        encoded=json.dumps(meta,separators=(',',':')).encode()
        while len(encoded)%4: encoded+=b' '
        content=struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
    dest.write_bytes(content); manifest.append({'id':name,'file':'/models/'+dest.name})
    if entry.endswith('.gltf'):
        g=json.loads(z.read(entry))
        for item in g.get('buffers',[])+g.get('images',[]):
            uri=item.get('uri','')
            if uri and not uri.startswith('data:'):
                from posixpath import normpath, join, dirname
                target=normpath(join(dirname(entry),uri))
                output=(dest.parent/uri).resolve()
                if output.is_relative_to((root/'public').resolve()):
                    output.parent.mkdir(parents=True,exist_ok=True); output.write_bytes(z.read(target))
(root/'public/models/manifest.json').write_text(json.dumps(manifest))
for entry in z.namelist():
    if 'license' in entry.lower() and entry.endswith('.txt'): (root/'public/models/LICENSE-Kenney.txt').write_bytes(z.read(entry)); break
print('Bundled models:',manifest)
