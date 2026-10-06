/* Pure calendar complication kinematics, independent of rendering. */
(function(root){
 const Index=typeof module!=='undefined'&&module.exports?require('./indexing-motion.js'):root.IndexingMotion;
 const TAU=2*Math.PI,mod=(n,d)=>((n%d)+d)%d;
 function createDayCounter(){let last=0,value=0;return {observe(t){if(t>=last)value+=Math.max(0,Math.floor((t+1e-6)/86400)-Math.floor((last+1e-6)/86400));last=t;return value;},reset(){last=value=0;},get value(){return value;}};}
 const api={createDayCounter,TAU,mod,gmtAngle:(seconds,offsetHours=0)=>-TAU*(seconds/86400+offsetHours/24),moonIndex:seconds=>Math.floor((seconds+1e-6)/86400),moonAngle:days=>-TAU*days/59,moonAge:days=>mod(days,29.5),driftPerCycle:29.53059-29.5,
 gmt:{input:{n:24,r:.30},relay:{n:24,r:.30,p:[.60,0]},pinion:{n:12,r:.20},output:{n:24,r:.40}},
 moon:{input:{n:24,r:.30},day:{n:48,r:.60,p:[-.90,0]},disc:{n:59,r:.85,p:[-.90,-1.50]}}};
 api.moonIndexing=Index.external({period:86400,teeth:59,distance:1.50,reach:.65});
 // Single-language teaching variant: a separate finger on the daily arbor
 // drives the central weekday star. Not a replica of the bilingual 6139 disk.
 api.weekdays=['월','화','수','목','금','토','일'];
 api.weekdayGeometry={distance:1.35,reach:.95,teeth:7,layer:.29};
 api.weekdayIndexing=Index.external({period:86400,...api.weekdayGeometry});
 api.weekdayPose=(total,turns)=>api.weekdayIndexing.pose(total,turns);
 // UI preview of an independent weekday correction, not a contact solver
 // for a reconstructed rotary day corrector (see CALENDAR-REFERENCE.md).
 api.weekdayCorrectionPose=p=>{const u=Math.max(0,Math.min(1,(p-.25)/.5));return u*u*(3-2*u);};
 api.weekdayOutline=Array.from({length:7},(_,i)=>{
  const a=i*TAU/7+Math.PI/7;
  return [[.26,a-.28],[api.weekdayIndexing.radius,a-.07],[api.weekdayIndexing.radius,a],[.26,a+.10]].map(([r,t])=>[r*Math.cos(t),r*Math.sin(t)]);
 }).flat();
 api.segmentDistance=(p,a,b)=>{const x=b[0]-a[0],y=b[1]-a[1],u=Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/(x*x+y*y)));return Math.hypot(p[0]-a[0]-u*x,p[1]-a[1]-u*y);};
 api.weekdayDetent=rotation=>{
  const c=Math.cos(rotation),s=Math.sin(rotation),v=api.weekdayOutline.map(([x,y])=>[c*x-s*y,s*x+c*y]);
  const point=a=>[-.65+.52*Math.cos(a),-.35+.52*Math.sin(a)];
  const clearance=a=>Math.min(...v.map((p,i)=>api.segmentDistance(point(a),p,v[(i+1)%v.length])))-.018;
  let hi=1.8,lo=hi;
  for(let i=1;i<=256;i++){lo=1.8-(1.8-.494)*i/256;if(clearance(lo)<=0)break;hi=lo;}
  for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(clearance(mid)<=0)lo=mid;else hi=mid;}
  return {angle:hi,tip:point(hi),clearance:clearance(hi)};
 };
 // Date indexing: the finger tip pushes one flank through exactly one 31-day pitch.
 const pitch=TAU/31,cx=1.35,length=1.05,half=pitch/2;
 const contactRadius=cx*Math.cos(half)+Math.sqrt(length*length-cx*cx*Math.sin(half)**2);
 const end=Math.asin(contactRadius*Math.sin(half)/length);
 api.dateGeometry={pitch,cx,length,end,contactRadius,toothPhase:-half+.031};
 api.datePose=(total,turns)=>{
  const day=mod(total,86400),a=day/86400*TAU+end;
  const wrapped=Math.atan2(Math.sin(a),Math.cos(a));
  const engaged=day>86400-2*end/TAU*86400;
  const alpha=Math.atan2(length*Math.sin(wrapped),cx+length*Math.cos(wrapped));
  const progress=engaged?Math.max(0,Math.min(1,(alpha+half)/pitch)):0;
  // A rigid finger clears the tooth sector by rotation; never resize it to force contact.
  return {angle:a,engaged,progress,turns:turns+progress,length};
 };
 // Quickset uses a separate rotary finger and a four-wheel transfer train.
 const qr=2.36,ql=.60,qhalf=Math.PI/31,qd=qr*Math.cos(qhalf)-Math.sqrt(ql*ql-qr*qr*Math.sin(qhalf)**2),qend=Math.atan2(qr*Math.sin(qhalf),qr*Math.cos(qhalf)-qd),qgamma=-2*TAU/31;
 api.dateCorrectionGeometry={distance:qd,reach:ql,angle:qgamma,pivot:[qd*Math.cos(qgamma),qd*Math.sin(qgamma)],endProgress:.5+qend/TAU};
 api.dateCorrectionPose=p=>{const phi=(p-.5)*TAU,alpha=Math.atan2(ql*Math.sin(phi),qd+ql*Math.cos(phi));return p<=.5-qend/TAU?0:p>=.5+qend/TAU?1:(alpha+qhalf)/(2*qhalf);};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CalendarMechanics=api;
})(typeof window==='undefined'?globalThis:window);
