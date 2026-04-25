import { useState } from "react";
import { FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  filename: string;
  size: number;
  chars: number;
  text: string;
  onTextChange: (t: string) => void;
  onRemove: () => void;
}

export function ArchivoCard({ filename, size, chars, text, onTextChange, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-deep-forest/8 shadow-soft overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="size-10 rounded-xl bg-soft-leaf flex items-center justify-center shrink-0">
          <FileText className="size-5 text-deep-forest/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-deep-forest truncate">{filename}</p>
          <p className="text-xs text-deep-forest/50 mt-0.5">
            {formatBytes(size)} · {chars.toLocaleString()} caracteres extraídos
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl text-xs text-deep-forest/50 hover:text-deep-forest gap-1"
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {expanded ? "Ocultar" : "Revisar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="rounded-xl text-xs text-red-400 hover:text-red-600 gap-1"
          >
            <X className="size-3.5" /> Eliminar
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-deep-forest/5 p-4">
          <p className="text-xs font-semibold text-deep-forest/40 uppercase tracking-wider mb-2">
            Texto extraído (editable)
          </p>
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[200px] text-xs font-mono rounded-xl border-deep-forest/10 resize-y"
          />
        </div>
      )}
    </div>
  );
}
