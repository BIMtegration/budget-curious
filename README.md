# Budget Viewer 📊

Visualizador web interactivo para archivos de presupuestos Excel. Permite cargar, visualizar, editar y descargar presupuestos de forma amigable.

## ✨ Características

- **Carga de archivos Excel**: Soporta archivos `.xlsx` y `.xls`
- **Navegación entre hojas**: Cambia fácilmente entre todas las hojas del presupuesto
- **Visualización limpia**: Tablas interactivas y fáciles de leer
- **Edición de notas**: Modifica campos de observaciones y notas directamente
- **Búsqueda y filtrado**: Encuentra rápidamente ítems específicos
- **Descarga actualizada**: Guarda los cambios en un nuevo archivo Excel
- **Interfaz responsive**: Funciona en desktop y dispositivos móviles

## 🚀 Cómo usar

1. Abre la página en tu navegador
2. Haz clic en **"Seleccionar archivo Excel"** para cargar tu presupuesto
3. Selecciona la hoja que deseas visualizar desde el menú lateral
4. Usa la búsqueda para encontrar ítems específicos
5. Haz clic en campos resaltados (notas/observaciones) para editar
6. Guarda los cambios haciendo clic en **"Descargar Excel"**

## 📋 Campos editables

Por defecto, estos campos son editables:
- Observaciones
- Notas
- Marcar Adicional
- Descripción

Para agregar más campos editables, modifica el array `EDITABLE_COLUMNS` en `app.js`.

## 🛠️ Instalación en GitHub Pages

### Opción 1: Forking (Recomendado)
1. Fork este repositorio
2. Renómbralo a `tu-usuario.github.io`
3. La aplicación estará disponible en `https://tu-usuario.github.io`

### Opción 2: Crear un repositorio nuevo
1. Crea un repositorio llamado `budget-viewer` en tu cuenta GitHub
2. Habilita GitHub Pages en Configuración → Pages
3. Sube los archivos (index.html, styles.css, app.js)
4. Accede a `https://tu-usuario.github.io/budget-viewer`

## 📁 Estructura de archivos

```
budget-viewer/
├── index.html      # Página principal
├── styles.css      # Estilos
├── app.js          # Lógica de la aplicación
└── README.md       # Este archivo
```

## 🔧 Personalización

Puedes personalizar la aplicación editando:

### Cambiar colores
En `styles.css`, busca y modifica:
```css
--primary-color: #667eea;
--secondary-color: #764ba2;
```

### Agregar más campos editables
En `app.js`, modifica:
```javascript
const EDITABLE_COLUMNS = [
    'Observaciones', 
    'Notas', 
    'Marcar Adicional', 
    'Descripción',
    'Tu_Campo_Aqui'  // Agrega aquí
];
```

### Cambiar el nombre del archivo descargado
En `app.js`, en la función `downloadExcel()`:
```javascript
const filename = `TU_NOMBRE_${dateStr}.xlsx`;
```

## 📦 Dependencias

- **SheetJS**: Para leer y escribir archivos Excel (CDN)
- Sin dependencias backend - funciona 100% en el navegador

## ⚠️ Limitaciones

- Los cambios se mantienen solo en memoria hasta descargar el archivo
- No se soportan macros de Excel
- Los formatos avanzados (colores, fuentes personalizadas) se conservan al descargar
- El tamaño máximo depende de tu navegador (usualmente hasta 500MB)

## 📝 Licencia

MIT - Úsalo libremente

## 💡 Próximas mejoras

- [ ] Agregar validación de datos
- [ ] Exportar a PDF
- [ ] Soporte para múltiples idiomas
- [ ] Historial de cambios
- [ ] Comparación de versiones

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

¿Problemas? Abre un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Navegador y versión
- Archivo de ejemplo (si es posible)

---

Disfruta visualizando tus presupuestos 🎉
