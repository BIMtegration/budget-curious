// Estado global
let workbook = null;
let currentSheet = null;
let currentData = null;
let editingCell = null;
let currentViewKey = 'base';
let availableViews = [];
let dataStartCol = 0;

// Configuracion
const CONFIG = {
    SHEETS_TO_SHOW: ['BANDA_1C', 'AJUSTE ANEXO 1C'],
    SKIP_ROWS: 7,
    BASE_CONTRACT_COLS: 6,
    BUDGET_BLOCK_SIZE: 5,
    NOTES_BLOCK_SIZE: 2
};

// Columnas editables
const EDITABLE_COLUMNS = ['Observaciones', 'Notas', 'Marcar Adicional', 'Descripcion'];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('downloadBtn').addEventListener('click', downloadExcel);
    document.getElementById('refreshBtn').addEventListener('click', reloadCurrentSheet);
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEditModal();
    });
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });

            let foundSheet = null;
            for (const sheetName of CONFIG.SHEETS_TO_SHOW) {
                if (workbook.SheetNames.includes(sheetName)) {
                    foundSheet = sheetName;
                    break;
                }
            }

            if (!foundSheet) {
                alert(`No se encontro ninguna de las hojas esperadas.\n\nBuscando: ${CONFIG.SHEETS_TO_SHOW.join(', ')}\n\nHojas disponibles: ${workbook.SheetNames.join(', ')}`);
                return;
            }

            document.getElementById('fileName').textContent = file.name;
            document.getElementById('sheetCount').textContent = '1 (filtrada)';
            document.getElementById('fileInfo').style.display = 'block';

            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('refreshBtn').disabled = false;
            document.getElementById('sheetsList').parentElement.style.display = 'none';

            currentSheet = foundSheet;
            loadSheet(currentSheet);
        } catch (error) {
            alert('Error al cargar el archivo: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function loadSheet(sheetName) {
    try {
        const worksheet = workbook.Sheets[sheetName];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (CONFIG.SKIP_ROWS > 0 && jsonData.length > CONFIG.SKIP_ROWS) {
            jsonData = jsonData.slice(CONFIG.SKIP_ROWS);
        }

        currentData = jsonData;
        dataStartCol = detectDataStartCol(currentData);
        buildViews();
        currentViewKey = 'base';
        renderViewButtons();
        renderCurrentViewTable();
    } catch (error) {
        alert('Error al cargar la hoja: ' + error.message);
    }
}

function buildViews() {
    const headerData = currentData?.[0] || [];
    const totalCols = headerData.length;
    const baseStart = Math.min(dataStartCol, Math.max(0, totalCols - 1));
    const baseCols = range(baseStart, Math.min(baseStart + CONFIG.BASE_CONTRACT_COLS, totalCols));

    availableViews = [{ key: 'base', label: 'Contractual', extraCols: [] }];

    if (totalCols <= baseStart + CONFIG.BASE_CONTRACT_COLS) {
        return;
    }

    const remainingStart = baseStart + CONFIG.BASE_CONTRACT_COLS;
    const remainingCols = totalCols - remainingStart;
    const trailingNotesCols = detectTrailingNotesCols(headerData, remainingStart);
    const budgetCols = remainingCols - trailingNotesCols;

    let viewCounter = 1;
    for (let start = remainingStart; start < remainingStart + budgetCols; start += CONFIG.BUDGET_BLOCK_SIZE) {
        const endExclusive = Math.min(start + CONFIG.BUDGET_BLOCK_SIZE, remainingStart + budgetCols);
        availableViews.push({
            key: `budget-${viewCounter}`,
            label: `Actualizado ${viewCounter}`,
            extraCols: range(start, endExclusive)
        });
        viewCounter += 1;
    }

    if (trailingNotesCols > 0) {
        const notesStart = totalCols - trailingNotesCols;
        let noteCounter = 1;
        for (let start = notesStart; start < totalCols; start += CONFIG.NOTES_BLOCK_SIZE) {
            const endExclusive = Math.min(start + CONFIG.NOTES_BLOCK_SIZE, totalCols);
            availableViews.push({
                key: `notes-${noteCounter}`,
                label: `Notas ${noteCounter}`,
                extraCols: range(start, endExclusive)
            });
            noteCounter += 1;
        }
    }

    const viewContainer = document.getElementById('viewControls');
    viewContainer.style.display = availableViews.length > 1 ? 'flex' : 'none';
}

function detectTrailingNotesCols(headerData, startIdx) {
    const noteRegex = /(nota|observ)/i;
    let count = 0;
    for (let i = headerData.length - 1; i >= startIdx; i--) {
        const text = String(headerData[i] || '').trim();
        if (noteRegex.test(text)) {
            count += 1;
        } else {
            break;
        }
    }
    if (count > 0 && count % 2 !== 0) {
        count -= 1;
    }
    return count;
}

function renderViewButtons() {
    const container = document.getElementById('viewControls');
    container.innerHTML = '';

    availableViews.forEach((view) => {
        const btn = document.createElement('button');
        btn.className = `view-btn ${view.key === currentViewKey ? 'active' : ''}`;
        btn.textContent = view.label;
        btn.onclick = () => {
            currentViewKey = view.key;
            renderViewButtons();
            renderCurrentViewTable();
            filterTable();
        };
        container.appendChild(btn);
    });
}

function getVisibleColIndices() {
    const totalCols = currentData?.[0]?.length || 0;
    const baseStart = Math.min(dataStartCol, Math.max(0, totalCols - 1));
    const baseCols = range(baseStart, Math.min(baseStart + CONFIG.BASE_CONTRACT_COLS, totalCols));
    const view = availableViews.find((v) => v.key === currentViewKey);
    if (!view || view.key === 'base') {
        return baseCols;
    }
    return [...baseCols, ...view.extraCols];
}

function renderCurrentViewTable() {
    if (!currentData || currentData.length === 0) {
        const container = document.getElementById('tableContainer');
        container.innerHTML = '<div class="empty-state"><p>Esta hoja esta vacia</p></div>';
        return;
    }

    const visibleCols = getVisibleColIndices();
    const currentView = availableViews.find((v) => v.key === currentViewKey);
    const rowCount = Math.max(0, currentData.length - 1);
    document.getElementById('toolbarInfo').textContent =
        `${currentSheet} | ${rowCount} filas | ${visibleCols.length} columnas visibles | Vista: ${currentView ? currentView.label : 'Contractual'}`;

    renderTable(currentData, visibleCols);
}

function renderTable(data, visibleCols) {
    const container = document.getElementById('tableContainer');
    const headerData = data[0] || [];

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    visibleCols.forEach((actualColIdx) => {
        const th = document.createElement('th');
        th.textContent = headerData[actualColIdx] || `Col ${actualColIdx + 1}`;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx] || [];
        const tr = document.createElement('tr');

        visibleCols.forEach((actualColIdx) => {
            const td = document.createElement('td');
            const cellValue = row[actualColIdx] !== undefined ? row[actualColIdx] : '';
            const colName = headerData[actualColIdx] || `Col ${actualColIdx + 1}`;

            const isEditable = EDITABLE_COLUMNS.some((col) =>
                String(colName).toLowerCase().includes(col.toLowerCase())
            );

            if (isEditable) {
                td.className = 'editable-cell';
                td.title = 'Haz clic para editar';
                td.onclick = () => openEditModal(rowIdx, actualColIdx, colName, cellValue);
            }

            const text = String(cellValue || '');
            td.textContent = text.length > 100 ? `${text.substring(0, 100)}...` : text;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

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

    if (!currentData[rowIdx]) {
        currentData[rowIdx] = [];
    }
    currentData[rowIdx][colIdx] = newValue;

    closeEditModal();
    renderCurrentViewTable();
    filterTable();
}

function filterTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!currentData) return;

    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;

    tbody.querySelectorAll('.no-results-row').forEach((row) => row.remove());

    const rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;
    rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (!searchTerm || text.includes(searchTerm)) {
            row.style.display = '';
            visibleCount += 1;
        } else {
            row.style.display = 'none';
        }
    });

    if (searchTerm && visibleCount === 0 && currentData.length > 1) {
        const noResult = document.createElement('tr');
        noResult.className = 'no-results-row';
        noResult.innerHTML = '<td colspan="100" style="text-align:center;padding:20px;color:#999;">No se encontraron resultados</td>';
        tbody.appendChild(noResult);
    }
}

function reloadCurrentSheet() {
    if (currentSheet) {
        loadSheet(currentSheet);
    }
}

function downloadExcel() {
    if (!workbook || !currentData) {
        alert('No hay datos para descargar');
        return;
    }

    try {
        const ws = XLSX.utils.aoa_to_sheet(currentData);
        workbook.Sheets[currentSheet] = ws;

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        const filename = `Presupuesto_${dateStr}_${timeStr}.xlsx`;

        XLSX.writeFile(workbook, filename);
    } catch (error) {
        alert('Error al descargar el archivo: ' + error.message);
    }
}

function range(start, endExclusive) {
    const values = [];
    for (let i = start; i < endExclusive; i++) values.push(i);
    return values;
}

function detectDataStartCol(data) {
    if (!data || data.length === 0) return 0;

    const header = data[0] || [];
    for (let colIdx = 0; colIdx < header.length; colIdx++) {
        const headerValue = String(header[colIdx] || '').trim();
        if (headerValue !== '') return colIdx;
    }

    const sampleRows = Math.min(data.length, 40);
    const maxCols = Math.max(...data.slice(0, sampleRows).map((row) => (row ? row.length : 0)), 0);
    for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        for (let rowIdx = 1; rowIdx < sampleRows; rowIdx++) {
            const row = data[rowIdx] || [];
            const value = String(row[colIdx] || '').trim();
            if (value !== '') return colIdx;
        }
    }

    return 0;
}
