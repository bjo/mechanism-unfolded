/* Shared external finger/index-wheel geometry. Kinematics, not elastic dynamics. */
(function(root){
 const tau=2*Math.PI,mod=(a,b)=>((a%b)+b)%b;
 function external({period,teeth,distance,reach}){
  const half=Math.PI/teeth,radicand=reach*reach-distance*distance*Math.sin(half)**2;
  if(radicand<=0)throw Error('Finger cannot span an index pitch');
  const radius=distance*Math.cos(half)-Math.sqrt(radicand),end=Math.asin(radius*Math.sin(half)/reach),duration=2*end/tau*period;
  return {end,radius,duration,pose(total,turns=Math.floor(total/period)){
   const t=mod(total,period),angle=t/period*tau+end,phase=Math.atan2(Math.sin(angle),Math.cos(angle)),engaged=t>period-duration;
   const beta=Math.atan2(reach*Math.sin(phase),distance-reach*Math.cos(phase));
   const progress=engaged?Math.max(0,Math.min(1,(beta+half)/(2*half))):0;
   return {angle,engaged,progress,turns:turns+progress};
  }};
 }
 const api={external};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.IndexingMotion=api;
})(typeof window==='undefined'?globalThis:window);
