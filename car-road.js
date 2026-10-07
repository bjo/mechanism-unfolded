/* SI longitudinal teaching model. Deliberately not a measured vehicle map. */
(function(root){
 'use strict';
 const spec={mass:1200,radius:.31,final:3,efficiency:.9,wheelbase:2.4,track:1.5,rho:1.225,cdA:.65,rolling:.012,visualRate:1/120,idle:800,redline:6500};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function corner(degrees){const angle=degrees*Math.PI/180,curvature=Math.tan(angle)/spec.wheelbase,split=spec.track*curvature/2;return {degrees,curvature,split,radius:Math.abs(curvature)<1e-9?Infinity:Math.abs(1/curvature),left:1-split,right:1+split};}
 function resistance(speed){return spec.mass*9.81*spec.rolling+.5*spec.rho*spec.cdA*speed*speed;}
 function torqueCurve(rpm){return Math.max(65,160-.000006*(rpm-3500)**2);}
 const plan=[];
 for(let g=1;g<=6;g++){plan.push({kind:'shift',gear:String(g),title:g===1?'출발 준비 · 1단 선택':(g-1)+' → '+g+'단 변속',duration:4});for(let k=1;k<=4;k++)plan.push({kind:'accelerate',gear:String(g),level:k,title:g+'단 · 가속 '+k+'/4',duration:3,throttle:k/4});}
 plan.push({kind:'slow',title:'코너 전 감속',duration:2},{kind:'corner',title:'조향 · 좌우 바퀴 경로 차이',duration:6},{kind:'stop',title:'브레이크 · 완전히 정지',duration:2},{kind:'shift',gear:'R',title:'정지 확인 · 후진 선택',duration:4});
 for(let k=1;k<=4;k++)plan.push({kind:'reverse',gear:'R',level:k,title:'후진 · 가속 '+k+'/4',duration:2,throttle:k/4});
 plan.push({kind:'stop',title:'후진 감속 · 정지',duration:2});
 class Drive{
  constructor(guided=false){this.x=0;this.y=0;this.yaw=0;this.trail=[[0,0]];this.guided=guided;this.speed=0;this.rpm=spec.idle;this.throttle=0;this.brake=0;this.angle=0;this.level=0;this.time=0;this.distance=0;this.step=0;this.stepTime=0;this.done=false;this.snapshot={};this.message='클러치를 밟고 단수를 선택하세요.';}
  setLevel(level){this.level=level;this.throttle=level/4;this.brake=0;}
  canSelect(g,tx,ratios={}){if(((g==='R'||tx.gear==='R')&&Math.abs(this.speed)>.02)||(g!=='N'&&g!=='R'&&this.speed<-.02)){this.message='먼저 브레이크로 완전히 정지하세요. 주행 중에는 전진·후진을 바꿀 수 없습니다.';return false;}const ratio=ratios[g];if(ratio&&Math.abs(this.speed)/spec.radius*60/(2*Math.PI)*spec.final/Math.abs(ratio)>spec.redline){this.message='이 속도에서는 선택한 단수가 엔진 회전수 제한을 넘습니다. 먼저 감속하세요.';return false;}return true;}
  command(dt,tx,ratios){
   if(!this.guided||this.done)return;
   const p=plan[this.step];this.stepTime+=dt;this.level=p.level||0;this.angle=0;this.throttle=0;this.brake=0;
   const pedal=(target)=>{const d=target-tx.clutch;tx.setClutch(tx.clutch+Math.sign(d)*Math.min(Math.abs(d),dt*2));};
   if(p.kind==='shift'){
    if(tx.gear!==p.gear||tx.busy){pedal(1);if(tx.clutch>.999&&!tx.busy){if(p.gear==='R')tx.unlockReverse(true);if(this.canSelect(p.gear,tx,ratios))tx.request(p.gear);}}
    else pedal(0);
   }else if(p.kind==='accelerate'){this.throttle=p.throttle;pedal(0);}
   else if(p.kind==='reverse'){pedal(0);this.throttle=p.throttle;}
   else if(p.kind==='slow'){pedal(1);this.brake=this.speed>8?.45:0;}
   else if(p.kind==='corner'){pedal(1);this.angle=12*Math.sin(Math.PI*clamp(this.stepTime/6,0,1));}
   else if(p.kind==='stop'){pedal(1);this.brake=.65;}
   const complete=this.stepTime>=p.duration&&(p.kind!=='shift'||(!tx.busy&&tx.gear===p.gear&&tx.clutch===0))&&(p.kind!=='stop'||Math.abs(this.speed)<.001)&&(p.kind!=='slow'||this.speed<=8);
   if(complete){if(this.step===plan.length-1){this.done=true;this.throttle=0;}else{this.step++;this.stepTime=0;}}
  }
  advance(dt,tx,ratios){
   if(dt<=0)return {engine:0,output:0,input:0};
   this.command(dt,tx,ratios);this.time+=dt;
   const ratio=ratios[tx.gear]||0,total=ratio?spec.final/Math.abs(ratio):0,dir=Math.sign(ratio),wheelRPM=Math.abs(this.speed)/spec.radius*60/(2*Math.PI),inputRPM=wheelRPM*total,contact=!tx.busy&&tx.clutch<1e-6,connected=contact&&!!ratio;
   const targetRPM=connected?Math.max(spec.idle,inputRPM):spec.idle+this.throttle*4700;
   this.rpm=connected?targetRPM:this.rpm+clamp(targetRPM-this.rpm,-1800*dt,1800*dt);
   const fuelCut=this.rpm>=spec.redline,engineTorque=fuelCut?-18:this.throttle*torqueCurve(this.rpm)-(this.rpm>850?(1-this.throttle)*18:0);
   const slipping=connected&&inputRPM<spec.idle-.1,transmitted=connected?(slipping?Math.min(110,Math.max(0,engineTorque)):engineTorque):0;
   const wheelTorque=transmitted*total*spec.efficiency*dir,driveForce=wheelTorque/spec.radius,road=resistance(this.speed),brakeForce=7000*clamp((this.brake-.18)/.82,0,1);
   let force=driveForce;
   if(Math.abs(this.speed)>.00001)force-=Math.sign(this.speed)*(road+brakeForce);else force=Math.sign(force)*Math.max(0,Math.abs(force)-road-brakeForce);
   const old=this.speed;let next=old+force/spec.mass*dt;
   // Resistance/brakes may stop the car, never launch it in the opposite direction.
   if(old*next<0&&(engineTorque<=0||Math.sign(driveForce)!==Math.sign(next)))next=0;
   if(Math.abs(next)<.00001)next=0;force=(next-old)/dt*spec.mass;
   this.speed=next;const ds=(old+next)*.5*dt;this.distance+=ds;const turn=ds*corner(this.angle).curvature;this.x+=ds*Math.cos(this.yaw+turn/2);this.y+=ds*Math.sin(this.yaw+turn/2);this.yaw+=turn;if(this.time-(this.trailTime||0)>.2){this.trail.push([this.x,this.y]);if(this.trail.length>500)this.trail.shift();this.trailTime=this.time;}
   const actualWheelRPM=Math.abs(next)/spec.radius*60/(2*Math.PI);
   if(connected)this.rpm=Math.max(spec.idle,actualWheelRPM*total);
   const c=corner(this.angle),output=(old+next)*.5/spec.radius*spec.final*dt*spec.visualRate;
   this.snapshot={speed:next,kmh:next*3.6,rpm:this.rpm,wheelRPM:actualWheelRPM,engineTorque,transmitted,wheelTorque,requiredWheelTorque:Math.abs(next)>.00001?road*spec.radius:0,netWheelTorque:force*spec.radius,force,acceleration:(next-old)/dt,power:engineTorque*this.rpm*2*Math.PI/60/1000,slipping,contact,connected,fuelCut,throttle:this.throttle,brake:this.brake,clutch:tx.clutch,level:this.level,gear:tx.gear,target:tx.target,busy:tx.busy,phase:tx.phase,angle:this.angle,corner:c,leftKmh:next*3.6*c.left,rightKmh:next*3.6*c.right,time:this.time,distance:this.distance,step:this.step,title:this.guided?plan[this.step].title:'직접 운전',done:this.done};
   return {engine:this.rpm*2*Math.PI/60*dt*spec.visualRate,output,input:ratio?output/ratio:contact?this.rpm*2*Math.PI/60*dt*spec.visualRate:0};
  }
 }
 const api={spec,corner,resistance,torqueCurve,Drive,plan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CarRoad=api;
})(typeof globalThis!=='undefined'?globalThis:this);
