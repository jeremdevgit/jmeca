import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {fromB64} from './crypto';
import type {Vehicle} from './domain';
import {validateGLB} from './glb';
import {createA3Model} from './a3model';
export function mountViewer(host:HTMLElement,vehicle:Vehicle):()=>void{
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{host.innerHTML='<div class="viewer-fallback">Aperçu 3D indisponible sur cet appareil.</div>';return ()=>{};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.6;host.append(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(32,1,.01,100);camera.position.set(4,2.3,5);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enableZoom=true;controls.enablePan=false;controls.minDistance=2.7;controls.maxDistance=10;controls.maxPolarAngle=Math.PI/2.1;
 scene.add(new THREE.HemisphereLight(0xd9f5f0,0x4b5b65,3));const light=new THREE.DirectionalLight(0xffffff,5);light.position.set(2,5,4);scene.add(light);const back=new THREE.DirectionalLight(0x7db8b4,4);back.position.set(-4,1,-3);scene.add(back);
 const ground=new THREE.Mesh(new THREE.CircleGeometry(2.5,64),new THREE.MeshBasicMaterial({color:0x204642,transparent:true,opacity:.35}));ground.rotation.x=-Math.PI/2;ground.position.y=-.73;scene.add(ground);
 let disposed=false;let current:THREE.Object3D|null=null;
 const render=()=>{if(!disposed)renderer.render(scene,camera);};controls.addEventListener('change',render);
 const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render();});resize.observe(host);
 const manager=new THREE.LoadingManager();manager.setURLModifier(url=>{if(!url.startsWith('/models/')&&!url.startsWith('data:')&&!url.startsWith('blob:'))throw Error('Ressource externe bloquée.');return url;});
 const loader=new GLTFLoader(manager);
 const success=(g:{scene:THREE.Group})=>{if(disposed){disposeTree(g.scene);return;}current=g.scene;const box=new THREE.Box3().setFromObject(current);const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=(vehicle.model3d==='a3-8p'&&!vehicle.customModel?4.2:3.5)/Math.max(size.x,size.y,size.z);current.position.sub(center);const group=new THREE.Group();group.add(current);group.scale.setScalar(scale);group.rotation.y=-.35;scene.add(group);render();};
 const fail=()=>{if(!disposed){const el=document.createElement('small');el.className='viewer-error';el.textContent='Modèle 3D indisponible. Choisissez une autre silhouette.';host.append(el);}};
 if(vehicle.customModel){try{const bytes=fromB64(vehicle.customModel.data);validateGLB(bytes);loader.parse(bytes.buffer as ArrayBuffer,'',success,fail);}catch{fail();}}
 else if(vehicle.model3d==='a3-8p')success({scene:createA3Model(vehicle)});
 else {const allowed=['sedan','hatchback-sports','suv','suv-luxury','truck','van','sedan-sports','race','taxi'];const id=allowed.includes(vehicle.model3d)?vehicle.model3d:'sedan';loader.load('/models/'+id+'.glb',success,undefined,fail);}
 return ()=>{disposed=true;resize.disconnect();controls.dispose();disposeTree(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
}
function disposeTree(object:THREE.Object3D){object.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value instanceof THREE.Texture)value.dispose();m.dispose();}}});}
