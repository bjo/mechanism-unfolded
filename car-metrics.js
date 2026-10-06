/* An explicit example engine, not a calibrated 4A-GE performance model.
   Closed-cycle ideal gas + prescribed heat release; assumptions: CAR-METRICS.md. */
(function(root){
 'use strict';
 const pi=Math.PI,rad=d=>d*pi/180,mod=(x,n)=>(x%n+n)%n,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const spec={bore:.081,stroke:.077,rodRatio:3.375,compression:10,gamma:1.35,ambient:100000,rpm:1500,wheelRadius:.31,finalRatio:3,efficiency:.90};
 const area=pi*spec.bore**2/4,swept=area*spec.stroke,r=spec.stroke/2,l=r*spec.rodRatio,clearance=swept/(spec.compression-1);
 function geometry(d){const t=rad(d),sin=Math.sin(t),cos=Math.cos(t),root=Math.sqrt(l*l-r*r*sin*sin),x=r*(1-cos)+l-root,lever=r*sin+r*r*sin*cos/root;return {volume:clearance+area*x,lever,area};}
 let cacheKey='',cached;
 function cycle(settings={}){const s={pedal:35,advance:8,ignition:true,rpm:1500,...settings},key=JSON.stringify([s.pedal,s.advance,s.ignition,s.rpm]);if(key===cacheKey)return cached;
  const opening=rad(5+.8*clamp(s.pedal,0,100)),charge=.06+.94*Math.sin(opening),intakeP=spec.ambient*(.30+.70*charge),mass=intakeP*(swept+clearance)/(287*330),heat=mass/14.7*44e6*.8*(s.ignition?1:0),start=360-s.advance+.0006*s.rpm*6,duration=.004*s.rpm*6;
  const burned=d=>{const u=clamp((d-start)/duration,0,1);return (1-Math.exp(-6*u**3))/(1-Math.exp(-6));};
  const points=[];let p=intakeP,prevV=geometry(0).volume,work=0,peak=0,peakAt=0;
  for(let d=0;d<720;d++){const g=geometry(d);if(d<=180)p=intakeP;else if(d<540)p=p*(prevV/g.volume)**spec.gamma+(spec.gamma-1)*heat*(burned(d)-burned(d-1))/g.volume;else p=1.04*spec.ambient;
   const force=(p-spec.ambient)*area,torque=force*g.lever;points.push({d,pressure:p,force,torque,burn:burned(d),volume:g.volume});work+=torque*pi/180;if(p>peak){peak=p;peakAt=d;}prevV=g.volume;
  }
  const mean=work/(4*pi);cacheKey=key;return cached={points,mean,work,peak,peakAt,heat,start,duration,settings:s,intakeP,displacement:swept*1000};
 }
 function sample(d,settings={}){const c=cycle(settings),i=Math.floor(mod(d,720)),j=(i+1)%720,u=mod(d,1),a=c.points[i],b=c.points[j];return {pressure:a.pressure+(b.pressure-a.pressure)*u,force:a.force+(b.force-a.force)*u,torque:a.torque+(b.torque-a.torque)*u,phase:mod(d,720),mean:c.mean,power:c.mean*(settings.rpm||1500)*2*pi/60/1000};}
 const offsets=[0,-540,-180,-360];
 function bank(d,settings={},sameTotal=false){const c=cycle(settings),factor=sameTotal?.25:1,cylinders=offsets.map(o=>sample(d+o,settings)),torque=cylinders.reduce((s,p)=>s+p.torque*factor,0),mean=c.mean*4*factor;return {cylinders,torque,mean,power:mean*(settings.rpm||1500)*2*pi/60/1000,litres:c.displacement*4*factor,interval:180};}
 function wheel(torque,gear,clutch=0){const ratios={1:.25,2:.5,3:26/34,4:28/32,5:1,6:34/26,R:-1},ratio=ratios[gear];const wheelTorque=!ratio||clutch>1e-6?0:torque/ratio*spec.finalRatio*spec.efficiency;return {torque:wheelTorque,force:wheelTorque/spec.wheelRadius};}
 function brake(input){const pressureFraction=clamp((input-.18)/.82,0,1),foot=300*pressureFraction,lever=4,masterArea=pi*.020**2/4,caliperArea=pi*.048**2/4,pressure=foot*lever/masterArea,pistonForce=pressure*caliperArea,clampForce=2*pistonForce,torque=.35*clampForce*.12;return {foot,pressure,bar:pressure/1e5,pistonForce,clampForce,torque,tireForce:torque/spec.wheelRadius};}
 function road(split,locked=false,rotation=0){const track=1.5,radius=Math.abs(split)<.001?Infinity:track/(2*Math.abs(split)),turn=Math.sign(split)||1,leftRadius=Number.isFinite(radius)?radius-turn*track/2:Infinity,rightRadius=Number.isFinite(radius)?radius+turn*track/2:Infinity,angle=Number.isFinite(radius)?Math.abs(rotation)*spec.wheelRadius/radius:0,arc=pi/2,inner=Number.isFinite(radius)?(radius-track/2)*arc:0,outer=Number.isFinite(radius)?(radius+track/2)*arc:0;return {track,radius,leftRadius,rightRadius,angle,inner,outer,extra:outer-inner,slip:locked?(outer-inner)/2:0,leftSpeed:locked?1:1-split,rightSpeed:locked?1:1+split};}
 const api={spec,geometry,cycle,sample,bank,wheel,brake,road};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CarMetrics=api;
})(typeof window==='undefined'?globalThis:window);
