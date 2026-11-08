// External-resource URLs and unreasonable decoded geometry are rejected before Three.js parses a custom model.
export function validateGLB(bytes:Uint8Array){
 if(bytes.length<20||bytes.length>10*1024*1024)throw Error('Modèle GLB trop grand ou incomplet (10 Mo maximum).');
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(d.getUint32(0,true)!==0x46546c67||d.getUint32(4,true)!==2||d.getUint32(8,true)!==bytes.length||d.getUint32(16,true)!==0x4e4f534a)throw Error('Fichier GLB 2.0 invalide.');
 const len=d.getUint32(12,true);if(len%4!==0||len+20>bytes.length)throw Error('Modèle GLB tronqué.');
 const meta=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+len)));
 if(!meta||typeof meta!=='object'||Array.isArray(meta))throw Error('Métadonnées GLB invalides.');
 for(const x of [...(meta.buffers??[]),...(meta.images??[])])if(x.uri&&!/^data:(application\/octet-stream|image\/(png|jpeg|webp));base64,/.test(x.uri))throw Error('Utilisez un GLB autonome, sans ressource externe.');
 if(meta.extensionsRequired?.some((x:string)=>!['KHR_materials_unlit','KHR_materials_clearcoat','KHR_materials_transmission','KHR_texture_transform','KHR_materials_ior','KHR_materials_specular','KHR_materials_sheen','KHR_materials_emissive_strength'].includes(x)))throw Error('Ce GLB utilise une extension non prise en charge.');
 if(meta.accessors!==undefined&&!Array.isArray(meta.accessors))throw Error('Accesseurs GLB invalides.');
 const components:Record<string,number>={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
 const bytesPerComponent:Record<number,number>={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
 let totalDecoded=0;
 for(const accessor of meta.accessors??[]){
  const count=accessor?.count,componentSize=bytesPerComponent[accessor?.componentType],width=components[accessor?.type];
  if(!Number.isSafeInteger(count)||count<0||count>1_000_000||!componentSize||!width)throw Error('Géométrie GLB invalide ou trop volumineuse.');
  if(accessor.sparse&&(!Number.isSafeInteger(accessor.sparse.count)||accessor.sparse.count<0||accessor.sparse.count>count))throw Error('Géométrie GLB invalide ou trop volumineuse.');
  const decoded=count*componentSize*width;
  totalDecoded+=decoded;
  if(decoded>32*1024*1024||totalDecoded>48*1024*1024)throw Error('Géométrie GLB trop volumineuse (48 Mo maximum).');
 }
}
