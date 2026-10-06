#!/usr/bin/env python3
"""Audit measured mechanism snapshots. No renderer or collision engine is implied."""
import json, math, sys

def dot(a,b): return sum(x*y for x,y in zip(a,b))
def sub(a,b): return [x-y for x,y in zip(a,b)]
def length(v): return math.sqrt(dot(v,v))
def audit(data):
    failures=[]; checks=0
    def check(ok,label):
        nonlocal checks
        checks+=1
        if not ok: failures.append(label)
    def near(a,b,t): return abs(a-b)<=t
    samples=data['samples']
    if not samples: raise ValueError('At least one measured sample is required')
    for sample in samples:
        label=sample['label']; parts={p['id']:p for p in sample.get('parts',[])}
        if len(parts)!=len(sample.get('parts',[])): raise ValueError('Duplicate part ID: '+label)
        for p in parts.values():
            for key in ('center','axis'):
                if len(p[key])!=3 or not all(math.isfinite(x) for x in p[key]): raise ValueError('Invalid '+key)
            check(near(length(p['axis']),1,1e-6),label+': unit axis '+p['id'])
        for link in sample.get('meshes',[]):
            a,b=parts[link['a']],parts[link['b']]; tag=label+': '+a['id']+' / '+b['id']; kind=link.get('type','external')
            if kind not in ('external','internal'): raise ValueError('Unsupported mesh type: '+kind)
            t=link['distanceTolerance']; vt=link['velocityTolerance']; d=sub(b['center'],a['center']); axial=abs(dot(d,a['axis'])); radial=math.sqrt(max(0,dot(d,d)-axial**2)); alignment=dot(a['axis'],b['axis'])
            ra,rb=a['pitchRadius'],b['pitchRadius']
            if min(ra,rb,a['teeth'],b['teeth'],a['faceWidth'],b['faceWidth'])<=0: raise ValueError('Non-positive gear dimension')
            check(near(abs(alignment),1,link.get('axisTolerance',1e-6)),tag+' parallel axes')
            check(near(radial,ra+rb if kind=='external' else abs(ra-rb),t),tag+' pitch distance')
            check((a['faceWidth']+b['faceWidth'])/2-axial>=link['minimumFaceOverlap'],tag+' axial overlap')
            check(near(2*ra/a['teeth'],2*rb/b['teeth'],link['moduleTolerance']),tag+' module')
            tangential=ra*a['omega']+(1 if kind=='external' else -1)*rb*b['omega']*alignment
            check(abs(tangential)<=vt,tag+' tangential velocity')
        for c in sample.get('contacts',[]):
            # Signed gap: positive separation, negative penetration. A range may allow overrun clearance.
            check(c['minGap']<=c['gap']<=c['maxGap'],label+': contact '+c['id'])
        for e in sample.get('events',[]):
            check(near(e['actual'],e['expected'],e['tolerance']),label+': event '+e['id'])
        for pair in sample.get('equivalences',[]):
            a,b=pair['a'],pair['b']
            if len(a)!=len(b): raise ValueError('Mismatched equivalence dimensions')
            check(all(near(x,y,pair['tolerance']) for x,y in zip(a,b)),label+': view/joint '+pair['id'])
    if checks==0: raise ValueError('No checks supplied')
    return {'checks':checks,'failures':failures,'passed':not failures}

def main():
    try:
        with open(sys.argv[1],encoding='utf-8-sig') as f: result=audit(json.load(f))
    except (ValueError,KeyError,IndexError,TypeError,OSError) as exc:
        print(json.dumps({'error':str(exc),'passed':False}));return 2
    print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['passed'] else 1
if __name__=='__main__': sys.exit(main())
