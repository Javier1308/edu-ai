import { BookOpen, Sprout, MessagesSquare, Lightbulb, FileSearch, Library } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    bg: "bg-sunlight",
    title: "Alineación curricular",
    text: "Cada recurso generado se mapea automáticamente a las capacidades y desempeños del Currículo Nacional.",
  },
  {
    icon: Sprout,
    bg: "bg-soft-leaf",
    title: "Contexto regional",
    text: "Ejemplos basados en la biodiversidad, geografía y realidad social de las regiones del Perú.",
  },
  {
    icon: MessagesSquare,
    bg: "bg-warm-sand border border-deep-forest/10",
    title: "Feedback pedagógico",
    text: "No solo genera; explica por qué ciertas actividades funcionan mejor para el pensamiento crítico.",
  },
  {
    icon: FileSearch,
    bg: "bg-soft-leaf",
    title: "Análisis de materiales",
    text: "Sube tus sesiones existentes y recibe diagnóstico con fortalezas, brechas y oportunidades.",
  },
  {
    icon: Lightbulb,
    bg: "bg-sunlight",
    title: "Recomendaciones accionables",
    text: "Propuestas concretas con ejemplos aplicados que puedes implementar en tu próxima clase.",
  },
  {
    icon: Library,
    bg: "bg-warm-sand border border-deep-forest/10",
    title: "Fuentes académicas",
    text: "Cada sugerencia viene respaldada con referencias pedagógicas validadas para que confíes en el resultado.",
  },
];

const Features = () => (
  <section id="caracteristicas" className="mx-auto max-w-7xl px-6 md:px-8 py-24">
    <div className="max-w-2xl mb-16">
      <span className="text-xs font-semibold text-andes-clay uppercase tracking-widest">Características</span>
      <h2 className="mt-4 text-4xl md:text-5xl font-serif font-medium leading-[1.1] text-deep-forest text-balance">
        Todo lo que necesitas para diseñar clases <span className="italic text-andes-clay">memorables.</span>
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
      {features.map((f) => (
        <div key={f.title} className="flex flex-col gap-4">
          <div className={`size-14 rounded-[20px] ${f.bg} flex items-center justify-center text-deep-forest`}>
            <f.icon className="size-6" />
          </div>
          <h3 className="text-xl font-serif font-semibold text-deep-forest">{f.title}</h3>
          <p className="text-deep-forest/65 leading-relaxed">{f.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
