import {vaultSchema,type Vault} from './domain';
export const ITERATIONS=600000;
const AAD=new TextEncoder().encode('JMeca|vault|v1|AES-256-GCM|PBKDF2-SHA256|600000');
export interface Envelope {format:'jmeca-v1';cipher:'AES-256-GCM';iterations:600000;salt:string;iv:string;data:string;}
export const toB64=(bytes:Uint8Array)=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
export const fromB64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export function parseEnvelope(text:string):Envelope{
 if(text.length>96*1024*1024)throw Error('Coffre trop volumineux.');
 const e=JSON.parse(text);
 if(!e||e.format!=='jmeca-v1'||e.cipher!=='AES-256-GCM'||e.iterations!==ITERATIONS||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof e.data!=='string')throw Error('Format de sauvegarde non reconnu.');
 if(fromB64(e.salt).length!==16||fromB64(e.iv).length!==12||e.data.length<24||!/^[A-Za-z0-9+/]*={0,2}$/.test(e.data))throw Error('Coffre invalide.');
 return e;
}
export async function deriveKey(password:string,salt:Uint8Array):Promise<CryptoKey>{
 const bytes=new TextEncoder().encode(password);
 try {const material=await crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveKey']);return await crypto.subtle.deriveKey({name:'PBKDF2',salt:salt as BufferSource,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}finally{bytes.fill(0);}
}
export async function encryptVault(vault:Vault,key:CryptoKey,salt:Uint8Array):Promise<string>{
 const plain=new TextEncoder().encode(JSON.stringify(vaultSchema.parse(vault)));const iv=crypto.getRandomValues(new Uint8Array(12));
 try {const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:AAD},key,plain);return JSON.stringify({format:'jmeca-v1',cipher:'AES-256-GCM',iterations:ITERATIONS,salt:toB64(salt),iv:toB64(iv),data:toB64(new Uint8Array(data))});}finally{plain.fill(0);}
}
export async function decryptVault(text:string,password:string){
 const e=parseEnvelope(text);const salt=fromB64(e.salt);const key=await deriveKey(password,salt);let plain:ArrayBuffer;
 try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(e.iv) as BufferSource,additionalData:AAD},key,fromB64(e.data) as BufferSource);}catch{throw Error('Mot de passe incorrect ou coffre endommagé.');}
 try{return {vault:vaultSchema.parse(JSON.parse(new TextDecoder().decode(plain))),key,salt};}finally{new Uint8Array(plain).fill(0);}
}
