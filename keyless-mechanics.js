/* SW220-1 keyless topology; educational dimensions, not factory cam profiles. */
(function(root){
 const pi=Math.PI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const M={stemZ:2.10,setPivot:[3.1,.75],setRadius:.8,stemStart:3,stemTravel:.36,
  yokePivot:[2.3,.9],yokeLength:.9,pinRadius:.03,faceOffset:.05,
  shoeRadius:.022,grooveHalfWidth:.055,grooveNeck:.055,grooveOuter:.165,
  pinionR:.135,pinionN:12,settingR:.1125,settingN:10,outputR:.2025,outputN:18,
  faceX:-.17,gearZ:1.935,gearWidth:.06};
 const rot=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
 function lever(p){const x=M.stemStart+M.stemTravel*p/2,a=Math.atan2(-Math.sqrt(M.setRadius**2-(x-M.setPivot[0])**2),x-M.setPivot[0]);const v=rot([0,-.5],a),pin=v.map((x,i)=>x+M.setPivot[i]),q=pin.map((x,i)=>x-M.yokePivot[i]);return {x,a,pin,angle:Math.atan2(q[1],q[0])+Math.asin((M.faceOffset+M.pinRadius)/Math.hypot(...q))};}
 M.shoeOffset=-pi/2-(lever(0).angle+lever(2).angle)/2;
 function shoe(angle){const v=rot([M.yokeLength,0],angle+M.shoeOffset);return v.map((x,i)=>x+M.yokePivot[i]);}
 M.sliderX=[0,1,2].map(p=>shoe(lever(p).angle)[0]);
 // Keep the existing minute-wheel module: a 25T setting pinion meshes with 36T.
 M.faceX=(.64+.48+.48*25/36)+(M.settingR+M.outputR)+M.settingR-M.sliderX[2];
 const qx=M.sliderX[1]+M.faceX-M.settingR,tx=M.sliderX[2]+M.faceX-M.settingR;
 M.carrierPivot=[(qx+tx)/2,.65];M.carrierLength=Math.hypot((qx-tx)/2,.65);
 M.quickPoint=[qx,0];M.timePoint=[tx,0];
 M.datePoint=[qx,M.settingR+M.outputR];M.timeOutput=[tx-M.settingR-M.outputR,0];
 M.windingPinX=M.sliderX[0]+.20;
 M.pose=function(position,overrun=0){const p=clamp(position,0,2),s=lever(p);let a=s.angle;
  if(overrun>0)a=Math.acos(clamp((shoe(a)[0]-overrun-M.yokePivot[0])/M.yokeLength,-1,1))*-1-M.shoeOffset;
  const tip=shoe(a),x=p<=1?qx:tip[0]+M.faceX-M.settingR;
  const ca=Math.atan2(-Math.sqrt(Math.max(0,M.carrierLength**2-(x-M.carrierPivot[0])**2)),x-M.carrierPivot[0]);
  const cp=rot([M.carrierLength,0],ca).map((x,i)=>x+M.carrierPivot[i]);
  return {position:p,stemX:s.x,setAngle:s.a,pin:s.pin,yokeAngle:a,shoe:tip,sliderX:tip[0],carrierAngle:ca,wheel:cp};
 };
 M.triangle=function(a,b,ra,rb,side=1){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),l=(ra*ra-rb*rb+d*d)/(2*d),h=Math.sqrt(ra*ra-l*l);if(!Number.isFinite(h))throw Error('Disconnected keyless bridge');return [a[0]+l*dx/d-side*h*dy/d,a[1]+l*dy/d+side*h*dx/d];};
 M.rot=rot;
 if(typeof module!=='undefined'&&module.exports)module.exports=M;else root.KeylessMechanics=M;
})(typeof window!=='undefined'?window:globalThis);
