/** Pointer/touch/keyboard ordering. The application owns persistence and permissions. */
export function bindOrdering(root, onAction = () => {}) {
  let drag = null, frame = null;
  const handleOf = event => event.target.closest?.('[data-ui="order"]');
  const itemOf = handle => handle.closest('.program,.setting-row,.music-catalog-item,.music-favorite-row,.fui-order-item') || handle.parentElement;
  const peers = handle => [...root.querySelectorAll('[data-ui="order"]')].filter(el =>
    el.dataset.action === handle.dataset.action && el.dataset.orderGroup === handle.dataset.orderGroup &&
    el.closest('.program-group') === handle.closest('.program-group') && !el.disabled && el.getClientRects().length);
  const clear = () => {
    if (!drag) return;
    clearTimeout(drag.timer); cancelAnimationFrame(frame); frame = null;
    itemOf(drag.handle)?.classList.remove('fui-order-dragging');
    for (const handle of drag.items) itemOf(handle)?.classList.remove('fui-order-before','fui-order-after');
    drag.handle.setAttribute('aria-grabbed','false');
    try { drag.handle.releasePointerCapture(drag.pointer); } catch {}
    drag = null;
  };
  const commit = (handle, items, from, to, originalEvent) => {
    if (from === to || !items[to] || !root.contains(handle) || handle.disabled) return;
    Object.assign(handle.dataset,{offset:String(to-from),direction:to<from?'up':'down',fromIndex:String(from),toIndex:String(to)});
    const result=onAction({action:handle.dataset.action,data:{...handle.dataset},element:handle,originalEvent});
    const focus=()=>[...root.querySelectorAll('[data-ui="order"]')].find(el=>el.dataset.action===handle.dataset.action&&el.dataset.program===handle.dataset.program&&el.dataset.orderGroup===handle.dataset.orderGroup)?.focus({preventScroll:true});
    Promise.resolve(result).then(focus,focus);
  };
  const update = () => {
    if (!drag?.active) return;
    if (!root.contains(drag.handle) || peers(drag.handle).map(el=>el.dataset.program).join('\0') !== drag.ids) { clear(); return; }
    for (const handle of drag.items) itemOf(handle)?.classList.remove('fui-order-before','fui-order-after');
    const group=drag.handle.closest('.program-group'),bounds=group?.getBoundingClientRect();
    if(bounds&&(drag.x<bounds.left||drag.x>bounds.right||drag.y<bounds.top||drag.y>bounds.bottom)){drag.to=drag.from;return;}
    let distance=Infinity,target=drag.from;
    drag.items.forEach((handle,index)=>{const box=handle.getBoundingClientRect();const d=Math.hypot(drag.x-(box.left+box.width/2),drag.y-(box.top+box.height/2));if(d<distance){distance=d;target=index;}});
    drag.to=target;
    if(target!==drag.from)itemOf(drag.items[target])?.classList.add(target<drag.from?'fui-order-before':'fui-order-after');
  };
  const scrollFrame = () => {
    if (!drag?.active) return;
    let parent=drag.handle.parentElement;
    while(parent){const style=getComputedStyle(parent);if(/auto|scroll/.test(style.overflowY)&&parent.scrollHeight>parent.clientHeight)break;parent=parent.parentElement||parent.getRootNode()?.host;}
    const box=parent?.getBoundingClientRect()||{top:0,bottom:innerHeight};
    const top=Math.max(0,box.top),bottom=Math.min(innerHeight,box.bottom);
    const step=drag.y<top+36?-14:drag.y>bottom-36?14:0;
    if(step){if(parent)parent.scrollBy(0,step);else window.scrollBy(0,step);update();}
    frame=requestAnimationFrame(scrollFrame);
  };
  const down = event => {
    const handle=handleOf(event);
    if(!handle||handle.disabled||event.button!==0||!root.contains(handle))return;
    const items=peers(handle);if(items.length<2)return;
    clear();event.preventDefault();
    drag={handle,items,ids:items.map(el=>el.dataset.program).join('\0'),from:items.indexOf(handle),to:items.indexOf(handle),pointer:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,active:false};
    try{handle.setPointerCapture(event.pointerId);}catch{}
    drag.timer=setTimeout(()=>{if(!drag)return;drag.active=true;handle.setAttribute('aria-grabbed','true');itemOf(handle)?.classList.add('fui-order-dragging');update();frame=requestAnimationFrame(scrollFrame);},180);
  };
  const move = event => {
    if(!drag||event.pointerId!==drag.pointer)return;
    drag.x=event.clientX;drag.y=event.clientY;
    if(!drag.active){if(Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>10)clear();return;}
    event.preventDefault();update();
  };
  const up = event => {
    if(!drag||event.pointerId!==drag.pointer)return;
    const current=drag,valid=current.active&&peers(current.handle).map(el=>el.dataset.program).join('\0')===current.ids;
    clear();if(valid)commit(current.handle,current.items,current.from,current.to,event);
  };
  const cancel = () => clear();
  const click = event => {if(handleOf(event)){event.preventDefault();event.stopImmediatePropagation();}};
  const key = event => {
    if(event.key==='Escape'&&drag){event.preventDefault();clear();return;}
    const handle=handleOf(event);if(!handle||handle.disabled)return;
    const items=peers(handle),from=items.indexOf(handle);
    const to=event.key==='ArrowUp'?from-1:event.key==='ArrowDown'?from+1:event.key==='Home'?0:event.key==='End'?items.length-1:null;
    if(to===null)return;
    event.preventDefault();event.stopImmediatePropagation();commit(handle,items,from,to,event);
  };
  root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move);root.addEventListener('pointerup',up);root.addEventListener('pointercancel',cancel);
  root.addEventListener('click',click,true);root.addEventListener('keydown',key,true);
  return ()=>{clear();root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',cancel);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key,true);};
}
