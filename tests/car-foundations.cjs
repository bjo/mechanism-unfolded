const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../car-drivetrain');
const near=(a,b,e=1e-6)=>assert(Math.abs(a-b)<e,`${a} != ${b}`),distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function validate(s){
 s=s.vehicle||s;
 for(const r of s.rigid){assert.deepEqual(r.scale,[1,1,1],'rigid part scaled');near(r.actualLength,r.expectedLength);}
 for(const g of s.gearMeshes){near(g.distance,g.pitch);near(g.plane,0);}
 assert(s.railClearance>.20,'shift rail intersects gear envelope');near(s.clutchContact.finger,s.clutchContact.bearing);near(s.rackContact.shift,s.rackContact.angle*s.rackContact.pitch);near(s.bevelAngles.pinion-Math.PI/12,3*s.bevelAngles.carrier);s.bevelAngles.spiders.forEach(a=>near(a-Math.PI/12,-2*s.bevelAngles.relative));near(s.forkError,0);near(s.diffAngles[0]+s.diffAngles[1],2*s.diffAngles[2]);
 for(const t of s.steeringLinks){near(distance(...t.rod),t.length);for(let i=0;i<2;i++)near(distance(t.rod[i],t.joints[i]),0);for(const a of t.arms)near(distance(a.inner[0],a.outer),distance(a.inner[1],a.outer));}
 near(distance(...s.brakeRod.ends),s.brakeRod.length);near(distance(s.brakeRod.ends[0],s.brakeRod.joint),0);near(distance(s.brakeRod.ends[1],s.brakeRod.piston),0);
 for(const gap of s.padGaps){assert(gap>=-1e-7);near(gap,s.brake.padGap);}if(s.brake.pressure>0)s.padGaps.forEach(g=>near(g,0));
 s.steering.forEach(p=>assert(p.error<1e-7,'unreachable steering pose'));
}
// Constraints swept through both steering directions, both bump endpoints and every pedal position.
for(let r=-16;r<=16;r++)for(let b=-25;b<=32;b++)for(const side of [-1,1]){const p=D.steering(r/100,b/100,side);assert(p.error<1e-7);near(distance(p.inner,p.outer),p.length);}
for(let p=0;p<=100;p++){const b=D.brakePose(p/100);near(distance(b.joint,b.piston),b.rodLength);assert(b.pressure===0||b.padGap===0);}
const tx=new D.Transmission();tx.setClutch(0);assert(!tx.request('1'));tx.setClutch(1);
for(const g of ['1','N','2','R','N']){assert(tx.request(g));assert(!tx.setClutch(0));for(let i=0;i<241;i++){tx.tick(.01,0);if(tx.busy)assert.equal(tx.gear,'N');}assert.equal(tx.gear,g);if(g!=='N'){const pose=tx.pose(),angle=g==='1'?pose.low:g==='2'?pose.high:pose.reverseGear,pitch=D.TAU/(g==='R'?20:12);near(D.mod(pose.output-angle+pitch/2,pitch)-pitch/2,0,1e-5);tx.setClutch(0);let o=tx.output;tx.tick(.1,.1);near(tx.output-o,.1*D.spec.ratios[g]);tx.setClutch(1);tx.tick(.1,0);}}
// Involute flank collision, including the originally wrong compound-wheel phase.
function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function overlap(nA,nB,a,b){const A=D.gearOutline(nA),B=D.gearOutline(nB),c=Math.cos(a),s=Math.sin(a),cb=Math.cos(-b),sb=Math.sin(-b),d=(nA+nB)*.03;return A.some(([x,y])=>{const X=c*x-s*y,Y=s*x+c*y-d;return Math.hypot(X,Y)<nB*.03+.06&&inside([cb*X-sb*Y,sb*X+cb*Y],B);});}
let overlapCount=0;for(let i=0;i<240;i++){const t=i/240*D.TAU;for(const [na,nb,a,b] of [[40,20,-t/2+Math.PI/40,t],[20,40,-t/2+Math.PI/40,t*.25+Math.PI/80],[28,32,-t/2+Math.PI/40,t*.4375+.3*Math.PI/32]])if(overlap(na,nb,a,b))overlapCount++;}
assert.equal(overlapCount,0,'spur tooth penetration');assert(overlap(20,40,Math.PI/40,Math.PI/40),'bad compound phase must fail');
if(process.argv[2]){
 const T=require(path.resolve(process.argv[2]));global.window=global;global.CarDrive=D;eval(fs.readFileSync(path.join(__dirname,'../car-vehicle.js'),'utf8'));const model=createCarVehicle(T);let count=0;
 for(const mode of [6,7,8,9,10]){model.setMode(mode);for(let k=0;k<=100;k++){model.setSettings({rack:.16*Math.sin(k/100*D.TAU),bump:-.25+.57*k/100,split:-1+2*k/100,brake:k/100});model.tick(.02,.02);const s=model.audit();validate(s);count++;}}
 model.setMode(10);for(let i=0;i<1801;i++){model.tick(.02,.02*Math.PI/3);if(i%20===0){const s=model.audit();validate(s);const w=s.wholeConnection;near(w.output,-w.carrier*3);near(w.output,w.propAngle);assert(distance(w.gearboxEnd,w.propStart)<.011);assert(distance(w.propEnd,w.pinionEnd)<.011);}if(i===1000)assert.equal(model.state.transmission.gear,'2');}near(model.state.journeyTime,36);
 const good=model.audit();for(const bad of [s=>s.rigid[0].scale[0]=1.1,s=>s.gearMeshes[0].distance+=.1,s=>s.steeringLinks[0].joints[0][0]+=.1,s=>s.padGaps[0]=-.1,s=>s.diffAngles[0]+=.2]){const sample=structuredClone(good);bad(sample);assert.throws(()=>validate(sample));}
 console.log(`PASS ${count} actual Three.js assembly poses; 5 geometry faults rejected`);
}
if(process.argv[3]){const data=JSON.parse(fs.readFileSync(process.argv[3]));data.forEach(validate);console.log(`PASS ${data.length} browser-rendered snapshots`);}
console.log('PASS 3828 steering constraints; brake linkage/contact; shift interlock and synchronization; 720 involute gear poses');
