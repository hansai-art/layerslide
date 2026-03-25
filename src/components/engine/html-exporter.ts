import type { SlideConfig, BackgroundConfig, TransitionType } from "@/types/layerslide";

export function generateStandaloneHtml(state: {
  slides: SlideConfig[];
  background: BackgroundConfig;
  transition: TransitionType;
}): string {
  const slidesJson = JSON.stringify(state.slides);

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LayerSlide Presentation</title>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center}
#stage{position:relative;width:100%;height:100%;overflow:hidden}
.slide{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .4s ease}
.slide.active{opacity:1;pointer-events:auto}
.overlay{position:absolute;left:0;right:0;text-align:center;padding:1rem 2rem;pointer-events:none}
.overlay.pos-top{top:10%}
.overlay.pos-center{top:50%;transform:translateY(-50%)}
.overlay.pos-bottom{bottom:10%}
.overlay.pos-custom{top:0;left:0;right:auto;bottom:auto}
.overlay img{max-width:80vw;max-height:60vh;object-fit:contain}
.overlay span{display:inline-block;white-space:pre-wrap;word-break:break-word}
#counter{position:fixed;bottom:12px;right:16px;font-size:12px;color:rgba(255,255,255,.45);font-family:monospace;z-index:99;user-select:none}
#hint{position:fixed;bottom:12px;left:16px;font-size:11px;color:rgba(255,255,255,.3);font-family:monospace;z-index:99;user-select:none}
</style>
</head>
<body>
<div id="stage"></div>
<div id="counter"></div>
<div id="hint">← → 切換投影片</div>
<script>
(function(){
var slides=${slidesJson};
var current=0;
var stage=document.getElementById("stage");
var counter=document.getElementById("counter");

function posClass(p){return "pos-"+(p||"center")}

function buildSlides(){
  slides.forEach(function(s,i){
    var div=document.createElement("div");
    div.className="slide"+(i===0?" active":"");
    div.dataset.index=i;

    (s.overlays||[]).forEach(function(o){
      if(!o.visible) return;
      var ov=document.createElement("div");
      ov.className="overlay "+posClass(o.position);

      if(o.position==="custom"&&o.customPosition){
        ov.style.left=o.customPosition.x+"%";
        ov.style.top=o.customPosition.y+"%";
      }

      if(o.type==="image"&&o.imageSrc){
        var img=document.createElement("img");
        img.src=o.imageSrc;
        if(o.imageWidth) img.style.width=o.imageWidth+"px";
        if(o.imageHeight) img.style.height=o.imageHeight+"px";
        if(o.imageOpacity!=null) img.style.opacity=o.imageOpacity;
        if(o.imageBorderRadius) img.style.borderRadius=o.imageBorderRadius+"px";
        ov.appendChild(img);
      } else {
        var span=document.createElement("span");
        span.textContent=o.text||"";
        if(o.style){
          if(o.style.fontSize) span.style.fontSize=o.style.fontSize;
          if(o.style.fontFamily) span.style.fontFamily=o.style.fontFamily;
          if(o.style.color) span.style.color=o.style.color;
          if(o.style.backgroundColor) span.style.backgroundColor=o.style.backgroundColor;
          if(o.style.textShadow) span.style.textShadow=o.style.textShadow;
          if(o.style.padding) span.style.padding=o.style.padding;
        }
        ov.appendChild(span);
      }

      div.appendChild(ov);
    });

    stage.appendChild(div);
  });
  updateCounter();
}

function goTo(idx){
  if(idx<0||idx>=slides.length) return;
  var all=stage.querySelectorAll(".slide");
  all.forEach(function(el){el.classList.remove("active")});
  all[idx].classList.add("active");
  current=idx;
  updateCounter();
}

function updateCounter(){
  counter.textContent=(current+1)+"/"+slides.length;
}

document.addEventListener("keydown",function(e){
  if(e.key==="ArrowRight"||e.key===" "){e.preventDefault();goTo(current+1)}
  if(e.key==="ArrowLeft"){e.preventDefault();goTo(current-1)}
});

var tx=null;
document.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});
document.addEventListener("touchend",function(e){
  if(tx===null) return;
  var dx=e.changedTouches[0].clientX-tx;
  if(Math.abs(dx)>50){dx<0?goTo(current+1):goTo(current-1)}
  tx=null;
},{passive:true});

buildSlides();
})();
</script>
</body>
</html>`;
}
