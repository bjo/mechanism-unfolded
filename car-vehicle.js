/* One mounted assembly per experiment, shared by all camera views. */
window.createCarVehicle=function(T){
 'use strict';
 const D=CarDrive,root=new T.Group(),pickable=[],items=[],rigid=[],gears=[],links=[],colors={driveClutch:0x9a7f63,inputShaft:0x587c87,countershaft:0x668194,freeGear:0xc9a15d,synchronizer:0x348b7b,shiftFork:0xbcc9c2,outputShaft:0x657d92,finalDrive:0x819996,diffCase:0x9caeac,spider:0xc59652,sideGear:0x479397,halfshaft:0x768d9a,rack:0xc09b5d,tieRod:0x617a86,knuckle:0x8b9e9a,wishbone:0x859ba8,damper:0xc99858,roadWheel:0x435451,brakePedal:0x687f88,masterCylinder:0x899d98,brakeLine:0xbea171,caliper:0x507e81,brakePad:0x9c795a,brakeDisc:0xa8b8b7};
 const v=a=>new T.Vector3(...a),group=(p=root,pos=[0,0,0])=>{const g=new T.Group();g.position.copy(v(pos));p.add(g);return g;};
 function mesh(geo,p,key,color){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:color??colors[key]??0x9aacaa,metalness:.46,roughness:.38,side:T.DoubleSide}));p.add(m);m.userData.part=key;if(key){pickable.push(m);items.push(m);}return m;}
 function box(p,key,size,pos=[0,0,0]){const m=mesh(new T.BoxGeometry(...size),p,key);m.position.copy(v(pos));return m;}
 function cyl(p,key,r,h,pos=[0,0,0],axis='z'){const m=mesh(new T.CylinderGeometry(r,r,h,40),p,key);m.position.copy(v(pos));if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;return m;}
 function ring(p,key,ro,ri,h,pos=[0,0,0],sweep=D.TAU){const s=new T.Shape();s.absarc(0,0,ro,0,sweep,false);s.lineTo(ri*Math.cos(sweep),ri*Math.sin(sweep));s.absarc(0,0,ri,sweep,0,true);s.closePath();const m=mesh(new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:48}),p,key);m.position.copy(v([pos[0],pos[1],pos[2]-h/2]));return m;}
 function ball(p,key,pos,r=.07){const m=mesh(new T.SphereGeometry(r,12,8),p,key);m.position.copy(v(pos));return m;}
 function rod(p,key,a,b,r=.045){const len=v(a).distanceTo(v(b)),m=mesh(new T.CylinderGeometry(r,r,len,12),p,key);placeRod(m,a,b);rigid.push(m);return m;}
 function placeRod(m,a,b){a=v(a);b=v(b);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());}
 function gear(p,key,n,pos,m=D.spec.module){const g=group(p,pos),s=new T.Shape();D.gearOutline(n,m).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const hole=new T.Path();hole.absarc(0,0,.145,0,D.TAU,true);s.holes.push(hole);const body=mesh(new T.ExtrudeGeometry(s,{depth:.22,bevelEnabled:false}),g,key);body.position.z=-.11;const mark=box(g,key,[.035,n*m/2-.19,.018],[0,(n*m/2+.19)/2,.122]);mark.material.color.set(0xf4ebce);g.userData.n=n;g.userData.radius=n*m/2;gears.push(g);return g;}
 function bearing(p,pos,axis='z'){const g=group(p,pos);if(axis==='x')g.rotation.y=Math.PI/2;ring(g,null,.24,.146,.19);box(g,null,[.55,.18,.23],[0,-.29,0]);return g;}
 function shaft(p,key,a,b,r=.13){return rod(p,key,a,b,r);}
 function dogs(p,key,z,phase=0){const g=group(p,[0,0,z]);g.rotation.z=phase;ring(g,key,.34,.32,.20);for(let i=0;i<12;i++){const q=group(g);q.rotation.z=i*D.TAU/12;box(q,key,[.07,.085,.20],[0,.37,0]);}return g;}
 const transmission=group(),tg=group(transmission);transmission.position.set(0,2.7,0);transmission.rotation.y=-Math.PI/2;
 const input=group(tg),counter=group(tg,[0,-1.8,0]),output=group(tg),fly=group(tg),pressure=group(fly),disc=group(input);
 shaft(input,'inputShaft',[0,0,-3.65],[0,0,-1.26]);shaft(output,'outputShaft',[0,0,-1.31],[0,0,3]);shaft(counter,'countershaft',[0,0,-2.05],[0,0,2.45]);
 // Pilot overlap uses a hollow journal, never two solid crossing shafts.
 ring(input,'inputShaft',.22,.135,.28,[0,0,-1.33]);
 cyl(fly,'driveClutch',.83,.16,[0,0,-3.25]);ring(disc,'driveClutch',.68,.15,.10,[0,0,-3.12]);ring(pressure,'driveClutch',.75,.20,.13,[0,0,-3.005]);
 for(let i=0;i<6;i++){const a=i*D.TAU/6;rod(fly,'driveClutch',[.79*Math.cos(a),.79*Math.sin(a),-3.25],[.79*Math.cos(a),.79*Math.sin(a),-2.53],.035);}
 ring(fly,'driveClutch',.85,.72,.08,[0,0,-2.54]);
 const springFingers=[];for(let i=0;i<12;i++){const f=group(fly,[.62*Math.cos(i*D.TAU/12),.62*Math.sin(i*D.TAU/12),-2.68]);f.rotation.order='ZYX';f.rotation.z=i*D.TAU/12;springFingers.push(f);rod(f,'driveClutch',[0,0,0],[-.39,0,.05],.015);rod(f,'driveClutch',[0,0,0],[.11,0,-.05],.015);cyl(pressure,'driveClutch',.023,.21,[.73*Math.cos(i*D.TAU/12),.73*Math.sin(i*D.TAU/12),-2.835]);}
 ring(fly,'driveClutch',.64,.60,.05,[0,0,-2.68]);
 const release=group(tg,[0,0,-2.58]);ring(release,'driveClutch',.27,.15,.10);
 const driveG=gear(input,'inputShaft',20,[0,0,-1.65]),counterG=gear(counter,'countershaft',40,[0,0,-1.65]);
 const counterLow=gear(counter,'countershaft',20,[0,0,-.4]),low=gear(tg,'freeGear',40,[0,0,-.4]);
 const counterHigh=gear(counter,'countershaft',28,[0,0,1.2]),high=gear(tg,'freeGear',32,[0,0,1.2]);
 dogs(low,'synchronizer',.24);dogs(high,'synchronizer',-.24);ring(low,'synchronizer',.34,.15,.09,[0,0,.135]);ring(high,'synchronizer',.34,.15,.09,[0,0,-.135]);
 const hub=group(output,[0,0,.4]);ring(hub,'synchronizer',.31,.13,.54);for(let i=0;i<12;i++){if(i%4===1)continue;const g=group(hub);g.rotation.z=i*D.TAU/12;box(g,'synchronizer',[.07,.1,.74],[0,.37,0]);}
 function cone(p,key,ri0,ri1,ro0,ro1,h,z,flip=false){const pts=[[ri0,-h/2],[ro0,-h/2],[ro1,h/2],[ri1,h/2],[ri0,-h/2]].map(a=>new T.Vector2(...a));const m=mesh(new T.LatheGeometry(pts,48),p,key);m.rotation.x=flip?-Math.PI/2:Math.PI/2;m.position.z=z;return m;}
 cone(low,'synchronizer',.15,.15,.28,.23,.12,.30);cone(high,'synchronizer',.15,.15,.28,.23,.12,-.30,true);
 const blockers=[{g:group(output,[0,0,0]),side:-1,keys:[]},{g:group(output,[0,0,.8]),side:1,keys:[]}];
 blockers.forEach(({g,side,keys})=>{cone(g,'synchronizer',.281,.231,.315,.315,.12,0,side>0);for(let i=0;i<3;i++){const q=group(g);q.rotation.z=i*D.TAU/3;const key=box(q,'synchronizer',[.14,.05,.01],[.375,0,-side*.055]);keys.push(key);}});
 const sleeve=group(output,[0,0,.4]);ring(sleeve,'synchronizer',.53,.43,.28);for(let i=0;i<12;i++){const g=group(sleeve);g.rotation.z=(i+.5)*D.TAU/12;box(g,'synchronizer',[.065,.09,.28],[0,.395,0]);}
 for(const z of [-.10,.10])ring(sleeve,'synchronizer',.59,.525,.04,[0,0,z]);
 const fork=group(tg,[0,0,.4]);for(const x of [-.565,.565]){box(fork,'shiftFork',[.04,.20,.13],[x,0,0]);rod(fork,'shiftFork',[x,0,0],[x,1.35,0],.035);rod(fork,'shiftFork',[x,1.35,0],[0,1.55,0],.04);}const rail=shaft(fork,'shiftFork',[0,1.55,-1],[0,1.55,1],.065);for(const z of [-.7,1.5]){const b=bearing(tg,[0,1.55,z]);b.scale.setScalar(.53);rod(tg,null,[.45,-2.3,z],[.45,1.55,z],.055);rod(tg,null,[0,1.55,z],[.45,1.55,z],.055);}
 // Reverse idler enters axially only in R; its fixed arbor supports both positions.
 for(const g of [driveG,counterG,counterLow,counterHigh])cyl(g,g===driveG?'inputShaft':'countershaft',.15,.25);
 const revLow=gear(counter,'countershaft',20,[0,0,2.05]),revMain=gear(output,'outputShaft',20,[0,0,2.05]);
 for(const g of [revLow,revMain])cyl(g,'outputShaft',.15,.25);
 const ix=Math.sqrt(1.2**2-.9**2),idler=gear(tg,'freeGear',20,[ix,-.9,2.75]);shaft(tg,'shiftFork',[ix,-.9,1.8],[ix,-.9,3.05],.12);const idlerFork=group(tg,[ix,-.9,2.75]);ring(idlerFork,'shiftFork',.28,.21,.08,[0,0,.19],Math.PI*1.7);
 for(const y of [0,-1.8])for(const z of [-2.04,2.47])bearing(tg,[0,y,z]);for(const z of [-2.04,2.47])box(tg,null,[.65,2.55,.10],[0,-1.08,z]);box(tg,null,[1.1,.12,4.62],[0,-2.30,.215]);
 // Conical tooth surfaces, common apex. Exact involute/hypoid manufacturing surfaces omitted.
 function bevel(p,key,n,delta,outer,inner,axis){const g=group(p),points=D.gearOutline(n,2*outer/n),ratio=inner/outer,axial=outer/Math.tan(delta),positions=[],indices=[];
  for(const k of [1,ratio])for(const [x,y] of points)positions.push(x*k,y*k,axial*k);const N=points.length;for(let i=0;i<N;i++){const j=(i+1)%N;indices.push(i,j,N+j,i,N+j,N+i);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,g,key);g.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),v(axis));g.userData={n,delta,outer,inner,axial,axis};return g;}
 const differential=group(root,[0,2.5,0]),caseG=group(differential),left=group(differential),right=group(differential),spiders=[];
 const delta=Math.atan2(24,12),bevelL=bevel(left,'sideGear',24,delta,.72,.47,[-1,0,0]),bevelR=bevel(right,'sideGear',24,delta,.72,.47,[1,0,0]);
 for(const b of [bevelL,bevelR])ring(b,'sideGear',.65,.13,.04,[0,0,.35]);
 for(const side of [-1,1]){const s=group(caseG);s.rotation.z=side<0?Math.PI:0;const b=bevel(s,'spider',12,Math.PI/2-delta,.36,.235,[0,1,0]);ring(b,'spider',.29,.095,.04,[0,0,.71]);spiders.push(b);}
 shaft(caseG,'diffCase',[0,-.94,0],[0,.94,0],.09);
 for(const side of [-1,1]){const axle=side<0?left:right;shaft(axle,'halfshaft',[side*.25,0,0],[side*2.65,0,0]);const bearingG=bearing(differential,[side*1.4,0,0],'x');box(bearingG,null,[.6,.45,.15],[0,-.46,0]);const w=group(axle,[side*2.48,0,0]);w.rotation.y=Math.PI/2;ring(w,'roadWheel',.88,.65,.34);ring(w,'halfshaft',.20,.13,.09);for(let i=0;i<5;i++){const sp=group(w);sp.rotation.z=i*D.TAU/5;box(sp,'halfshaft',[.08,.54,.08],[0,.32,0]);}}
 for(const x of [-.94,.94]){const q=group(caseG,[x,0,0]);q.rotation.y=Math.PI/2;ring(q,'diffCase',.98,.77,.12);}
 for(const a of [0,Math.PI])rod(caseG,'diffCase',[-.94,.91*Math.cos(a),.91*Math.sin(a)],[.94,.91*Math.cos(a),.91*Math.sin(a)],.08);
 const ringGear=bevel(caseG,'finalDrive',36,Math.atan(3),1.32,1.03,[-1,0,0]),pinion=bevel(differential,'finalDrive',12,Math.atan(1/3),.44,.343,[0,0,1]);
 ring(pinion,'finalDrive',.37,.13,.04,[0,0,1.31]);
 const ringWeb=group(caseG,[-.35,0,0]);ringWeb.rotation.y=Math.PI/2;ring(ringWeb,'finalDrive',1.05,.76,.08);for(const a of [0,Math.PI/2,Math.PI,3*Math.PI/2])rod(caseG,'diffCase',[-.35,.85*Math.cos(a),.85*Math.sin(a)],[-.94,.85*Math.cos(a),.85*Math.sin(a)],.055);
 const prop=group(differential);shaft(prop,'finalDrive',[0,0,1.05],[0,0,2.50]);bearing(differential,[0,0,2.25]);
 // Front suspension. The four arms and tie rods retain their construction lengths.
 const chassis=group(root,[0,.9,0]),rack=group(chassis,[0,1.3,.65]),rackPin=group(chassis,[0,1.65,.65]),susp=[];
 box(rack,'rack',[2,.13,.16],[0,-.10,0]);const rackPitch=Math.PI*.05;
 for(let i=-7;i<=7;i++){const sh=new T.Shape(),c=i*rackPitch;sh.moveTo(c-.060,-.065);sh.lineTo(c-.023,.040);sh.lineTo(c+.023,.040);sh.lineTo(c+.060,-.065);sh.closePath();const tooth=mesh(new T.ExtrudeGeometry(sh,{depth:.14,bevelEnabled:false}),rack,'rack');tooth.position.z=-.07;}
 const rackG=gear(rackPin,'rack',14,[0,0,0],.05);cyl(rackPin,'rack',.146,.22);bearing(chassis,[0,1.65,.20]);shaft(rackPin,'rack',[0,0,-.4],[0,0,.65],.05);ring(rackPin,'rack',.48,.43,.06,[0,0,.65]);for(let i=0;i<3;i++){const g=group(rackPin);g.rotation.z=i*D.TAU/3;rod(g,'rack',[0,0,.65],[.44,0,.65],.025);}
 for(const x of [-.56,.56]){box(chassis,null,[.18,.25,.30],[x,1.18,.65]);}
 box(chassis,null,[1.8,.15,1.15],[0,.70,0]);
 function coil(p,key,a,b){const g=group(p),points=[];for(let i=0;i<=160;i++){const u=i/160,t=u*D.TAU*7;points.push(new T.Vector3(.16*Math.cos(t),u,.16*Math.sin(t)));}const m=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),160,.023,7,false),g,key);return {g,m,base:Array.from(m.geometry.attributes.position.array),update(a,b){const A=v(a),B=v(b),len=A.distanceTo(B);g.position.copy(A);g.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());const attr=m.geometry.attributes.position;for(let i=0;i<attr.count;i++)attr.setY(i,this.base[i*3+1]*len);attr.needsUpdate=true;m.geometry.computeBoundingSphere();}};}
 for(const side of [-1,1]){
  for(const z of [-.4,.4])rod(chassis,null,[side*.8,.7,z],[side*.8,1.7,z],.055);rod(chassis,null,[side*.8,.7,-.62],[side*.8,2.35,-.62],.065);rod(chassis,null,[side*.8,2.35,-.62],[side*.9,2.35,0],.065);rod(chassis,null,[side*.8,.7,-.62],[side*.8,.7,.4],.055);
  const arms=[];for(const y of [.9,1.7]){const arm=group(chassis,[side*.8,y,0]);for(const z of [-.4,.4]){rod(arm,'wishbone',[0,0,z],[side*1.55,0,0],.052);ball(chassis,'wishbone',[side*.8,y,z]);}rod(arm,'wishbone',[0,0,-.4],[0,0,.4],.04);arms.push(arm);}
  const upright=group(chassis),wheel=group(upright,[side*.22,0,0]);shaft(upright,'knuckle',[0,-.40,0],[0,.40,0],.085);for(const y of [-.4,.4])ball(upright,'knuckle',[0,y,0],.11);rod(upright,'knuckle',[0,0,0],[-side*.18,0,.45],.065);shaft(upright,'knuckle',[0,0,0],[side*.32,0,0],.12);const tyre=group(wheel);tyre.rotation.y=Math.PI/2;ring(tyre,'roadWheel',.82,.61,.28);ring(tyre,'roadWheel',.20,.13,.09);for(let i=0;i<5;i++){const s=group(tyre);s.rotation.z=i*D.TAU/5;box(s,'roadWheel',[.08,.55,.08],[0,.33,0]);}
  const p=D.steering(0,0,side),tie=rod(chassis,'tieRod',p.inner,p.outer,.035),ends=[ball(chassis,'tieRod',p.inner),ball(chassis,'tieRod',p.outer)];
  const anchor=[side*.9,2.35,0],bottom=[side*1.88,.9,0],damperG=group(chassis),barrel=cyl(damperG,'damper',.095,.85,[0,.425,0],'y'),damperRod=cyl(damperG,'damper',.035,1.12,[0,1,0],'y'),spring=coil(chassis,'damper',bottom,anchor);ball(chassis,'damper',anchor);const seatA=cyl(chassis,'damper',.22,.04,[0,0,0],'y'),seatB=cyl(chassis,'damper',.22,.04,[0,0,0],'y');
  susp.push({side,arms,upright,wheel,tie,ends,anchor,damperG,barrel,damperRod,spring,seatA,seatB});
 }
 // Brake bench: a single circuit / sliding caliper, with an actual closed force path.
 const brakes=group(root,[0,0,0]),pedal=group(brakes,[-2.9,3.05,0]),master=group(brakes,[-2.05,2.45,0]),piston=group(brakes),caliper=group(brakes,[1.25,2.3,0]),caliperSlide=group(caliper),rotor=group(caliper),padIn=group(caliperSlide),padOut=group(caliperSlide),pistonCal=group(caliperSlide);
 rod(pedal,'brakePedal',[0,0,0],[0,-1.65,0],.075);box(pedal,'brakePedal',[.44,.20,.22],[0,-1.65,0]);cyl(brakes,'brakePedal',.12,.45,[-2.9,3.05,0]);box(brakes,null,[.48,.14,.6],[-2.9,3.24,0]);
 const brakeInitial=D.brakePose(0),pushrod=rod(brakes,'brakePedal',brakeInitial.joint,brakeInitial.piston,.045);
 const masterShell=group(master);masterShell.rotation.y=Math.PI/2;ring(masterShell,'masterCylinder',.21,.155,.85,[0,0,.40],Math.PI*1.4);cyl(piston,'masterCylinder',.15,.12,[0,0,0],'x');box(master,'masterCylinder',[.48,.25,.32],[.25,.39,0]);cyl(master,'masterCylinder',.055,.2,[.25,.20,0],'y');
 let lastBrakeInput=-1;const linePath=new T.CatmullRomCurve3([[ -1.17,2.45,0],[-.75,2.45,0],[-.35,3.35,0],[1.5,3.35,0],[1.75,3.14,-.40]].map(v));const hose=mesh(new T.TubeGeometry(linePath,56,.045,9,false),brakes,'brakeLine');
 ring(rotor,'brakeDisc',.96,.16,.16);shaft(rotor,'brakeDisc',[0,0,-.45],[0,0,.45],.14);for(let i=0;i<6;i++){const a=i*D.TAU/6;ball(rotor,'brakeDisc',[.4*Math.cos(a),.4*Math.sin(a),.09],.035);}
 const caliperX=.50,caliperY=.64;box(caliperSlide,'caliper',[.65,.16,.82],[caliperX,caliperY+.28,0]);for(const x of [caliperX-.23,caliperX+.23])box(caliperSlide,'caliper',[.08,.65,.13],[x,caliperY,.265]);ring(caliperSlide,'caliper',.22,.175,.30,[caliperX,caliperY,-.34]);box(caliperSlide,'caliper',[.65,.12,.18],[caliperX,caliperY+.25,-.43]);rod(caliperSlide,'caliper',[.5,.84,-.40],[.5,.64,-.40],.045);
 for(const x of [.16,.83]){shaft(caliper,'caliper',[x,caliperY+.27,-.62],[x,caliperY+.27,.64],.035);box(caliper,null,[.10,.44,.13],[x,caliperY+.03,-.61]);rod(caliper,null,[x,caliperY-.19,-.61],[0,-.10,-.47],.055);}
 box(padIn,'brakePad',[.48,.46,.06],[caliperX,caliperY,0]);box(padOut,'brakePad',[.48,.46,.06],[caliperX,caliperY,0]);cyl(pistonCal,'caliper',.17,.20,[caliperX,caliperY,0]).material.color.set(0xbcc6c2);bearing(caliper,[0,0,-.47]);box(caliper,null,[.16,1.12,.13],[0,-.67,-.47]);box(caliper,null,[1.45,.15,.25],[.38,-1.25,-.47]);
 box(brakes,null,[5.8,.12,.35],[-.3,1.03,-.35]);rod(brakes,null,[-3.2,1.03,-.35],[-3.2,3.24,0],.065);rod(brakes,null,[-3.2,3.24,0],[-2.9,3.24,0],.065);rod(brakes,null,[-1.65,1.03,-.35],[-1.65,2.24,0],.055);
 // Whole-car summary reuses the same three-dimensional subassemblies; no fake disconnected arrows.
 const whole=group(root),engine=group(whole,[0,1.4,-2.7875]),engineCrank=group(engine),propWhole=group(whole,[0,1.4,0]);
 shaft(engineCrank,'inputShaft',[0,0,-.7],[0,0,.48],.11);
 const engineRods=[],enginePistons=[];for(let i=0;i<4;i++){const z=-.55+i*.28,phase=i===0||i===3?0:Math.PI,p=group(engine,[0,0,z]),cr=group(engineCrank,[0,0,z]);cr.rotation.z=phase;rod(cr,'inputShaft',[0,0,0],[0,.18,0],.06);cyl(cr,'inputShaft',.055,.16,[0,.18,0]);const rr=rod(p,'inputShaft',[0,.18,0],[0,.8,0],.032),pp=cyl(p,'inputShaft',.13,.19,[0,.8,0],'y');engineRods.push({rr,phase});enginePistons.push(pp);}
 for(const x of [-.2,.2])box(engine,null,[.05,1.05,1.2],[x,.4,-.12]);
 for(const x of [-1.12,1.12])box(whole,null,[.10,.13,7.6],[x,.93,.1]);for(const z of [-2.8,3.5])box(whole,null,[2.34,.13,.14],[0,.96,z]);box(whole,null,[2.34,.12,.16],[0,.55,-1.5]);for(const x of [-1.12,1.12])rod(whole,null,[x,.55,-1.5],[x,.93,-1.5],.045);for(const side of [-1,1])rod(whole,null,[side*.2,1.275,-2.8],[side*1.12,.96,-2.8],.055);
 shaft(propWhole,'outputShaft',[0,0,-.16],[0,0,1.96],.07);box(propWhole,'outputShaft',[.02,.03,1.9],[.069,0,.9]);
 const roadBrakes=susp.map(s=>{const r=group(s.wheel),fixed=group(s.upright,[s.side*.22,0,0]);r.rotation.y=fixed.rotation.y=Math.PI/2;ring(r,'brakeDisc',.48,.15,.06);box(fixed,'caliper',[.25,.10,.29],[.30,.55,0]);for(const z of [-.12,.12])box(fixed,'caliper',[.25,.40,.05],[.30,.36,z]);const pads=[box(fixed,'brakePad',[.19,.23,.04],[.30,.24,-.07]),box(fixed,'brakePad',[.19,.23,.04],[.30,.24,.07])];return {r,fixed,pads};});
 let mode=6,selected='',tx=new D.Transmission(),carrier=0,splitAngle=0,wheelAngle=0,brakeSpeed=0,brakeAngle=0,journeyTime=0,settings={rack:0,bump:0,split:0,brake:0,driveStage:0},lastState={};
 function setMode(n){mode=n;transmission.visible=n===6||n===10;differential.visible=n===7||n===10;chassis.visible=n===8||n===10;brakes.visible=n===9;whole.visible=n===10;
  transmission.scale.setScalar(n===10?.35:1);transmission.position.set(0,n===10?1.4:2.7,n===10?-1.20:0);transmission.rotation.y=n===10?0:-Math.PI/2;
  differential.scale.setScalar(n===10?.62:1);differential.position.set(0,n===10?1.4:2.5,n===10?3.5:0);differential.rotation.y=n===10?Math.PI:0;
  chassis.scale.setScalar(n===10?.67:1);chassis.position.set(0,n===10?.53:.9,n===10?-2.8:0);
  roadBrakes.forEach(b=>b.r.visible=b.fixed.visible=n===10);
  if(n===10){tx=new D.Transmission();tx.clutch=1;journeyTime=0;carrier=splitAngle=0;}
  update();
 }
 function update(){const p=tx.pose();fly.rotation.z=p.engine;input.rotation.z=p.input;counter.rotation.z=p.counter;output.rotation.z=p.output;low.rotation.z=p.low;high.rotation.z=p.high;counterG.rotation.z=counterLow.rotation.z=counterHigh.rotation.z=revLow.rotation.z=0;
  const springAngle=Math.asin((.05-.14*p.clutch)/Math.hypot(.39,.05))-Math.atan2(.05,.39);pressure.position.z=-.11*Math.sin(springAngle)-.05*Math.cos(springAngle)+.05;release.position.z=-2.58-.14*p.clutch;springFingers.forEach(f=>f.rotation.y=springAngle);sleeve.position.z=.4+p.sleeve;fork.position.z=sleeve.position.z;blockers.forEach(b=>{const approach=Math.max(0,b.side*p.sleeve);b.g.position.z=(b.side<0?0:.8)+b.side*Math.min(.1,Math.max(0,approach-.2));b.keys.forEach(k=>k.position.x=.375-Math.max(0,approach-.3)/.17*.04);});
  const phi=Math.atan2(.9,ix);idler.rotation.z=((40*phi+20*Math.PI-20*p.counter-Math.PI)/20);idler.position.z=2.75-.70*p.reverse;idlerFork.position.z=idler.position.z;
  // Absolute phases stay continuous while the imposed corner condition changes.
  caseG.rotation.x=carrier;left.rotation.x=carrier-splitAngle;right.rotation.x=carrier+splitAngle;spiders.forEach(s=>s.rotation.z=Math.PI/12-splitAngle*2);pinion.rotation.z=carrier*3+Math.PI/12;prop.rotation.z=carrier*3;
  const rackValue=settings.rack;rack.position.x=rackValue;rackPin.rotation.z=rackValue/.35;const steeringStates=[];
  for(const s of susp){const b=s.side<0?settings.bump:0,p=D.steering(rackValue,b,s.side);steeringStates.push(p);s.arms.forEach(a=>a.rotation.z=p.armAngle);s.upright.position.set(p.x,p.y,0);s.upright.rotation.y=p.angle;s.wheel.rotation.x=wheelAngle;
   placeRod(s.tie,p.inner,p.outer);s.ends[0].position.copy(v(p.inner));s.ends[1].position.copy(v(p.outer));
   const bottom=[s.side*(.8+1.08*Math.cos(p.armAngle)),.9+s.side*1.08*Math.sin(p.armAngle),0],A=v(bottom),B=v(s.anchor),len=A.distanceTo(B);s.damperG.position.copy(A);s.damperG.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.clone().sub(A).normalize());s.damperRod.position.y=len-.56;s.spring.update(bottom,s.anchor);s.seatA.position.copy(A);s.seatB.position.copy(B);s.seatA.quaternion.copy(s.damperG.quaternion);s.seatB.quaternion.copy(s.damperG.quaternion);}
  const b=D.brakePose(settings.brake);pedal.rotation.z=b.angle;placeRod(pushrod,b.joint,b.piston);piston.position.copy(v(b.piston));caliperSlide.position.z=-.06*b.takeup;padIn.position.z=-.17+.12*b.takeup;padOut.position.z=.17;pistonCal.position.z=padIn.position.z-.13;rotor.rotation.z=brakeAngle;hose.material.color.setHSL(.10,.25+.6*b.pressure,.62-.22*b.pressure);if(settings.brake!==lastBrakeInput){linePath.points[linePath.points.length-1].z=-.40+caliperSlide.position.z;hose.geometry.dispose();hose.geometry=new T.TubeGeometry(linePath,56,.045,9,false);lastBrakeInput=settings.brake;}
  engineCrank.rotation.z=p.engine;engineRods.forEach(({rr,phase},i)=>{const t=p.engine+phase,pin=[-.18*Math.sin(t),.18*Math.cos(t),0],top=[0,pin[1]+Math.sqrt(.62**2-pin[0]**2),0];placeRod(rr,pin,top);enginePistons[i].position.copy(v(top));});propWhole.rotation.z=p.output;
  roadBrakes.forEach(r=>{r.pads[0].position.z=-.05-.02*(1-b.takeup);r.pads[1].position.z=.05+.02*(1-b.takeup);});
  lastState={mode,settings:{...settings},transmission:p,steering:steeringStates,brake:{...b,speed:brakeSpeed,angle:brakeAngle},differential:{carrier,left:carrier-splitAngle,right:carrier+splitAngle,spider:splitAngle*2,split:settings.split},journeyTime,journeyStage:Math.min(5,Math.floor(journeyTime/6))};
 }
 function tick(dt,delta){
  if(mode===10){const before=journeyTime;journeyTime=Math.min(36,journeyTime+delta/(Math.PI/3));const stage=Math.min(5,Math.floor(journeyTime/6));settings.driveStage=stage;
   if(before===0&&delta>0){tx.request('1');}if(stage===0){tx.clutch=1;}else if(stage===1){tx.clutch=tx.busy||journeyTime<7?1:0;}else if(stage===2){tx.clutch=1;if(!tx.busy&&tx.gear!=='2')tx.request('2');}else if(stage===3||stage===4){tx.clutch=tx.busy?1:0;}else tx.clutch=1;
   settings.rack=stage===4?.14:0;settings.split=stage===4?.24:0;settings.brake=stage===5?Math.min(1,(journeyTime-30)/2):0;
  }
  tx.tick(mode===10&&!delta?0:delta?dt:tx.busy?dt:0,mode===6||mode===10?delta:0);
  let rotation=mode===7?delta/3:mode===10?-tx.outputSpeed*dt/3:0;if(mode===10&&settings.driveStage===5){const coast=delta*.42*Math.max(0,1-(journeyTime-30)/4);tx.output+=coast;tx.input+=coast/D.spec.ratios['2'];rotation=-coast/3;}
  carrier+=rotation;splitAngle+=rotation*settings.split;wheelAngle+=mode===8?delta:mode===10?-rotation:rotation;
  if(mode===9&&delta){const b=D.brakePose(settings.brake),sim=delta/(Math.PI/3);brakeSpeed=Math.max(0,brakeSpeed-(.015+2*b.pressure)*sim);brakeAngle+=brakeSpeed*sim;}
  update();
 }
 function select(key){selected=key;items.forEach(m=>{m.material.emissive.set(m.userData.part===key?0x389e87:0);m.material.emissiveIntensity=m.userData.part===key?.5:0;});}
 function setSettings(s){Object.assign(settings,s);update();}
 const point=(o,p)=>{root.updateWorldMatrix(true,true);return root.worldToLocal(o.localToWorld(v(p)));};
 function audit(){root.updateWorldMatrix(true,true);const shaftEnds=m=>{const h=m.geometry.parameters.height/2;return [point(m,[0,-h,0]),point(m,[0,h,0])];},length=m=>{const e=shaftEnds(m);return e[0].distanceTo(e[1])/transmission.scale.x;};
  return {...lastState,settings:{...settings},rigid:rigid.map(m=>{let assembly=m;while(assembly.parent&&assembly.parent!==root)assembly=assembly.parent;const ends=shaftEnds(m);return {length:m.geometry.parameters.height,expectedLength:m.geometry.parameters.height*assembly.scale.x,actualLength:ends[0].distanceTo(ends[1]),scale:m.scale.toArray()};}),gearMeshes:[[driveG,counterG],[counterLow,low],[counterHigh,high]].map(([a,b])=>({distance:point(a,[0,0,0]).distanceTo(point(b,[0,0,0]))/transmission.scale.x,pitch:a.userData.radius+b.userData.radius,n:[a.userData.n,b.userData.n],plane:Math.abs(a.position.z-b.position.z),angleA:a.parent===counter?counter.rotation.z:a.parent===input?input.rotation.z:a.rotation.z,angleB:b.parent===counter?counter.rotation.z:b.rotation.z})),railClearance:tg.worldToLocal(rail.getWorldPosition(new T.Vector3())).y-low.userData.radius-D.spec.module-rail.geometry.parameters.radiusTop,clutchContact:{finger:tg.worldToLocal(springFingers[0].localToWorld(v([-.39,0,.05]))).z,bearing:release.position.z-.05,pressure:pressure.position.z},forkError:point(fork,[0,0,0]).distanceTo(point(sleeve,[0,0,0])),steeringLinks:susp.map(s=>({rod:shaftEnds(s.tie).map(p=>p.toArray()),joints:s.ends.map(e=>point(e,[0,0,0]).toArray()),length:s.tie.geometry.parameters.height*chassis.scale.x,scale:s.tie.scale.toArray(),arms:s.arms.map(a=>({inner:[point(a,[0,0,-.4]).toArray(),point(a,[0,0,.4]).toArray()],outer:point(a,[s.side*1.55,0,0]).toArray()}))})),brakeRod:{ends:shaftEnds(pushrod).map(p=>p.toArray()),joint:point(pedal,[0,-.6,0]).toArray(),piston:point(piston,[0,0,0]).toArray(),length:pushrod.geometry.parameters.height},padGaps:[- .08-(caliperSlide.position.z+padIn.position.z+.03),caliperSlide.position.z+padOut.position.z-.03-.08],rackContact:{shift:rack.position.x,angle:rackPin.rotation.z,pitch:.35},wholeConnection:{output:tx.output,carrier,frontWheel:wheelAngle,propAngle:propWhole.rotation.z,gearboxEnd:point(tg,[0,0,3]).toArray(),propStart:point(propWhole,[0,0,-.16]).toArray(),propEnd:point(propWhole,[0,0,1.96]).toArray(),pinionEnd:point(differential,[0,0,2.50]).toArray()},bevelAngles:{carrier:caseG.rotation.x,pinion:pinion.rotation.z,spiders:spiders.map(s=>s.rotation.z),relative:splitAngle},diffAngles:[left.rotation.x,right.rotation.x,caseG.rotation.x],roots:[transmission,differential,chassis,brakes,whole].map(g=>({visible:g.visible,scale:g.scale.toArray()}))};
 }
 setMode(6);return {root,pickable,setMode,select,setSettings,update,tick,audit,get state(){return lastState;},get transmission(){return tx;},spinBrake(){brakeSpeed=2.5;},resetJourney(){setMode(10);},get settings(){return {...settings};}};
};
