/* Pure calendar complication kinematics, independent of rendering. */
(function(root){
 const TAU=2*Math.PI,mod=(n,d)=>((n%d)+d)%d;
 function createDayCounter(){let last=0,value=0;return {observe(t){if(t>=last)value+=Math.max(0,Math.floor((t+1e-6)/86400)-Math.floor((last+1e-6)/86400));last=t;return value;},reset(){last=value=0;},get value(){return value;}};}
 const api={createDayCounter,TAU,mod,gmtAngle:(seconds,offsetHours=0)=>-TAU*(seconds/86400+offsetHours/24),moonIndex:seconds=>Math.floor((seconds+1e-6)/86400),moonAngle:days=>-TAU*days/59,moonAge:days=>mod(days,29.5),driftPerCycle:29.53059-29.5,
 gmt:{input:{n:24,r:.30},relay:{n:24,r:.30,p:[.60,0]},pinion:{n:12,r:.20},output:{n:24,r:.40}},
 moon:{input:{n:24,r:.30},day:{n:48,r:.60,p:[-.90,0]},disc:{n:59,r:.85,p:[-.90,-1.50]}}};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CalendarMechanics=api;
})(typeof window==='undefined'?globalThis:window);
