# Generador + Mejorador UI/UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar `Generador.tsx` en tabs (Generar / Mejorar), extraer componentes reutilizables, agregar dropzone con extracción de texto en servidor, y mejorar el render de Markdown con react-markdown.

**Architecture:** El page `Generador.tsx` orquesta dos tabs. Cada tab tiene su propio form component. `OutputPanel` es compartido. El backend recibe un nuevo endpoint `/api/extract` con multer + unpdf/mammoth. El stream de generación se reutiliza para ambos tabs sin cambios.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (design system existente), shadcn/ui Tabs/Collapsible, react-markdown + remark-gfm, express multer, unpdf, mammoth.

---

### Task 1: Instalar dependencias frontend y backend

**Files:**
- Modify: `package.json` (raíz)
- Modify: `backend/package.json`

- [ ] **Step 1: Instalar dependencias frontend**

```bash
cd /home/javier1308/Documents/edu-assistant-ai
npm install react-markdown remark-gfm
```

Expected: `added X packages` sin errores.

- [ ] **Step 2: Instalar dependencias backend**

```bash
cd /home/javier1308/Documents/edu-assistant-ai/backend
npm install multer unpdf mammoth
```

Expected: `added X packages` sin errores.

- [ ] **Step 3: Commit**

```bash
cd /home/javier1308/Documents/edu-assistant-ai
git add package.json package-lock.json backend/package.json backend/package-lock.json
git commit -m "deps: instala react-markdown, remark-gfm, multer, unpdf, mammoth"
```

---

### Task 2: Crear OutputPanel — render Markdown + acciones

**Files:**
- Create: `src/components/edu/OutputPanel.tsx`

Este componente recibe el texto en streaming y lo renderiza con `react-markdown`. Expone botones Copiar, Limpiar y Detener.

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/edu/OutputPanel.tsx
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
            <Button variant="ghost" size="sm" onClick={onStop}
              className="rounded-xl text-xs text-red-500 hover:text-red-600 gap-1.5">
              <Square className="size-3.5 fill-current" /> Detener
            </Button>
          )}
          {resultado && (
            <>
              <Button variant="ghost" size="sm" onClick={onCopy}
                className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5">
                <Copy className="size-3.5" /> Copiar
              </Button>
              <Button variant="ghost" size="sm" onClick={onClear}
                className="rounded-xl text-xs text-deep-forest/60 hover:text-deep-forest gap-1.5">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/edu/OutputPanel.tsx
git commit -m "feat: componente OutputPanel con react-markdown y acciones"
```

---

### Task 3: Crear TipoMaterialGrid — selector de tipo de material

**Files:**
- Create: `src/components/edu/TipoMaterialGrid.tsx`

Extrae la lógica de selección de tipo que ya existe en `Generador.tsx` a un componente propio.

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/edu/TipoMaterialGrid.tsx
import { BookOpen, FileText, FlaskConical, ClipboardList, Zap } from "lucide-react";

export const TIPOS_MATERIAL = [
  {
    id: "sesion",
    label: "Sesión de aprendizaje",
    descripcion: "Planificación completa con inicio, desarrollo y cierre",
    icon: BookOpen,
    color: "bg-sunlight",
  },
  {
    id: "ficha",
    label: "Ficha de ejercicios",
    descripcion: "Ejercicios prácticos para reforzar un tema",
    icon: FileText,
    color: "bg-soft-leaf",
  },
  {
    id: "ejemplos",
    label: "Ejemplos y casos",
    descripcion: "Situaciones contextualizadas con resolución paso a paso",
    icon: FlaskConical,
    color: "bg-sunlight",
  },
  {
    id: "evaluacion",
    label: "Evaluación",
    descripcion: "Prueba o instrumento de evaluación con rúbrica",
    icon: ClipboardList,
    color: "bg-soft-leaf",
  },
  {
    id: "actividades",
    label: "Actividades",
    descripcion: "Set de actividades dinámicas para el aula",
    icon: Zap,
    color: "bg-sunlight",
  },
] as const;

export type TipoMaterialId = (typeof TIPOS_MATERIAL)[number]["id"];

interface Props {
  value: TipoMaterialId;
  onChange: (id: TipoMaterialId) => void;
}

export function TipoMaterialGrid({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-deep-forest/50 uppercase tracking-wider mb-3">
        ¿Qué quieres crear?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TIPOS_MATERIAL.map((tipo) => {
          const Icon = tipo.icon;
          const activo = value === tipo.id;
          return (
            <button
              key={tipo.id}
              onClick={() => onChange(tipo.id)}
              className={`flex flex-col gap-2.5 p-4 rounded-2xl border-2 text-left transition-all ${
                activo
                  ? "border-andes-clay bg-card shadow-clay"
                  : "border-transparent bg-card hover:border-deep-forest/10 shadow-soft"
              }`}
            >
              <div className={`size-10 rounded-xl ${tipo.color} flex items-center justify-center`}>
                <Icon className={`size-5 ${activo ? "text-andes-clay" : "text-deep-forest/70"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold leading-tight ${activo ? "text-andes-clay" : "text-deep-forest"}`}>
                  {tipo.label}
                </p>
                <p className="text-[11px] text-deep-forest/50 mt-0.5 leading-tight">
                  {tipo.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/edu/TipoMaterialGrid.tsx
git commit -m "feat: extrae TipoMaterialGrid como componente reutilizable"
```

---

### Task 4: Crear GeneradorForm — tab "Generar recurso"

**Files:**
- Create: `src/components/edu/GeneradorForm.tsx`

Contiene los campos: grado, área, competencia, contenido, duración, notas. Llama al stream de `/api/generate`.

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/edu/GeneradorForm.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/edu/GeneradorForm.tsx
git commit -m "feat: GeneradorForm con campos grado, área, competencia, contenido, duración, notas"
```

---

### Task 5: Crear Dropzone y ArchivoCard

**Files:**
- Create: `src/components/edu/Dropzone.tsx`
- Create: `src/components/edu/ArchivoCard.tsx`

- [ ] **Step 1: Crear Dropzone**

```tsx
// src/components/edu/Dropzone.tsx
import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

const ACCEPTED = [".txt", ".md", ".pdf", ".docx"];
const MAX_MB = 8;

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Formato no soportado. Usa: ${ACCEPTED.join(", ")}`;
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera ${MAX_MB} MB.`;
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const err = validate(file);
    if (err) { setError(err); return; }
    setError("");
    onFile(file);
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-12 text-center transition-all cursor-pointer
          ${dragging ? "border-andes-clay bg-andes-clay/5" : "border-deep-forest/15 bg-card hover:border-andes-clay/50 hover:bg-andes-clay/3"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className={`size-16 rounded-[20px] flex items-center justify-center transition-colors
          ${dragging ? "bg-andes-clay/15" : "bg-sunlight group-hover:bg-andes-clay/10"}`}>
          {dragging ? (
            <FileText className="size-7 text-andes-clay" />
          ) : (
            <Upload className="size-7 text-andes-clay/70 group-hover:text-andes-clay" />
          )}
        </div>
        <div>
          <p className="font-semibold text-deep-forest text-sm">
            {dragging ? "Suelta el archivo aquí" : "Arrastra tu material aquí"}
          </p>
          <p className="text-deep-forest/50 text-xs mt-1">o haz clic para seleccionar</p>
          <p className="text-deep-forest/35 text-xs mt-2">{ACCEPTED.join(" · ")} · máx. {MAX_MB} MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Crear ArchivoCard**

```tsx
// src/components/edu/ArchivoCard.tsx
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
            variant="ghost" size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl text-xs text-deep-forest/50 hover:text-deep-forest gap-1"
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {expanded ? "Ocultar" : "Revisar"}
          </Button>
          <Button
            variant="ghost" size="sm"
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/edu/Dropzone.tsx src/components/edu/ArchivoCard.tsx
git commit -m "feat: componentes Dropzone y ArchivoCard con panel editable plegable"
```

---

### Task 6: Agregar /api/extract al backend

**Files:**
- Modify: `backend/server.js`

- [ ] **Step 1: Agregar import de multer y extractores al inicio de server.js**

Agrega justo después de `import OpenAI from "openai";`:

```js
import multer from "multer";
import mammoth from "mammoth";
import { getTextFromPDF } from "unpdf";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});
```

- [ ] **Step 2: Agregar endpoint POST /api/extract antes del GET /api/health**

```js
// POST /api/extract
app.post("/api/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });

  const { originalname, mimetype, buffer, size } = req.file;
  const ext = originalname.split(".").pop()?.toLowerCase();

  try {
    let text = "";

    if (ext === "pdf") {
      const pdf = await getTextFromPDF(new Uint8Array(buffer));
      text = pdf.text ?? pdf.content ?? "";
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // .txt and .md
      text = buffer.toString("utf-8");
    }

    text = text.trim();
    res.json({ text, chars: text.length, filename: originalname, size });
  } catch (err) {
    console.error("Error extrayendo texto:", err?.message);
    res.status(500).json({ error: "No se pudo extraer el texto del archivo.", detail: err?.message });
  }
});
```

- [ ] **Step 3: Verificar que el servidor arranca sin errores**

```bash
cd /home/javier1308/Documents/edu-assistant-ai/backend
node --env-file=.env server.js
```

Expected en consola: `Backend Edu escuchando en http://0.0.0.0:3001`

- [ ] **Step 4: Probar el endpoint manualmente con un archivo de prueba**

```bash
echo "Hola, este es un texto de prueba" > /tmp/prueba.txt
curl -s -X POST http://localhost:3001/api/extract \
  -F "file=@/tmp/prueba.txt" | jq .
```

Expected: `{ "text": "Hola...", "chars": 33, "filename": "prueba.txt", "size": 34 }`

- [ ] **Step 5: Commit**

```bash
git add backend/server.js
git commit -m "feat: endpoint POST /api/extract con soporte PDF, DOCX, TXT, MD"
```

---

### Task 7: Crear MejoradorForm — tab "Mejorar material"

**Files:**
- Create: `src/components/edu/MejoradorForm.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/edu/MejoradorForm.tsx
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
        {!archivo && (
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
          </>
        )}

        {archivo && (
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

        {!archivo && !uploading && (
          <div className="flex items-start gap-2 text-xs text-deep-forest/40 px-1">
            <MessagesSquare className="size-3.5 shrink-0 mt-0.5" />
            Adjunta tu material para recibir retroalimentación pedagógica alineada al CNEB.
          </div>
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
```

- [ ] **Step 2: Agregar instrucción "mejora" al backend en INSTRUCCIONES_TIPO**

En `backend/server.js`, dentro del objeto `INSTRUCCIONES_TIPO`, agregar:

```js
  mejora: `Analiza el material educativo adjunto y proporciona RETROALIMENTACIÓN PEDAGÓGICA con:
1. **Resumen del material** — qué es y qué propósito tiene
2. **Fortalezas** — qué está bien logrado pedagógicamente
3. **Oportunidades de mejora** — aspectos específicos a mejorar con justificación
4. **Alineación al CNEB** — qué competencias y capacidades aborda (o debería abordar)
5. **Recomendaciones concretas** — al menos 3 sugerencias accionables
6. **Tabla resumen** — fortaleza / área de mejora / prioridad (alta/media/baja)`,
```

- [ ] **Step 3: Commit**

```bash
git add src/components/edu/MejoradorForm.tsx backend/server.js
git commit -m "feat: MejoradorForm con dropzone, extracción y retroalimentación pedagógica"
```

---

### Task 8: Refactorizar Generador.tsx con tabs

**Files:**
- Modify: `src/pages/Generador.tsx`

Reemplazar todo el contenido por la versión con tabs usando shadcn/ui `Tabs`.

- [ ] **Step 1: Reemplazar Generador.tsx**

```tsx
// src/pages/Generador.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, MessagesSquare, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/edu/Navbar";
import Footer from "@/components/edu/Footer";
import { GeneradorForm } from "@/components/edu/GeneradorForm";
import { MejoradorForm } from "@/components/edu/MejoradorForm";

export default function Generador() {
  return (
    <div className="min-h-screen bg-warm-sand text-deep-forest flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 md:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-deep-forest/60 hover:text-deep-forest mb-8 transition-colors"
        >
          <ArrowLeft className="size-4" /> Volver al inicio
        </Link>

        <div className="mb-8">
          <span className="text-xs font-semibold text-andes-clay uppercase tracking-widest">
            Asistente pedagógico
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-serif font-medium leading-[1.1] text-deep-forest">
            Material <span className="italic text-andes-clay">alineado al CNEB</span>
          </h1>
          <p className="mt-4 text-deep-forest/65 max-w-[60ch] leading-relaxed">
            Genera recursos desde cero o sube tu material existente para recibir
            retroalimentación pedagógica basada en el currículo nacional.
          </p>
        </div>

        <Tabs defaultValue="generar" className="space-y-8">
          <TabsList className="bg-card border border-deep-forest/8 rounded-2xl p-1 h-auto gap-1 shadow-soft">
            <TabsTrigger
              value="generar"
              className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-andes-clay data-[state=active]:text-white data-[state=active]:shadow-clay flex items-center gap-2 transition-all"
            >
              <Sparkles className="size-4" /> Generar recurso
            </TabsTrigger>
            <TabsTrigger
              value="mejorar"
              className="rounded-xl px-5 py-2.5 text-sm font-medium data-[state=active]:bg-deep-forest data-[state=active]:text-warm-sand data-[state=active]:shadow-soft flex items-center gap-2 transition-all"
            >
              <MessagesSquare className="size-4" /> Mejorar material
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generar" className="mt-0">
            <GeneradorForm />
          </TabsContent>

          <TabsContent value="mejorar" className="mt-0">
            <MejoradorForm />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Generador.tsx
git commit -m "refactor: Generador.tsx usa tabs Generar/Mejorar con componentes extraídos"
```

---

### Task 9: Push final y verificar deploy

**Files:** ninguno nuevo

- [ ] **Step 1: Push a main**

```bash
git push origin main
```

- [ ] **Step 2: Verificar health del backend en Railway**

```bash
curl -s https://edu-ai-production-0113.up.railway.app/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Verificar que los tabs funcionan en Vercel**

Abrir `https://edu-ai-neon.vercel.app/generador` y confirmar:
- Tab "Generar recurso" muestra el formulario con 6 campos
- Tab "Mejorar material" muestra el dropzone con mensaje "Adjunta tu material"
- El output renderiza Markdown con tablas y listas correctamente
