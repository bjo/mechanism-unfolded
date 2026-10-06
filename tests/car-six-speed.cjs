const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../car-drivetrain');
const near=(a,b,e=1e-6)=>assert(Math.abs(a-b)<e,`${a} != ${b}`),dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
function validate(s){s=s.vehicle||s;const q=s.six;assert(q);q.forkErrors.forEach(x=>near(x,0));q.headErrors.forEach(x=>near(x,0));assert(q.sleeves.filter(x=>Math.abs(x)>1e-5).length<=1,'two gears locked at once');q.forkPadGaps.forEach(x=>near(x,0));
 for(const rod of [q.clutchRod,q.slaveRod]){near(dist(...rod.ends),rod.length);near(dist(rod.ends[0],rod.joint),0);near(dist(rod.ends[1],rod.piston),0);}
 near(q.clutch.masterTravel*q.clutch.areaRatio,q.clutch.slaveTravel);near(q.leverBall[0],0);near(q.leverBall[2],.6);assert(q.leverBall[1]>.0&&q.leverBall[1]<.78,'lower lever ball left socket');for(const p of q.rockerPins){near(p[1],0);near(p[2],0);assert(Math.abs(p[0])+.05<.325,'crank pin outside lateral slot');}
 s.rigid.forEach(x=>{assert.deepEqual(x.scale,[1,1,1]);near(x.actualLength,x.expectedLength);});for(const g of s.gearMeshes){near(g.distance,g.pitch);near(g.plane,0);if(g.hand[0])near(g.hand[0],-g.hand[1]);}near(s.forkError,0);near(s.clutchContact.finger,s.clutchContact.bearing);assert(s.railClearance>.2);
}
// H-gate and dog contacts through every directed change, starting from rotating phases.
for(const from of ['N','1','2','3','4','5','6','R'])for(const to of ['N','1','2','3','4','5','6','R']){
 const t=new D.Transmission();t.input=.73;t.output=-.49;t.unlockReverse(true);t.request(from);for(let i=0;i<250;i++)t.tick(.01,0);t.unlockReverse(true);assert(t.request(to));for(let i=0;i<250;i++){t.tick(.01,0);assert(t.sleeves.filter(x=>Math.abs(x)>1e-6).length<=1);if(t.busy&&t.shift>.2&&t.shift<.4)t.sleeves.forEach(x=>near(x,0));}assert.equal(t.gear,to);
 if(to!=='N'){const p=t.pose(),hub=['3','4'].includes(to)?p.counter:p.output;near(D.mod(hub-p.angles[to]+Math.PI/12,Math.PI/6)-Math.PI/12,0,1e-5);t.setClutch(0);const a=t.output;t.tick(.1,.2);near(t.output-a,D.spec.ratios[to]*.2);}
}
const blocked=new D.Transmission();assert(!blocked.request('R'));blocked.setClutch(0);assert(!blocked.request('2'));blocked.setClutch(.5);let input=blocked.input;blocked.tick(.1,.2);near(blocked.input,input);blocked.setClutch(1);blocked.unlockReverse(true);blocked.outputSpeed=1;assert(!blocked.request('R'));
for(let p=0;p<=100;p++){const c=D.clutchPose(p/100);near(dist(c.joint,c.piston),.65);near(dist(c.slaveJoint,c.slavePiston),.4);near(c.masterTravel*c.areaRatio,c.slaveTravel);assert(c.release>=-1e-8&&c.release<=.140001);}
// Tooth surfaces at both ends and middle of each helical face; opposite hands preserve mesh.
function inside(p,P){let yes=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
const outlines=new Map();const outline=n=>{if(!outlines.has(n))outlines.set(n,D.gearOutline(n));return outlines.get(n);};
function overlap(na,nb,a,b){const A=outline(na),B=outline(nb),c=Math.cos(a),s=Math.sin(a),cb=Math.cos(-b),sb=Math.sin(-b),d=(na+nb)*.03;return A.some(([x,y])=>{const X=c*x-s*y,Y=s*x+c*y-d;return Math.hypot(X,Y)<nb*.03+.06&&inside([cb*X-sb*Y,sb*X+cb*Y],B);});}
for(let i=0;i<80;i++)for(const [na,nb] of [[30,30],...Object.values(D.six.teeth)])for(const z of [-.11,0,.11]){const a=i/80*D.TAU, b=(Math.PI-na*a)/nb;assert(!overlap(na,nb,a-Math.tan(D.six.helix)/(.03*na)*z,b+Math.tan(D.six.helix)/(.03*nb)*z),`tooth penetration ${na}/${nb}`);}
assert(overlap(20,40,Math.PI/40,Math.PI/40),'injected tooth phase error not detected');
if(process.argv[2]){global.window=global;global.CarDrive=D;eval(fs.readFileSync(path.join(__dirname,'../car-vehicle.js'),'utf8'));const m=createCarVehicle(require(path.resolve(process.argv[2])));let count=0;
 for(const mode of [6,10]){m.setMode(mode);for(const gear of ['1','2','3','4','5','6','R','N']){m.transmission.setClutch(1);m.transmission.tick(.1,0);m.transmission.unlockReverse(true);assert(m.transmission.request(gear));for(let i=0;i<125;i++){m.transmission.tick(.02,0);m.update();validate(m.audit());count++;}for(let p=0;p<=20;p++){m.transmission.setClutch(p/20);m.update();validate(m.audit());count++;}}}
 const good=m.audit();for(const bad of [q=>q.six.forkErrors[1]=.1,q=>q.six.sleeves=[.2,.2,0,0],q=>q.six.forkPadGaps[0]=.1,q=>q.six.clutchRod.ends[0][0]+=.1,q=>q.six.leverBall[0]=.2,q=>q.six.rockerPins[0][2]=.2,q=>q.six.clutch.slaveTravel+=.1]){const q=structuredClone(good);bad(q);assert.throws(()=>validate(q));}console.log(`PASS ${count} rendered shift/pedal poses in standalone and whole-car scales; 7 faults rejected`);
}
if(process.argv[3]){const samples=JSON.parse(fs.readFileSync(process.argv[3]));samples.forEach(validate);console.log(`PASS ${samples.length} browser snapshots`);}
console.log('PASS all 64 shift transitions; 101 hydraulic/rigid-link poses; 1440 helical tooth slices; pedal/reverse interlocks');
