import { IncomingForm, File as FormidableFile } from 'formidable'; // Importación correcta
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper'; // Necesitamos unzipper para trabajar con archivos zip

// Configuración para deshabilitar el bodyParser de Next.js y permitir cargar archivos
export const config = {
  api: {
    bodyParser: false, // Necesario para manejar archivos
  },
};

// API Route para manejar el upload de archivo y obtener los nombres de las carpetas dentro de una carpeta interior dinámica
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const form = new IncomingForm();
  const uploadsDir = path.join(process.cwd(), 'tmp');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  form.keepExtensions = true; // Mantener las extensiones del archivo

  form.parse(req, async (err: any, fields: any, files: { [key: string]: FormidableFile | FormidableFile[] }) => {
    if (err) {
      return res.status(500).json({ message: 'Error al procesar el archivo', error: err });
    }

    // Si files.file es un array, seleccionamos el primer archivo
    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
    const uploadedFile = uploadedFiles[0]; // Tomamos el primer archivo si hay varios

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No se ha recibido un archivo válido.' });
    }

    // Verificar la extensión del archivo
    const validExtensions = ['.zip'];
    const fileExtension = path.extname(uploadedFile.originalFilename ?? '').toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return res.status(400).json({
        message: 'Tipo de archivo no permitido. Solo se permiten archivos .zip.',
      });
    }

    const filePath = uploadedFile.filepath;

    try {
      // Si el archivo es un ZIP, descomprimimos el archivo y obtenemos los nombres de las carpetas dentro de la carpeta interior
      if (fileExtension === '.zip') {
        const zipFolderPath = path.join(uploadsDir, 'unzipped', uploadedFile.originalFilename ?? '');
        if (!fs.existsSync(zipFolderPath)) {
          fs.mkdirSync(zipFolderPath, { recursive: true });
        }

        // Descomprimir el archivo .zip
        const zipFileStream = fs.createReadStream(filePath);
        const zipExtractStream = unzipper.Extract({ path: zipFolderPath });

        zipFileStream.pipe(zipExtractStream);


        zipExtractStream.on('close', async () => {
          try {
            // Obtener la estructura completa de carpetas y archivos dentro del ZIP descomprimido
            const directoryStructure = listDirectoryStructure(zipFolderPath);
            const categorizedStructure = categorizeFiles(directoryStructure);
            return res.status(200).json({
              message: 'Estructura de archivos obtenida exitosamente',
              structure: categorizedStructure
            });
          } catch (error) {
            return res.status(500).json({
              message: 'Error al leer la estructura del directorio',
              error: error
            });
          }
        });

        zipExtractStream.on('error', (error) => {
          return res.status(500).json({ message: 'Error al descomprimir el archivo ZIP', error: error.message });
        });

        return; // Terminamos el flujo aquí ya que estamos esperando la extracción
      }

      return res.status(400).json({ message: 'El archivo no es un ZIP válido.' });
    } catch (error) {
      return res.status(500).json({
        message: 'Error al procesar el archivo', error: error
      });
    }
  });
};
// Función para listar la estructura de carpetas y archivos de manera recursiva
const listDirectoryStructure = (dirPath: string): any => {
  const structure: any = {};

  const items = fs.readdirSync(dirPath);
  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      structure[item] = listDirectoryStructure(fullPath); // Recursión para subcarpetas
    } else {
      structure[item] = 'file'; // Marcamos como archivo
    }
  });

  return structure;
};



 type FileStructure = { [key: string]: string | FileStructure };

export interface CategorizedFiles {
  images: Record<string, string>;
  videos: Record<string, string>;
  documents: Record<string, string>;
  others: Record<string, string>;
}

export const categorizeFiles = (structure: FileStructure): CategorizedFiles => {
  const categorized: CategorizedFiles = {
    images: {},
    videos: {},
    documents: {},
    others: {},
  };

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
  const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'];

  const categorize = (obj: FileStructure, path = ''): void => {
    Object.entries(obj).forEach(([name, value]) => {
      const ext = name.split('.').pop()?.toLowerCase() || '';
      const fullPath = path ? `${path}/${name}` : name;

      if (typeof value === 'object') {
        // Si es una carpeta, recorrer recursivamente
        categorize(value, fullPath);
      } else {
        // Clasificar según la extensión del archivo
        if (imageExtensions.includes(`.${ext}`)) {
          categorized.images[name] = fullPath;
        } else if (videoExtensions.includes(`.${ext}`)) {
          categorized.videos[name] = fullPath;
        } else if (documentExtensions.includes(`.${ext}`)) {
          categorized.documents[name] = fullPath;
        } else {
          categorized.others[name] = fullPath;
        }
      }
    });
  };

  categorize(structure);
  return categorized;
};

