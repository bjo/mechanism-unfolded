/* Single-language day/date teaching layer. See CALENDAR-REFERENCE.md. */
window.createWeekdayCalendar=function(T,calendar,driver,H){
 const {at,disc,ring,bar,text,mesh,C}=H,M=CalendarMechanics,tau=M.TAU;
 const spec=M.weekdayGeometry,index=M.weekdayIndexing,pitch=tau/7;
 const star=at(calendar,0,0),carrier=at(driver,0,0);
 carrier.rotation.z=Math.PI+Math.PI/48+index.end;
 const finger=bar(.12,0,spec.reach,0,.018,carrier,0x9b66bd,spec.layer-.02,.025);
 disc(.055,.25,driver,C.steel,.17);
 // Radial working flanks follow the rigid finger's tip. The thin face is
 // intentionally exaggerated separately from the display plate above it.
 const toothPhase=pitch/2,shape=new T.Shape(),r=index.radius;
 M.weekdayOutline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));
 shape.closePath();const bore=new T.Path();bore.absarc(0,0,.16,0,tau,true);shape.holes.push(bore);
 const teeth=mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false}),star,0x9b66bd);teeth.position.z=spec.layer;
 const detent=at(calendar,-.65,-.35,spec.layer),lever=at(detent,0,0);
 bar(0,0,.52,0,.018,lever,C.green,0,.025);const nose=disc(.018,.025,lever,C.green,.0125);nose.position.x=.52;
 disc(.045,.05,detent,C.steel,.0125);ring(.085,.077,detent,C.green,.015,.012,.2,5.7);
 ring(.20,.16,star,C.steel,.29,.22);
 const display=at(star,0,0,.49);ring(2.10,1.52,display,C.pale,0,.035);
 for(let i=0;i<7;i++){
  const a=i*pitch;
  bar(.19*Math.cos(a),.19*Math.sin(a),1.56*Math.cos(a),1.56*Math.sin(a),.025,display,C.steel,0,.025);
  const label=text(M.weekdays[i],display,1.82*Math.cos(a),1.82*Math.sin(a),.046,.35,.24);label.rotation.z=a;
 }
 for(const [x1,y1,x2,y2] of [[1.58,-.20,2.07,-.20],[1.58,.20,2.07,.20],[1.58,-.20,1.58,.20],[2.07,-.20,2.07,.20]])bar(x1,y1,x2,y2,.023,calendar,0x9b66bd,.55,.02);
 // The display is skeletonized to expose its own arbor and driving finger.
 // This visible separation is an axial stack, never an animated explosion.
 let pose=M.weekdayPose(0,0),lastRotation=NaN;
 return {star,carrier,finger,display,teeth,detent,
  tick(total,turns,correction){pose=correction==null?M.weekdayPose(total,turns):{turns:turns+M.weekdayCorrectionPose(correction),engaged:false,progress:0,correctionPreview:true};star.rotation.z=-pose.turns*pitch;if(star.rotation.z!==lastRotation){lever.rotation.z=M.weekdayDetent(star.rotation.z).angle;lastRotation=star.rotation.z;}return pose;},
  measure(){
   calendar.updateWorldMatrix(true,true);
   const tip=calendar.worldToLocal(carrier.localToWorld(new T.Vector3(spec.reach,0,spec.layer-.02)));
   const start=calendar.worldToLocal(carrier.localToWorld(new T.Vector3(.12,0,spec.layer-.02)));
   const flank=star.rotation.z+toothPhase+Math.floor(pose.turns)*pitch;
   const detentTip=calendar.worldToLocal(lever.localToWorld(new T.Vector3(.52,0,.0125)));
   const vertices=M.weekdayOutline.map(([x,y])=>calendar.worldToLocal(star.localToWorld(new T.Vector3(x,y,spec.layer))));
   const detentGap=Math.min(...vertices.map((p,i)=>M.segmentDistance([detentTip.x,detentTip.y],[p.x,p.y],[vertices[(i+1)%vertices.length].x,vertices[(i+1)%vertices.length].y])))-.018;
   const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
   return {engaged:pose.engaged,progress:pose.progress,shown:pose.turns,correctionPreview:!!pose.correctionPreview,tip:tip.toArray(),
    fingerLength:tip.distanceTo(start),scale:finger.scale.toArray(),
    contactAngleError:pose.engaged?wrap(Math.atan2(tip.y,tip.x)-flank):null,
    starZ:teeth.position.z,driverZ:tip.z,displayZ:display.position.z,
    detentGap,detentLength:detentTip.distanceTo(calendar.worldToLocal(detent.localToWorld(new T.Vector3(0,0,.0125)))) ,rotation:star.rotation.z};
  }
 };
};
