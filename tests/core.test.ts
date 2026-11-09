import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addMonths,due,fuelStats,demoVault,emptyVault,vaultSchema,type Fill} from '../src/domain';
import {encryptVault,decryptVault,deriveKey,parseEnvelope} from '../src/crypto';
import {fleetQueue,fleetCsv} from '../src/report';
const p=demoVault().parts[0];
test('calendar: leap years and end-of-month clamp',()=>{assert.equal(addMonths('2024-01-31',1),'2024-02-29');assert.equal(addMonths('2024-02-29',12),'2025-02-28');assert.equal(addMonths('2025-08-31',6),'2026-02-28');});
test('reminder triggers at first date or distance reached',()=>{const part={...p,lastDate:'2025-01-01',lastKm:10000,intervalKm:15000,intervalMonths:12};assert.equal(due(part,25000,'2025-03-01').status,'overdue');assert.equal(due(part,11000,'2026-01-01').status,'overdue');assert.equal(due(part,24500,'2025-03-01').status,'soon');assert.equal(due(part,11000,'2025-03-01').status,'ok');});
test('disabled criteria are ignored; lead values are configurable',()=>{assert.equal(due({...p,intervalKm:0,lastDate:'2025-01-01',intervalMonths:12},999999,'2025-03-01').status,'ok');assert.equal(due({...p,intervalMonths:0,lastKm:0,intervalKm:5000},4000,'2030-01-01',0,500).status,'ok');});
const fill=(km:number,litres:number,full:boolean):Fill=>({id:String(km),vehicleId:'v',date:'2026-01-01',km,litres,cost:litres*1.8,full,station:''});
test('fuel: partials accumulated between full fills, first fill excluded',()=>{const stats=fuelStats([fill(1000,50,true),fill(1200,10,false),fill(1500,20,true),fill(1600,10,false)]);assert.equal(stats.average,6);assert.equal(stats.totalKm,500);assert.equal(stats.totalLitres,90);});
test('fuel: partials before baseline excluded and weighted by distance',()=>{const stats=fuelStats([fill(100,20,false),fill(1000,50,true),fill(1100,10,true),fill(2000,45,true)]);assert.equal(stats.average,5.5);assert.equal(stats.totalKm,1000);assert.equal(stats.points.length,2);assert.equal(fuelStats([fill(1000,50,true)]).average,null);});
test('vault rejects impossible dates, orphan links, duplicate IDs, km regression',()=>{const v=demoVault();assert.equal(vaultSchema.safeParse(v).success,true);v.services[0].date='2026-02-31';assert.equal(vaultSchema.safeParse(v).success,false);const orphan=demoVault();orphan.parts[0].vehicleId='missing';assert.equal(vaultSchema.safeParse(orphan).success,false);const dupe=demoVault();dupe.vehicles.push(dupe.vehicles[0]);assert.equal(vaultSchema.safeParse(dupe).success,false);const km=demoVault();km.vehicles[0].odometer=0;assert.equal(vaultSchema.safeParse(km).success,false);});
test('AES-GCM roundtrip, fresh IV, wrong-password and tamper rejection',async()=>{const salt=crypto.getRandomValues(new Uint8Array(16)),key=await deriveKey('Une-phrase-de-test-123!',salt);const v=demoVault();v.vehicles[0].owner='Titulaire secret';const text=await encryptVault(v,key,salt);assert.equal(text.includes('Titulaire secret'),false);assert.deepEqual((await decryptVault(text,'Une-phrase-de-test-123!')).vault,v);const again=await encryptVault(v,key,salt);assert.notEqual(parseEnvelope(text).iv,parseEnvelope(again).iv);await assert.rejects(decryptVault(text,'Mauvais-mot-de-passe'));const e=parseEnvelope(text);e.data=(e.data[0]==='A'?'B':'A')+e.data.slice(1);await assert.rejects(decryptVault(JSON.stringify(e),'Une-phrase-de-test-123!'));assert.throws(()=>parseEnvelope(text.replace('600000','1')));});
test('password change produces new key and rejects old password',async()=>{const salt=crypto.getRandomValues(new Uint8Array(16));const key=await deriveKey('Nouveau-mot-de-passe-123',salt);const text=await encryptVault(emptyVault(),key,salt);await assert.rejects(decryptVault(text,'Ancien-mot-de-passe-123'));assert.deepEqual((await decryptVault(text,'Nouveau-mot-de-passe-123')).vault,emptyVault());});

test('GLB: bundled models self-contained, imported external URLs and corrupt lengths rejected',async()=>{const {validateGLB}=await import('../src/glb');const {readFile}=await import('node:fs/promises');for(const name of ['sedan','hatchback-sports','suv','suv-luxury','truck','van','sedan-sports','race','taxi']){validateGLB(new Uint8Array(await readFile(new URL('../public/models/'+name+'.glb',import.meta.url))));}assert.throws(()=>validateGLB(new Uint8Array([1,2,3])));const j=JSON.stringify({asset:{version:'2.0'},images:[{uri:'https://tracker.example/private'}]});const padded=j.padEnd(Math.ceil(j.length/4)*4,' ');const bytes=new Uint8Array(20+padded.length);const d=new DataView(bytes.buffer);d.setUint32(0,0x46546c67,true);d.setUint32(4,2,true);d.setUint32(8,bytes.length,true);d.setUint32(12,padded.length,true);d.setUint32(16,0x4e4f534a,true);bytes.set(new TextEncoder().encode(padded),20);assert.throws(()=>validateGLB(bytes),/sans ressource externe/);});

test('GLB: tiny file cannot declare unbounded decoded geometry',async()=>{
 const {validateGLB}=await import('../src/glb');
 const make=(count:number)=>{const json=JSON.stringify({asset:{version:'2.0'},accessors:[{componentType:5126,type:'VEC3',count}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],nodes:[{mesh:0}],scenes:[{nodes:[0]}],scene:0});const padded=json.padEnd(Math.ceil(json.length/4)*4,' ');const bytes=new Uint8Array(20+padded.length);const view=new DataView(bytes.buffer);view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,bytes.length,true);view.setUint32(12,padded.length,true);view.setUint32(16,0x4e4f534a,true);bytes.set(new TextEncoder().encode(padded),20);return bytes;};
 assert.throws(()=>validateGLB(make(10_000_000)),/Géométrie GLB/);
 assert.doesNotThrow(()=>validateGLB(make(100)));
});

test('older vaults without folders migrate; unknown folders and duplicate folders rejected',()=>{const old:any=demoVault();delete old.folders;delete old.vehicles[0].folderId;const parsed=vaultSchema.parse(old);assert.deepEqual(parsed.folders,[]);assert.equal(parsed.vehicles[0].folderId,'');const missing=demoVault();missing.vehicles[0].folderId='other';assert.equal(vaultSchema.safeParse(missing).success,false);const duplicate=demoVault();duplicate.folders.push({...duplicate.folders[0]});assert.equal(vaultSchema.safeParse(duplicate).success,false);});

test('historic catalogue spans 1980–2026 and Audi 8P body and engine families',async()=>{
 const {readFile}=await import('node:fs/promises');const data=JSON.parse(await readFile(new URL('../public/catalogue-history.json',import.meta.url),'utf8'));
 assert.equal(data.count,data.vehicles.length);assert.ok(data.count>49000);
 assert.equal(Math.min(...data.vehicles.map((v:{year:number})=>v.year)),1980);
 assert.equal(Math.max(...data.vehicles.map((v:{year:number})=>v.year)),2026);
 assert.equal(new Set(data.vehicles.map((v:{id:string})=>v.id)).size,data.count);
 const a3=data.vehicles.filter((v:{id:string})=>v.id.startsWith('audi-8p:'));
 for(const body of ['A3 3 portes','A3 Sportback','A3 Cabriolet','S3 3 portes','S3 Sportback','RS3 Sportback'])assert.ok(a3.some((v:{model:string})=>v.model.startsWith(body)));
 for(const engine of ['1.2 TFSI','1.4 TFSI','1.6 TDI','1.8 TFSI','2.0 TFSI','2.0 TDI','3.2 quattro','2.5 TFSI'])assert.ok(a3.some((v:{version:string})=>v.version.includes(engine)));
});

test('fleet report sorts urgent work and prevents CSV formula execution',()=>{
 const v=demoVault();v.vehicles[0].registration='=HYPERLINK("https://bad.example")';
 const queue=fleetQueue(v,v.vehicles,'2026-11-09');assert.ok(queue.length>0);assert.equal(queue[0].due.status,'overdue');
 const csv=fleetCsv(v,v.vehicles,'2026-11-09');assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('Vidange & filtre à huile'));
});
