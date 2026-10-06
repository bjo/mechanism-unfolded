const assert=require('node:assert/strict'),M=require('../calendar-mechanics.js'),S=require('../movement-spec.js'),A=require('../advanced-state.js');
const st=new A();st.lastClock=79200;let last=0,contacts=0;
for(let t=79200;t<=90000;t+=10){st.observeClock(t);const p=M.datePose(t,st.dateTurns);assert(p.turns>=last-1e-9,'date must not reverse');assert(p.turns<=1+1e-9,'one index per day');if(p.engaged){contacts++;const g=M.dateGeometry,alpha=Math.atan2(g.length*Math.sin(p.angle),g.cx+g.length*Math.cos(p.angle));const tooth=p.turns*g.pitch+g.toothPhase;assert(Math.abs(alpha-(tooth-.031))<1e-9,'driver must follow the pushing flank');}last=p.turns;}
assert.equal(st.date,2);assert.equal(last,1);assert(contacts>500);st.setDate(31);st.lastClock=86399;st.observeClock(86400);assert.equal(st.date,1);
for(const rate of [.125,.25,.5,1,60,3600])for(const t of [0,.0123,.03,.1,.277])assert(Math.abs(S.balanceAngle(t*rate)-2.1*Math.sin(2*Math.PI*4*t*rate))<1e-9,'oscillator must follow simulated time');
const w=S.wheels;assert(Math.abs(Math.hypot(w.third.p[0]-w.fourth.p[0],w.third.p[1]-w.fourth.p[1])-(w.third.r+w.fourth.pr))<1e-12);assert.equal(w.third.n/w.fourth.pn,7.5);assert.equal(S.ratios.third*w.third.n+S.ratios.fourth*w.fourth.pn,0);
console.log('PASS: daily contact continuity, one index, 31→1, oscillator rates, third/fourth pitch and ratio');
const C=require('../seiko-chronograph-mechanics.js'),R=require('../ratchet-contact.js');
for(const [name,index,period,count] of [['moon',M.moonIndexing,86400,59],['chronograph',C.minuteIndex,60,30]]){
 let previous=-Infinity,engaged=0;
 for(let i=0;i<=2000;i++){const t=period*(.95+i*.1/2000),p=index.pose(t);assert(p.turns>=previous-1e-9,name+' monotonic index');if(p.engaged)engaged++;previous=p.turns;}
 assert(engaged>0,name+' contact interval');assert.equal(index.pose(period).turns,1);assert.equal(index.pose(period*count).turns,count);
}
for(let i=0;i<720;i++){const p=R.contact(i*Math.PI/360);assert(p&&Number.isFinite(p.angle));assert(Math.abs(Math.hypot(p.x-R.pivot[0],p.y-R.pivot[1])-R.length)<1e-8,'pawl remains rigid and touching');}
for(const x of S.keyless.sliderX){const p=S.keyless.yokePose(x);assert(Number.isFinite(p.angle));assert(Math.abs(S.keyless.yokePivot[0]+p.length*Math.cos(p.angle)-x)<1e-10);}
for(const dir of [-1,1]){const a=new A();assert(Math.abs(a.rotorMove(dir*2*Math.PI,0)-100/45)<1e-10);assert.equal(a.rotorDirection,dir);assert.equal(a.rotorMove(dir*2*Math.PI,100),0);assert(a.slipping);}
console.log('PASS: moon/chronograph contact windows, ratchet contact sweep, crown positions, automatic input directions');
const q=M.dateCorrectionGeometry;let prior=0;for(let i=0;i<=1000;i++){const p=i/1000,v=M.dateCorrectionPose(p);assert(v>=prior-1e-10&&v<=1);if(v>0&&v<1){const phi=(p-.5)*2*Math.PI;const alpha=Math.atan2(q.reach*Math.sin(phi),q.distance+q.reach*Math.cos(phi));assert(Math.abs(alpha-(v-.5)*2*Math.PI/31)<1e-10);}prior=v;}assert.equal(prior,1);assert.equal(M.dateCorrectionPose(q.endProgress),1);
console.log('PASS: quickset full contact stroke and one-pitch release');

for(let t=0;t<=86400;t+=10)assert.equal(M.datePose(t,0).length,M.dateGeometry.length,'rigid finger length across full cycle');
