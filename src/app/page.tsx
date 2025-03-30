"use client"
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [progress, setProgress] = useState<number>(0);
  const [suggestions, setSuggestions] = useState([
    { text: "Use meaningful variable names", isPositive: true },
    { text: "Avoid using var, use let or const instead", isPositive: true },
    { text: "Do not use inline styles", isPositive: false },
    { text: "Ensure proper indentation", isPositive: true },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [subFolders, setSubFolders] = useState([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      if (selectedFile.type === "application/zip" ||
        selectedFile.type === "application/x-zip-compressed" ||
        selectedFile.type === "multipart/x-zip") {
        setFile(selectedFile);
        setMessage("");
        handleUpload(selectedFile);
      } else {
        setMessage("Please select a ZIP file.");
      }
    }
  };
  const handleUpload = async (file: File) => {
    if (!file) {
      setMessage("No file selected.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload_file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log(JSON.stringify(data))
      setMessage(`Carga exitosa`);
      setSubFolders(data.structure);
    } catch (error) {
      setMessage("Carga erronea.");
    } finally {
      setUploading(false);
    }
  };
  const renderStructure = (structure: any, level = 0) => {
    return (
      <ul className="pl-4 border-l border-gray-300">
        {Object.entries(structure).map(([name, value]) => (
          <li key={name} className="mt-1">
            <span className={`font-semibold ${typeof value === "object" ? "text-blue-600" : "text-gray-600"}`}>
              {typeof value === "object" ? "📁" : "📄"} {name}
            </span>
            {typeof value === "object" && renderStructure(value, level + 1)}
          </li>
        ))}
      </ul>
    );
  };
  const handleDownload = async () => {
    if (!subFolders) {
      setMessage("No hay archivos categorizados.");
      return;
    }

    try {
      const response = await fetch("/api/download_zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorizedFiles: subFolders }),
      });

      const data = await response.json();
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl; // Inicia la descarga
      } else {
        setMessage("Error al generar el ZIP.");
      }
    } catch (error) {
      setMessage("Error en la descarga.");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-8">
      <div className="grid grid-cols-1 gap-8">
        {/* Sección de carga de archivos */}
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Subir archivo
          </label>
          {file && <p className="mt-4 text-gray-700">Archivo seleccionado: {file.name}</p>}

          {message}
          {uploading && <p>Cargando...</p>}

        </div>
        <button onClick={handleDownload} disabled={subFolders.length === 0} className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700">
          Descargar ZIP ordenado
        </button>
        
        {/* Sección de lista de sugerencias */}
        <div className="p-6 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Estructura del ZIP ordenado</h2>
          {subFolders && Object.keys(subFolders).length > 0 ? (
            renderStructure(subFolders)
          ) : (
            <p className="text-gray-500">No hay archivos cargados.</p>
          )}
        </div>


      </div>
    </div>
  );
}
