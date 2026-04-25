import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import multer from "multer";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

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
  loadDoc(path.join(__dirname, "data", "programa-nivel-primaria-ebr.md"), MAX_PROGRAM_CHARS) +
  loadDoc(path.join(__dirname, "data", "norma-tecnica-para-el-ano-escolar-2026.md"), MAX_NORMA_CHARS);

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

const INSTRUCCIONES_TIPO = {
  sesion: `Genera una SESIÓN DE APRENDIZAJE completa con:
1. Título y propósito de aprendizaje
2. Competencias y capacidades del CNEB
3. Momentos: Inicio (motivación, saberes previos), Desarrollo (actividades principales), Cierre (reflexión, evaluación)
4. Materiales necesarios
5. Criterios de evaluación`,

  ficha: `Genera una FICHA DE EJERCICIOS con:
1. Título y datos (grado, área, tema)
2. Instrucciones claras
3. Mínimo 8 ejercicios variados (nivel básico, medio y avanzado)
4. Espacio para respuestas
5. Clave de respuestas al final`,

  ejemplos: `Genera EJEMPLOS Y CASOS con:
1. Explicación conceptual breve
2. Mínimo 5 ejemplos resueltos paso a paso
3. Ejemplos contextualizados a la realidad peruana (comunidades, mercados, naturaleza local)
4. Variación de dificultad progresiva
5. Errores comunes a evitar`,

  evaluacion: `Genera una EVALUACIÓN con:
1. Encabezado (nombre, grado, fecha, puntaje)
2. Instrucciones generales
3. Mínimo 10 preguntas variadas (opción múltiple, desarrollo, resolución de problemas)
4. Distribución de puntaje por pregunta
5. Rúbrica de evaluación alineada al CNEB`,

  actividades: `Genera un SET DE ACTIVIDADES con:
1. Objetivo de aprendizaje
2. Mínimo 5 actividades dinámicas y participativas
3. Para cada actividad: nombre, materiales, instrucciones paso a paso, tiempo estimado
4. Actividades que promuevan trabajo individual y colaborativo
5. Indicadores de logro por actividad`,

  mejora: `Analiza el material educativo adjunto y proporciona RETROALIMENTACIÓN PEDAGÓGICA con:
1. **Resumen del material** — qué es y qué propósito tiene
2. **Fortalezas** — qué está bien logrado pedagógicamente
3. **Oportunidades de mejora** — aspectos específicos a mejorar con justificación
4. **Alineación al CNEB** — qué competencias y capacidades aborda (o debería abordar)
5. **Recomendaciones concretas** — al menos 3 sugerencias accionables
6. **Tabla resumen** — fortaleza / área de mejora / prioridad (alta/media/baja)`,
};

// POST /api/generate
app.post("/api/generate", async (req, res) => {
  const { problematica, grado, area, duracion, tipoMaterial = "sesion" } = req.body;

  if (!problematica || problematica.trim().length < 5) {
    return res.status(400).json({ error: "El campo 'problematica' es requerido." });
  }

  const instruccion = INSTRUCCIONES_TIPO[tipoMaterial] ?? INSTRUCCIONES_TIPO.sesion;

  const userMessage = [
    grado ? `Grado: ${grado}` : null,
    area ? `Área curricular: ${area}` : null,
    duracion ? `Duración: ${duracion}` : null,
    `Tipo de material solicitado: ${tipoMaterial}`,
    `\n${instruccion}`,
    `\nTema o problemática del docente:\n${problematica.trim()}`,
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

// POST /api/extract
app.post("/api/extract", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo." });

  const { originalname, buffer, size } = req.file;
  const ext = originalname.split(".").pop()?.toLowerCase();

  try {
    let text = "";

    if (ext === "pdf") {
      text = await new Promise((resolve, reject) => {
        const parser = new PDFParser(null, 1);
        parser.on("pdfParser_dataReady", () => resolve(parser.getRawTextContent()));
        parser.on("pdfParser_dataError", reject);
        parser.parseBuffer(buffer);
      });
    } else if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf-8");
    }

    text = text.trim();
    res.json({ text, chars: text.length, filename: originalname, size });
  } catch (err) {
    console.error("Error extrayendo texto:", err?.message);
    res.status(500).json({ error: "No se pudo extraer el texto del archivo.", detail: err?.message });
  }
});

// GET /api/health
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend Edu escuchando en http://0.0.0.0:${PORT}`));
