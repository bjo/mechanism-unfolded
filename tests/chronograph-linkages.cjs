const assert=require('node:assert/strict'),K=require('../seiko-chronograph-mechanics.js'),L=require('../chronograph-layout.js');
for(let i=0;i<=160;i++){
 const p=K.resetLeverPose(-.42+.42*i/160),polygon=K.leverPolygon(p.pivot,p.angle,-.55,.92,.075);
 assert(Math.abs(K.polygonGap(p.heel,polygon)-.035)<1e-10,'heel contacts the lever surface, not its center line');
 const edge=K.padSupport(polygon,0,2.21,2.47,-1);assert(Number.isFinite(edge));
 // The earlier formula omitted the half-width and penetrated the heel.
 const v=K.sub(p.heel,p.pivot),old=Math.atan2(v[1],v[0])-Math.asin(.035/Math.hypot(...v));
 assert(K.polygonGap(p.heel,K.leverPolygon(p.pivot,old,-.55,.92,.075))-.035<-.03);
}
assert(Math.sqrt(.03**2+.03**2)<.045,'guide clears rod diagonal');
function validate(s){
 const c=s.connections;assert(c,'actual geometry audit required');
 for(const k of ['startPusherGap','resetPusherGap','resetHeelGap','springRingGap'])assert(Math.abs(c[k])<2e-6,k);
 assert(c.indexArborOverlap>.02,'shaft reaches index');
 for(const cam of c.camContact){assert(Math.abs(cam.heightGap)<.0001);assert(Math.abs(cam.radiusGap)<.0001);assert(cam.penetration<.0001);assert(cam.inputSeatClearance>0);}
 assert(Math.abs(c.pusherAxes[0][0])<1e-9&&Math.abs(c.pusherAxes[0][1]-1)<1e-9);
 assert(Math.abs(c.pusherAxes[1][0])<1e-9&&Math.abs(c.pusherAxes[1][1]-1)<1e-9);
 s.handDirections.forEach((a,i)=>{const expected=K.rotate([0,-1],s.hearts[i].angle);assert(Math.hypot(a[0]-expected[0],a[1]-expected[1])<1e-7,'hand phase preserved across layout rotation');});
 for(const a of s.caseAxes)assert(Math.abs(a[0]-1)<1e-8&&Math.abs(a[1])<1e-8,'case-aligned pusher axes');
 assert(s.casePushers[0][1]<-.6&&s.casePushers[1][1]>.6,'pushers flank the crown');
 assert(s.minuteBarrelGap>.05,'counter shaft clears barrel');assert(s.counterTrainGaps.every(x=>x.gap>.015),'counter shaft clears base train wheels');
 assert(s.hammerBodyGaps.every(x=>x>=-1e-5),'heart intersects hammer body');
 for(const p of s.plateRigidity){assert(p.unchanged,'rigid plate vertices changed');assert(p.scale.every(x=>x===1),'rigid plate scaled');}
 for(const guide of c.guides){assert(Math.abs(guide.alignment-1)<1e-9,'guide and rod axes agree');assert(Math.min(...guide.rodMargins)>0,'rod stays in guide');assert(guide.radialClearance>0);}
 assert(s.copyErrors.every(c=>c.mismatches.length===0));
}
if(process.argv[2]){
 const samples=require(require('node:path').resolve(process.argv[2]));samples.forEach(validate);
 const bad=structuredClone(samples[0]);bad.connections.resetPusherGap=.04;assert.throws(()=>validate(bad));
 const deformed=structuredClone(samples[0]);deformed.plateRigidity[0].unchanged=false;assert.throws(()=>validate(deformed));
 const misplaced=structuredClone(samples[0]);misplaced.casePushers[1][1]=-.7;assert.throws(()=>validate(misplaced));
 const twisted=structuredClone(samples[0]);twisted.connections.pusherAxes[0]=[.1,.995,0];assert.throws(()=>validate(twisted));
 console.log('PASS: '+samples.length+' actual render samples, pads, heel, arbor, spring, lifting faces, guide axes and clones; gap/twist faults rejected');
}
console.log('PASS: reset surface contact and finite pad footprint throughout stroke');

for(let i=0;i<=1000;i++){
 for(const [index,p] of [[0,L.startPose(i/1000)],[1,L.resetPose(-.42+.42*i/1000)]]){const q=L.pushers[index],cap=p.edge+q.rod+.02,rodMin=cap-q.rod;assert(rodMin<q.guideY&&cap>q.guideY+.16,'complete stroke retained in sleeve');assert(Math.abs(K.rotate([0,1],L.bodyAngle)[0]-1)<1e-12);}
}
const loops=L.union([L.rectangle([0,0],[1,0],.1),L.rectangle([.5,-.5],[.5,.5],.1)]);
const area=loops.flatMap(p=>p.map((a,i)=>{const b=p[(i+1)%p.length];return (a[0]*b[1]-a[1]*b[0])/2;})).reduce((a,b)=>a+b,0);
assert(Math.abs(area-.19)<1e-8,'one manifold outline removes overlapping branch faces');
console.log('PASS: 2002 case-aligned pusher poses, finite pads, guide retention and merged plate contour');

if(process.argv[3]){
 const g=JSON.parse(require('node:fs').readFileSync(process.argv[3],'utf8'));let checks=0;
 for(let index=0;index<2;index++)for(let a=-Math.PI;a<=Math.PI;a+=Math.PI/12)for(let i=0;i<=40;i++){
  const phi=-.42*(1-i/40),state=K.hammerContact(index,phi,a);
  for(const point of g.hearts[index]){const world=K.add(g.centers[index],K.rotate(point,state.angle+g.orientations[index])),local=K.rotate(K.sub(world,g.pivot),-phi),ds=g.hammer.map(poly=>K.polygonGap(local,poly)),gap=(ds.filter(d=>d<0).length%2?-1:1)*Math.min(...ds.map(Math.abs));assert(gap>=-1e-6,'actual hammer outline collides with a heart at '+[index,a,phi,gap]);
   const v=K.sub(world,state.face),n=state.normal;if(Math.abs(K.dot(v,n))<1e-6){assert(Math.abs(K.dot(v,[-n[1],n[0]]))<g.faceHalfWidth,'contact outside finite hammer pad');checks++;}
  }
 }
 console.log('PASS: 2050 poses against exported hammer/heart vertices; '+checks+' finite-pad contacts');
}
