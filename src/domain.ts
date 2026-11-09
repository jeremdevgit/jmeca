import {z} from 'zod';
const text=z.string().max(2000), id=z.string().min(1).max(80), km=z.number().int().min(0).max(9999999);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s);
const positive=z.number().min(0).max(10000000);
export const attachmentSchema=z.object({id,name:z.string().min(1).max(255),mime:z.enum(['application/pdf','image/png','image/jpeg','image/webp','model/gltf-binary']),data:z.string().max(14*1024*1024).regex(/^[A-Za-z0-9+/]*={0,2}$/)}).strict();
export const folderSchema=z.object({id,name:z.string().min(1).max(120),clientName:text,contact:text,notes:text}).strict();
export const vehicleSchema=z.object({id,folderId:z.string().max(80).default(''),make:text,model:text,version:text,year:z.number().int().min(1900).max(2100),energy:text,odometer:km,registration:text,vin:text,owner:text,registrationDate:z.union([date,z.literal('')]),registrationDocument:attachmentSchema.optional(),notes:text,model3d:text,customModel:attachmentSchema.optional(),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),appearance:z.object({body:z.enum(['three-door','sportback','cabriolet']),grille:z.enum(['standard','honeycomb']),mirrors:z.enum(['standard','s-line'])}).strict().optional(),specs:z.object({tires:text,bulbs:text,oil:text,transmission:text,source:text}).strict()}).strict();
export const partSchema=z.object({id,vehicleId:id,name:z.string().min(1).max(200),reference:text,category:text,lastDate:date,lastKm:km,intervalKm:km,intervalMonths:z.number().int().min(0).max(1200),notes:text,source:text}).strict().refine(p=>p.intervalKm>0||p.intervalMonths>0,{message:'Définissez au moins une périodicité.'});
export const serviceSchema=z.object({id,vehicleId:id,partId:z.string().max(80),title:z.string().min(1).max(200),date,km,cost:positive,garage:text,notes:text,attachments:z.array(attachmentSchema).max(20)}).strict();
export const fillSchema=z.object({id,vehicleId:id,date,km,litres:z.number().positive().max(1000),cost:positive,full:z.boolean(),station:text}).strict();
export const vaultSchema=z.object({schema:z.literal(1),folders:z.array(folderSchema).max(500).default([]),vehicles:z.array(vehicleSchema).max(100),parts:z.array(partSchema).max(5000),services:z.array(serviceSchema).max(10000),fills:z.array(fillSchema).max(20000),settings:z.object({leadDays:z.number().int().min(0).max(365),leadKm:km}).strict()}).strict().superRefine((v,ctx)=>{
 const folders=new Set(v.folders.map(x=>x.id)); const vehicles=new Map(v.vehicles.map(x=>[x.id,x])); const parts=new Map(v.parts.map(x=>[x.id,x]));
 for(const collection of [v.folders,v.vehicles,v.parts,v.services,v.fills]) if(new Set(collection.map(x=>x.id)).size!==collection.length) ctx.addIssue({code:'custom',message:'Identifiants dupliqués.'});
 for(const car of v.vehicles) if(car.folderId&&!folders.has(car.folderId)) ctx.addIssue({code:'custom',message:'Dossier du véhicule invalide.'});
 for(const x of [...v.parts,...v.services,...v.fills]) if(!vehicles.has(x.vehicleId)||('km' in x?x.km:x.lastKm)>(vehicles.get(x.vehicleId)?.odometer??-1)) ctx.addIssue({code:'custom',message:'Véhicule ou kilométrage incohérent.'});
 for(const s of v.services) if(s.partId&&parts.get(s.partId)?.vehicleId!==s.vehicleId) ctx.addIssue({code:'custom',message:'Pièce liée invalide.'});
 let total=0; for(const s of v.services) for(const a of s.attachments) total+=a.data.length;
 for(const vcl of v.vehicles) {if(vcl.customModel) total+=vcl.customModel.data.length;if(vcl.registrationDocument) total+=vcl.registrationDocument.data.length;}
 if(total>56*1024*1024) ctx.addIssue({code:'custom',message:'Limite totale des pièces jointes : 40 Mo environ.'});
});
export type Folder=z.infer<typeof folderSchema>; export type Vehicle=z.infer<typeof vehicleSchema>; export type Part=z.infer<typeof partSchema>; export type Service=z.infer<typeof serviceSchema>; export type Fill=z.infer<typeof fillSchema>; export type Attachment=z.infer<typeof attachmentSchema>; export type Vault=z.infer<typeof vaultSchema>;
export const uid=()=>crypto.randomUUID();
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function addMonths(value:string,n:number){const d=new Date(value+'T00:00:00Z'); const day=d.getUTCDate(); d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
export function due(part:Part,odometer:number,now=today(),leadDays=30,leadKm=1000){
 const date=part.intervalMonths?addMonths(part.lastDate,part.intervalMonths):null;
 const days=date?Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(now+'T00:00:00Z'))/86400000):null;
 const remainingKm=part.intervalKm?part.lastKm+part.intervalKm-odometer:null;
 const overdue=(days!==null&&days<=0)||(remainingKm!==null&&remainingKm<=0);
 const soon=(days!==null&&days<=leadDays)||(remainingKm!==null&&remainingKm<=leadKm);
 return {date,days,km:remainingKm,status:overdue?'overdue':soon?'soon':'ok'} as const;
}
export function fuelStats(fills:Fill[]){
 const sorted=[...fills].sort((a,b)=>a.km-b.km||a.date.localeCompare(b.date));
 let baseline:Fill|null=null,litres=0,totalL=0,totalKm=0;const points:{date:string;value:number}[]=[];
 for(const f of sorted){if(!baseline){if(f.full)baseline=f;continue;} litres+=f.litres; if(f.full&&f.km>baseline.km){const dist=f.km-baseline.km;const value=litres*100/dist;points.push({date:f.date,value});totalL+=litres;totalKm+=dist;baseline=f;litres=0;}}
 return {average:totalKm?totalL*100/totalKm:null,totalKm,totalLitres:sorted.reduce((n,f)=>n+f.litres,0),cost:sorted.reduce((n,f)=>n+f.cost,0),points};
}
export function emptyVault():Vault{return {schema:1,folders:[],vehicles:[],parts:[],services:[],fills:[],settings:{leadDays:30,leadKm:1000}};}
export function demoVault():Vault{
 const v:Vehicle={id:'demo-car',folderId:'demo-family',make:'Peugeot',model:'308',version:'1.6 BlueHDi 120 · Allure',year:2017,energy:'DIESEL',odometer:128450,registration:'AA-123-AA (fictif)',vin:'',owner:'',registrationDate:'',notes:'Véhicule fictif pour explorer JMeca.',color:'#327b78',model3d:'hatchback-sports',specs:{tires:'À renseigner sur le flanc du pneu / notice',bulbs:'À confirmer selon les optiques',oil:'Consulter la norme de la notice constructeur',transmission:'Manuelle · à confirmer',source:'Démonstration — aucune préconisation constructeur certifiée'}};
 const ago=(months:number)=>addMonths(today(),-months);
 return {schema:1,folders:[{id:'demo-family',name:'Véhicules de la famille',clientName:'Famille de démonstration',contact:'',notes:'Dossier fictif'}],vehicles:[v],parts:[{id:'demo-oil',vehicleId:v.id,name:'Vidange & filtre à huile',category:'Moteur',reference:'',lastDate:ago(11),lastKm:114000,intervalKm:15000,intervalMonths:12,notes:'Exemple de périodicité personnalisée.',source:'Exemple, à valider avec votre notice'},{id:'demo-brake',vehicleId:v.id,name:'Contrôle des freins',category:'Freinage',reference:'',lastDate:ago(13),lastKm:110000,intervalKm:20000,intervalMonths:12,notes:'Usure variable : contrôle professionnel.',source:'Exemple de rappel de contrôle'},{id:'demo-filter',vehicleId:v.id,name:'Filtre habitacle',category:'Habitacle',reference:'',lastDate:ago(3),lastKm:124000,intervalKm:15000,intervalMonths:12,notes:'',source:'Exemple de périodicité personnalisée'}],services:[{id:'demo-service',vehicleId:v.id,partId:'demo-filter',title:'Remplacement du filtre habitacle',date:ago(3),km:124000,cost:49,garage:'Atelier de démonstration',notes:'Intervention fictive.',attachments:[]}],fills:[{id:'f1',vehicleId:v.id,date:ago(2),km:127000,litres:42,cost:73.5,full:true,station:'Station de démonstration'},{id:'f2',vehicleId:v.id,date:ago(1),km:127700,litres:38.5,cost:67.38,full:true,station:'Station de démonstration'},{id:'f3',vehicleId:v.id,date:today(),km:128450,litres:41.25,cost:72.19,full:true,station:'Station de démonstration'}],settings:{leadDays:30,leadKm:1000}};
}
export const partTemplates=[['Vidange & filtre à huile','Moteur'],['Filtre à air','Moteur'],['Filtre habitacle','Habitacle'],['Filtre à carburant','Moteur'],['Contrôle des plaquettes et disques','Freinage'],['Liquide de frein','Freinage'],['Courroie de distribution','Transmission'],['Courroie accessoires','Moteur'],['Huile de boîte / transmission','Transmission'],['Contrôle des pneus','Pneumatiques'],['Bougies d’allumage','Moteur'],['Batterie 12 V','Électricité'],['Balais d’essuie-glace','Visibilité'],['Contrôle technique','Administratif'],['Assurance','Administratif'],['Liquide de refroidissement','Moteur']];
