# 📦 Next.js File organizer

Este proyecto es una API en **Next.js con TypeScript** que permite subir, descomprimir y organizar archivos en categorías específicas, generando un archivo ZIP con la estructura organizada.

## 🚀 Características
- 📂 **Subida y descompresión de archivos** en la carpeta `uploads/unzipped`.
- 🏷 **Clasificación automática** de archivos en imágenes, videos, documentos y otros.
- 📦 **Generación de un ZIP** con la estructura organizada.
- 🗑 **Eliminación automática** de los archivos originales después de la compresión.

---

## 📌 Instalación

### 1️⃣ Clonar el repositorio:
```sh
git clone https://github.com/tomii-dev-fullstack/-file-organizer.git
cd -file-organizer
```

### 2️⃣ Instalar dependencias:
```sh
npm install
```

### 3️⃣ Ejecutar el servidor en desarrollo:
```sh
npm run dev
```

La API se ejecutará en **http://localhost:3000**.

---

## 📁 Estructura del proyecto
```
-file-organizer/
├── pages/
│   ├── api/
│   │   ├── upload_file.ts   # Endpoint para subir archivos
│   │   ├── download_zip.ts # Endpoint para generar y descargar el ZIP
│   ├── index.tsx       # Página principal (si aplica)
├── uploads/            # Carpeta donde se descomprimen los archivos
├── public/
│   ├── organized_files.zip # Archivo ZIP generado
│   ├── categorized_files.ts  # Función para clasificar archivos
├── README.md           # Documentación del proyecto
├── next.config.js      # Configuración de Next.js
├── tsconfig.json       # Configuración de TypeScript
├── package.json        # Dependencias y scripts
```

---

## 📌 Uso de la API

### 🔹 Subir un archivo comprimido
- **Método:** `POST`
- **URL:** `/api/upload_file`
- **Body:** `multipart/form-data`
- **Respuesta exitosa:** `{ message: "Archivo subido y descomprimido" }`

### 🔹 Descargar el archivo ZIP organizado
- **Método:** `POST`
- **URL:** `/api/download_zip`
- **Respuesta exitosa:** `{ message: "ZIP creado con éxito", downloadUrl: "/organized_files.zip" }`

---

## ⚙️ Configuración adicional
Si deseas cambiar las extensiones de archivos soportadas, edita `upload_file.ts` en la carpeta `src/pages/api`.

---

## 🛠 Tecnologías usadas
- **Next.js** 🚀
- **TypeScript** 🦾
- **Archiver.js** (para comprimir archivos ZIP)
- **Node.js File System (fs)** 📂

---

## 📜 Licencia
Este proyecto está bajo la licencia MIT. Puedes usarlo y modificarlo libremente.

---

## ✨ Autor
👨‍💻 Desarrollado por **Tomás Ruglio (https://github.com/tomii-dev-fullstack)**. ¡Contribuciones y mejoras son bienvenidas! 😊

