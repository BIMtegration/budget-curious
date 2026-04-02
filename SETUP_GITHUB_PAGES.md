# Budget Viewer - Configuración para GitHub Pages

## Pasos para publicar tu aplicación en GitHub Pages

### 1. Crear una cuenta en GitHub (si no tienes)
- Ve a https://github.com
- Crea una cuenta gratuita

### 2. Crear un repositorio

**Opción A: Para tu sitio personal (recomendado)**
1. Crea un nuevo repositorio llamado exactamente: `tu-usuario.github.io`
   - Reemplaza `tu-usuario` con tu nombre de usuario de GitHub
2. Hace el repositorio **público**
3. NO necesitas habilitar Pages (se activa automáticamente)
4. Tu sitio estará en: `https://tu-usuario.github.io`

**Opción B: Para un repositorio específico**
1. Crea un nuevo repositorio llamado `budget-viewer`
2. Hace el repositorio **público**
3. Ve a Settings → Pages
4. En "Source", selecciona la rama "main"
5. Tu sitio estará en: `https://tu-usuario.github.io/budget-viewer`

### 3. Subir los archivos

**Usando Git (recomendado)**
```bash
# Clone el repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

# Copia estos archivos:
# - index.html
# - styles.css
# - app.js
# - README.md

# Agrega los archivos
git add .

# Commit
git commit -m "Agregar Budget Viewer"

# Push
git push origin main
```

**Usando la interfaz web**
1. Ve a tu repositorio en GitHub
2. Haz clic en "Add file" → "Upload files"
3. Copia y pega los archivos
4. Haz clic en "Commit changes"

### 4. Verificar que funciona

- Espera 1-2 minutos
- Ve a la URL de tu sitio
- Si ves la página, ¡está funcionando! 🎉

## Solución de problemas

### "File not found" o página blanca
- Verifica que seas propietario del repositorio
- Revisa que los archivos estén en la rama principal
- Espera unos minutos más (a veces tarda)
- Recarga la página (Ctrl+F5)

### Los archivos están pero no se ven
- Asegúrate de que el archivo se llame exactamente `index.html` (minúsculas)
- Verifica que sea un repositorio **público**
- En Settings → Pages, confirma que "Branch" sea "main" o "master"

### Editar la aplicación
1. Ve al archivo que quieres editar (ej: styles.css)
2. Haz clic en el botón de lápiz (Edit)
3. Realiza los cambios
4. Haz clic en "Commit changes"
5. Los cambios aparecerán en 1-2 minutos (refresca sin caché: Ctrl+F5)

## Personalización rápida

### Cambiar el nombre del sitio
En `index.html`, línea 6:
```html
<title>Budget Viewer - Visualizador de Presupuestos</title>
```

### Cambiar los colores
En `styles.css`, busca:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Y reemplaza los códigos de color (son hexadecimales)

### Cambiar el idioma a inglés
Edita `index.html` y `app.js` y traduce los textos

## Seguridad

- ✅ Tu aplicación funciona 100% en el navegador
- ✅ Los archivos que subes NO se guardan en servidores
- ✅ No envía datos a ningún lado
- ✅ Puedes descargar y usar offline descargando los archivos

## Tips

1. **Copia de seguridad**: Guarda una copia local de tus archivos
2. **Uso offline**: Puedes descargar los archivos y abrirlos localmente
3. **Comparte el enlace**: La URL es tu herramienta, comparte con tu equipo
4. **Colaboración**: Invita colaboradores al repo para que editen juntos

## ¿Necesitas ayuda?

- **Documentación de GitHub Pages**: https://pages.github.com/
- **Markdown cheatsheet**: https://guides.github.com/features/mastering-markdown/
- **Contacta al desarrollador**: Abre un issue en el repositorio

---

¡Listo! Tu aplicación estará en línea en unos minutos 🚀
