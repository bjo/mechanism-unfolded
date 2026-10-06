const assert=require('node:assert/strict');
const M=require('../calendar-mechanics.js'),State=require('../advanced-state.js');
const tau=2*Math.PI,g=M.weekdayGeometry,s=new State();
let contacts=0,last=0;
for(let t=0;t<=8*86400;t+=30){
 s.observeClock(t);const p=M.weekdayPose(t,s.weekdayTurns);
 assert(p.turns>=last-1e-9);last=p.turns;
 if(p.engaged){
  contacts++;const x=g.distance-g.reach*Math.cos(p.angle),y=-g.reach*Math.sin(p.angle);
  const a=-p.progress*tau/7+Math.PI/7;
  assert(Math.abs(Math.atan2(y,x)-a)<1e-9,'rigid finger must meet star working flank');
 }
 const d=M.weekdayDetent(-p.turns*tau/7);
 assert(Math.abs(d.clearance)<1e-8,'detent must contact the actual star perimeter');
 assert(Math.abs(Math.hypot(d.tip[0]+.65,d.tip[1]+.35)-.52)<1e-12,'detent arm cannot stretch');
}
assert(contacts>100);assert.equal(s.weekday,1);assert.equal(s.date,9);
s.reset();s.setWeekday(6);s.setDate(31);s.lastClock=86399;s.observeClock(86400);
assert.equal(s.weekday,0);assert.equal(s.date,1);
s.lastClock=21600;assert(s.quickDate(1));assert.equal(s.weekday,0);assert.equal(s.date,2);
s.setDate(15);assert.equal(s.weekday,0);s.setWeekday(5);assert.equal(s.date,15);
s.reset();s.observeClock(7*86400);assert.equal(s.weekday,0);assert.equal(s.weekdayTurns,7);
s.observeClock(7*86400);assert.equal(s.weekdayTurns,7,'same clock sample cannot index twice');
assert(g.layer>.21,'weekday finger clears lower date finger');assert(.49>g.layer+.025,'display clears its driver');
const validate=q=>assert(Math.abs(q.fingerLength-.83)<1e-7&&Math.abs(q.detentLength-.52)<1e-7&&Math.abs(q.detentGap)<1e-6&&(!q.engaged||Math.abs(q.contactAngleError)<1e-7));
validate({fingerLength:.83,detentLength:.52,detentGap:0,engaged:true,contactAngleError:0});
assert.throws(()=>validate({fingerLength:.91,detentLength:.52,detentGap:0,engaged:true,contactAngleError:0}));
if(process.argv[2]){const samples=require(require('node:path').resolve(process.argv[2]));samples.forEach(validate);console.log('PASS: '+samples.length+' actual render samples, fixed lengths, follower contact and driver phase');}
console.log('PASS: weekday full cycles, 31→1 + Sunday→Monday, independent correction, contact and fault detection');
