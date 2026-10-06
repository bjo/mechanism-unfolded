/* Engine teaching geometry. Millimetres/performance are deliberately not inferred.
 * Fixed rigid bodies, a single crank angle, convex cams and a closed pitch belt.
 * Construction/source boundary: CAR-DESIGN.md. Shared by renderer and tests. */
(function(root){
 'use strict';
 const TAU=2*Math.PI,rad=d=>d*Math.PI/180,mod=(x,n)=>((x%n)+n)%n;
 const spec={crankRadius:.8,rodLength:2.7,bore:.76,pistonRadius:.72,pistonTop:.41,
  seatY:4.35,seatX:.37,valveTilt:rad(20),camBase:.36,camLift:.06,
  stemTop:1.1,bucketRadius:.155,valveRadius:.185,camWidth:.16,beltZ:1.48};
 const camProfile=Array.from({length:720},(_,i)=>{
  const a=i*TAU/720,d=Math.atan2(Math.sin(a),Math.cos(a)),w=Math.PI/3;
  const active=Math.abs(d)<w,h=spec.camBase+(active?spec.camLift*(1+Math.cos(Math.PI*d/w))/2:0);
  const dh=active?-spec.camLift*Math.PI/(2*w)*Math.sin(Math.PI*d/w):0;
  return [h*Math.cos(a)-dh*Math.sin(a),h*Math.sin(a)+dh*Math.cos(a)];
 });
 const valves=[{id:'intake',side:-1,peak:110},{id:'exhaust',side:1,peak:610}].map(v=>{
  const n=[v.side*Math.sin(spec.valveTilt),Math.cos(spec.valveTilt)],seat=[v.side*spec.seatX,spec.seatY];
  return {...v,n,seat,center:seat.map((p,i)=>p+n[i]*(spec.stemTop+spec.camBase)),phase:Math.atan2(-n[1],-n[0])+rad(v.peak)/2};
 });
 function camPose(v,theta){
  const angle=-theta/2+v.phase,c=Math.cos(angle),s=Math.sin(angle);let support=-Infinity,point;
  for(const [x,y] of camProfile){const q=[c*x-s*y,s*x+c*y],h=-q[0]*v.n[0]-q[1]*v.n[1];if(h>support){support=h;point=q;}}
  return {angle,lift:Math.max(0,support-spec.camBase),support,contact:point.map((p,i)=>p+v.center[i]),tangent:point[0]*v.n[1]-point[1]*v.n[0]};
 }
 function pose(degrees){
  const theta=rad(degrees),phase=mod(degrees,720),r=spec.crankRadius,l=spec.rodLength;
  const pin=[r*Math.sin(theta),r*Math.cos(theta)],pistonY=pin[1]+Math.sqrt(l*l-pin[0]*pin[0]);
  return {degrees,theta,phase,stroke:Math.floor(phase/180),pin,pistonY,
   rodAngle:Math.atan2(pin[0],pistonY-pin[1]),valves:valves.map(v=>camPose(v,theta)),
   displacement:(r+l-pistonY)/(2*r),spark:phase>=352&&phase<365};
 }
 // Counter-clockwise envelope of three pulley pitch circles. Each join is
 // an exact external tangent; all arcs/lines share one arc-length coordinate.
 function beltPath(radius){
  const circles=[{p:[0,0],r:radius,n:24},{p:valves[1].center,r:2*radius,n:48},{p:valves[0].center,r:2*radius,n:48}];
  const edges=circles.map((a,i)=>{const b=circles[(i+1)%3],dx=b.p[0]-a.p[0],dy=b.p[1]-a.p[1],d=Math.hypot(dx,dy),q=(a.r-b.r)/d,k=Math.sqrt(1-q*q),normal=[dx/d*q+dy/d*k,dy/d*q-dx/d*k];return {normal,a:a.p.map((p,j)=>p+normal[j]*a.r),b:b.p.map((p,j)=>p+normal[j]*b.r)};});
  const segments=[];let length=0;
  circles.forEach((c,i)=>{const prev=edges[(i+2)%3],next=edges[i],a=Math.atan2(prev.normal[1],prev.normal[0]),b=Math.atan2(next.normal[1],next.normal[0]),sweep=mod(b-a,TAU);c.start=length;c.angle=a;segments.push({type:'arc',start:length,length:sweep*c.r,c,a,sweep});length+=sweep*c.r;const len=Math.hypot(next.b[0]-next.a[0],next.b[1]-next.a[1]);segments.push({type:'line',start:length,length:len,...next});length+=len;});
  function at(distance){const d=mod(distance,length),s=segments.find(q=>d<q.start+q.length)||segments.at(-1),u=(d-s.start)/s.length;if(s.type==='arc'){const a=s.a+s.sweep*u;return {x:s.c.p[0]+s.c.r*Math.cos(a),y:s.c.p[1]+s.c.r*Math.sin(a),nx:Math.cos(a),ny:Math.sin(a),circle:circles.indexOf(s.c)};}return {x:s.a[0]+(s.b[0]-s.a[0])*u,y:s.a[1]+(s.b[1]-s.a[1])*u,nx:s.normal[0],ny:s.normal[1],circle:-1};}
  return {length,segments,circles,at};
 }
 const teeth=Math.round(beltPath(.23).length/(TAU*.23/24));let low=.18,high=.30;
 for(let i=0;i<60;i++){const r=(low+high)/2;if(beltPath(r).length/(TAU*r/24)>teeth)low=r;else high=r;}
 const crankPulleyRadius=(low+high)/2,belt=beltPath(crankPulleyRadius),pitch=TAU*crankPulleyRadius/24;
 belt.teeth=teeth;belt.pitch=pitch;belt.radius=crankPulleyRadius;
 belt.circles.forEach(c=>c.phase=c.angle-c.start/c.r+Math.PI/c.n);
 class Clock{
  constructor(){this.degrees=90;this.running=false;this.speed=1;}
  advance(dt){if(this.running)this.degrees+=Math.max(0,Math.min(dt,.1))*60*this.speed;return this.degrees;}
  seek(d){this.running=false;this.degrees=Math.max(0,Math.min(720,d));}
 }
 // Cylinder 1 begins its power stroke at global 360 degrees. The others
 // follow every 180 degrees in firing order, not numerical cylinder order.
 const bank=[0,-540,-180,-360].map((offset,i)=>({number:i+1,offset,z:2.85-i*1.9}));
 function operation(degrees,pedal=35,advance=8,ignition=true){
  const phase=mod(degrees,720),opening=rad(5+80*Math.max(0,Math.min(100,pedal))/100);
  const charge=.06+.94*Math.sin(opening),duration=20+100*charge;
  return {opening,charge,duration,injection:phase<duration,spark:ignition&&phase>=360-advance&&phase<367-advance,burned:ignition&&phase>=360-advance&&phase<540};
 }
 function cooling(temperature){const open=Math.max(0,Math.min(1,(temperature-82)/13));return {open,radiator:open,bypass:1-open,lift:.22*open};}
 const api={TAU,rad,mod,spec,valves,camProfile,camPose,pose,belt,Clock,bank,operation,cooling};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CarMechanics=api;
})(typeof window==='undefined'?globalThis:window);
