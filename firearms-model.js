/* Exterior exhibition sculptures. No functional internal weapon geometry. */
(function(root){function create(THREE,type,variant='flint'){
 const group=new THREE.Group(),parts=[],woodMap=grain();
 function grain(){const n=128,bytes=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const w=Math.sin(y*.65+Math.sin(x*.055)*2+Math.sin(x*.12+y*.035))*9+Math.sin(y*2.3+x*.07)*4;const k=(y*n+x)*4;bytes[k]=140+w;bytes[k+1]=95+w;bytes[k+2]=56+w;bytes[k+3]=255;}const t=new THREE.DataTexture(bytes,n,n);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;return t;}
 function mesh(geometry,color,p,role='metal'){const mat=new THREE.MeshStandardMaterial({color,metalness:role==='wood'?0:role==='bronze'?.65:.72,roughness:role==='wood'?.62:.38,map:role==='wood'?woodMap:null});const m=new THREE.Mesh(geometry,mat);m.position.set(...p);m.userData.role=role;m.castShadow=true;m.receiveShadow=true;group.add(m);parts.push(m);return m;}
 function lathe(profile,color,x,y,role='barrel'){const m=mesh(new THREE.LatheGeometry(profile.map(([a,b])=>new THREE.Vector2(a,b)),48),color,[x,y,0],role);m.rotation.z=-Math.PI/2;return m;}
 function ring(x,y,r,w,color=0xa68b58){const m=mesh(new THREE.TorusGeometry(r,w,10,48),color,[x,y,0]);m.rotation.y=Math.PI/2;return m;}
 function path(points,r,col,role='metal'){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),40,r,8,false),col,[0,0,0],role);}
 function plate(points,depth,col,z,role='metal'){const shape=new THREE.Shape();shape.moveTo(...points[0]);for(let i=1;i<points.length;i++)shape.lineTo(...points[i]);shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:3,steps:1}),col,[0,0,z],role);}
 function screw(x,y,z){const m=mesh(new THREE.CylinderGeometry(.047,.047,.025,16),0xb9b8a8,[x,y,z]);m.rotation.x=Math.PI/2;const slit=mesh(new THREE.BoxGeometry(.058,.009,.004),0x414542,[x,y,z+.016]);return m;}
 if(type===0){
  lathe([[0,-2.1],[.22,-2.1],[.25,-1.9],[.25,-1.1],[.32,-.98],[.44,-.72],[.45,-.42],[.33,-.18],[.26,.1],[.22,1.85],[.3,1.98],[.3,2.1],[.16,2.1],[.16,1.94]],0x8a7951,0,0,'bronze');
  [-1.95,-1.15,-.12,1.94].forEach(x=>ring(x,0,x<-.9?.26:x<0?.3:.26,.035,0x9a8755));
  // Engraved exterior lines are decorative, not bore or ignition paths.
  for(let i=0;i<5;i++)path([[-.9+i*.11,.36,.14],[-.85+i*.11,.38,.14]],.008,0x514c35);
 }else{
  const stock=new THREE.Shape();stock.moveTo(-3.05,-.08);stock.bezierCurveTo(-2.85,-.04,-2.55,-.08,-2.3,-.16);stock.bezierCurveTo(-1.95,-.18,-1.7,-.02,-1.35,-.08);stock.lineTo(2.38,-.08);stock.quadraticCurveTo(2.52,-.15,2.38,-.25);stock.lineTo(-1.25,-.34);stock.bezierCurveTo(-1.65,-.38,-1.82,-.65,-2.28,-.82);stock.lineTo(-2.95,-.98);stock.quadraticCurveTo(-3.12,-.6,-3.05,-.08);
  mesh(new THREE.ExtrudeGeometry(stock,{depth:.33,bevelEnabled:true,bevelThickness:.1,bevelSize:.08,bevelSegments:5,curveSegments:24}),type===1?0xc7a17d:0xa98a6a,[0,0,-.165],'wood');
  lathe([[0,-1.7],[.19,-1.7],[.19,-1.05],[.15,2.55],[.175,2.7],[.1,2.7],[.1,2.63]],type===1?0x555b58:0x6d7774,0,.11);
  [-.8,.65,1.85].forEach(x=>ring(x,.025,.22,.032,type===1?0xa18b54:0x9d9d87));
  path([[-3.1,-.1,.15],[-3.12,-.5,.19],[-3,-.96,.15]],.048,0xab9567);
  plate([[-1.93,-.14],[-1.8,.07],[-.95,.08],[-.73,-.04],[-.83,-.25],[-1.7,-.29]],.035,0x928976,.3,'ignition');
  [-1.75,-1.04].forEach(x=>screw(x,-.07,.36));
  path([[-1.9,-.35,0],[-1.78,-.63,0],[-1.25,-.61,0],[-1.08,-.35,0]],.037,0x99835a);
  // Stationary exterior ornaments distinguish ignition categories only.
  if(type===1){path([[-1.52,-.02,.37],[-1.7,.25,.37],[-1.72,.57,.37],[-1.45,.73,.37],[-1.25,.64,.37]],.065,0x6f7771,'ignition');path([[-1.38,.7,.38],[-1.18,.74,.38],[-1.03,.54,.38]],.025,0x9d8666,'ignition');}
  else if(type===2&&variant==='wheel'){const disk=mesh(new THREE.CylinderGeometry(.27,.27,.06,40),0x8c927f,[-1.45,-.035,.4],'ignition');disk.rotation.x=Math.PI/2;screw(-1.45,-.035,.46);path([[-1.06,-.05,.39],[-.85,.24,.39],[-1.05,.51,.39],[-1.28,.38,.39]],.06,0x797d70,'ignition');}
  else{path([[-1.55,-.04,.37],[-1.7,.16,.37],[-1.7,.43,.37],[-1.4,.6,.37]],.072,0x707970,'ignition');const cap=mesh(new THREE.BoxGeometry(.23,.14,.18),type===3?0x8c8f82:0xafa998,[-1.4,.6,.37],'ignition');cap.rotation.z=.15;if(type===2)path([[-.97,.11,.36],[-.89,.36,.36],[-.95,.53,.36]],.065,0x8d9589,'ignition');}
  // Small stock inlay, surface only.
  plate([[-2.73,-.31],[-2.46,-.29],[-2.31,-.44],[-2.6,-.53]],.007,0xaa9163,.276);
 }
 group.userData.parts=parts;group.userData.type=type;group.userData.texture=woodMap;return group;
}
if(typeof module!=='undefined')module.exports={create};else root.FirearmsModel={create};
})(typeof window!=='undefined'?window:globalThis);
