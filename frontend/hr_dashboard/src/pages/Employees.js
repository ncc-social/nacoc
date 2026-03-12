import { employees as mockEmployees } from '../data/mockData.js';
import { createExportModal } from '../components/ExportModal.js';
import * as echarts from "echarts";
import { ROUTER_BASE } from "../config.js";

export function Employees() {
  const container = document.createElement("div");
  container.className = "p-3"; // Removed max-w-7xl mx-auto

  const header = document.createElement("div");
  header.className = "md:flex md:items-center md:justify-between mb-4 gap-4";

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.className = "flex-1 min-w-0";
  titleDiv.innerHTML = `<h2 class="text-lg font-bold leading-7 text-gray-900 sm:text-xl sm:truncate">Employees</h2>`;
  header.appendChild(titleDiv);

  // State
  let activeTab = "employees"; // 'employees', 'anniversaries', or 'departments'
  let birthdaysData = [];
  let retireesData = [];
  let deptChartInstance = null;

  // Employees Tab State
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalItems = 0;
  let allEmployeesData = []; // Store all data
  let filteredData = []; // For client-side search/pagination
  let selectedRows = new Set();

  // Tab Navigation
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "border-b border-gray-200 mb-4";
  tabsContainer.innerHTML = `
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <a href="#" id="tab-employees" class="border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Employees
          </a>
          <a href="#" id="tab-anniversaries" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              Anniversaries
          </a>
          <a href="#" id="tab-departments" class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
              By Department
          </a>
      </nav>
  `;
  container.appendChild(tabsContainer);

  // --- Employees Tab Content ---
  const employeesTabContent = document.createElement("div");
  employeesTabContent.id = "employees-tab-content";

  // Actions (Search) - Moved inside Employees Tab
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "mb-4 flex justify-end";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search employees...";
  searchInput.className =
    "block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500";
  actionsDiv.appendChild(searchInput);

  // Selection Indicator
  const selectionIndicator = document.createElement("span");
  selectionIndicator.id = "emp-selection-count";
  selectionIndicator.className =
    "text-xs text-gray-500 ml-2 hidden self-center";
  actionsDiv.appendChild(selectionIndicator);

  // Export Button
  const exportBtn = document.createElement("button");
  exportBtn.className =
    "inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-pelorous-600 hover:bg-pelorous-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500 ml-2";
  exportBtn.textContent = "Export to Excel";
  exportBtn.onclick = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export.");
      return;
    }

    // Determine data to export
    let dataToExport = filteredData;
    if (selectedRows.size > 0) {
      dataToExport = filteredData.filter((row) =>
        selectedRows.has(String(row.name))
      );
    }

    const columnMapping = {
      employee_name: "Name",
      name: "Staff ID",
      date_of_joining: "Date of Joining",
      department: "Department",
      cell_number: "Phone Number",
      user_id: "Email",
      designation: "Designation",
      status: "Status",
    };

    const columns = Object.keys(columnMapping);

    createExportModal({
      data: dataToExport,
      availableColumns: columns,
      filename: "Employees_List",
      columnMapping: columnMapping,
      onClose: () => {},
    });
  };
  actionsDiv.appendChild(exportBtn);

  employeesTabContent.appendChild(actionsDiv);
  container.appendChild(employeesTabContent);

  // --- Anniversaries Tab Content ---
  const anniversariesTabContent = document.createElement("div");
  anniversariesTabContent.id = "anniversaries-tab-content";
  anniversariesTabContent.className = "hidden";
  container.appendChild(anniversariesTabContent);

  // --- Departments Tab Content ---
  const departmentsTabContent = document.createElement("div");
  departmentsTabContent.id = "departments-tab-content";
  departmentsTabContent.className = "hidden";
  container.appendChild(departmentsTabContent);

  // Tab Switching Logic
  const tabEmployees = tabsContainer.querySelector("#tab-employees");
  const tabAnniversaries = tabsContainer.querySelector("#tab-anniversaries");
  const tabDepartments = tabsContainer.querySelector("#tab-departments");

  function switchTab(tab) {
    activeTab = tab;

    // Reset all tabs
    [tabEmployees, tabAnniversaries, tabDepartments].forEach((t) => {
      t.className =
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
    });
    [
      employeesTabContent,
      anniversariesTabContent,
      departmentsTabContent,
    ].forEach((c) => c.classList.add("hidden"));

    // Activate the selected tab
    if (tab === "employees") {
      tabEmployees.className =
        "border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      employeesTabContent.classList.remove("hidden");
      anniversariesTabContent.classList.add("hidden");

      tabEmployees.className =
        "border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      tabAnniversaries.className =
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
    } else if (tab === "anniversaries") {
      tabAnniversaries.className =
        "border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      anniversariesTabContent.classList.remove("hidden");

      tabEmployees.className =
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      tabAnniversaries.className =
        "border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";

      renderAnniversariesTab();
    } else if (tab === "departments") {
      tabDepartments.className =
        "border-pelorous-500 text-pelorous-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm";
      departmentsTabContent.classList.remove("hidden");
      renderDepartmentsTab();
    }
  }

  tabEmployees.onclick = (e) => {
    e.preventDefault();
    switchTab("employees");
  };
  tabAnniversaries.onclick = (e) => {
    e.preventDefault();
    switchTab("anniversaries");
  };
  tabDepartments.onclick = (e) => {
    e.preventDefault();
    switchTab("departments");
  };

  const tableContainer = document.createElement("div");
  tableContainer.className = "flex flex-col";

  const overflowDiv = document.createElement("div");
  overflowDiv.className = "-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8";

  const alignDiv = document.createElement("div");
  alignDiv.className =
    "py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8";

  const shadowDiv = document.createElement("div");
  shadowDiv.className =
    "shadow overflow-hidden border-b border-gray-200 sm:rounded-lg";

  const table = document.createElement("table");
  table.className = "min-w-full divide-y divide-gray-200";

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
  const selectAllCb = table.querySelector("#emp-select-all");
  if (selectAllCb) {
    selectAllCb.addEventListener("change", (e) => {
      const isChecked = e.target.checked;

      // Get current page data
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageData = filteredData.slice(start, end);

      if (isChecked) {
        pageData.forEach((row) => selectedRows.add(String(row.name)));
      } else {
        pageData.forEach((row) => selectedRows.delete(String(row.name)));
      }
      renderTable(searchInput.value);
    });
  }

  // Pagination Footer
  const paginationFooter = document.createElement("div");
  paginationFooter.className =
    "bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6";
  paginationFooter.id = "employees_pagination";
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
      page_size: 10000, // Large enough to get all
    }).toString();

    fetch(
      `https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_paginated_employees?${queryParams}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((res) => {
        const message = res.message || {};
        allEmployeesData = message.data || [];

        // Ensure data has name property for ID
        allEmployeesData.forEach((emp) => {
          if (!emp.name && emp.employee) emp.name = emp.employee; // Fallback if name missing
        });

        filteredData = allEmployeesData; // Initial filter is all
        totalItems = allEmployeesData.length;

        selectedRows.clear();
        currentPage = 1;
        filterEmployees(searchInput.value); // Apply search if any
      })
      .catch((err) => {
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
    const regex = new RegExp(`(${query})`, "gi");
    return String(text).replace(regex, '<span class="bg-yellow-200">$1</span>');
  }

  function filterEmployees(query) {
    const lowerQuery = query.toLowerCase();
    if (!lowerQuery) {
      filteredData = allEmployeesData;
    } else {
      filteredData = allEmployeesData.filter((emp) => {
        const name = (emp.employee_name || emp.name || "").toLowerCase();
        const id = (
          emp.name ||
          emp.employee ||
          emp.staff_id ||
          emp.id ||
          ""
        ).toLowerCase();
        const dept = (emp.department || "").toLowerCase();
        const date = (emp.date_of_joining || emp.joinDate || "").toLowerCase();
        const phone = (emp.cell_number || emp.phone || "").toLowerCase();
        return (
          name.includes(lowerQuery) ||
          id.includes(lowerQuery) ||
          dept.includes(lowerQuery) ||
          date.includes(lowerQuery) ||
          phone.includes(lowerQuery)
        );
      });
    }
    totalItems = filteredData.length;
    currentPage = 1; // Reset to first page on filter
    renderTable(lowerQuery);
  }

  searchInput.addEventListener("input", (e) => {
    filterEmployees(e.target.value);
  });

  function renderTable(searchQuery = "") {
    const tbody = container.querySelector("#employees_table_body");
    tbody.innerHTML = "";

    if (filteredData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="px-3 py-4 text-center text-base text-gray-500">No employees found</td></tr>';
      renderPagination(); // Render empty pagination
      return;
    }

    // Client-side Pagination Logic
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    // Update Select All state based on current page
    const selectAllCb = container.querySelector("#emp-select-all");
    if (selectAllCb) {
      const allSelected =
        pageData.length > 0 &&
        pageData.every((row) => selectedRows.has(String(row.name)));
      selectAllCb.checked = allSelected;
      selectAllCb.indeterminate = selectedRows.size > 0 && !allSelected;
    }

    // Update Selection Indicator
    const indicator = container.querySelector("#emp-selection-count");
    if (indicator) {
      if (selectedRows.size > 0) {
        indicator.textContent = `${selectedRows.size} row${
          selectedRows.size !== 1 ? "s" : ""
        } selected`;
        indicator.classList.remove("hidden");
      } else {
        indicator.classList.add("hidden");
      }
    }

    pageData.forEach((emp) => {
      const name = emp.employee_name || emp.name || "Unknown";
      const email =
        emp.user_id || emp.company_email || emp.personal_email || "No Email";
      const staffId = emp.name || emp.employee || emp.staff_id || emp.id || "-";
      const joinDate = emp.date_of_joining || emp.joinDate || "-";
      const dept = emp.department || "-";
      const phone = emp.cell_number || emp.phone || "-";
      const image =
        emp.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random`;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-gray-50 cursor-pointer transition-colors";

      const isSelected = selectedRows.has(String(emp.name));
      if (isSelected) tr.classList.add("bg-pelorous-50");

      // Row click for details (ignore if checkbox clicked)
      tr.onclick = (e) => {
        if (e.target.type === "checkbox") return;
        const encodedId = encodeURIComponent(staffId);
        window.location.hash = `/employee-details?id=${encodedId}`;
      };

      tr.innerHTML = `
            <td class="px-3 py-1.5 whitespace-nowrap">
                <input type="checkbox" class="emp-row-checkbox h-4 w-4 text-pelorous-600 focus:ring-pelorous-500 border-gray-300 rounded" value="${
                  emp.name
                }" ${isSelected ? "checked" : ""}>
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <img class="h-8 w-8 rounded-full" src="${image}" alt="">
                </div>
                <div class="ml-3">
                  <div class="text-sm font-bold text-gray-900 hover:text-pelorous-900">${highlightText(
                    name,
                    searchQuery
                  )}</div>
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
    tbody.querySelectorAll(".emp-row-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
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
    const footer = container.querySelector("#employees_pagination");
    footer.innerHTML = "";

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
                    <option value="10" ${
                      itemsPerPage === 10 ? "selected" : ""
                    }>10</option>
                    <option value="25" ${
                      itemsPerPage === 25 ? "selected" : ""
                    }>25</option>
                    <option value="50" ${
                      itemsPerPage === 50 ? "selected" : ""
                    }>50</option>
                    <option value="100" ${
                      itemsPerPage === 100 ? "selected" : ""
                    }>100</option>
                </select>
            </div>
            <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button id="prev-btn" class="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${
                      currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                    }" ${currentPage === 1 ? "disabled" : ""}>
                        <span class="sr-only">Previous</span>
                        <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    
                    ${pages
                      .map(
                        (p) => `
                        <button class="page-btn relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium ${
                          p === currentPage
                            ? "z-10 bg-pelorous-50 border-pelorous-500 text-pelorous-600"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }" data-page="${p}">
                            ${p}
                        </button>
                    `
                      )
                      .join("")}

                    <button id="next-btn" class="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${
                      end >= totalPages ? "cursor-not-allowed opacity-50" : ""
                    }" ${end >= totalPages ? "disabled" : ""}>
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
    const prevBtn = footer.querySelector("#prev-btn");
    const nextBtn = footer.querySelector("#next-btn");
    const pageBtns = footer.querySelectorAll(".page-btn");
    const limitSelect = footer.querySelector("#items-per-page");

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
    pageBtns.forEach((btn) => {
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
    if (isNaN(date.getTime())) return "Unknown";

    return date.toLocaleString("default", { weekday: "long" });
  }

  function renderAnniversariesTab() {
    anniversariesTabContent.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
    anniversariesTabContent.appendChild(grid);

    // --- Birthdays Section ---
    const birthdaysSection = document.createElement("div");
    birthdaysSection.innerHTML = `<h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Birthdays This Week</h3>`;

    const birthdaysTableContainer = document.createElement("div");
    birthdaysTableContainer.className =
      "shadow overflow-hidden border-b border-gray-200 sm:rounded-lg";

    const birthdaysTable = document.createElement("table");
    birthdaysTable.className = "min-w-full divide-y divide-gray-200";
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
    const birthdaysTbody = birthdaysTable.querySelector("tbody");

    birthdaysTableContainer.appendChild(birthdaysTable);
    birthdaysSection.appendChild(birthdaysTableContainer);
    grid.appendChild(birthdaysSection);

    // --- Retirees Section ---
    const retireesSection = document.createElement("div");
    retireesSection.innerHTML = `<h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Upcoming Retirees</h3>`;

    const retireesTableContainer = document.createElement("div");
    retireesTableContainer.className =
      "shadow overflow-hidden border-b border-gray-200 sm:rounded-lg";

    const retireesTable = document.createElement("table");
    retireesTable.className = "min-w-full divide-y divide-gray-200";
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
    const retireesTbody = retireesTable.querySelector("tbody");

    retireesTableContainer.appendChild(retireesTable);
    retireesSection.appendChild(retireesTableContainer);
    grid.appendChild(retireesSection);

    // Fetch Data
    Promise.all([
      fetch(
        "https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_birthdays_this_week"
      ).then((r) => r.json()),
      fetch(
        "https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_upcoming_retirees"
      ).then((r) => r.json()),
    ])
      .then(([birthdaysRes, retireesRes]) => {
        renderBirthdaysTable(birthdaysRes.message || [], birthdaysTbody);
        renderRetireesTable(retireesRes.message || [], retireesTbody);
      })
      .catch((err) => {
        console.error("Error fetching anniversaries:", err);
        if (birthdaysTbody)
          birthdaysTbody.innerHTML =
            '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-red-500">Error loading data</td></tr>';
        if (retireesTbody)
          retireesTbody.innerHTML =
            '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-red-500">Error loading data</td></tr>';
      });
  }

  // function renderDepartmentsTab() {
  //   departmentsTabContent.innerHTML = `
  //       <div class="space-y-4">
  //           <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
  //               <label for="department-select" class="text-sm font-medium text-gray-700">Select Department:</label>
  //               <select id="department-select" class="block w-64 pl-2 pr-8 py-1 text-sm border border-gray-300 focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500 rounded-md">
  //                   <option>Loading departments...</option>
  //               </select>
  //           </div>
  //           <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  //               <div class="lg:col-span-1 bg-white rounded-lg shadow-sm p-4 border flex flex-col justify-center items-center text-center">
  //                   <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
  //                   <h3 id="dept-total-employees" class="text-4xl font-bold text-pelorous-600 mt-2">-</h3>
  //                   <p id="dept-name-display" class="text-sm text-gray-500 mt-1">&nbsp;</p>
  //               </div>
  //               <div class="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 border">
  //                   <h3 class="text-base font-semibold text-gray-800 mb-3">Employees by Grade</h3>
  //                   <div id="dept-grade-chart" class="h-64 w-full"></div>
  //               </div>
  //           </div>
  //       </div>
  //   `;

  //   const deptSelect =
  //     departmentsTabContent.querySelector("#department-select");

  //   // Fetch departments for the dropdown
  //   fetch(
  //     "https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_parent_departments"
  //   )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const departments = data.results || [];
  //       deptSelect.innerHTML =
  //         '<option value="">-- Select a Department --</option>';
  //       departments.forEach((dept) => {
  //         const opt = document.createElement("option");
  //         opt.value = dept.value;
  //         opt.textContent = dept.value;
  //         deptSelect.appendChild(opt);
  //       });

  //       // Add event listener after populating
  //       deptSelect.addEventListener("change", (e) => {
  //         const department = e.target.value;
  //         if (department) {
  //           fetchDepartmentData(department);
  //         } else {
  //           // Clear chart and count if no department is selected
  //           document.getElementById("dept-total-employees").textContent = "-";
  //           document.getElementById("dept-name-display").innerHTML = "&nbsp;";
  //           const chartEl = document.getElementById("dept-grade-chart");
  //           const chartInstance = echarts.getInstanceByDom(chartEl);
  //           if (chartInstance) chartInstance.clear();
  //         }
  //       });
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching departments:", err);
  //       deptSelect.innerHTML = "<option>Could not load departments</option>";
  //     });
  // }

  function renderDepartmentsTab() {
    departmentsTabContent.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <!-- ✅ Parent Department -->
              <div class="lg:col-span-1 flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-700">
                  Parent Department
                </label>

                <input
                  id="parent-search"
                  type="text"
                  placeholder="Search department..."
                  class="w-full text-sm border rounded px-2 py-1 mb-1"
                />

                <select
                  id="department-select"
                  size="6"
                  class="w-full border rounded text-sm h-[10.5rem] overflow-y-auto"
                ></select>
              </div>

              <!-- ✅ Exclude Child Departments -->
              <div class="lg:col-span-1 flex flex-col gap-1">

                <!-- label + actions on SAME line -->
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">
                    Exclude Child Departments
                  </label>

                  <div class="flex gap-2 text-xs">
                    <button id="select-all" class="text-pelorous-600 hover:underline">
                      Select All
                    </button>
                    <button id="clear-all" class="text-gray-500 hover:underline">
                      Clear All
                    </button>
                  </div>
                </div>

                <select
                  id="department-exclude-select"
                  multiple
                  class="w-full text-xs border border-gray-300 rounded-md px-2 py-1
                        focus:ring-pelorous-500 focus:border-pelorous-500
                        h-[10.5rem] overflow-y-auto"
                ></select>
              </div>

            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="lg:col-span-1 bg-white rounded-lg shadow-sm p-4 border flex flex-col justify-center items-center text-center">
                    <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
                    <h3 id="dept-total-employees" class="text-4xl font-bold text-pelorous-600 mt-2">-</h3>
                    <p id="dept-name-display" class="text-sm text-gray-500 mt-1">&nbsp;</p>
                </div>
                <div class="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 border">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-base font-semibold text-gray-800">Employees by Rank</h3>
                        <span id="dept-summary-caption" class="text-[11px] text-gray-400"></span>
                    </div>
                    <div id="dept-grade-chart" class="h-64 w-full"></div>
                </div>
            </div>
        </div>
    `;

    const deptSelect =
      departmentsTabContent.querySelector("#department-select");
    const excludeSelect = departmentsTabContent.querySelector(
      "#department-exclude-select"
    );

    const totalEl = document.getElementById("dept-total-employees");
    const nameEl = document.getElementById("dept-name-display");
    const chartEl = document.getElementById("dept-grade-chart");
    const captionEl = document.getElementById("dept-summary-caption");

    const selectAllBtn = document.getElementById("select-all");
    const clearAllBtn = document.getElementById("clear-all");

    selectAllBtn.onclick = () => {
      Array.from(excludeSelect.options).forEach((opt) => (opt.selected = true));
      excludeSelect.dispatchEvent(new Event("change"));
    };

    clearAllBtn.onclick = () => {
      Array.from(excludeSelect.options).forEach(
        (opt) => (opt.selected = false)
      );
      excludeSelect.dispatchEvent(new Event("change"));
    };

    // Load parent departments
    fetch(
      "https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_parent_departments",
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((res) => {
        const departments = res.message?.results || [];

        deptSelect.innerHTML =
          '<option value="">-- Select a Parent Department --</option>';

        departments.forEach((dept) => {
          const opt = document.createElement("option");
          opt.value = dept.value;
          opt.textContent = dept.label;
          deptSelect.appendChild(opt);
        });
      })
      .catch((err) => {
        console.error("Error fetching parent departments:", err);
        deptSelect.innerHTML =
          "<option value=''>Could not load departments</option>";
      });

    const parentSearch = document.getElementById("parent-search");
    parentSearch.addEventListener("input", () => {
      const q = parentSearch.value.toLowerCase();
      Array.from(deptSelect.options).forEach((opt) => {
        opt.hidden = !opt.textContent.toLowerCase().includes(q);
      });
    });
    // When parent changes, load child departments + summary
    deptSelect.addEventListener("change", (e) => {
      const department = e.target.value;

      // Reset summary UI
      totalEl.textContent = department ? "..." : "-";
      // nameEl.textContent = department ? `in ${department}` : "\u00a0";
      nameEl.innerHTML = "&nbsp;";
      captionEl.textContent = "";
      clearDeptChart(chartEl);

      if (!department) {
        // reset children dropdown
        excludeSelect.innerHTML =
          "<option value=''>Select a parent department first</option>";
        excludeSelect.disabled = true;
        return;
      }

      excludeSelect.disabled = true;
      excludeSelect.innerHTML =
        "<option value=''>Loading child departments...</option>";

      // 1️⃣ Load children for multiselect
      fetch(
        `https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_child_departments?parent_department=${encodeURIComponent(
          department
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          const children = data.message?.results || [];
          excludeSelect.innerHTML = "";
          if (children.length === 0) {
            excludeSelect.innerHTML =
              "<option value=''>No child departments</option>";
            excludeSelect.disabled = true;
          } else {
            children.forEach((child) => {
              const opt = document.createElement("option");
              opt.value = child.value;
              opt.textContent = child.label;
              excludeSelect.appendChild(opt);
            });
            excludeSelect.disabled = false;
          }

          // After child departments loaded, fetch summary once (no exclusions yet)
          fetchDepartmentSummary(department, [], {
            totalEl,
            nameEl,
            captionEl,
            chartEl,
          });
        })
        .catch((err) => {
          console.error("Error fetching child departments:", err);
          excludeSelect.innerHTML =
            "<option value=''>Error loading child departments</option>";
          excludeSelect.disabled = true;
          totalEl.textContent = "Error";
        });
    });

    // When exclusions change, re-fetch summary
    excludeSelect.addEventListener("change", () => {
      const department = deptSelect.value;
      if (!department) return;

      const selectedChildren = Array.from(excludeSelect.selectedOptions)
        .map((opt) => opt.value)
        .filter((v) => v);

      fetchDepartmentSummary(department, selectedChildren, {
        totalEl,
        nameEl,
        captionEl,
        chartEl,
      });
    });
  }

  function clearDeptChart(chartEl) {
    if (!chartEl) return;
    const inst = echarts.getInstanceByDom(chartEl);
    if (inst) {
      inst.clear();
    }
  }

  // function fetchDepartmentSummary(department, excludedChildren, ctx) {
  //   const { totalEl, nameEl, captionEl, chartEl } = ctx;

  //   totalEl.textContent = "...";

  //   let subtitle = `in ${department}`;
  //   if (excludedChildren && excludedChildren.length > 0) {
  //     subtitle += ` (excluding ${excludedChildren.join(", ")})`;
  //   }
  //   nameEl.textContent = subtitle;

  //   const params = new URLSearchParams({
  //     parent_department: department,
  //   });

  //   if (excludedChildren && excludedChildren.length > 0) {
  //     params.append("exclude_departments", JSON.stringify(excludedChildren));
  //   }

  //   fetch(
  //     `https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_employee_summary_by_parent_department?${params.toString()}`
  //   )
  //     .then((res) => res.json())
  //     .then((res) => {
  //       const data = res.message || res; // depending on how Frappe wraps it

  //       const labels = data.labels || [];
  //       const counts = data.counts || [];
  //       const total = data.total || 0;

  //       totalEl.textContent = total;
  //       captionEl.textContent =
  //         labels.length > 0
  //           ? `Showing ${labels.length} rank${labels.length !== 1 ? "s" : ""}`
  //           : "No employees found for selected filters";

  //       // Render / update chart
  //       if (!chartEl) return;
  //       let chart = echarts.getInstanceByDom(chartEl);
  //       if (!chart) {
  //         chart = echarts.init(chartEl);
  //       }

  //       const option = {
  //         tooltip: {
  //           trigger: "axis",
  //           axisPointer: { type: "shadow" },
  //         },
  //         grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
  //         xAxis: {
  //           type: "category",
  //           data: labels,
  //           axisLabel: { rotate: 45, interval: 0, fontSize: 10 },
  //         },
  //         yAxis: { type: "value", name: "Employees" },
  //         series: [
  //           {
  //             name: "Male",
  //             type: "bar",
  //             stack: "total",
  //             data: data.male,
  //             itemStyle: { color: "#178fa3" }, // pelorous-600
  //           },
  //           {
  //             name: "Female",
  //             type: "bar",
  //             stack: "total",
  //             data: data.female,
  //             itemStyle: { color: "#adf0f4" }, // pelorous-200
  //           },
  //         ],
  //         itemStyle: {
  //           color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //             { offset: 0, color: "#34cedc" }, // pelorous-400
  //             { offset: 1, color: "#178fa3" }, // pelorous-600
  //           ]),
  //         },
  //       };

  //       chart.setOption(option);

  //       // Resize on window resize
  //       window.addEventListener("resize", () => {
  //         chart.resize();
  //       });
  //     })
  //     .catch((err) => {
  //       console.error(`Error fetching summary for ${department}:`, err);
  //       totalEl.textContent = "Error";
  //       captionEl.textContent = "Could not load summary";
  //       clearDeptChart(chartEl);
  //     });
  // }

  function fetchDepartmentSummary(
    parentDepartment,
    excludedDepartments,
    { totalEl, nameEl, captionEl, chartEl }
  ) {
    totalEl.textContent = "...";
    captionEl.textContent = "Loading…";

    const params = new URLSearchParams({
      parent_department: parentDepartment,
      exclude_departments: JSON.stringify(excludedDepartments),
    });

    fetch(
      `https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_employee_summary_by_parent_department?${params.toString()}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((res) => {
        const data = res.message;

        /* ✅ TOTAL */
        totalEl.textContent = data.total;

        /* ✅ FRIENDLY PARENT + EXCLUSIONS */
        nameEl.innerHTML = `
        <div>${data.parent_department_name}</div>
          ${
            data.excluded_departments?.length
              ? `<div class="mt-1 text-xs text-gray-400">
                  <div>Excluding:</div>
                  <ul class="list-disc ml-4">
                    ${data.excluded_departments
                      .map((d) => `<li>${d}</li>`)
                      .join("")}
                  </ul>
                </div>`
              : ""
          }
        `;
        const labels = data.labels || [];
        // captionEl.textContent = `${data.total} employees`;
        captionEl.textContent =
          labels.length > 0
            ? `Showing ${labels.length} rank${
                labels.length !== 1 ? "s" : ""
              } \n`
            : "No employees found for selected filters";
        // captionEl.textContent += `${data.total} employees`;

        /* ✅ CHART */
        renderDepartmentGradeChart(chartEl, data);
      })
      .catch((err) => {
        console.error("Error fetching department summary:", err);
        totalEl.textContent = "Error";
        captionEl.textContent = "";
        clearDeptChart(chartEl);
      });
  }

  function renderDepartmentGradeChart(el, data) {
    clearDeptChart(el);

    if (!data.labels || data.labels.length === 0) return;

    const chart = echarts.init(el);

    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { top: 0 },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.labels,
        axisLabel: { rotate: 45, fontSize: 11 },
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "Male",
          type: "bar",
          stack: "total",
          data: data.male,
          itemStyle: { color: "#178fa3" }, // pelorous-600
        },
        {
          name: "Female",
          type: "bar",
          stack: "total",
          data: data.female,
          itemStyle: { color: "#adf0f4" }, // pelorous-200
        },
      ],
    });

    /* ✅ CLICK → DRILL DOWN */
    chart.off("click");
    chart.on("click", (params) => {
      const grade = params.name;

      const query = new URLSearchParams({
        grade,
        parent_department: currentParentDepartment(),
        exclude_departments: JSON.stringify(currentExcludedDepartments()),
      });

      window.location.hash = `/employees?${query.toString()}`;
    });
  }

  function currentParentDepartment() {
    return document.getElementById("department-select")?.value;
  }

  function currentExcludedDepartments() {
    return Array.from(
      document.getElementById("department-exclude-select")?.selectedOptions ||
        []
    ).map((o) => o.value);
  }

  // function fetchDepartmentData(department) {
  //   const totalEl = document.getElementById("dept-total-employees");
  //   const nameEl = document.getElementById("dept-name-display");
  //   const chartEl = document.getElementById("dept-grade-chart");

  //   totalEl.textContent = "...";
  //   nameEl.textContent = `in ${department}`;

  //   const query = `?department=${encodeURIComponent(department)}`;
  //   fetch(
  //     `https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_employees_by_rank${query}`
  //   )
  //     .then((res) => res.json())
  //     .then((res) => {
  //       const data = res.message;
  //       if (!data || !data.labels || !data.male || !data.female) {
  //         throw new Error("Invalid data format from API");
  //       }

  //       const total =
  //         data.male.reduce((sum, val) => sum + val, 0) +
  //         data.female.reduce((sum, val) => sum + val, 0);
  //       totalEl.textContent = total;

  //       // Render Chart
  //       const myChart = echarts.init(chartEl);
  //       const option = {
  //         tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  //         legend: { data: ["Male", "Female"], top: "0%" },
  //         grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  //         xAxis: {
  //           type: "category",
  //           data: data.labels,
  //           axisLabel: { rotate: 45, interval: 0, fontSize: 10 },
  //         },
  //         yAxis: { type: "value" },
  //         series: [
  //           {
  //             name: "Male",
  //             type: "bar",
  //             stack: "total",
  //             emphasis: { focus: "series" },
  //             data: data.male,
  //             color: "#178fa3",
  //           },
  //           {
  //             name: "Female",
  //             type: "bar",
  //             stack: "total",
  //             emphasis: { focus: "series" },
  //             data: data.female,
  //             color: "#adf0f4",
  //           },
  //         ],
  //       };
  //       myChart.setOption(option);

  //       window.addEventListener("resize", () => {
  //         myChart.resize();
  //       });
  //     })
  //     .catch((err) => {
  //       console.error(`Error fetching data for ${department}:`, err);
  //       totalEl.textContent = "Error";
  //       const chartInstance = echarts.getInstanceByDom(chartEl);
  //       if (chartInstance) chartInstance.clear();
  //     });
  // }

  function renderBirthdaysTable(data, tbody) {
    if (!tbody) return;
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">No birthdays this week</td></tr>';
      return;
    }

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.toLocaleString("default", { month: "long" });

    const grouped = {};
    data.forEach((row) => {
      const dob = row.dob;
      const weekday = getWeekdayFromDOB(dob);

      if (!grouped[weekday]) grouped[weekday] = [];

      const isToday =
        dob?.includes(todayDay.toString()) && dob?.includes(todayMonth);

      grouped[weekday].push({
        employee: (row.employee || "").toUpperCase(),
        cell_number: row.cell_number || "",
        dob: isToday ? `🎉 ${row.dob}` : row.dob,
        highlight: isToday,
      });
    });

    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    daysOfWeek.forEach((day) => {
      if (grouped[day] && grouped[day].length > 0) {
        const headerRow = document.createElement("tr");
        headerRow.className = "bg-gray-100";
        headerRow.innerHTML = `
                  <td colspan="3" class="px-3 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">${day}</td>
              `;
        tbody.appendChild(headerRow);

        grouped[day].forEach((entry) => {
          const tr = document.createElement("tr");
          if (entry.highlight) tr.className = "bg-yellow-50";

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
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="px-3 py-4 text-center text-xs text-gray-500">No upcoming retirees</td></tr>';
      return;
    }

    data.forEach((row) => {
      const tr = document.createElement("tr");
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
