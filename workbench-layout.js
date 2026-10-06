/* Reuse the existing lesson nodes and handlers in a model-first, two-column workbench. */
(()=>{
 const $=id=>document.getElementById(id),workspace=document.querySelector('.workspace');
 if(!window.watchApp||!workspace)return;
 const model=document.createElement('div');model.className='model-column';
 const reading=document.createElement('aside');reading.className='learning-column';reading.setAttribute('aria-label','모델 옆 학습 설명');
 const tabs=document.createElement('div');tabs.className='learning-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','설명 종류');
 const body=document.createElement('div');body.className='learning-scroll';
 const panes={};for(const [id,label] of [['primer','입문 · 흐름'],['parts','선택한 부품']]){
  const b=document.createElement('button');b.id='learn-tab-'+id;b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-controls','learn-pane-'+id);b.textContent=label;b.dataset.pane=id;
  const pane=document.createElement('section');pane.id='learn-pane-'+id;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',b.id);panes[id]=pane;
  b.onclick=()=>select(id);b.onkeydown=e=>{const ids=Object.keys(panes);if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const i=ids.indexOf(id),next=e.key==='Home'?0:e.key==='End'?ids.length-1:(i+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;select(ids[next]);$('learn-tab-'+ids[next]).focus();}};
  tabs.append(b);body.append(pane);
 }
 function select(id){for(const [key,pane] of Object.entries(panes)){const active=key===id;pane.hidden=!active;const b=$('learn-tab-'+key);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}body.scrollTop=0;}
 const viewSwitch=document.querySelector('.adv-view-switch');
 panes.primer.append(document.querySelector('.journey'),$('advancedPanel'));
 const details=document.querySelector('.details');
 details.querySelector('.partinfo').append($('partLesson'));
 details.prepend(details.querySelector('.parts-title'),details.querySelector('.partlist'));
 details.querySelector('.learn-link').remove();
 panes.parts.append(details);
 model.append(viewSwitch,document.querySelector('.stage'),document.querySelector('.experiment'),document.querySelector('.controls'));
 const extra=document.createElement('details');extra.className='workbench-extra';const summary=document.createElement('summary');summary.textContent='용두와 바늘 조작';extra.append(summary,$('crownPanel'),$('handExperiment'));model.append(extra);
 reading.append(tabs,body);workspace.replaceChildren(model,reading);workspace.classList.add('reading-workbench');
 new MutationObserver(()=>{viewSwitch.hidden=$('advancedPanel').hidden;}).observe($('advancedPanel'),{attributes:true,attributeFilter:['hidden']});
 viewSwitch.hidden=$('advancedPanel').hidden;select('primer');
 const dock=document.createElement('section');dock.className='crown-dock';dock.setAttribute('aria-label','용두 위치와 회전');const positions=document.createElement('div');positions.className='crown-positions';positions.append($('crownIn'),$('crownDate'),$('crownOut'));const turns=document.createElement('div');turns.className='crown-turns';turns.append($('crownForward'),$('crownBackward'));dock.append(positions,turns,$('crownSafeTime'),$('crownDateStatus'),$('crownFeedback'));const correctionStatus=document.createElement('p');correctionStatus.id='correctionStatus';correctionStatus.hidden=true;correctionStatus.setAttribute('aria-live','polite');dock.append(correctionStatus);model.prepend(dock);dock.append(window.watchApp.keylessPresentation.panel);
 const advancedControls=$('advancedControls'),advancedHeading=document.querySelector('.adv-heading'),chapterGuide=document.querySelector('.lesson');
 panes.primer.prepend(advancedHeading,chapterGuide);
 const stage=document.querySelector('.stage');model.insertBefore(advancedControls,stage);model.insertBefore(document.querySelector('.experiment'),stage);model.insertBefore(document.querySelector('.controls'),stage);model.insertBefore(extra,stage);
 const driveControls=document.createElement('details');driveControls.className='drive-controls';const driveLabel=document.createElement('summary');driveLabel.textContent='기본 시계 작동 · 태엽과 관찰 속도';driveControls.append(driveLabel,document.querySelector('.experiment'));model.insertBefore(driveControls,stage);
 const syncAdvanced=()=>{driveControls.open=$('advancedPanel').hidden;advancedControls.hidden=advancedHeading.hidden=$('advancedPanel').hidden;};new MutationObserver(syncAdvanced).observe($('advancedPanel'),{attributes:true,attributeFilter:['hidden']});syncAdvanced();
 // The crown lesson's controls remain available without an extra disclosure click.
 new MutationObserver(()=>{extra.open=window.watchCurriculum?.current===6;dock.hidden=window.watchCurriculum?.current<5;}).observe($('pageTitle'),{childList:true});
 extra.open=window.watchCurriculum?.current===6;dock.hidden=window.watchCurriculum?.current<5;
})();

