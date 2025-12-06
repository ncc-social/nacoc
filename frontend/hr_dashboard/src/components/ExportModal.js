import { exportToExcel } from '../utils/exportUtils.js';

export function createExportModal({ data, availableColumns, filename, onClose, columnMapping = {} }) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50';

    // Modal container
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full p-6 flex flex-col max-h-[90vh]';
    overlay.appendChild(modal);

    // Header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4';
    const title = document.createElement('h3');
    title.className = 'text-lg leading-6 font-medium text-gray-900';
    title.textContent = 'Export to Excel';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'text-gray-400 hover:text-gray-500 focus:outline-none';
    closeBtn.innerHTML = `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    };
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // Content - Field Selection
    const content = document.createElement('div');
    content.className = 'flex-1 overflow-y-auto mb-4';

    const desc = document.createElement('p');
    desc.className = 'text-sm text-gray-500 mb-3';
    desc.textContent = 'Select the columns you want to include in the export:';
    content.appendChild(desc);

    // Select All Toggle
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'flex items-center mb-3 pb-3 border-b border-gray-200';
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = true;
    toggleInput.className = 'h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded';
    toggleInput.id = 'export-select-all';

    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = 'export-select-all';
    toggleLabel.className = 'ml-2 block text-sm text-gray-900 font-medium';
    toggleLabel.textContent = 'Select All';

    toggleContainer.appendChild(toggleInput);
    toggleContainer.appendChild(toggleLabel);
    content.appendChild(toggleContainer);

    // Checkboxes container
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'grid grid-cols-1 sm:grid-cols-2 gap-2';

    const checkboxes = [];

    availableColumns.forEach(col => {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'flex items-start';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded mt-0.5';
        cb.value = col;
        cb.checked = true;
        cb.id = `export-col-${col}`;

        const lbl = document.createElement('label');
        lbl.htmlFor = `export-col-${col}`;
        lbl.className = 'ml-2 block text-sm text-gray-700 break-all';
        lbl.textContent = columnMapping[col] || col;

        fieldWrapper.appendChild(cb);
        fieldWrapper.appendChild(lbl);
        fieldsContainer.appendChild(fieldWrapper);
        checkboxes.push(cb);
    });
    content.appendChild(fieldsContainer);
    modal.appendChild(content);

    // Toggle Logic
    toggleInput.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        checkboxes.forEach(cb => cb.checked = isChecked);
    });

    // Footer - Actions
    const footer = document.createElement('div');
    footer.className = 'flex justify-end gap-3 pt-4 border-t border-gray-200';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onClose) onClose();
    };

    const exportBtn = document.createElement('button');
    exportBtn.className = 'inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pelorous-600 hover:bg-pelorous-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500';
    exportBtn.innerHTML = `
        <span id="export-btn-text">Export</span>
        <svg id="export-spinner" class="hidden ml-2 -mr-1 h-4 w-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    `;

    exportBtn.onclick = async () => {
        const selectedColumns = checkboxes.filter(cb => cb.checked).map(cb => cb.value);

        if (selectedColumns.length === 0) {
            alert('Please select at least one column to export.');
            return;
        }

        // Show spinner
        const spinner = exportBtn.querySelector('#export-spinner');
        const btnText = exportBtn.querySelector('#export-btn-text');
        spinner.classList.remove('hidden');
        btnText.textContent = 'Exporting...';
        exportBtn.disabled = true;

        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            exportToExcel(data, selectedColumns, filename, columnMapping);
            document.body.removeChild(overlay);
            if (onClose) onClose();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. See console for details.');
            spinner.classList.add('hidden');
            btnText.textContent = 'Export';
            exportBtn.disabled = false;
        }
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(exportBtn);
    modal.appendChild(footer);

    document.body.appendChild(overlay);
}
