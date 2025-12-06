import * as echarts from 'echarts';

export function Armoury() {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4'; // Reduced padding/spacing to match Dashboard

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'flex flex-col md:flex-row md:items-center justify-between gap-4';
  header.innerHTML = `
    <div>
      <h1 class="text-xl font-bold text-gray-900">Armoury Dashboard</h1>
      <p class="text-sm text-gray-500">Overview of stock, issuances, and maintenance</p>
    </div>
    <div class="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
      <span class="text-sm text-gray-500 font-medium">Period:</span>
      <select id="period_select" class="text-sm border-none focus:ring-0 text-gray-700 font-semibold bg-transparent cursor-pointer">
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
        <option value="365">Last Year</option>
      </select>
    </div>
  `;
  container.appendChild(header);

  // --- KPI Cards ---
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4';

  const kpis = [
    { id: 'kpi_active_issuances', title: 'Total Issuances', value: '-', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'kpi_currently_issued', title: 'Currently Issued', value: '-', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
    { id: 'kpi_overdue', title: 'Overdue', value: '-', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'kpi_stock_alerts', title: 'Low Stock Items', value: '-', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'kpi_maintenance_due', title: 'Maintenance Due', value: '-', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'kpi_maintenance_cost', title: 'Maint. Cost', value: '-', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  kpis.forEach(kpi => {
    const card = document.createElement('div');
    // Matched Dashboard.js stat card style
    card.className = 'bg-pelorous-900 rounded-xl shadow-sm p-5 border border-pelorous-800 hover:shadow-md transition-all duration-300';

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <p class="text-sm font-semibold text-pelorous-200 uppercase tracking-wider min-h-[2.5rem] flex items-start">${kpi.title}</p>
          <h3 class="text-3xl font-bold text-white mt-1" id="${kpi.id}">${kpi.value}</h3>
        </div>
        <div class="p-2 rounded-lg bg-pelorous-800 text-pelorous-100">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${kpi.icon}" />
          </svg>
        </div>
      </div>
    `;
    kpiGrid.appendChild(card);
  });
  container.appendChild(kpiGrid);

  // --- Tabs Navigation ---
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'border-b border-gray-200';
  tabsContainer.innerHTML = `
    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
      <button class="tab-btn border-pelorous-500 text-pelorous-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="overview">Overview</button>
      <button class="tab-btn border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="issuances">Issuances</button>
      <button class="tab-btn border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="returns">Returns</button>
      <button class="tab-btn border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" data-tab="inventory">Inventory & Maintenance</button>
    </nav>
  `;
  container.appendChild(tabsContainer);

  // --- Tab Contents ---
  const contentContainer = document.createElement('div');
  contentContainer.className = 'mt-4';

  // 1. Overview Tab
  const overviewTab = document.createElement('div');
  overviewTab.id = 'tab_overview';
  overviewTab.className = 'space-y-4';
  overviewTab.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Issuance Status Distribution</h3>
        <div id="chart_status" class="h-64 w-full"></div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Issuances by Purpose</h3>
        <div id="chart_purpose" class="h-64 w-full"></div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Employees by Issuance</h3>
        <div id="chart_employees" class="h-64 w-full"></div>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Maintenance Cost by Type</h3>
        <div id="chart_maintenance_cost" class="h-64 w-full"></div>
      </div>
    </div>
  `;
  contentContainer.appendChild(overviewTab);

  // 2. Issuances Tab
  const issuancesTab = document.createElement('div');
  issuancesTab.id = 'tab_issuances';
  issuancesTab.className = 'space-y-6 hidden';
  issuancesTab.innerHTML = `
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Active Issuances</h3>
        <button class="text-sm text-pelorous-600 hover:text-pelorous-800 font-medium">View All</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Due</th>
            </tr>
          </thead>
          <tbody id="table_active_issuances" class="bg-white divide-y divide-gray-200">
            <tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-red-100">
      <div class="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-red-800">Overdue Issuances</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued To</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Return</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue By</th>
            </tr>
          </thead>
          <tbody id="table_overdue_issuances" class="bg-white divide-y divide-gray-200">
            <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  contentContainer.appendChild(issuancesTab);

  // 3. Returns Tab
  const returnsTab = document.createElement('div');
  returnsTab.id = 'tab_returns';
  returnsTab.className = 'space-y-6 hidden';
  returnsTab.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Recent Return Inspections</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returned By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody id="table_return_inspections" class="bg-white divide-y divide-gray-200">
            <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  contentContainer.appendChild(returnsTab);

  // 4. Inventory Tab
  const inventoryTab = document.createElement('div');
  inventoryTab.id = 'tab_inventory';
  inventoryTab.className = 'space-y-6 hidden';
  inventoryTab.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Stock Alerts</h3>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shortage</th>
              </tr>
            </thead>
            <tbody id="table_stock_alerts" class="bg-white divide-y divide-gray-200">
              <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Upcoming Maintenance</h3>
        </div>
        <div class="overflow-x-auto flex-1">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due In</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody id="table_maintenance" class="bg-white divide-y divide-gray-200">
              <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Maintenance Cost Breakdown</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
              </tr>
            </thead>
            <tbody id="table_maintenance_cost" class="bg-white divide-y divide-gray-200">
              <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            </tbody>
          </table>
        </div>
    </div>
  `;
  contentContainer.appendChild(inventoryTab);
  container.appendChild(contentContainer);

  // --- Tab Logic ---
  const tabBtns = tabsContainer.querySelectorAll('.tab-btn');
  const tabs = {
    overview: overviewTab,
    issuances: issuancesTab,
    returns: returnsTab,
    inventory: inventoryTab
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset styles
      tabBtns.forEach(b => {
        b.classList.remove('border-pelorous-500', 'text-pelorous-600');
        b.classList.add('border-transparent', 'text-gray-500');
      });
      // Set active style
      btn.classList.remove('border-transparent', 'text-gray-500');
      btn.classList.add('border-pelorous-500', 'text-pelorous-600');

      // Show content
      Object.values(tabs).forEach(t => t.classList.add('hidden'));
      tabs[btn.dataset.tab].classList.remove('hidden');

      // Resize charts if overview
      if (btn.dataset.tab === 'overview') {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    });
  });

  // --- Data Fetching ---
  const loadData = () => {
    const period = document.getElementById('period_select').value;
    // Calculate date_from based on period
    const today = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(today.getDate() - parseInt(period));
    const dateFromStr = dateFrom.toISOString().split('T')[0];
    const dateToStr = today.toISOString().split('T')[0];

    fetchIssuanceStats(dateFromStr, dateToStr);
    fetchStockAlerts();
    fetchUpcomingMaintenance();
    fetchUpcomingMaintenance();
    fetchActiveIssuances();
    fetchOverdueIssuances();
    fetchReturnInspections();
    fetchMaintenanceCosts(dateFromStr, dateToStr);
  };

  // Initial Load
  setTimeout(loadData, 0);

  // Reload on period change
  container.querySelector('#period_select').addEventListener('change', loadData);

  return container;
}

// --- API Helpers ---

function fetchIssuanceStats(dateFrom, dateTo) {
  fetch(`/api/method/nacoc_armoury.api.get_issuance_statistics?date_from=${dateFrom}&date_to=${dateTo}`)
    .then(res => res.json())
    .then(data => {
      const stats = data.message;
      if (!stats) return;

      // KPIs
      if (stats.summary) {
        document.getElementById('kpi_active_issuances').textContent = stats.summary.total_issuances || 0;
        document.getElementById('kpi_currently_issued').textContent = (stats.summary.issued_count || 0) + (stats.summary.overdue_count || 0);
        document.getElementById('kpi_overdue').textContent = stats.summary.overdue_count || 0;

        renderStatusChart(stats.summary);
      }

      if (stats.by_purpose) renderPurposeChart(stats.by_purpose);
      if (stats.by_employee) renderEmployeesChart(stats.by_employee);
    })
    .catch(err => console.error('Error fetching stats:', err));
}

function fetchStockAlerts() {
  fetch('/api/method/nacoc_armoury.api.get_stock_alerts')
    .then(res => res.json())
    .then(data => {
      const alerts = data.message?.alerts || [];
      document.getElementById('kpi_stock_alerts').textContent = data.message?.total_alerts || 0;

      const tbody = document.getElementById('table_stock_alerts');
      if (!tbody) return;
      tbody.innerHTML = alerts.length ? '' : '<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No alerts</td></tr>';

      alerts.forEach(a => {
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="font-medium">${a.item_label || a.item_name}</div>
              <div class="text-xs text-gray-500">${a.item_type}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${a.qty_on_hand} / ${a.minimum_stock_level}</td>
            <td class="px-6 py-4 text-sm text-red-600 font-medium">-${a.shortage}</td>
          </tr>
        `;
      });
    });
}

function fetchUpcomingMaintenance() {
  fetch('/api/method/nacoc_armoury.api.get_upcoming_maintenance')
    .then(res => res.json())
    .then(data => {
      const items = data.message?.items || [];
      document.getElementById('kpi_maintenance_due').textContent = data.message?.total_due || 0;

      const tbody = document.getElementById('table_maintenance');
      if (!tbody) return;
      tbody.innerHTML = items.length ? '' : '<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No upcoming maintenance</td></tr>';

      items.forEach(i => {
        const isOverdue = i.days_until_due < 0;
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="font-medium">${i.item_label || i.name}</div>
              <div class="text-xs text-gray-500">${i.item_type}</div>
            </td>
            <td class="px-6 py-4 text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}">
              ${isOverdue ? `Overdue ${Math.abs(i.days_until_due)} days` : `${i.days_until_due} days`}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                ${isOverdue ? 'Overdue' : 'Due Soon'}
              </span>
            </td>
          </tr>
        `;
      });
    });
}

function fetchActiveIssuances() {
  fetch('/api/method/nacoc_armoury.api.filter_issuances?filters={"status":["Issued"]}')
    .then(res => res.json())
    .then(data => {
      const items = data.message?.results || [];
      const tbody = document.getElementById('table_active_issuances');
      if (!tbody) return;
      tbody.innerHTML = items.length ? '' : '<tr><td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No active issuances</td></tr>';

      items.forEach(i => {
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">
              <a href="#/armoury/issuance/${i.name}" class="text-pelorous-600 hover:text-pelorous-800 hover:underline">${i.name}</a>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${i.issued_to}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${i.purpose}</td>
            <td class="px-6 py-4 text-sm"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">${i.status}</span></td>
            <td class="px-6 py-4 text-sm text-gray-500">${i.expected_return}</td>
          </tr>
        `;
      });
    });
}

function fetchOverdueIssuances() {
  fetch('/api/method/nacoc_armoury.api.filter_issuances?filters={"overdue_only":true}')
    .then(res => res.json())
    .then(data => {
      const items = data.message?.results || [];
      const tbody = document.getElementById('table_overdue_issuances');
      if (!tbody) return;
      tbody.innerHTML = items.length ? '' : '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No overdue issuances</td></tr>';

      items.forEach(i => {
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">
              <a href="#/armoury/issuance/${i.name}" class="text-pelorous-600 hover:text-pelorous-800 hover:underline">${i.name}</a>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${i.issued_to}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${i.expected_return}</td>
            <td class="px-6 py-4 text-sm text-red-600 font-bold">${i.duration_days} days</td>
          </tr>
        `;
      });
    });
}

function fetchReturnInspections() {
  fetch('/api/method/nacoc_armoury.api.get_return_inspections?limit=5')
    .then(res => res.json())
    .then(data => {
      const inspections = data.message?.results || [];
      const tbody = document.getElementById('table_return_inspections');
      if (!tbody) return;
      tbody.innerHTML = inspections.length ? '' : '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No recent return inspections</td></tr>';

      inspections.forEach(inspection => {
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">
              <a href="#/armoury/return-inspection/${inspection.name}" class="text-pelorous-600 hover:text-pelorous-800 hover:underline">${inspection.name}</a>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">${inspection.returned_by_name || inspection.returned_by}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${inspection.inspection_date}</td>
            <td class="px-6 py-4 text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inspection.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                ${inspection.status}
              </span>
            </td>
          </tr>
        `;
      });
    });
}

function fetchMaintenanceCosts(dateFrom, dateTo) {
  fetch(`/api/method/nacoc_armoury.api.calculate_maintenance_cost?start_date=${dateFrom}&end_date=${dateTo}`)
    .then(res => res.json())
    .then(data => {
      const summary = data.message?.summary;
      const breakdown = data.message?.by_service_type || {};

      if (summary) {
        document.getElementById('kpi_maintenance_cost').textContent = '$' + (summary.total_cost || 0).toLocaleString();
      }

      const tbody = document.getElementById('table_maintenance_cost');
      if (tbody) {
        tbody.innerHTML = Object.keys(breakdown).length ? '' : '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No data</td></tr>';
        Object.entries(breakdown).forEach(([type, stats]) => {
          tbody.innerHTML += `
            <tr>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">${type}</td>
              <td class="px-6 py-4 text-sm text-gray-500">${stats.count}</td>
              <td class="px-6 py-4 text-sm text-gray-500">$${stats.total.toLocaleString()}</td>
              <td class="px-6 py-4 text-sm text-gray-500">$${stats.average.toFixed(2)}</td>
            </tr>
          `;
        });
      }

      renderCostChart(breakdown);
    });
}

// --- Chart Renderers (Updated Colors) ---

const PELOROUS_COLORS = ['#178fa3', '#adf0f4', '#74e4ec', '#34cedc', '#18aebe'];

function renderStatusChart(summary) {
  const chartEl = document.getElementById('chart_status');
  if (!chartEl) return;
  const myChart = echarts.init(chartEl);
  myChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      color: PELOROUS_COLORS,
      data: [
        { value: summary.issued_count, name: 'Issued' },
        { value: summary.returned_count, name: 'Returned' },
        { value: summary.overdue_count, name: 'Overdue' },
        { value: summary.draft_count, name: 'Draft' }
      ]
    }]
  });
  window.addEventListener('resize', () => myChart.resize());
}

function renderPurposeChart(data) {
  const chartEl = document.getElementById('chart_purpose');
  if (!chartEl) return;
  const myChart = echarts.init(chartEl);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.purpose), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: data.map(d => d.count),
      itemStyle: { color: '#178fa3' } // Pelorous 600
    }]
  });
  window.addEventListener('resize', () => myChart.resize());
}

function renderEmployeesChart(data) {
  const chartEl = document.getElementById('chart_employees');
  if (!chartEl) return;
  const top5 = data.slice(0, 5);
  const myChart = echarts.init(chartEl);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: top5.map(d => d.issued_to).reverse() },
    series: [{
      type: 'bar',
      data: top5.map(d => d.count).reverse(),
      itemStyle: { color: '#178fa3' } // Pelorous 600
    }]
  });
  window.addEventListener('resize', () => myChart.resize());
}

function renderCostChart(breakdown) {
  const chartEl = document.getElementById('chart_maintenance_cost');
  if (!chartEl) return;
  const data = Object.entries(breakdown).map(([name, stats]) => ({ value: stats.total, name }));
  const myChart = echarts.init(chartEl);
  myChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      color: PELOROUS_COLORS,
      data: data
    }]
  });
  window.addEventListener('resize', () => myChart.resize());
}
