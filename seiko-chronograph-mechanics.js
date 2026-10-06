/* 6139A topology: Seiko Technical Guide, printed pp. 3–10, figs. 6–9, 12–24.
 * Dimensions below are enlarged teaching geometry, NOT Seiko manufacturing data.
 * Coordinates are viewed from the movement side. Positive z faces the observer.
 */
(function(root){
 const tau=2*Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const rotate=([x,y],a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
 const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 // Contact of a straight pusher pad with a rotated, finite-width lever.
 // Clip the lever polygon to the pad width before taking its support edge.
 function padSupport(polygon,axis,min,max,direction){
  let p=polygon;const across=1-axis;
  for(const [edge,sign] of [[min,1],[max,-1]]){const out=[];for(let i=0;i<p.length;i++){
   const a=p[i],b=p[(i+1)%p.length],inside=x=>sign*(x[across]-edge)>=0;
   if(inside(a))out.push(a);if(inside(a)!==inside(b)){const t=(edge-a[across])/(b[across]-a[across]);out.push(add(a,sub(b,a).map(v=>v*t)));}
  }p=out;}
  if(!p.length)throw Error('Pusher misses lever');
  return direction>0?Math.max(...p.map(v=>v[axis])):Math.min(...p.map(v=>v[axis]));
 }
 const leverPolygon=(pivot,a,from,to,width)=>[[from,-width/2],[to,-width/2],[to,width/2],[from,width/2]].map(p=>add(pivot,rotate(p,a)));
 function resetLeverPose(hammer){const pivot=[-.65,1.80],heel=add(hammerPivot,rotate([0,.28],hammer)),v=sub(heel,pivot),angle=Math.atan2(v[1],v[0])-Math.asin((.035+.075/2)/Math.hypot(...v));return {pivot,heel,angle};}
 const Index=typeof module!=='undefined'&&module.exports?require('./indexing-motion.js'):root.IndexingMotion;
 const column=[0,1.35],firstPivot=[-1.1,.70],follower=[1.1,.26],joint=[-.85,-1.0],secondPivot=[1.1,-.5];
 const pillars=6,step=tau/12,inner=.23,outer=.36,halfWidth=.16,followerRadius=.03;
 // Distance to the actual annular-sector pillar outlines used by the renderer.
 function pillarGap(point,angle){
  const v=sub(point,column),r=Math.hypot(...v),a=Math.atan2(v[1],v[0]);let gap=Infinity;
  for(let i=0;i<pillars;i++){
   const center=-Math.PI/2+i*tau/pillars+angle,delta=wrap(a-center),edge=clamp(delta,-halfWidth,halfWidth);
   const u=[Math.cos(center+edge),Math.sin(center+edge)],rr=clamp(dot(v,u),inner,outer),q=u.map(x=>x*rr);
   let d=Math.hypot(...sub(v,q));if(Math.abs(delta)<=halfWidth&&r>=inner&&r<=outer)d=-Math.min(r-inner,outer-r,(halfWidth-Math.abs(delta))*r);
   gap=Math.min(gap,d-followerRadius);
  }
  return gap;
 }
 function couplingPose(angle){
  const gap=t=>pillarGap(add(firstPivot,rotate(follower,t)),angle);
  let end=.15,previous=0;
  for(let i=1;i<=120;i++){const t=.15*i/120;if(gap(t)<0){let lo=previous,hi=t;for(let j=0;j<28;j++){const m=(lo+hi)/2;if(gap(m)<0)hi=m;else lo=m;}end=lo;break;}previous=t;}
  const pin=add(firstPivot,rotate(joint,end)),rest=add(firstPivot,joint),a0=Math.atan2(rest[1]-secondPivot[1],rest[0]-secondPivot[0]);
  const second=Math.atan2(pin[1]-secondPivot[1],pin[0]-secondPivot[0])-a0;
  return {first:end,second,pin,gap:gap(end),lift:.12*(1-clamp(end/.15,0,1)),engaged:end>.149};
 }
 // Two fixed flat hammer faces on ONE pivoting body. Each heart is solved
 // against its transformed face, rather than moving a hammer to follow a cam.
 const hammerPivot=[-.80,.85],hammerLug=[.8074369636693477,.5121507206974394],centers=[[0,0],[.78,.90]],heart=[];
 for(let i=0;i<=240;i++){const t=-Math.PI+i*tau/240;if(i===120){heart.push([-.09,.15],[0,.075],[.09,.15]);continue;}const h=.15+.18*Math.sin(Math.abs(t)/2),dh=.09*Math.cos(t/2)*Math.sign(t);heart.push([h*Math.sin(t)+dh*Math.cos(t),h*Math.cos(t)-dh*Math.sin(t)]);}
 const faces=centers.map(c=>{const d=sub(c,hammerPivot),l=Math.hypot(...d),normal=[d[1]/l,-d[0]/l],center=add(c,normal.map(v=>v*.15));return {center,normal,orientation:Math.atan2(normal[1],normal[0])-Math.PI/2};});
 function support(a){return Math.max(...heart.map(p=>rotate(p,a)[1]));}
 function hammerContact(index,phi,from){
  const f=faces[index],n=rotate(f.normal,phi),p=add(hammerPivot,rotate(sub(f.center,hammerPivot),phi)),distance=dot(sub(p,centers[index]),n);
  let angle=wrap(from),relative=wrap(angle-phi);
  if(support(relative)>distance){let lo=0,hi=Math.PI;for(let i=0;i<35;i++){const m=(lo+hi)/2;if(support(m)<=distance)lo=m;else hi=m;}angle=phi+Math.sign(relative)*lo;}
  return {angle,gap:distance-support(angle-phi),face:p,normal:n};
 }
 const minuteCenter=centers[1],counterDistance=Math.hypot(...minuteCenter),counterHeight=Math.sqrt(.8**2-(counterDistance/2)**2),idler=[minuteCenter[0]/2+minuteCenter[1]/counterDistance*counterHeight,minuteCenter[1]/2-minuteCenter[0]/counterDistance*counterHeight],minuteIndex=Index.external({period:60,teeth:10,distance:Math.hypot(...idler),reach:Math.hypot(...idler)-.25});
 const starPoints=[];for(let i=0;i<10;i++)for(const [f,r] of [[0,minuteIndex.radius*.72],[0,minuteIndex.radius+.018],[.78,minuteIndex.radius*.72]]){const a=(i+f)*tau/10;starPoints.push([r*Math.cos(a),r*Math.sin(a)]);}
 function polygonGap(p,polygon){let inside=false,gap=Infinity;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[j],b=polygon[i],v=sub(b,a),t=clamp(dot(sub(p,a),v)/dot(v,v),0,1);gap=Math.min(gap,Math.hypot(...sub(p,add(a,v.map(x=>x*t)))));
  if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside?-gap:gap;}
 function leafPoints(bend){const length=Math.hypot(...idler)-.25-.18,points=[];for(let i=0;i<=24;i++){const s=length*i/24,a=bend*s/length;points.push([.18+(bend?Math.sin(a)*length/bend:s),bend?(1-Math.cos(a))*length/bend:0]);}return points;}
 function resetLeaf(second,minute){const direction=Math.atan2(idler[1],idler[0]),fa=direction+minuteIndex.end+second,sa=direction+Math.PI+Math.PI/10-minute*3;
  const clearance=b=>Math.min(...leafPoints(b).map(p=>polygonGap(rotate(sub(rotate(p,fa),idler),-sa),starPoints)))-.012;
  let bend=0,gap=clearance(0);if(gap<-.001)for(let i=1;i<=60;i++){const choices=[i*.04,-i*.04].map(b=>({b,g:clearance(b)})).sort((a,b)=>b.g-a.g);if(choices[0].g>gap){bend=choices[0].b;gap=choices[0].g;}if(gap>=0)break;}
  return {bend,gap,points:leafPoints(bend)};
 }
 function minutePose(elapsed){const p=minuteIndex.pose(elapsed);return {...p,angle:p.turns*tau/30,idler:-p.turns*tau/10};}
 class Controller{
  constructor(){this.reset();}
  reset(){this.running=false;this.elapsed=0;this.column=0;this.motion=null;this.resetMotion=null;this.input=0;this.blocked=0;}
  toggle(power=true){if(this.motion||this.resetMotion||!this.running&&!power)return false;this.motion={t:0,base:this.column,wasRunning:this.running};return true;}
  resetPress(){if(this.running||this.motion||this.resetMotion){this.blocked=1.5;return false;}this.resetMotion={t:0,from:[this.elapsed/60*tau,minutePose(this.elapsed).angle]};return true;}
  advance(dt){this.input+=dt/60*tau;if(this.running&&!this.resetMotion&&couplingPose(this.column).engaged)this.elapsed+=dt;}
  tick(dt){
   this.blocked=Math.max(0,this.blocked-dt);
   if(this.motion){const m=this.motion;m.t+=dt;const u=clamp((m.t-.12)/.8,0,1);this.column=m.base-step*u;if(!m.committed&&u===1){this.running=!m.wasRunning;m.committed=true;}if(m.t>=1.5)this.motion=null;}
   if(this.resetMotion){this.resetMotion.t+=dt;if(this.resetMotion.t>=2.8){this.elapsed=0;this.resetMotion=null;}}
  }
  pose(){
   const reset=this.resetMotion,t=reset?.t||0,press=reset?clamp(t/.9,0,1)*(1-clamp((t-2.2)/.6,0,1)):0;
   const phi=-.42*(1-press),from=reset?.from||[this.elapsed/60*tau,minutePose(this.elapsed).angle];
   const hearts=from.map((a,i)=>reset?(t<=2.2?hammerContact(i,phi,a):{angle:0,gap:null}):{angle:a,gap:null});
   const m=this.motion,startPress=m?(m.t<=.92?clamp(m.t/.92,0,1):clamp((1.5-m.t)/.58,0,1)):0;
   return {column:this.column,coupling:couplingPose(this.column),hammer:phi,hearts,press,startPress,resetting:!!reset,running:this.running,elapsed:this.elapsed,input:this.input,minute:minutePose(this.elapsed),phase:this.blocked?'리셋 잠김 · 해머 걸림부가 컬럼 기둥에 닿아 움직일 수 없습니다.':reset?(t<.9?'해머 접근 · 돌출면부터 접촉':t<2.2?'두 하트캠의 영점 면에 안착':'해머 복귀 · 바늘은 영점 유지'):m?(m.t<.92?'작동 레버와 갈고리가 래칫 한 칸 전진':'버튼 복귀 · 점퍼가 컬럼 휠 위치 유지'):this.running?'결합 레버가 벌어짐 → 스프링이 클러치를 눌러 동력 전달':'결합 레버가 클러치 링을 들어 올려 동력 차단'};
  }
 }
 const api={tau,rotate,add,sub,dot,wrap,padSupport,leverPolygon,resetLeverPose,column,firstPivot,follower,joint,secondPivot,pillars,step,inner,outer,halfWidth,followerRadius,pillarGap,couplingPose,hammerPivot,hammerLug,centers,faces,heart,hammerContact,idler,minuteCenter,minuteIndex,starPoints,polygonGap,leafPoints,resetLeaf,minutePose,Controller};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SeikoChronograph=api;
})(typeof window==='undefined'?globalThis:window);
