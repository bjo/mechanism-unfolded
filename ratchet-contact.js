/* Kinematic pawl/tooth contact, not a torque or elastic-force simulation. */
(function(root){
 const count=12,pitch=2*Math.PI/count,rootR=70,tipR=84,pivot=[116,0],length=110;
 const points=[];for(let i=0;i<count;i++){const a=i*pitch;points.push([rootR*Math.cos(a),rootR*Math.sin(a)],[tipR*Math.cos(a),tipR*Math.sin(a)]);}
 const lockPhase=6*Math.PI/180;
 function contact(phase){const c=Math.cos(phase),s=Math.sin(phase),p=points.map(([x,y])=>[x*c-y*s,x*s+y*c]);let best=null;
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],ox=a[0]-pivot[0],oy=a[1],A=dx*dx+dy*dy,B=2*(ox*dx+oy*dy),C=ox*ox+oy*oy-length*length,D=B*B-4*A*C;if(D<0)continue;
   for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)]){if(t<0||t>1)continue;const x=a[0]+t*dx,y=a[1]+t*dy,angle=Math.atan2(y,x-pivot[0]);if(angle<0||angle>Math.PI)continue;if(!best||angle<best.angle)best={x,y,angle,segment:i,flank:i%2===0};}
  }return best;
 }
 function create(){let previousInput=null,previousOutput=null,phase=lockPhase;return {update(input,output,locked){if(locked)phase=lockPhase;else if(previousInput!==null)phase+=(output-previousOutput)-(input-previousInput);previousInput=input;previousOutput=output;const hit=contact(phase);return {...hit,phase,input,output,locked};}};}
 const api={points,pivot,length,lockPhase,contact,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.RatchetContact=api;
})(typeof window!=='undefined'?window:globalThis);
