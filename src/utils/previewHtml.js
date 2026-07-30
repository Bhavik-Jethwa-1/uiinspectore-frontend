/**
 * Generates a standalone HTML string for the fullscreen design preview.
 * Renders elements onto a <canvas> in a new browser window.
 * @param {Object} opts.design     - the AI design result
 * @param {Object} opts.device     - device object with { label, width, height }
 * @param {Array}  opts.elements   - pre-computed canvas elements
 * @param {Object} opts.palette    - color palette
 */

export function generatePreviewHtml({ design, device, elements, palette }) {
  const w = device.width;
  const h = device.height;
  const name = design.screen_name || design.name || 'Design Preview';
  const devLabel = device.label;
  const bgColor = palette.background || '#f8f9ff';

  // Serialize elements safely — convert any non-serializable values
  const safeEls = (elements || []).map(el => ({
    id: el.id,
    type: el.type,
    x: Number(el.x) || 0,
    y: Number(el.y) || 0,
    width: Number(el.width) || 100,
    height: Number(el.height) || 50,
    text: String(el.text || ''),
    props: Object.fromEntries(
      Object.entries(el.props || {})
        .filter(([, v]) => typeof v !== 'object' || v === null)
        .map(([k, v]) => [k, typeof v === 'string' ? v.replace(/"/g, '\\"') : v])
    ),
  }));

  const elsJson = JSON.stringify(safeEls).replace(/"/g, '&quot;');
  const paletteJson = JSON.stringify(palette).replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;min-height:100%;background:#0d0d14;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
.toolbar{position:sticky;top:0;z-index:50;width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(13,13,20,0.97);border-bottom:1px solid #252535;backdrop-filter:blur(12px)}
.tl{display:flex;align-items:center;gap:10px}
.tt{font-size:13px;font-weight:700;color:#e0e0f0;font-family:system-ui,sans-serif}
.badge{font-size:10px;padding:3px 10px;border-radius:20px;background:rgba(124,92,255,0.18);color:#c4b5fd;font-family:system-ui,sans-serif;font-weight:600}
.btn{padding:7px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:system-ui,sans-serif}
.btn-ghost{background:rgba(255,255,255,0.06);color:#8888a0;border:1px solid #252535}
.canvas-wrap{width:${w}px;min-height:${h}px;position:relative;overflow:hidden;margin:24px auto;border-radius:12px;box-shadow:0 32px 80px rgba(0,0,0,0.7)}
canvas{display:block}
@media(max-width:${w + 80}px){.canvas-wrap{width:100%;border-radius:0;margin:0}}
</style>
</head>
<body>
<div class="toolbar">
<div class="tl">
<span class="tt">${name}</span>
<span class="badge">${devLabel} · ${w}×${h}</span>
</div>
<div style="display:flex;gap:8px">
<button class="btn btn-ghost" onclick="window.close()">✕ Close</button>
</div>
</div>
<div class="canvas-wrap">
<canvas id="c" width="${w}" height="${h}"></canvas>
</div>
<script>
(function(){
var els=${elsJson};
var palette=${paletteJson};
var w=${w},h=${h};
var c=document.getElementById('c');
var ctx=c.getContext('2d');
ctx.fillStyle='${bgColor}';
ctx.fillRect(0,0,w,h);
function rR(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
els.forEach(function(el){
  try{
    var x=el.x||0,y=el.y||0,ew=el.width||100,eh=el.height||50;
    var p=el.props||{};
    var bg=p.backgroundColor||p.background;
    if(bg&&bg!=='transparent'){
      ctx.fillStyle=bg;
      if(p.borderRadius>0){rR(ctx,x,y,ew,eh,Math.min(p.borderRadius,ew/2,eh/2));}else{ctx.fillRect(x,y,ew,eh);}
      ctx.fill();
    }
    if(p.border){
      var parts=p.border.split(' ');
      if(parts[2]){
        ctx.strokeStyle=parts[2];
        ctx.lineWidth=parseInt(parts[0])||1;
        if(p.borderRadius>0){rR(ctx,x,y,ew,eh,Math.min(p.borderRadius,ew/2,eh/2));}else{ctx.strokeRect(x,y,ew,eh);}
        ctx.stroke();
      }
    }
    if(el.text){
      var fs=parseFloat(p.fontSize)||12;
      ctx.fillStyle=p.color||'#fff';
      ctx.font=(p.fontWeight||400)+' '+fs+'px system-ui,sans-serif';
      ctx.textAlign=p.align==='center'?'center':p.align==='right'?'right':'left';
      ctx.textBaseline='middle';
      var tx=p.align==='center'?x+ew/2:p.align==='right'?x+ew-4:x+6;
      ctx.fillText(el.text,tx,y+eh/2,ew-12);
    }
  }catch(e){}
});
})();
<\/script>
</body>
</html>`;
}

/**
 * Opens a fullscreen preview of the generated design in a new browser tab.
 * @param {Object} design   - the AI design result
 * @param {string} deviceId - active device id
 * @param {Array}  devices  - all DEVICES array (for dimension lookup)
 * @param {Array}  elements - pre-computed canvas elements (already scaled to device)
 */
export function openFullscreenPreview(design, deviceId, devices, elements) {
  if (!design) return;
  const dev = devices.find(d => d.id === deviceId) || devices[0];
  const palette = design.parsed?.colorPalette || design.colorPalette || {};
  const html = generatePreviewHtml({ design, device: dev, elements, palette });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    alert('Please allow popups for this site to use the fullscreen preview.');
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
