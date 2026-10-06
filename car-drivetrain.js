/* SI-free teaching dimensions. State, constraints and rendered geometry share this spec.
   Source/topology and omitted physics: CAR-FOUNDATIONS.md. */
(function(root){
 'use strict';
 const TAU=2*Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n;
 const spec={module:.06,axisDistance:1.8,gears:[{n:20,z:-1.65},{n:40,z:-1.65},{n:20,z:-.4},{n:40,z:-.4},{n:28,z:1.2},{n:32,z:1.2}],ratios:{1:.25,2:.4375,R:-.5},sleeveCenter:.4,sleeveTravel:.47,arm:1.55,inner:.8,rackZ:.65,armZ:.45,armX:.18};
 // Involute flanks; finite backlash. One shared polygon feeds drawing and collision probes.
 function gearOutline(n,m=spec.module){const r=n*m/2,rb=r*Math.cos(Math.PI/9),ra=r+m,rf=r-1.25*m,inv=x=>Math.tan(x)-x,base=inv(Math.acos(rb/r)),half=Math.PI/(2*n)-.015/n,out=[];
  const angle=rr=>half+base-(rr<=rb?0:inv(Math.acos(rb/rr)));
  for(let k=0;k<n;k++){const a=k*TAU/n;out.push([rf*Math.cos(a-Math.PI/n),rf*Math.sin(a-Math.PI/n)]);out.push([rf*Math.cos(a-angle(Math.max(rf,rb))),rf*Math.sin(a-angle(Math.max(rf,rb)))]);for(let j=0;j<=8;j++){const rr=Math.max(rf,rb)+(ra-Math.max(rf,rb))*j/8,t=a-angle(rr);out.push([rr*Math.cos(t),rr*Math.sin(t)]);}for(let j=8;j>=0;j--){const rr=Math.max(rf,rb)+(ra-Math.max(rf,rb))*j/8,t=a+angle(rr);out.push([rr*Math.cos(t),rr*Math.sin(t)]);}out.push([rf*Math.cos(a+angle(Math.max(rf,rb))),rf*Math.sin(a+angle(Math.max(rf,rb)))]);out.push([rf*Math.cos(a+Math.PI/n),rf*Math.sin(a+Math.PI/n)]);}return out;
 }
 function steering(rack,bump,side){
  const x=side*(spec.inner+Math.sqrt(spec.arm**2-bump**2)),y=1.3+bump,inner=[side*spec.inner+rack,1.3,spec.rackZ];
  const length=Math.hypot(spec.arm-spec.armX,spec.armZ-spec.rackZ);
  const endpoint=a=>[x-side*spec.armX*Math.cos(a)+spec.armZ*Math.sin(a),y,side*spec.armX*Math.sin(a)+spec.armZ*Math.cos(a)];
  const f=a=>Math.hypot(...endpoint(a).map((v,i)=>v-inner[i]))-length;
  let best=0,error=Infinity;for(let a=-1.1;a<=1.1;a+=.01){let b=a+.01;if(f(a)*f(b)<=0){let lo=a,hi=b;for(let j=0;j<40;j++){const mid=(lo+hi)/2;if(f(lo)*f(mid)<=0)hi=mid;else lo=mid;}const q=(lo+hi)/2;if(Math.abs(q)<error){best=q;error=Math.abs(q);}}}
  return {side,x,y,angle:best,inner,outer:endpoint(best),length,error:Math.abs(f(best)),armAngle:side*Math.asin(bump/spec.arm)};
 }
 class Transmission{
  constructor(){this.engine=0;this.input=0;this.output=0;this.clutch=1;this.gear='N';this.target='N';this.shift=0;this.sleeve=0;this.reverse=0;this.phase='중립';this.busy=false;this.message='클러치를 밟은 상태입니다. 기어를 선택하세요.';this.start=0;this.inputSpeed=0;this.outputSpeed=0;}
  setClutch(v){if(this.busy&&v<1){this.message='동기화·체결이 끝난 뒤 클러치를 놓으세요.';return false;}this.clutch=v>=.5?1:0;return true;}
  request(gear){if(!['N','1','2','R'].includes(gear))return false;if(this.busy)return false;if(this.clutch<.98){this.message='먼저 클러치를 끝까지 밟아 엔진 연결을 끊으세요.';return false;}if(gear==='R'&&Math.abs(this.outputSpeed)>.01){this.message='후진은 회전을 멈춘 뒤 선택하세요.';return false;}this.target=gear;this.start=this.sleeve;this.reverseStart=this.reverse;this.shift=0;this.busy=true;this.gear='N';this.phase='연결 해제';this.message='포크 → 동기화 링 → 연결 이빨을 관찰하세요.';return true;}
  tick(dt,powered){
   const prevIn=this.input,prevOut=this.output;this.engine+=powered;
   if(!this.busy){const drive=1-this.clutch;this.input+=powered*drive;const ratio=spec.ratios[this.gear]||0;this.output+=powered*drive*ratio;}
   if(this.busy){this.shift=Math.min(1,this.shift+dt/2.4);const t=this.shift,dir=this.target==='1'?-1:this.target==='2'?1:0;
    if(t<.22){this.sleeve=this.start*(1-t/.22);this.reverse=this.reverseStart*(1-t/.22);this.phase='기존 연결 해제';}
    else if(t<.47){this.sleeve=dir*.30*(t-.22)/.25;this.phase=dir?'원뿔 마찰면 접근':'중립 통과';}
    else if(t<.78){this.sleeve=dir*.30;this.phase=dir?'원뿔 접촉 · 회전 맞추기':'후진 이빨 정렬';const ratio=spec.ratios[this.target];if(ratio){const gearAngle=ratio*this.input+this.offset(this.target),pitch=TAU/(this.target==='R'?20:12),err=mod(this.output-gearAngle+pitch/2,pitch)-pitch/2;this.input+=err/ratio*Math.min(1,dt*24);}}
    else {this.phase=this.target==='R'?'중간 기어 진입':'연결 이빨 체결';this.sleeve=dir*(.30+.17*(t-.78)/.22);this.reverse=this.target==='R'?(t-.78)/.22:0;}
    if(t===1){this.gear=this.target;this.busy=false;this.phase=this.gear==='N'?'중립':this.gear+'단 연결';this.message='클러치를 놓고 재생해 동력 경로를 확인하세요.';}
   }
   this.inputSpeed=dt? (this.input-prevIn)/dt:0;this.outputSpeed=dt?(this.output-prevOut)/dt:0;
  }
  offset(g){const phi=Math.atan2(.9,Math.sqrt(1.2**2-.9**2));return g==='1'?Math.PI/80:g==='2'?.3*Math.PI/32:2*(Math.PI-2*phi)+3*Math.PI/40;}
  pose(){return {engine:this.engine,input:this.input,counter:-this.input/2+Math.PI/40,low:this.input*.25+this.offset('1'),high:this.input*.4375+this.offset('2'),reverseGear:-this.input*.5+this.offset('R'),output:this.output,sleeve:this.sleeve,reverse:this.reverse,clutch:this.clutch,gear:this.gear,phase:this.phase,busy:this.busy};}
 }
 function differential(carrier,split){return {carrier,left:carrier*(1-split),right:carrier*(1+split),spider:carrier*split*2};}
 // Brake linkage: fixed pedal length / pushrod; cylinder piston is constrained to y=2.45.
 function brakePose(p){p=clamp(p,0,1);const angle=.30*p,anchor=[-2.9,3.05,0],joint=[anchor[0]+.6*Math.sin(angle),anchor[1]-.6*Math.cos(angle),0],length=.85,x=joint[0]+Math.sqrt(length*length-(joint[1]-2.45)**2),travel=x-(-2.05),takeup=Math.min(1,p/.18),pressure=Math.max(0,(p-.18)/.82);return {p,angle,joint,piston:[x,2.45,0],rodLength:length,travel,takeup,pressure,padGap:.06*(1-takeup)};}
 const api={TAU,clamp,mod,spec,gearOutline,steering,Transmission,differential,brakePose};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CarDrive=api;
})(typeof window==='undefined'?globalThis:window);
