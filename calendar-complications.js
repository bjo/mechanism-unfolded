/* GMT and conventional 59-tooth moon-phase teaching modules. */
window.createCalendarComplications=function(T,root,face,views,H,hooks){
 const {at,gear,disc,ring,bar,needle,text,mesh,C}=H,M=CalendarMechanics,tau=M.TAU,$=id=>document.getElementById(id),purple=0x8966c2;
 const dayCounter=M.createDayCounter();
 let gmtOffset=0,moonOffset=0,lastTotal=0,moonShown=0,adjustPulse=0,gmtShown=0,pendingCorrection=null;
 const gmt=at(root,0,0,-.25);gmt.rotation.x=Math.PI;
 const gi=gear(24,.30,gmt,C.blue),relayAxis=at(gmt,.60,0),gr=gear(24,.30,relayAxis,C.gold),gp=gear(12,.20,relayAxis,C.gold,.18),go=gear(24,.40,gmt,purple,.18);
 disc(.05,.30,relayAxis,C.steel,.12);const gmtTube=ring(.145,.112,gmt,purple,.18,1.01);
 // Indexed collar can turn relative to its driven gear while setting the GMT offset.
 const collar=at(gmt,0,0,.32);ring(.23,.16,collar,purple,0,.04);for(let i=0;i<24;i++){const a=i*tau/24;bar(.23*Math.cos(a),.23*Math.sin(a),.26*Math.cos(a),.26*Math.sin(a),.018,collar,purple);}
 const click=at(gmt,.35,-.20,.40);bar(0,0,-.14,.06,.026,click,C.steel);
 const gmtDisplay=at(face,0,0,.49),gh=needle(gmtDisplay,2.12,purple,0,.035);const tip=new T.Shape();tip.moveTo(0,2.34);tip.lineTo(-.12,2.05);tip.lineTo(.12,2.05);tip.closePath();mesh(new T.ExtrudeGeometry(tip,{depth:.02,bevelEnabled:false}),gh,purple);
 for(let i=0;i<24;i++){const a=i*tau/24;bar(2.34*Math.sin(a),2.34*Math.cos(a),2.43*Math.sin(a),2.43*Math.cos(a),.018,gmtDisplay,purple,-.16,.015);if(i%3===0)text(String(i||24),gmtDisplay,2.24*Math.sin(a),2.24*Math.cos(a),-.13,.23,.15);}
 const moon=at(root,0,0,-.50);moon.rotation.x=Math.PI;
 const mi=gear(24,.30,moon,C.blue),dayAxis=at(moon,-.90,0),md=gear(48,.60,dayAxis,C.gold),fingerCarrier=at(md,0,0),finger=bar(0,0,0,-.65,.05,fingerCarrier,C.red,.16),moonAxis=at(moon,-.90,-1.50),mw=gear(59,.85,moonAxis,C.gold,.16);
 const moonShaft=disc(.055,.43,moonAxis,C.steel,.375);const jumper=at(moon,-1.84,-1.55,.19);bar(0,0,.12,.05,.028,jumper,C.green);
 const moonDisplay=at(face,-.90,-1.50,.14),sky=at(moonDisplay,0,0);disc(.84,.035,sky,0x263855);
 for(const x of [-.48,.48]){const m=disc(.285,.025,sky,0xe8c985,.04);m.position.x=x;}
 const maskShape=new T.Shape();maskShape.absarc(0,0,.94,0,tau,false);const aperture=new T.Path();aperture.moveTo(-.82,0);aperture.absarc(0,0,.82,Math.PI,0,true);aperture.lineTo(.805,0);aperture.absarc(.48,0,.325,0,Math.PI,false);aperture.lineTo(-.155,0);aperture.absarc(-.48,0,.325,0,Math.PI,false);aperture.closePath();maskShape.holes.push(aperture);
 const mask=mesh(new T.ExtrudeGeometry(maskShape,{depth:.025,bevelEnabled:false}),moonDisplay,C.pale);mask.position.z=.08;
 text('MOON PHASE',moonDisplay,0,-.36,.12,1.10,.12);
 // Crown-driven correction trains share the real selector arbor at (2, 0).
 // An eccentric finger indexes the output instead of back-driving the going train.
 const correctionTrains={};
 for(const [key,x,y,r,n] of [['gmt',0,0,.24,24],['moon',-.90,1.50,.85,59]]){
  const g=at(root,0,0,-.90),end=[x+r+.21,y],distance=Math.hypot(end[0]-2,end[1]),pitch=distance/6,phi=Math.atan2(end[1],end[0]-2),gears=[];
  for(let i=0;i<4;i++){const a=at(g,2+(end[0]-2)*i/3,end[1]*i/3);gears.push(gear(20,pitch,a,C.blue));disc(.035,.12,a,C.steel,-.02);}
  const cam=at(g,...end,.12);disc(.08,.055,cam,C.red);const pawl=bar(0,0,-.23,0,.045,cam,C.red,.04,.04);
  const target=at(g,x,y,.16),index=gear(n,r,target,key==='gmt'?purple:C.gold);disc(.04,key==='gmt'?.34:.24,target,C.steel,.10);
  const detent=at(g,x-r-.10,y,.20);bar(0,.13,.10,0,.028,detent,C.green);
  g.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{advancedPart:key,focusIndex:2,label:'용두 보정 · 전달 기어 → 편심 핑거 → '+(key==='gmt'?'24칸 GMT 조정 휠':'59칸 달판 조정 휠')});});
  const copy=g.clone(true);views[key].add(copy);const a=[],b=[];g.traverse(o=>a.push(o));copy.traverse(o=>b.push(o));correctionTrains[key]={g,gears,cam,pawl,index,detent,phi,a,b};
 }
 for(const [id,a,b] of [['GMT input-relay',gi,gr],['GMT relay-output',gp,go],['moon hour-day',mi,md]])mechanismAudit.mesh(id,a,b);for(const [key,q] of Object.entries(correctionTrains))for(let i=1;i<q.gears.length;i++)mechanismAudit.mesh(key+' correction '+i,q.gears[i-1],q.gears[i]);
 const models={gmt,moon},displays={gmt:gmtDisplay,moon:moonDisplay},pairs={};
 for(const key of ['gmt','moon']){const container=views[key],a=[],b=[],model=models[key],modelCopy=model.clone(true);container.add(modelCopy);model.traverse(o=>a.push(o));modelCopy.traverse(o=>b.push(o));const dial=at(container,0,0);dial.rotation.x=Math.PI;const displayCopy=displays[key].clone(true);dial.add(displayCopy);displays[key].traverse(o=>a.push(o));displayCopy.traverse(o=>b.push(o));ring(2.8,2.78,dial,C.steel,0,.015);pairs[key]={a,b,dial};}
 const parts={gmt:[[gi],[gr,gp,go],[collar,click],[gmtDisplay]],moon:[[mi,md],[finger,mw,jumper],[moonDisplay],[moonDisplay]]};
 for(const [key,sets] of Object.entries(parts))sets.forEach((set,i)=>set.forEach(g=>g.traverse(m=>{if(m.isMesh)Object.assign(m.userData,{advancedPart:key,focusIndex:i,label:key==='gmt'?['시침 관 · 12시간 입력','24시간 감속 기어','GMT 독립 조정 칼라','24시간 GMT 바늘'][i]:['시침 → 하루 구동 휠','핑거 → 59치 휠과 점퍼','두 개의 달과 표시창','29.5일 근사 주기'][i]});})));
 function controls(mode){return mode==='gmt'?'<button id="gmtHour">시계 12시간 진행</button><button id="gmtMinus">GMT −1시간</button><button id="gmtPlus">GMT +1시간</button><button id="gmtZero">시차 0으로</button><button id="calendarStop">시간 진행 멈추기</button><label><input type="checkbox" id="calendarXray"> 기어 연결 투시</label><output id="gmtReadout"></output>':'<button id="moonDay">시계 하루 진행</button><button id="moonWeek">시계 7일 진행</button><button id="moonCorrect">달판 한 칸 조정</button><button id="moonNew">신월 기준 맞추기</button><button id="moonFull">보름달 예제</button><label><input type="checkbox" id="moonOpen"> 표시창 덮개 열기</label><button id="calendarStop">시간 진행 멈추기</button><label><input type="checkbox" id="calendarXray"> 기어 연결 투시</label><output id="moonReadout"></output>';}
 function bind(mode){if($('calendarStop'))$('calendarStop').onclick=()=>hooks.stopDemo();if(mode==='gmt'){$('gmtHour').onclick=()=>hooks.advanceHours(12);$('gmtPlus').onclick=()=>{hooks.crown(1);hooks.turnCrown(1);};$('gmtMinus').onclick=()=>{hooks.crown(1);hooks.turnCrown(-1);};$('gmtZero').onclick=()=>{gmtOffset=0;adjustPulse=1;};}if(mode==='moon'){$('moonDay').onclick=()=>hooks.advanceHours(24);$('moonWeek').onclick=()=>hooks.advanceHours(168);$('moonCorrect').onclick=()=>{hooks.crown(1);hooks.turnCrown(1);};$('moonNew').onclick=()=>{moonOffset=-dayCounter.value;};$('moonFull').onclick=()=>{moonOffset=15-dayCounter.value;};}}
 function tick(dt,env,mode,isolated,chapter){lastTotal=env.seconds+env.offset;dayCounter.observe(lastTotal);
 const progress=env.correctionProgress||0,engagement=Math.max(0,Math.min(1,(progress-.35)/.30));
 if(pendingCorrection){if(mode!==pendingCorrection.mode||env.crownPosition!==1)pendingCorrection=null;else {const q=pendingCorrection;if(mode==='gmt'){gmtShown=q.from+q.direction*engagement;if(progress>=.65){gmtOffset=q.from+q.direction;pendingCorrection=null;}}else{moonShown=dayCounter.value+q.from+engagement;if(progress>=.65){moonOffset=q.from+1;pendingCorrection=null;}}}}
 if(!pendingCorrection)gmtShown+=(gmtOffset-gmtShown)*Math.min(1,dt*12);
adjustPulse=Math.max(0,adjustPulse-dt*2);const a=-lastTotal/43200*tau;gi.rotation.z=mi.rotation.z=a;gr.rotation.z=-a-Math.PI/24;gp.rotation.z=gr.rotation.z;go.rotation.z=a/2+Math.PI/16;collar.rotation.z=gh.rotation.z=M.gmtAngle(lastTotal,gmtShown);click.rotation.z=adjustPulse*Math.sin(adjustPulse*Math.PI)*.3;collar.position.z=.32+adjustPulse*.09;
 md.rotation.z=-a/2+(72*Math.PI+47*Math.PI)/48;fingerCarrier.rotation.z=-(72*Math.PI+47*Math.PI)/48+M.moonIndexing.end;const days=dayCounter.value+moonOffset;const moonPose=M.moonIndexing.pose(lastTotal,days);if(!pendingCorrection)moonShown=moonPose.turns;mw.rotation.z=Math.PI/2+Math.PI/59-.015+M.moonAngle(moonShown);sky.rotation.z=M.moonAngle(moonShown);jumper.rotation.z=Math.sin(Math.min(1,Math.abs(days-moonShown))*Math.PI)*.12;mask.visible=!$('moonOpen')?.checked;
 gmt.visible=gmtDisplay.visible=mode==='gmt';moon.visible=moonDisplay.visible=mode==='moon';
 // Show only the selected complication; each still attaches to the same base movement.
 gmt.position.z=-.25-env.explosion*1.3;moon.position.z=-.50-env.explosion*1.3;gmtTube.scale.z=(gmt.position.z-face.position.z+.49-.18)/1.01;const moonEnd=moon.position.z-face.position.z+.14;moonShaft.scale.y=(moonEnd-.16)/.43;moonShaft.position.z=(moonEnd+.16)/2;
 for(const [key,q] of Object.entries(correctionTrains)){
  q.g.visible=mode===key&&env.crownPosition===1;q.g.position.z=-.90-env.explosion*1.3;
  const input=-env.dateInputAngle*2/3;
  q.gears.forEach((g,i)=>g.rotation.z=(i%2?-input:input)+(i%2?(40*q.phi+19*Math.PI)/20:0));
  q.cam.rotation.z=-input+Math.PI;q.pawl.position.z=env.correctionDirection<0&&key==='moon'?.16:.04;
  q.index.rotation.z=key==='gmt'?-gh.rotation.z:-sky.rotation.z;q.detent.rotation.z=env.correctionBusy?Math.sin(engagement*Math.PI)*.16:0;
  for(let i=0;i<q.a.length;i++){const a=q.a[i],b=q.b[i];b.position.copy(a.position);b.quaternion.copy(a.quaternion);b.visible=a.visible;if(a.isMesh)b.material=a.material;}
 }
 for(const key of ['gmt','moon']){const p=pairs[key];p.dial.position.copy(face.position);for(let i=0;i<p.a.length;i++){const s=p.a[i],c=p.b[i];c.position.copy(s.position);c.quaternion.copy(s.quaternion);c.scale.copy(s.scale);c.visible=s.visible;if(s.isMesh){c.material=s.material;c.userData={...s.userData};}}}
 if($('gmtReadout'))$('gmtReadout').textContent=`현지 ${String(Math.floor(M.mod((lastTotal+1e-6)/3600,24))).padStart(2,'0')}시 · GMT 바늘 ${String(Math.floor(M.mod((lastTotal+1e-6)/3600+gmtOffset,24))).padStart(2,'0')}시 · 시차 ${gmtOffset>=0?'+':''}${gmtOffset}시간`;
 if($('moonReadout'))$('moonReadout').textContent=`모델 월령 ${M.moonAge(days).toFixed(1)}일 / 29.5일 · 달판 ${M.mod(days,59)+1} / 59칸 · 실제 오늘의 달이 아닌 교육용 기준`;
 if($('calendarStop'))$('calendarStop').disabled=hooks.environment().demoRemaining<=0;
 for(const id of ['gmtHour','moonDay','moonWeek'])if($(id))$(id).disabled=hooks.environment().demoRemaining>0;
 const host=$('advancedPanel');if(host&&mechanismAudit.enabled)host.dataset.calendarCopies=JSON.stringify(mechanismAudit.copies(Object.entries(pairs).map(([key,p])=>[key+' inspection',p.a,p.b])));if(host)host.dataset.calendar=JSON.stringify({mode,total:lastTotal,gmtOffset,correctionProgress:progress,correctionEngagement:engagement,correctionVisible:correctionTrains[mode]?.g.visible,correctionGearAngles:correctionTrains[mode]?.gears.map(g=>g.rotation.z),gmtAngle:gh.rotation.z,moonDays:days,moonEngaged:moonPose.engaged,moonProgress:moonPose.progress,moonAngle:sky.rotation.z});
 }
 return {controls,bind,tick,parts,correct(mode,direction){if(mode==='gmt'||mode==='moon'&&direction>0){pendingCorrection={mode,direction,from:mode==='gmt'?gmtOffset:moonOffset};return true;}return false;},reset(){gmtOffset=moonOffset=moonShown=lastTotal=gmtShown=0;pendingCorrection=null;dayCounter.reset();}};
};
