import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── OpenAI client ─────────────────────────────────────────────────────────────
const kimi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Load curricular context once at startup ───────────────────────────────────
// moonshot-v1-128k supports ~128k tokens (~500k chars). We load both docs but
// cap the program doc to ~80k chars to stay well within limits including prompt.
const MAX_PROGRAM_CHARS = 60_000;
const MAX_NORMA_CHARS = 15_000;

function loadDoc(filePath, maxChars) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const truncated = content.length > maxChars ? content.slice(0, maxChars) + "\n...[documento truncado]" : content;
    return `\n\n---\n### Documento: ${path.basename(filePath)}\n\n${truncated}`;
  } catch {
    console.warn(`No se pudo leer: ${filePath}`);
    return "";
  }
}

const curricularContext =
  loadDoc("/home/javier1308/Downloads/programa-nivel-primaria-ebr.md", MAX_PROGRAM_CHARS) +
  loadDoc("/home/javier1308/Downloads/norma-tecnica-para-el-ano-escolar-2026.md", MAX_NORMA_CHARS);

console.log(`Contexto curricular cargado: ${curricularContext.length} caracteres`);

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres Edu, un asistente pedagógico especializado para docentes del nivel primaria del Perú.
Tu función es generar material educativo alineado al Currículo Nacional de la Educación Básica (CNEB) y a la Norma Técnica del Año Escolar 2026 del MINEDU.

A continuación tienes los documentos curriculares oficiales como referencia:
${curricularContext}

Cuando el docente describa una problemática o necesidad, debes generar material educativo estructurado que incluya:
1. **Competencias y capacidades** del CNEB que se abordan
2. **Sesión de aprendizaje** con título, propósito, momentos (inicio, desarrollo, cierre) y duración estimada
3. **Actividades** concretas y contextualizadas a la realidad peruana
4. **Criterios de evaluación** o rúbrica básica
5. **Materiales** necesarios (priorizando recursos del entorno local)
6. **Recomendaciones pedagógicas** alineadas a la norma técnica 2026

Responde siempre en español. Sé claro, práctico y conciso. Usa formato Markdown.`;

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// POST /api/generate
app.post("/api/generate", async (req, res) => {
  const { problematica, grado, area, duracion } = req.body;

  if (!problematica || problematica.trim().length < 5) {
    return res.status(400).json({ error: "El campo 'problematica' es requerido." });
  }

  const userMessage = [
    grado ? `Grado: ${grado}` : null,
    area ? `Área curricular: ${area}` : null,
    duracion ? `Duración de sesión: ${duracion}` : null,
    `\nProblemática o necesidad del docente:\n${problematica.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    // Use streaming to avoid timeout on long responses
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await kimi.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Error Kimi API:", err?.message ?? err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error al contactar el modelo de IA.", detail: err?.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err?.message })}\n\n`);
      res.end();
    }
  }
});

// GET /api/health
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend Edu escuchando en http://localhost:${PORT}`));
