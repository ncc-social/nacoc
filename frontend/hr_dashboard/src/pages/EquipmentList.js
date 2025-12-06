export function EquipmentList() {
  const container = document.createElement('div');
  container.className = 'p-3 space-y-6';

  container.innerHTML = `
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-bold text-gray-900">Equipment</h1>
      <div class="flex gap-2">
        <input type="text" id="search_input" placeholder="Search equipment..." class="block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500">
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="stats_grid">
      <!-- Stats will be injected here -->
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking Type</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody id="table_body" class="bg-white divide-y divide-gray-200">
            <tr><td colspan="5" class="px-3 py-4 text-center text-xs text-gray-500">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const limit = 20;
  let start = 0;
  let currentQuery = '';

  const fetchItems = (query = '', isLoadMore = false) => {
    if (!isLoadMore) {
      start = 0;
      currentQuery = query;
      container.querySelector('#table_body').innerHTML = '<tr><td colspan="5" class="px-3 py-4 text-center text-xs text-gray-500">Loading...</td></tr>';
    }

    fetch(`/api/method/nacoc_armoury.api.search_items?item_type=Equipment&query=${query}&limit=${limit}&start=${start}`)
      .then(res => res.json())
      .then(data => {
        const items = data.message.results;
        const tbody = container.querySelector('#table_body');
        const loadMoreBtn = container.querySelector('#load_more_btn');

        if (!isLoadMore) {
          tbody.innerHTML = '';
        }

        if ((!items || items.length === 0) && !isLoadMore) {
          tbody.innerHTML = '<tr><td colspan="5" class="px-3 py-4 text-center text-xs text-gray-500">No equipment found</td></tr>';
          loadMoreBtn.classList.add('hidden');
          return;
        }

        if (items.length < limit) {
          loadMoreBtn.classList.add('hidden');
        } else {
          loadMoreBtn.classList.remove('hidden');
        }

        const html = items.map(item => `
          <tr class="hover:bg-gray-50">
            <td class="px-3 py-1.5 whitespace-nowrap text-sm font-bold text-gray-900">${item.label}</td>
            <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.tracking_type}</td>
            <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">${item.qty_on_hand}</td>
            <td class="px-3 py-1.5 whitespace-nowrap text-xs">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                ${item.status || 'Unknown'}
              </span>
            </td>
            <td class="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
              <a href="#/armoury/details/Equipment/${item.name}" class="text-pelorous-600 hover:text-pelorous-900 font-medium">View Details</a>
            </td>
          </tr>
        `).join('');

        tbody.insertAdjacentHTML('beforeend', html);
        start += items.length;
      });
  };

  const fetchStats = () => {
    fetch('/api/method/nacoc_armoury.api.get_inventory_stats?item_type=Equipment')
      .then(res => res.json())
      .then(data => {
        const stats = data.message;
        const grid = container.querySelector('#stats_grid');

        const cards = [
          { title: 'Total Items', value: stats.total_types, color: 'bg-blue-50 text-blue-700' },
          { title: 'Total Quantity', value: stats.total_quantity.toLocaleString(), color: 'bg-green-50 text-green-700' },
          { title: 'Low Stock Alerts', value: stats.low_stock_count, color: 'bg-red-50 text-red-700' }
        ];

        grid.innerHTML = cards.map(card => `
          <div class="bg-white rounded-lg shadow p-4 border-l-4 ${card.color.replace('bg-', 'border-').replace('text-', 'border-').split(' ')[0]}">
            <p class="text-xs font-medium text-gray-500 uppercase">${card.title}</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">${card.value}</p>
          </div>
        `).join('');
      });
  };

  fetchItems();
  fetchStats();

  // Search functionality
  let debounceTimer;
  container.querySelector('#search_input').addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchItems(e.target.value);
    }, 300);
  });

  // Load More functionality
  const loadMoreContainer = document.createElement('div');
  loadMoreContainer.className = 'flex justify-center mt-4';
  loadMoreContainer.innerHTML = `
        <button id="load_more_btn" class="hidden px-3 py-1 bg-gray-100 text-gray-700 rounded shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-xs">
            Load More
        </button>
    `;
  container.appendChild(loadMoreContainer);

  container.querySelector('#load_more_btn').addEventListener('click', () => {
    fetchItems(currentQuery, true);
  });

  return container;
}
