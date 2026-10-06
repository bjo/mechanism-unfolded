const assert=require('node:assert/strict'),M=require('../keyless-mechanics.js');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(let i=0;i<=4000;i++){
 const p=M.pose(i/2000),normal=[-Math.sin(p.yokeAngle),Math.cos(p.yokeAngle)],v=p.pin.map((x,j)=>x-M.yokePivot[j]);
 assert(Math.abs(normal[0]*v[0]+normal[1]*v[1]+M.faceOffset+M.pinRadius)<1e-10,'setting pin tangent to actual yoke face');
 assert(Math.abs(distance(p.shoe,M.yokePivot)-M.yokeLength)<1e-10,'rigid yoke');
 const radial=Math.hypot(p.shoe[1],.095);
 assert(radial-M.shoeRadius>M.grooveNeck,'shoe clears rotating groove core');
 assert(radial+M.shoeRadius<M.grooveOuter,'shoe stays below groove lips');
 assert(distance(p.wheel,M.datePoint)>=M.settingR+M.outputR-1e-9,'no premature date pitch intrusion');
 assert(distance(p.wheel,M.timeOutput)>=M.settingR+M.outputR-1e-9,'no premature time pitch intrusion');
 assert(Math.abs(distance(p.wheel,M.carrierPivot)-M.carrierLength)<1e-10,'rigid correcting lever');
}
for(const [n,out] of [[1,M.datePoint],[2,M.timeOutput]])assert(Math.abs(distance(M.pose(n).wheel,out)-M.settingR-M.outputR)<1e-10,'selected output meshes');
for(let i=0;i<=100;i++){const p=M.pose(0,i/2000);assert(Math.abs(distance(p.shoe,M.yokePivot)-M.yokeLength)<1e-10);assert(Math.hypot(p.shoe[1],.095)+M.shoeRadius<M.grooveOuter);}
function rendered(s){if(s.leverLayerClearance!==undefined)assert(s.leverLayerClearance>=.015,'setting lever body hits yoke contact');assert(Math.abs(s.carrierLength-M.carrierLength)<1e-6,'corrector rigid length');assert(Math.abs(s.settingLeverLength-M.setRadius)<1e-6,'setting lever rigid length');assert(s.guideError<.003,'corrector pin leaves guide');assert(s.detentGap>=-1e-6&&s.detentGap<.001,'jumper contact');assert(Math.abs(s.returnSpringGap)<1e-6,'return spring detached');assert(s.camAlong>.16&&s.camAlong<.72,'pin outside yoke working face');assert(Math.abs(s.rigidLength-M.yokeLength)<1e-6,'yoke length');assert(s.shoeAxialGap<=s.grooveHalfWidth,'detached yoke shoe');assert(s.shoeRadius-M.shoeRadius>M.grooveNeck,'shoe/core collision');assert(s.shoeRadius+M.shoeRadius<M.grooveOuter,'shoe outside groove');assert(s.camGap>=-1e-5,'pin/yoke collision');assert(s.stemGrooveError<1e-6,'stem groove detached');for(const scale of s.scales)assert(scale.every(v=>Math.abs(v-1)<1e-8),'rigid scale');}
const sample={carrierLength:M.carrierLength,settingLeverLength:M.setRadius,guideError:0,detentGap:0,returnSpringGap:0,camAlong:.4,rigidLength:.9,shoeAxialGap:.022,grooveHalfWidth:.055,shoeRadius:.10,camGap:0,stemGrooveError:0,scales:[[1,1,1]]};rendered(sample);
for(const fault of [{guideError:.04},{detentGap:-.02},{returnSpringGap:.1},{carrierLength:1.3},{settingLeverLength:1.2},{camAlong:1},{shoeAxialGap:.3},{rigidLength:1.1},{shoeRadius:.01},{camGap:-.1},{stemGrooveError:.1},{scales:[[1.2,1,1]]}])assert.throws(()=>rendered({...sample,...fault}));
if(process.argv[2]){const samples=JSON.parse(require('node:fs').readFileSync(process.argv[2],'utf8'));for(const s of samples)rendered(s.geometry);console.log('PASS: '+samples.length+' actual rendered snapshots');}
console.log('PASS: 4001 selecting poses, 101 overrun poses, twelve injected faults');
