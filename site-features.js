/* Release switches. Preview is a UI flag, not authentication. */
(function(){
 const defaults={firearms:false};
 const preview=new URL(location.href).searchParams.get('preview')==='firearms';
 window.SiteFeatures=Object.freeze({firearms:defaults.firearms||preview});
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-feature]').forEach(el=>{el.hidden=!SiteFeatures[el.dataset.feature];});
  const gate=document.getElementById('featureGate');if(gate)gate.hidden=SiteFeatures.firearms;
  const count=document.getElementById('collectionCount');if(count)count.textContent='THE COLLECTION · '+(SiteFeatures.firearms?'03':'02');
  if(preview)document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin===location.origin&&(/firearms\.html$/.test(u.pathname)||/\/$|index\.html$/.test(u.pathname))){u.searchParams.set('preview','firearms');a.href=u.href;}});
 });
})();
