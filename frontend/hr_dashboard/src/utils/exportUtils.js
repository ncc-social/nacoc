import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file.
 * @param {Array<Object>} data - The raw dataset to export.
 * @param {Array<string>} columns - The list of keys (fields) to include in the export.
 * @param {string} filename - The name of the file to save (without extension).
 * @param {Object} columnMapping - Optional mapping of keys to friendly names (Key -> Friendly Name).
 */
export function exportToExcel(data, columns, filename = 'export', columnMapping = {}) {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // Filter data to include only selected columns and map to friendly names
    const filteredData = data.map(row => {
        const newRow = {};
        columns.forEach(col => {
            const headerName = columnMapping[col] || col;
            newRow[headerName] = row[col];
        });
        return newRow;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}
