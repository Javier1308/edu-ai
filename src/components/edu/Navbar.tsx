import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8 py-6">
    <Link to="/" className="flex items-center gap-2">
      <div className="size-10 rounded-2xl bg-andes-clay flex items-center justify-center">
        <div className="size-5 rounded-full border-2 border-warm-sand/50" />
      </div>
      <span className="text-2xl font-serif font-semibold tracking-tight text-deep-forest">Edu</span>
    </Link>
    <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-deep-forest/80">
      <a href="#funciona" className="hover:text-deep-forest transition-colors">Cómo funciona</a>
      <a href="#caracteristicas" className="hover:text-deep-forest transition-colors">Características</a>
      <a href="#para-quien" className="hover:text-deep-forest transition-colors">Para docentes</a>
      <Link to="/generador" className="hover:text-deep-forest transition-colors text-andes-clay font-semibold">
        Generador IA
      </Link>
    </div>
    <div className="flex items-center gap-3">
      <Link to="/generador">
        <Button className="bg-deep-forest text-warm-sand hover:bg-deep-forest/90 rounded-full px-6 py-5 text-[15px] font-medium shadow-soft">
          Prueba gratuita
        </Button>
      </Link>
    </div>
  </nav>
);

export default Navbar;
