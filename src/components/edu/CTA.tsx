import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import teacherHero from "@/assets/teacher-hero.jpg";

const CTA = () => (
  <section id="para-quien" className="mx-auto max-w-7xl px-6 md:px-8 py-24">
    <div className="relative overflow-hidden rounded-[40px] bg-deep-forest text-warm-sand p-10 md:p-16 grid lg:grid-cols-2 gap-12 items-center">
      <div className="absolute -top-20 -right-20 size-80 rounded-full bg-andes-clay/30 blur-3xl" aria-hidden />
      <div className="relative">
        <span className="text-xs font-semibold text-sunlight/80 uppercase tracking-widest">Para docentes STEM</span>
        <h2 className="mt-4 text-4xl md:text-5xl font-serif font-medium leading-[1.1] text-balance">
          Devuélvele a tu vocación las horas que la planificación te quita.
        </h2>
        <p className="mt-6 text-warm-sand/75 text-lg leading-relaxed max-w-[48ch]">
          Únete a los docentes que ya están diseñando clases más significativas con menos esfuerzo, alineadas a los estándares del MINEDU.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link to="/generador">
            <Button className="bg-andes-clay text-white hover:bg-andes-clay/90 px-8 py-6 rounded-2xl text-base font-medium shadow-clay">
              Empezar gratis
            </Button>
          </Link>
          <Button variant="outline" className="bg-transparent border-warm-sand/30 text-warm-sand hover:bg-warm-sand/10 hover:text-warm-sand px-8 py-6 rounded-2xl text-base font-medium">
            Ver demostración
          </Button>
        </div>
      </div>
      <div className="relative">
        <img
          src={teacherHero}
          alt="Docente peruana enseñando con apoyo de Edu"
          width={1024}
          height={1024}
          loading="lazy"
          className="rounded-3xl object-cover w-full h-[400px] shadow-2xl"
        />
      </div>
    </div>
  </section>
);

export default CTA;
