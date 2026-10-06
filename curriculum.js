/* A single curriculum catalog owns labels, order, and navigation. Mechanics use stable lesson IDs. */
(()=>{
 if(!window.watchApp){document.querySelector('nav').textContent='3D 초기화에 실패했습니다. 화면의 안내를 확인한 뒤 새로고침해 주세요.';return;}
 const lessons=[
 ['태엽 · 힘 저장',0,2],['기어열 · 움직임 전달',1,0],['탈진기 · 힘 나누기',2,0],['밸런스 · 박자 만들기',3,0],['시침·분침 · 두 속도',4,1],['용두 · 감기와 시간 맞춤',4,0,'crown'],['초침 · 동축 구조',4,2,'coax'],
 ['오토매틱 · 스스로 감기',5,0],['날짜·요일 · 두 달력',6,0],['GMT · 두 시간대',7,0],['문페이즈 · 달의 위상',8,0],['크로노그래프 · 측정과 리셋',9,1]
 ];
 const nav=document.querySelector('nav'),$=id=>document.getElementById(id);let current=0;
 nav.replaceChildren();const brand=document.createElement('div');brand.className='course-brand';brand.innerHTML='<span>MECHANISM UNFOLDED / WATCH</span><strong>기계식 시계 탐험</strong><small>기본 7편 · 심화 5편</small>';nav.append(brand);
 for(const [from,to,label] of [[0,7,'기본편 · 에너지에서 바늘까지'],[7,12,'심화편 · 기능을 더하는 방법']]){const section=document.createElement('section');section.className='course-section';const h=document.createElement('h2');h.textContent=label;section.append(h);lessons.slice(from,to).forEach((l,j)=>{const i=from+j,b=document.createElement('button');b.className='navstep';b.dataset.lesson=i;b.innerHTML=`<b>${String(i+1).padStart(2,'0')}</b><span>${l[0]}</span>`;b.onclick=()=>select(i);section.append(b);});nav.append(section);}
 const note=document.createElement('p');note.className='course-note';note.textContent='부품에서 시작해, 전체를 이해합니다.';nav.append(note);
 function select(i){current=i;const url=new URL(location.href);url.searchParams.set('lesson',String(i+1));history.replaceState(null,'',url);const [name,step,focus,view]=lessons[i];window.watchApp.setStep(step);window.watchApp.resetCrown();if(view==='crown')window.watchApp.crown(true);else if(view==='coax')window.watchApp.coax(true);else window.watchApp.focus(focus);
 nav.querySelectorAll('[data-lesson]').forEach(b=>{const active=+b.dataset.lesson===i;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 if(view==='crown'){$('journeyTitle').textContent='같은 용두가, 감기와 시간 맞춤을 선택합니다.';$('journeyIntro').textContent='앞에서 본 분침·시침 연결을 이번에는 손으로 돌립니다. 3D 위에서 용두 위치를 고른 뒤 앞뒤 회전을 비교하세요.';$('journeySteps').replaceChildren();$('journeyVisual').replaceChildren();$('journeyNote').textContent='밀어 넣음 → 태엽 감기. 한 칸 당김 → 분 휠을 거쳐 시침·분침 맞춤. 기본 시계에는 날짜 위치가 없습니다. 심화편의 날짜·GMT·달 위상에는 해당 기능을 조정하는 중간 위치가 추가됩니다.';$('pageSub').textContent='두 바늘의 연결을 이해한 뒤, 용두로 직접 시간을 맞춰 봅니다.';}
 $('pageTitle').textContent=name;$('chapter').textContent=`${String(i+1).padStart(2,'0')} / ${lessons.length} · ${i<7?'기본편':'심화편'}`;$('lessonNo').textContent=String(i+1).padStart(2,'0');$('lessonTitle').textContent=name;$('next').textContent=i===lessons.length-1?'처음부터 다시 보기':'다음 · '+lessons[i+1][0];
 if(i===11)document.querySelector('[data-chrono-page="0"]')?.click();
 }
 $('next').onclick=()=>select((current+1)%lessons.length);
 const originalReset=$('restart').onclick;$('restart').onclick=()=>{originalReset();select(current);};
 window.watchCurriculum={lessons,select,get current(){return current;}};const initial=Number(new URL(location.href).searchParams.get('lesson'))-1;select(Number.isInteger(initial)&&initial>=0&&initial<lessons.length?initial:0);
})();
