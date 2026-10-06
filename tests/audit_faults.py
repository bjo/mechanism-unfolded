import copy, importlib.util, pathlib
p=pathlib.Path(__file__).resolve().parents[1]/'skills/mechanism-audit/scripts/audit_snapshots.py'
spec=importlib.util.spec_from_file_location('auditor',p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
s={'samples':[{'label':'external mesh', 'parts':[{'id':'a','center':[0,0,0],'axis':[0,0,1],'pitchRadius':2,'teeth':40,'faceWidth':.2,'omega':1},{'id':'b','center':[3,0,0],'axis':[0,0,1],'pitchRadius':1,'teeth':20,'faceWidth':.2,'omega':-2}], 'meshes':[{'a':'a','b':'b','distanceTolerance':.001,'velocityTolerance':.001,'moduleTolerance':.001,'minimumFaceOverlap':.05}], 'contacts':[{'id':'pin','gap':0,'minGap':-.01,'maxGap':.01}], 'events':[{'id':'index','actual':1,'expected':1,'tolerance':0}], 'equivalences':[{'id':'inspection shaft','a':[0,0,1],'b':[0,0,1],'tolerance':.001}]}]}
assert m.audit(s)['passed']
mutations=[lambda q:q['parts'][1]['center'].__setitem__(0,3.2),lambda q:q['parts'][1]['center'].__setitem__(2,.4),lambda q:q['parts'][1].__setitem__('omega',2),lambda q:q['contacts'][0].__setitem__('gap',.2),lambda q:q['events'][0].__setitem__('actual',2),lambda q:q['equivalences'][0]['b'].__setitem__(2,2)]
for mutation in mutations:
 bad=copy.deepcopy(s);mutation(bad['samples'][0]);assert not m.audit(bad)['passed']
print('PASS: auditor accepts valid geometry and rejects six injected gap, plane, velocity, contact, event and view faults')

r={'samples':[{'label':'rest','rigidBodies':[{'id':'finger','landmarks':[[0,0,0],[1,0,0],[0,.1,0]],'tolerance':1e-8}]},{'label':'rotated','rigidBodies':[{'id':'finger','landmarks':[[2,3,0],[2,4,0],[1.9,3,0]],'tolerance':1e-8}]}]}
assert m.audit(r)['passed']
r['samples'][1]['rigidBodies'][0]['landmarks'][1]=[2,3.7,0]
assert not m.audit(r)['passed']
print('PASS: rigid rotation accepted; shrinking finger rejected across time')
