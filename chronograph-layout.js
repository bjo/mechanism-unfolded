/* Fixed planar bodies and case-aligned inputs. Educational dimensions. */
(function(root){
 const K=typeof module!=='undefined'&&module.exports?require('./seiko-chronograph-mechanics.js'):root.SeikoChronograph;
 const eps=1e-8,cross=(a,b)=>a[0]*b[1]-a[1]*b[0],sub=K.sub,add=K.add;
 function rectangle(a,b,w){const d=sub(b,a),l=Math.hypot(...d),n=[-d[1]/l*w/2,d[0]/l*w/2];return [add(a,n),sub(a,n),sub(b,n),add(b,n)];}
 function circle(r,n=32){return Array.from({length:n},(_,i)=>[r*Math.cos(i*K.tau/n),r*Math.sin(i*K.tau/n)]);}
 function inside(p,poly){return K.polygonGap(p,poly)<-eps;}
 // Union boundaries remove seams between intersecting branches. The resulting
 // contour is extruded ONCE; no stretched boxes or per-frame vertex changes.
 function union(polys){
  const edges=[];polys.forEach((p,k)=>p.forEach((a,i)=>edges.push({a,b:p[(i+1)%p.length],k})));
  const boundary=[];
  for(const e of edges){const v=sub(e.b,e.a),ts=[0,1];for(const f of edges){if(e.k===f.k)continue;const w=sub(f.b,f.a),q=sub(f.a,e.a),den=cross(v,w);if(Math.abs(den)>eps){const t=cross(q,w)/den,u=cross(q,v)/den;if(t>eps&&t<1-eps&&u>=-eps&&u<=1+eps)ts.push(t);}else if(Math.abs(cross(q,v))<eps){for(const p of [f.a,f.b]){const t=K.dot(sub(p,e.a),v)/K.dot(v,v);if(t>eps&&t<1-eps)ts.push(t);}}}
   ts.sort((a,b)=>a-b);for(let j=1;j<ts.length;j++){if(ts[j]-ts[j-1]<eps)continue;const a=add(e.a,v.map(x=>x*ts[j-1])),b=add(e.a,v.map(x=>x*ts[j])),mid=a.map((x,i)=>(x+b[i])/2);if(polys.some((p,k)=>k!==e.k&&inside(mid,p)))continue;const len=Math.hypot(...v),out=[v[1]/len*1e-6,-v[0]/len*1e-6];if(polys.some(p=>inside(add(mid,out),p)))continue;boundary.push([a,b]);}
  }
  const key=p=>p.map(x=>Math.round(x*1e7)).join(','),unique=new Map();for(const e of boundary)unique.set(key(e[0])+'>'+key(e[1]),e);
  const left=[...unique.values()],loops=[];while(left.length){const first=left.shift(),loop=[first[0]],start=key(first[0]);let end=first[1];for(let guard=0;guard<1000&&key(end)!==start;guard++){loop.push(end);const i=left.findIndex(e=>key(e[0])===key(end));if(i<0)throw Error('Open rigid-plate contour');end=left.splice(i,1)[0][1];}if(key(end)!==start)throw Error('Plate contour loop');loops.push(loop);}return loops;
 }
 const bodyAngle=-Math.PI/2,operatingPivot=[.95,1.55],resetPivot=[-.65,1.80];
 const startContact={a:[.40,-.20],b:[.95,-.20],width:.09};
 const pushers=[{x:.70,rod:.85,guideY:2.72,z:.70},{x:-.70,rod:.95,guideY:2.55,z:.65}];
 function intersection(p,r,q,s){const d=Math.hypot(...sub(q,p)),a=(r*r-s*s+d*d)/(2*d),h=Math.sqrt(Math.max(0,r*r-a*a)),v=sub(q,p).map(x=>x/d);return [p[0]+a*v[0]+h*v[1],p[1]+a*v[1]-h*v[0]];}
 function startPose(pressure){const a=.1-K.step*pressure,tip=add(K.column,[.43*Math.cos(a),.43*Math.sin(a)]),joint=intersection(operatingPivot,.45,tip,.65),angle=Math.atan2(joint[1]-operatingPivot[1],joint[0]-operatingPivot[0]);const polygon=rectangle(startContact.a,startContact.b,startContact.width).map(v=>add(operatingPivot,K.rotate(v,angle))),edge=K.padSupport(polygon,1,pushers[0].x-.13,pushers[0].x+.13,1);return {tip,joint,angle,edge};}
 function resetPose(hammer){const p=K.resetLeverPose(hammer),polygon=K.leverPolygon(p.pivot,p.angle,-.55,.92,.075),edge=K.padSupport(polygon,1,pushers[1].x-.13,pushers[1].x+.13,1);return {...p,edge};}
 const api={rectangle,circle,union,bodyAngle,operatingPivot,resetPivot,startContact,pushers,startPose,resetPose};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ChronographLayout=api;
})(typeof window==='undefined'?globalThis:window);
