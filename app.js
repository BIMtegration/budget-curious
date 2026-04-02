// Estado global
let workbook = null;
let currentSheet = null;
let currentData = null;
let editingCell = null;
let currentViewKey = 'base';
let availableViews = [];
let dataStartCol = 0;
let mergedColumnGroups = [];
let baseColIndices = [];
let detailHeaderRowIdx = 0;

// Configuracion
const CONFIG = {
    SHEETS_TO_SHOW: ['BANDA_1C', 'AJUSTE ANEXO 1C'],
    SKIP_ROWS: 7,
    BASE_CONTRACT_COLS: 6,
    GROUP_HEADER_ROW: 8
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
        detailHeaderRowIdx = detectDetailHeaderRow(currentData);
        dataStartCol = detectDataStartCol(currentData, detailHeaderRowIdx);
        mergedColumnGroups = extractMergedGroups(worksheet, currentData);
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
    availableViews = [{ key: 'base', label: 'Contractual', extraCols: [] }];

    if (mergedColumnGroups.length > 0) {
        const contractualGroup = mergedColumnGroups.find((g) => /contractual/i.test(g.label)) || mergedColumnGroups[0];
        baseColIndices = range(contractualGroup.start, contractualGroup.end + 1);

        let groupCounter = 1;
        mergedColumnGroups.forEach((group) => {
            if (group.start === contractualGroup.start && group.end === contractualGroup.end) {
                return;
            }
            availableViews.push({
                key: `group-${groupCounter}`,
                label: normalizeGroupLabel(group.label, groupCounter),
                extraCols: range(group.start, group.end + 1)
            });
            groupCounter += 1;
        });
    } else {
        const baseStart = Math.min(dataStartCol, Math.max(0, totalCols - 1));
        baseColIndices = range(baseStart, Math.min(baseStart + CONFIG.BASE_CONTRACT_COLS, totalCols));
    }

    const viewContainer = document.getElementById('viewControls');
    viewContainer.style.display = availableViews.length > 1 ? 'flex' : 'none';
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
    const view = availableViews.find((v) => v.key === currentViewKey);
    if (!view || view.key === 'base') {
        return baseColIndices;
    }
    return [...baseColIndices, ...view.extraCols];
}

function renderCurrentViewTable() {
    if (!currentData || currentData.length === 0) {
        const container = document.getElementById('tableContainer');
        container.innerHTML = '<div class="empty-state"><p>Esta hoja esta vacia</p></div>';
        return;
    }

    const visibleCols = getVisibleColIndices();
    const currentView = availableViews.find((v) => v.key === currentViewKey);
    const rowCount = Math.max(0, currentData.length - (detailHeaderRowIdx + 1));
    document.getElementById('toolbarInfo').textContent =
        `${currentSheet} | ${rowCount} filas | ${visibleCols.length} columnas visibles | Vista: ${currentView ? currentView.label : 'Contractual'}`;

    renderTable(currentData, visibleCols);
}

function renderTable(data, visibleCols) {
    const container = document.getElementById('tableContainer');
    const headerData = data[detailHeaderRowIdx] || [];
    const baseSet = new Set(baseColIndices);

    const table = document.createElement('table');
    table.className = 'data-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    visibleCols.forEach((actualColIdx) => {
        const th = document.createElement('th');
        const colName = headerData[actualColIdx] || `Col ${actualColIdx + 1}`;
        th.textContent = colName;
        th.classList.add(baseSet.has(actualColIdx) ? 'group-base' : 'group-extra');
        if (isDescriptionColumn(colName)) {
            th.classList.add('description-col');
        } else {
            th.classList.add('content-fit-col');
        }
        if (isCurrencyColumn(colName)) {
            th.classList.add('currency-header');
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let rowIdx = detailHeaderRowIdx + 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx] || [];
        const tr = document.createElement('tr');

        visibleCols.forEach((actualColIdx) => {
            const td = document.createElement('td');
            const cellValue = row[actualColIdx] !== undefined ? row[actualColIdx] : '';
            const colName = headerData[actualColIdx] || `Col ${actualColIdx + 1}`;
            td.classList.add(baseSet.has(actualColIdx) ? 'group-base' : 'group-extra');
            const isDescription = isDescriptionColumn(colName);
            if (isDescription) {
                td.classList.add('description-col');
            } else {
                td.classList.add('content-fit-col');
            }

            const isEditable = EDITABLE_COLUMNS.some((col) =>
                String(colName).toLowerCase().includes(col.toLowerCase())
            );

            if (isEditable) {
                td.className = 'editable-cell';
                td.title = 'Haz clic para editar';
                td.onclick = () => openEditModal(rowIdx, actualColIdx, colName, cellValue);
            }

            if (isCurrencyColumn(colName)) {
                td.classList.add('currency-cell');
            }

            const text = formatCellDisplayValue(cellValue, colName);
            td.textContent = isDescription ? text : (text.length > 100 ? `${text.substring(0, 100)}...` : text);
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

function detectDataStartCol(data, headerRowIdx) {
    if (!data || data.length === 0) return 0;

    const header = data[headerRowIdx] || [];
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

function detectDetailHeaderRow(data) {
    if (!data || data.length === 0) return 0;

    const maxScanRows = Math.min(6, data.length);
    let bestIdx = 0;
    let bestScore = -1;

    for (let rowIdx = 0; rowIdx < maxScanRows; rowIdx++) {
        const row = data[rowIdx] || [];
        let score = 0;
        let nonEmpty = 0;

        row.forEach((cell) => {
            const text = String(cell || '').trim();
            if (text) {
                nonEmpty += 1;
                const upper = text.toUpperCase();
                if (upper.includes('ITEM')) score += 3;
                if (upper.includes('DESCRIP')) score += 2;
                if (upper.includes('UM')) score += 1;
                if (upper.includes('CANT')) score += 1;
                if (/V\/?R\.?\s*UNIT/.test(upper) || /VR\.?\s*UNIT/.test(upper)) score += 3;
                if (/V\/?R\.?\s*TOTAL/.test(upper) || /VR\.?\s*TOTAL/.test(upper)) score += 3;
            }
        });

        score += Math.min(nonEmpty, 8);
        if (score > bestScore) {
            bestScore = score;
            bestIdx = rowIdx;
        }
    }

    return bestIdx;
}

function extractMergedGroups(worksheet, data) {
    const merges = worksheet['!merges'] || [];
    const headerRowZeroBased = CONFIG.GROUP_HEADER_ROW - 1;
    const totalCols = (data?.[0] || []).length;
    const groups = merges
        .filter((m) => m.s.r === headerRowZeroBased && m.e.r === headerRowZeroBased)
        .map((m) => {
            const start = m.s.c;
            const end = m.e.c;
            const label = String((data?.[0] || [])[start] || '').trim();
            return {
                start,
                end,
                label
            };
        })
        .filter((g) => g.start < totalCols)
        .sort((a, b) => a.start - b.start);

    return groups;
}

function normalizeGroupLabel(label, fallbackIndex) {
    const clean = String(label || '').replace(/\s+/g, ' ').trim();
    if (!clean) return `Grupo ${fallbackIndex}`;
    return clean;
}

function formatCellDisplayValue(value, colName) {
    const raw = value === undefined || value === null ? '' : value;
    if (!isCurrencyColumn(colName)) {
        return String(raw);
    }

    const numeric = toNumber(raw);
    if (numeric === null) {
        return String(raw);
    }

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(numeric);
}

function isCurrencyColumn(colName) {
    const name = String(colName || '').toUpperCase();
    const isVrUnit = /V\/?R\.?\s*UNIT/.test(name) || /VR\.?\s*UNIT/.test(name);
    const isVrTotal = /V\/?R\.?\s*TOTAL/.test(name) || /VR\.?\s*TOTAL/.test(name);
    return isVrUnit || isVrTotal;
}

function isDescriptionColumn(colName) {
    const name = String(colName || '').toUpperCase();
    return name.includes('DESCRIP');
}

function toNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) return null;

    let normalized = trimmed.replace(/\$/g, '').replace(/\s/g, '');
    if (normalized.includes('.') && normalized.includes(',')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else if (normalized.includes(',') && !normalized.includes('.')) {
        normalized = normalized.replace(',', '.');
    } else {
        normalized = normalized.replace(/,/g, '');
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}
