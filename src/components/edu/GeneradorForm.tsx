import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { TipoMaterialGrid, TIPOS_MATERIAL, type TipoMaterialId } from "./TipoMaterialGrid";
import { OutputPanel } from "./OutputPanel";

const GRADOS = [
  "1.° de Primaria", "2.° de Primaria", "3.° de Primaria",
  "4.° de Primaria", "5.° de Primaria", "6.° de Primaria",
];
const AREAS = [
  "Comunicación", "Matemática", "Ciencia y Tecnología",
  "Personal Social", "Educación Física", "Arte y Cultura",
  "Inglés", "Educación Religiosa",
];
const DURACIONES = ["45 minutos", "60 minutos", "90 minutos", "2 horas"];

const API_URL = import.meta.env.VITE_API_URL ?? "https://edu-ai-production-0113.up.railway.app";

export function GeneradorForm() {
  const [tipoMaterial, setTipoMaterial] = useState<TipoMaterialId>("sesion");
  const [grado, setGrado] = useState("");
  const [area, setArea] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [contenido, setContenido] = useState("");
  const [duracion, setDuracion] = useState("");
  const [notas, setNotas] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const tipoActual = TIPOS_MATERIAL.find((t) => t.id === tipoMaterial)!;

  async function handleGenerar() {
    if (!contenido.trim()) return;
    setResultado("");
    setError("");
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problematica: contenido, grado, area, competencia, duracion, notas, tipoMaterial }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error del servidor");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const { content, error: streamErr } = JSON.parse(payload);
            if (streamErr) throw new Error(streamErr);
            if (content) setResultado((prev) => prev + content);
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  function handleClear() {
    abortRef.current?.abort();
    setResultado("");
    setError("");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <TipoMaterialGrid value={tipoMaterial} onChange={setTipoMaterial} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-3xl border border-deep-forest/5 shadow-soft p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Grado</label>
                <Select value={grado} onValueChange={setGrado}>
                  <SelectTrigger className="rounded-xl border-deep-forest/10 text-sm">
                    <SelectValue placeholder="Grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADOS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Duración</label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger className="rounded-xl border-deep-forest/10 text-sm">
                    <SelectValue placeholder="Duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACIONES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Área curricular</label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="rounded-xl border-deep-forest/10 text-sm">
                  <SelectValue placeholder="Selecciona el área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Competencia</label>
              <Input
                placeholder="Ej: Resuelve problemas de cantidad"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                className="rounded-xl border-deep-forest/10 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">
                Contenido / Tema <span className="text-andes-clay">*</span>
              </label>
              <Textarea
                placeholder="Ej: Fracciones en situaciones de la vida diaria en comunidades rurales..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="min-h-[110px] rounded-xl border-deep-forest/10 resize-none text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Notas adicionales</label>
              <Textarea
                placeholder="Contexto del aula, materiales disponibles, necesidades especiales..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="min-h-[70px] rounded-xl border-deep-forest/10 resize-none text-sm"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleGenerar}
              disabled={loading || !contenido.trim()}
              className="bg-andes-clay text-white hover:bg-andes-clay/90 rounded-2xl py-5 font-medium flex items-center gap-2 w-full"
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generar {tipoActual.label.toLowerCase()}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-3">
          <OutputPanel
            resultado={resultado}
            loading={loading}
            label={tipoActual.label}
            icon={tipoActual.icon}
            onCopy={() => navigator.clipboard.writeText(resultado)}
            onClear={handleClear}
            onStop={handleStop}
          />
        </div>
      </div>
    </div>
  );
}
