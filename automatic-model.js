/* One assembly, camera-only inspection. Transparent fluids are annotations;
   shafts, plates, gears and carrier pins remain rigid and opaque. */
window.createAutomaticModel=function(T){
 const A=AutoMechanics,S=A.spec,root=new T.Group(),pickable=[],items=[],sets=[],packs={},groups={},colors={input:0xbd9154,sun:0x7793b5,front:0xbf9655,output:0x398c88,rearCarrier:0xa28872,planet:0xbac4bd,C1:0xbb955b,C2:0x8298b5,B2:0x849795,B3:0x9b7e69,F1:0x778ba4,F2:0x9b7e69,pump:0xb48c55,turbine:0x438f90,stator:0x8195b1,lock:0xbb9b65,case:0x657675};
 const mat=k=>new T.MeshStandardMaterial({color:colors[k]||0xaebdb5,metalness:.5,roughness:.4,side:T.DoubleSide});
 function group(p=root,z=0){const g=new T.Group();g.position.z=z;p.add(g);return g;}
 function mesh(geo,p,k){const m=new T.Mesh(geo,mat(k));p.add(m);m.userData.part=k;items.push(m);if(k)pickable.push(m);return m;}
 function ring(p,k,ri,ro,z,depth=.09){const s=new T.Shape();s.absarc(0,0,ro,0,A.tau);const h=new T.Path();h.absarc(0,0,ri,0,A.tau,true);s.holes.push(h);const m=mesh(new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:64}),p,k);m.position.z=z-depth/2;return m;}
 function shaft(p,k,r,z1,z2){const m=mesh(new T.CylinderGeometry(r,r,z2-z1,32),p,k);m.rotation.x=Math.PI/2;m.position.z=(z1+z2)/2;return m;}
 function rod(p,k,a,b,r=.045){const va=new T.Vector3(...a),vb=new T.Vector3(...b),m=mesh(new T.CylinderGeometry(r,r,va.distanceTo(vb),12),p,k);m.position.copy(va).add(vb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return m;}
 function spokes(p,k,ri,ro,z,n=3,offset=0){for(let i=0;i<n;i++){const a=i*A.tau/n+offset;rod(p,k,[ri*Math.cos(a),ri*Math.sin(a),z],[ro*Math.cos(a),ro*Math.sin(a),z]);}}
 function tooth(p,k,n,z,internal=false){const shape=new T.Shape(),pts=internal?A.internalOutline(n):CarDrive.gearOutline(n,S.module);if(internal){shape.absarc(0,0,n*S.module/2+.17,0,A.tau);const hole=new T.Path();pts.forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();shape.holes.push(hole);}else{pts.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const h=new T.Path();h.absarc(0,0,k==='sun'?.30:.075,0,A.tau,true);shape.holes.push(h);}const g=group(p,z),m=mesh(new T.ExtrudeGeometry(shape,{depth:S.face,bevelEnabled:false,curveSegments:40}),g,k);m.position.z=-S.face/2;return g;}
 for(const k of ['input','sun','front','output','rearCarrier'])groups[k]=group();
 const inputShaft=shaft(groups.input,'input',.16,-4.62,-1.8);
 const sunShaft=ring(groups.sun,'sun',.185,.30,.1,4.25);
 // Forward clutch inner drum is permanently attached to the front ring.
 for(let i=0;i<3;i++){const a=i*A.tau/3;rod(groups.front,'front',[1.82*Math.cos(a),1.82*Math.sin(a),-1.68],[1.82*Math.cos(a),1.82*Math.sin(a),-.16],.045);}ring(groups.front,'front',1.69,1.86,-.16,.08);
 ring(groups.output,'output',2.32,2.41,.36,.09);for(let i=0;i<3;i++){const a=i*A.tau/3;rod(groups.output,'output',[2.37*Math.cos(a),2.37*Math.sin(a),.36],[2.37*Math.cos(a),2.37*Math.sin(a),2.49],.045);}spokes(groups.output,'output',1.3,2.37,.36);spokes(groups.output,'output',2.04,2.37,2.49);ring(groups.output,'output',2.03,2.41,2.35,.09);
 ring(groups.output,'output',2.30,2.41,4.6,.10);spokes(groups.output,'output',.20,2.37,4.6);const outputShaft=shaft(groups.output,'output',.20,4.6,6.1);spokes(groups.output,'output',.20,.53,4.6);for(let i=0;i<3;i++){const a=i*A.tau/3;rod(groups.output,'output',[2.37*Math.cos(a),2.37*Math.sin(a),2.49],[2.37*Math.cos(a),2.37*Math.sin(a),4.6]);}
 ring(groups.rearCarrier,'rearCarrier',.32,.43,3.2,1.25);
 for(const [n,z,carrierKey,ringKey] of [[S.front,0,'output','front'],[S.rear,2.25,'rearCarrier','output']]){
  const sun=tooth(groups.sun,'sun',S.sun,z),r=tooth(groups[ringKey],ringKey,n,z,true),c=groups[carrierKey],planet=[];
  ring(c,carrierKey,.32,.45,z+.36,.12);const orbit=(S.sun+(n-S.sun)/2)*S.module/2;
  for(let i=0;i<3;i++){const a=i*A.tau/3,x=orbit*Math.cos(a),y=orbit*Math.sin(a);rod(c,carrierKey,[.40*Math.cos(a),.40*Math.sin(a),z+.36],[x,y,z+.36]);const pin=shaft(c,carrierKey,.068,z-.08,z+.42);pin.position.x=x;pin.position.y=y;const pg=tooth(root,'planet',(n-S.sun)/2,z);planet.push({pg,pin,index:i});}
  sets.push({n,z,sun,ring:r,carrier:c,carrierKey,ringKey,planet});
 }
 // Four actual alternating plate stacks; open cages replace opaque drums.
 // C1 and C2: input-side plates; B2/B3: case-side plates.
 function pack(key,z,hubKey,ri,ro,source){const shell=group(root,z),inner=group(root,z),piston=ring(shell,key,ri+.035,ro,0,.07),plates=[],back=ring(shell,key,ri+.035,ro,0,.06);
  for(let i=0;i<6;i++){const p=ring(i%2?inner:shell,key,i%2?ri-.02:ri+.035,i%2?ro-.04:ro+.045,.04+i*.08,.055);p.material.color.set(i%2?(colors[hubKey]||0x8fa6b0):0xaeb8af);plates.push(p);}for(let i=0;i<4;i++){const a=i*A.tau/4;rod(shell,key,[(ro+.04)*Math.cos(a),(ro+.04)*Math.sin(a),-.03],[(ro+.04)*Math.cos(a),(ro+.04)*Math.sin(a),.64],.028);}
  ring(shell,key,ro-.02,ro+.10,-.02,.07);ring(inner,hubKey,ri-.055,ri+.025,.3,.65);
  packs[key]={key,z,hubKey,source,shell,inner,piston,plates,back,ri,ro};return packs[key];}
 pack('C1',-2.30,'front',1.59,1.74,'input');pack('C2',-1.38,'sun',.38,.73,'input');pack('B2',-.69,'F1',.39,.72,'case');pack('B3',3.40,'rearCarrier',.45,.77,'case');
 // Input drum connects both clutch input plate cages; no rigid sun/input joint.
 ring(groups.input,'input',.14,1.85,-2.56,.12);for(let i=0;i<4;i++){const a=i*A.tau/4;rod(groups.input,'input',[1.8*Math.cos(a),1.8*Math.sin(a),-2.56],[1.8*Math.cos(a),1.8*Math.sin(a),-1.80],.035);}ring(groups.input,'input',.74,.82,-1.11,.08);for(let i=0;i<4;i++){const a=i*A.tau/4;rod(groups.input,'input',[.79*Math.cos(a),.79*Math.sin(a),-2.56],[.79*Math.cos(a),.79*Math.sin(a),-1.11],.035);}
 // C1 hub -> front drum, C2 hub -> common hollow sun shaft.
 ring(groups.front,'front',1.54,1.86,-1.68,.10);ring(groups.sun,'sun',.30,.40,-.80,.04);
 const f1=group(root,-.04),f2=group(root,3.12);ring(f1,'F1',.305,.39,0,.19);ring(f2,'F2',.44,.62,0,.18);
 for(const [z,r] of [[-.04,.73],[3.12,.64],[3.4,.80]]){ring(root,'case',r,r+.10,z,.12);rod(root,'case',[0,-r,z],[0,-2.65,z],.07);}
 // Stationary rails make the reaction path to the housing visible.
 rod(root,'case',[0,-2.65,-3],[0,-2.65,4.3],.075);for(const z of [-2.5,4])for(const x of [-1.1,1.1])rod(root,'case',[0,-2.65,z],[x,-2.9,z]);
 const pump=group(root,-4.20),turbine=group(root,-3.48),stator=group(root,-3.82),cover=group(root,-4.80);
 function bowl(p,k,dir){ring(p,k,.43,1.69,dir*.20,.08);ring(p,k,1.57,1.72,-.20,.045);ring(p,k,1.57,1.72,.20,.045);for(let i=0;i<22;i++){const a=i*A.tau/22,curve=new T.CatmullRomCurve3([new T.Vector3(.48*Math.cos(a),.48*Math.sin(a),dir*.2),new T.Vector3(1.10*Math.cos(a+.16*dir),1.10*Math.sin(a+.16*dir),0),new T.Vector3(1.62*Math.cos(a+.10*dir),1.62*Math.sin(a+.10*dir),-dir*.14)]);const vane=mesh(new T.TubeGeometry(curve,14,.045,5,false),p,k);vane.userData.schematicVane=true;}if(k==='turbine')spokes(p,k,.16,.48,dir*.20,4);}
 bowl(pump,'pump',-1);bowl(turbine,'turbine',1);ring(stator,'stator',.23,.43,0,.17);for(let i=0;i<12;i++){const a=i*A.tau/12;rod(stator,'stator',[.42*Math.cos(a),.42*Math.sin(a),0],[.67*Math.cos(a+.25),.67*Math.sin(a+.25),.02],.045);}
 ring(cover,'pump',.17,1.74,0,.12);for(let i=0;i<4;i++){const a=i*A.tau/4;rod(cover,'pump',[1.71*Math.cos(a),1.71*Math.sin(a),0],[1.71*Math.cos(a),1.71*Math.sin(a),.80],.035);}shaft(cover,'pump',.20,-1.0,0);shaft(turbine,'turbine',.16,0,1.6);const lockGroup=group(root,-4.58),lockPlate=ring(lockGroup,'lock',.46,1.50,0,.07);spokes(lockGroup,'lock',.18,.47,0,4);ring(lockGroup,'lock',.155,.23,0,.12);const statorSupport=ring(root,'case',.17,.23,-3.26,1.20);rod(root,'case',[0,-.23,-2.67],[0,-2.65,-2.67],.06);
 // Flow beads circulate through a meridional section. Not CFD streamlines.
 const flowPath=new T.CatmullRomCurve3([new T.Vector3(0,.55,-4.25),new T.Vector3(0,1.46,-4.13),new T.Vector3(0,1.55,-3.50),new T.Vector3(0,.60,-3.44),new T.Vector3(0,.50,-3.82)],true),beads=[];
 for(let i=0;i<20;i++){const m=mesh(new T.SphereGeometry(.035,8,8),root,null);m.material.color.set(0xd4b255);m.userData.annotation=true;beads.push(m);}
 let selected='',latest=null;
 function update(s){latest=s;for(const k of ['sun','front','output','rearCarrier'])groups[k].rotation.z=s.angles[k];groups.input.rotation.z=s.input;
  for(const set of sets)for(const p of set.planet){const v=A.planetPose(set.n,s.angles[set.carrierKey],s.angles.sun,p.index);p.pg.position.set(v.x,v.y,set.z);p.pg.rotation.z=v.angle;}
  for(const [key,p] of Object.entries(packs)){const v=A.packPose(s.apply[key]);p.piston.position.z=v.piston-.035;p.plates.forEach((m,i)=>m.position.z=v.centers[i]-.055/2);p.shell.rotation.z=p.source==='input'?s.input:0;p.inner.rotation.z=p.hubKey==='F1'?s.f1:s.angles[p.hubKey];}
  pump.rotation.z=cover.rotation.z=s.engine;turbine.rotation.z=s.input;lockGroup.rotation.z=s.input;lockGroup.position.z=-4.58-.125*Math.min(1,s.lock*2);stator.rotation.z=s.stator;
  beads.forEach((b,i)=>{b.visible=s.lock<.99;b.position.copy(flowPath.getPoint((s.engine*.15+i/beads.length)%1));});
  for(const m of items){if(!m.userData.part)continue;const key=m.userData.part,active=s.apply[key]>.99||key==='F1'&&s.gear==='2'||key==='F2'&&s.gear==='1';m.material.emissive.set(key===selected?0x51b9ac:active?0x845221:0);m.material.emissiveIntensity=key===selected?.75:active?.28:0;}
 }
 function audit(){root.updateWorldMatrix(true,true);const span=o=>{const b=new T.Box3().setFromObject(o);return [b.min.z,b.max.z];};const point=o=>root.worldToLocal(o.getWorldPosition(new T.Vector3())).toArray();return {sets:sets.map(s=>({n:s.n,z:s.z,sun:point(s.sun),ring:point(s.ring),carrierAngle:s.carrier.rotation.z,sunAngle:groups.sun.rotation.z,ringAngle:groups[s.ringKey].rotation.z,planets:s.planet.map(p=>({center:point(p.pg),pin:point(p.pin),angle:p.pg.rotation.z,scale:p.pg.scale.toArray(),n:(s.n-S.sun)/2}))})),packs:Object.values(packs).map(p=>({key:p.key,centers:p.plates.map(m=>m.position.z+.055/2),pistonFace:p.piston.position.z,thickness:.055,backFace:p.back.position.z+.06,radialClearance:.01,scales:p.plates.map(m=>m.scale.toArray())})),lockGap:(lockGroup.position.z-.035)-(-4.80+.06),state:latest,shaftSpans:{sun:span(sunShaft),input:span(inputShaft),output:span(outputShaft)}};}
 return {root,pickable,update,audit,select(k){selected=k;if(latest)update(latest);}};
};
