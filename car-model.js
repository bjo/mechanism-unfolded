/* One assembly for every chapter and camera; no disconnected inspection copy. */
window.createCarModel=function(T,options){
 'use strict';
 options=options||{};
 const M=CarMechanics,S=M.spec,root=new T.Group(),pickable=[],partMeshes=new Map();
 const colors={piston:0xaab6b8,rod:0xc79b58,crank:0x516a78,flywheel:0x4b6571,block:0xb8c7bd,intake:0x248e96,exhaust:0xb56b48,cam:0x728391,bucket:0xd3b47b,spring:0x415e65,belt:0x334b4c,spark:0xf2eee0};
 const basic=c=>new T.MeshStandardMaterial({color:c,metalness:.48,roughness:.38,side:T.DoubleSide});
 function group(parent=root,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
 function mesh(geo,parent,key,color=colors[key]){const m=new T.Mesh(geo,basic(color));parent.add(m);m.userData.part=key;if(key){pickable.push(m);if(!partMeshes.has(key))partMeshes.set(key,[]);partMeshes.get(key).push(m);}return m;}
 function cylinder(r,h,parent,key,x=0,y=0,z=0,axis='y'){const m=mesh(new T.CylinderGeometry(r,r,h,48),parent,key);m.position.set(x,y,z);if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 function box(w,h,d,parent,key,x=0,y=0,z=0){const m=mesh(new T.BoxGeometry(w,h,d),parent,key);m.position.set(x,y,z);return m;}
 function annulus(ro,ri,h,parent,key,x=0,y=0,z=0,axis='z',start=0,sweep=M.TAU){const sh=new T.Shape();sh.absarc(0,0,ro,start,start+sweep,false);sh.lineTo(ri*Math.cos(start+sweep),ri*Math.sin(start+sweep));sh.absarc(0,0,ri,start+sweep,start,true);sh.closePath();const m=mesh(new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:64}),parent,key);m.position.set(x,y,z-h/2);if(axis==='y'){m.rotation.x=-Math.PI/2;m.position.set(x,y-h/2,z);}return m;}
 const lower=group(),head=group(),timing=group(),gasGroup=group();
 const crank=group(lower),rod=group(lower),piston=group(lower),journals=[];
 // Main journals stop at the cheeks. There is no impossible straight shaft
 // through the connecting rod's sweeping big end.
 for(const z of [-.65,.65]){
  journals.push(cylinder(.16,.72,crank,'crank',0,0,z,'z'));
  if(options.bankIndex!==undefined&&z<0&&options.bankIndex!==3)continue;
  const supportZ=options.bankIndex===undefined?z:Math.sign(z)*.95;
  annulus(.29,.175,.20,lower,'block',0,0,supportZ);
  box(.62,.33,.27,lower,'block',0,-.355,supportZ);
  box(.13,2.24,.13,lower,'block',-.87,.52,supportZ);
  box(.13,2.24,.13,lower,'block',.87,.52,supportZ);
  box(2,.13,.15,lower,'block',0,-.57,supportZ);
 }
 for(const x of [-.83,.83])box(.13,.12,1.96,lower,'block',x,1.60,0);
 for(const z of [-.30,.30]){
  box(.40,S.crankRadius+.3,.17,crank,'crank',0,S.crankRadius/2,z);
  cylinder(.35,.17,crank,'crank',0,-.22,z,'z');
 }
 const crankPin=cylinder(.155,.61,crank,'crank',0,S.crankRadius,0,'z');
 cylinder(.16,.56,crank,'crank',0,0,-1.14,'z');
 const flywheel=group(crank,0,0,-1.18);annulus(1.05,.73,.14,flywheel,'flywheel');cylinder(.23,.16,flywheel,'flywheel',0,0,0,'z');
 for(let i=0;i<6;i++){const arm=group(flywheel);arm.rotation.z=i*M.TAU/6;box(.10,.65,.10,arm,'flywheel',0,.49);}
 const crankMark=cylinder(.045,.03,crank,'crank',0,-.36,.405,'z');crankMark.material.color.set(0xf2df91);
 annulus(.23,.162,.20,rod,'rod');annulus(.18,.122,.18,rod,'rod',0,S.rodLength);
 box(.16,S.rodLength-.39,.12,rod,'rod',0,(S.rodLength+.07)/2);
 const rodBottom=group(rod),rodTop=group(rod,0,S.rodLength);
 cylinder(S.pistonRadius,.10,piston,'piston',0,.36);
 const skirt=mesh(new T.CylinderGeometry(S.pistonRadius,S.pistonRadius,.55,64,1,true,Math.PI/2,Math.PI),piston,'piston');skirt.position.y=.035;
 for(const y of [.17,.25,.32]){const ring=mesh(new T.TorusGeometry(.75,.008,8,64),piston,'piston');ring.rotation.x=Math.PI/2;ring.position.y=y;ring.material.color.set(0x586666);}
 for(const z of [-.52,.52])annulus(.19,.123,.19,piston,'piston',0,0,z);
 const pistonPin=cylinder(.117,1.28,piston,'piston',0,0,0,'z');
 // Genuine geometric section, not an exploded gap or depth-test trick.
 const liner=mesh(new T.CylinderGeometry(S.bore,S.bore,2.65,72,1,true,Math.PI/2,Math.PI),lower,'block');liner.position.y=2.89;
 const shell=mesh(new T.CylinderGeometry(.84,.84,2.65,72,1,true,Math.PI/2,Math.PI),lower,'block');shell.position.y=2.89;
 for(const y of [1.565,4.215])annulus(.84,S.bore,.055,lower,'block',0,y,0,'y',0,Math.PI);
 for(const x of [-.8,.8])box(.065,2.65,.065,lower,'block',x,2.89,0);
 const cams=[],valveSets=[];
 function coilGeometry(){const points=[],segments=100;for(let i=0;i<=segments;i++){const u=i/segments,a=u*M.TAU*5;points.push(new T.Vector3(.11*Math.cos(a),.28+.54*u,.11*Math.sin(a)));}return new T.TubeGeometry(new T.CatmullRomCurve3(points),150,.012,6,false);}
 function updateCoil(m,lift){const attr=m.geometry.attributes.position,normal=m.geometry.attributes.normal,N=150,R=6;for(let i=0;i<=N;i++){const u=i/N,a=u*M.TAU*5,h=.54-lift;for(let j=0;j<=R;j++){const b=j/R*M.TAU,idx=i*(R+1)+j;const radial=.11+.012*Math.cos(b);attr.setXYZ(idx,radial*Math.cos(a),.28+h*u+.012*Math.sin(b),radial*Math.sin(a));normal.setXYZ(idx,Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b));}}attr.needsUpdate=normal.needsUpdate=true;m.geometry.computeBoundingSphere();}
 M.valves.forEach(v=>{
  const cam=group(timing,...v.center),camshaft=cylinder(.08,2.30,cam,'cam',0,0,.34,'z');
  const sh=new T.Shape();M.camProfile.forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y));sh.closePath();
  const lobes=[];for(const z of [-.32,.32]){const l=mesh(new T.ExtrudeGeometry(sh,{depth:S.camWidth,bevelEnabled:false}),cam,'cam');l.position.z=z-S.camWidth/2;const attr=l.geometry.attributes.position,seen=new Set();l.userData.auditVertices=[];for(let j=0;j<attr.count;j++){const key=[attr.getX(j),attr.getY(j),attr.getZ(j)].map(n=>n.toFixed(7)).join(',');if(!seen.has(key)){seen.add(key);l.userData.auditVertices.push(j);}}lobes.push(l);const dot=cylinder(.025,.014,cam,'cam',S.camBase+.025,0,z+S.camWidth/2+.01,'z');dot.material.color.set(colors[v.id]);}
  cams.push({group:cam,lobes,v,shaft:camshaft});
  for(const z of [-.82,.83]){
   annulus(.15,.083,.13,timing,'block',v.center[0],v.center[1],z);
   box(.13,v.center[1]-4.18,.13,timing,'block',v.side*1.16,(v.center[1]+4.18)/2,z);
   box(Math.abs(v.side*1.16-v.center[0])+.15,.12,.13,timing,'block',(v.side*1.16+v.center[0])/2,v.center[1],z);
   box(2.45,.10,.17,head,'block',0,4.18,z);
  }
  const parts=[];
  for(const z of [-.32,.32]){
   const frame=group(head,...v.seat,z);frame.rotation.z=-v.side*S.valveTilt;
   const body=group(frame),stem=cylinder(.032,1.10,body,v.id,0,.525);
   cylinder(S.valveRadius,.04,body,v.id,0,-.02);
   // The bucket is hollow below its top so it surrounds the stem/retainer.
   annulus(S.bucketRadius,.125,.15,body,'bucket',0,1.0,0,'y');
   const bucketFace=cylinder(S.bucketRadius,.025,body,'bucket',0,1.0875);
   const retainer=cylinder(.11,.035,body,'spring',0,.82);
   annulus(.21,.16,.04,frame,'block',0,.02,0,'y');
   annulus(.06,.034,.40,frame,'block',0,.48,0,'y');
   annulus(.145,.06,.035,frame,'spring',0,.2625,0,'y');
   const coil=mesh(coilGeometry(),frame,'spring');
   // Fixed bridge webs connect the spring seats to the remaining head wall.
   const supportX=v.seat[0]+v.n[0]*.25,supportY=v.seat[1]+v.n[1]*.25;
   box(.12,.16,.56,head,'block',supportX,supportY,z<0?-.59:.59);
   box(.12,supportY-4.18+.10,.12,head,'block',supportX,(supportY+4.18)/2,z<0?-.83:.83);
   box(.12,.07,.56,head,'block',v.seat[0],v.seat[1]+.01,z<0?-.59:.59);
   parts.push({frame,body,stem,coil,z,bucketFace,retainer});
  }
  valveSets.push(parts);
 });
 const plug=group(head,0,4.45,0);cylinder(.085,.34,plug,'spark',0,.20);cylinder(.10,.17,plug,'spark',0,-.02);cylinder(.019,.16,plug,'spark',0,-.15);box(.025,.11,.03,plug,'spark',.065,-.18);box(.07,.025,.03,plug,'spark',.03,-.228);
 const spark=mesh(new T.SphereGeometry(.075,12,8),gasGroup,null,0xffdf89);spark.position.set(0,4.22,0);spark.material.emissive.set(0xffaa22);spark.material.emissiveIntensity=2;
 const gas=mesh(new T.CylinderGeometry(.70,.70,1,48),gasGroup,null,0x3eafab);gas.material.transparent=true;gas.material.opacity=.16;gas.material.depthWrite=false;
 const forceArrow=new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(),1,0xc27e38,.16,.08);gasGroup.add(forceArrow);forceArrow.userData.annotation=true;
 const flow=[];
 for(const v of M.valves)for(const z of [-.32,.32]){
  const path=new T.CatmullRomCurve3([new T.Vector3(v.side*1.65,4.53,z),new T.Vector3(v.side*.85,4.52,z),new T.Vector3(v.seat[0]+v.n[0]*.10,v.seat[1]+v.n[1]*.10,z),new T.Vector3(v.seat[0]-v.n[0]*.17,v.seat[1]-v.n[1]*.17,z)]);
  const port=mesh(new T.TubeGeometry(path,32,.14,12,false),head,v.id);port.material.transparent=true;port.material.opacity=.17;port.material.depthWrite=false;
  for(let i=0;i<9;i++){const bead=mesh(new T.SphereGeometry(.025,8,6),gasGroup,null,colors[v.id]);flow.push({bead,path,v,index:i});}
 }
 const pulleys=[];
 M.belt.circles.forEach((c,i)=>{
  const g=group(timing,...c.p,S.beltZ),sh=new T.Shape();
  for(let j=0;j<c.n;j++)for(const [offset,dr] of [[-.5,-.027],[-.26,-.027],[-.20,.012],[.20,.012],[.26,-.027],[.5,-.027]]){const a=(j+offset)*M.TAU/c.n,r=c.r+dr,x=r*Math.cos(a),y=r*Math.sin(a);if(j===0&&offset===-.5)sh.moveTo(x,y);else sh.lineTo(x,y);}
  sh.closePath();const hole=new T.Path();hole.absarc(0,0,c.r*.60,0,M.TAU,true);sh.holes.push(hole);
  const teeth=mesh(new T.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false}),g,'belt');teeth.position.z=-.06;
  for(let k=0;k<4;k++){const a=group(g);a.rotation.z=k*Math.PI/2;box(.055,c.r*.77,.09,a,'belt',0,c.r*.40);}
  cylinder(.105,.20,g,'belt',0,0,0,'z');cylinder(.027,.015,g,'belt',0,c.r*.78,.08,'z').material.color.set(0xe1bd75);
  if(i===0)cylinder(.12,.88,crank,'crank',0,0,1.08,'z');
  pulleys.push(g);
 });
 const beltGroup=group(timing),beltTeeth=[];
 // Backing ribbon lies outside the pitch line; discrete inner teeth travel
 // on that same closed path. Integer belt pitch avoids a discontinuous seam.
 const ribbon=new T.BufferGeometry(),positions=[],indices=[];
 for(let i=0;i<=900;i++){const q=M.belt.at(i/900*M.belt.length);for(const offset of [.014,.045])for(const z of [S.beltZ-.065,S.beltZ+.065])positions.push(q.x+q.nx*offset,q.y+q.ny*offset,z);if(i<900){const n=i*4;for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]])indices.push(n+a,n+b,n+4+b,n+a,n+4+b,n+4+a);}}
 ribbon.setAttribute('position',new T.Float32BufferAttribute(positions,3));ribbon.setIndex(indices);ribbon.computeVertexNormals();mesh(ribbon,beltGroup,'belt');
 const toothGeo=new T.BoxGeometry(M.belt.pitch*.38,.04,.13);
 for(let i=0;i<M.belt.teeth;i++){const m=mesh(toothGeo,beltGroup,'belt');beltTeeth.push(m);}
 let latest=M.pose(90),chapter=0,selected='',showBelt=!options.noBelt,operating=null;
 flywheel.visible=!options.noFlywheel;
 function setChapter(n){chapter=n;head.visible=gasGroup.visible=n>=1;timing.visible=n>=2;}
 function select(key){selected=key;for(const [id,meshes] of partMeshes)for(const m of meshes){m.material.emissive.set(id===key?0x53b9ac:0);m.material.emissiveIntensity=id===key?.55:0;}}
 function update(degrees){
  latest=M.pose(degrees);crank.rotation.z=-latest.theta;rod.position.set(...latest.pin,0);rod.rotation.z=latest.rodAngle;piston.position.y=latest.pistonY;
  cams.forEach((c,i)=>{c.group.rotation.z=latest.valves[i].angle;valveSets[i].forEach(v=>{v.body.position.y=-latest.valves[i].lift;updateCoil(v.coil,latest.valves[i].lift);});});
  pulleys.forEach((g,i)=>{g.rotation.z=M.belt.circles[i].phase-latest.theta/(i===0?1:2);g.visible=showBelt;});beltGroup.visible=showBelt;
  beltTeeth.forEach((m,i)=>{const p=M.belt.at(i*M.belt.pitch-M.belt.radius*latest.theta);m.position.set(p.x-.002*p.nx,p.y-.002*p.ny,S.beltZ);m.rotation.z=Math.atan2(p.ny,p.nx)-Math.PI/2;});
  const top=latest.pistonY+S.pistonTop,height=4.24-top;gas.position.y=top+height/2;gas.scale.y=height;gas.material.color.set([0x419fa3,0xbda05e,0xe47e41,0x96857a][latest.stroke]);spark.visible=latest.spark;
  if(operating){const op=M.operation(degrees,operating.pedal,operating.advance,operating.ignition);spark.visible=op.spark;gas.material.opacity=.07+.18*op.charge;if(latest.stroke===2&&!op.burned)gas.material.color.set(0x9da6a1);}
  if(typeof CarMetrics!=='undefined'){const mp=CarMetrics.sample(degrees,operating||{}),len=Math.min(1.3,Math.abs(mp.force)/14000),positive=mp.force>=0;forceArrow.visible=chapter>=1&&len>.03;forceArrow.position.set(.30,top+(positive?len:.05),.55);forceArrow.setDirection(new T.Vector3(0,positive?-1:1,0));forceArrow.setLength(Math.max(.03,len),Math.min(.16,len*.4),.08);forceArrow.setColor(latest.stroke===2?0xc47b35:0x688991);for(const key of ['piston','rod','crank'])for(const m of partMeshes.get(key)||[]){const hot=latest.stroke===2&&(!operating||operating.ignition);m.material.emissive.set(key===selected?0x53b9ac:hot?0xb96a23:0);m.material.emissiveIntensity=key===selected?.55:hot?.23:0;}}
  flow.forEach(({bead,path,v,index})=>{const isIntake=v.id==='intake';bead.visible=isIntake?latest.stroke===0&&latest.valves[0].lift>.002:latest.stroke===3&&latest.valves[1].lift>.002;const u=M.mod(latest.degrees/85+index/9,1);bead.position.copy(path.getPoint(isIntake?u:1-u));});
 }
 function world(o,p){return root.worldToLocal(o.localToWorld(new T.Vector3(...p)));}
 function audit(){
  root.updateWorldMatrix(true,true);const a=world(rodBottom,[0,0,0]),b=world(rodTop,[0,0,0]),cp=world(crankPin,[0,0,0]),pp=world(pistonPin,[0,0,0]);
  const contacts=cams.flatMap((c,i)=>valveSets[i].map((v,j)=>{
   const lobe=c.lobes[j],attr=lobe.geometry.attributes.position;
   const local=lobe.userData.auditVertices.map(k=>world(lobe,[attr.getX(k),attr.getY(k),attr.getZ(k)]));const n=new T.Vector3(...c.v.n,0),face=world(v.bucketFace,[0,v.bucketFace.geometry.parameters.height/2,0]);
   const gaps=local.map(p=>p.clone().sub(face).dot(n)),gap=Math.min(...gaps),point=local[gaps.indexOf(gap)],delta=point.clone().sub(face),tangent=delta.addScaledVector(n,-delta.dot(n)).length();
   const headLow=world(v.body,[0,-.04,0]).y-S.valveRadius*Math.sin(S.valveTilt),pistonTop=world(piston,[0,S.pistonTop,0]).y;
   const stemTop=world(v.stem,[0,v.stem.geometry.parameters.height/2,0]),stemBottom=world(v.stem,[0,-v.stem.geometry.parameters.height/2,0]);
   const coilAttr=v.coil.geometry.attributes.position,coilCenter=k=>{const p=new T.Vector3();for(let j=0;j<6;j++)p.add(world(v.coil,[coilAttr.getX(k+j),coilAttr.getY(k+j),coilAttr.getZ(k+j)]));return p.multiplyScalar(1/6);};
   return {id:c.v.id,z:v.z,gap,tangent,bucketRadius:v.bucketFace.geometry.parameters.radiusTop,valveLength:stemTop.distanceTo(stemBottom),stemBucketGap:stemTop.distanceTo(world(v.bucketFace,[0,-v.bucketFace.geometry.parameters.height/2,0])),springBottomGap:coilCenter(0).sub(world(v.frame,[0,.28,0])).dot(n),springTopGap:coilCenter(150*7).sub(world(v.retainer,[0,0,0])).dot(n),pistonClearance:headLow-pistonTop,guideOffset:world(v.body,[0,.5,0]).clone().sub(world(v.frame,[0,.5-latest.valves[i].lift,0])).length(),lift:latest.valves[i].lift};
  }));
  const pitchContacts=[];
  beltTeeth.forEach((t,i)=>{const q=M.belt.at(i*M.belt.pitch-M.belt.radius*latest.theta);if(q.circle<0)return;const c=M.belt.circles[q.circle],p=world(t,[0,.002,0]),g=pulleys[q.circle];const a=Math.atan2(p.y-c.p[1],p.x-c.p[0]);pitchContacts.push({radialError:Math.hypot(p.x-c.p[0],p.y-c.p[1])-c.r,phaseError:Math.abs(M.mod((a-g.rotation.z)*c.n/M.TAU,1)-.5),planeError:p.z-S.beltZ});});
  const shaftEnds=m=>[-1,1].map(sign=>world(m,[0,sign*m.geometry.parameters.height/2,0]).toArray());
  return {forceAnnotation:{visible:forceArrow.visible,origin:forceArrow.position.toArray(),pistonTop:latest.pistonY+S.pistonTop,direction:new T.Vector3(0,1,0).applyQuaternion(forceArrow.quaternion).toArray(),length:forceArrow.line.scale.y+forceArrow.cone.scale.y},degrees:latest.degrees,chapter,mainJournals:journals.map(shaftEnds),camShafts:cams.map(c=>shaftEnds(c.shaft)),rodLength:a.distanceTo(b),bigEndGap:a.distanceTo(cp),smallEndGap:b.distanceTo(pp),pistonAxis:pp.x,rodScale:rod.scale.toArray(),pistonScale:piston.scale.toArray(),crankScale:crank.scale.toArray(),camAngles:cams.map(c=>c.group.rotation.z),contacts,pitchContacts,beltSeamError:M.belt.length-M.belt.pitch*M.belt.teeth};
 }
 update(90);setChapter(0);
 return {root,pickable,update,setChapter,select,audit,setOperating(v){operating=v;},setBelt(v){showBelt=v&&!options.noBelt;},get selected(){return selected;}};
};
