import { employees as mockEmployees } from '../data/mockData.js';
import { createExportModal } from '../components/ExportModal.js';
import { ROUTER_BASE } from '../config.js';

export function Employees() {
  const container = document.createElement('div');
  container.className = 'p-3'; // Removed max-w-7xl mx-auto

  const header = document.createElement('div');
  header.className = 'md:flex md:items-center md:justify-between mb-4 gap-4';

  // Title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex-1 min-w-0';
  titleDiv.innerHTML = `<h2 class="text-lg font-bold leading-7 text-gray-900 sm:text-xl sm:truncate">Employees</h2>`;
  header.appendChild(titleDiv);

  // State
  let activeTab = 'employees'; // 'employees' or 'anniversaries'
  let birthdaysData = [];
  let retireesData = [];

  // Employees Tab State
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalItems = 0;
  let allEmployeesData = []; // Store all data
  let filteredData = []; // For client-side search/pagination
  let selectedRows = new Set();

  // Tab Navigation
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'border-b border-gray-200 mb-4';
  tabsContainer.innerHTML = `
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#" id="tab-employees" class="border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Employees
          </a>
          <a href="#" id="tab-anniversaries" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Anniversaries
          </a>
      </nav>
  `;
  container.appendChild(tabsContainer);

  // --- Employees Tab Content ---
  const employeesTabContent = document.createElement('div');
  employeesTabContent.id = 'employees-tab-content';

  // Actions (Search) - Moved inside Employees Tab
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'mb-4 flex justify-end';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search employees...';
  searchInput.className = 'block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500';
  actionsDiv.appendChild(searchInput);

  // Selection Indicator
  const selectionIndicator = document.createElement('span');
  selectionIndicator.id = 'emp-selection-count';
  selectionIndicator.className = 'text-xs text-gray-500 ml-2 hidden self-center';
  actionsDiv.appendChild(selectionIndicator);

  // Export Button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-pelorous-600 hover:bg-pelorous-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500 ml-2';
  exportBtn.textContent = 'Export to Excel';
  exportBtn.onclick = () => {
    if (!filteredData || filteredData.length === 0) {
      alert('No data to export.');
      return;
    }

    // Determine data to export
    let dataToExport = filteredData;
    if (selectedRows.size > 0) {
      dataToExport = filteredData.filter(row => selectedRows.has(String(row.name)));
    }

    const columnMapping = {
      'employee_name': 'Name',
      'name': 'Staff ID',
      'date_of_joining': 'Date of Joining',
      'department': 'Department',
      'cell_number': 'Phone Number',
      'user_id': 'Email',
      'designation': 'Designation',
      'status': 'Status'
    };

    const columns = Object.keys(columnMapping);

    createExportModal({
      data: dataToExport,
      availableColumns: columns,
      filename: 'Employees_List',
      columnMapping: columnMapping,
      onClose: () => { }
    });
  };
  actionsDiv.appendChild(exportBtn);

  employeesTabContent.appendChild(actionsDiv);
  container.appendChild(employeesTabContent);

  // --- Anniversaries Tab Content ---
  const anniversariesTabContent = document.createElement('div');
  anniversariesTabContent.id = 'anniversaries-tab-content';
  anniversariesTabContent.className = 'hidden';
  container.appendChild(anniversariesTabContent);

  // Tab Switching Logic
  const tabEmployees = tabsContainer.querySelector('#tab-employees');
  const tabAnniversaries = tabsContainer.querySelector('#tab-anniversaries');

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'employees') {
      employeesTabContent.classList.remove('hidden');
      anniversariesTabContent.classList.add('hidden');

      tabEmployees.className = 'border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
      tabAnniversaries.className = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
    } else {
      employeesTabContent.classList.add('hidden');
      anniversariesTabContent.classList.remove('hidden');

      tabEmployees.className = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';
      tabAnniversaries.className = 'border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm';

      renderAnniversariesTab();
    }
  }

  tabEmployees.onclick = (e) => { e.preventDefault(); switchTab('employees'); };
  tabAnniversaries.onclick = (e) => { e.preventDefault(); switchTab('anniversaries'); };

  const tableContainer = document.createElement('div');
  tableContainer.className = 'flex flex-col';

  const overflowDiv = document.createElement('div');
  overflowDiv.className = '-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8';

  const alignDiv = document.createElement('div');
  alignDiv.className = 'py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8';

  const shadowDiv = document.createElement('div');
  shadowDiv.className = 'shadow overflow-hidden border-b border-gray-200 sm:rounded-lg';

  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-gray-200';

  table.innerHTML = `
    <thead class="bg-gray-50">
      <tr>
        <th scope="col" class="px-3 py-2 text-left">
            <input type="checkbox" id="emp-select-all" class="h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded">
        </th>
        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Joining</th>
        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
        <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
      </tr>
    </thead>
    <tbody id="employees_table_body" class="bg-white divide-y divide-gray-200">
      <!-- Rows will be populated here -->
    </tbody>
  `;

  shadowDiv.appendChild(table);

  // Select All Listener
  const selectAllCb = table.querySelector('#emp-select-all');
  if (selectAllCb) {
    selectAllCb.addEventListener('change', (e) => {
      const isChecked = e.target.checked;

      // Get current page data
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = filteredData.slice(start, end);

      if (isChecked) {
        pageData.forEach(row => selectedRows.add(String(row.name)));
      } else {
        pageData.forEach(row => selectedRows.delete(String(row.name)));
      }
      renderTable(searchInput.value);
    });
  }

  // Pagination Footer
  const paginationFooter = document.createElement('div');
  paginationFooter.className = 'bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6';
  paginationFooter.id = 'employees_pagination';
  shadowDiv.appendChild(paginationFooter);

  alignDiv.appendChild(shadowDiv);
  overflowDiv.appendChild(alignDiv);
  tableContainer.appendChild(overflowDiv);
  employeesTabContent.appendChild(tableContainer);

  // --- State & Logic ---


  function fetchEmployees() {
    // Fetch ALL employees (large page size)
    const queryParams = new URLSearchParams({
      page: 1,
      page_size: 10000 // Large enough to get all
    }).toString();

    console.log(`Fetching all employees...`);

    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_paginated_employees?${queryParams}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(res => {
        const message = res.message || {};
        allEmployeesData = message.data || [];

        // Ensure data has name property for ID
        allEmployeesData.forEach(emp => {
          if (!emp.name && emp.employee) emp.name = emp.employee; // Fallback if name missing
        });

        filteredData = allEmployeesData; // Initial filter is all
        totalItems = allEmployeesData.length;

        selectedRows.clear();
        currentPage = 1;
        filterEmployees(searchInput.value); // Apply search if any
      })
      .catch(err => {
        console.error("Error fetching employees:", err);
        // Fallback to Mock Data
        allEmployeesData = mockEmployees;
        filteredData = allEmployeesData;
        totalItems = allEmployeesData.length;
        currentPage = 1;
        filterEmployees(searchInput.value);
      });
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return String(text).replace(regex, '<span class="bg-yellow-200">$1</span>');
  }

  function filterEmployees(query) {
    const lowerQuery = query.toLowerCase();
    if (!lowerQuery) {
      filteredData = allEmployeesData;
    } else {
      filteredData = allEmployeesData.filter(emp => {
        const name = (emp.employee_name || emp.name || '').toLowerCase();
        const id = (emp.name || emp.employee || emp.staff_id || emp.id || '').toLowerCase();
        const dept = (emp.department || '').toLowerCase();
        const date = (emp.date_of_joining || emp.joinDate || '').toLowerCase();
        const phone = (emp.cell_number || emp.phone || '').toLowerCase();
        return name.includes(lowerQuery) || id.includes(lowerQuery) || dept.includes(lowerQuery) || date.includes(lowerQuery) || phone.includes(lowerQuery);
      });
    }
    totalItems = filteredData.length;
    currentPage = 1; // Reset to first page on filter
    renderTable(lowerQuery);
  }

  searchInput.addEventListener('input', (e) => {
    filterEmployees(e.target.value);
  });

  function renderTable(searchQuery = '') {
    const tbody = container.querySelector('#employees_table_body');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="px-3 py-4 text-center text-base text-gray-500">No employees found</td></tr>';
      renderPagination(); // Render empty pagination
      return;
    }

    // Client-side Pagination Logic
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    // Update Select All state based on current page
    const selectAllCb = container.querySelector('#emp-select-all');
    if (selectAllCb) {
      const allSelected = pageData.length > 0 && pageData.every(row => selectedRows.has(String(row.name)));
      selectAllCb.checked = allSelected;
      selectAllCb.indeterminate = selectedRows.size > 0 && !allSelected;
    }

    // Update Selection Indicator
    const indicator = container.querySelector('#emp-selection-count');
    if (indicator) {
      if (selectedRows.size > 0) {
        indicator.textContent = `${selectedRows.size} row${selectedRows.size !== 1 ? 's' : ''} selected`;
        indicator.classList.remove('hidden');
      } else {
        indicator.classList.add('hidden');
      }
    }

    pageData.forEach(emp => {
      const name = emp.employee_name || emp.name || 'Unknown';
      const email = emp.user_id || emp.company_email || emp.personal_email || 'No Email';
      const staffId = emp.name || emp.employee || emp.staff_id || emp.id || '-';
      const joinDate = emp.date_of_joining || emp.joinDate || '-';
      const dept = emp.department || '-';
      const phone = emp.cell_number || emp.phone || '-';
      const image = emp.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 cursor-pointer transition-colors';

      const isSelected = selectedRows.has(String(emp.name));
      if (isSelected) tr.classList.add('bg-pelorous-50');

      // Row click for details (ignore if checkbox clicked)
      tr.onclick = (e) => {
        if (e.target.type === 'checkbox') return;
        const encodedId = encodeURIComponent(staffId);
        window.location.hash = `/employee-details?id=${encodedId}`;
      };

      tr.innerHTML = `
            <td class="px-3 py-1.5 whitespace-nowrap">
                <input type="checkbox" class="emp-row-checkbox h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded" value="${emp.name}" ${isSelected ? 'checked' : ''}>
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <img class="h-8 w-8 rounded-full" src="${image}" alt="">
                </div>
                <div class="ml-3">
                  <div class="text-sm font-bold text-gray-900 hover:text-pelorous-900">${highlightText(name, searchQuery)}</div>
                  <div class="text-xs text-gray-500">${email}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
              ${highlightText(staffId, searchQuery)}
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
              ${highlightText(joinDate, searchQuery)}
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
              ${highlightText(dept, searchQuery)}
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap text-sm text-gray-500">
              ${highlightText(phone, searchQuery)}
            </td>
          `;
      tbody.appendChild(tr);
    });

    // Attach row checkbox listeners
    tbody.querySelectorAll('.emp-row-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = e.target.value;
        if (e.target.checked) {
          selectedRows.add(id);
        } else {
          selectedRows.delete(id);
        }
        renderTable(searchQuery); // Re-render to update styling and Select All state
      });
    });

    renderPagination();
  }

  function renderPagination() {
    const footer = container.querySelector('#employees_pagination');
    footer.innerHTML = '';

    const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Calculate sliding window of 3 pages
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

    footer.innerHTML = `
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
                <p class="text-xs text-gray-700">
                    Showing <span class="font-medium">${start}</span> to <span class="font-medium">${end}</span> of <span class="font-medium">${totalItems}</span> results
                </p>
                <select id="items-per-page" class="block w-16 pl-1 pr-4 py-1 text-xs border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-xs rounded-md">
                    <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25</option>
                    <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
                    <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
                </select>
            </div>
            <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button id="prev-btn" class="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
                        <span class="sr-only">Previous</span>
                        <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    
                    ${pages.map(p => `
                        <button class="page-btn relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium ${p === currentPage ? 'z-10 bg-pelorous-50 border-pelorous-500 text-pelorous-600' : 'bg-white text-gray-500 hover:bg-gray-50'}" data-page="${p}">
                            ${p}
                        </button>
                    `).join('')}

                    <button id="next-btn" class="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${end >= totalPages ? 'cursor-not-allowed opacity-50' : ''}" ${end >= totalPages ? 'disabled' : ''}>
                        <span class="sr-only">Next</span>
                        <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </nav>
            </div>
        </div>
      `;

    // Attach listeners
    const prevBtn = footer.querySelector('#prev-btn');
    const nextBtn = footer.querySelector('#next-btn');
    const pageBtns = footer.querySelectorAll('.page-btn');
    const limitSelect = footer.querySelector('#items-per-page');

    if (prevBtn && !prevBtn.disabled) {
      prevBtn.onclick = () => {
        currentPage--;
        renderTable(searchInput.value);
      };
    }
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.onclick = () => {
        currentPage++;
        renderTable(searchInput.value);
      };
    }
    pageBtns.forEach(btn => {
      btn.onclick = () => {
        currentPage = parseInt(btn.dataset.page);
        renderTable(searchInput.value);
      };
    });

    if (limitSelect) {
      limitSelect.onchange = (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderTable(searchInput.value);
      };
    }
  }

  // Initial Fetch
  setTimeout(() => fetchEmployees(), 0);

  function getWeekdayFromDOB(dobString) {
    // dobString is like "11 November"
    // Append current year to get a valid date object for this year's birthday
    const currentYear = new Date().getFullYear();
    const dateStr = `${dobString} ${currentYear}`;
    const date = new Date(dateStr);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown';

    return date.toLocaleString('default', { weekday: 'long' });
  }

  function renderAnniversariesTab() {
    anniversariesTabContent.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';
    anniversariesTabContent.appendChild(grid);

    // --- Birthdays Section ---
    const birthdaysSection = document.createElement('div');
    birthdaysSection.innerHTML = `<h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Birthdays This Week</h3>`;

    const birthdaysTableContainer = document.createElement('div');
    birthdaysTableContainer.className = 'shadow overflow-hidden border-b border-gray-200 sm:rounded-lg';

    const birthdaysTable = document.createElement('table');
    birthdaysTable.className = 'min-w-full divide-y divide-gray-200';
    birthdaysTable.innerHTML = `
          <thead class="bg-gray-50">
              <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
              <tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">Loading...</td></tr>
          </tbody>
      `;
    const birthdaysTbody = birthdaysTable.querySelector('tbody');

    birthdaysTableContainer.appendChild(birthdaysTable);
    birthdaysSection.appendChild(birthdaysTableContainer);
    grid.appendChild(birthdaysSection);

    // --- Retirees Section ---
    const retireesSection = document.createElement('div');
    retireesSection.innerHTML = `<h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Upcoming Retirees</h3>`;

    const retireesTableContainer = document.createElement('div');
    retireesTableContainer.className = 'shadow overflow-hidden border-b border-gray-200 sm:rounded-lg';

    const retireesTable = document.createElement('table');
    retireesTable.className = 'min-w-full divide-y divide-gray-200';
    retireesTable.innerHTML = `
          <thead class="bg-gray-50">
              <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retirement Date</th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notify Date</th>
              </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
              <tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">Loading...</td></tr>
          </tbody>
      `;
    const retireesTbody = retireesTable.querySelector('tbody');

    retireesTableContainer.appendChild(retireesTable);
    retireesSection.appendChild(retireesTableContainer);
    grid.appendChild(retireesSection);

    // Fetch Data
    Promise.all([
      fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_birthdays_this_week').then(r => r.json()),
      fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_upcoming_retirees').then(r => r.json())
    ]).then(([birthdaysRes, retireesRes]) => {
      renderBirthdaysTable(birthdaysRes.message || [], birthdaysTbody);
      renderRetireesTable(retireesRes.message || [], retireesTbody);
    }).catch(err => {
      console.error("Error fetching anniversaries:", err);
      if (birthdaysTbody) birthdaysTbody.innerHTML = '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-red-500">Error loading data</td></tr>';
      if (retireesTbody) retireesTbody.innerHTML = '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-red-500">Error loading data</td></tr>';
    });
  }


  function renderBirthdaysTable(data, tbody) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">No birthdays this week</td></tr>';
      return;
    }

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.toLocaleString("default", { month: "long" });

    const grouped = {};
    data.forEach(row => {
      const dob = row.dob;
      const weekday = getWeekdayFromDOB(dob);

      if (!grouped[weekday]) grouped[weekday] = [];

      const isToday = dob?.includes(todayDay.toString()) && dob?.includes(todayMonth);

      grouped[weekday].push({
        employee: (row.employee || '').toUpperCase(),
        cell_number: row.cell_number || '',
        dob: isToday ? `🎉 ${row.dob}` : row.dob,
        highlight: isToday
      });
    });

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    daysOfWeek.forEach(day => {
      if (grouped[day] && grouped[day].length > 0) {
        const headerRow = document.createElement('tr');
        headerRow.className = 'bg-gray-100';
        headerRow.innerHTML = `
                  <td colspan="3" class="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">${day}</td>
              `;
        tbody.appendChild(headerRow);

        grouped[day].forEach(entry => {
          const tr = document.createElement('tr');
          if (entry.highlight) tr.className = 'bg-yellow-50';

          tr.innerHTML = `
                      <td class="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">${entry.employee}</td>
                      <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${entry.cell_number}</td>
                      <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${entry.dob}</td>
                  `;
          tbody.appendChild(tr);
        });
      }
    });
  }

  function renderRetireesTable(data, tbody) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">No upcoming retirees</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
              <td class="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">${row.employee}</td>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${row.retirement_date}</td>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${row.notify_date}</td>
          `;
      tbody.appendChild(tr);
    });
  }

  return container;
}
