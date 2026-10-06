/* Educational train, inspired by SW210 layout. Not manufacturer dimensions. */
(function(root){
 const KM=typeof module!=='undefined'&&module.exports?require('./keyless-mechanics.js'):root.KeylessMechanics;
 const polar=(origin,d,a)=>[origin[0]+d*Math.cos(a),origin[1]+d*Math.sin(a)];
 const center=[0,0],barrel=[.50,Math.sqrt(1.485**2-.50**2)];
 const third=polar(center,1.02+.1275,170*Math.PI/180);
 const fourth=polar(third,.84+.112,-62*Math.PI/180);
 const escape=polar(fourth,.72+.045,-155*Math.PI/180);
 const spec={
  centralSeconds:{p:[fourth,fourth.map(v=>v/2),center],r:Math.hypot(...fourth)/4,n:30,z:1.94,ratios:[60,-60,60],shaftRadius:.02,centerBore:.038},
  radius:3.05,frequency:4,reserveSeconds:45*3600,
  barrelBody:{z:.24,height:.32,lidZ:.59,lidThickness:.05,bevel:.004},
  wheelThickness:.065,bridgeLift:.30,
  keyless:{setting:{p:[1.36,0],r:.24,n:18,z:-.44,topR:.27,topN:18},crownR:.69*34/44,ratchetR:.69,stemZ:2.10,sliderR:.18,sliderN:12,date:{p:[2,0],r:.27,n:18},yokeLength:.85,yokePivot:[1.75,.55]},
  escapement:{pivotDistance:.70,jewelWidth:.105,jewelLength:.10,jewelY:-.29,swing:.12,rollerRadius:.36,slotHalfWidth:.075,tineWidth:.035,slotStart:.59,slotEnd:.77,pinRadius:.033},
  wheels:{
   barrel:{p:barrel,n:80,r:1.32,z:.18,pn:0,pr:0,pz:0},
   center:{p:center,n:80,r:1.02,z:.70,pn:10,pr:.165,pz:.18},
   third:{p:third,n:75,r:.84,z:.92,pn:10,pr:.1275,pz:.70},
   fourth:{p:fourth,n:96,r:.72,z:1.14,pn:10,pr:.112,pz:.92},
   escape:{p:escape,n:15,r:.39,z:1.37,pn:6,pr:.045,pz:1.14},
   cannon:{p:center,n:12,r:.16,z:-.44},
   minute:{p:[.64,0],n:36,r:.48,z:-.44,pn:10,pr:.128,pz:-.65},
   hour:{p:center,n:40,r:.512,z:-.65}
  },
  links:[['barrel','center','pinion'],['center','third','pinion'],['third','fourth','pinion'],['fourth','escape','pinion'],['cannon','minute','wheel'],['minute','hour','compound']],
  // Angular velocity relative to the central minute shaft, rear coordinates.
  ratios:{barrel:-1/8,center:1,third:-8,fourth:60,escape:-960,cannon:1,minute:-1/3,hour:1/12}
 };
 spec.advanced={automatic:{reduction:8},chronograph:{counterPoint:[-1.3*.95,-.05*.95]}};
 // The oscillator uses the same simulated clock as the gear train.
 spec.balanceAngle=seconds=>Math.sin((seconds*spec.frequency%1)*Math.PI*2)*2.1;
 spec.handAngles=(seconds,offset=0)=>({minute:-(seconds+offset)/3600*Math.PI*2,hour:-(seconds+offset)/43200*Math.PI*2,second:-seconds/60*Math.PI*2});
 // External winding train, with an intermediate wheel. All pitch circles share one module.
 const k=spec.keyless;k.setting.p=KM.timeOutput;k.setting.n=25;k.setting.r=.48*25/36;k.date.p=KM.datePoint;k.date.r=KM.outputR;k.setting.topR=KM.outputR;k.yokePivot=KM.yokePivot;k.yokeLength=KM.yokeLength;k.winding={p:[KM.windingPinX-k.crownR,0],idlerR:k.crownR*32/34};
 const a=k.winding.p,b=barrel,dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),ra=k.crownR+k.winding.idlerR,rb=k.ratchetR+k.winding.idlerR,l=(ra*ra-rb*rb+d*d)/(2*d),h=Math.sqrt(ra*ra-l*l);
 k.winding.idler=[a[0]+l*dx/d+h*dy/d,a[1]+l*dy/d-h*dx/d];
 k.sliderX=KM.sliderX.slice();
 k.yokePose=x=>({angle:Math.atan2(-Math.sqrt(k.yokeLength**2-(x-k.yokePivot[0])**2),x-k.yokePivot[0]),length:k.yokeLength});
 spec.crownAction=(position,direction)=>position===2?{windPercent:0,settingSeconds:direction*300}:position===1?{windPercent:0,settingSeconds:0}:{windPercent:direction>0?25:0,settingSeconds:0};
 spec.forkAngle=function(angle){const e=this.escapement,d=Math.hypot(.05-escape[0],-1.96-escape[1])-e.pivotDistance;return Math.max(-e.swing,Math.min(e.swing,-Math.atan2(e.rollerRadius*Math.sin(angle),d-e.rollerRadius*Math.cos(angle))));};
 if(typeof module!=='undefined'&&module.exports)module.exports=spec;else root.WatchSpec=spec;
})(typeof window!=='undefined'?window:globalThis);
