/* A130 Simpson connection graph; illustrative tooth counts and operating map.
   Source, reference mapping and boundaries: AUTOMATIC-DESIGN.md. */
(function(root){
 'use strict';
 const tau=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const spec={sun:30,front:54,rear:66,module:.06,face:.24,frontZ:0,rearZ:2.25};
 const ratios={1:54/150,2:54/84,3:1,R:-30/66,N:0};
 function speeds(gear,input=1){const out=ratios[gear]*input;let sun=0,front=0,rearCarrier=0;
  if(gear==='1'){front=input;sun=-66/30*out;}
  if(gear==='2'){front=input;rearCarrier=66*out/96;}
  if(gear==='3'){front=sun=rearCarrier=input;}
  if(gear==='R'){sun=input;front=(84*out-30*sun)/54;}
  return {sun,front,rear:out,output:out,frontCarrier:out,rearCarrier};
 }
 const devices={N:[],1:['C1','F2'],2:['C1','B2','F1'],3:['C1','C2','B2'],R:['C2','B3']};
 function internalOutline(n,m=spec.module){const r=n*m/2,rb=r*Math.cos(Math.PI/9),lo=r-m,hi=r+1.25*m,inv=x=>Math.tan(x)-x,base=inv(Math.acos(rb/r)),half=Math.PI/(2*n)-.025/n,angle=rr=>half-base+(rr<=rb?0:inv(Math.acos(rb/rr))),p=[];
  for(let k=0;k<n;k++){const a=k*tau/n;p.push([hi*Math.cos(a-Math.PI/n),hi*Math.sin(a-Math.PI/n)]);for(let j=8;j>=0;j--){const rr=lo+(hi-lo)*j/8,t=a-angle(rr);p.push([rr*Math.cos(t),rr*Math.sin(t)]);}for(let j=0;j<=8;j++){const rr=lo+(hi-lo)*j/8,t=a+angle(rr);p.push([rr*Math.cos(t),rr*Math.sin(t)]);}p.push([hi*Math.cos(a+Math.PI/n),hi*Math.sin(a+Math.PI/n)]);}return p;
 }
 function planetPose(ring,c,s,i){const n=(ring-spec.sun)/2,orbit=(spec.sun+n)*spec.module/2,a=i*tau/3+c,phase=((spec.sun+n)*i*tau/3+n*Math.PI+Math.PI)/n;return {n,orbit,x:orbit*Math.cos(a),y:orbit*Math.sin(a),angle:c-(s-c)*spec.sun/n+phase};}
 function packPose(apply){const v=clamp(apply,0,1),t=.055,g=.020*(1-v),centers=Array.from({length:6},(_,i)=>.0575+g+i*(t+g)),end=centers[5]+t/2;return {centers,thickness:t,gap:g,piston:end+.035,travel:.120*v};}
 class State{
  constructor(){this.gear='1';this.target='1';this.selector='D';this.speed=20;this.pedal=35;this.running=false;this.rate=1;this.engine=0;this.input=0;this.angles=speeds('N');this.apply={C1:1,C2:0,B2:0,B3:0};this.transition=null;this.lock=0;this.f1=0;this.stator=0;this.time=0;this.velocity=speeds('1',0);this.message='D에서 차속 입력을 올려 자동 변속을 관찰하세요.';}
  request(g){g=String(g);if(!Object.hasOwn(ratios,g))return false;if(this.transition)return false;if((g==='R'||this.gear==='R')&&this.speed>0){this.message='후진 전환은 차속 입력 0에서 가능합니다.';return false;}if(g===this.gear)return true;if(['1','2','3'].includes(g)&&['1','2','3'].includes(this.gear)&&Math.abs(+g-this.gear)>1)g=String(+this.gear+Math.sign(+g-this.gear));
   this.transition={from:this.gear,to:g,time:0,start:{...this.apply}};this.target=g;return true;}
  setSelector(v){if(!['D','1','2','3','N','R'].includes(v))return;if(v==='R'&&this.speed>0){this.message='차속을 0으로 낮춘 뒤 R을 선택하세요.';return;}if(this.gear==='R'&&this.speed>0){this.message='후진에서 나올 때도 차속 입력을 0으로 낮추세요.';return;}this.selector=v;if(v!=='D')this.request(v);else if(this.gear==='N'||this.gear==='R')this.request('1');}
  choose(){if(this.transition)return;if(this.selector!=='D'){this.request(this.selector);return;}const up1=22+this.pedal*.18,up2=48+this.pedal*.22;let g=this.gear;if(g==='N'||g==='R')g='1';if(g==='1'&&this.speed>up1)g='2';else if(g==='2'&&this.speed>up2)g='3';else if(g==='3'&&this.speed<up2-12)g='2';else if(g==='2'&&this.speed<up1-9)g='1';this.request(g);}
  tick(dt){if(!this.running)return;dt=Math.min(dt,.05)*this.rate;this.time+=dt;this.choose();let blend=0,from=this.gear,to=this.gear;
   if(this.transition){const tr=this.transition;tr.time+=dt;from=tr.from;to=tr.to;const fill=clamp(tr.time/.7,0,1);blend=clamp((tr.time-.7)/1.1,0,1);for(const key of Object.keys(this.apply)){const a=devices[to].includes(key)?1:0;this.apply[key]=a>tr.start[key]?tr.start[key]+(a-tr.start[key])*fill:tr.start[key]+(a-tr.start[key])*blend;}this.message=tr.time<.7?'유압 공급 · 피스톤이 틈을 메웁니다.':blend<1?'마찰면 접촉 · 회전 차이를 줄입니다.':'동기화 완료';if(blend===1){this.gear=to;this.transition=null;}}
   const wantLock=this.selector==='D'&&this.target==='3'&&this.speed>=70&&this.pedal<65&&!this.transition;
   this.lock=clamp(this.lock+(wantLock?1:-1)*dt,0,1);
   const slipBase=this.gear==='N'?.96:clamp(this.speed/85,0,.96),coupling=slipBase+(1-slipBase)*Math.max(0,this.lock*2-1),inputRate=coupling*(.7+this.pedal*.013),engineRate=.7+this.pedal*.013;
   const a=speeds(from,inputRate),b=speeds(to,inputRate);for(const k of Object.keys(a)){this.velocity[k]=a[k]+(b[k]-a[k])*blend;this.angles[k]+=this.velocity[k]*dt;}this.f1+=(this.apply.B2>0&&this.velocity.sun>=0?0:this.velocity.sun)*dt;this.engine+=engineRate*dt;this.input+=inputRate*dt;
   this.stator+=(coupling>.85?inputRate:0)*dt;this.coupling=coupling;this.engineRate=engineRate;this.inputRate=inputRate;
  }
  get phase(){return this.transition?(this.transition.time<.7?'틈 메우기':'마찰 동기화'):'체결 유지';}
  snapshot(){return {gear:this.gear,target:this.target,selector:this.selector,speed:this.speed,pedal:this.pedal,running:this.running,phase:this.phase,transition:this.transition?{...this.transition}:null,apply:{...this.apply},angles:{...this.angles},velocity:{...this.velocity},engine:this.engine,input:this.input,lock:this.lock,f1:this.f1,stator:this.stator,coupling:this.coupling||0,engineRate:this.engineRate||0,inputRate:this.inputRate||0,time:this.time,message:this.message};}
 }
 const api={spec,ratios,devices,speeds,planetPose,packPose,internalOutline,State,tau,clamp};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AutoMechanics=api;
})(typeof window==='undefined'?globalThis:window);
