/* SI-free teaching dimensions. State, constraints and rendered geometry share this spec.
   Source/topology and omitted physics: CAR-FOUNDATIONS.md. */
(function(root){
 'use strict';
 const TAU=2*Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n;
 const spec={module:.06,axisDistance:1.8,gears:[{n:20,z:-1.65},{n:40,z:-1.65},{n:20,z:-.4},{n:40,z:-.4},{n:28,z:1.2},{n:32,z:1.2}],ratios:{1:.25,2:.5,3:26/34,4:28/32,5:1,6:34/26,R:-1},sleeveCenter:.4,sleeveTravel:.47,arm:1.55,inner:.8,rackZ:.65,armZ:.45,armX:.18};
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
 // P66M-D topology: 5th direct; 1/2 and 5/6 on mainshaft, 3/4 on countershaft.
 const six={input:30,counter:30,helix:Math.PI/10,teeth:{1:[12,48],2:[20,40],3:[26,34],4:[28,32],6:[34,26]},z:{1:0,2:-1.6,3:3.2,4:1.6,5:-4.8,6:-3.2,R:6.4},centers:[-.8,2.4,-4,5.6],pairs:{1:0,2:0,3:1,4:1,5:2,6:2,R:3},directions:{1:1,2:-1,3:1,4:-1,5:-1,6:1,R:1},gates:{R:-2,1:-1,2:-1,3:0,4:0,5:1,6:1,N:0},railAngles:[-.23,.23,.69,-.69],travel:.47};
 function gearOffset(g){if(g==='5')return 0;if(g==='R'){const phi=Math.atan2(.9,Math.sqrt(1.2**2-.9**2));return 2*(Math.PI-2*phi)+Math.PI/30+Math.PI/10;}const [a,b]=six.teeth[g];return (Math.PI-a*Math.PI/30)/b;}
 class Transmission{
  constructor(){this.engine=0;this.input=0;this.output=0;this.clutch=1;this.gear='N';this.target='N';this.shift=0;this.sleeve=0;this.reverse=0;this.sleeves=[0,0,0,0];this.gate=0;this.leverStroke=0;this.reverseUnlocked=false;this.phase='중립';this.busy=false;this.message='① 페달을 밟고 → ② H패턴에서 기어 선택 → ③ 페달을 놓고 재생';this.inputSpeed=0;this.outputSpeed=0;}
  setClutch(v){if(this.busy&&v<.98){this.message='체결이 끝날 때까지 클러치를 밟고 있으세요.';return false;}this.clutch=clamp(v,0,1);return true;}
  unlockReverse(v){this.reverseUnlocked=!!v;}
  request(gear){if(!['N','1','2','3','4','5','6','R'].includes(gear)||this.busy)return false;if(this.clutch<.98){this.message='클러치 페달을 끝까지 밟은 뒤 변속하세요.';return false;}if(gear==='R'&&(!this.reverseUnlocked||Math.abs(this.outputSpeed)>.01)){this.message='정지한 뒤 「레버 누르기」로 후진 잠금을 해제하세요.';return false;}if(gear===this.gear)return true;this.target=gear;this.oldGate=this.gate;this.oldStroke=this.leverStroke;this.starts=this.sleeves.slice();this.shift=0;this.busy=true;this.gear='N';this.phase='기존 연결 해제';this.message='중립 → 열 선택 → 동기화 → 체결 순서로 레버와 포크가 움직입니다.';return true;}
  tick(dt,powered){const prevIn=this.input,prevOut=this.output;this.engine+=powered;
   // No invented partial-slip dynamics: torque only when depicted friction faces touch.
   if(!this.busy&&this.clutch<1e-6){this.input+=powered;this.output+=powered*(spec.ratios[this.gear]||0);}
   if(this.busy){this.shift=Math.min(1,this.shift+dt/2.4);const t=this.shift,g=this.target,k=six.pairs[g],dir=six.directions[g]||0,goalGate=six.gates[g];
    this.sleeves=[0,0,0,0];
    if(t<.2){this.sleeves=this.starts.map(x=>x*(1-t/.2));this.leverStroke=this.oldStroke*(1-t/.2);this.gate=this.oldGate;this.phase='기존 포크를 중립으로';}
    else if(t<.4){this.gate=this.oldGate+(goalGate-this.oldGate)*(t-.2)/.2;this.leverStroke=0;this.phase='중립 통로에서 열 선택';}
    else {this.gate=goalGate;let travel=t<.55?.30*(t-.4)/.15:t<.8?.30:.30+.17*(t-.8)/.2;if(k!==undefined)this.sleeves[k]=dir*travel;this.leverStroke=g==='N'?0:(g==='R'||Number(g)%2?-1:1)*travel;
     this.phase=t<.55?'포크가 동기화 링을 누릅니다':t<.8?'원뿔 접촉 · 회전 맞추기':'슬리브가 연결 이빨에 진입';
     if(t>=.55&&t<.8&&g!=='N'){const ratio=spec.ratios[g],pitch=TAU/12;if(g==='3'||g==='4'){const [a,b]=six.teeth[g],angle=(Math.PI-b*this.output)/a,counter=-this.input+Math.PI/30,err=mod(angle-counter+pitch/2,pitch)-pitch/2;this.input-=err*Math.min(1,dt*40);}else{const angle=ratio*this.input+this.offset(g),err=mod(this.output-angle+pitch/2,pitch)-pitch/2;this.input+=err/ratio*Math.min(1,dt*40);}}
    }
    if(t===1){this.gear=g;this.busy=false;this.phase=g==='N'?'중립':g==='R'?'후진 연결':g+'단 연결';this.message=g==='5'?'5단: 입력축과 출력축을 직접 연결합니다.':g==='6'?'6단: 출력축이 입력축보다 빠르게 도는 오버드라이브입니다.':'페달을 놓고 재생해 선택된 경로를 따라가세요.';if(g!=='R')this.reverseUnlocked=false;}
   }
   this.sleeve=this.sleeves[0];this.reverse=Math.abs(this.sleeves[3])/.47;this.inputSpeed=dt?(this.input-prevIn)/dt:0;this.outputSpeed=dt?(this.output-prevOut)/dt:0;
  }
  offset(g){return gearOffset(g);}
  pose(){const counter=-this.input+Math.PI/30,angles={};for(const g of ['1','2','6'])angles[g]=spec.ratios[g]*this.input+this.offset(g);for(const g of ['3','4']){const [a,b]=six.teeth[g];angles[g]=(Math.PI-b*this.output)/a;}angles.R=-this.input+this.offset('R');angles['5']=this.input;return {engine:this.engine,input:this.input,counter,low:angles[1],high:angles[2],angles,reverseGear:angles.R,output:this.output,sleeve:this.sleeve,sleeves:this.sleeves.slice(),reverse:this.reverse,clutch:this.clutch,gear:this.gear,target:this.target,gate:this.gate,leverStroke:this.leverStroke,reverseUnlocked:this.reverseUnlocked,phase:this.phase,busy:this.busy};}
 }
 function clutchPose(v){const pedalAngle=.45*clamp(v,0,1),joint=[2.4,2.6-.35*Math.cos(pedalAngle),-5.7-.35*Math.sin(pedalAngle)],piston=[2.4,2.25,joint[2]-Math.sqrt(.65**2-(joint[1]-2.25)**2)],masterTravel=-6.35-piston[2];
  const slaveAt=a=>-.55*Math.sin(a)+Math.sqrt(.4**2-(.55*(Math.cos(a)-1))**2)-.4,end=-Math.asin(.14/.68),maxMaster=.35*Math.sin(.45)+Math.sqrt(.65**2-(.35*(1-Math.cos(.45)))**2)-.65,areaRatio=slaveAt(end)/maxMaster,target=masterTravel*areaRatio;let lo=end,hi=0;for(let i=0;i<40;i++){const a=(lo+hi)/2;if(slaveAt(a)>target)lo=a;else hi=a;}const forkAngle=(lo+hi)/2,slaveJoint=[.9+.55*Math.cos(forkAngle),0,-5.64-.55*Math.sin(forkAngle)],slavePiston=[1.45,0,slaveJoint[2]+Math.sqrt(.4**2-(slaveJoint[0]-1.45)**2)];return {pedalAngle,joint,piston,masterTravel,areaRatio,forkAngle,slaveJoint,slavePiston,slaveTravel:slavePiston[2]+5.24,release:-.68*Math.sin(forkAngle)};
 }
 function differential(carrier,split){return {carrier,left:carrier*(1-split),right:carrier*(1+split),spider:carrier*split*2};}
 // Brake linkage: fixed pedal length / pushrod; cylinder piston is constrained to y=2.45.
 function brakePose(p){p=clamp(p,0,1);const angle=.30*p,anchor=[-2.9,3.05,0],joint=[anchor[0]+.6*Math.sin(angle),anchor[1]-.6*Math.cos(angle),0],length=.85,x=joint[0]+Math.sqrt(length*length-(joint[1]-2.45)**2),travel=x-(-2.05),takeup=Math.min(1,p/.18),pressure=Math.max(0,(p-.18)/.82);return {p,angle,joint,piston:[x,2.45,0],rodLength:length,travel,takeup,pressure,padGap:.06*(1-takeup)};}
 const api={TAU,clamp,mod,spec,six,gearOffset,clutchPose,gearOutline,steering,Transmission,differential,brakePose};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CarDrive=api;
})(typeof window==='undefined'?globalThis:window);
