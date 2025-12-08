
export function ReturnDetails(params) {
  const inspectionId = params.id || params;
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
        <h1 class="text-xl font-bold text-gray-900">Return Inspection Details</h1>
        <p class="text-sm text-gray-500">ID: <span class="font-mono text-gray-700">${inspectionId}</span></p>
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
          <label class="text-xs text-gray-400 block">Returned By</label>
          <div class="text-sm font-medium text-gray-900" id="info_returned_by">-</div>
        </div>
        <div>
          <label class="text-xs text-gray-400 block">Inspected By</label>
          <div class="text-sm font-medium text-gray-900" id="info_inspected_by">-</div>
        </div>
        <div>
          <label class="text-xs text-gray-400 block">Issuance Request</label>
          <div class="text-sm font-medium text-pelorous-600 hover:underline cursor-pointer" id="info_issuance_request">-</div>
        </div>
        <div>
            <label class="text-xs text-gray-400 block">Remarks</label>
            <div class="text-sm text-gray-700 italic" id="info_remarks">-</div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Timeline</h3>
      <div class="">
        <div class="relative pl-4 border-l-2 border-pelorous-200 pb-8">
          <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-pelorous-500"></div>
          <label class="text-xs text-gray-400 block">Inspection Date</label>
          <div class="text-sm font-medium text-gray-900" id="date_inspection">-</div>
        </div>
        <div class="relative pl-4 border-l-2 border-transparent">
          <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-gray-300"></div>
          <label class="text-xs text-gray-400 block">Return Timestamp</label>
          <div class="text-sm font-medium text-gray-900" id="date_return">-</div>
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
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Returned Weapons</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weapon Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody id="table_weapons" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No weapons returned</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(weaponsCard);

  // Ammunition Table
  const ammoCard = document.createElement('div');
  ammoCard.className = 'bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100';
  ammoCard.innerHTML = `
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Returned Ammunition</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ammunition</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Returned</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody id="table_ammunition" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No ammunition returned</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(ammoCard);

  // Equipment Table
  const equipCard = document.createElement('div');
  equipCard.className = 'bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100';
  equipCard.innerHTML = `
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Returned Equipment</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
             <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody id="table_equipment" class="bg-white divide-y divide-gray-200">
          <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No equipment returned</td></tr>
        </tbody>
      </table>
    </div>
  `;
  rightCol.appendChild(equipCard);

  contentGrid.appendChild(rightCol);
  container.appendChild(contentGrid);

  // --- Actions ---
  container.querySelector('#back_btn').addEventListener('click', () => {
    // Go back to Armoury page, specifically the returns tab if possible, but general armoury is fine
    window.location.hash = '#/armoury';
    // Optionally we could try to restore the 'returns' tab state, but default is fine for now
  });

  // --- Fetch Data ---
  fetch(`/api/method/nacoc_armoury.api.get_return_inspection_details?inspection_id=${inspectionId}`)
    .then(res => res.json())
    .then(data => {
      if (data.message && data.message.error) {
        throw new Error(data.message.error);
      }
      const { details, weapons, ammunition, equipment } = data.message;

      // Header Status
      const statusColors = {
        'Submitted': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Draft': 'bg-gray-100 text-gray-800'
      };
      const badgeClass = statusColors[details.status] || 'bg-gray-100 text-gray-800';
      document.getElementById('status_badge').innerHTML = `<span class="px-3 py-1 rounded-full text-sm font-medium ${badgeClass}">${details.status}</span>`;

      // General Info
      document.getElementById('info_returned_by').textContent = details.returned_by_name || details.returned_by;
      document.getElementById('info_inspected_by').textContent = details.inspected_by_name || details.inspected_by;

      const issuanceLink = document.getElementById('info_issuance_request');
      issuanceLink.textContent = details.issuance_request;
      issuanceLink.onclick = () => window.location.hash = `#/armoury/issuance/${details.issuance_request}`;

      document.getElementById('info_remarks').textContent = details.remarks || 'No remarks';

      // Timeline
      document.getElementById('date_inspection').textContent = details.inspection_date_formatted || '-';
      document.getElementById('date_return').textContent = details.return_datetime_formatted || '-';

      // Tables
      if (weapons && weapons.length) {
        document.getElementById('table_weapons').innerHTML = weapons.map(w => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${w.weapon || w.weapon_serial_no || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.weapon_type || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.condition || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${w.remarks || '-'}</td>
          </tr>
        `).join('');
      }

      if (ammunition && ammunition.length) {
        document.getElementById("table_ammunition").innerHTML = ammunition
          .map(
            (a) => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${
              a.ammunition || "-"
            }</td>
            <td class="px-6 py-4 text-sm text-gray-500">${a.qty_returned}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${
              a.condition || "-"
            }</td>
            <td class="px-6 py-4 text-sm text-gray-500">${a.remarks || "-"}</td>
          </tr>
        `
          )
          .join("");
      }

      if (equipment && equipment.length) {
        document.getElementById('table_equipment').innerHTML = equipment.map(e => `
          <tr>
            <td class="px-6 py-4 text-sm text-gray-900 font-medium">${e.equipment || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${e.qty_returned}</td>
             <td class="px-6 py-4 text-sm text-gray-500">${e.condition || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${e.remarks || '-'}</td>
          </tr>
        `).join('');
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<div class="p-8 text-center text-red-600">Error loading return inspection details: ${err.message}</div>`;
    });

  return container;
}
