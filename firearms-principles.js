/* General-purpose classroom rigs, independent of firearm assemblies. */
(function(root){
const lessons=[
{title:'열이 이동 벽을 움직이는 모형',steps:['열 전달 전','기체에 열 전달','벽에 작용하는 힘','팽창과 이동'],text:['파란 입자는 기체를 나타냅니다. 투명 앞면은 관찰을 위한 절개입니다.','아래 열원이 기체에 에너지를 전달합니다. 주황색은 온도 변화의 상징입니다.','기체가 이동 벽에 힘을 가합니다. 양쪽 압력 차이로 벽이 움직이기 시작합니다.','벽은 안내봉을 따라 이동합니다. 열에너지 일부가 기계적인 일로 바뀐다는 개념입니다.'],legend:'주황: 열원 · 파랑: 기체 · 황동: 이동 벽 · 회색: 안내봉'},
{title:'지렛대로 뜨거운 접촉면 옮기기',steps:['들린 지렛대','축 주위로 회전','접촉과 열 전달','다시 분리'],text:['파란 축이 지렛대의 회전 중심입니다. 주황 접촉면은 이미 뜨거운 물체입니다.','손잡이와 접촉면은 하나의 강체로 함께 회전합니다. 길이가 늘어나지 않습니다.','접촉면이 받침에 닿으면 받침의 색이 바뀝니다. 움직임과 열 전달은 서로 다른 역할입니다.','지렛대가 올라가 접촉이 끊깁니다. 실제 화승총의 내부 장치를 복원한 모형은 아닙니다.'],legend:'파랑: 회전축 · 황동: 지렛대 · 주황: 뜨거운 접촉면 · 회색: 받침'},
{title:'회전·미끄럼과 마찰 접촉',steps:['서로 떨어진 면','접촉면 접근','접촉 중 상대 운동','분리와 잔열'],text:['움직이는 면과 고정된 접촉재를 구분해 보세요.','접촉재의 위치는 외부 입력으로 조절합니다. 아직 닿기 전에는 접촉부의 색이 바뀌지 않습니다.','서로 닿은 면 사이의 상대 운동이 마찰을 만듭니다. 접촉부의 주황색은 열의 개념 표시입니다.','접촉재를 떼면 마찰 접촉이 끝납니다. 바퀴 마찰 / 직선 마찰로 운동 형태를 비교할 수 있습니다.'],legend:'파랑: 움직이는 면 · 황동: 외부 입력으로 위치를 조절하는 접촉재 · 주황: 열 표시'},
{title:'진자에서 슬라이더로 힘 전달',steps:['높이 올린 진자','접촉 전 운동','닿아서 밀기','분리 후 위치'],text:['진자의 높이는 위치 에너지를 떠올리게 합니다. 모터나 점화 장치는 없습니다.','진자 추는 고정 길이의 막대 끝에서 원호를 따라 움직입니다.','추가 슬라이더에 닿은 뒤에만 슬라이더가 움직입니다. 주황색은 접촉 중이라는 뜻입니다.','진자는 돌아오고 슬라이더는 이동한 위치에 남습니다. 충돌·마찰의 수치 해석이 아닌 접촉 순서 모형입니다.'],legend:'파랑: 고정축 · 황동: 진자 · 회색: 슬라이더와 안내봉 · 주황: 접촉'}
];
function create(T,type,variant='wheel'){
 const g=new T.Group(),parts=[],refs={};let target,arm,bob,wheel,shoe,piston,particles=[];
 const colors={base:0x83948f,blue:0x447d8b,brass:0xb79b61,hot:0xbd693e};
 function add(geo,col,x,y,z,id,parent=g){const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:col,metalness:.35,roughness:.45}));m.position.set(x,y,z);m.userData.role='rig';m.userData.id=id;parent.add(m);parts.push(m);refs[id]=m;return m;}
 const box=(w,h,d,col,x,y,z,id,parent)=>add(new T.BoxGeometry(w,h,d),col,x,y,z,id,parent);
 function axle(x,y,len,id,parent=g){const m=add(new T.CylinderGeometry(.11,.11,len,24),colors.blue,x,y,0,id,parent);m.rotation.x=Math.PI/2;return m;}
 function heat(m,k){m.material.emissive.setHex(0xb45120);m.material.emissiveIntensity=k*.7;}
 box(5.2,.15,1.6,colors.base,0,-1.2,0,'base');
 if(type===0){
  box(.15,1.5,1.2,colors.base,-1.85,-.05,0,'fixed-wall');box(3.8,.12,1.2,colors.base,0,-.8,0,'floor');box(3.8,.12,1.2,colors.base,0,.7,0,'roof');
  box(3.8,1.5,.06,0xb4c2be,0,-.05,-.62,'back-wall');piston=box(.15,1.38,1.18,colors.brass,.1,-.05,0,'piston');
  for(const z of [-.35,.35]){const m=add(new T.CylinderGeometry(.04,.04,4,16),0x9ba7a4,0,.0,z,'rail'+z);m.rotation.z=Math.PI/2;}
  target=box(1.9,.17,1,colors.hot,-.8,-1,0,'heater');
  for(let i=0;i<24;i++)particles.push(add(new T.SphereGeometry(.045,10,8),colors.blue,0,0,0,'gas'+i));
 }else if(type===1){
  box(.22,1.6,.6,colors.base,-1.2,-.35,0,'upright');axle(-1.2,.5,.9,'pivot');arm=new T.Group();arm.position.set(-1.2,.5,0);g.add(arm);
  box(3,.15,.3,colors.brass,.5,0,0,'lever',arm);shoe=box(.4,.2,.5,colors.hot,2,-.12,0,'shoe',arm);target=box(.65,.2,.65,colors.base,.8,.18,0,'receiver');box(.2,1.21,.4,colors.base,.8,-.525,0,'support');
 }else if(type===2){
  if(variant==='wheel'){box(.25,1.25,.4,colors.base,0,-.5,-.3,'upright');axle(0,.1,.9,'pivot');wheel=new T.Group();wheel.position.set(0,.1,0);g.add(wheel);const disk=add(new T.CylinderGeometry(.8,.8,.35,48),colors.blue,0,0,0,'wheel',wheel);disk.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;box(.1,.1,.02,colors.brass,.61*Math.cos(a),.61*Math.sin(a),.19,'mark'+i,wheel);}shoe=box(.45,.24,.3,colors.brass,0,1.5,0,'shoe');}
  else{wheel=box(2.8,.3,.7,colors.blue,0,-.1,0,'surface');shoe=box(.5,.24,.5,colors.brass,-.8,.65,0,'shoe');box(3.2,.14,.85,colors.base,0,-.32,0,'guide');for(const x of [-1.1,1.1])box(.16,.735,.5,colors.base,x,-.7575,0,'leg'+x);}
 }else{
  box(.2,2.8,.5,colors.base,0,.2,-.45,'upright');axle(0,1.6,1,'pivot');arm=new T.Group();arm.position.set(0,1.6,0);g.add(arm);box(.1,1.5,.14,colors.brass,0,-.75,0,'rod',arm);bob=add(new T.SphereGeometry(.22,24,16),colors.brass,0,-1.5,0,'bob',arm);target=box(.6,.7,.7,colors.base,.52,.1,0,'slider');box(3,.1,.85,colors.blue,1,-.3,0,'guide');for(const x of [-.1,2.1])box(.16,.775,.5,colors.base,x,-.7375,0,'leg'+x);
 }
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 let contact=false;
 function update(t){t=Math.max(0,Math.min(8,t));contact=false;
  if(type===0){const h=ease((t-2)/2),v=ease((t-4)/4);piston.position.x=.1+1.5*v;heat(target,h);particles.forEach((m,i)=>{m.position.set(-1.62+(i%6)/6*(piston.position.x+1.45)+Math.sin(t*3+i)*.035*h,-.55+Math.floor(i/6)*.32+Math.cos(t*3+i)*.03*h,(i%2?1:-1)*.25);heat(m,h*.4);});}
  if(type===1){arm.rotation.z=.55*(1-ease((t-2)/2)+ease((t-6)/2));contact=t>=4&&t<=6;heat(target,t>=4?ease((t-4)/2)*(1-.4*ease((t-6)/2)):0);}
  if(type===2){const gap=.5*(1-ease((t-2)/2)+ease((t-6)/2));contact=t>=4&&t<=6;if(variant==='wheel'){shoe.position.y=1.02+gap;wheel.rotation.z=-Math.min(t,6)*1.4;}else{shoe.position.y=.17+gap;shoe.position.x=-.8+1.6*ease((t-2)/4);}heat(shoe,t>=4?ease((t-4)/2)*(1-.5*ease((t-6)/2)):0);}
  if(type===3){const a=t<4?-.65*(1-ease(t/4)):t<6?.3*ease((t-4)/2):.3-.95*ease((t-6)/2);arm.rotation.z=a;target.position.x=.52+1.5*Math.sin(t<4?0:t<6?a:.3);contact=t>=4&&t<=6;heat(target,contact?.5:0);}
  g.updateMatrixWorld(true);return audit();
 }
 function audit(){const pos=id=>g.worldToLocal(refs[id].getWorldPosition(new T.Vector3())).toArray();const out={type,variant,contact,parts:parts.map(m=>({id:m.userData.id,position:m.getWorldPosition(new T.Vector3()).toArray(),scale:m.scale.toArray()}))};if(type===1){const p=pos('shoe'),r=pos('receiver');out.gap=p[1]-.1*Math.cos(arm.rotation.z)-.2*Math.abs(Math.sin(arm.rotation.z))-(r[1]+.1);}if(type===2){out.gap=variant==='wheel'?pos('shoe')[1]-.12-(pos('wheel')[1]+.8):pos('shoe')[1]-.12-(pos('surface')[1]+.15);}if(type===3){out.gap=pos('slider')[0]-.3-(pos('bob')[0]+.22);out.armLength=g.worldToLocal(refs.bob.getWorldPosition(new T.Vector3())).distanceTo(g.worldToLocal(arm.getWorldPosition(new T.Vector3())));}return out;}
 g.userData.parts=parts;g.userData.update=update;g.userData.audit=audit;update(0);return g;
}
const api={create,lessons};if(typeof module!=='undefined')module.exports=api;else root.FirearmPrinciples=api;
})(typeof window!=='undefined'?window:globalThis);
