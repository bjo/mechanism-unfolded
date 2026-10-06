/* Fixed-pivot control geometry for the educational horizontal-clutch chronograph. */
(function(root){
 const TAU=2*Math.PI,step=TAU/16,column=[-1.5,1.2],clutchPivot=[-2,0],clutchTip=[.25,1.2];
 const point=(p,v,a)=>[p[0]+v[0]*Math.cos(a)-v[1]*Math.sin(a),p[1]+v[0]*Math.sin(a)+v[1]*Math.cos(a)];
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 const outer=distance(point(clutchPivot,clutchTip,.24),column),inner=.25;
 // Smooth shoulders between eight raised columns. Identical profile builds the mesh and drives followers.
 function radius(phi){const c=Math.cos(8*phi),u=Math.max(0,Math.min(1,(c+.35)/.70));return inner+(outer-inner)*u*u*(3-2*u);}
 function gap(pivot,tip,a,col){const p=point(pivot,tip,a),v=[p[0]-column[0],p[1]-column[1]];return Math.hypot(...v)-radius(Math.atan2(v[1],v[0])-col);}
 function solve(pivot,tip,col,lo,hi){let gl=gap(pivot,tip,lo,col);if(Math.abs(gl)<1e-9)return lo;for(let i=0;i<60;i++){const m=(lo+hi)/2,g=gap(pivot,tip,m,col);if(g*gl>0){lo=m;gl=g;}else hi=m;}return (lo+hi)/2;}
 const brakePivot=[.85,.85],brakeTip=[-2.35,.35+outer];
 const followers=col=>({clutch:solve(clutchPivot,clutchTip,col,0,.24),brake:solve(brakePivot,brakeTip,col,0,.24)});
 const operatingPivot=[-2.5,2.1],operatingArm=[1,-.48],pawlLength=.20,ratchetRadius=.62;
 function operatingPose(progress){
  const toothAngle=Math.PI/2-progress*step,tooth=[column[0]+ratchetRadius*Math.cos(toothAngle),column[1]+ratchetRadius*Math.sin(toothAngle)];
  const d=distance(operatingPivot,tooth),r=Math.hypot(...operatingArm),phi=Math.atan2(tooth[1]-operatingPivot[1],tooth[0]-operatingPivot[0]);
  const angle=phi-Math.acos(Math.max(-1,Math.min(1,(r*r+d*d-pawlLength*pawlLength)/(2*r*d))))-Math.atan2(operatingArm[1],operatingArm[0]);
  const pivot=point(operatingPivot,operatingArm,angle);return {angle,pivot,tooth,pawlAngle:Math.atan2(tooth[1]-pivot[1],tooth[0]-pivot[0])};
 }
 const api={operatingPivot,operatingArm,pawlLength,ratchetRadius,operatingPose,TAU,step,column,point,distance,outer,inner,radius,gap,followers,clutchPivot,clutchTip,brakePivot,brakeTip};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ChronoControls=api;
})(typeof window==='undefined'?globalThis:window);
