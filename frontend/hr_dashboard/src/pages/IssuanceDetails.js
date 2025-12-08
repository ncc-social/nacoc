export function IssuanceDetails(params) {
  const issuanceId = params.id || params; // Handle both object {id: "..."} and direct string "..."
  const container = document.createElement('div');
  container.className = 'p-4 space-y-6';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'flex flex-col md:flex-row md:items-center justify-between gap-4';
  header.innerHTML = `
    <div class="flex items-center gap-4">
      <button id="back_btn" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      </button>
      <div>
        <h1 class="text-xl font-bold text-gray-900">Issuance Details</h1>
        <p class="text-sm text-gray-500">ID: <span class="font-mono text-gray-700">${issuanceId}</span></p>
      </div>
    </div>
    <div id="status_badge"></div>
  `;
  container.appendChild(header);

  // --- Content Grid ---
  const contentGrid = document.createElement('div');
  contentGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-6';

  // Left Column: General Info
  const leftCol = document.createElement('div');
  leftCol.className = 'lg:col-span-1 space-y-6';
  leftCol.innerHTML = `
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">General Information</h3>
      <div class="space-y-4">
        <div>
          <label class="text-xs text-gray-400 block">Issued To</label>
          <div class="text-sm font-medium text-gray-900" id="info_issued_to">-</div>
        </div>
        <div>
          <label class="text-xs text-gray-400 block">Purpose</label>
          <div class="text-sm font-medium text-gray-900" id="info_purpose">-</div>
        </div>
        <div>
          <label class="text-xs text-gray-400 block">Authorised By</label>
          <div class="text-sm font-medium text-gray-900" id="info_authorised_by">-</div>
          <div class="text-xs text-gray-500" id="info_authoriser_pos"></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Timeline</h3>
      <div class="">
        <div class="relative pl-4 border-l-2 border-gray-200 pb-8">
          <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300"></div>
          <label class="text-xs text-gray-400 block">Requested</label>
          <div class="text-sm font-medium text-gray-900" id="date_requested">-</div>
        </div>
        <div class="relative pl-4 border-l-2 border-pelorous-200 pb-8">
          <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-pelorous-500"></div>
          <label class="text-xs text-gray-400 block">Issued</label>
          <div class="text-sm font-medium text-gray-900" id="date_issued">-</div>
        </div>
        <div class="relative pl-4 border-l-2 border-transparent">
          <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300" id="dot_return"></div>
          <label class="text-xs text-gray-400 block">Expected Return</label>
          <div class="text-sm font-medium text-gray-900" id="date_expected">-</div>
        </div>
      </div>
    </div>
  `;
  contentGrid.appendChild(leftCol);

  // Right Column: Items
  const rightCol = document.createElement('div');
  rightCol.className = 'lg:col-span-2 space-y-6';

  // Weapons Table
  const weaponsCard = document.createElement('div');
  weaponsCard.className = 'bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100';
  weaponsCard.innerHTML = `
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Weapons</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caliber</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
          </tr>
        </thead>
        <tbody id="table_weapons" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No weapons linked</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(weaponsCard);

  // Ammunition Table
  const ammoCard = document.createElement("div");
  ammoCard.className =
    "bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100";
  ammoCard.innerHTML = `
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ammunition</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caliber</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
          </tr>
        </thead>
        <tbody id="table_ammunition" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No ammunition linked</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(ammoCard);

  // Equipment Table
  const equipCard = document.createElement("div");
  equipCard.className =
    "bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100";
  equipCard.innerHTML = `
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Equipment</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
          </tr>
        </thead>
        <tbody id="table_equipment" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No equipment linked</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(equipCard);

  contentGrid.appendChild(rightCol);
  container.appendChild(contentGrid);

  // --- Actions ---
  container.querySelector('#back_btn').addEventListener('click', () => {
    window.location.hash = '#/armoury';
  });

  // --- Fetch Data ---
  fetch(`/api/method/nacoc_armoury.api.get_issuance_details?issuance_id=${issuanceId}`)
    .then(res => res.json())
    .then(data => {
      const { details, weapons, ammunition, equipment } = data.message;

      // Header Status
      const statusColors = {
        'Issued': 'bg-green-100 text-green-800',
        'Returned': 'bg-blue-100 text-blue-800',
        'Overdue': 'bg-red-100 text-red-800',
        'Draft': 'bg-gray-100 text-gray-800'
      };
      const badgeClass = statusColors[details.status] || 'bg-gray-100 text-gray-800';
      document.getElementById('status_badge').innerHTML = `<span class="px-3 py-1 rounded-full text-sm font-medium ${badgeClass}">${details.status}</span>`;

      // General Info
      document.getElementById('info_issued_to').textContent = details.issued_to_name;
      document.getElementById('info_purpose').textContent = details.purpose;
      document.getElementById('info_authorised_by').textContent = details.authorised_by_name;
      document.getElementById('info_authoriser_pos').textContent = details.authoriser_position || '';

      // Timeline
      document.getElementById('date_requested').textContent = details.request_date_formatted || '-';
      document.getElementById('date_issued').textContent = details.issue_datetime_formatted || '-';
      document.getElementById('date_expected').textContent = details.expected_return_formatted || '-';

      // Tables
      if (weapons && weapons.length) {
        document.getElementById("table_weapons").innerHTML = weapons
          .map(
            (w) => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${w.weapon_type}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.serial_no}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.caliber}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.condition}</td>
          </tr>
        `
          )
          .join("");
      }

      if (ammunition && ammunition.length) {
        document.getElementById('table_ammunition').innerHTML = ammunition.map(a => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${a.label}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${a.quantity}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${a.current_stock}</td>
          </tr>
        `).join('');
      }

      if (equipment && equipment.length) {
        document.getElementById("table_equipment").innerHTML = equipment
          .map(
            (e) => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${e.label}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${e.quantity}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${e.condition}</td>
          </tr>
        `
          )
          .join("");
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<div class="p-8 text-center text-red-600">Error loading issuance details.</div>`;
    });

  return container;
}
