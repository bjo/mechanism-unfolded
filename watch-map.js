/* Uses the existing curriculum as the sole source of chapter order and IDs. */
(()=>{
 const course=window.watchCurriculum;if(!course)return;
 const paths=[
 ['용두의 입력 → 태엽 → 태엽통','감긴 스프링이 어떻게 힘을 저장하고 태엽통을 돌리는지 살펴봅니다.'],
 ['태엽통 → 센터 → 3번 → 4번 휠','맞물린 큰 휠과 작은 피니언이 회전을 전달하고 속도를 바꿉니다.'],
 ['이스케이프 휠 → 팔렛 포크','계속 풀리려는 힘을 잠그고, 짧게 놓아 주는 순서를 관찰합니다.'],
 ['밸런스 → 헤어스프링 → 포크','왕복하는 진동자가 일정한 박자를 만드는 연결을 따라갑니다.'],
 ['캐넌 피니언 → 분 휠 → 시 휠','같은 중심에서 두 바늘이 다른 속도로 움직이는 이유를 봅니다.'],
 ['용두 위치 → 연결 전환 → 감기 / 맞춤','밀었을 때와 당겼을 때 손의 회전이 어디로 전달되는지 비교합니다.'],
 ['4번 휠 → 전달 기어 → 중앙 초침축','시·분·초의 동축 구조와 초침의 별도 전달 경로를 확대합니다.'],
 ['로터 → 방향 전환 기구 → 태엽통','어느 방향으로 흔들려도 태엽을 감는 잠금·공회전 경로를 봅니다.'],
 ['24시간 입력 → 날짜판 / 요일판','한 칸 넘김, 점퍼의 고정, 용두로 날짜와 요일을 맞추는 경로입니다.'],
 ['기준 회전 → 24시간 바늘 → 보정','두 번째 시간대를 읽고 독립적으로 맞추는 구조를 살펴봅니다.'],
 ['하루의 입력 → 달 위상 원판','날마다 작은 각도만큼 움직이며 달의 모습을 표시합니다.'],
 ['푸셔 → 제어부 → 클러치 / 해머','시작·정지·분 누적·영점 복귀를 손의 입력부터 바늘까지 연결합니다.']
 ];
 const map=document.createElement('section');map.id='watchRoadmap';map.className='watch-roadmap';map.setAttribute('aria-labelledby','watchMapTitle');
 map.innerHTML='<div class="eyebrow">THE WHOLE JOURNEY</div><h2 id="watchMapTitle">감긴 태엽에서, 시간을 읽기까지.</h2><p>기본 7편은 힘의 흐름을 따라 연결됩니다. 심화 5편은 기본 무브먼트에 각각 하나의 기능을 더해 살펴보는 독립 모듈입니다.</p>';
 for(const [start,end,label] of [[0,7,'기본편 · 힘을 저장하고, 나누고, 읽기'],[7,12,'심화편 · 한 번에 하나의 기능 더하기']]){
  const section=document.createElement('section'),h=document.createElement('h3'),grid=document.createElement('div');h.textContent=label;grid.className='watch-map-grid';section.append(h,grid);
  course.lessons.slice(start,end).forEach((lesson,j)=>{const i=start+j,a=document.createElement('a');a.href='watch.html?lesson='+(i+1);a.dataset.mapLesson=i;a.innerHTML=`<span>${String(i+1).padStart(2,'0')} / ${i<7?'FOUNDATIONS':'COMPLICATIONS'}</span><h4>${lesson[0]}</h4><b>${paths[i][0]}</b><p>${paths[i][1]}</p><small>이 챕터 탐구하기 ↗</small>`;a.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();course.select(i);const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);const title=document.getElementById('pageTitle');title.tabIndex=-1;title.focus({preventScroll:true});document.querySelector('.heading').scrollIntoView({behavior:'auto'});};grid.append(a);});map.append(section);
 }
 document.querySelector('main').append(map);const link=document.createElement('a');link.href='#watchRoadmap';link.className='watch-map-link';link.textContent='전체 12개 챕터 맵 ↘';document.querySelector('nav .course-brand').after(link);
 function sync(){map.querySelectorAll('[data-map-lesson]').forEach(a=>{const active=+a.dataset.mapLesson===course.current;if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}new MutationObserver(sync).observe(document.getElementById('pageTitle'),{childList:true});sync();
})();
