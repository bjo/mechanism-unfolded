const assert=require('node:assert/strict'),C=require('../crown-transition.js');
let samples=0;
for(const from of [0,1,2])for(const to of [0,1,2])for(const dt of [0,1/240,1/60,.05]){
 let pull=from/2;
 for(let i=0;i<2400;i++){
  const previous=pull;pull=C.advance(pull,to,dt);
  assert(pull>=Math.min(from,to)/2&&pull<=Math.max(from,to)/2,'bounded stroke');
  assert(Math.abs(pull-to/2)<=Math.abs(previous-to/2),'monotonic stroke');
  if(C.seated(pull,to))assert.equal(pull,to/2,'exact detent before release');
  samples++;
 }
 if(dt)assert(C.seated(pull,to),'arrives at detent');else assert.equal(pull,from/2,'zero dt freezes stroke');
}
function validate(sample){assert(!sample.outputMoving||C.seated(sample.pull,sample.position),'output started before seating');}
for(const position of [0,1,2])validate({pull:position/2,position,outputMoving:true});
assert.throws(()=>validate({pull:.2,position:2,outputMoving:true}),/before seating/);
assert.throws(()=>validate({pull:.4,position:0,outputMoving:true}),/before seating/);
console.log(`PASS: ${samples} crown transition samples; two premature-drive faults rejected`);
