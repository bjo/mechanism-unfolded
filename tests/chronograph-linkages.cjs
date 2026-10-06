const assert=require('node:assert/strict'),K=require('../seiko-chronograph-mechanics.js');
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
 assert(Math.abs(c.pusherAxes[1][0]+1)<1e-9&&Math.abs(c.pusherAxes[1][1])<1e-9);
 for(const guide of c.guides){assert(Math.abs(guide.alignment-1)<1e-9,'guide and rod axes agree');assert(Math.min(...guide.rodMargins)>0,'rod stays in guide');assert(guide.radialClearance>0);}
 assert(s.copyErrors.every(c=>c.mismatches.length===0));
}
if(process.argv[2]){
 const samples=require(require('node:path').resolve(process.argv[2]));samples.forEach(validate);
 const bad=structuredClone(samples[0]);bad.connections.resetPusherGap=.04;assert.throws(()=>validate(bad));
 const twisted=structuredClone(samples[0]);twisted.connections.pusherAxes[0]=[.1,.995,0];assert.throws(()=>validate(twisted));
 console.log('PASS: '+samples.length+' actual render samples, pads, heel, arbor, spring, lifting faces, guide axes and clones; gap/twist faults rejected');
}
console.log('PASS: reset surface contact and finite pad footprint throughout stroke');
