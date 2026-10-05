/* Live sectional schematic, driven by the same state as the 3D winding train. */
window.createAutoExplainer=function(host){
 const el=document.createElement('section');el.className='auto-explainer';el.hidden=true;host.append(el);
 const wheel=(id,x,y,color)=>`<g transform="translate(${x} ${y})"><circle r="29" fill="white" stroke="${color}" stroke-width="5"/><g id="${id}" stroke="${color}" stroke-width="3"><path d="M-23 0H23M0 -23V23"/><circle r="7" fill="white"/></g></g>`;
 el.innerHTML=`<div class="auto-live-title"><h3>방향이 바뀌면, 잠기는 클러치가 바뀝니다.</h3><output id="autoDirection" aria-live="polite"></output></div><p>이 모델의 기어들은 계속 맞물려 있습니다. 바뀌는 것은 각 휠 <b>안쪽 클러치의 잠김</b>입니다. A는 로터의 첫 이웃, B는 A의 다음 이웃입니다.</p>
 <svg viewBox="0 0 840 310" role="img" aria-label="로터에서 A와 B의 위층 기어로 전달된 회전이 잠긴 클러치를 통해 아래층과 태엽으로 이어지는 실시간 단면 개념도">
 <defs><marker id="autoArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
 <text x="30" y="24">무브먼트 뒤에서 본 방향 · 연결을 펼친 단면 개념도</text>
 <g fill="none" stroke="#148fc5" stroke-width="3" marker-end="url(#autoArrow)"><path d="M112 78H214"/><path d="M286 78H434"/></g>
 ${wheel('autoRotorDiagram',78,78,'#148fc5')}${wheel('autoATop',250,78,'#148fc5')}${wheel('autoBTop',470,78,'#148fc5')}
 <text x="78" y="130" text-anchor="middle">로터 입력</text><text x="250" y="40" text-anchor="middle">A · 위층 입력</text><text x="470" y="40" text-anchor="middle">B · 위층 입력</text>
 <path id="autoCoupleA" d="M250 111V190" stroke-width="9" fill="none" marker-end="url(#autoArrow)"/><path id="autoCoupleB" d="M470 111V190" stroke-width="9" fill="none" marker-end="url(#autoArrow)"/>
 <text id="autoLockA" x="292" y="157"></text><text id="autoLockB" x="512" y="157"></text>
 ${wheel('autoABottom',250,228,'#b18a49')}${wheel('autoBBottom',470,228,'#b18a49')}
 <g fill="none" stroke="#b18a49" stroke-width="3" marker-end="url(#autoArrow)"><path d="M284 228H345V278H605V228H663"/><path d="M504 228H605"/></g>
 ${wheel('autoBarrelDiagram',710,228,'#b18a49')}
 <text x="250" y="296" text-anchor="middle">아래층 ↺</text><text x="470" y="296" text-anchor="middle">아래층 ↺</text><text x="710" y="279" text-anchor="middle">감속 후 태엽 중심 ↻</text>
 <text x="705" y="82" text-anchor="middle">파랑: 로터를 따라 회전</text><text x="705" y="111" text-anchor="middle">주황: 잠김 · 힘 전달</text><text x="705" y="140" text-anchor="middle">회색: 헛돎 · 전달 차단</text>
 </svg>
 <div class="auto-compare"><article id="autoCaseCW"><strong>↻ 로터가 시계 방향이면</strong><p>A의 위층은 ↺로 돕니다. A가 잠겨 아래층까지 함께 돌리고, B는 위층과 아래층 사이에서 미끄러집니다.</p><b>A 잠김 → 공통 출력 → 태엽 감기</b></article><article id="autoCaseCCW"><strong>↺ 로터가 반시계 방향이면</strong><p>A의 위층은 ↻, 그다음 B의 위층은 ↺로 돕니다. 이번에는 B가 잠겨 아래층을 구동하고 A는 헛돕니다.</p><b>B 잠김 → 같은 공통 출력 → 태엽 감기</b></article></div>
 <p class="auto-key-note"><b>공회전 = 멈춰 있음은 아닙니다.</b> 잠기지 않은 쪽도 위층은 로터에, 아래층은 공통 출력에 물려 돌아갑니다. 두 층이 서로 독립적으로 회전하는 상태입니다. 확대 단면에서 걸쇠 끝이 경사면을 타고 올라간 뒤 다음 홈으로 내려오는 접촉을 보세요. 내부 걸쇠 모양은 원리를 보이기 위한 단순화입니다.</p><p id="autoLiveNote"></p>`;
 const $=id=>el.querySelector('#'+id);const cutaway=createRatchetCutaway(el);
 return {element:el,update({visible,direction,moving,paused,rotor,output,slipping,poses}){el.hidden=!visible;if(!visible)return;cutaway.update(poses,paused);const a=direction<0;
 $('autoDirection').textContent=(paused?'일시 정지 · ':moving?'입력 중 · ':'마지막 입력 · ')+(a?'↻ 시계 방향 — A 잠김':'↺ 반시계 방향 — B 잠김');
 for(const [id,on] of [['A',a],['B',!a]]){const line=$('autoCouple'+id);line.setAttribute('stroke',on?'#df811d':'#aab5bd');line.setAttribute('stroke-dasharray',on?'':'4 9');$('autoLock'+id).textContent=on?'잠김 · 함께 회전':'헛돎 · 독립 회전';$('autoLock'+id).setAttribute('fill',on?'#a45b10':'#637784');}
 $('autoCaseCW').classList.toggle('active',a);$('autoCaseCCW').classList.toggle('active',!a);
 const deg=180/Math.PI;for(const [id,v] of [['autoRotorDiagram',rotor],['autoATop',-rotor],['autoBTop',rotor],['autoABottom',output*8],['autoBBottom',output*8],['autoBarrelDiagram',-output]])$(id).setAttribute('transform',`rotate(${-v*deg})`);
 $('autoLiveNote').textContent=slipping?'완충: 내부 방향 선택은 같지만, 태엽 바깥 끝의 브라이들이 미끄러져 더 감기지 않습니다.':'두 방향 모두 아래층은 ↺, 마지막 태엽 중심은 ↻로 돕니다. 방향 버튼과 일시 정지로 위층·아래층의 회전을 비교하세요.';
 el.dataset.activeClutch=a?'A':'B';el.dataset.moving=String(moving);el.dataset.output=String(output);
 }};
};
