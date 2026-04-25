import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/edu/Navbar";
import Footer from "@/components/edu/Footer";

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

function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-deep-forest mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-deep-forest mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-deep-forest mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-deep-forest">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-deep-forest/80">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-deep-forest/80">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-3 text-deep-forest/75 leading-relaxed">')
    .replace(/\n/g, "<br/>");
}

export default function Generador() {
  const [problematica, setProblematica] = useState("");
  const [grado, setGrado] = useState("");
  const [area, setArea] = useState("");
  const [duracion, setDuracion] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleGenerar() {
    if (!problematica.trim()) return;
    setResultado("");
    setError("");
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problematica, grado, area, duracion }),
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
      if (err.name !== "AbortError") {
        setError(err.message ?? "Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setResultado("");
    setError("");
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(resultado);
  }

  return (
    <div className="min-h-screen bg-warm-sand text-deep-forest flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 md:px-8 py-12">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-deep-forest/60 hover:text-deep-forest mb-8 transition-colors">
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>

        <div className="mb-10">
          <span className="text-xs font-semibold text-andes-clay uppercase tracking-widest">Generador IA</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-serif font-medium leading-[1.1] text-deep-forest">
            Crea material <span className="italic text-andes-clay">alineado al CNEB</span>
          </h1>
          <p className="mt-4 text-deep-forest/65 max-w-[60ch] leading-relaxed">
            Describe la problemática o necesidad de tu aula y Edu generará una sesión de aprendizaje
            completa basada en el Programa Curricular de Primaria EBR y la Norma Técnica 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-card rounded-3xl border border-deep-forest/5 shadow-soft p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Grado</label>
                <Select value={grado} onValueChange={setGrado}>
                  <SelectTrigger className="rounded-xl border-deep-forest/10">
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADOS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Área curricular</label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="rounded-xl border-deep-forest/10">
                    <SelectValue placeholder="Selecciona el área" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">Duración de sesión</label>
                <Select value={duracion} onValueChange={setDuracion}>
                  <SelectTrigger className="rounded-xl border-deep-forest/10">
                    <SelectValue placeholder="Selecciona la duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURACIONES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider">
                  Problemática o necesidad <span className="text-andes-clay">*</span>
                </label>
                <Textarea
                  placeholder="Ej: Mis estudiantes de 4.° grado tienen dificultades para comprender fracciones en situaciones de la vida diaria. Viven en una comunidad rural donde se trabaja con la chacra..."
                  value={problematica}
                  onChange={(e) => setProblematica(e.target.value)}
                  className="min-h-[160px] rounded-xl border-deep-forest/10 resize-none text-sm"
                />
              </div>

              <Button
                onClick={handleGenerar}
                disabled={loading || !problematica.trim()}
                className="bg-andes-clay text-white hover:bg-andes-clay/90 rounded-2xl py-5 font-medium flex items-center gap-2 w-full"
              >
                {loading ? (
                  <>
                    <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Generar material
                  </>
                )}
              </Button>

              {loading && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-deep-forest/50 hover:text-deep-forest text-sm rounded-xl"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* ── Result ── */}
          <div className="lg:col-span-3">
            {!resultado && !loading && !error && (
              <div className="h-full min-h-[400px] bg-card rounded-3xl border border-deep-forest/5 shadow-soft flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="size-16 rounded-[20px] bg-sunlight flex items-center justify-center">
                  <Sparkles className="size-7 text-andes-clay" />
                </div>
                <p className="text-deep-forest/50 text-sm max-w-[36ch] leading-relaxed">
                  Completa el formulario y haz clic en <strong className="text-deep-forest/70">Generar material</strong> para crear tu sesión de aprendizaje.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {(resultado || loading) && !error && (
              <div className="bg-card rounded-3xl border border-deep-forest/5 shadow-soft overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-deep-forest/5">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-soft-leaf flex items-center justify-center">
                      <Sparkles className="size-4 text-deep-forest" />
                    </div>
                    <span className="font-semibold text-deep-forest text-sm">Material generado por Edu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resultado && (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5">
                          <Copy className="size-3.5" /> Copiar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5">
                          <RotateCcw className="size-3.5" /> Nueva consulta
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6 max-h-[680px] overflow-y-auto">
                  {loading && !resultado && (
                    <div className="flex items-center gap-3 text-deep-forest/50 text-sm">
                      <span className="size-4 border-2 border-andes-clay/30 border-t-andes-clay rounded-full animate-spin" />
                      Analizando contexto curricular...
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none text-deep-forest/80 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: `<p class="mb-3 text-deep-forest/75 leading-relaxed">${parseMarkdown(resultado)}</p>` }}
                  />
                  {loading && resultado && (
                    <span className="inline-block size-2 bg-andes-clay rounded-full animate-pulse ml-1" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
