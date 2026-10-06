/* Input interlock: output may start only after the crown has seated. */
(function(root){
 const api={
  seated(pull,position){return Math.abs(pull-position/2)<.0001;},
  advance(pull,position,dt){
   const target=position/2,next=pull+(target-pull)*Math.min(1,Math.max(0,dt)*12);
   return Math.abs(next-target)<.0001?target:next;
  }
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CrownTransition=api;
})(typeof window!=='undefined'?window:globalThis);
