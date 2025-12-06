import { createExportModal } from '../components/ExportModal.js';

export function Leaves() {
    const container = document.createElement('div');
    container.className = 'p-4 space-y-4';

    // --- Header & Tabs ---
    const headerContainer = document.createElement('div');
    headerContainer.className = 'flex flex-col gap-4';

    const topRow = document.createElement('div');
    topRow.className = 'flex flex-col sm:flex-row sm:items-center justify-between gap-4';

    const title = document.createElement('h1');
    title.className = 'text-xl font-bold text-gray-900';
    title.textContent = 'Leaves';
    topRow.appendChild(title);

    // Tabs (Matched to EmployeeDetails.js)
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'mb-3 border-b border-gray-200';

    const tabNav = document.createElement('nav');
    tabNav.className = '-mb-px flex space-x-4';
    tabNav.ariaLabel = 'Tabs';

    const tabBtnClass = 'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors';
    const activeTabClass = 'border-pelorous-500 text-pelorous-600';
    const inactiveTabClass = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

    const btnApplications = document.createElement('button');
    btnApplications.textContent = 'Leave Applications';
    btnApplications.className = `${tabBtnClass} ${activeTabClass}`;

    const btnReport = document.createElement('button');
    btnReport.textContent = 'Leave Report';
    btnReport.className = `${tabBtnClass} ${inactiveTabClass}`;

    tabNav.appendChild(btnApplications);
    tabNav.appendChild(btnReport);
    tabsContainer.appendChild(tabNav);

    headerContainer.appendChild(topRow);
    headerContainer.appendChild(tabsContainer);
    container.appendChild(headerContainer);

    // --- Content Area ---
    const contentArea = document.createElement('div');
    container.appendChild(contentArea);

    // --- State ---
    let activeTab = 'applications'; // 'applications' or 'report'
    const currentYear = new Date().getFullYear();

    // --- Leave Applications Logic ---
    let applicationsData = [];
    let applicationsFiltered = [];
    let applicationsLoading = false;
    let applicationsPage = 1;
    let applicationsPageSize = 10;
    let appYearFilter, appTypeFilter, appSearchInput;
    let appTbody, appPaginationContainer; // Direct references
    let appSelectedRows = new Set(); // Track selected row IDs (or indices if no ID)

    function getMonthName(monthNum) {
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[monthNum] || "";
    }

    function loadApplicationsData() {
        const year = appYearFilter ? appYearFilter.value : new Date().getFullYear();
        const query = new URLSearchParams({ year }).toString();

        applicationsLoading = true;
        renderApplicationsTableBody();

        console.log('Fetching leave applications...');
        fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_leave_applications?${query}`, {
            method: "GET",
            headers: { 'Accept': 'application/json' },
            credentials: "include"
        })
            .then(r => r.ok ? r.json() : Promise.reject('Network error'))
            .then(res => {
                applicationsData = Array.isArray(res.message) ? res.message : [];
                filterApplications(); // Filter will trigger render
                applicationsLoading = false;
                renderApplicationsTableBody();
            })
            .catch(err => {
                console.error("Error loading applications:", err);
                applicationsData = []; // No mock fallback requested for API failure, or keep empty
                applicationsFiltered = [];
                applicationsLoading = false;
                renderApplicationsTableBody();
            });
    }



    function filterApplications() {
        const selectedYear = parseInt(appYearFilter.value);
        const selectedType = appTypeFilter.value;
        const searchQuery = appSearchInput ? appSearchInput.value.toLowerCase() : '';

        applicationsFiltered = applicationsData.filter(item => {
            // API filters by year already, but we keep client side filter if needed or just rely on API reload
            // The API returns data for the requested year.
            // We can just filter by type and search query.

            const typeMatch = selectedType === 'All' || item.leave_type === selectedType;

            // Search all columns
            const name = (item.employee_name || '').toLowerCase();
            const type = (item.leave_type || '').toLowerCase();
            const reason = (item.reason || '').toLowerCase();
            const dates = `${item.from_date} ${item.to_date}`.toLowerCase();

            const searchMatch = !searchQuery ||
                name.includes(searchQuery) ||
                type.includes(searchQuery) ||
                reason.includes(searchQuery) ||
                dates.includes(searchQuery);

            return typeMatch && searchMatch;
        });

        applicationsPage = 1;
        appSelectedRows.clear(); // Clear selection on filter change
        renderApplicationsTableBody();
    }

    function renderApplicationsTable() {
        contentArea.innerHTML = '';

        // Controls
        const controls = document.createElement('div');
        controls.className = 'flex justify-end items-center gap-2 mb-4';

        // Year Filter
        appYearFilter = document.createElement('select');
        appYearFilter.className = 'block w-24 pl-2 pr-8 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md';
        for (let y = 2023; y <= currentYear; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            appYearFilter.appendChild(opt);
        }
        appYearFilter.addEventListener('change', loadApplicationsData);

        // Type Filter
        appTypeFilter = document.createElement('select');
        appTypeFilter.className = 'block w-32 pl-2 pr-8 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md';
        const types = ['All', 'Annual Leave - JD', 'Annual Leave - SD', 'Casual Leave', 'Compassionate Leave', 'Maternity Leave', 'Paternity Leave', 'Sick Leave', 'Examination Leave'];
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            appTypeFilter.appendChild(opt);
        });
        appTypeFilter.addEventListener('change', filterApplications);

        // Search Input
        appSearchInput = document.createElement('input');
        appSearchInput.type = 'text';
        appSearchInput.placeholder = 'Search applications...';
        appSearchInput.className = 'block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500';
        appSearchInput.addEventListener('input', filterApplications);

        controls.appendChild(appSearchInput);
        controls.appendChild(appYearFilter);
        controls.appendChild(appTypeFilter);

        // Selection Indicator
        const selectionIndicator = document.createElement('span');
        selectionIndicator.id = 'app-selection-count';
        selectionIndicator.className = 'text-xs text-gray-500 ml-2 hidden';
        controls.appendChild(selectionIndicator);

        // Export Button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-pelorous-600 hover:bg-pelorous-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500 ml-2';
        exportBtn.textContent = 'Export to Excel';
        exportBtn.onclick = () => {
            if (!applicationsFiltered || applicationsFiltered.length === 0) {
                alert('No data to export.');
                return;
            }

            // Determine data to export: Selected rows OR All filtered rows
            let dataToExport = applicationsFiltered;
            if (appSelectedRows.size > 0) {
                // Ensure we compare strings as IDs are stored as strings in the Set
                dataToExport = applicationsFiltered.filter(row => appSelectedRows.has(String(row.name)));
            }

            const columnMapping = {
                'name': 'ID',
                'employee_name': 'Employee Name',
                'department_name': 'Department',
                'leave_type': 'Leave Type',
                'reason': 'Reason',
                'from_date': 'Start Date',
                'to_date': 'End Date',
                'total_leave_days': 'Total Days'
            };

            const columns = Object.keys(columnMapping); // Only export mapped columns for cleaner output

            createExportModal({
                data: dataToExport,
                availableColumns: columns,
                filename: 'Leave_Applications',
                columnMapping: columnMapping,
                onClose: () => { }
            });
        };
        controls.appendChild(exportBtn);

        contentArea.appendChild(controls);

        // Table Container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto';

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';

        // Header
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        thead.innerHTML = `
            <tr>
                <th scope="col" class="px-4 py-3 text-left">
                    <input type="checkbox" id="app-select-all" class="h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded">
                </th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Employee</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Leave Period</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Leave Type</th>
                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            </tr>
        `;
        table.appendChild(thead);

        // Body
        appTbody = document.createElement('tbody'); // Use variable
        appTbody.className = 'bg-white divide-y divide-gray-200';
        table.appendChild(appTbody);
        tableContainer.appendChild(table);

        // Pagination Footer Placeholder
        appPaginationContainer = document.createElement('div'); // Use variable
        tableContainer.appendChild(appPaginationContainer);

        contentArea.appendChild(tableContainer);

        // Initial Filter & Render
        // Initial Load
        // Initial Filter & Render
        // Initial Load
        loadApplicationsData();

        // Select All Listener (delegated or attached after render? attached here is fine if element exists)
        // But table header is static, so we can attach now.
        const selectAllCb = thead.querySelector('#app-select-all');
        selectAllCb.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const start = (applicationsPage - 1) * applicationsPageSize;
            const end = Math.min(start + applicationsPageSize, applicationsFiltered.length);
            const pageData = applicationsFiltered.slice(start, end);

            if (isChecked) {
                pageData.forEach(row => appSelectedRows.add(String(row.name)));
            } else {
                pageData.forEach(row => appSelectedRows.delete(String(row.name)));
            }
            renderApplicationsTableBody();
        });
    }

    function renderApplicationsTableBody() {
        if (!appTbody) return;

        appTbody.innerHTML = '';

        if (applicationsLoading) {
            appTbody.innerHTML = `
                <tr>
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center">
                        <div class="flex justify-center items-center">
                            <svg class="animate-spin h-6 w-6 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span class="ml-2 text-lg text-gray-500">Loading applications...</span>
                        </div>
                    </td>
                </tr>
            `;
            // Hide pagination while loading
            if (appPaginationContainer) appPaginationContainer.innerHTML = '';
            return;
        }

        const searchQuery = appSearchInput ? appSearchInput.value.toLowerCase() : '';

        const start = (applicationsPage - 1) * applicationsPageSize;
        const end = Math.min(start + applicationsPageSize, applicationsFiltered.length);
        const pageData = applicationsFiltered.slice(start, end);

        if (pageData.length === 0) {
            appTbody.innerHTML = '<tr><td colspan="5" class="px-4 py-4 text-center text-base text-gray-500">No leave applications found for this filter.</td></tr>';
        } else {
            // Update Select All state based on current page/selection
            const selectAllCb = document.getElementById('app-select-all');
            if (selectAllCb) {
                const allPageSelected = pageData.length > 0 && pageData.every(row => appSelectedRows.has(String(row.name)));
                const somePageSelected = pageData.some(row => appSelectedRows.has(String(row.name)));

                selectAllCb.checked = allPageSelected;
                selectAllCb.indeterminate = somePageSelected && !allPageSelected;
            }

            // Update Selection Indicator
            const indicator = document.getElementById('app-selection-count');
            if (indicator) {
                if (appSelectedRows.size > 0) {
                    indicator.textContent = `${appSelectedRows.size} row${appSelectedRows.size !== 1 ? 's' : ''} selected`;
                    indicator.classList.remove('hidden');
                } else {
                    indicator.classList.add('hidden');
                }
            }

            pageData.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50';

                const isSelected = appSelectedRows.has(String(row.name));
                if (isSelected) tr.classList.add('bg-pelorous-50');

                const avatarUrl = row.employee_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.employee_name)}&background=random`;

                const arrowIcon = `<svg class="w-4 h-4 text-gray-900 inline-block mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>`;

                // Date Formatting Logic
                let dateDisplay = '';
                if (row.from_month_num === row.to_month_num && row.from_year === row.to_year) {
                    // Same month and year: "26 -> 30 May 2025"
                    const monthName = getMonthName(row.from_month_num);
                    const hFromDay = highlightText(row.from_day, searchQuery);
                    const hToDay = highlightText(row.to_day, searchQuery);
                    const hMonth = highlightText(monthName, searchQuery);
                    const hYear = highlightText(row.from_year, searchQuery);
                    dateDisplay = `${hFromDay} ${arrowIcon} ${hToDay} ${hMonth} ${hYear}`;
                } else {
                    // Different: "26 May 2025 -> 30 Jun 2025"
                    const fromMonthName = getMonthName(row.from_month_num);
                    const toMonthName = getMonthName(row.to_month_num);

                    const hFromDay = highlightText(row.from_day, searchQuery);
                    const hFromMonth = highlightText(fromMonthName, searchQuery);
                    const hFromYear = highlightText(row.from_year, searchQuery);

                    const hToDay = highlightText(row.to_day, searchQuery);
                    const hToMonth = highlightText(toMonthName, searchQuery);
                    const hToYear = highlightText(row.to_year, searchQuery);

                    dateDisplay = `${hFromDay} ${hFromMonth} ${hFromYear} ${arrowIcon} ${hToDay} ${hToMonth} ${hToYear}`;
                }

                tr.innerHTML = `
                    <td class="px-4 py-2 whitespace-nowrap">
                        <input type="checkbox" class="app-row-checkbox h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded" value="${row.name}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-8 w-8">
                                <img class="h-8 w-8 rounded-full" src="${avatarUrl}" alt="">
                            </div>
                            <div class="ml-3">
                                <div class="text-sm font-bold text-gray-900">${highlightText(row.employee_name, searchQuery)}</div>
                                <div class="text-xs text-gray-500">${highlightText(row.department_name || '', searchQuery)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                        <div class="flex flex-col">
                            <div class="text-sm text-gray-900 flex items-center gap-1">
                                ${dateDisplay} 
                            </div>
                            <div class="text-xs text-gray-500">${row.total_leave_days} day${row.total_leave_days !== 1 ? 's' : ''}</div>
                        </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                        <span class="text-sm text-gray-900">${highlightText(row.leave_type, searchQuery)}</span>
                    </td>
                    <td class="px-4 py-2">
                        <div class="text-sm text-gray-900 line-clamp-2" title="${row.reason}">
                            ${highlightText(row.reason, searchQuery)}
                        </div>
                    </td>
                `;
                appTbody.appendChild(tr);
            });

            // Attach row checkbox listeners
            appTbody.querySelectorAll('.app-row-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = e.target.value;
                    if (e.target.checked) {
                        appSelectedRows.add(id);
                    } else {
                        appSelectedRows.delete(id);
                    }
                    renderApplicationsTableBody(); // Re-render to update styling and Select All state
                });
            });
        }

        // Update Pagination
        if (appPaginationContainer) {
            appPaginationContainer.innerHTML = '';
            appPaginationContainer.appendChild(renderPaginationFooter(applicationsFiltered.length, applicationsPage, applicationsPageSize, (newPage) => {
                applicationsPage = newPage;
                renderApplicationsTableBody();
            }, (newSize) => {
                applicationsPageSize = newSize;
                applicationsPage = 1;
                renderApplicationsTableBody();
            }));
        }
    }

    // --- Leave Report Logic ---
    let reportData = [];
    let reportFiltered = [];
    let reportLoading = false;
    let reportPage = 1;
    let reportPageSize = 15;
    let reportYearSelect, reportSearchInput;
    let reportTbody, reportPaginationContainer; // Direct references
    let reportSelectedRows = new Set(); // Track selected row IDs (using employee_number)

    function renderReportTable() {
        contentArea.innerHTML = '';

        // Controls
        const controls = document.createElement('div');
        controls.className = 'flex justify-end items-center gap-2 mb-4';

        reportYearSelect = document.createElement('select');
        reportYearSelect.className = 'block w-24 pl-2 pr-8 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md';
        for (let y = 2023; y <= currentYear; y++) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            if (y === currentYear) opt.selected = true;
            reportYearSelect.appendChild(opt);
        }
        reportYearSelect.addEventListener('change', () => loadReportData());

        reportSearchInput = document.createElement('input');
        reportSearchInput.type = 'text';
        reportSearchInput.placeholder = 'Search...';
        reportSearchInput.className = 'block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md';
        reportSearchInput.addEventListener('input', (e) => filterReportData(e.target.value));

        controls.appendChild(reportYearSelect);
        controls.appendChild(reportSearchInput);

        // Selection Indicator
        const selectionIndicator = document.createElement('span');
        selectionIndicator.id = 'report-selection-count';
        selectionIndicator.className = 'text-xs text-gray-500 ml-2 hidden';
        controls.appendChild(selectionIndicator);

        // Export Button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-pelorous-600 hover:bg-pelorous-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-2';
        exportBtn.textContent = 'Export to Excel';
        exportBtn.onclick = () => {
            if (!reportFiltered || reportFiltered.length === 0) {
                alert('No data to export.');
                return;
            }

            // Determine data to export
            let dataToExport = reportFiltered;
            if (reportSelectedRows.size > 0) {
                dataToExport = reportFiltered.filter(row => reportSelectedRows.has(row.employee_number));
            }

            const columnMapping = {
                'employee_number': 'PF No.',
                'full_name': 'Employee Name',
                'leave_arrears': 'Arrears',
                'leave_due': 'Earned',
                'total_leaves_allocated': 'Total',
                'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr', 'May': 'May', 'Jun': 'Jun',
                'Jul': 'Jul', 'Aug': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec',
                'outstanding_leave': 'Outstanding'
            };

            const columns = Object.keys(columnMapping);

            createExportModal({
                data: dataToExport,
                availableColumns: columns,
                filename: 'Leave_Report',
                columnMapping: columnMapping,
                onClose: () => { }
            });
        };
        controls.appendChild(exportBtn);

        contentArea.appendChild(controls);

        // Table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto';

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';

        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        const columns = ['PF No.', 'Employee', 'Arrears', 'Earned', 'Total', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Outstanding'];
        const headerRow = document.createElement('tr');

        // Checkbox Header
        const thCb = document.createElement('th');
        thCb.scope = 'col';
        thCb.className = 'px-3 py-2 text-left';
        thCb.innerHTML = '<input type="checkbox" id="report-select-all" class="h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded">';
        headerRow.appendChild(thCb);

        columns.forEach(col => {
            const th = document.createElement('th');
            th.scope = 'col';
            th.className = 'px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap';
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Select All Listener
        const selectAllCb = thead.querySelector('#report-select-all');
        selectAllCb.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const start = (reportPage - 1) * reportPageSize;
            const end = Math.min(start + reportPageSize, reportFiltered.length);
            const pageData = reportFiltered.slice(start, end);

            if (isChecked) {
                pageData.forEach(row => reportSelectedRows.add(row.employee_number));
            } else {
                pageData.forEach(row => reportSelectedRows.delete(row.employee_number));
            }
            renderReportBody();
        });

        reportTbody = document.createElement('tbody'); // Use variable
        reportTbody.className = 'bg-white divide-y divide-gray-200';
        table.appendChild(reportTbody);
        tableContainer.appendChild(table);

        reportPaginationContainer = document.createElement('div'); // Use variable
        tableContainer.appendChild(reportPaginationContainer);

        contentArea.appendChild(tableContainer);

        if (reportData.length === 0) {
            loadReportData();
        } else {
            renderReportBody();
        }
    }

    function loadReportData() {
        const year = reportYearSelect ? reportYearSelect.value : new Date().getFullYear();
        const query = new URLSearchParams({ year }).toString();

        reportLoading = true;
        renderReportBody();

        console.log('Fetching leave report...');
        fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_leave_report?${query}`, {
            method: "GET",
            headers: { 'Accept': 'application/json' },
            credentials: "include"
        })
            .then(r => r.ok ? r.json() : Promise.reject('Network error'))
            .then(res => {
                reportData = Array.isArray(res.message) ? res.message : [];
                reportFiltered = reportData;
                reportSelectedRows.clear();
                reportPage = 1;
                reportLoading = false;
                renderReportBody();
            })
            .catch(err => {
                console.error("Error loading report:", err);
                reportData = generateMockReportData();
                reportFiltered = reportData;
                reportLoading = false;
                renderReportBody();
            });
    }

    function filterReportData(query) {
        const lowerQuery = query.toLowerCase();
        reportFiltered = reportData.filter(row =>
            (row.employee_number && row.employee_number.toLowerCase().includes(lowerQuery)) ||
            (row.full_name && row.full_name.toLowerCase().includes(lowerQuery))
        );
        reportPage = 1;
        reportSelectedRows.clear();
        renderReportBody();
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return String(text).replace(regex, '<span class="bg-yellow-200">$1</span>');
    }

    function renderReportBody() {
        if (!reportTbody) return;

        reportTbody.innerHTML = '';

        if (reportLoading) {
            reportTbody.innerHTML = `
                <tr>
                <tr>
                    <td colspan="19" class="px-4 py-8 text-center">
                        <div class="flex justify-center items-center">
                            <svg class="animate-spin h-6 w-6 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span class="ml-2 text-lg text-gray-500">Loading leave data...</span>
                        </div>
                    </td>
                </tr>
            `;
            // Hide pagination while loading
            if (reportPaginationContainer) reportPaginationContainer.innerHTML = '';
            return;
        }

        const searchQuery = reportSearchInput ? reportSearchInput.value.trim() : '';

        const start = (reportPage - 1) * reportPageSize;
        const end = Math.min(start + reportPageSize, reportFiltered.length);
        const pageData = reportFiltered.slice(start, end);

        if (pageData.length === 0) {
            reportTbody.innerHTML = '<tr><td colspan="19" class="px-4 py-4 text-center text-base text-gray-500">No data available</td></tr>';
        } else {
            // Update Select All
            const selectAllCb = document.getElementById('report-select-all');
            if (selectAllCb) {
                const allPageSelected = pageData.length > 0 && pageData.every(row => reportSelectedRows.has(row.employee_number));
                const somePageSelected = pageData.some(row => reportSelectedRows.has(row.employee_number));

                selectAllCb.checked = allPageSelected;
                selectAllCb.indeterminate = somePageSelected && !allPageSelected;
            }

            // Update Selection Indicator
            const indicator = document.getElementById('report-selection-count');
            if (indicator) {
                if (reportSelectedRows.size > 0) {
                    indicator.textContent = `${reportSelectedRows.size} row${reportSelectedRows.size !== 1 ? 's' : ''} selected`;
                    indicator.classList.remove('hidden');
                } else {
                    indicator.classList.add('hidden');
                }
            }

            pageData.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 transition-colors';

                const isSelected = reportSelectedRows.has(row.employee_number);
                if (isSelected) tr.classList.add('bg-pelorous-50');

                // Checkbox Cell
                const tdCb = document.createElement('td');
                tdCb.className = 'px-3 py-1.5 whitespace-nowrap';
                tdCb.innerHTML = `<input type="checkbox" class="report-row-checkbox h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded" value="${row.employee_number}" ${isSelected ? 'checked' : ''}>`;
                tr.appendChild(tdCb);

                const cells = [
                    highlightText(row.employee_number || '-', searchQuery),
                    highlightText(row.full_name || '-', searchQuery),
                    row.leave_arrears || 0, row.leave_due || 0, row.total_leaves_allocated || 0,
                    row.Jan || 0, row.Feb || 0, row.Mar || 0, row.Apr || 0, row.May || 0, row.Jun || 0,
                    row.Jul || 0, row.Aug || 0, row.Sep || 0, row.Oct || 0, row.Nov || 0, row.Dec || 0,
                    row.outstanding_leave || 0
                ];

                cells.forEach(cellData => {
                    const td = document.createElement('td');
                    td.className = 'px-3 py-1.5 whitespace-nowrap text-xs text-gray-500';
                    td.innerHTML = cellData;
                    tr.appendChild(td);
                });
                reportTbody.appendChild(tr);
            });

            // Attach listeners
            reportTbody.querySelectorAll('.report-row-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = e.target.value;
                    if (e.target.checked) {
                        reportSelectedRows.add(id);
                    } else {
                        reportSelectedRows.delete(id);
                    }
                    renderReportBody();
                });
            });
        }

        if (reportPaginationContainer) {
            reportPaginationContainer.innerHTML = '';
            reportPaginationContainer.appendChild(renderPaginationFooter(reportFiltered.length, reportPage, reportPageSize, (newPage) => {
                reportPage = newPage;
                renderReportBody();
            }, (newSize) => {
                reportPageSize = newSize;
                reportPage = 1;
                renderReportBody();
            }));
        }
    }

    function generateMockReportData() {
        const mock = [];
        for (let i = 1; i <= 50; i++) {
            mock.push({
                employee_number: `JD123${i}/456`,
                full_name: `Employee ${i}`,
                leave_arrears: Math.floor(Math.random() * 5),
                total_leaves_allocated: 56,
                leave_due: 28,
                Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
                Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
                outstanding_leave: 56
            });
        }
        return mock;
    }

    // --- Shared Pagination Component ---
    function renderPaginationFooter(totalItems, currentPage, pageSize, onPageChange, onSizeChange) {
        const footer = document.createElement('div');
        footer.className = 'bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6';

        const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalItems);
        const totalPages = Math.ceil(totalItems / pageSize);

        // Sliding Window
        let startPage, endPage;
        if (totalPages <= 3) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 2) {
                startPage = 1;
                endPage = 3;
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - 2;
                endPage = totalPages;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
        }
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        const info = document.createElement('div');
        info.className = 'hidden sm:flex-1 sm:flex sm:items-center sm:justify-between';

        // Left Side: Showing text + Dropdown
        const leftSide = document.createElement('div');
        leftSide.className = 'flex items-center gap-4';
        leftSide.innerHTML = `
            <p class="text-xs text-gray-700">
                Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalItems}</span> results
            </p>
        `;

        const sizeSelect = document.createElement('select');
        // Refined styling: border border-gray-300, w-16
        sizeSelect.className = 'block w-16 pl-1 pr-4 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md';
        [10, 15, 25, 50, 100].forEach(size => {
            const opt = document.createElement('option');
            opt.value = size;
            opt.textContent = size;
            if (size === pageSize) opt.selected = true;
            sizeSelect.appendChild(opt);
        });
        sizeSelect.addEventListener('change', (e) => onSizeChange(parseInt(e.target.value)));
        leftSide.appendChild(sizeSelect);
        info.appendChild(leftSide);

        // Right Side: Pagination Buttons
        const nav = document.createElement('nav');
        nav.className = 'relative z-0 inline-flex rounded-md shadow-sm -space-x-px';
        nav.setAttribute('aria-label', 'Pagination');

        const prevBtn = document.createElement('button');
        prevBtn.className = `relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`;
        prevBtn.disabled = currentPage === 1;
        prevBtn.innerHTML = '<span class="sr-only">Previous</span><svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
        prevBtn.onclick = () => { if (currentPage > 1) onPageChange(currentPage - 1); };
        nav.appendChild(prevBtn);

        pages.forEach(p => {
            const btn = document.createElement('button');
            btn.className = `relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium ${p === currentPage ? 'z-10 bg-pelorous-50 border-pelorous-500 text-pelorous-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`;
            btn.textContent = p;
            btn.onclick = () => onPageChange(p);
            nav.appendChild(btn);
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = `relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${end >= totalItems ? 'cursor-not-allowed opacity-50' : ''}`;
        nextBtn.disabled = end >= totalItems;
        nextBtn.innerHTML = '<span class="sr-only">Next</span><svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>';
        nextBtn.onclick = () => { if (end < totalItems) onPageChange(currentPage + 1); };
        nav.appendChild(nextBtn);

        info.appendChild(nav);
        footer.appendChild(info);
        return footer;
    }

    // --- Tab Switching Logic ---
    function switchTab(tab) {
        activeTab = tab;
        if (tab === 'applications') {
            btnApplications.className = `${tabBtnClass} ${activeTabClass}`;
            btnReport.className = `${tabBtnClass} ${inactiveTabClass}`;
            renderApplicationsTable();
        } else {
            btnApplications.className = `${tabBtnClass} ${inactiveTabClass}`;
            btnReport.className = `${tabBtnClass} ${activeTabClass}`;
            renderReportTable();
        }
    }

    btnApplications.addEventListener('click', () => switchTab('applications'));
    btnReport.addEventListener('click', () => switchTab('report'));

    // Initial Render
    switchTab('applications');

    return container;
}
