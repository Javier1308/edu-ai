const steps = [
  {
    n: "01",
    title: "Cuéntale a Edu tu contexto",
    text: "Selecciona grado, área STEM, enfoque metodológico y necesidades particulares de tu aula.",
  },
  {
    n: "02",
    title: "Genera o sube tu material",
    text: "Crea recursos desde cero o carga sesiones existentes para recibir un análisis detallado.",
  },
  {
    n: "03",
    title: "Recibe retroalimentación",
    text: "Edu identifica fortalezas, brechas y entrega recomendaciones accionables con ejemplos.",
  },
  {
    n: "04",
    title: "Ajusta y lleva al aula",
    text: "Edita en segundos, descarga en PDF y aplica con la confianza del respaldo pedagógico.",
  },
];

const HowItWorks = () => (
  <section id="funciona" className="bg-sunlight/40 py-24">
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="max-w-2xl mb-16">
        <span className="text-xs font-semibold text-andes-clay uppercase tracking-widest">Cómo funciona</span>
        <h2 className="mt-4 text-4xl md:text-5xl font-serif font-medium leading-[1.1] text-deep-forest text-balance">
          De la planificación al aula en <span className="italic text-andes-clay">cuatro pasos.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s) => (
          <div key={s.n} className="bg-card rounded-3xl p-7 border border-deep-forest/5 shadow-soft hover:-translate-y-1 transition-transform">
            <div className="font-serif text-3xl text-andes-clay font-semibold mb-6">{s.n}</div>
            <h3 className="text-xl font-serif font-semibold text-deep-forest mb-3">{s.title}</h3>
            <p className="text-deep-forest/65 leading-relaxed text-sm">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
