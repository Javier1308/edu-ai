import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessagesSquare } from "lucide-react";
import { Dropzone } from "./Dropzone";
import { ArchivoCard } from "./ArchivoCard";
import { OutputPanel } from "./OutputPanel";

const API_URL = import.meta.env.VITE_API_URL ?? "https://edu-ai-production-0113.up.railway.app";

interface ArchivoState {
  filename: string;
  size: number;
  chars: number;
  text: string;
}

export function MejoradorForm() {
  const [archivo, setArchivo] = useState<ArchivoState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/api/extract`, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al procesar el archivo");
      }
      const data = await res.json();
      setArchivo({ filename: data.filename, size: data.size, chars: data.chars, text: data.text });
    } catch (err: any) {
      setUploadError(err.message ?? "Error al subir el archivo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalizar() {
    if (!archivo?.text.trim()) return;
    setResultado("");
    setError("");
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problematica: archivo.text,
          tipoMaterial: "mejora",
        }),
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

  function handleStop() { abortRef.current?.abort(); setLoading(false); }
  function handleClear() { abortRef.current?.abort(); setResultado(""); setError(""); setLoading(false); }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Panel izquierdo */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {!archivo ? (
          <>
            <Dropzone onFile={handleFile} disabled={uploading} />
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-deep-forest/50 px-1">
                <span className="size-4 border-2 border-andes-clay/30 border-t-andes-clay rounded-full animate-spin" />
                Extrayendo texto...
              </div>
            )}
            {uploadError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{uploadError}</p>
            )}
            <div className="flex items-start gap-2 text-xs text-deep-forest/40 px-1">
              <MessagesSquare className="size-3.5 shrink-0 mt-0.5" />
              Adjunta tu material para recibir retroalimentación pedagógica alineada al CNEB.
            </div>
          </>
        ) : (
          <>
            <ArchivoCard
              filename={archivo.filename}
              size={archivo.size}
              chars={archivo.chars}
              text={archivo.text}
              onTextChange={(t) => setArchivo((a) => a ? { ...a, text: t } : a)}
              onRemove={() => { setArchivo(null); setResultado(""); setError(""); }}
            />

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button
              onClick={handleAnalizar}
              disabled={loading || !archivo.text.trim()}
              className="bg-andes-clay text-white hover:bg-andes-clay/90 rounded-2xl py-5 font-medium flex items-center gap-2 w-full"
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Analizar y mejorar
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Output */}
      <div className="lg:col-span-3">
        <OutputPanel
          resultado={resultado}
          loading={loading}
          label="Retroalimentación pedagógica"
          icon={MessagesSquare}
          onCopy={() => navigator.clipboard.writeText(resultado)}
          onClear={handleClear}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
