/* Standalone engine workbench. No watch state, lesson IDs or camera are reused. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),L=CarLessons,M=CarMechanics,clock=new M.Clock();
 let chapter=0,selected='piston',model,systems,renderer,scene,camera,last=0,lastUI=0,lastAudit=0,lastDegree=NaN;
 const settings={pedal:35,advance:8,ignition:true,temperature:60,circuit:'both'};
 const audits=new URL(location.href).searchParams.get('audit')==='1';
 L.chapters.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=`<b>${String(i+1).padStart(2,'0')}</b><span>${c.title}</span>`;b.dataset.chapter=i+1;b.onclick=()=>selectChapter(i);$('chapterNav').append(b);});
 L.roadmap.forEach(([title,path,experiment],i)=>{const ready=i<L.chapters.length,a=document.createElement('article');a.className='roadmap-card'+(ready?' ready':'');a.id='roadmap-'+(i+1);a.innerHTML=`<span>${String(i+1).padStart(2,'0')} / ${ready?'지금 탐구하기':'제작 예정'}</span><h3>${title}</h3><b>${path}</b><p>${experiment}</p>${ready?`<a href="car.html?chapter=${i+1}">작업대 열기 ↗</a>`:''}`;$('roadmapCards').append(a);});
 function tab(key){for(const k of ['flow','part']){$(k+'Tab').setAttribute('aria-selected',k===key);$(k+'Tab').tabIndex=k===key?0:-1;$(k+'Panel').hidden=k!==key;}}
 for(const key of ['flow','part']){$(key+'Tab').onclick=()=>tab(key);$(key+'Tab').onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const k=e.key==='Home'?'flow':e.key==='End'?'part':key==='flow'?'part':'flow';tab(k);$(k+'Tab').focus();}};}
 function selectPart(key,open=true){if(!L.parts[key])return;selected=key;model?.select(key);systems?.select(key);const [name,role,description]=L.parts[key];$('partTitle').textContent=name;$('partRole').textContent=role;$('partDescription').textContent=description;for(const b of $('partButtons').children)b.setAttribute('aria-pressed',b.dataset.part===key);if(open)tab('part');}
 function selectChapter(i,historyMode='push'){
  chapter=i;clock.running=false;const c=L.chapters[i];$('eyebrow').textContent=c.eyebrow;$('lessonTitle').textContent=c.title;$('lessonDeck').textContent=c.deck;$('lessonIntro').textContent=c.intro;$('challengeText').textContent=c.challenge;$('nextChapter').textContent=c.next;
  $('lessonCards').innerHTML=c.cards.map(([h,p])=>`<article class="explain-card"><h3>${h}</h3><p>${p}</p></article>`).join('');
  $('partButtons').replaceChildren();c.parts.forEach(key=>{const b=document.createElement('button');b.dataset.part=key;b.textContent=L.parts[key][0];b.onclick=()=>selectPart(key);$('partButtons').append(b);});
  [...$('chapterNav').children].forEach((b,j)=>{b.classList.toggle('active',j===i);if(j===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  $('strokeButtons').hidden=i===0;$('viewCam').hidden=i<2||i===3;$('beltControl').hidden=i<2;
  $('bankControls').hidden=i!==3;$('airControls').hidden=i!==4;$('fluidControls').hidden=i!==5;$('viewSystem').hidden=i<3;
  $('viewSystem').textContent=['','','','4기통 보기','흡기 확대','서모스탯 확대'][i];
  $('modelScope').textContent=['관찰용 입력이 축을 돌립니다 · 실린더와 피스톤 앞쪽을 절개했습니다.','가스 색·입자는 흐름의 개념 표시입니다 · 실제 압력·출력을 계산하지 않습니다.','같은 축·같은 모델의 연결입니다 · 캠을 자세히 볼 때 벨트 경로 표시를 끌 수 있습니다.'][i];
  if(i>=3)$('modelScope').textContent=['4기통은 공통 축에 연결됩니다 · 행정 버튼은 1번 기준 · 전체/4기통 보기로 넓게 관찰하세요.','슬라이더는 스로틀 축 입력을 대신합니다 · 분사 펄스와 공기량은 교육용 표시이며 ECU 맵이 아닙니다.','통로를 펼쳐 그린 유로도 · 부품의 실제 장착 배치·압력·유량·열수지 계산은 아닙니다.'][i-3];
  document.querySelector('.edition').innerHTML=i===3?'FOUR CYLINDERS · ONE CRANK<br>1 → 3 → 4 → 2':'CONNECTED CUTAWAY<br>DOHC · 4 VALVES / CYLINDER';
  model?.setChapter(i);systems?.setChapter(i);systems?.setSettings(settings);model?.update(clock.degrees);systems?.update(clock.degrees);selectPart(c.parts.includes(selected)?selected:c.parts[0],false);tab('flow');
  const u=new URL(location.href);u.searchParams.set('chapter',i+1);if(historyMode==='push')history.pushState(null,'',u);else if(historyMode==='replace')history.replaceState(null,'',u);
  document.title=`${i+1}. ${c.title} — 내연기관 자동차 | Mechanism Unfolded`;updateUI();
 }
 function updateUI(){const p=M.pose(clock.degrees),cycle=clock.degrees===720?720:M.mod(clock.degrees,720);$('play').textContent=clock.running?'Ⅱ 일시 정지':'▶ 움직임 재생';$('play').setAttribute('aria-pressed',clock.running);$('angle').value=clock.degrees===720?720:cycle;$('angleValue').textContent=(clock.degrees===720?720:cycle).toFixed(0)+'°';
  for(const b of document.querySelectorAll('[data-stroke]'))b.classList.toggle('current',+b.dataset.stroke===p.stroke);
  const down=p.phase%360<180,dead=Math.abs(p.phase%180)<1e-6,stroke=['흡입','압축','연소·팽창','배기'][p.stroke];$('stageState').textContent=chapter===0?`피스톤 ${dead?(p.phase%360===0?'상사점':'하사점'):down?'하강':'상승'} · 크랭크 ${cycle.toFixed(0)}°`:`${stroke} · ${clock.running?'재생 중':'멈춰 관찰'} · ${cycle.toFixed(0)}°`;
  let values=chapter===0?[['피스톤 행정 위치',Math.round(p.displacement*100)+'%'],['로드 중심 간 거리','2.700'],['크랭크 회전',(cycle/360).toFixed(2)+'회'],['현재 입력','관찰용 구동']]:chapter===1?[['현재 행정',stroke],['흡기 밸브',p.valves[0].lift>.001?'열림':'닫힘'],['배기 밸브',p.valves[1].lift>.001?'열림':'닫힘'],['점화 사건',p.spark?'불꽃 발생':'대기']]:[['크랭크',(cycle/360).toFixed(2)+'회'],['캠축',(cycle/720).toFixed(2)+'회'],['흡기 열림',Math.round(p.valves[0].lift/M.spec.camLift*100)+'%'],['배기 열림',Math.round(p.valves[1].lift/M.spec.camLift*100)+'%']];
  const op=M.operation(clock.degrees,settings.pedal,settings.advance,settings.ignition),cool=M.cooling(settings.temperature);
  if(chapter===3)values=M.bank.map(b=>[`${b.number}번 실린더`,['흡입','압축','팽창','배기'][M.pose(clock.degrees+b.offset).stroke]]);
  if(chapter===4)values=[['스로틀 각도',(op.opening*180/Math.PI).toFixed(0)+'°'],['분사 니들',op.injection?'열림':'닫힘'],['점화 시점','상사점 −'+settings.advance+'°'],['불꽃',op.spark?'발생':settings.ignition?'대기':'점화 꺼짐']];
  if(chapter===5)values=[['온도 입력',settings.temperature+'°C'],['주 밸브 열림',Math.round(cool.open*100)+'%'],['냉각수 귀환',cool.open===0?'우회':cool.open===1?'라디에이터':'두 경로'],['오일 순환','펌프 → 갤러리']];
  $('liveReadings').innerHTML=values.map(([l,v])=>`<div class="reading">${l}<strong>${v}</strong></div>`).join('');
 }
 $('play').onclick=()=>{clock.running=!clock.running;updateUI();};$('speed').onchange=e=>{clock.speed=+e.target.value;};
 function snapshot(){return {...model.audit(),systems:systems.audit()};}
 function seek(d){clock.seek(d);model?.update(clock.degrees);systems?.update(clock.degrees);lastDegree=clock.degrees;if(audits&&renderer)renderer.domElement.dataset.audit=JSON.stringify(snapshot());updateUI();}
 function changeSetting(key,value){settings[key]=value;systems?.setSettings(settings);model?.update(clock.degrees);systems?.update(clock.degrees);$('pedalValue').textContent=settings.pedal+'%';$('advanceValue').textContent=settings.advance+'°';$('temperatureValue').textContent=settings.temperature+'°C';updateUI();}
 for(const id of ['pedal','advance','temperature'])$(id).oninput=e=>changeSetting(id,+e.target.value);
 $('ignition').onchange=e=>changeSetting('ignition',e.target.checked);$('circuit').onchange=e=>changeSetting('circuit',e.target.value);
 document.querySelectorAll('[data-temperature]').forEach(b=>b.onclick=()=>{$('temperature').value=b.dataset.temperature;changeSetting('temperature',+b.dataset.temperature);});
 $('angle').oninput=e=>seek(+e.target.value);$('stepBack').onclick=()=>seek(M.mod(clock.degrees-15,720));$('stepForward').onclick=()=>seek(M.mod(clock.degrees+15,720));
 document.querySelectorAll('[data-angle]').forEach(b=>b.onclick=()=>seek(+b.dataset.angle));
 $('nextChapter').onclick=()=>{if(chapter<L.chapters.length-1)selectChapter(chapter+1);else $('roadmap').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 function fromURL(){const n=Number(new URL(location.href).searchParams.get('chapter'));return Number.isInteger(n)&&n>=1&&n<=L.chapters.length?n-1:0;}
 addEventListener('popstate',()=>selectChapter(fromURL(),'none'));
 selectChapter(fromURL(),'replace');
 try{
  if(!window.THREE)throw Error('3D 라이브러리를 불러오지 못했습니다. 네트워크 연결을 확인하고 새로고침해 주세요.');
  const T=THREE,viewport=$('viewport');scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.05,120);renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0xeff2ea,0);viewport.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','회전 가능한 내연기관 3D 모델. 부품은 옆의 선택한 부품 탭에서도 선택할 수 있습니다.');renderer.domElement.setAttribute('role','img');
  scene.add(new T.HemisphereLight(0xffffff,0x71837c,2.4));const light=new T.DirectionalLight(0xffffff,3.0);light.position.set(4,8,7);scene.add(light);const fill=new T.DirectionalLight(0xe5c89b,1.7);fill.position.set(-4,3,-4);scene.add(fill);
  model=createCarModel(T);systems=createCarSystems(T,model);scene.add(model.root,systems.root);model.setChapter(chapter);systems.setChapter(chapter);systems.setSettings(settings);model.select(selected);systems.select(selected);systems.update(clock.degrees);$('loading').hidden=true;
  // Quaternion trackball has no front/back switch or inverted-yaw threshold.
  let q=new T.Quaternion(),radius=11.8,target=new T.Vector3(0,2.6,0),drag=null;
  function preset(name){if(name==='system'&&chapter===4){target.set(-2.1,4.65,0);radius=4.8;q.setFromEuler(new T.Euler(-.1,-.5,0,'YXZ'));}else if(name==='system'&&chapter===5){target.set(2.6,1.65,1.85);radius=3.3;q.setFromEuler(new T.Euler(-.1,.15,0,'YXZ'));}else if(name==='cam'){target.set(M.valves[0].center[0],5.37,.1);radius=3.3;q.setFromEuler(new T.Euler(-.12,.10,0,'YXZ'));}else{target.set(chapter===5?.8:0,2.7,0);radius=chapter>=3?18:11.8;q.setFromEuler(new T.Euler(name==='side'?-.05:-.10,name==='front'?0:name==='side'||name==='system'?1.05:.47,0,'YXZ'));}}
  preset('default');for(const [id,key] of [['viewDefault','default'],['viewFront','front'],['viewSide','side'],['viewCam','cam']])$(id).onclick=()=>preset(key);
  $('viewSystem').onclick=()=>preset('system');
  $('showBelt').onchange=e=>{model.setBelt(e.target.checked);systems.setBelt(e.target.checked);model.update(clock.degrees);systems.update(clock.degrees);};
  const ray=new T.Raycaster(),mouse=new T.Vector2(),label=$('hoverLabel');
  function hit(e){const b=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects([...model.pickable,...systems.pickable]).find(x=>{let o=x.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});}
  function sphere(x,y){const r=renderer.domElement.getBoundingClientRect(),size=Math.min(r.width,r.height),v=new T.Vector3((2*(x-r.left)-r.width)/size,(r.height-2*(y-r.top))/size,0),n=v.x*v.x+v.y*v.y;if(n<=1)v.z=Math.sqrt(1-n);else v.normalize();return v;}
  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture(e.pointerId);label.hidden=true;});
  renderer.domElement.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(e.shiftKey){const sx=new T.Vector3(1,0,0).applyQuaternion(q),sy=new T.Vector3(0,1,0).applyQuaternion(q),scale=radius*.65/viewport.clientHeight;target.addScaledVector(sx,-dx*scale).addScaledVector(sy,dy*scale);}else{const delta=new T.Quaternion().setFromUnitVectors(sphere(e.clientX,e.clientY),sphere(drag.x,drag.y));q.multiply(delta).normalize();}drag.x=e.clientX;drag.y=e.clientY;}else{const h=hit(e);label.hidden=!h;if(h){label.textContent=L.parts[h.object.userData.part]?.[0]||'';const r=document.querySelector('.stage').getBoundingClientRect();label.style.left=Math.max(8,Math.min(r.width-205,e.clientX-r.left+10))+'px';label.style.top=(e.clientY-r.top+12)+'px';}}});
  renderer.domElement.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const click=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5;drag=null;if(click){const h=hit(e);if(h)selectPart(h.object.userData.part);}renderer.domElement.releasePointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointercancel',()=>drag=null);renderer.domElement.addEventListener('pointerleave',()=>label.hidden=true);
  renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(1.6,Math.min(24,radius*Math.exp(e.deltaY*.001)));},{passive:false});
  const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(viewport);resize();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.running=false;updateUI();}last=performance.now();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();clock.running=false;$('loading').hidden=false;$('loading').textContent='3D 그래픽 연결이 중단되었습니다. 새로고침하면 작업대를 다시 열 수 있습니다.';updateUI();});
  function frame(now){const dt=last?(now-last)/1000:0;last=now;clock.advance(dt);if(clock.degrees!==lastDegree){model.update(clock.degrees);systems.update(clock.degrees);lastDegree=clock.degrees;}camera.position.copy(new T.Vector3(0,0,radius).applyQuaternion(q).add(target));camera.up.copy(new T.Vector3(0,1,0).applyQuaternion(q));camera.lookAt(target);renderer.render(scene,camera);
   renderer.domElement.dataset.state=JSON.stringify({chapter:chapter+1,degrees:clock.degrees,running:clock.running,speed:clock.speed,selected,camera:{q:q.toArray(),radius,target:target.toArray()}});
   if(audits&&now-lastAudit>100){renderer.domElement.dataset.audit=JSON.stringify(snapshot());lastAudit=now;}
   if(now-lastUI>100){updateUI();lastUI=now;}requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 }catch(error){$('loading').textContent=error.message;console.error(error);for(const id of ['play','angle','stepBack','stepForward','speed'])$(id).disabled=true;}
})();
