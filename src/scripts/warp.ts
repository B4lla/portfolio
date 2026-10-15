// Displacement of the original text
export function initPointerWarp(): () => void {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  if (reduced.matches || !finePointer.matches) return () => {};
  const nodes = [...document.querySelectorAll<HTMLElement>('[data-paper-front] [data-refract]')];
  const filter = document.getElementById('hover-type-warp');
  const image = document.getElementById('hover-displacement-map');
  if (!filter || !image || !nodes.length) return () => {};

  const side = 168;
  const canvas = document.createElement('canvas');
  canvas.width = side; canvas.height = side;
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const texture = context.createImageData(side, side);
  const strength = 26;
  for (let y=0;y<side;y++) for (let x=0;x<side;x++) {
    const dx=x-side/2, dy=y-side/2;
    const falloff=Math.exp(-(dx*dx/3000+dy*dy/2400)*2);
    const shear=Math.sin(dy*.076+dx*.02);
    const fold=Math.sin(dx*.052-dy*.03);
    const horizontal=(shear*5.8+fold*1.5)*falloff;
    const vertical=(Math.cos(dx*.083+dy*.014)*4.5-shear*1.1)*falloff;
    const i=(y*side+x)*4;
    texture.data[i]=Math.round(128+horizontal*255/strength);
    texture.data[i+1]=Math.round(128+vertical*255/strength);
    texture.data[i+2]=128;
    texture.data[i+3]=255;
  }
  context.putImageData(texture,0,0);
  image.setAttribute('href',canvas.toDataURL('image/png'));
  image.setAttribute('width',String(side));
  image.setAttribute('height',String(side));

  const abort=new AbortController();
  let active:HTMLElement|null=null, frame=0, cursorX=0, cursorY=0;
  const clear=()=>{
    cancelAnimationFrame(frame);frame=0;
    active?.classList.remove('warp-text-active');active=null;
  };
  const render=()=>{
    frame=0;
    if(!active || !active.isConnected)return;
    const rect=active.getBoundingClientRect();
    if(!rect.width || !rect.height)return;
    filter.setAttribute('x','-24');filter.setAttribute('y','-24');
    filter.setAttribute('width',String(Math.ceil(rect.width+48)));
    filter.setAttribute('height',String(Math.ceil(rect.height+48)));
    image.setAttribute('x',String(Math.round(cursorX-rect.left-side/2)));
    image.setAttribute('y',String(Math.round(cursorY-rect.top-side/2)));
    active.classList.add('warp-text-active');
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
  for(const node of nodes){
    node.addEventListener('pointerenter',e=>{
      if(active!==node)clear();
      active=node;cursorX=e.clientX;cursorY=e.clientY;schedule();
    },{signal:abort.signal});
    node.addEventListener('pointermove',e=>{
      if(active!==node)return;
      cursorX=e.clientX;cursorY=e.clientY;schedule();
    },{signal:abort.signal});
    node.addEventListener('pointerleave',()=>{if(active===node)clear();},{signal:abort.signal});
  }
  addEventListener('scroll',schedule,{passive:true,signal:abort.signal});
  addEventListener('resize',clear,{passive:true,signal:abort.signal});
  return ()=>{abort.abort();clear();image.removeAttribute('href');};
}
