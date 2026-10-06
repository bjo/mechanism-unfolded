const assert=require('node:assert/strict');
const State=require('../advanced-state.js'),M=require('../calendar-mechanics.js');
const s=new State();s.lastClock=21600;s.setDate(31);s.setWeekday(6);
assert(s.quickWeekday());assert.equal(s.weekday,0);assert.equal(s.date,31);assert.equal(s.lastClock,21600);
assert(s.quickDate(1));assert.equal(s.date,1);assert.equal(s.weekday,0);
for(let i=0;i<7;i++)assert(s.quickWeekday());assert.equal(s.weekday,0);
for(const hour of [0,2.999,21,23.999]){s.lastClock=hour*3600;const before=[s.weekdayTurns,s.dateTurns];assert.equal(s.quickWeekday(),false);assert.equal(s.quickDate(1),false);assert.deepEqual([s.weekdayTurns,s.dateTurns],before);}
for(const hour of [3,6,20.999]){s.lastClock=hour*3600;assert(s.quickWeekday());}
let previous=0;
for(let i=0;i<=1000;i++){const shown=M.weekdayCorrectionPose(i/1000);assert(shown>=previous&&shown<=1);previous=shown;const d=M.weekdayDetent(-shown*M.TAU/7);assert(Math.abs(d.clearance)<1e-8);assert(Math.abs(Math.hypot(d.tip[0]+.65,d.tip[1]+.35)-.52)<1e-10);}
assert.equal(M.weekdayCorrectionPose(0),0);assert.equal(M.weekdayCorrectionPose(1),1);
// The renderer preview must not masquerade as natural finger contact.
function validate(samples){
 assert(samples.some(x=>x.weekday.correctionPreview));
 const first=samples[0],last=samples.at(-1);assert.equal(last.keyless.weekday,(first.keyless.weekday+1)%7);assert.equal(last.keyless.busy,false);
 for(const x of samples){assert.equal(x.keyless.date,first.keyless.date);assert.equal(x.keyless.handOffset,first.keyless.handOffset);assert.equal(x.camera,first.camera);assert(Math.abs(x.weekday.detentGap)<1e-6);assert(Math.abs(x.weekday.detentLength-.52)<1e-7);assert(Math.abs(x.weekday.fingerLength-.83)<1e-7);assert.deepEqual(x.weekday.scale,[1,1,1]);assert.equal(x.copies.flatMap(c=>c.mismatches).length,0);if(x.weekday.correctionPreview){assert.equal(x.weekday.engaged,false);assert.equal(x.weekday.contactAngleError,null);}}
 assert(Math.abs(last.weekday.shown-first.weekday.shown-1)<1e-7);
}
if(process.argv[2]){
 const batches=require(require('node:path').resolve(process.argv[2]));batches.forEach(validate);
 const bad=structuredClone(batches[0]);bad[3].keyless.date++;assert.throws(()=>validate(bad),'independence audit must detect a date mutation');
 console.log('PASS: rendered weekday previews, independent outputs, fixed parts, copied views, unchanged camera; injected date mutation rejected');
}
console.log('PASS: weekday quickset, 7-day wrap, 31-day independence, safe-hour boundaries, display preview and detent');
