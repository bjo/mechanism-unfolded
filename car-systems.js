/* Connected teaching modules. Solid parts are rigid; fluid markers are tracers,
 * not objects transmitting torque. All travel is derived from the crank clock. */
window.createCarSystems=function(T,engine){
 const M=CarMechanics,root=new T.Group(),pickable=[],items=[],bankRoot=new T.Group(),air=new T.Group(),fluids=new T.Group();root.add(bankRoot,air,fluids);
 const palette={throttle:0x399a97,injector:0xbb9652,ecu:0x807092,oil:0xc59a37,coolant:0x4c9ca4,thermostat:0xc89459,radiator:0x687f83,pump:0x52696e};
 const g=(p,x=0,y=0,z=0)=>{const a=new T.Group();a.position.set(x,y,z);p.add(a);return a;};
 function mesh(geometry,parent,key,color=palette[key]){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,metalness:.35,roughness:.45,side:T.DoubleSide}));parent.add(m);m.userData.part=key;pickable.push(m);items.push(m);return m;}
 function box(p,key,size,pos){const m=mesh(new T.BoxGeometry(...size),p,key);m.position.set(...pos);return m;}
 function cyl(p,key,r,h,pos,axis='y'){const m=mesh(new T.CylinderGeometry(r,r,h,32),p,key);m.position.set(...pos);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;return m;}
 function ring(p,key,r,t,pos,axis='z'){const m=mesh(new T.TorusGeometry(r,t,8,48),p,key);m.position.set(...pos);if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;return m;}
 function path(p,key,points,r=.065){const curve=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a)),false,'centripetal');const m=mesh(new T.TubeGeometry(curve,64,r,8,false),p,key);return {curve,mesh:m,start:points[0],end:points.at(-1)};}
 const traces=[];
 function trace(route,key,gate=()=>1,count=14){route.mesh.material.transparent=true;route.mesh.material.opacity=.22;route.mesh.material.depthWrite=false;const beads=[];for(let i=0;i<count;i++){const b=mesh(new T.SphereGeometry(.029,8,6),route.mesh.parent,key);b.material.emissive.set(palette[key]);b.material.emissiveIntensity=.35;beads.push(b);}traces.push({route,beads,gate,key});return route;}
 // Four copies of the SAME cylinder mechanism. Their round journals overlap
 // on one axis; angular offsets fix webs and cam lobes on common rigid shafts.
 const units=M.bank.map((b,i)=>{const u=createCarModel(T,{bankIndex:i,noBelt:i!==0,noFlywheel:i!==3});u.root.position.z=b.z;bankRoot.add(u.root);u.setChapter(2);pickable.push(...u.pickable);return u;});
 // Permanent cylinder numbers identify locations, not hover explanations.
 for(const b of M.bank){const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#f6f5ec';ctx.beginPath();ctx.arc(48,48,40,0,Math.PI*2);ctx.fill();ctx.fillStyle='#286b6d';ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.number,48,49);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:true}));s.position.set(.96,3.8,b.z);s.scale.set(.36,.36,1);bankRoot.add(s);}
 // Butterfly throttle, common shaft and two downstream port injectors.
 const throttle=g(air,-2.6,4.53,0),plate=g(throttle);
 const bore=mesh(new T.CylinderGeometry(.35,.35,1.05,48,1,true),throttle,'throttle');bore.rotation.z=Math.PI/2;bore.material.transparent=true;bore.material.opacity=.16;bore.material.depthWrite=false;
 cyl(plate,'throttle',.325,.025,[0,0,0],'x');cyl(throttle,'throttle',.035,.82,[0,0,0],'z');
 for(const z of [-.4,.4])ring(throttle,'throttle',.06,.016,[0,0,z]);
 const airRoutes=[];for(const z of [-.32,.32])airRoutes.push(trace(path(air,'throttle',[[-3.3,4.53,0],[-2.95,4.84,0],[-2.6,4.87,0],[-2.25,4.84,0],[-2.0,4.53,z],[-1.65,4.53,z]],.015),'throttle',s=>s.charge));
 traces.filter(t=>t.key==='throttle').forEach(t=>t.beads.forEach(b=>{b.geometry=new T.SphereGeometry(.012,8,6);}));
 for(const z of [-.32,.32]){const runner=path(air,'throttle',[[-2.075,4.53,0],[-1.85,4.53,z],[-1.65,4.53,z]],.10).mesh;runner.material.transparent=true;runner.material.opacity=.13;runner.material.depthWrite=false;}
 const needles=[],sprays=[];const rail=path(air,'injector',[[-1.82,5.22,-.55],[-1.82,5.22,.55]],.08);
 for(const z of [-.32,.32]){
  const nozzle=g(air,-1.82,4.92,z),dir=new T.Vector3(.5,-.866,0);nozzle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);
  const shell=cyl(nozzle,'injector',.087,.42,[0,0,0]);shell.material.transparent=true;shell.material.opacity=.25;shell.material.depthWrite=false;
  const needle=cyl(nozzle,'injector',.022,.34,[0,.04,0]);needles.push(needle);ring(nozzle,'injector',.035,.012,[0,.21,0],'y');
  path(air,'injector',[[-1.82,5.22,z],[-1.925,5.102,z]],.04);
  const sprayPath=path(air,'injector',[[-1.715,4.738,z],[-1.57,4.58,z],[-1.40,4.50,z]],.012);sprayPath.mesh.visible=false;
  const beads=[];for(let i=0;i<8;i++)beads.push(mesh(new T.SphereGeometry(.018,8,5),air,'injector'));sprays.push({route:sprayPath,beads});
 }
 box(air,'ecu',[.55,.38,.18],[-2.7,3.2,-.35]);
 path(air,'ecu',[[-2.7,3.39,-.35],[-2.3,5.45,-.5],[-1.82,5.12,-.32]],.013);
 path(air,'ecu',[[-2.45,3.2,-.35],[-1.35,3.8,-.85],[0,4.82,0]],.013);
 // Oil pressure gallery and gravity drains. Pump internals are deliberately
 // closed, so no invented gears are presented as a 4A-GE pump reconstruction.
 const oil=g(fluids),water=g(fluids);box(oil,'oil',[2.3,.20,1.8],[0,-1.02,0]);
 for(const x of [-1.1,1.1])box(oil,'oil',[.08,.48,1.8],[x,-.79,0]);
 ring(oil,'pump',.32,.095,[0,0,1.05]);cyl(oil,'oil',.21,.60,[1.65,.0,1.05]);
 const oilRoutes=[];
 const oilRoute=(pts)=>{const r=trace(path(oil,'oil',pts,.055),'oil');oilRoutes.push(r);return r;};
 oilRoute([[-.7,-.91,.6],[-.7,-.5,1.05],[0,-.32,1.05]]);
 oilRoute([[.32,0,1.05],[.8,.2,1.05],[1.65,.30,1.05]]);
 oilRoute([[1.65,-.30,1.05],[1.45,.9,-.65],[-1.22,1.0,-.65]]);
 for(const z of [-.65,.65])oilRoute([[-1.22,1,-.65],[-1.22,.4,z],[-.168,0,z]]);
 oilRoute([[-1.22,1,-.65],[-1.3,3,-.85],[-1.3,5.72,-.82],[M.valves[0].center[0]-.084,M.valves[0].center[1],-.82]]);
 oilRoute([[-1.3,5.72,-.82],[0,6.1,-.9],[M.valves[1].center[0]-.084,M.valves[1].center[1],-.82]]);
 oilRoute([[M.valves[1].center[0],5.58,-.82],[1.25,4,-.9],[1.25,1,-.9],[.7,-.91,-.6]]);
 oilRoute([[-.25,-.2,.65],[-.4,-.6,.65],[-.7,-.91,.6]]);
 const oilFilms=[];for(const z of [-.65,.65])oilFilms.push(ring(oil,'oil',.168,.004,[0,0,z]));for(const v of M.valves)oilFilms.push(ring(oil,'oil',.083,.002,[v.center[0],v.center[1],-.82]));oilFilms.forEach(m=>{m.material.emissive.set(0xe8b448);m.material.emissiveIntensity=.7;});
 // Independent coolant circuit: jacket -> radiator OR bypass -> inlet
 // thermostat mixing chamber -> pump -> jacket. No coolant enters the bore.
 const wp=g(water,1.7,1.4,1.85),rotor=g(wp);ring(wp,'pump',.24,.055,[0,0,0]);cyl(rotor,'pump',.07,.42,[0,0,0],'z');
 for(let i=0;i<6;i++){const arm=g(rotor);arm.rotation.z=i*M.TAU/6;box(arm,'pump',[.035,.14,.07],[0,.12,0]);}
 const accessory=g(water),drive=g(accessory,0,0,1.85);cyl(drive,'pump',.24,.06,[0,0,0],'z');cyl(drive,'pump',.11,.72,[0,0,-.12],'z');
 const pumpPulley=cyl(rotor,'pump',.24,.04,[0,0,.18],'z');
 // Equal-radius two-pulley accessory belt: circular arcs and exact tangents.
 const dx=1.7,dy=1.4,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len,a0=Math.atan2(ny,nx),r=.24;
 const beltPoints=[];for(let i=0;i<=40;i++){const a=a0+Math.PI+i*Math.PI/40;beltPoints.push([r*Math.cos(a),r*Math.sin(a),2.03]);}for(let i=0;i<=40;i++){const a=a0+i*Math.PI/40;beltPoints.push([dx+r*Math.cos(a),dy+r*Math.sin(a),2.03]);}beltPoints.push(beltPoints[0]);
 const beltLine=new T.CurvePath();for(let i=1;i<beltPoints.length;i++)beltLine.add(new T.LineCurve3(new T.Vector3(...beltPoints[i-1]),new T.Vector3(...beltPoints[i])));mesh(new T.TubeGeometry(beltLine,170,.018,6,false),accessory,'pump');
 // Crank pulley face is brought into the same axial plane as its pump mate.
 drive.children[0].position.z=.18;
 const waterRoutes=[],waterRoute=(id,pts,gate=()=>1)=>{const route=trace(path(water,'coolant',pts,.065),'coolant',gate);route.id=id;waterRoutes.push(route);return route;};
 waterRoute('pump-jacket',[[1.7,1.64,1.85],[1.4,1.8,.7],[.95,1.7,0]]);
 waterRoute('jacket',[[.95,1.7,0],[.65,2.2,-.7],[0,2.9,-.95],[-.65,3.5,-.7],[-.95,4.1,0],[-.6,4.35,-.7],[1.3,4.3,-.65]]);
 const jacket=mesh(new T.CylinderGeometry(.96,.96,2.62,48,1,true,Math.PI/2,Math.PI),water,'coolant');jacket.position.y=2.9;jacket.material.transparent=true;jacket.material.opacity=.1;jacket.material.depthWrite=false;
 box(water,'radiator',[.64,.17,.20],[3.05,4.3,-.65]);box(water,'radiator',[.64,.17,.20],[3.05,1,-.65]);
 for(let i=0;i<6;i++)box(water,'radiator',[.045,3.3,.12],[2.8+i*.1,2.65,-.65]);for(let i=0;i<15;i++)box(water,'radiator',[.64,.025,.23],[3.05,1.1+i*.22,-.65]);
 waterRoute('hot-radiator',[[1.3,4.3,-.65],[2.2,4.5,-.65],[3.05,4.3,-.65]],s=>s.cool.radiator);
 waterRoute('radiator',[[3.05,4.3,-.65],[3.05,1,-.65]],s=>s.cool.radiator);
 waterRoute('radiator-inlet',[[3.05,1,-.65],[3.25,.65,.7],[2.6,.9,1.85],[2.6,1.3,1.85]],s=>s.cool.radiator);
 waterRoute('bypass',[[1.3,4.3,-.65],[2.25,3.8,.7],[2.6,2.5,1.85],[2.6,2.05,1.85]],s=>s.cool.bypass);
 waterRoute('mixed-pump',[[2.6,1.58,1.85],[2.1,1.4,1.85],[1.94,1.4,1.85]]);
 const therm=g(water,2.6,1.3,1.85),poppets=g(therm);ring(therm,'thermostat',.17,.028,[0,0,0],'y');ring(therm,'thermostat',.12,.024,[0,.75,0],'y');
 const mainValve=cyl(poppets,'thermostat',.19,.025,[0,.0405,0]),byValve=cyl(poppets,'thermostat',.135,.025,[0,.4935,0]);cyl(poppets,'thermostat',.024,.453,[0,.267,0]);cyl(therm,'thermostat',.065,.30,[0,-.17,0]);
 cyl(poppets,'thermostat',.025,.40,[0,-.14,0]);
 for(const x of [-.22,.22])box(therm,'thermostat',[.027,.84,.027],[x,.36,0]);box(therm,'thermostat',[.47,.03,.06],[0,.78,0]);
 // Pump / thermostat connections through the open, sectioned chamber.
 const chamber=mesh(new T.CylinderGeometry(.245,.245,.80,32,1,true),therm,'thermostat');chamber.position.y=.37;chamber.material.transparent=true;chamber.material.opacity=.10;chamber.material.depthWrite=false;
 const mainPass=waterRoute('main-valve',[[2.6,1.3,1.85],[2.6,1.40,2.055],[2.6,1.58,1.85]],s=>s.cool.radiator);
 waterRoute('bypass-valve',[[2.6,2.05,1.85],[2.6,1.98,2.015],[2.6,1.58,1.85]],s=>s.cool.bypass);
 let chapter=0,settings={pedal:35,advance:8,ignition:true,temperature:60,circuit:'both',fluidFocus:'both'},degrees=90;
 function setChapter(n){chapter=n;engine.root.visible=n!==3;bankRoot.visible=n===3;air.visible=n===1||n===4;fluids.visible=n===5;}
 function setSettings(s){Object.assign(settings,s);oil.visible=settings.circuit!=='coolant';water.visible=settings.circuit!=='oil';engine.setOperating(chapter>=1?settings:null);units.forEach(u=>u.setOperating(settings));}
 function update(d){degrees=d;const op=M.operation(d,settings.pedal,settings.advance,settings.ignition),state={...op,cool:M.cooling(settings.temperature)};
  if(chapter===3)units.forEach((u,i)=>u.update(d+M.bank[i].offset));plate.rotation.z=op.opening;
  needles.forEach(n=>n.position.y=.04-(op.injection?.045:0));sprays.forEach(({route,beads})=>beads.forEach((b,i)=>{b.visible=op.injection;b.position.copy(route.curve.getPoint(M.mod(d/40+i/beads.length,1)));}));
  jacket.material.opacity=settings.fluidFocus==='coolant'?.30:.15;jacket.material.emissive.set(settings.fluidFocus==='coolant'?0x297e78:0);jacket.material.emissiveIntensity=.25;oilFilms.forEach(m=>{m.material.emissive.set(0xe8b448);m.material.emissiveIntensity=settings.fluidFocus==='oil'?1.6:.7;});
  rotor.rotation.z=drive.rotation.z=-M.rad(d);poppets.position.y=state.cool.lift;
  traces.forEach(t=>{const flow=t.gate(state);t.route.mesh.material.opacity=flow>0?.22:.055;t.beads.forEach((b,i)=>{b.visible=flow>.001&&i<Math.ceil(flow*t.beads.length);b.position.copy(t.route.curve.getPoint(M.mod(d/220+i/t.beads.length,1)));});});
 }
 function select(key){units.forEach(u=>u.select(key));items.forEach(m=>{m.material.emissive.set(m.userData.part===key?0x53b9ac:0);m.material.emissiveIntensity=m.userData.part===key?.55:0;});}
 const point=(o,a)=>{root.updateWorldMatrix(true,true);return root.worldToLocal(o.localToWorld(new T.Vector3(...a)));};
 function audit(){const cool=M.cooling(settings.temperature);return {chapter,degrees,settings:{...settings},units:chapter===3?units.map((u,i)=>({number:i+1,z:u.root.position.z,offset:M.bank[i].offset,measurement:u.audit()})):[],airVisible:air.visible,oilContacts:oilFilms.map(m=>({center:point(m,[0,0,0]).toArray(),radius:m.geometry.parameters.radius,tube:m.geometry.parameters.tube})),jacket:{radius:.96,linerOuterRadius:.84,visible:water.visible},throttleAngle:plate.rotation.z,throttleScale:plate.scale.toArray(),needleTravel:needles.map(n=>n.position.y),thermostat:{lift:poppets.position.y,discDistance:point(mainValve,[0,0,0]).distanceTo(point(byValve,[0,0,0])),radiator:cool.radiator,bypass:cool.bypass},waterEndpoints:waterRoutes.map(r=>({id:r.id,start:r.curve.getPoint(0).toArray(),end:r.curve.getPoint(1).toArray()})),tracers:traces.map(t=>({key:t.key,id:t.route.id||'',visible:t.beads.filter(b=>b.visible).length,point:t.beads[0].position.toArray()})),pumpAngle:rotor.rotation.z,driveAngle:drive.rotation.z};}
 setChapter(0);setSettings({});update(90);
 return {root,pickable,setChapter,setSettings,update,select,audit,setBelt(v){units[0].setBelt(v);}};
};
