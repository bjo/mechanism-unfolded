// Preserve published chapter links from before the library home existed.
const requestedLesson=new URL(location.href).searchParams.get('lesson');
if(requestedLesson!==null){const target=new URL('watch.html',location.href);target.search=location.search;target.hash=location.hash;location.replace(target.href);}
