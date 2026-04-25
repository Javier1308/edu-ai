import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";
import teacherHero from "@/assets/teacher-hero.jpg";

const Hero = () => (
  <main className="mx-auto max-w-7xl px-6 md:px-8 pt-10 md:pt-16 pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
      <div className="lg:col-span-6 flex flex-col gap-8">
        <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-soft-leaf text-deep-forest/80 text-sm font-medium w-fit border border-deep-forest/10">
          <span className="size-2 rounded-full bg-andes-clay animate-pulse" />
          Alineado a estándares MINEDU
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.05] tracking-tight text-deep-forest text-balance">
          Más tiempo para <span className="italic text-andes-clay">inspirar</span>, menos tiempo planificando.
        </h1>

        <p className="text-lg text-deep-forest/70 max-w-[52ch] leading-relaxed">
          Edu es tu copiloto pedagógico en STEM. Genera, adapta y mejora sesiones de aprendizaje, rúbricas y
          materiales contextualizados con retroalimentación inmediata de IA — sin capacitación técnica.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
          <Link to="/generador">
            <Button className="bg-andes-clay text-white hover:bg-andes-clay/90 px-8 py-6 rounded-2xl text-base font-medium shadow-clay">
              Comenzar mi primera unidad
            </Button>
          </Link>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-deep-forest/50 uppercase tracking-widest">Construido para</span>
            <span className="text-deep-forest/70 font-medium">Docentes STEM del Perú</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 relative">
        <div className="absolute -inset-10 bg-sunlight rounded-[60px] -rotate-2 -z-10 opacity-80" aria-hidden />

        <div className="bg-card rounded-[32px] shadow-soft p-7 md:p-8 border border-deep-forest/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-semibold text-deep-forest">Unidad de Ciencia y Tecnología</h3>
              <p className="text-sm text-deep-forest/50">3.º de Secundaria · Sesión 04</p>
            </div>
            <div className="size-12 rounded-full bg-soft-leaf flex items-center justify-center text-deep-forest">
              <Sparkles className="size-5" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-warm-sand border border-deep-forest/5 flex gap-4">
              <div className="shrink-0 size-10 rounded-xl bg-card flex items-center justify-center font-bold text-andes-clay">1</div>
              <div>
                <p className="text-[11px] font-semibold text-deep-forest/40 uppercase tracking-wider mb-1">Tema</p>
                <p className="text-deep-forest font-medium text-sm">Energías renovables en los Andes peruanos</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 size-8 bg-andes-clay rounded-full flex items-center justify-center text-white shadow-clay">
                <Sparkles className="size-4" />
              </div>
              <div className="ml-4 p-5 rounded-2xl bg-card border-2 border-andes-clay/30 shadow-sm">
                <p className="text-sm italic text-deep-forest/80 mb-3 leading-relaxed">
                  "He ajustado el vocabulario para cumplir con la competencia 'Explica el mundo físico' del CNEB.
                  ¿Deseas incluir una práctica con materiales locales?"
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-soft-leaf rounded-full text-xs font-medium text-deep-forest">Ajustar a 45 min</span>
                  <span className="px-3 py-1 bg-soft-leaf rounded-full text-xs font-medium text-deep-forest">Agregar rúbrica</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-deep-forest/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-deep-forest/5 flex items-center justify-center">
                  <FileText className="size-4 text-deep-forest/60" />
                </div>
                <span className="font-medium text-sm text-deep-forest">Sesión_04_Final.pdf</span>
              </div>
              <button className="text-andes-clay font-semibold text-sm flex items-center gap-1 hover:underline">
                <Download className="size-4" /> Descargar
              </button>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 -right-2 md:-right-6 p-3 bg-sunlight border border-andes-clay/20 rounded-2xl shadow-soft flex items-center gap-3">
          <img
            src={teacherHero}
            alt="Docente usando Edu"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover border-2 border-card"
          />
          <div>
            <p className="text-[10px] font-bold text-deep-forest/50 uppercase tracking-widest">Prof. Gabriela</p>
            <p className="text-sm font-medium text-deep-forest">Ahorré 4 horas esta semana</p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default Hero;
