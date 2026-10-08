const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../firearms-data');assert.equal(D.chapters.length,4);assert.equal(D.roadmap.length,12);
for(const c of D.chapters){for(const k of ['title','kind','era','question','intro','history','gain','limit','observe','comparison'])assert.ok(c[k].length>2,k);assert.equal(c.steps.length,4);assert.equal(c.explain.length,4);assert.match(c.source,/^https:\/\/(www.metmuseum.org|collection.nam.ac.uk)\//);}
for(const speed of [.5,1,2]){const c=new D.Clock();c.tick(1);assert.equal(c.time,0);c.speed=speed;c.running=true;for(let k=0;k<100;k++)c.tick(.01);assert.ok(Math.abs(c.time-speed)<1e-9);c.running=false;const t=c.time;c.tick(4);assert.equal(c.time,t);c.running=true;for(let k=0;k<2000;k++)c.tick(.01);assert.equal(c.time,8);assert.equal(c.phase,3);assert.equal(c.running,false);}
const html=fs.readFileSync(path.join(__dirname,'../firearms.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'../firearms-app.js'),'utf8');
for(const m of app.matchAll(/\$\('([A-Za-z]+)'\)/g))assert.ok(html.includes(`id="${m[1]}"`),m[1]);
for(const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"#]*)?"/g)){if(!m[1].startsWith('http'))assert.ok(fs.existsSync(path.join(__dirname,'..',m[1])),m[1]);}
assert.ok(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').includes('THE COLLECTION · 03'));
console.log('PASS 4 chapter contracts, 12 roadmap entries, 3 clock speeds / pause / completion, asset and DOM hooks');
