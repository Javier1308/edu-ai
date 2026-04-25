const Footer = () => (
  <footer className="border-t border-deep-forest/10 py-12">
    <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-andes-clay" />
        <span className="font-serif font-semibold text-deep-forest">Edu para el Perú</span>
      </div>
      <p className="text-sm text-deep-forest/50 text-center">
        © {new Date().getFullYear()} Edu Pedagógico · Construido para los maestros que transforman el país.
      </p>
      <div className="flex gap-8 text-sm font-medium text-deep-forest/60">
        <a href="#" className="hover:text-andes-clay transition-colors">Privacidad</a>
        <a href="#" className="hover:text-andes-clay transition-colors">Términos</a>
        <a href="#" className="hover:text-andes-clay transition-colors">Soporte</a>
      </div>
    </div>
  </footer>
);

export default Footer;
