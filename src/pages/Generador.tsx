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
