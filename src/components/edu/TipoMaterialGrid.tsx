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
