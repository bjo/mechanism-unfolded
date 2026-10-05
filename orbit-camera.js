/* Free trackball orbit. Camera state changes only through direct navigation input. */
(function(root){
 const norm=q=>{const d=Math.hypot(...q)||1;return q.map(v=>v/d);};
 const mul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
 const rotate=(q,v)=>mul(mul(q,[...v,0]),[-q[0],-q[1],-q[2],q[3]]).slice(0,3);
 const axis=(x,y,z,a)=>[x*Math.sin(a/2),y*Math.sin(a/2),z*Math.sin(a/2),Math.cos(a/2)];
 const initial=()=>mul(mul(axis(0,1,0,.08),axis(1,0,0,-.27)),axis(0,0,1,Math.PI));
 function sphere(p,w,h){const size=Math.min(w,h),x=(2*p[0]-w)/size,y=(h-2*p[1])/size,r=x*x+y*y;return r<=1?[x,y,Math.sqrt(1-r)]:[x/Math.sqrt(r),y/Math.sqrt(r),0];}
 function between(a,b){const dot=a.reduce((s,v,i)=>s+v*b[i],0);if(dot<-.999999)return axis(0,1,0,Math.PI);return norm([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0],1+dot]);}
 function blend(a,b,t){let d=a.reduce((s,v,i)=>s+v*b[i],0);if(d<0){b=b.map(v=>-v);d=-d;}if(d>.9995)return norm(a.map((v,i)=>v+(b[i]-v)*t));const theta=Math.acos(Math.min(1,d)),den=Math.sin(theta);return a.map((v,i)=>(v*Math.sin((1-t)*theta)+b[i]*Math.sin(t*theta))/den);}
 function create(){let q=initial(),wanted=q.slice(),radius=13.5,wantedRadius=radius,target=[0,0,0];return {
  drag(from,to,w,h){wanted=norm(mul(wanted,between(sphere(to,w,h),sphere(from,w,h))));q=wanted.slice();},
  pan(dx,dy,h){const x=rotate(q,[1,0,0]),y=rotate(q,[0,1,0]),s=radius*.63/h;target=target.map((v,i)=>v-dx*s*x[i]+dy*s*y[i]);},
  zoom(delta){wantedRadius=Math.max(5,Math.min(35,wantedRadius*Math.exp(delta*.001)));},
  preset(name){if(name==='reset'){wanted=initial();target=[0,0,0];wantedRadius=13.5;}else if(name==='rear')wanted=initial();else if(name==='dial')wanted=mul(mul(axis(1,0,0,Math.PI),initial()),axis(0,0,1,Math.PI));else wanted=rotate(q,[0,0,1])[2]>=0?axis(0,0,1,Math.PI):axis(1,0,0,Math.PI);},
  update(dt){const f=1-Math.exp(-dt*14);q=blend(q,wanted,f);radius+=(wantedRadius-radius)*f;const offset=rotate(q,[0,0,radius]);return {position:offset.map((v,i)=>v+target[i]),up:rotate(q,[0,1,0]),target:target.slice(),quaternion:q.slice(),radius};},
  get state(){return {quaternion:wanted.slice(),radius:wantedRadius,target:target.slice()};}
 };}
 const api={create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WatchOrbit=api;
})(typeof window!=='undefined'?window:globalThis);
