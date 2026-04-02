// Estado global
let workbook = null;
let currentSheet = null;
let currentData = null;
let editingCell = null;

// Configuración
const CONFIG = {
    SHEETS_TO_SHOW: ['BANDA_1C', 'AJUSTE ANEXO 1C'],  // Nombres de hojas compatibles (2026 y 2025 en adelante)
    SKIP_ROWS: 7,                                       // Número de filas de encabezado a saltar
};

// Columnas que se consideran "editables" (notas/observaciones)
const EDITABLE_COLUMNS = ['Observaciones', 'Notas', 'Marcar Adicional', 'Descripción'];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('downloadBtn').addEventListener('click', downloadExcel);
    document.getElementById('refreshBtn').addEventListener('click', reloadCurrentSheet);
    document.getElementById('searchInput').addEventListener('input', filterTable);
});

// ===== CARGA DE ARCHIVO =====
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });
            
            // Buscar la hoja compatible
            let foundSheet = null;
            for (let sheetName of CONFIG.SHEETS_TO_SHOW) {
                if (workbook.SheetNames.includes(sheetName)) {
                    foundSheet = sheetName;
                    break;
                }
            }
            
            if (!foundSheet) {
                alert(`⚠️ No se encontró ninguna de las hojas esperadas.\n\nBuscando: ${CONFIG.SHEETS_TO_SHOW.join(', ')}\n\nHojas disponibles: ${workbook.SheetNames.join(', ')}`);
                return;
            }
            
            // Mostrar información del archivo
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileInfo').style.display = 'block';
            
            // Habilitar botones
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('refreshBtn').disabled = false;
            
            // Ocultar lista de hojas (solo mostramos una)
            document.getElementById('sheetsList').parentElement.style.display = 'none';
            
            // Cargar la hoja encontrada
            currentSheet = foundSheet;
            loadSheet(currentSheet);
        } catch (error) {
            alert('Error al cargar el archivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// ===== NAVEGACIÓN DE HOJAS =====
function renderSheetsList() {
    const sheetsList = document.getElementById('sheetsList');
    sheetsList.innerHTML = '';
    
    workbook.SheetNames.forEach(sheetName => {
        const btn = document.createElement('button');
        btn.className = 'sheet-btn';
        if (sheetName === currentSheet) btn.classList.add('active');
        btn.textContent = sheetName;
        btn.onclick = () => {
            document.querySelectorAll('.sheet-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSheet = sheetName;
            loadSheet(sheetName);
        };
        sheetsList.appendChild(btn);
    });
}

function loadSheet(sheetName) {
    try {
        const worksheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: ''
        });
        
        // Saltar las filas de encabezado configuradas
        if (CONFIG.SKIP_ROWS > 0 && jsonData.length > CONFIG.SKIP_ROWS) {
            jsonData = jsonData.slice(CONFIG.SKIP_ROWS);
        }
        
        currentData = jsonData;
        
        // Actualizar información
        const rowCount = jsonData.length - 1;
        const colCount = jsonData[0]?.length || 0;
        document.getElementById('toolbarInfo').textContent = 
            `📄 ${sheetName} | 📊 ${rowCount} filas de datos | 📋 ${colCount} columnas`;
        
        // Renderizar tabla
        renderTable(jsonData);
    } catch (error) {
        alert('Error al cargar la hoja: ' + error.message);
    }
}

// ===== RENDERIZAR TABLA =====
function renderTable(data) {
    const container = document.getElementById('tableContainer');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Esta hoja está vacía</p></div>';
        return;
    }
    
    // Crear tabla
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Detectar número de columnas del header (primera fila no vacía)
    const headerData = data[0] || [];
    const colCount = headerData.length;
    
    for (let i = 0; i < colCount; i++) {
        const th = document.createElement('th');
        th.textContent = headerData[i] || `Col ${i + 1}`;
        headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx] || [];
        const tr = document.createElement('tr');
        
        for (let colIdx = 0; colIdx < colCount; colIdx++) {
            const td = document.createElement('td');
            const cellValue = row[colIdx] !== undefined ? row[colIdx] : '';
            const colName = headerData[colIdx] || `Col ${colIdx + 1}`;
            
            // Verificar si es editable
            const isEditable = EDITABLE_COLUMNS.some(col => 
                colName.toLowerCase().includes(col.toLowerCase())
            );
            
            if (isEditable) {
                td.className = 'editable-cell';
                td.title = 'Haz clic para editar';
                td.onclick = () => openEditModal(rowIdx, colIdx, colName, cellValue);
            }
            
            // Mostrar valor
            td.textContent = cellValue || '';
            
            // Limitar longitud visual
            if (td.textContent.length > 100) {
                td.textContent = td.textContent.substring(0, 100) + '...';
            }
            
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

// ===== EDICIÓN DE CELDAS =====
function openEditModal(rowIdx, colIdx, colName, value) {
    editingCell = { rowIdx, colIdx, colName };
    document.getElementById('editColName').textContent = colName;
    document.getElementById('editInput').value = value || '';
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editInput').focus();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingCell = null;
}

function saveEdit() {
    if (!editingCell) return;
    
    const newValue = document.getElementById('editInput').value;
    const { rowIdx, colIdx } = editingCell;
    
    // Actualizar datos en memoria
    if (!currentData[rowIdx]) {
        currentData[rowIdx] = [];
    }
    currentData[rowIdx][colIdx] = newValue;
    
    // Cerrar modal y recargar tabla
    closeEditModal();
    renderTable(currentData);
}

// Cerrar modal con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEditModal();
});

// ===== BÚSQUEDA Y FILTRO =====
function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!currentData) return;
    
    const rows = document.querySelectorAll('.data-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach((row, idx) => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    if (visibleCount === 0 && currentData.length > 1) {
        // Mostrar mensaje de no encontrado
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="100" style="text-align: center; padding: 20px; color: #999;">No se encontraron resultados</td>';
        document.querySelector('.data-table tbody').appendChild(emptyRow);
    }
}

function reloadCurrentSheet() {
    if (currentSheet) {
        loadSheet(currentSheet);
    }
}

// ===== DESCARGA DE EXCEL =====
function downloadExcel() {
    if (!workbook || !currentData) {
        alert('No hay datos para descargar');
        return;
    }
    
    try {
        // Actualizar la hoja actual en el workbook con los datos modificados
        const ws = XLSX.utils.aoa_to_sheet(currentData);
        workbook.Sheets[currentSheet] = ws;
        
        // Generar nombre de archivo con fecha
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `Presupuesto_${dateStr}_${timeStr}.xlsx`;
        
        // Descargar
        XLSX.writeFile(workbook, filename);
    } catch (error) {
        alert('Error al descargar el archivo: ' + error.message);
    }
}

// ===== UTILIDADES =====
function getCellValue(rowIdx, colIdx) {
    if (!currentData || !currentData[rowIdx]) return '';
    return currentData[rowIdx][colIdx] || '';
}

function setCellValue(rowIdx, colIdx, value) {
    if (!currentData[rowIdx]) {
        currentData[rowIdx] = [];
    }
    currentData[rowIdx][colIdx] = value;
}
