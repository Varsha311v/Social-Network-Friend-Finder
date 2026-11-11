const graph = new Map();
let highlights = { route: [], visited: [], common: [], selected: [] };
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function addUser(name) {
  name = name.trim();
  if (!name) return 'Please enter a name.';
  if (graph.has(name)) return `${name} already exists.`;
  graph.set(name, new Set());
  refresh();
  return `${name} was added to the network.`;
}
function addConnection(a,b) {
  if (!graph.has(a) || !graph.has(b)) return 'Please choose two existing people.';
  if (a === b) return 'A person cannot be friends with themselves.';
  if (graph.get(a).has(b)) return `${a} and ${b} are already friends.`;
  graph.get(a).add(b); graph.get(b).add(a); refresh();
  return `${a} and ${b} are now friends.`;
}
function sortedFriends(name) { return [...(graph.get(name) || [])].sort((a,b)=>a.localeCompare(b)); }
function bfsPath(start,target) {
  if (!graph.has(start)||!graph.has(target)) return null;
  const queue=[[start]], seen=new Set([start]);
  while(queue.length){
    const path=queue.shift(), node=path[path.length-1];
    if(node===target) return path;
    for(const next of sortedFriends(node)) if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}
  }
  return null;
}
function bfs(start) {
  const seen=new Set([start]), q=[start], order=[];
  while(q.length){const n=q.shift();order.push(n);for(const f of sortedFriends(n))if(!seen.has(f)){seen.add(f);q.push(f);}}
  return order;
}
function dfs(start) {
  const seen=new Set(), order=[];
  function visit(n){seen.add(n);order.push(n);for(const f of sortedFriends(n))if(!seen.has(f))visit(f);}
  visit(start); return order;
}
function mutual(a,b) { return sortedFriends(a).filter(x=>graph.get(b)?.has(x)); }
function suggestions(name) {
  const result=new Set();
  for(const f of graph.get(name)||[]) for(const fof of graph.get(f)||[])
    if(fof!==name && !graph.get(name).has(fof)) result.add(fof);
  return [...result].sort((a,b)=>a.localeCompare(b));
}
function refresh() {
  updateSelects(); renderGraph(); renderAdjacency();
  $('emptyState').classList.toggle('hidden',graph.size>0);
}
function updateSelects() {
  const ids=['friendA','friendB','mutualA','mutualB','pathA','pathB','suggestPerson','traversePerson'];
  ids.forEach(id=>{
    const el=$(id), old=el.value;
    const first=el.options[0].textContent;
    el.innerHTML=`<option value="">${esc(first)}</option>`+
      [...graph.keys()].sort((a,b)=>a.localeCompare(b)).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    if(graph.has(old)) el.value=old;
  });
  const disabled=graph.size<2;
  $('connectBtn').disabled=disabled;
}
function renderAdjacency() {
  $('adjacencyList').textContent = graph.size
    ? [...graph.keys()].sort((a,b)=>a.localeCompare(b)).map(n=>`${n} → { ${sortedFriends(n).join(', ')} }`).join('\n')
    : 'Add people to see the adjacency list.';
}
function renderGraph() {
  const svg=$('networkSvg'), edges=$('edges'), nodes=$('nodes');
  edges.innerHTML=''; nodes.innerHTML='';
  const names=[...graph.keys()].sort((a,b)=>a.localeCompare(b));
  if(!names.length) return;
  const cx=380,cy=225,rx=Math.min(280,110+names.length*17),ry=Math.min(155,75+names.length*10);
  const pos={};
  names.forEach((n,i)=>{const angle=(-Math.PI/2)+(2*Math.PI*i/names.length);pos[n]={x:cx+rx*Math.cos(angle),y:cy+ry*Math.sin(angle)};});
  const edgeSet=new Set();
  names.forEach(a=>sortedFriends(a).forEach(b)=>{
    const key=[a,b].sort().join('||');if(edgeSet.has(key))return;edgeSet.add(key);
    const p=pos[a],q=pos[b],route=highlights.route.includes(a)&&highlights.route.includes(b)&&Math.abs(highlights.route.indexOf(a)-highlights.route.indexOf(b))===1;
    edges.insertAdjacentHTML('beforeend',`<line class="edge ${route?'route':''}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`);
  }));
  names.forEach(n=>{
    const p=pos[n];let cls='normal';
    if(highlights.route.includes(n))cls='route';
    else if(highlights.visited.includes(n))cls='visited';
    else if(highlights.common.includes(n))cls='highlight';
    else if(highlights.selected.includes(n))cls='selected';
    nodes.insertAdjacentHTML('beforeend',`<g class="node ${cls}" transform="translate(${p.x},${p.y})"><circle r="23"></circle><text y="42">${esc(n.length>13?n.slice(0,12)+'…':n)}</text></g>`);
  });
}
function showResult(html){$('resultBox').innerHTML=html;}
function resetHighlights(){highlights={route:[],visited:[],common:[],selected:[]};}
function loadDemo() {
  graph.clear();
  ['Alice','Bob','Charlie','David','Eve','Frank'].forEach(n=>graph.set(n,new Set()));
  [['Alice','Bob'],['Alice','Charlie'],['Bob','David'],['Charlie','David'],['David','Eve']].forEach(([a,b])=>{graph.get(a).add(b);graph.get(b).add(a);});
  resetHighlights();refresh();showResult('Example network loaded. Choose an exploration tool to get started.');
}
$('addUserForm').addEventListener('submit',e=>{e.preventDefault();const msg=addUser($('nameInput').value);$('userFeedback').textContent=msg;if(msg.includes('added'))$('nameInput').value='';});
$('connectBtn').addEventListener('click',()=>{const msg=addConnection($('friendA').value,$('friendB').value);$('connectionFeedback').textContent=msg;});
$('demoBtn').addEventListener('click',loadDemo);$('emptyDemoBtn').addEventListener('click',loadDemo);
$('resetBtn').addEventListener('click',()=>{graph.clear();resetHighlights();refresh();showResult('Network cleared. Add people to begin again.');$('userFeedback').textContent='';$('connectionFeedback').textContent='';});
document.querySelectorAll('[data-theme-choice]').forEach(btn=>btn.addEventListener('click',()=>{
  document.body.dataset.theme=btn.dataset.themeChoice;
  document.querySelectorAll('[data-theme-choice]').forEach(b=>b.classList.toggle('active',b===btn));
}));
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
  document.querySelectorAll('.tab-content').forEach(el=>el.classList.add('hidden'));
  $(btn.dataset.tab+'Tab').classList.remove('hidden');
}));
$('mutualBtn').addEventListener('click',()=>{
  const a=$('mutualA').value,b=$('mutualB').value;
  if(!graph.has(a)||!graph.has(b)){showResult('Choose two people first.');return;}
  const list=mutual(a,b);resetHighlights();highlights.common=list;highlights.selected=[a,b];renderGraph();
  showResult(`<strong>Friends in common for ${esc(a)} and ${esc(b)}:</strong> ${list.length?list.map(esc).join(', '):'None'}.`);
});
$('pathBtn').addEventListener('click',()=>{
  const a=$('pathA').value,b=$('pathB').value;
  if(!graph.has(a)||!graph.has(b)){showResult('Choose a starting person and a destination.');return;}
  const path=bfsPath(a,b);resetHighlights();
  if(path){highlights.route=path;renderGraph();showResult(`<strong>Shortest route:</strong> ${path.map(esc).join(' → ')} <br><strong>${path.length-1}</strong> connection(s) apart.`);}
  else{renderGraph();showResult(`There is no connection between ${esc(a)} and ${esc(b)}.`);}
});
$('suggestBtn').addEventListener('click',()=>{
  const n=$('suggestPerson').value;if(!graph.has(n)){showResult('Choose a person first.');return;}
  const list=suggestions(n);resetHighlights();highlights.common=list;highlights.selected=[n];renderGraph();
  showResult(`<strong>Suggestions for ${esc(n)}:</strong> ${list.length?list.map(esc).join(', '):'No suggestions yet.'}`);
});
function traverse(kind){
  const n=$('traversePerson').value;if(!graph.has(n)){showResult('Choose a starting person first.');return;}
  const order=kind==='BFS'?bfs(n):dfs(n);resetHighlights();highlights.visited=order;highlights.selected=[n];renderGraph();
  showResult(`<strong>${kind} traversal from ${esc(n)}:</strong><br>${order.map(esc).join(' → ')}<br><span>${order.length} person(s) visited in this connected component.</span>`);
}
$('bfsBtn').addEventListener('click',()=>traverse('BFS'));$('dfsBtn').addEventListener('click',()=>traverse('DFS'));
refresh();
