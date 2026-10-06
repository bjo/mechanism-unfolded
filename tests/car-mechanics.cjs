const assert=require('node:assert/strict'),M=require('../car-mechanics.js');
const near=(a,b,t=1e-7)=>assert(Math.abs(a-b)<=t,`${a} differs from ${b}`);
let minClearance=Infinity;
for(let d=0;d<=1440;d+=.5){const p=M.pose(d),s=M.spec;
 near(Math.hypot(p.pin[0],p.pistonY-p.pin[1]),s.rodLength);
 near(p.pin[0]-s.rodLength*Math.sin(p.rodAngle),0);
 for(let i=0;i<2;i++){const v=M.valves[i],c=p.valves[i];assert(c.lift>=0&&c.lift<=s.camLift+1e-8);assert(Math.abs(c.tangent)<s.bucketRadius-.02);near(c.angle,-p.theta/2+v.phase);const floor=v.seat[1]-v.n[1]*(c.lift+.04)-s.valveRadius*Math.sin(s.valveTilt);minClearance=Math.min(minClearance,floor-(p.pistonY+s.pistonTop));}
}
assert(minClearance>.25,'valve cannot pass through the piston at TDC');
near(M.pose(0).pistonY,M.spec.rodLength+M.spec.crankRadius);near(M.pose(180).pistonY,M.spec.rodLength-M.spec.crankRadius);
near(M.pose(360).pistonY,M.pose(0).pistonY);assert(M.pose(0).valves[0].lift>.001);near(M.pose(360).valves[0].lift,0);
for(const [angle,stroke] of [[0,0],[179,0],[180,1],[359,1],[360,2],[539,2],[540,3],[719,3],[720,0]])assert.equal(M.pose(angle).stroke,stroke);
assert(M.pose(352).spark);assert(!M.pose(365).spark);assert(!M.pose(0).spark);
near(M.belt.length,M.belt.teeth*M.belt.pitch);assert.equal(M.belt.circles[1].n/M.belt.circles[0].n,2);
for(let d=0;d<720;d+=7){const theta=M.rad(d);for(let i=0;i<M.belt.teeth;i++){const q=M.belt.at(i*M.belt.pitch-M.belt.radius*theta);if(q.circle<0)continue;const c=M.belt.circles[q.circle],angle=Math.atan2(q.y-c.p[1],q.x-c.p[0]),rotation=c.phase-theta/(q.circle?2:1);near(Math.hypot(q.x-c.p[0],q.y-c.p[1]),c.r);near(M.mod((angle-rotation)*c.n/M.TAU,1),.5);}}
for(const segment of M.belt.segments){const a=M.belt.at(segment.start+segment.length-1e-7),b=M.belt.at(segment.start+segment.length+1e-7);assert(Math.hypot(a.x-b.x,a.y-b.y)<3e-7);}
const clock=new M.Clock();clock.seek(360);clock.advance(.1);assert.equal(clock.degrees,360);clock.running=true;clock.speed=2;clock.advance(.1);near(clock.degrees,372);clock.speed=.5;clock.advance(.1);near(clock.degrees,375);clock.running=false;clock.advance(.1);near(clock.degrees,375);
function validate(s){
 near(s.rodLength,M.spec.rodLength);near(s.bigEndGap,0);near(s.smallEndGap,0);near(s.pistonAxis,0);near(s.beltSeamError,0);
 for(const k of ['rodScale','crankScale','pistonScale'])assert.deepEqual(s[k],[1,1,1]);
 for(const c of s.contacts){near(c.gap,0,5e-6);assert(c.tangent<c.bucketRadius-.02);near(c.valveLength,1.1);near(c.stemBucketGap,0);near(c.springBottomGap,0);near(c.springTopGap,0);assert(c.pistonClearance>.25);near(c.guideOffset,0);}
 for(const c of s.pitchContacts){near(c.radialError,0);near(c.planeError,0);near(c.phaseError,0);}
}
if(process.argv[2]){
 const samples=require(require('node:path').resolve(process.argv[2]));samples.forEach(validate);assert(Math.max(...samples.map(s=>s.degrees))-Math.min(...samples.map(s=>s.degrees))>=720,'browser must cover a complete cycle');
 for(const fault of [s=>s.rodLength+=.1,s=>s.bigEndGap=.02,s=>s.contacts[0].gap=.04,s=>s.contacts[0].tangent=.4,s=>s.pitchContacts[0].phaseError=.2,s=>s.contacts[0].pistonClearance=-.01]){const s=structuredClone(samples[0]);fault(s);assert.throws(()=>validate(s));}
 console.log(`PASS ${samples.length} rendered snapshots: linkage endpoints, finite cam face, valve clearance, belt plane/phase; 6 injected faults rejected`);
}
console.log('PASS full crank/cam cycle, rigid rod, 4 strokes, ignition, 2:1 belt, closed belt seam, clock pause/speed; minimum valve clearance '+minClearance.toFixed(5));
