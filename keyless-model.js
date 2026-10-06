/* One mounted keyless assembly. Inspection views clone these same bodies. */
window.createKeylessWorks=function(T,S,H){
 const {group,add,ring,shaft,beam,gear,faceTeeth}=H,M=KeylessMechanics,K=S.keyless,tau=2*Math.PI;
 const steel=0x899eaf,gold=0xba944e,blue=0x168fb9,green=0x238771;
 const cw=group('crownWheel',...K.winding.p),cwRotor=gear(34,K.crownR,'crown',cw,1.60,false),cwFace=faceTeeth(cw,24,K.crownR,1.64);
 const windingIdler=group('windingIdler',...K.winding.idler),windingIdlerRotor=gear(32,K.winding.idlerR,'crown',windingIdler,1.60,true);
 shaft(.030,.02,1.84,'keyless',cw,steel);ring(K.crownR*.26+.01,.031,.065,'crown',cw,1.60,steel);
 // The idler lies over the barrel edge: suspend its pivot from a bridge,
 // rather than placing an impossible pillar through the barrel wall.
 shaft(.010,1.59,1.82,'keyless',windingIdler,steel);
 beam(0,0,K.winding.idler[0]-K.winding.p[0],K.winding.idler[1]-K.winding.p[1],.07,'keyless',cw,1.79,steel);
 const crown=group('crown',3.38,0,M.stemZ);
 function axialCylinder(parent,r,start,end,color=steel,key='keyless'){const m=add(new T.CylinderGeometry(r,r,end-start,32),key,parent,color);m.rotation.z=Math.PI/2;m.position.x=(start+end)/2;return m;}
 axialCylinder(crown,.04,-2.65,-.418);axialCylinder(crown,.023,-.418,-.342);axialCylinder(crown,.065,-.445,-.418);axialCylinder(crown,.065,-.342,-.315);axialCylinder(crown,.045,-.342,.38);
 const square=add(new T.BoxGeometry(1.70,.058,.058),'crown',crown,blue);square.position.x=-1.54;
 axialCylinder(crown,.28,-.02,.38,steel,'crown');for(let i=0;i<36;i++){const a=i*tau/36,m=add(new T.BoxGeometry(.38,.025,.025),'crown',crown,0x60788b);m.position.set(.18,.282*Math.cos(a),.282*Math.sin(a));}
 const windingPin=group('windingPin',M.windingPinX,0,M.stemZ),pinTurn=new T.Group();windingPin.add(pinTurn);pinTurn.rotation.y=Math.PI/2;const windPinRotor=gear(18,K.crownR*18/24,'crown',pinTurn,-.055,false,.11);
 const windingBush=ring(K.crownR*18/24*.26+.005,.046,.11,'crown',pinTurn,-.055,steel);
 const slidingClutch=group('slidingClutch',M.sliderX[0],0,M.stemZ),clutchRotor=new T.Group();slidingClutch.add(clutchRotor);
 // The yoke enters the annular waist, between (not inside) the two working ends.
 function spool(radius,start,end){const shape=new T.Shape();shape.absarc(0,0,radius,0,tau,false);const bore=new T.Path();bore.moveTo(-.033,-.033);bore.lineTo(-.033,.033);bore.lineTo(.033,.033);bore.lineTo(.033,-.033);bore.closePath();shape.holes.push(bore);const mesh=add(new T.ExtrudeGeometry(shape,{depth:end-start,bevelEnabled:false}),'keyless',clutchRotor,steel);mesh.rotation.y=Math.PI/2;mesh.position.x=start;}
 spool(.095,M.faceX,-.105);spool(M.grooveNeck,-.055,.055);spool(M.grooveOuter,-.105,-.055);spool(M.grooveOuter,.055,.10);
 const settingFace=new T.Group();settingFace.position.x=M.faceX;settingFace.rotation.y=Math.PI/2;clutchRotor.add(settingFace);ring(.157,.080,.027,'keyless',settingFace,0,blue);
 for(let i=0;i<M.pinionN;i++){const a=i*tau/M.pinionN,m=add(new T.BoxGeometry(.050,.019,.045),'keyless',settingFace,blue);m.position.set(M.pinionR*Math.cos(a),M.pinionR*Math.sin(a),.018);m.rotation.z=a;}
 function dogs(parent,reverse){const g=new T.Group();parent.add(g);for(let i=0;i<12;i++){const a=i*tau/12,s=new T.Shape();s.moveTo(0,-.013);s.lineTo(.043,-.013);s.lineTo(0,.013);s.closePath();const m=add(new T.ExtrudeGeometry(s,{depth:.035,bevelEnabled:false}),'keyless',g,blue);m.rotation.set(a,0,reverse?Math.PI:0);m.position.set(reverse?-.055:.10,.112*Math.cos(a),.112*Math.sin(a));}return g;}
 const clutchDogs=dogs(clutchRotor,false),windDogs=dogs(windingPin,true);
 const support=group('keylessSupport');for(const p of [M.yokePivot,M.carrierPivot]){const g=new T.Group();g.position.set(...p,0);support.add(g);shaft(.045,.02,2.28,'keyless',g,steel);ring(.10,.047,.05,'keyless',g,2.20,steel);}
 beam(2.77,.70,3.10,.75,.14,'keyless',support,2.20,steel);const outerFoot=new T.Group();outerFoot.position.set(2.77,.70,0);support.add(outerFoot);shaft(.045,.02,2.22,'keyless',outerFoot,steel);const settingPivot=new T.Group();settingPivot.position.set(...M.setPivot,0);support.add(settingPivot);shaft(.030,2.20,2.37,'keyless',settingPivot,steel);
 const selectorLever=group('selectorLever',...M.yokePivot,M.stemZ+.095);
 const end=M.rot([M.yokeLength,0],M.shoeOffset),yokeArm=beam(0,0,...end,.065,'keyless',selectorLever,0,gold);
 ring(.092,.041,.035,'keyless',selectorLever,-.018,gold);
 // Actual flat working face: the setting-lever pin is tangent to y=-faceOffset.
 const yokeContact=beam(.16,-M.faceOffset+.025,.72,-M.faceOffset+.025,.050,'keyless',selectorLever,.055,gold);
 beam(0,0,.18,-.025,.075,'keyless',selectorLever,.025,gold);
 const yokeSlot=new T.Group();selectorLever.add(yokeSlot);yokeSlot.position.set(...end,0);
 const shoe=add(new T.SphereGeometry(M.shoeRadius,16,12),'keyless',yokeSlot,gold);
 const setLever=group('settingLever',...M.setPivot,M.stemZ+.22);
 beam(0,0,M.setRadius,0,.095,'keyless',setLever,0,gold);beam(0,0,0,-.5,.10,'keyless',setLever,0,gold);ring(.09,.035,.05,'keyless',setLever,-.025,gold);
 const stemPin=shaft(.024,-.195,.025,'keyless',setLever,blue);stemPin.position.x=M.setRadius;
 const controlPin=shaft(M.pinRadius,-.100,-.015,'keyless',setLever,blue);controlPin.position.y=-.5;
 const selectorCarrier=group('correctorOperatingLever',...M.carrierPivot,2.28);
 beam(0,0,M.carrierLength,0,.06,'keyless',selectorCarrier,0,gold);ring(.08,.04,.035,'keyless',selectorCarrier,-.02,gold);
 const settingWheelAxis=new T.Group();selectorCarrier.add(settingWheelAxis);settingWheelAxis.position.x=M.carrierLength;
 shaft(.027,M.gearZ-2.28,.03,'keyless',settingWheelAxis,steel);
 const transferWheel=gear(M.settingN,M.settingR,'keyless',settingWheelAxis,M.gearZ-2.28,false,M.gearWidth);
 ring(.036,.026,M.gearWidth,'keyless',settingWheelAxis,M.gearZ-2.28,steel);
 // A pin and working slot communicate the correction lever's selection.
 // The guide outline is an educational fit, not a Sellita manufacturing profile.
 const correctorPin=shaft(.025,.01,.135,'keyless',selectorCarrier,blue);correctorPin.position.x=.30;
 const slotPoints=[],guideRails=[];
 for(let i=0;i<=80;i++){const p=M.pose(i/40),world=M.rot([.30,0],p.carrierAngle).map((x,j)=>x+M.carrierPivot[j]-M.setPivot[j]);slotPoints.push(M.rot(world,-p.setAngle));}
 for(let i=1;i<slotPoints.length;i++){const a=slotPoints[i-1],b=slotPoints[i],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1e-6)continue;for(const side of [-1,1]){const ox=-dy/l*.040*side,oy=dx/l*.040*side;guideRails.push(beam(a[0]+ox,a[1]+oy,b[0]+ox,b[1]+oy,.024,'keyless',setLever,.055,steel));}}
 beam(0,0,slotPoints[0][0],slotPoints[0][1],.075,'keyless',setLever,.055,steel);
 const jumper=group('settingJumper'),detentLocal=[.18,-.38],detentR=Math.hypot(...detentLocal),offset=Math.atan2(detentLocal[1],detentLocal[0]);
 const detentPin=shaft(.026,.05,.16,'keyless',setLever,blue);detentPin.position.set(...detentLocal,.105);
 const detents=[0,1,2].map(p=>M.pose(p).setAngle+offset),lo=detents[0]-.25,hi=detents[2]+.15;
 const springGeo=new T.BufferGeometry(),springArray=new Float32Array(242*3),springIndices=[];for(let i=0;i<120;i++){const k=2*i;springIndices.push(k,k+1,k+2,k+1,k+3,k+2);}springGeo.setAttribute('position',new T.BufferAttribute(springArray,3));springGeo.setIndex(springIndices);const leaf=add(springGeo,'keyless',jumper,green);
 const anchor=[M.setPivot[0]+(detentR+.026)*Math.cos(lo),M.setPivot[1]+(detentR+.026)*Math.sin(lo)];const anchorGroup=new T.Group();anchorGroup.position.set(...anchor,2.405);jumper.add(anchorGroup);shaft(.052,.02-2.405,.02,'keyless',anchorGroup,steel);
 const returnSpring=new T.BufferGeometry();returnSpring.setAttribute('position',new T.BufferAttribute(new Float32Array(33*3),3));const returnLine=new T.Line(returnSpring,new T.LineBasicMaterial({color:green}));jumper.add(returnLine);
 const returnAnchor=[M.yokePivot[0]-.23,M.yokePivot[1]+.10];const returnFoot=new T.Group();returnFoot.position.set(...returnAnchor,2.20);jumper.add(returnFoot);shaft(.05,.02-2.20,.055,'keyless',returnFoot,steel);
 const returnPin=shaft(.028,.02,.115,'keyless',selectorLever,steel);returnPin.position.x=.16;
 const ks=K.setting,settingBridge=group('settingBridge',...ks.p),settingTop=gear(18,M.outputR,'keyless',settingBridge,M.gearZ,false,M.gearWidth),settingBottom=gear(ks.n,ks.r,'motion',settingBridge,ks.z,false,.055);shaft(.045,ks.z,M.gearZ+.07,'keyless',settingBridge,gold);
 ring(.060,.044,M.gearWidth,'keyless',settingBridge,M.gearZ,gold);ring(ks.r*.26+.01,.044,.055,'keyless',settingBridge,ks.z,gold);
 const timePort=settingBridge,timePortWheel=settingTop,timeAdapter=new T.Group();
 const settingPhase=((36+ks.n)*Math.atan2(ks.p[1],ks.p[0]-.64)+ks.n*Math.PI-Math.PI-35*Math.PI)/ks.n,keyless=group('keyless');
 const phase=(a,b,nA,nB)=>((nA+nB)*Math.atan2(b[1]-a[1],b[0]-a[0])+nB*Math.PI-Math.PI)/nB;
 let lastPose=M.pose(0);
 mechanismAudit.mesh('keyless selected time output',transferWheel,settingTop,()=>Math.abs(lastPose.position-2)<.0001);
 function update(position,input,settingAngle,windAngle,overrun,dateAngle=0){const p=M.pose(position,overrun);lastPose=p;crown.position.x=3.38+M.stemTravel*position/2;crown.rotation.x=input;slidingClutch.position.set(p.sliderX,0,M.stemZ);clutchRotor.rotation.set(input,0,0);clutchDogs.rotation.set(0,0,0);selectorLever.position.set(...M.yokePivot,M.stemZ+.095);selectorLever.rotation.z=p.yokeAngle;yokeSlot.position.set(...end,0);setLever.rotation.z=p.setAngle;selectorCarrier.rotation.z=p.carrierAngle;windDogs.rotation.x=windAngle;
  transferWheel.rotation.z=(position>=1.999?-settingAngle*18/10+phase(M.timeOutput,M.timePoint,18,10):dateAngle*12/10+phase(M.datePoint,M.quickPoint,18,10))-p.carrierAngle;
  const angle=p.setAngle+offset;let j=angle<=detents[1]?0:1,t=Math.max(0,Math.min(1,(angle-detents[j])/(detents[j+1]-detents[j])));const lift=.024*Math.sin(Math.PI*t)**2;
  const dxy=M.rot(detentLocal,p.setAngle).map((v,i)=>v+M.setPivot[i]);
  function springShape(extra){let minimum=Infinity,previous=null;for(let i=0;i<=120;i++){const a=lo+(hi-lo)*i/120,k=a<=detents[1]?0:1,u=Math.max(0,Math.min(1,(a-detents[k])/(detents[k+1]-detents[k]))),notch=.024*Math.sin(Math.PI*u)**2,flex=Math.min(1,(a-lo)/Math.max(.001,angle-lo)),r=detentR+.026-notch+(lift+extra)*flex;
    const point=[M.setPivot[0]+r*Math.cos(a),M.setPivot[1]+r*Math.sin(a)];if(previous){const vx=point[0]-previous[0],vy=point[1]-previous[1],t=Math.max(0,Math.min(1,((dxy[0]-previous[0])*vx+(dxy[1]-previous[1])*vy)/(vx*vx+vy*vy)));minimum=Math.min(minimum,Math.hypot(dxy[0]-previous[0]-t*vx,dxy[1]-previous[1]-t*vy));}previous=point;
    for(let side=0;side<2;side++){const rr=r+side*.022;springArray[(i*2+side)*3]=M.setPivot[0]+rr*Math.cos(a);springArray[(i*2+side)*3+1]=M.setPivot[1]+rr*Math.sin(a);springArray[(i*2+side)*3+2]=2.42;}}
    return minimum;
  }
  let low=0,high=.08;for(let i=0;i<16;i++){const mid=(low+high)/2;if(springShape(mid)<.026)low=mid;else high=mid;}springShape(high);
  springGeo.attributes.position.needsUpdate=true;springGeo.computeVertexNormals();
  const rp=M.rot([.16,0],p.yokeAngle).map((v,i)=>v+M.yokePivot[i]),rd=Math.hypot(rp[0]-returnAnchor[0],rp[1]-returnAnchor[1]),surface=rp.map((v,i)=>v-(v-returnAnchor[i])*.028/rd);for(let i=0;i<=32;i++){const t=i/32,x=returnAnchor[0]*(1-t)+surface[0]*t,y=returnAnchor[1]*(1-t)+surface[1]*t+.15*Math.sin(Math.PI*t);returnSpring.attributes.position.setXYZ(i,x,y,2.25);}returnSpring.attributes.position.needsUpdate=true;
  return p;
 }
 function snapshot(){
  const world=o=>o.getWorldPosition(new T.Vector3()),a=world(selectorLever),b=world(shoe),c=world(slidingClutch),pin=selectorLever.worldToLocal(world(controlPin)),stemPoint=world(stemPin),stemCenter=crown.localToWorld(new T.Vector3(-.38,0,0)),cp=world(correctorPin);let guideError=Infinity;
  for(let i=0;i<guideRails.length;i+=2){const e=guideRails[i],f=guideRails[i+1],ends=[-1,1].map(side=>e.localToWorld(new T.Vector3(side*e.geometry.parameters.width/2,0,0)).add(f.localToWorld(new T.Vector3(side*f.geometry.parameters.width/2,0,0))).multiplyScalar(.5));const v=ends[1].clone().sub(ends[0]);v.z=0;const d=cp.clone().sub(ends[0]);d.z=0;const t=Math.max(0,Math.min(1,d.dot(v)/v.lengthSq()));guideError=Math.min(guideError,d.sub(v.multiplyScalar(t)).length());}
  const dp=world(detentPin);let detentGap=Infinity;for(let i=0;i<=120;i++){const p=jumper.localToWorld(new T.Vector3().fromBufferAttribute(springGeo.attributes.position,i*2));detentGap=Math.min(detentGap,Math.hypot(p.x-dp.x,p.y-dp.y)-.026);}
  const endpoint=jumper.localToWorld(new T.Vector3().fromBufferAttribute(returnSpring.attributes.position,32)),rp=world(returnPin);
  return {rigidLength:a.distanceTo(b),carrierLength:world(selectorCarrier).distanceTo(world(settingWheelAxis)),settingLeverLength:Math.hypot(stemPoint.x-world(setLever).x,stemPoint.y-world(setLever).y),shoeAxialGap:Math.abs(b.x-c.x)+M.shoeRadius,grooveHalfWidth:M.grooveHalfWidth,shoeRadius:Math.hypot(b.y-c.y,b.z-c.z),camGap:-pin.y-M.faceOffset-M.pinRadius,camAlong:pin.x,stemGrooveError:Math.abs(stemPoint.x-stemCenter.x),guideError,detentGap,leverLayerClearance:world(setLever).z-.025-(world(yokeContact).z+.025),returnSpringGap:Math.hypot(endpoint.x-rp.x,endpoint.y-rp.y)-.028,wheel:world(transferWheel).toArray(),timeOutput:world(timePortWheel).toArray(),slider:c.toArray(),scales:[selectorLever,setLever,selectorCarrier].map(o=>o.scale.toArray())};
 }
 const parts={setLever,jumper,selectorCarrier,transferWheel,timePort,timeAdapter,support};
 const labels=[[selectorLever,'요크 · 피니언 홈을 잡는 한 개의 강체'],[slidingClutch,'슬라이딩 피니언 · 홈 양쪽의 감기/맞춤 결합'],[setLever,'세팅 레버 · 용두 홈의 핀에서 당기는 힘을 받음'],[jumper,'세팅 점퍼 · 세 위치 유지와 요크 복귀 스프링'],[selectorCarrier,'보정 레버 · 날짜와 시간 맞춤 휠 선택'],[timePort,'시간 맞춤 출력'],[timeAdapter,'기존 분 휠로 이어지는 교육용 전달 휠']];for(const [g,label] of labels)g.traverse(o=>{if(o.isMesh)o.userData.label=label;});
 return {cw,cwRotor,cwFace,windingIdler,windingIdlerRotor,crown,windingPin,windPinRotor,slidingClutch,clutchRotor,clutchDogs,selectorLever,yokeArm,yokeSlot,settingBridge,settingTop,settingBottom,settingPhase,keyless,parts,update,snapshot,sources:[setLever,jumper,selectorCarrier,settingBridge,support]};
};
