# 🍪 Cookie Crusher

Una extensión de Chrome simple y elegante para limpiar las cookies de cualquier sitio web.

![Cookie Crusher](https://img.shields.io/badge/Chrome-Extension-ff6b35?style=flat-square&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=flat-square)

## ✨ Características

- **Limpiar cookies del sitio actual**: Elimina solo las cookies del dominio que estás visitando
- **Limpiar TODAS las cookies**: Opción para eliminar todas las cookies de todos los sitios
- **Contador de cookies**: Muestra cuántas cookies tiene el sitio actual
- **Interfaz moderna**: Diseño oscuro con animaciones suaves

## 📦 Instalación

### Paso 1: Generar los iconos

1. Abre el archivo `icon-generator.html` en tu navegador
2. Haz clic en cada botón "Descargar" para obtener los 4 iconos
3. Mueve los archivos descargados a la carpeta `icons/`:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

### Paso 2: Cargar la extensión en Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el **"Modo desarrollador"** (esquina superior derecha)
3. Haz clic en **"Cargar descomprimida"**
4. Selecciona la carpeta `Cookies` (donde está este README)
5. ¡Listo! La extensión aparecerá en tu barra de herramientas

## 🎯 Uso

1. Navega a cualquier sitio web
2. Haz clic en el icono de Cookie Crusher en la barra de extensiones
3. Verás el dominio actual y cuántas cookies tiene
4. Haz clic en:
   - **"Limpiar cookies del sitio"** - Solo elimina las del sitio actual
   - **"Limpiar TODAS las cookies"** - Elimina cookies de TODOS los sitios (requiere confirmación)

## 📁 Estructura del proyecto

```
Cookies/
├── manifest.json        # Configuración de la extensión
├── popup.html          # Interfaz de usuario
├── popup.css           # Estilos
├── popup.js            # Lógica principal
├── icon-generator.html # Herramienta para generar iconos
├── README.md           # Este archivo
└── icons/              # Iconos de la extensión
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 🔒 Permisos

La extensión necesita los siguientes permisos:

- `cookies`: Para leer y eliminar cookies
- `activeTab`: Para obtener información de la pestaña actual
- `tabs`: Para acceder a la URL de la pestaña
- `<all_urls>`: Para poder acceder a las cookies de cualquier sitio

## 🛠️ Desarrollo

Esta extensión usa:
- **Manifest V3** (última versión de extensiones de Chrome)
- **Chrome Cookies API** para la gestión de cookies
- **CSS puro** con animaciones y diseño moderno
- **JavaScript vanilla** sin dependencias externas

## 📄 Licencia

MIT - Usa este código como quieras 🚀
