import { employees } from '../data/mockData.js';
import { ROUTER_BASE } from '../config.js';

export function EmployeeDetails(params) {
  const container = document.createElement('div');
  container.className = 'p-3'; // Reduced padding

  const employeeId = decodeURIComponent(params.id);
  let employee = null; // Always fetch fresh data

  // Initial Loading State
  container.innerHTML = `
    <div class="flex justify-center items-center h-64">
        <svg class="animate-spin h-8 w-8 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2 text-lg text-gray-500">Loading employee details...</span>
    </div>
  `;

  // Fetch from API
  const query = new URLSearchParams({ employee_id: employeeId }).toString();

  // Fetch Details, Work History, Leave History, and Training History in parallel
  Promise.all([
    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_employee_details?${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    }).then(res => res.json()),
    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_work_history?${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    }).then(res => res.json()),
    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_leave_history?${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    }).then(res => res.json()),
    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_training_history?${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    }).then(res => res.json())
  ])
    .then(([detailsData, historyData, leaveData, trainingData]) => {
      const apiData = detailsData.message;
      if (!apiData) throw new Error('Employee not found');

      const workHistory = Array.isArray(historyData.message) ? historyData.message : [];
      const leaveHistoryData = leaveData.message || {};
      const leaveHistory = Array.isArray(leaveHistoryData.leave_history) ? leaveHistoryData.leave_history : [];
      const leaveBalances = Array.isArray(leaveHistoryData.leave_balances) ? leaveHistoryData.leave_balances : [];
      const trainingHistory = Array.isArray(trainingData.message) ? trainingData.message : [];

      // Map API data to internal structure
      employee = {
        id: apiData.name,
        name: apiData.employee_name,
        role: apiData.designation || apiData.grade || 'Employee',
        department: apiData.department_name || apiData.department,
        status: apiData.status,
        image: apiData.image ? `https://jupiter.ncc.gov.gh${apiData.image}` : null,
        personalInfo: {
          dob: apiData.date_of_birth,
          nationalId: apiData.custom_personal_id_number,
          gender: apiData.gender,
          ssnit: apiData.ssnit_number,
          staffId: apiData.custom_staff_id,
          pfNo: apiData.employee_number,
          rank: apiData.grade,
          designation: apiData.designation
        },
        addressContacts: {
          currentAddress: apiData.current_address,
          permanentAddress: apiData.permanent_address,
          hometown: apiData.custom_hometown,
          region: apiData.custom_hometown_region,
          phone: apiData.cell_number,
          altPhone: apiData.custom_additional_mobile_number,
          email: apiData.personal_email,
          emergencyContact: {
            name: apiData.person_to_be_contacted,
            number: apiData.emergency_phone_number,
            relation: apiData.relation
          }
        },
        jobDetails: {
          acceptanceDate: apiData.custom_acceptance_date,
          assumptionDutyDate: apiData.assumption_of_duty,
          confirmationDate: apiData.final_confirmation_date,
          retirementDate: apiData.date_of_retirement,
          reportsTo: apiData.reports_to_name,
          lastPromotionDate: null // Not in API
        },
        workHistory: workHistory,
        leaveHistory: leaveHistory,
        leaveBalance: leaveBalances,
        trainingHistory: trainingHistory
      };
      renderContent();
    })
    .catch(err => {
      console.error("Error fetching employee details:", err);
      container.innerHTML = `
        <div class="text-center py-12">
          <h2 class="text-lg font-bold text-gray-900">Employee Not Found</h2>
          <p class="mt-2 text-base text-gray-500">The employee with ID ${employeeId} does not exist or could not be loaded.</p>
          <a href="#/employees" class="mt-4 inline-block text-pelorous-600 hover:text-pelorous-500 text-base">Back to Employees</a>
        </div>
      `;
    });

  // ... (renderContent and other functions) ...



  function renderContent() {
    container.innerHTML = '';

    // --- Header Section ---
    const header = document.createElement('div');
    header.className = 'bg-white shadow overflow-hidden sm:rounded-lg mb-3'; // Reduced margin
    header.innerHTML = `
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div class="flex items-center">
          <img class="h-24 w-24 rounded-full mr-5 border-4 border-white shadow-sm" src="${employee.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=128`}" alt="">
          <div>
            <h3 class="text-2xl leading-7 font-bold text-gray-900">${employee.name}</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">${employee.role} • ${employee.department}</p>
          </div>
        </div>
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
          ${employee.status}
        </span>
      </div>
    `;
    container.appendChild(header);

    // --- Tabs Navigation ---
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'mb-3 border-b border-gray-200'; // Reduced margin

    const tabs = [
      { id: 'general', label: 'General' },
      { id: 'job', label: 'Job Details' },
      { id: 'history', label: 'Internal Work History' },
      { id: 'leave', label: 'Leave History' },
      { id: 'training', label: 'Training History' }
    ];

    const tabNav = document.createElement('nav');
    tabNav.className = '-mb-px flex space-x-4'; // Reduced spacing
    tabNav.ariaLabel = 'Tabs';

    // Determine active tab from URL params
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const requestedTab = urlParams.get('tab');
    let activeTab = requestedTab && tabs.some(t => t.id === requestedTab) ? requestedTab : 'general';

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.textContent = tab.label;

      const updateClass = () => {
        btn.className = `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
          ? 'border-pelorous-500 text-pelorous-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`;
      };

      updateClass();

      btn.onclick = () => {
        activeTab = tab.id;
        // Update all buttons
        Array.from(tabNav.children).forEach((child, index) => {
          const t = tabs[index];
          child.className = `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === t.id
            ? 'border-pelorous-500 text-pelorous-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`;
        });
        renderTabContent(activeTab);
      };

      tabNav.appendChild(btn);
    });

    tabsContainer.appendChild(tabNav);
    container.appendChild(tabsContainer);

    // --- Tab Content Container ---
    const contentContainer = document.createElement('div');
    contentContainer.className = 'bg-white shadow overflow-hidden sm:rounded-lg p-3'; // Reduced padding
    container.appendChild(contentContainer);

    // --- Render Functions ---
    function renderTabContent(tabId) {
      contentContainer.innerHTML = '';
      switch (tabId) {
        case 'general':
          contentContainer.appendChild(renderGeneralTab(employee));
          break;
        case 'job':
          contentContainer.appendChild(renderJobDetailsTab(employee));
          break;
        case 'history':
          contentContainer.appendChild(renderWorkHistoryTab(employee));
          break;
        case 'leave':
          contentContainer.appendChild(renderLeaveHistoryTab(employee));
          break;
        case 'training':
          contentContainer.appendChild(renderTrainingHistoryTab(employee));
          break;
      }
    }

    // Initial Render
    renderTabContent(activeTab);
  }

  return container;
}

// Helper to format date as "8 Jun 2025"
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function renderGeneralTab(employee) {
  const div = document.createElement('div');
  const info = employee.personalInfo || {};
  const contact = employee.addressContacts || {};
  const emergency = contact.emergencyContact || {};

  div.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <!-- Reduced gap -->
      <!-- Personal Information -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-1">Personal Information</h4> <!-- Reduced text size/margin -->
        <dl class="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2"> <!-- Reduced gap -->
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Date of Birth</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(info.dob)}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">National ID</dt><dd class="mt-0.5 text-xs text-gray-900">${info.nationalId || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Gender</dt><dd class="mt-0.5 text-xs text-gray-900">${info.gender || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">SSNIT No</dt><dd class="mt-0.5 text-xs text-gray-900">${info.ssnit || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Staff ID</dt><dd class="mt-0.5 text-xs text-gray-900">${info.staffId || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">PF No</dt><dd class="mt-0.5 text-xs text-gray-900">${info.pfNo || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Rank</dt><dd class="mt-0.5 text-xs text-gray-900">${info.rank || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Designation</dt><dd class="mt-0.5 text-xs text-gray-900">${info.designation || '-'}</dd></div>
        </dl>
      </div>

      <!-- Address & Contacts -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-1">Address & Contacts</h4>
        <dl class="grid grid-cols-1 gap-x-3 gap-y-2">
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Current Address</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.currentAddress || '-'}</dd></div>
          <div class="sm:col-span-1"><dt class="text-sm font-medium text-gray-500">Permanent Address</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.permanentAddress || '-'}</dd></div>
          <div class="grid grid-cols-2 gap-3">
            <div><dt class="text-sm font-medium text-gray-500">Hometown</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.hometown || '-'}</dd></div>
            <div><dt class="text-sm font-medium text-gray-500">Region</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.region || '-'}</dd></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><dt class="text-sm font-medium text-gray-500">Phone</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.phone || '-'}</dd></div>
            <div><dt class="text-sm font-medium text-gray-500">Alt Phone</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.altPhone || '-'}</dd></div>
          </div>
          <div><dt class="text-sm font-medium text-gray-500">Email</dt><dd class="mt-0.5 text-xs text-gray-900">${contact.email || '-'}</dd></div>
          
          <div class="mt-2 pt-2 border-t">
            <h5 class="text-xs font-medium text-gray-900 mb-1">Emergency Contact</h5>
            <div class="grid grid-cols-1 gap-0.5">
               <div class="text-xs text-gray-900"><span class="text-gray-500">Name:</span> ${emergency.name || '-'}</div>
               <div class="text-xs text-gray-900"><span class="text-gray-500">Number:</span> ${emergency.number || '-'}</div>
               <div class="text-xs text-gray-900"><span class="text-gray-500">Relation:</span> ${emergency.relation || '-'}</div>
            </div>
          </div>
        </dl>
      </div>
    </div>
  `;
  return div;
}

function renderJobDetailsTab(employee) {
  const div = document.createElement('div');
  const job = employee.jobDetails || {};

  div.innerHTML = `
    <h4 class="text-lg font-medium text-gray-900 mb-2 border-b pb-1">Job Details</h4>
    <dl class="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
      <div><dt class="text-sm font-medium text-gray-500">Acceptance Date</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(job.acceptanceDate)}</dd></div>
      <div><dt class="text-sm font-medium text-gray-500">Assumption of Duty</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(job.assumptionDutyDate)}</dd></div>
      <div><dt class="text-sm font-medium text-gray-500">Confirmation Date</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(job.confirmationDate)}</dd></div>
      <div><dt class="text-sm font-medium text-gray-500">Date of Retirement</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(job.retirementDate)}</dd></div>
      <div><dt class="text-sm font-medium text-gray-500">Reports To</dt><dd class="mt-0.5 text-xs text-gray-900">${job.reportsTo || '-'}</dd></div>
      <div><dt class="text-sm font-medium text-gray-500">Last Promotion Date</dt><dd class="mt-0.5 text-xs text-gray-900">${formatDate(job.lastPromotionDate)}</dd></div>
    </dl>
  `;
  return div;
}

function renderWorkHistoryTab(employee) {
  const div = document.createElement('div');
  const history = employee.workHistory || [];

  div.innerHTML = `
    <h4 class="text-lg font-medium text-gray-900 mb-2">Internal Work History</h4>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
            <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
            <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
            <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${history.length > 0 ? history.map(item => `
            <tr>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-900">${item.department}</td>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.from_date}</td>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.to_date}</td>
              <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.duration}</td>
            </tr>
          `).join('') : '<tr><td colspan="4" class="px-3 py-1.5 text-center text-xs text-gray-500">No work history available</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  return div;
}

function renderLeaveHistoryTab(employee) {
  const div = document.createElement('div');
  const history = employee.leaveHistory || [];
  const balance = employee.leaveBalance || [];

  div.innerHTML = `
    <div class="space-y-4"> <!-- Reduced spacing -->
      <!-- Leave Balance -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">Leave Balance</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${balance.length > 0 ? balance.map(item => `
                <tr>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">${item.leave_type}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.allocated}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.used}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.pending}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs font-bold text-pelorous-600">${item.balance}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="px-3 py-1.5 text-center text-xs text-gray-500">No leave balance data</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Leave History -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-2">Leave History</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                <th class="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Days</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${history.length > 0 ? history.map(item => `
                <tr>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">${item.leave_type}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${formatDate(item.from_date)}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${formatDate(item.to_date)}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.total_leave_days}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" class="px-3 py-1.5 text-center text-xs text-gray-500">No leave history available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  return div;
}

function renderTrainingHistoryTab(employee) {
  const div = document.createElement('div');
  const history = employee.trainingHistory || [];

  // Group by year
  const groupedHistory = history.reduce((acc, item) => {
    const year = item.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(item);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(groupedHistory).sort((a, b) => b - a);

  let tableRows = '';

  if (history.length === 0) {
    tableRows = '<tr><td colspan="6" class="px-3 py-1.5 text-center text-xs text-gray-500">No training history available</td></tr>';
  } else {
    sortedYears.forEach(year => {
      const items = groupedHistory[year];
      items.forEach((item, index) => {
        tableRows += '<tr>';
        // Only add the year cell for the first item of the year
        if (index === 0) {
          tableRows += `<td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-900 align-top bg-gray-50 font-medium" rowspan="${items.length}">${year}</td>`;
        }
        tableRows += `
                  <td class="px-3 py-1.5 text-xs font-medium text-pelorous-600 hover:text-pelorous-900 cursor-pointer" onclick="window.location.hash = '/training/${encodeURIComponent(item.name)}'">${item.name_of_programme}</td>
                  <td class="px-3 py-1.5 text-xs text-gray-500">${item.institution || '-'}</td>
                  <td class="px-3 py-1.5 text-xs text-gray-500">${item.venue || '-'}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.start_date || '-'}</td>
                  <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.end_date || '-'}</td>
              </tr>`;
      });
    });
  }

  div.innerHTML = `
    <h4 class="text-lg font-medium text-gray-900 mb-2">Training History</h4>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 border border-gray-200 table-fixed">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-[8%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Year</th>
            <th class="w-[27%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Programme</th>
            <th class="w-[20%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Institution</th>
            <th class="w-[20%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Venue</th>
            <th class="w-[12.5%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Start Date</th>
            <th class="w-[12.5%] px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">End Date</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
  return div;
}
