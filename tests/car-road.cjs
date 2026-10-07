const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../car-road'),D=require('../car-drivetrain');
const near=(a,b,e=1e-6)=>assert(Math.abs(a-b)<e,`${a} != ${b}`);
for(let a=-25;a<=25;a++){const c=R.corner(a);near((c.left+c.right)/2,1);near(c.right-c.left,R.spec.track*Math.tan(a*Math.PI/180)/R.spec.wheelbase);if(a>0)assert(c.right>c.left);}
const d=new R.Drive(),tx=new D.Transmission();d.speed=10;assert(!d.canSelect('R',tx,D.spec.ratios));d.speed=-2;assert(!d.canSelect('1',tx,D.spec.ratios));d.speed=40;assert(!d.canSelect('1',tx,D.spec.ratios));d.speed=0;assert(d.canSelect('R',tx,D.spec.ratios));
global.window=global;global.CarDrive=D;global.CarRoad=R;eval(fs.readFileSync(path.join(__dirname,'../car-vehicle.js'),'utf8'));const model=createCarVehicle(require(path.resolve(process.argv[2])));model.setMode(10);
function validate(s){const d=s.drive,w=s.wholeConnection;near(w.output,w.propAngle);near(w.output,-3*w.carrier);near((s.diffAngles[0]+s.diffAngles[1])/2,s.diffAngles[2]);near(d.acceleration,d.force/R.spec.mass,1e-5);near(d.netWheelTorque,d.force*R.spec.radius,1e-5);if(!d.contact||s.transmission.gear==='N')near(d.wheelTorque,0);if(d.connected&&!d.slipping)near(d.rpm,Math.abs(d.speed)/R.spec.radius*60/(2*Math.PI)*R.spec.final/Math.abs(D.spec.ratios[d.gear]),1e-4);for(const r of s.rigid){assert.deepEqual(r.scale,[1,1,1]);near(r.actualLength,r.expectedLength);}for(const x of s.gearMeshes){near(x.distance,x.pitch);near(x.plane,0);}s.six.forkErrors.forEach(x=>near(x,0));const p=s.transmission;if(p.gear!=='N'){const hub=['3','4'].includes(p.gear)?p.counter:p.output,pitch=D.TAU/12;near(D.mod(hub-p.angles[p.gear]+pitch/2,pitch)-pitch/2,0,1e-5);}if(s.mode===10)near((s.steering[0].angle+s.steering[1].angle)/2*180/Math.PI,d.angle||0,.003);}
let steps=new Set(),count=0,coasted=false,reverse=false,previous=model.audit(),good;
for(let i=0;i<10000;i++){
 model.tick(.02,.02*Math.PI/3);const s=model.audit(),d=s.drive;steps.add(d.step);
 // Output keeps rotating with road speed while the engine clutch is disconnected.
 if(d.kmh>20&&s.transmission.clutch>.99&&Math.abs(s.transmission.output-previous.transmission.output)>.0001)coasted=true;
 if(s.transmission.gear==='R'&&previous.transmission.gear!=='R')assert(Math.abs(d.speed)<.001,'reverse selected before stop');
 if(d.speed<-.1)reverse=true;
 validate(s);count++;if(i%10===0)good=structuredClone(s);
 previous=s;if(d.done)break;
}
assert(model.state.drive.done,'guided drive did not finish');assert.equal(steps.size,R.plan.length);assert(coasted);assert(reverse);near(model.state.drive.speed,0);
const paused=model.audit();for(let i=0;i<50;i++)model.tick(.02,0);assert.deepEqual(model.audit(),paused,'pause changed a coupled body');
for(const bad of [s=>s.drive.force+=500,s=>s.wholeConnection.output+=1,s=>s.diffAngles[0]+=.5]){const s=structuredClone(good);bad(s);assert.throws(()=>validate(s));}
if(process.argv[3]){const samples=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));for(const s of samples)validate(s);console.log('PASS browser poses',samples.length);}
console.log(`PASS ${count} rendered drive poses; all ${steps.size} guided phases; moving shift, RPM/force equations, reverse-after-stop, pause; 3 faults rejected`);
