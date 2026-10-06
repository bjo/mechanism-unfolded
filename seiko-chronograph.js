/* One shared 6139A teaching assembly for mounted and inspection views. */
window.createSeikoChronograph=function(T,scene,root,H,hooks){
 const K=SeikoChronograph,{at,disc,ring,bar,gear,needle,text,mesh,C}=H,$=id=>document.getElementById(id),ctrl=new K.Controller();
 const body=at(root,0,0,2.05);body.scale.setScalar(.95);
 const input=at(body,0,0),fourth=gear(40,.54,input,C.green,-.16),inputTube=ring(.105,.070,input,C.green,-3.5,3.5);
 const frictionSeat=ring(.28,.070,input,C.green,-.09,.16);
 const output=at(body,0,0),clutch=ring(.47,.035,output,C.red,.07,.075);
 const clutchSpring=mesh(new T.BufferGeometry(),output,C.gold),springCollar=ring(.075,.035,output,C.red,.31,.025);
 // A spring disc is shown as a thin dished annulus; the ring translates axially.
 const shaft=disc(.035,4.20,output,C.red,-1.50),secondsHand=needle(output,2.2,C.red,-3.60,.025);secondsHand.rotation.x=Math.PI;
 const minute=at(body,...K.minuteCenter),minuteWheel=gear(30,.60,minute,C.gold,-.25),minuteShaft=disc(.032,4.30,minute,C.gold,-1.55),minuteHand=needle(minute,.42,C.gold,-3.70,.022);minuteHand.rotation.x=Math.PI;
 const intermediate=at(body,...K.idler),intermediateWheel=gear(10,.20,intermediate,C.blue,-.25),intermediateArbor=disc(.037,.68,intermediate,C.steel,-.12);
 const star=at(intermediate,0,0,-.48),starShape=new T.Shape();
 K.starPoints.forEach(([x,y],i)=>i?starShape.lineTo(x,y):starShape.moveTo(x,y));starShape.closePath();mesh(new T.ExtrudeGeometry(starShape,{depth:.045,bevelEnabled:false}),star,C.blue);
 const finger=at(output,0,0,-.48),fingerAngle=Math.atan2(K.idler[1],K.idler[0])+K.minuteIndex.end;
 finger.rotation.z=fingerAngle;const reach=K.minuteIndex.radius?Math.hypot(...K.idler)-.25:.5;
 const fingerLeaf=mesh(new T.BufferGeometry(),finger,C.blue);disc(.055,.62,output,C.red,-.15);
 const hearts=K.centers.map((c,i)=>{const g=at(i?minute:output,0,0,.45);g.rotation.z=K.faces[i].orientation;const s=new T.Shape();K.heart.forEach(([x,y],j)=>j?s.lineTo(x,y):s.moveTo(x,y));s.closePath();mesh(new T.ExtrudeGeometry(s,{depth:.065,bevelEnabled:false}),g,C.gold);return g;});
 const column=at(body,...K.column),ratchetShape=new T.Shape(),ratchetPoints=[];
 // Movement-side clockwise drive: steep driving flank, shallow return ramp.
 for(let i=0;i<12;i++)for(const [f,r] of [[0,.43],[.16,.35],[1,.43]]){const a=.1-(i+f)*K.step,p=[r*Math.cos(a),r*Math.sin(a)];ratchetPoints.push(p);i===0&&f===0?ratchetShape.moveTo(...p):ratchetShape.lineTo(...p);}
 ratchetShape.closePath();mesh(new T.ExtrudeGeometry(ratchetShape,{depth:.05,bevelEnabled:false}),column,C.gold).position.z=.70;
 for(let i=0;i<K.pillars;i++){const a=-Math.PI/2+i*K.tau/K.pillars;ring(K.outer,K.inner,column,C.blue,.85,.15,a-K.halfWidth,a+K.halfWidth);}disc(.08,.40,column,C.steel,.82);
 const first=at(body,...K.firstPivot,.87),second=at(body,...K.secondPivot,.12);
 const firstNose=[1.1,-.22],secondNose=[-1.1,.03];
 bar(0,0,...K.follower,.095,first,C.steel);bar(0,0,...firstNose,.08,first,C.steel);bar(0,0,...K.joint,.075,first,C.steel);
 const follower=disc(K.followerRadius,.09,first,C.red);follower.position.set(...K.follower,.0);
 // Both lifting shoes are rigid cam faces on their levers. A constant-height
 // floating bar cannot support a ring while the lever withdraws sideways.
 const shoePhases=64,shoeData=[];
 function shoe(lever,pivot,side){
  const positions=[],indices=[],samples=[];
  for(let i=0;i<=shoePhases;i++){
   const a=.15*i/shoePhases,pin=K.add(K.firstPivot,K.rotate(K.joint,a)),rest=K.add(K.firstPivot,K.joint);
   const angle=side>0?a:Math.atan2(pin[1]-K.secondPivot[1],pin[0]-K.secondPivot[0])-Math.atan2(rest[1]-K.secondPivot[1],rest[0]-K.secondPivot[0]);
   const z=.19-.12*i/shoePhases;
   for(let w=0;w<=8;w++){const x=-.10+w*.025,q=K.rotate(K.sub([x,side*Math.sqrt(.47*.47-x*x)],pivot),-angle);positions.push(q[0],q[1],z-lever.position.z,q[0],q[1],Math.min(.075,z-.025)-lever.position.z);}
   samples.push({angle,index:i*18+8,z});
   if(i)for(let w=0;w<8;w++){const j=i*18+w*2,k=j-18;indices.push(k,j,k+2,k+2,j,j+2,k+1,k+3,j+1,k+3,j+3,j+1);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const m=mesh(geometry,lever,C.blue);shoeData.push({mesh:m,samples,lever});return m;
 }
 const upperShoe=shoe(first,K.firstPivot,1),lowerShoe=shoe(second,K.secondPivot,-1);
 // Upright web joins the upper lever to its lower working face outside the ring.
 const shoePost=disc(.028,.72,first,C.steel,-.36);shoePost.position.set(1.1,-.13,-.36);
 bar(1.1,-.22,1.1,-.13,.06,first,C.steel);bar(1.1,-.13,1.1,-.22,.045,first,C.blue,-.73,.025);
 const jointPin=disc(.04,.86,first,C.gold,-.39);jointPin.position.x=K.joint[0];jointPin.position.y=K.joint[1];
 const joint0=K.sub(K.add(K.firstPivot,K.joint),K.secondPivot);
 const jointNormal=[-joint0[1],joint0[0]].map(v=>v/Math.hypot(...joint0)*.0775);
 bar(0,0,-.98,-.16,.085,second,C.steel);bar(-.98,-.16,-1.1,-.10,.085,second,C.steel);bar(...jointNormal,...K.add(joint0,jointNormal),.075,second,C.steel);
 bar(-1.1,-.10,-1.1,.03,.035,second,C.blue,-.045,.025);const lowerPost=disc(.026,.08,second,C.steel,-.025);lowerPost.position.set(-1.1,-.10,-.025);
 // The coupling pin bears on the second lever's long contact edge.
 for(const lever of [first,second])disc(.075,.15,lever,C.gold,0);
 const hammer=at(body,...K.hammerPivot,.45);disc(.07,.12,hammer,C.steel);
 const hammerFaces=[];K.faces.forEach(f=>{const p=K.sub(f.center,K.hammerPivot),t=[-f.normal[1],f.normal[0]],q=K.add(p,f.normal.map(v=>v*.05)),elbow=K.add(p,f.normal.map(v=>v*.38));bar(0,0,...elbow,.085,hammer,C.steel,.03,.07);bar(...elbow,...q,.085,hammer,C.steel,.03,.07);hammerFaces.push(bar(p[0]-t[0]*.38+f.normal[0]*.035,p[1]-t[1]*.38+f.normal[1]*.035,p[0]+t[0]*.38+f.normal[0]*.035,p[1]+t[1]*.38+f.normal[1]*.035,.07,hammer,C.steel,.03,.07));});
 bar(0,0,...K.hammerLug,.055,hammer,C.steel,.03,.07);const lockLug=disc(.03,.44,hammer,C.red,.22);lockLug.position.x=K.hammerLug[0];lockLug.position.y=K.hammerLug[1];
 const heel=disc(.035,.40,hammer,C.red,.20);heel.position.x=0;heel.position.y=.28;
 const resetPivot=[-.65,1.80],resetLever=at(body,...resetPivot,.65),resetLeverArm=bar(-.55,0,.92,0,.075,resetLever,C.steel);disc(.065,.12,resetLever,C.gold);
 const operatingPivot=[.95,1.55],operating=at(body,...operatingPivot,.70);bar(0,0,.45,0,.08,operating,C.steel);const operatingArm=bar(0,0,0,.48,.09,operating,C.steel);disc(.06,.14,operating,C.gold);
 const pawl=at(body,0,0,.70);bar(0,0,.65,0,.030,pawl,C.red);disc(.03,.07,pawl,C.gold);
 const detent=at(body,-.63,1.35,.70);bar(0,0,.30,0,.025,detent,C.green);disc(.028,.06,detent,C.green);
 const minuteJumper=at(body,-2.03,-.02,-.25);bar(0,0,.12,0,.025,minuteJumper,C.green);disc(.028,.08,minuteJumper,C.green);
 // Spring anchors belong to the fixed bridge; their working ends follow the
 // corresponding lever surface. Curves illustrate bending, not spring stress.
 const springs=[
  {lever:first,point:[.20,-.04],points:[[-1.55,.8],[-1.52,1.06],[-1.30,1.1]],z:.912},
  {lever:operating,point:[0,.25],points:[[.92,1.48],[1.15,1.42],[1.20,1.72]],z:.742},
  {lever:hammer,point:[.15,.095],points:[[-.86,.88],[-1.04,1.15],[-.94,1.3]],z:.527},
  {lever:detent,point:[.15,0],points:[[-.62,1.05],[-.68,1.25],[-.55,1.35]],z:.742}
 ];
 for(const s of springs){s.mesh=mesh(new T.BufferGeometry(),body,C.gold);const anchor=at(body,...s.points[0],s.z);disc(.028,.035,anchor,C.steel);}
 const support=at(body,0,0);ring(2.16,2.13,support,C.steel,-.70,.035);
 const supportLocations=[[...K.column,.70],[...K.firstPivot,.87],[...K.secondPivot,.12],[...K.hammerPivot,.45],[...operatingPivot,.70],[...resetPivot,.65],[-.63,1.35,.70],[-2.03,-.02,-.25],...springs.map(s=>[...s.points[0],s.z])];
 for(const [x,y,z] of supportLocations){const a=at(support,x,y),r=Math.hypot(x,y);disc(.022,z+.70,a,C.steel,(z-.70)/2);bar(x,y,x/r*2.145,y/r*2.145,.035,support,C.steel,-.682,.025);}
 const pushers=[at(body,.60,2.55,.70),at(body,-.65,2.34,.65)],pusherPads=[],pusherRods=[],pusherGuides=[];
 pushers.forEach((g,i)=>{pusherRods.push(bar(0,-.55,0,0,.06,g,C.steel));pusherPads.push(bar(-.13,-.55,.13,-.55,.04,g,C.steel));const cap=disc(.15,.22,g,C.steel);cap.rotation.x=0;g.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{chronoAction:i?'reset':'toggle',label:i?'리셋 푸셔 → 복귀 레버 → 회전 해머':'시작·정지 푸셔 → 작동 레버 → 컬럼 휠'});});});pushers[1].rotation.z=Math.PI/2;
 // Fixed guides identify the slider axes; the caps translate, never swivel.
 for(const [x,y,z,a] of [[.60,1.62,.70,Math.PI/2],[-.99,2.34,.65,0]]){const sleeve=ring(.085,.045,body,C.steel,0,.18);sleeve.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(Math.cos(a),Math.sin(a),0));sleeve.position.set(x,y,z);pusherGuides.push(sleeve);const sx=x+.09*Math.cos(a),sy=y+.09*Math.sin(a),mount=at(support,sx,sy);disc(.028,z+.615,mount,C.steel,(z-.785)/2);const r=Math.hypot(sx,sy);bar(sx,sy,sx/r*2.145,sy/r*2.145,.04,support,C.steel,-.682,.025);}
 const dial=at(body,0,0,-3.65);ring(2.45,2.41,dial,C.steel,0,.02);for(let i=0;i<12;i++){const a=i*K.tau/12;bar(2.26*Math.sin(a),2.26*Math.cos(a),2.39*Math.sin(a),2.39*Math.cos(a),.024,dial,C.steel);}
 const counterDial=at(dial,...K.minuteCenter);ring(.48,.46,counterDial,C.steel);text('30 MIN',counterDial,0,-.20,-.06,.48,.10).rotation.y=Math.PI;
 const sets=[[input],[column,first,second,operating,pawl],[minute,intermediate,finger],[hammer,resetLever,...hearts]];
 const names=['4번 휠과 수직 클러치','컬럼 휠과 두 결합 레버','손가락 · 중간 휠 · 30분 누적계','복귀 레버 · 회전 해머 · 두 하트캠'];
 sets.forEach((set,i)=>set.forEach(g=>g.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{advancedPart:'chronograph',focusIndex:i,label:names[i]});})));
 // Single topology, exact local-pose copy including all hands, shafts and pushers.
 const inspection=body.clone(true);scene.add(inspection);inspection.position.set(0,0,.8);inspection.scale.setScalar(1.1);
 const originals=[],copies=[];body.traverse(o=>originals.push(o));inspection.traverse(o=>copies.push(o));
 const targets=pushers.map((g,i)=>{const b=document.createElement('button');b.className='chrono-pusher-target';b.setAttribute('aria-label',i?'3D 리셋 푸셔':'3D 시작·정지 푸셔');b.title=i?'리셋 · 측정 중에는 잠김':'시작 / 정지';b.onclick=()=>i?ctrl.resetPress():ctrl.toggle(hooks.environment().charge>0&&hooks.environment().crown!==2);document.querySelector('.stage').append(b);return b;});
 mechanismAudit.mesh('6139 intermediate-minute',intermediateWheel,minuteWheel);
 let panel,explain,paused=false,detail='clutch';
 function renderedAudit(){
  body.updateWorldMatrix(true,true);
  function axial(o){let lo=Infinity,hi=-Infinity;o.traverse(m=>{if(!m.geometry)return;const v=m.geometry.attributes.position;for(let i=0;i<v.count;i++){const p=body.worldToLocal(m.localToWorld(new T.Vector3().fromBufferAttribute(v,i)));lo=Math.min(lo,p.z);hi=Math.max(hi,p.z);}});return [lo,hi];}
  const layers={finger:axial(fingerLeaf),transfer:axial(minuteWheel),hearts:axial(hearts[0])};
  const gaps=hearts.map((g,i)=>{const face=hammerFaces[i],p=face.localToWorld(new T.Vector3(0,.035,0)),normal=new T.Vector3(0,1,0).transformDirection(face.matrixWorld),cam=g.children[0],v=cam.geometry.attributes.position;let gap=Infinity;for(let j=0;j<v.count;j++)gap=Math.min(gap,cam.localToWorld(new T.Vector3().fromBufferAttribute(v,j)).sub(p).dot(normal));return gap/.95;});
  const fixedLengths=[hammer,first,second,pawl].map(g=>{const m=g.children.find(o=>o.geometry?.parameters?.width);return m?m.localToWorld(new T.Vector3(m.geometry.parameters.width/2,0,0)).distanceTo(m.localToWorld(new T.Vector3(-m.geometry.parameters.width/2,0,0)))/.95:0;});
  const points=o=>{const a=o.geometry.attributes.position,out=[];for(let i=0;i<a.count;i++)out.push(body.worldToLocal(o.localToWorld(new T.Vector3().fromBufferAttribute(a,i))));return out;};
  const outline=o=>{const w=o.geometry.parameters.width/2,h=o.geometry.parameters.height/2;return [[-w,-h],[w,-h],[w,h],[-w,h]].map(([x,y])=>{const p=body.worldToLocal(o.localToWorld(new T.Vector3(x,y,0)));return [p.x,p.y];});};
  const startPad=outline(pusherPads[0]),resetPad=outline(pusherPads[1]),startLever=outline(operatingArm),resetArm=outline(resetLeverArm);
  const startGap=Math.min(...startPad.map(p=>p[1]))-K.padSupport(startLever,1,Math.min(...startPad.map(p=>p[0])),Math.max(...startPad.map(p=>p[0])),1);
  const resetGap=K.padSupport(resetArm,0,Math.min(...resetPad.map(p=>p[1])),Math.max(...resetPad.map(p=>p[1])),-1)-Math.max(...resetPad.map(p=>p[0]));
  const heelPoint=body.worldToLocal(heel.localToWorld(new T.Vector3())),heelGap=K.polygonGap([heelPoint.x,heelPoint.y],resetArm)-.035;
  const springPoints=points(clutchSpring),springOuter=Math.min(...springPoints.filter(p=>Math.hypot(p.x,p.y)>.33).map(p=>p.z));
  const camContact=shoeData.map(s=>{const v=points(s.mesh),angle=s.lever.rotation.z;let i=0;while(i<s.samples.length-2&&s.samples[i+1].angle<angle)i++;const a=s.samples[i],b=s.samples[i+1],u=Math.max(0,Math.min(1,(angle-a.angle)/(b.angle-a.angle))),q=v[a.index].clone().lerp(v[b.index],u);const beneath=v.filter(p=>Math.hypot(p.x,p.y)<.470001&&Math.hypot(p.x,p.y)>.035);return {heightGap:q.z-clutch.position.z,radiusGap:Math.hypot(q.x,q.y)-.47,penetration:Math.max(...beneath.map(p=>p.z-clutch.position.z)),inputSeatClearance:Math.min(...v.filter(p=>p.z<.07).map(p=>Math.hypot(p.x,p.y)-.28))};});
  const arbor=axial(intermediateArbor),indexLayer=axial(star);
  const pusherAxes=pushers.map(g=>{const p=body.worldToLocal(g.localToWorld(new T.Vector3(0,1,0))),o=body.worldToLocal(g.localToWorld(new T.Vector3()));return p.sub(o).normalize();});
  const guides=pusherGuides.map((g,i)=>{const o=body.worldToLocal(g.localToWorld(new T.Vector3())),a=body.worldToLocal(g.localToWorld(new T.Vector3(0,0,1))).sub(o).normalize(),rod=points(pusherRods[i]).map(p=>p.dot(a)),bearing=points(g).map(p=>p.dot(a));return {alignment:Math.abs(a.dot(pusherAxes[i])),rodMargins:[Math.min(...bearing)-Math.min(...rod),Math.max(...rod)-Math.max(...bearing)],radialClearance:.045-Math.hypot(.03,.03)};});
  const connections={startPusherGap:startGap,resetPusherGap:resetGap,resetHeelGap:heelGap,indexArborOverlap:Math.min(arbor[1],indexLayer[1])-Math.max(arbor[0],indexLayer[0]),springRingGap:springOuter-(clutch.position.z+.075),camContact,guides,pusherAxes:pusherAxes.map(a=>a.toArray())};
  return {layers,heartGaps:gaps,fixedLengths,connections,forbiddenContacts:[{id:'finger-transfer',gap:layers.transfer[0]-layers.finger[1],minimum:.02},{id:'finger-heart',gap:layers.hearts[0]-layers.finger[1],minimum:.02}]};
 }
 function circleIntersection(p,r,q,s){const d=Math.hypot(...K.sub(q,p)),a=(r*r-s*s+d*d)/(2*d),h=Math.sqrt(Math.max(0,r*r-a*a)),v=K.sub(q,p).map(x=>x/d);return [p[0]+a*v[0]+h*v[1],p[1]+a*v[1]-h*v[0]];}
 function holdingPawl(angle){const polygon=ratchetPoints.map(p=>K.add(K.column,K.rotate(p,angle))),pivot=[-.63,1.35],candidates=[];
  for(let i=0;i<polygon.length;i++){const a=polygon[i],v=K.sub(polygon[(i+1)%polygon.length],a),d=K.sub(a,pivot),aa=K.dot(v,v),bb=2*K.dot(d,v),cc=K.dot(d,d)-.30**2,det=bb*bb-4*aa*cc;if(aa<1e-12||det<0)continue;
   for(const t of [(-bb+Math.sqrt(det))/(2*aa),(-bb-Math.sqrt(det))/(2*aa)])if(t>=0&&t<=1){const p=K.sub(K.add(a,v.map(x=>x*t)),pivot),direction=Math.atan2(p[1],p[0]);if(direction>=0)candidates.push(direction);}}
  return candidates.length?Math.min(...candidates):0;
 }
 function controlPose(p){
  const m=ctrl.motion,u=m?Math.min(1,Math.max(0,(m.t-.12)/.8)):0,back=m&&m.t>.92;
  const pressure=back?Math.max(0,(1.5-m.t)/.58):u,a=.1-K.step*pressure;
  const tip=K.add(K.column,[.43*Math.cos(a),.43*Math.sin(a)]),joint=circleIntersection(operatingPivot,.45,tip,.65);
  const angle=Math.atan2(joint[1]-operatingPivot[1],joint[0]-operatingPivot[0]);
  operating.rotation.z=angle;pawl.position.set(...joint,.70);pawl.rotation.z=Math.atan2(tip[1]-joint[1],tip[0]-joint[0])+(back?Math.sin((1-pressure)*Math.PI)*.20:0);
  const startPolygon=K.leverPolygon(operatingPivot,angle+Math.PI/2,0,.48,.09),startEdge=K.padSupport(startPolygon,1,.47,.73,1);pushers[0].position.set(.60,startEdge+.57,.70);
  const resetPose=K.resetLeverPose(p.hammer),heelPoint=resetPose.heel,ra=resetPose.angle;resetLever.rotation.z=ra;
  const resetPolygon=K.leverPolygon(resetPivot,ra,-.55,.92,.075),resetEdge=K.padSupport(resetPolygon,0,2.21,2.47,-1);pushers[1].position.set(resetEdge-.57,2.34,.65);
  return {pawlLength:Math.hypot(...K.sub(tip,joint)),resetContact:heelPoint,startPusher:pushers[0].position.toArray(),resetPusher:pushers[1].position.toArray(),startEdge,resetEdge,resetAngle:ra,startAngle:angle};
 }
 function attach(host){
  panel=host;explain=document.createElement('section');explain.className='chrono-explainer';host.append(explain);
  explain.innerHTML=`<h3>실제 구조를 따라: Seiko 6139A</h3><p>컬럼 휠 · 수직 클러치 · 30분 누적계. 정비 도면의 연결 관계를 재구성했습니다. 부품 크기와 간격은 관찰을 위해 확대했습니다.</p><div class="chrono-tabs"><button data-seiko="clutch" aria-pressed="true">① 시작·정지</button><button data-seiko="minute">② 분 넘김</button><button data-seiko="reset">③ 영점 복귀</button></div><output id="seikoPhase" aria-live="polite"></output><div id="seikoExplanation"></div><svg id="seikoSection" viewBox="0 0 620 210" role="img" aria-label="동축 수직 클러치 단면: 녹색 입력 휠과 빨간 클러치 링의 접촉"><path d="M310 35V190" stroke="#d45451" stroke-width="10"/><rect x="180" y="133" width="260" height="20" fill="#19896c"/><g id="seikoSectionRing"><path d="M190 121H430" stroke="#d45451" stroke-width="16"/></g><path id="seikoSectionSpring" d="M250 113L310 75L370 113" fill="none" stroke="#bc9148" stroke-width="4"/><path id="seikoSectionLevers" d="M95 113H200 M420 113H525" stroke="#168ab4" stroke-width="10"/><text x="15" y="35" font-size="17" fill="#254357">위: 스프링이 누름</text><text x="350" y="190" font-size="17" fill="#254357">아래: 계속 도는 4번 휠</text></svg><div class="chrono-actions"><button id="seikoResetDemo">1분 17초에서 리셋 관찰</button><button id="seikoPause">입력 동작 일시 정지</button><button id="seikoStep">입력 동작 한 단계</button></div><p><a href="https://seikoserviceusa.com/uploads/datasheets/6139A.pdf" target="_blank" rel="noopener noreferrer">Seiko 정비 안내서 · 인쇄면 3–10쪽, 그림 6–24 ↗</a></p><details><summary>이 모델의 범위와 실제 시계와의 차이</summary><p>6139A의 제어·클러치·리셋 연결을 기준으로 합니다. 기본 챕터의 시계 전체를 6139A로 복제한 것은 아닙니다. 기존 1분 회전축을 이 모듈의 입력으로 연결했습니다. 실제 6139A에는 별도의 일반 초침이 없으며, 이 사이트의 녹색 일반 초침은 입력과 측정 시간을 비교하는 교육용 표시입니다. 기둥 수·치수·축 간격·스프링 형상은 확대 모형의 설계값입니다. 파란 리프트 작동면과 회색 지지 프레임도 접촉·지지 관계를 드러내기 위한 재구성입니다. 두 푸셔는 고정된 가이드 안에서 직선으로만 움직입니다. 접촉 운동을 설명하는 모델이며 토크·탄성·공차를 계산하는 제작용 CAD는 아닙니다.</p></details>`;
  explain.querySelectorAll('[data-seiko]').forEach(b=>b.onclick=()=>{detail=b.dataset.seiko;explain.querySelectorAll('[data-seiko]').forEach(x=>x.setAttribute('aria-pressed',x===b));updateText();});
  $('seikoResetDemo').onclick=()=>{if(ctrl.running||ctrl.motion||ctrl.resetMotion)return;ctrl.column=0;ctrl.elapsed=77;ctrl.resetPress();paused=false;};
  $('seikoPause').onclick=()=>{paused=!paused;$('seikoPause').textContent=paused?'입력 동작 재개':'입력 동작 일시 정지';};$('seikoStep').onclick=()=>{paused=true;const before=ctrl.running;ctrl.tick(.08);if(!before&&ctrl.running)hooks.run();$('seikoPause').textContent='입력 동작 재개';};updateText();
 }
 function updateText(){if(!explain)return;$('seikoExplanation').textContent=({clutch:'시작 푸셔는 갈고리로 컬럼 휠 아래 래칫을 한 칸 돌립니다. 위의 기둥 사이로 첫 결합 레버의 접점이 들어가면 두 레버가 벌어집니다. 클러치 스프링이 링을 아래 4번 휠에 눌러 마찰로 회전을 전달합니다. 다시 누르면 기둥이 레버를 밀어 링을 들어 올립니다. 기어를 옆으로 이동시키는 수평 클러치와 다릅니다. 아래 단면에서 접촉·분리 간격을 보세요.',minute:'빨간 측정축의 손가락이 1분에 한 번 파란 중간 휠을 밀고, 중간 휠과 맞물린 금색 분 누적 휠이 30칸 중 한 칸 이동합니다. 초록 점퍼는 다음 칸에서 휠을 잡습니다. 손가락·별 모양 인덱스는 아래층, 전달 기어는 중간층, 하트캠과 해머는 위층이므로 관통하지 않습니다. 다이얼의 분 바늘은 금색 휠과 같은 축에 고정되어 있습니다.',reset:'정지 상태에서 두 번째 푸셔가 복귀 레버를 밀고, 그 레버가 해머의 뒤꿈치를 누릅니다. 하나의 해머가 고정된 축을 중심으로 회전하며 두 접촉면으로 초·분 하트캠을 누릅니다. 두 캠은 서로 다른 각도에서 출발해도 각각 영점 면에 안착합니다. 측정 중에는 컬럼의 기둥이 해머의 걸림부를 막으므로 리셋할 수 없습니다. 실제 분 넘김 손가락은 탄성 부품이어서 복귀 때 인덱스의 이를 넘어갈 수 있습니다.'})[detail];$('seikoSection').hidden=detail!=='clutch';}
 function tick(dt,env,visible,isolated){
  const before=ctrl.running;ctrl.tick(paused?0:dt);if(!before&&ctrl.running)hooks.run();const p=ctrl.pose();
  input.rotation.z=env.seconds/60*K.tau;output.rotation.z=p.hearts[0].angle;minute.rotation.z=p.hearts[1].angle;
  clutch.position.z=.07+p.coupling.lift;
  if(clutchSpring.userData.lift!==p.coupling.lift){
   clutchSpring.userData.lift=p.coupling.lift;const profile=[new T.Vector2(.045,.31),new T.Vector2(.34,clutch.position.z+.075),new T.Vector2(.34,clutch.position.z+.093),new T.Vector2(.045,.328)];
   clutchSpring.geometry.dispose();clutchSpring.geometry=new T.LatheGeometry(profile,64);clutchSpring.rotation.x=Math.PI/2;
  }
  column.rotation.z=p.column;first.rotation.z=p.coupling.first;second.rotation.z=p.coupling.second;hammer.rotation.z=p.hammer;
  const gearLine=Math.atan2(K.minuteCenter[1]-K.idler[1],K.minuteCenter[0]-K.idler[0]);intermediate.rotation.z=-p.hearts[1].angle*3+Math.PI/10;minuteWheel.rotation.z=(40*gearLine+28*Math.PI)/30;star.rotation.z=Math.atan2(-K.idler[1],-K.idler[0]);
  // Spring finger clears a returning index tooth by bending in-plane, never by
  // changing the length or moving the entire finger to another working level.
  finger.rotation.z=fingerAngle;const leaf=p.resetting?K.resetLeaf(p.hearts[0].angle,p.hearts[1].angle):{bend:0,gap:null,points:K.leafPoints(0)};
  if(fingerLeaf.userData.bend!==leaf.bend){fingerLeaf.userData.bend=leaf.bend;const leafPoints=leaf.points.map(([x,y])=>new T.Vector3(x,y,.025));fingerLeaf.geometry.dispose();fingerLeaf.geometry=new T.TubeGeometry(new T.CatmullRomCurve3(leafPoints),24,.012,4,false);}
  minuteJumper.rotation.z=.14*Math.sin(p.minute.progress*Math.PI);detent.rotation.z=holdingPawl(p.column);
  const control=controlPose(p);body.visible=visible&&!isolated;inspection.visible=visible&&isolated;
  for(const s of springs){if(s.angle===s.lever.rotation.z)continue;s.angle=s.lever.rotation.z;const end=K.add([s.lever.position.x,s.lever.position.y],K.rotate(s.point,s.angle)),points=[...s.points,end].map(([x,y])=>new T.Vector3(x,y,s.z));s.mesh.geometry.dispose();s.mesh.geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.012,6,false);s.end=points.at(-1);}
  const controlsOnly=!!$('chronoControlOnly')?.checked;dial.visible=(isolated||!!$('chronoXray')?.checked)&&!controlsOnly;for(const o of [inputTube,shaft,minuteShaft,secondsHand,minuteHand])o.visible=!controlsOnly;
  for(let i=1;i<originals.length;i++){const a=originals[i],b=copies[i];b.position.copy(a.position);b.quaternion.copy(a.quaternion);b.scale.copy(a.scale);b.visible=a.visible;if(a.isMesh){b.geometry=a.geometry;b.material=a.material;b.userData={...a.userData};}}
  pushers.forEach((g,i)=>{const o=isolated?copies[originals.indexOf(g)]:g,pt=hooks.project(o),b=targets[i];b.hidden=!visible||!pt.visible;b.style.left=pt.x+'px';b.style.top=pt.y+'px';});
  if(explain){explain.hidden=!visible;$('seikoPhase').textContent=p.phase;$('seikoSectionRing').setAttribute('transform',`translate(0 ${-p.coupling.lift*240})`);$('seikoSectionSpring').setAttribute('d',`M250 ${113-p.coupling.lift*240}L310 75L370 ${113-p.coupling.lift*240}`);$('seikoSectionLevers').setAttribute('d',`M95 ${129-p.coupling.lift*240}H${200-25*p.coupling.first/.15} M${420+25*p.coupling.first/.15} ${129-p.coupling.lift*240}H525`);$('seikoResetDemo').disabled=ctrl.running||!!ctrl.motion||!!ctrl.resetMotion;}
  if(panel){const audit=mechanismAudit.enabled?renderedAudit():{},out={baseline:'Seiko 6139A',...p,...audit,leaf:{bend:leaf.bend,gap:leaf.gap},control,copyErrors:mechanismAudit.enabled?mechanismAudit.copies([['6139 mounted/inspection',originals,copies,1]]):[],rigidScales:[hammer,first,second,pawl].map(o=>o.scale.toArray()),shaftAngles:[output.rotation.z,minute.rotation.z],isolated};panel.dataset.chrono=JSON.stringify(out);if(audit.forbiddenContacts)panel.dataset.forbiddenContacts=JSON.stringify(audit.forbiddenContacts);}
  return p;
 }
 return {ctrl,parts:sets,names,attach,tick,press(action){return action==='toggle'?ctrl.toggle(hooks.environment().charge>0&&hooks.environment().crown!==2):ctrl.resetPress();},advance:dt=>ctrl.advance(dt),reset:()=>{ctrl.reset();paused=false;},get elapsed(){return ctrl.elapsed;},get running(){return ctrl.running;}};
};
