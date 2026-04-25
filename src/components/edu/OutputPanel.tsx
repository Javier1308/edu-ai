import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Square } from "lucide-react";

interface Props {
  resultado: string;
  loading: boolean;
  label: string;
  icon: React.ElementType;
  onCopy: () => void;
  onClear: () => void;
  onStop: () => void;
}

export function OutputPanel({ resultado, loading, label, icon: Icon, onCopy, onClear, onStop }: Props) {
  if (!resultado && !loading) {
    return (
      <div className="h-full min-h-[420px] bg-card rounded-3xl border border-deep-forest/5 shadow-soft flex flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="size-16 rounded-[20px] bg-sunlight flex items-center justify-center">
          <Icon className="size-7 text-andes-clay" />
        </div>
        <p className="text-deep-forest/50 text-sm max-w-[36ch] leading-relaxed">
          Completa el formulario y genera tu{" "}
          <strong className="text-deep-forest/70">{label.toLowerCase()}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-deep-forest/5 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-deep-forest/5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-soft-leaf flex items-center justify-center">
            <Icon className="size-4 text-deep-forest" />
          </div>
          <span className="font-semibold text-deep-forest text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="rounded-xl text-xs text-red-500 hover:text-red-600 gap-1.5"
            >
              <Square className="size-3.5 fill-current" /> Detener
            </Button>
          )}
          {resultado && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5"
              >
                <Copy className="size-3.5" /> Copiar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Limpiar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 max-h-[680px] overflow-y-auto">
        {loading && !resultado && (
          <div className="flex items-center gap-3 text-deep-forest/50 text-sm">
            <span className="size-4 border-2 border-andes-clay/30 border-t-andes-clay rounded-full animate-spin" />
            Generando {label.toLowerCase()}...
          </div>
        )}
        <div className="prose prose-sm max-w-none text-deep-forest/80 prose-headings:text-deep-forest prose-strong:text-deep-forest prose-table:text-sm prose-th:bg-soft-leaf prose-th:text-deep-forest prose-td:border-deep-forest/10 prose-li:marker:text-andes-clay">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{resultado}</ReactMarkdown>
        </div>
        {loading && resultado && (
          <span className="inline-block size-2 bg-andes-clay rounded-full animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
