/* Standalone engine workbench. No watch state, lesson IDs or camera are reused. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),L=CarLessons,M=CarMechanics,clock=new M.Clock();
 let lesson=0,vehicle;
 let chapter=0,selected='piston',model,systems,renderer,scene,camera,last=0,lastUI=0,lastAudit=0,lastDegree=NaN;
 const settings={pedal:35,advance:8,ignition:true,temperature:60,circuit:'both'};
 const audits=new URL(location.href).searchParams.get('audit')==='1';
 L.chapters.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=`<b>${String(i+1).padStart(2,'0')}</b><span>${c.title}</span>`;b.dataset.chapter=i+1;b.onclick=()=>selectChapter(i);$('chapterNav').append(b);});
 L.roadmap.forEach(([title,path,experiment],i)=>{const ready=true,a=document.createElement('article');a.className='roadmap-card'+(ready?' ready':'');a.id='roadmap-'+(i+1);a.innerHTML=`<span>${String(i+1).padStart(2,'0')} / ${ready?'지금 탐구하기':'제작 예정'}</span><h3>${title}</h3><b>${path}</b><p>${experiment}</p>${ready?`<a href="car.html?chapter=${i+1}">작업대 열기 ↗</a>`:''}`;$('roadmapCards').append(a);});
 L.advanced.forEach(([title,detail])=>{const a=document.createElement('article');a.className='roadmap-card';const state=document.createElement('span'),h=document.createElement('h3'),p=document.createElement('p');state.textContent='심화 / 제작 예정';h.textContent=title;p.textContent=detail;a.append(state,h,p);$('advancedCards').append(a);});
 function tab(key){for(const k of ['flow','part']){$(k+'Tab').setAttribute('aria-selected',k===key);$(k+'Tab').tabIndex=k===key?0:-1;$(k+'Panel').hidden=k!==key;}}
 for(const key of ['flow','part']){$(key+'Tab').onclick=()=>tab(key);$(key+'Tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const k=e.key==='Home'?'flow':e.key==='End'?'part':key==='flow'?'part':'flow';tab(k);$(k+'Tab').focus();}};}
 function selectPart(key,open=true){if(!L.parts[key])return;selected=key;model?.select(key);systems?.select(key);vehicle?.select(key);const [name,role,description]=L.parts[key];$('partTitle').textContent=name;$('partRole').textContent=role;$('partDescription').textContent=description;for(const b of $('partButtons').children)b.setAttribute('aria-pressed',b.dataset.part===key);if(open)tab('part');}
 function selectMode(i){
  chapter=i;clock.running=false;const c=L.chapters[lesson],parts=i===10?['inputShaft','driveClutch','synchronizer','outputShaft','finalDrive','spider','halfshaft','rack','wishbone','brakePad']:c.parts;$('eyebrow').textContent=c.eyebrow;$('lessonTitle').textContent=c.title;$('lessonDeck').textContent=c.deck;$('lessonIntro').textContent=c.intro;$('challengeText').textContent=c.challenge;$('nextChapter').textContent=c.next;
  $('lessonCards').innerHTML=c.cards.map(([h,p])=>`<article class="explain-card"><h3>${h}</h3><p>${p}</p></article>`).join('');
  $('partButtons').replaceChildren();parts.forEach(key=>{const b=document.createElement('button');b.dataset.part=key;b.textContent=L.parts[key][0];b.onclick=()=>selectPart(key);$('partButtons').append(b);});
  [...$('chapterNav').children].forEach((b,j)=>{b.classList.toggle('active',j===lesson);if(j===lesson)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  $('stepBack').hidden=$('stepForward').hidden=i>=6;$('strokeButtons').hidden=i===0||i>=6;document.querySelector('.scrub').hidden=i>=6;$('viewCam').hidden=i<2||i===3||i>=7;$('viewCam').textContent=i===6?'클러치':'캠 접촉';$('beltControl').hidden=i<2||i>=6;
  $('bankControls').hidden=i!==3;$('airControls').hidden=i!==4;$('fluidControls').hidden=i!==5;$('viewSystem').hidden=i<3;
  $('viewSystem').textContent=(['','','','4기통 보기','흡기 확대','서모스탯 확대'][i]||'연결부 확대');
  $('modelScope').textContent=['관찰용 입력이 축을 돌립니다 · 실린더와 피스톤 앞쪽을 절개했습니다.','가스 색·입자는 흐름의 개념 표시입니다 · 실제 압력·출력을 계산하지 않습니다.','같은 축·같은 모델의 연결입니다 · 캠을 자세히 볼 때 벨트 경로 표시를 끌 수 있습니다.'][i];
  if(i>=3&&i<=5)$('modelScope').textContent=['4기통은 공통 축에 연결됩니다 · 행정 버튼은 1번 기준 · 전체/4기통 보기로 넓게 관찰하세요.','슬라이더는 스로틀 축 입력을 대신합니다 · 분사 펄스와 공기량은 교육용 표시이며 ECU 맵이 아닙니다.','통로를 펼쳐 그린 유로도 · 부품의 실제 장착 배치·압력·유량·열수지 계산은 아닙니다.'][i-3];
  document.querySelector('.edition').innerHTML=i===3?'FOUR CYLINDERS · ONE CRANK<br>1 → 3 → 4 → 2':'CONNECTED CUTAWAY<br>DOHC · 4 VALVES / CYLINDER';
  model?.setChapter(Math.min(i,5));systems?.setChapter(Math.min(i,5));if(model&&i>=6)model.root.visible=false;if(systems)systems.root.visible=i<6;vehicle?.setMode(i);if(vehicle)vehicle.root.visible=i>=6;systems?.setSettings(settings);model?.update(clock.degrees);systems?.update(clock.degrees);selectPart(parts.includes(selected)?selected:parts[0],false);tab('flow');
  if(vehicle)for(const [id,key] of [['turn','split'],['steer','rack'],['bump','bump'],['brake','brake']]){$(id).value=vehicle.settings[key]*100;$(id+'Value').textContent=$(id).value;}
  $('journeyPath').hidden=i!==10;if(i===10){$('lessonIntro').textContent='앞에서 배운 시험대를 하나의 구동 경로로 연결했습니다. 재생하면 준비·출발·변속·가속·코너·제동을 순서대로 보여줍니다. 부품을 눌러 이름과 역할을 다시 확인하세요. 화면은 자동으로 움직이지 않습니다.';$('lessonCards').innerHTML='<article class="explain-card"><h3>같은 축을 끝까지 따라가세요.</h3><p>엔진 뒤의 클러치부터 변속기 출력축, 긴 프로펠러축, 뒤쪽 차동기어, 양쪽 반축까지 연결되어 있습니다. 앞바퀴의 랙과 타이로드는 별도의 조향 경로입니다.</p></article><article class="explain-card"><h3>변속에서는 엔진 연결을 끊습니다.</h3><p>준비와 2단 선택 단계에서 클러치가 분리됩니다. 동기화와 체결이 끝난 뒤 다시 엔진을 연결합니다. 이 안내 모형은 변속 중 출력을 잠시 멈추며 실차 관성 주행은 계산하지 않습니다.</p></article><article class="explain-card"><h3>제동 때에는 바퀴가 구동계를 돌립니다.</h3><p>엔진 클러치를 분리한 채 앞 패드가 디스크에 닿고 바퀴가 느려집니다. 회전 중인 바퀴 쪽에서 프로펠러축과 선택된 변속 기어로 회전이 전달됩니다.</p></article>';}
  document.querySelector('.edition').innerHTML=i>=6?'CONNECTED MECHANISMS<br>MANUAL · REAR-WHEEL DRIVE':document.querySelector('.edition').innerHTML;
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.mode===i));
  for(const [id,m] of [['transmissionControls',6],['diffControls',7],['chassisControls',8],['brakeControls',9],['journeyControls',10]])$(id).hidden=i!==m;
  if(i>=6)$('modelScope').textContent='실제 정비 도면의 연결 구조를 단순화한 교육 모형 · 치수·잇수는 교육용 · 제작 기준에서 생략 범위를 확인하세요.';
  document.querySelector('.control-note').textContent=i<6?'1× = 크랭크 1회전 / 6초 · 실제 RPM 아님':'저속 관찰용 시계 · 사용자 조작의 체결 과정은 일시정지 중에도 진행';
  updateUI();
 }
 function selectChapter(i,historyMode='push'){
  lesson=i;const c=L.chapters[i];$('lessonSteps').replaceChildren();
  c.steps.forEach(step=>{const b=document.createElement('button');b.textContent=step.label;b.dataset.mode=step.mode;b.onclick=()=>selectMode(step.mode);$('lessonSteps').append(b);});
  const u=new URL(location.href);u.searchParams.set('chapter',i+1);if(historyMode==='push')history.pushState(null,'',u);else if(historyMode==='replace')history.replaceState(null,'',u);
  document.title=`${i+1}. ${c.title} — 내연기관 자동차 | Mechanism Unfolded`;
  selectMode(c.steps[0].mode);

 }
 function updateUI(){const p=M.pose(clock.degrees),cycle=clock.degrees===720?720:M.mod(clock.degrees,720);$('play').textContent=clock.running?'Ⅱ 일시 정지':'▶ 움직임 재생';$('play').setAttribute('aria-pressed',clock.running);$('angle').value=clock.degrees===720?720:cycle;$('angleValue').textContent=(clock.degrees===720?720:cycle).toFixed(0)+'°';
  for(const b of document.querySelectorAll('[data-stroke]'))b.classList.toggle('current',+b.dataset.stroke===p.stroke);
  const down=p.phase%360<180,dead=Math.abs(p.phase%180)<1e-6,stroke=['흡입','압축','연소·팽창','배기'][p.stroke];$('stageState').textContent=chapter===0?`피스톤 ${dead?(p.phase%360===0?'상사점':'하사점'):down?'하강':'상승'} · 크랭크 ${cycle.toFixed(0)}°`:`${stroke} · ${clock.running?'재생 중':'멈춰 관찰'} · ${cycle.toFixed(0)}°`;
  let values=chapter===0?[['피스톤 행정 위치',Math.round(p.displacement*100)+'%'],['로드 중심 간 거리','2.700'],['크랭크 회전',(cycle/360).toFixed(2)+'회'],['현재 입력','관찰용 구동']]:chapter===1?[['현재 행정',stroke],['흡기 밸브',p.valves[0].lift>.001?'열림':'닫힘'],['배기 밸브',p.valves[1].lift>.001?'열림':'닫힘'],['점화 사건',p.spark?'불꽃 발생':'대기']]:[['크랭크',(cycle/360).toFixed(2)+'회'],['캠축',(cycle/720).toFixed(2)+'회'],['흡기 열림',Math.round(p.valves[0].lift/M.spec.camLift*100)+'%'],['배기 열림',Math.round(p.valves[1].lift/M.spec.camLift*100)+'%']];
  const op=M.operation(clock.degrees,settings.pedal,settings.advance,settings.ignition),cool=M.cooling(settings.temperature);
  if(chapter===3)values=M.bank.map(b=>[`${b.number}번 실린더`,['흡입','압축','팽창','배기'][M.pose(clock.degrees+b.offset).stroke]]);
  if(chapter===4)values=[['스로틀 각도',(op.opening*180/Math.PI).toFixed(0)+'°'],['분사 니들',op.injection?'열림':'닫힘'],['점화 시점','상사점 −'+settings.advance+'°'],['불꽃',op.spark?'발생':settings.ignition?'대기':'점화 꺼짐']];
  if(chapter===5)values=[['온도 입력',settings.temperature+'°C'],['주 밸브 열림',Math.round(cool.open*100)+'%'],['냉각수 귀환',cool.open===0?'우회':cool.open===1?'라디에이터':'두 경로'],['오일 순환','펌프 → 갤러리']];
  if(chapter>=6&&vehicle){const st=vehicle.state,t=st.transmission,d=st.differential,b=st.brake;
   $('stageState').textContent=chapter===6?t.phase:chapter===7?'좌우 평균 = 케이스':chapter===8?'고정 길이 암 · 타이로드':chapter===9?(b.pressure?'패드 접촉 · 제동':'패드 틈 · 무압력'):['출발 준비','클러치 연결 · 가속','클러치 분리 · 2단 선택','2단 가속','코너 · 좌우 속도 차이','클러치 분리 · 제동'][st.journeyStage];
   if(chapter===6){const ratio=CarDrive.spec.ratios[t.gear]||0;values=[['선택 기어',t.gear==='N'?'중립':t.gear],['엔진 클러치',t.clutch===1?'분리':t.clutch===0?'연결':'미끄럼 시연'],['출력 / 입력',ratio?ratio.toFixed(3):'연결 없음'],['이상적 토크 배수',ratio?(1/Math.abs(ratio)).toFixed(2)+'×':'—']];$('shiftMessage').textContent=vehicle.transmission.message;document.querySelectorAll('[data-gear]').forEach(e=>{e.setAttribute('aria-pressed',e.dataset.gear===t.gear);e.disabled=t.busy;});$('clutch').value=t.clutch*100;}
   if(chapter===7)values=[['케이스', '1.00×'],['왼쪽', (1-st.settings.split).toFixed(2)+'×'],['오른쪽',(1+st.settings.split).toFixed(2)+'×'],['작은 피니언 자전',st.settings.split===0?'없음':'있음']];
   if(chapter===8)values=[['랙 이동',st.settings.rack.toFixed(2)],['왼쪽 조향',(st.steering[0].angle*180/Math.PI).toFixed(1)+'°'],['오른쪽 조향',(st.steering[1].angle*180/Math.PI).toFixed(1)+'°'],['타이로드 길이',st.steering[0].length.toFixed(3)+' / 일정']];
   if(chapter===9)values=[['페달 입력',Math.round(st.settings.brake*100)+'%'],['상대 유압',Math.round(b.pressure*100)+'%'],['패드 틈',b.padGap.toFixed(3)],['디스크 속도',b.speed.toFixed(2)+' rad/s']];
   if(chapter===10){values=[['주행 단계',(st.journeyStage+1)+' / 6'],['선택 기어',t.gear],['클러치',t.clutch>=.99?'분리':t.clutch===0?'연결':'연결 중'],['안내 시퀀스',Math.round(st.journeyTime/36*100)+'%']];$('journeyProgress').value=st.journeyTime;$('journeyPath').textContent=['① 클러치 분리 → 1단 동기화·체결. 아직 바퀴를 구동하지 않습니다.','② 엔진 → 클러치 → 1단 → 프로펠러축 → 뒤 바퀴.','③ 엔진 연결 해제 → 슬리브 중립 → 2단 동기화·체결.','④ 엔진 → 2단 → 뒤 바퀴. 같은 입력에서 더 빠른 출력입니다.','⑤ 랙 → 앞바퀴 조향. 뒤쪽 차동 피니언이 좌우 속도 차이를 허용합니다.','⑥ 클러치 분리 · 패드 접촉 → 감속. 바퀴 회전이 구동계를 역구동합니다.'][st.journeyStage];}
  }
  $('liveReadings').innerHTML=values.map(([l,v])=>`<div class="reading">${l}<strong>${v}</strong></div>`).join('');
 }
 $('play').onclick=()=>{if(chapter===10&&vehicle.state.journeyTime>=36)vehicle.resetJourney();clock.running=!clock.running;updateUI();};$('speed').onchange=e=>{clock.speed=+e.target.value;};
 function snapshot(){return {...model.audit(),systems:systems.audit(),vehicle:vehicle.audit(),lesson:lesson+1};}
 function seek(d){clock.seek(d);model?.update(clock.degrees);systems?.update(clock.degrees);lastDegree=clock.degrees;if(audits&&renderer)renderer.domElement.dataset.audit=JSON.stringify(snapshot());updateUI();}
 function changeSetting(key,value){settings[key]=value;systems?.setSettings(settings);model?.update(clock.degrees);systems?.update(clock.degrees);$('pedalValue').textContent=settings.pedal+'%';$('advanceValue').textContent=settings.advance+'°';$('temperatureValue').textContent=settings.temperature+'°C';updateUI();}
 for(const id of ['pedal','advance','temperature'])$(id).oninput=e=>changeSetting(id,+e.target.value);
 $('ignition').onchange=e=>changeSetting('ignition',e.target.checked);$('circuit').onchange=e=>changeSetting('circuit',e.target.value);
 document.querySelectorAll('[data-temperature]').forEach(b=>b.onclick=()=>{$('temperature').value=b.dataset.temperature;changeSetting('temperature',+b.dataset.temperature);});
 $('clutch').oninput=e=>{vehicle?.transmission.setClutch(+e.target.value/100);vehicle?.update();updateUI();};
 document.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>{vehicle.transmission.request(b.dataset.gear);updateUI();});
 for(const [id,key,scale] of [['turn','split',100],['steer','rack',100],['bump','bump',100],['brake','brake',100]])$(id).oninput=e=>{vehicle?.setSettings({[key]:+e.target.value/scale});$(id+'Value').textContent=e.target.value;updateUI();};
 document.querySelectorAll('[data-split]').forEach(b=>b.onclick=()=>{vehicle.setSettings({split:+b.dataset.split});$('turn').value=+b.dataset.split*100;$('turnValue').textContent=$('turn').value;updateUI();});
 $('spinBrake').onclick=()=>{vehicle.spinBrake();clock.running=true;updateUI();};
 $('resetJourney').onclick=()=>{vehicle.resetJourney();clock.running=false;updateUI();};
 $('angle').oninput=e=>seek(+e.target.value);$('stepBack').onclick=()=>seek(M.mod(clock.degrees-15,720));$('stepForward').onclick=()=>seek(M.mod(clock.degrees+15,720));
 document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>seek(+b.dataset.angle));
 $('nextChapter').onclick=()=>{if(lesson<L.chapters.length-1)selectChapter(lesson+1);else $('roadmap').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 function fromURL(){const n=Number(new URL(location.href).searchParams.get('chapter'));return Number.isInteger(n)&&n>=1&&n<=L.chapters.length?n-1:0;}
 addEventListener('popstate',()=>selectChapter(fromURL(),'none'));
 selectChapter(fromURL(),'replace');
 try{
  if(!window.THREE)throw Error('3D 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인하고 새로고침해 주세요.');
  const T=THREE,viewport=$('viewport');scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.05,120);renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0xeff2ea,0);viewport.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','회전 가능한 내연기관 3D 모델. 부품은 옆의 선택한 부품 탭에서도 선택할 수 있습니다.');renderer.domElement.setAttribute('role','img');
  scene.add(new T.HemisphereLight(0xffffff,0x71837c,2.4));const light=new T.DirectionalLight(0xffffff,3.0);light.position.set(4,8,7);scene.add(light);const fill=new T.DirectionalLight(0xe5c89b,1.7);fill.position.set(-4,3,-4);scene.add(fill);
  model=createCarModel(T);systems=createCarSystems(T,model);vehicle=createCarVehicle(T);scene.add(model.root,systems.root,vehicle.root);model.setChapter(chapter);systems.setChapter(chapter);systems.setSettings(settings);model.select(selected);systems.select(selected);systems.update(clock.degrees);vehicle.setMode(chapter);vehicle.root.visible=chapter>=6;systems.root.visible=chapter<6;if(chapter>=6)model.root.visible=false;$('loading').hidden=true;
  // Quaternion trackball has no front/back switch or inverted-yaw threshold.
  let q=new T.Quaternion(),radius=11.8,target=new T.Vector3(0,2.6,0),drag=null;
  function preset(name){if(chapter>=6){target.set(0,chapter===10?1.3:2.2,0);radius=chapter===10?11.5:10;q.setFromEuler(new T.Euler(chapter===10?-.65:-.32,name==='front'?0:name==='side'?1.3:.52,0,'YXZ'));if(name==='system'){if(chapter===6){target.set(-.4,2.7,0);radius=5.6;q.setFromEuler(new T.Euler(-.4,-.35,0,'YXZ'));}if(chapter===7){target.set(0,2.5,0);radius=5.8;}if(chapter===8)radius=8.3;if(chapter===9){target.set(1.6,2.85,0);radius=3.8;q.setFromEuler(new T.Euler(-.22,1.05,0,'YXZ'));}}if(name==='cam'&&chapter===6){target.set(2.9,2.7,0);radius=4.3;q.setFromEuler(new T.Euler(-.2,-.95,0,'YXZ'));}return;}if(name==='system'&&chapter===4){target.set(-2.1,4.65,0);radius=4.8;q.setFromEuler(new T.Euler(-.1,-.5,0,'YXZ'));}else if(name==='system'&&chapter===5){target.set(2.6,1.65,1.85);radius=3.3;q.setFromEuler(new T.Euler(-.1,.15,0,'YXZ'));}else if(name==='cam'){target.set(M.valves[0].center[0],5.37,.1);radius=3.3;q.setFromEuler(new T.Euler(-.12,.10,0,'YXZ'));}else{target.set(chapter===5?.8:0,2.7,0);radius=chapter>=3?18:11.8;q.setFromEuler(new T.Euler(name==='side'?-.05:-.10,name==='front'?0:name==='side'||name==='system'?1.05:.47,0,'YXZ'));}}
  preset('default');for(const [id,key] of [['viewDefault','default'],['viewFront','front'],['viewSide','side'],['viewCam','cam']])$(id).onclick=()=>preset(key);
  $('viewSystem').onclick=()=>preset('system');
  $('showBelt').onchange=e=>{model.setBelt(e.target.checked);systems.setBelt(e.target.checked);model.update(clock.degrees);systems.update(clock.degrees);};
  const ray=new T.Raycaster(),mouse=new T.Vector2(),label=$('hoverLabel');
  function hit(e){const b=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects([...model.pickable,...systems.pickable,...vehicle.pickable]).find(x=>{let o=x.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});}
  function sphere(x,y){const r=renderer.domElement.getBoundingClientRect(),size=Math.min(r.width,r.height),v=new T.Vector3((2*(x-r.left)-r.width)/size,(r.height-2*(y-r.top))/size,0),n=v.x*v.x+v.y*v.y;if(n<=1)v.z=Math.sqrt(1-n);else v.normalize();return v;}
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);label.hidden=true;});
  renderer.domElement.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(e.shiftKey){const sx=new T.Vector3(1,0,0).applyQuaternion(q),sy=new T.Vector3(0,1,0).applyQuaternion(q),scale=radius*.65/viewport.clientHeight;target.addScaledVector(sx,-dx*scale).addScaledVector(sy,dy*scale);}else{const delta=new T.Quaternion().setFromUnitVectors(sphere(e.clientX,e.clientY),sphere(drag.x,drag.y));q.multiply(delta).normalize();}drag.x=e.clientX;drag.y=e.clientY;}else{const h=hit(e);label.hidden=!h;if(h){label.textContent=L.parts[h.object.userData.part]?.[0]||'';const r=document.querySelector('.stage').getBoundingClientRect();label.style.left=Math.max(8,Math.min(r.width-205,e.clientX-r.left+10))+'px';label.style.top=(e.clientY-r.top+12)+'px';}}});
  renderer.domElement.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5;drag=null;if(click){const h=hit(e);if(h)selectPart(h.object.userData.part);}renderer.domElement.releasePointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointercancel',()=>drag=null);renderer.domElement.addEventListener('pointerleave',()=>label.hidden=true);
  renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(1.6,Math.min(24,radius*Math.exp(e.deltaY*.001)));},{passive:false});
  const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(viewport);resize();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.running=false;updateUI();}last=performance.now();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();clock.running=false;$('loading').hidden=false;$('loading').textContent='3D 그래픽 연결이 중단되었습니다. 새로고침하면 작업대를 다시 열 수 있습니다.';updateUI();});
  function frame(now){const dt=last?(now-last)/1000:0;last=now;const previous=clock.degrees;clock.advance(dt);vehicle.tick(Math.min(dt,.05),CarMechanics.rad(clock.degrees-previous));if(chapter===10&&vehicle.state.journeyTime>=36)clock.running=false;if(clock.degrees!==lastDegree){model.update(clock.degrees);systems.update(clock.degrees);lastDegree=clock.degrees;}camera.position.copy(new T.Vector3(0,0,radius*Math.max(1,1/camera.aspect)).applyQuaternion(q).add(target));camera.up.copy(new T.Vector3(0,1,0).applyQuaternion(q));camera.lookAt(target);renderer.render(scene,camera);
   renderer.domElement.dataset.state=JSON.stringify({chapter:lesson+1,experiment:chapter,degrees:clock.degrees,running:clock.running,speed:clock.speed,selected,camera:{q:q.toArray(),radius,target:target.toArray()}});
   if(audits&&now-lastAudit>100){renderer.domElement.dataset.audit=JSON.stringify(snapshot());lastAudit=now;}
   if(now-lastUI>100){updateUI();lastUI=now;}requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 }catch(error){$('loading').textContent=error.message;console.error(error);for(const id of ['play','angle','stepBack','stepForward','speed'])$(id).disabled=true;}
})();
