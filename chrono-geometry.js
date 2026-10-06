(function(root){
 const Index=typeof module!=='undefined'&&module.exports?require('./indexing-motion.js'):root.IndexingMotion;
 const minuteIndexing=Index.external({period:60,teeth:30,distance:Math.hypot(.9,1.65),reach:Math.hypot(.9,1.65)-.45});
 const tau=2*Math.PI,heart=[];
 // Support radius grows monotonically away from zero. The notch between the
 // two zero-contact shoulders makes the heart visible without changing support.
 for(let i=0;i<=240;i++){const t=-Math.PI+i*tau/240;if(i===120){heart.push([-.09,.15],[0,.075],[.09,.15]);continue;}const h=.15+.18*Math.sin(Math.abs(t)/2),dh=.09*Math.cos(t/2)*Math.sign(t);heart.push([h*Math.sin(t)+dh*Math.cos(t),h*Math.cos(t)-dh*Math.sin(t)]);}
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 function support(angle){let top=-Infinity,point;for(const [x,y] of heart){const p=[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];if(p[1]>top){top=p[1];point=p;}}return {height:top,point};}
 function resetPose(fromAngle,remaining){const t=1-remaining,from=wrap(fromAngle),u=Math.max(0,Math.min(1,(t-.18)/.62)),ease=u*u*(3-2*u),angle=from*(1-ease),contact=support(angle),rest=.72;let faceY;
 if(t<.18)faceY=rest+(support(from).height-rest)*(t/.18);else if(t<.88)faceY=contact.height;else faceY=contact.height+(rest-contact.height)*((t-.88)/.12);
 return {angle,faceY,contact:contact.point,t,stage:t<.18?'해머 접근':t<.80?'캠을 밀어 축 회전':t<.88?'두 면에 안착 · 영점':'해머 복귀'};
 }
 const clutch=theta=>[-2+Math.cos(theta),Math.sin(theta)];
 function minuteTurns(elapsed){return minuteIndexing.pose(elapsed).turns/30;}
 const api={minuteTurns,minuteIndexing,heart,support,resetPose,clutch,wrap,tau};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ChronoGeometry=api;
})(typeof window!=='undefined'?window:globalThis);
