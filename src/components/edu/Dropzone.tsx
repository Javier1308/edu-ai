import { useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

const ACCEPTED = [".txt", ".md", ".pdf", ".docx"];
const MAX_MB = 8;

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Formato no soportado. Usa: ${ACCEPTED.join(", ")}`;
    if (file.size > MAX_MB * 1024 * 1024) return `El archivo supera ${MAX_MB} MB.`;
    return null;
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const err = validate(file);
    if (err) { setError(err); return; }
    setError("");
    onFile(file);
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={`group relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-12 text-center transition-all cursor-pointer select-none
          ${dragging
            ? "border-andes-clay bg-andes-clay/5"
            : "border-deep-forest/15 bg-card hover:border-andes-clay/50 hover:bg-andes-clay/[0.03]"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className={`size-16 rounded-[20px] flex items-center justify-center transition-colors
          ${dragging ? "bg-andes-clay/15" : "bg-sunlight group-hover:bg-andes-clay/10"}`}>
          {dragging
            ? <FileText className="size-7 text-andes-clay" />
            : <Upload className="size-7 text-andes-clay/70 group-hover:text-andes-clay transition-colors" />
          }
        </div>
        <div>
          <p className="font-semibold text-deep-forest text-sm">
            {dragging ? "Suelta el archivo aquí" : "Arrastra tu material aquí"}
          </p>
          <p className="text-deep-forest/50 text-xs mt-1">o haz clic para seleccionar</p>
          <p className="text-deep-forest/35 text-xs mt-2">{ACCEPTED.join(" · ")} · máx. {MAX_MB} MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}
    </div>
  );
}
