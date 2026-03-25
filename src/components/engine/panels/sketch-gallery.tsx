import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryEntry {
  name: string;
  label: string;
  category: "自然" | "科技" | "幾何" | "抽象";
  desc: string;
}

const galleryEntries: GalleryEntry[] = [
  { name: "particle-network", label: "粒子網路", category: "科技", desc: "粒子間自動連線的科技風網路" },
  { name: "starfield", label: "星空穿越", category: "自然", desc: "高速穿越星空的視覺效果" },
  { name: "wave-gradient", label: "波浪漸層", category: "自然", desc: "多層波浪的漸層色彩" },
  { name: "bokeh-lights", label: "散景光點", category: "抽象", desc: "柔焦光點緩慢浮動" },
  { name: "matrix-rain", label: "矩陣雨", category: "科技", desc: "經典矩陣風格的字元雨" },
  { name: "noise-terrain", label: "噪聲地形", category: "幾何", desc: "噪聲函數生成的線框地形" },
  { name: "geometric-morph", label: "幾何變形", category: "幾何", desc: "多邊形層疊旋轉變形" },
  { name: "fluid-sim", label: "流體模擬", category: "抽象", desc: "Metaball 流體模擬效果" },
  { name: "aurora-borealis", label: "極光", category: "自然", desc: "北極光的簾幕狀光帶" },
  { name: "spiral-galaxy", label: "螺旋星系", category: "自然", desc: "旋轉的螺旋臂銀河系" },
  { name: "rain-ripples", label: "雨滴漣漪", category: "自然", desc: "雨滴落入水面的擴散漣漪" },
  { name: "shader-gradient", label: "著色器漸層", category: "抽象", desc: "GPU 加速的流動色彩漸層" },
];

const categories = ["全部", "自然", "科技", "幾何", "抽象"] as const;

const categoryColors: Record<string, string> = {
  自然: "bg-green-500/20 text-green-400 border-green-500/30",
  科技: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  幾何: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  抽象: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

interface SketchGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (sketchName: string) => void;
  activeSketch?: string;
}

const SketchGallery = ({ open, onClose, onSelect, activeSketch }: SketchGalleryProps) => {
  const [filter, setFilter] = useState<string>("全部");

  const filtered =
    filter === "全部"
      ? galleryEntries
      : galleryEntries.filter((e) => e.category === filter);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>動畫背景庫</DialogTitle>
          <DialogDescription>瀏覽並選擇背景動畫效果</DialogDescription>
        </DialogHeader>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-ls-surface-2 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sketch grid */}
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((entry) => (
            <div
              key={entry.name}
              className={cn(
                "rounded-lg bg-ls-surface-2 border border-border p-3 space-y-2 transition-colors",
                "hover:border-primary/40",
                activeSketch === entry.name && "border-primary ring-1 ring-primary/20"
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.label}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{entry.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0 shrink-0",
                    categoryColors[entry.category]
                  )}
                >
                  {entry.category}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{entry.desc}</p>
              <button
                onClick={() => {
                  onSelect(entry.name);
                  onClose();
                }}
                className={cn(
                  "w-full rounded-md py-1 text-xs font-medium transition-colors",
                  activeSketch === entry.name
                    ? "bg-primary/20 text-primary cursor-default"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                disabled={activeSketch === entry.name}
              >
                {activeSketch === entry.name ? "使用中" : "使用"}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SketchGallery;
