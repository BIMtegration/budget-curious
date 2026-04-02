# 🎯 Guía Rápida de Budget Viewer

## Inicio Rápido en 5 pasos

### 1️⃣ Abre la aplicación
- Accede a: `https://tu-usuario.github.io` (o donde la subas)
- Verás la interfaz principal con el área de carga

### 2️⃣ Carga tu presupuesto
```
Paso 1: Haz clic en "Seleccionar archivo Excel"
Paso 2: Escoliza tu archivo .xlsx o .xls
Paso 3: La aplicación cargará automáticamente
```

### 3️⃣ Navega entre hojas
- En el panel izquierdo verás todas las hojas disponibles:
  - ✏️ = Hoja modificada
  - Sin símbolo = Hoja sin cambios

### 4️⃣ Edita las notas
```
Haz clic en cualquier celda amarilla con icono ✎
Se abrirá un cuadro de diálogo donde puedes:
- Ver el nombre de la columna
- Escribir/editar el contenido
- Hace clic en "Guardar"
```

### 5️⃣ Descarga los cambios
```
Bouton "💾 Descargar Excel"
Se descargará un nuevo archivo con:
- Nombre: Presupuesto_FECHA_HORA.xlsx
- Todos tus cambios guardados
```

---

## 🔍 Búsqueda de ítemes

**En la barra superior:**
1. Escribe texto en "Buscar en la tabla..."
2. La tabla se filtrará automáticamente
3. Borra el texto para ver todos los registros

**Ejemplos de búsqueda:**
- Por código: `010101`
- Por descripción: `Retiro`
- Por cantidad: números
- Por valor: números con formato

---

## ✏️ Campos editables

**Por defecto puedes editar:**
- Observaciones
- Notas
- Marcar Adicional
- Descripción

**Se reconocen por:**
- Fondo amarillo
- Icono ✎ pequeño
- Tooltip al pasar el mouse

**Para editar otros campos:**
Edita `app.js`, línea ~16:
```javascript
const EDITABLE_COLUMNS = ['Observaciones', 'Notas', 'Tu_Campo_Aqui'];
```

---

## 📊 Casos de uso frecuentes

### Caso 1: Revisar y marcar ítemes adicionales
1. Carga el presupuesto
2. Ve a la hoja "BANDA_1C"
3. Busca los ítemes que necesitas
4. Haz clic en "Marcar Adicional"
5. Escribe "SI" o tu nota
6. Descarga el archivo

### Caso 2: Agregar observaciones a ítemes
1. Carga el presupuesto
2. Busca el ítem específico
3. Haz clic en "Observaciones"
4. Escribe tu nota (ej: "Cotizar por separado")
5. Descarga el archivo

### Caso 3: Actualizar presupuesto
1. Descarga el archivo anterior
2. Cárgalo de nuevo en la web
3. Haz los cambios necesarios
4. Descarga con los cambios

---

## 💡 Tips & Tricks

### Buscar y reemplazar rápido
```
1. Busca el texto que quieres
2. Edita la primera ocurrencia
3. Descarga y repite para otras
4. O usa Excel directamente para buscar/reemplazar múltiples
```

### Trabajar con tablas grandes
- La app soporta 10,000+ filas
- La búsqueda hace la navegación más rápida
- Usa Ctrl+F en tu navegador para búsqueda rápida

### Comparar versiones
1. Ten dos archivos abiertos en navegadores diferentes
2. O descarga dos versiones y compara en Excel

### Descargar sin cambios
- Simplemente hace clic en "Descargar Excel"
- Genera una copia sin cambios (útil para backup)

---

## ⚠️ Importante

### Datos seguros?
✅ **SÍ - 100% seguro:** Todos los datos se procesan en tu navegador, no se envían a servidores.

### ¿Se pierden los cambios?
- Si cierras la página SIN descargar, se pierden
- **Siempre descarga cuando termines**
- El botón "Descargar" guarda los cambios en un archivo

### Navegadores soportados
✅ Chrome, Firefox, Safari, Edge
❌ Internet Explorer (demasiado viejo)

### Tamaño máximo de archivo
- Depende de tu navegador y RAM
- Típicamente: 100-500 MB
- Para archivos más grandes: usa Excel directamente

---

## 🤔 Preguntas frecuentes

**P: ¿Puedo editar cualquier celda?**
R: Solo las columnas marcadas (con fondo amarillo). Para editar otras, usa Excel directamente.

**P: ¿Se guardan los cambios automáticamente?**
R: No, debes hacer clic en "Descargar Excel" para guardar.

**P: ¿Puedo descargar múltiples veces?**
R: Sí, cada descarga genera un nuevo archivo con timestamp.

**P: ¿Qué pasa con las fórmulas de Excel?**
R: Se conservan al descargar, pero la app no las ejecuta (solo Excel lo hace).

**P: ¿Funciona offline?**
R: Sí, una vez cargado el archivo en la memoria. Puedes estar sin internet.

**P: ¿Puedo usar en móvil?**
R: Parcialmente. La interfaz es responsive pero editar es más difícil en móvil.

---

## 🚀 Próximos pasos

- Personaliza el tema (colores, nombre)
- Agrega más campos editables
- Comparte el enlace con tu equipo
- Usa como herramienta central de revisión

---

**¿Necesitas ayuda?**
Revisa el README.md o contacta al desarrollador 💬

Disfruta visualizando tus presupuestos de forma fácil 📊✨
