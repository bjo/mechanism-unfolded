const assert=require('node:assert/strict');
const K=require('../seiko-chronograph-mechanics.js');
// Independent service-guide contract: 6139A figs 7/8. STOP raises a coaxial
// friction ring; START withdraws BOTH coupling levers. No swinging gear.
assert(K.couplingPose(0).lift>.1);
assert.equal(K.couplingPose(-K.step).lift,0);
assert(K.couplingPose(-K.step).first>0);
assert(K.couplingPose(-K.step).second>0);
for(let n=0;n<24;n++)for(let i=0;i<=100;i++){
 const a=-(n+i/100)*K.step,p=K.couplingPose(a);
 assert(p.gap>=-1e-8,'follower must not enter a column pillar');
 assert(Math.abs(Math.hypot(...K.sub(p.pin,K.firstPivot))-Math.hypot(...K.joint))<1e-10,'connecting pin belongs to one rigid lever');
}
// Fig 9 interlock: a pillar blocks the hammer when running; the stopped
// column gives clearance over its ENTIRE return-to-zero stroke.
const lug=phi=>K.add(K.hammerPivot,K.rotate(K.hammerLug,phi));
assert(Math.abs(K.pillarGap(lug(-.42),-K.step))<1e-8);
assert(K.pillarGap(lug(-.40),-K.step)<-.01);
for(let i=0;i<=120;i++)assert(K.pillarGap(lug(-.42+.42*i/120),0)>.04);
// Fig 24: both heart faces are reached by ONE hammer with a fixed pivot.
// Test actual support polygons, not a prescribed hand easing animation.
let contacts=0;
for(let j=0;j<2;j++)for(let a=-Math.PI;a<=Math.PI;a+=Math.PI/24){
 for(let i=0;i<=80;i++){
  const p=K.hammerContact(j,-.42*(1-i/80),a);
  assert(p.gap>=-1e-8,'hammer face cannot penetrate a heart');
  if(Math.abs(p.gap)<1e-7)contacts++;
 }
 assert(Math.abs(K.hammerContact(j,0,a).angle)<1e-8,'every starting angle reaches zero');
}
assert(contacts>100);
// Figs 21/22: the indexing finger is elastic. In-plane bending preserves
// neutral-axis length while clearing the intermediate star during return.
for(let seconds=0;seconds<1800;seconds+=37)for(let i=0;i<=40;i++){
 const a=K.hammerContact(0,-.42*(1-i/40),seconds/60*K.tau).angle;
 const b=K.hammerContact(1,-.42*(1-i/40),K.minutePose(seconds).angle).angle;
 const f=K.resetLeaf(a,b);assert(f.gap>=-.001,'returning finger must clear the star');
 const length=f.points.slice(1).reduce((sum,p,j)=>sum+Math.hypot(...K.sub(p,f.points[j])),0);
 assert(Math.abs(length-(Math.hypot(...K.idler)-.43))<.001,'spring neutral-axis length');
}
let prior=0;
for(let t=57;t<=60;t+=.002){const p=K.minutePose(t);assert(p.angle>=prior-1e-8);prior=p.angle;}
assert.equal(K.minutePose(60).angle,K.tau/30);
assert(Math.abs(K.minutePose(1800).angle-K.tau)<1e-12);
assert(Math.abs(Math.hypot(...K.sub(K.minuteCenter,K.idler))-.8)<1e-10);
const c=new K.Controller();assert(!c.toggle(false));assert(c.toggle(true));
for(let i=0;i<32;i++)c.tick(.05);assert(c.running);c.advance(77);assert.equal(c.elapsed,77);assert(!c.resetPress());
assert(c.toggle());for(let i=0;i<32;i++)c.tick(.05);assert(!c.running);c.advance(10);assert.equal(c.elapsed,77);assert(c.resetPress());
assert.equal(c.elapsed,77,'readout cannot jump to zero before the hammer moves');
for(let i=0;i<60;i++)c.tick(.05);assert.equal(c.elapsed,0);assert(!c.resetMotion);
console.log('PASS: 6139A column contacts, two coupling levers, geometric reset interlock, dual pivot-hammer contacts, elastic return clearance, minute indexing and control lifecycle');
