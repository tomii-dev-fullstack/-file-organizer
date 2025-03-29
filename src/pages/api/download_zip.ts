import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextApiRequest, NextApiResponse } from "next";
import { categorizeFiles } from "./upload_file"; // Importa la función correctamente

// Función para eliminar un directorio y su contenido de forma recursiva
function deleteFolderRecursive(folderPath: string) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const currentPath = path.join(folderPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolderRecursive(currentPath);
            } else {
                fs.unlinkSync(currentPath); // Eliminar archivo
            }
        });
        fs.rmdirSync(folderPath); // Eliminar carpeta vacía
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    try {
        const unzipPath = path.join(process.cwd(), "uploads/unzipped");
        const zipPath = path.join(process.cwd(), "public", "organized_files.zip");

        if (!fs.existsSync(unzipPath)) {
            return res.status(400).json({ message: "No se encontraron archivos descomprimidos." });
        }

        // Leer la estructura del directorio descomprimido
        const getFileStructure = (dir: string): Record<string, any> =>
            fs.readdirSync(dir).reduce((acc, item) => {
                const fullPath = path.join(dir, item);
                acc[item] = fs.statSync(fullPath).isDirectory() ? getFileStructure(fullPath) : fullPath;
                return acc;
            }, {} as Record<string, any>);

        const fileStructure = getFileStructure(unzipPath);

        // Categorizar archivos
        const categorizedFiles = categorizeFiles(fileStructure);

        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        archive.pipe(output);

        // Agregar archivos organizados en carpetas dentro del ZIP
        Object.entries(categorizedFiles).forEach(([category, files]) => {
            Object.entries(files).forEach(([fileName, filePath]) => {
                if (typeof filePath === "string") { // Aseguramos que filePath es un string
                    const fullFilePath = path.isAbsolute(filePath) ? filePath : path.join(unzipPath, filePath);
                    if (fs.existsSync(fullFilePath)) {
                        archive.file(fullFilePath, { name: `${category}/${fileName}` });
                    } else {
                        console.error(`Archivo no encontrado: ${fullFilePath}`);
                    }
                } else {
                    console.error(`Ruta no válida para ${fileName} en categoría ${category}:`, filePath);
                }
            });
        });


        // Finalizar ZIP y eliminar carpeta después de la descarga
        archive.finalize().catch((err) => {
            console.error("Error al finalizar la compresión: ", err);
            res.status(500).json({ message: "Error al generar el ZIP", error: err.message });
        });

        output.on("close", () => {
            console.log(`Archivo ZIP generado: ${zipPath}`);

            // **Eliminar la carpeta después de generar el ZIP**
            deleteFolderRecursive(unzipPath);

            res.status(200).json({
                message: "ZIP creado con éxito",
                downloadUrl: "/organized_files.zip",
            });
        });

        archive.on("error", (err) => {
            console.error("Error al generar el archivo ZIP:", err);
            res.status(500).json({ message: "Error al generar el ZIP", error: err.message });
        });

    } catch (error) {
        console.error("Error interno del servidor:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error });
    }
}
