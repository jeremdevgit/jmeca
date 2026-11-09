import * as THREE from 'three';
import type {Vehicle} from './domain';

// Original, stylized 8P-generation compact. It is an interface illustration,
// not an Audi CAD file or an exact parts/fitment reference.
export function createA3Model(vehicle:Vehicle):THREE.Group{
 const appearance=vehicle.appearance??{body:'sportback',grille:'standard',mirrors:'standard'};
 const group=new THREE.Group();
 const paint=new THREE.MeshPhysicalMaterial({color:vehicle.color,metalness:.42,roughness:.25,clearcoat:1,clearcoatRoughness:.13});
 const glass=new THREE.MeshPhysicalMaterial({color:0x142b36,metalness:.12,roughness:.16,transparent:true,opacity:.87,side:THREE.DoubleSide});
 const black=new THREE.MeshStandardMaterial({color:0x11171a,roughness:.7});
 const rubber=new THREE.MeshStandardMaterial({color:0x151719,roughness:.95});
 const chrome=new THREE.MeshStandardMaterial({color:0xaeb9bd,metalness:.85,roughness:.22});
 const light=new THREE.MeshStandardMaterial({color:0xe7eef0,emissive:0xb9d1d5,emissiveIntensity:.25,roughness:.18});
 const red=new THREE.MeshStandardMaterial({color:0x9d1822,emissive:0x510a12,emissiveIntensity:.35});
 const line=new THREE.LineBasicMaterial({color:0x243840,transparent:true,opacity:.55});
 const add=(geo:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const panel=(points:number[][],mat:THREE.Material)=>{const shape=new THREE.BufferGeometry();const a:number[]=[];for(let i=1;i<points.length-1;i++)for(const p of [points[0],points[i],points[i+1]])a.push(...p);shape.setAttribute('position',new THREE.Float32BufferAttribute(a,3));shape.computeVertexNormals();return add(shape,mat);};
 const stroke=(points:number[][])=>{const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],p[2])));group.add(new THREE.Line(g,line));};
 const body=appearance.body==='cabriolet'?'cabriolet':appearance.body==='three-door'?'three-door':'sportback';
 const rear=body==='sportback'?-2.18:-1.92;
 // Beveled body, bonnet, wheel arches and the characteristic sloping hatch.
 const lower=new THREE.Shape();lower.moveTo(rear,.02);lower.lineTo(rear,.55);lower.quadraticCurveTo(rear+.03,.72,rear+.26,.77);lower.lineTo(1.25,.77);lower.lineTo(1.96,.65);lower.quadraticCurveTo(2.18,.6,2.18,.41);lower.lineTo(2.18,.06);lower.lineTo(1.68,.02);lower.absarc(1.25,.02,.43,0,Math.PI,false);lower.lineTo(-.8,.02);lower.absarc(-1.23,.02,.43,0,Math.PI,false);lower.lineTo(rear,.02);
 const chassis=new THREE.ExtrudeGeometry(lower,{depth:1.55,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.055,bevelThickness:.055,curveSegments:20});chassis.translate(0,-.04,-.775);add(chassis,paint);
 box(.03,-.07,0,3.4,.12,1.55,black);
 // Bonnet, bumper details, lower air intake and side skirts.
 panel([[.75,.79,-.72],[1.89,.66,-.69],[1.89,.66,.69],[.75,.79,.72]],paint);
 box(2.17,.31,0,.035,.18,1.23,black);box(2.18,.1,0,.045,.055,1.32,black);
 for(const z of [-.845,.845]){box(0,.06,z,2.8,.065,.035,black);stroke([[rear+.15,.35,z],[1.95,.35,z]]);}
 // Roof and side glass: a steeper three-door hatch or longer Sportback roof.
 const a=body==='sportback'?-1.55:-1.28;
 const roofRear=body==='cabriolet'?-1.28:a;
 const roofTop=body==='cabriolet'?1.08:1.35;
 const roofMat=body==='cabriolet'?new THREE.MeshStandardMaterial({color:0x252a2a,roughness:.95}):paint;
 panel([[roofRear,.77,-.72],[a+.28,roofTop,-.62],[.45,roofTop,-.62],[.98,.79,-.72]],roofMat);
 panel([[roofRear,.77,.72],[.98,.79,.72],[.45,roofTop,.62],[a+.28,roofTop,.62]],roofMat);
 panel([[a+.28,roofTop,-.62],[a+.28,roofTop,.62],[.45,roofTop,.62],[.45,roofTop,-.62]],roofMat);
 panel([[.45,roofTop,-.62],[.45,roofTop,.62],[.98,.79,.72],[.98,.79,-.72]],glass);
 if(body!=='cabriolet')panel([[roofRear,.77,-.72],[roofRear,.77,.72],[a+.28,roofTop,.62],[a+.28,roofTop,-.62]],glass);
 for(const side of [-1,1]){
  const z=side*.835,top=side*.635;
  panel([[a+.07,.81,z],[a+.31,roofTop-.045,top],[.39,roofTop-.045,top],[.88,.82,z]],glass);
  if(body==='sportback')stroke([[-.41,.79,z],[-.4,roofTop-.02,top]]);
  else stroke([[.05,.79,z],[.07,roofTop-.02,top]]);
  stroke([[a+.05,.81,z],[.88,.81,z]]);
  stroke([[.87,.78,z],[.83,.12,z]]);
  if(body==='sportback')stroke([[-.48,.78,z],[-.48,.12,z]]);
  box(body==='sportback'?.12:-.12,.56,side*.858,.21,.045,.035,chrome);
  if(body==='sportback')box(-.91,.56,side*.858,.19,.045,.035,chrome);
  stroke([[rear+.12,.72,side*.78],[.94,.72,side*.78]]);
  stroke([[rear+.3,.12,side*.855],[.8,.12,side*.855]]);
  for(const x of [-1.23,1.25]){
   const arch:number[][]=[];for(let i=0;i<=14;i++){const angle=Math.PI*i/14;arch.push([x+.425*Math.cos(angle),.02+.425*Math.sin(angle),side*.862]);}stroke(arch);
  }
  // Mirror stalk and selectable body-color or brushed S line-style cap.
  const mirrorCap=appearance.mirrors==='s-line'?chrome:paint;
  box(.74,.83,side*.86,.25,.08,.18,black);
  const mirror=add(new THREE.SphereGeometry(.17,12,8),mirrorCap,.77,.86,side*.98);mirror.scale.set(1.1,.65,.85);
  box(.71,.81,side*1.11,.14,.075,.008,black);
  // Five spoke wheels, tires, hub and visible brake disc.
  for(const x of [-1.23,1.25]){
   const wheel=add(new THREE.CylinderGeometry(.38,.38,.17,32),rubber,x,.01,side*.79);wheel.rotation.x=Math.PI/2;
   const disc=add(new THREE.CylinderGeometry(.285,.285,.011,32),chrome,x,.01,side*.888);disc.rotation.x=Math.PI/2;
   const inner=add(new THREE.CylinderGeometry(.22,.22,.014,32),black,x,.01,side*.9);inner.rotation.x=Math.PI/2;
   for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;const spoke=box(x+Math.sin(angle)*.13,.01+Math.cos(angle)*.13,side*.912,.045,.25,.018,chrome);spoke.rotation.z=-angle;}
   const hub=add(new THREE.CylinderGeometry(.07,.07,.021,16),chrome,x,.01,side*.927);hub.rotation.x=Math.PI/2;
  }
 }
 // Front single-frame grille; the optional honeycomb has individually modeled cells.
 box(2.205,.49,0,.035,.37,.71,chrome);box(2.227,.49,0,.015,.32,.66,black);
 if(appearance.grille==='honeycomb'){
  const hex=new THREE.CylinderGeometry(.049,.049,.008,6);
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){
   const z=-.285+col*.095+(row%2)*.047;
   if(z>.31)continue;
   const cell=add(hex,chrome,2.242,.37+row*.075,z);cell.rotation.z=Math.PI/2;
   const core=add(new THREE.CylinderGeometry(.033,.033,.01,6),black,2.249,.37+row*.075,z);core.rotation.z=Math.PI/2;
  }
 }else for(const y of [.4,.47,.54,.61])box(2.246,y,0,.012,.012,.63,chrome);
 for(let i=0;i<4;i++){const ring=add(new THREE.TorusGeometry(.044,.008,5,14),chrome,2.266,.58,(i-1.5)*.071);ring.rotation.y=Math.PI/2;}
 box(2.244,.28,0,.015,.075,.33,new THREE.MeshStandardMaterial({color:0xe0e4df,roughness:.5}));
 for(const side of [-1,1]){
  const z=side*.59;
  const head=box(2.14,.66,z,.065,.115,.27,light);head.rotation.y=side*.12;
  box(2.155,.6,side*.57,.07,.015,.18,chrome);
  box(rear-.025,.55,side*.59,.05,.17,.32,red);
  box(2.19,.24,side*.55,.035,.09,.27,black);
  const fog=add(new THREE.SphereGeometry(.055,12,8),light,2.219,.24,side*.55);fog.scale.x=.3;
  box(1.55,.52,side*.82,.08,.025,.025,light);
  box(rear-.04,.24,side*.48,.04,.09,.23,black);
 }
 box(rear-.02,.28,0,.06,.07,.45,chrome);
 for(let i=0;i<4;i++){const ring=add(new THREE.TorusGeometry(.035,.006,5,12),chrome,rear-.09,.61,(i-1.5)*.057);ring.rotation.y=Math.PI/2;}
 return group;
}
