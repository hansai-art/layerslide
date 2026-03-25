import type { SketchParamDef } from "@/types/layerslide";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SketchParamsPanelProps {
  params: Record<string, SketchParamDef>;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

/** Auto-generated UI for sketch parameters */
const SketchParamsPanel = ({ params, values, onChange }: SketchParamsPanelProps) => {
  return (
    <div className="space-y-3">
      {Object.entries(params).map(([key, def]) => (
        <div key={key} className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">{def.label}</span>
            <span className="text-foreground font-mono text-[10px]">
              {formatValue(values[key] ?? def.default, def)}
            </span>
          </div>
          {def.type === "number" && def.min !== undefined && def.max !== undefined && (
            <Slider
              value={[Number(values[key] ?? def.default)]}
              min={def.min}
              max={def.max}
              step={def.step ?? 1}
              onValueChange={([v]) => onChange(key, v)}
              className="w-full"
            />
          )}
          {def.type === "boolean" && (
            <Switch
              checked={Boolean(values[key] ?? def.default)}
              onCheckedChange={(v) => onChange(key, v)}
            />
          )}
          {def.type === "color" && (
            <Input
              value={String(values[key] ?? def.default)}
              onChange={(e) => onChange(key, e.target.value)}
              className="h-7 text-xs font-mono bg-ls-surface-1"
              placeholder="R, G, B"
            />
          )}
          {def.type === "select" && def.options && (
            <Select
              value={String(values[key] ?? def.default)}
              onValueChange={(v) => onChange(key, v)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {def.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  );
};

function formatValue(value: unknown, def: SketchParamDef): string {
  if (def.type === "number") return String(value);
  if (def.type === "boolean") return value ? "開" : "關";
  return String(value);
}

export default SketchParamsPanel;
