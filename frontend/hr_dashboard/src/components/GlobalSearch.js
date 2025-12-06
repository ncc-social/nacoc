import { ROUTER_BASE } from '../config.js';

export function GlobalSearch() {
    const container = document.createElement('div');
    container.className = 'relative w-full max-w-md';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'relative';

    const icon = document.createElement('div');
    icon.className = 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none';
    icon.innerHTML = `
    <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
    </svg>
  `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search employees, training...';
    input.className = 'block w-full pl-10 pr-10 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pelorous-500 focus:border-pelorous-500 sm:text-base transition duration-150 ease-in-out';

    const clearBtn = document.createElement('div');
    clearBtn.className = 'absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 hidden';
    clearBtn.innerHTML = `
      <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;

    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        input.focus();
    });

    inputWrapper.appendChild(icon);
    inputWrapper.appendChild(input);
    inputWrapper.appendChild(clearBtn);
    container.appendChild(inputWrapper);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none hidden';
    container.appendChild(resultsContainer);

    let debounceTimeout;

    async function performSearch(query) {
        if (!query || query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        // Show loading
        resultsContainer.innerHTML = '<div class="px-4 py-2 text-gray-500">Searching...</div>';
        resultsContainer.classList.remove('hidden');

        try {
            const [empRes, trainRes] = await Promise.all([
                fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_paginated_employees?page_size=5&page=1&search=${encodeURIComponent(query)}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                }),
                fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_training_data?page_size=5&search=${encodeURIComponent(query)}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                })
            ]);

            const empJson = await empRes.json();
            const trainJson = await trainRes.json();

            const employees = Array.isArray(empJson.message) ? empJson.message : (empJson.message?.data || []);
            const message = trainJson.message || {};
            const training = Array.isArray(message) ? message : (message.data || []);

            displayResults(employees, training, query);

        } catch (error) {
            console.error("Error searching:", error);
            resultsContainer.innerHTML = '<div class="px-4 py-2 text-red-500">Error searching. Please try again.</div>';
        }
    }

    function displayResults(employees, training, query) {
        if (employees.length === 0 && training.length === 0) {
            resultsContainer.innerHTML = '<div class="px-4 py-2 text-gray-500">No results found.</div>';
            return;
        }

        resultsContainer.innerHTML = '';

        if (employees.length > 0) {
            appendCategoryHeader(resultsContainer, 'Employees');
            employees.forEach(emp => {
                const name = emp.employee_name || emp.name;
                const id = emp.name || emp.employee || emp.staff_id || emp.id;
                const dept = emp.department || '';
                const encodedId = encodeURIComponent(id);
                // Highlight match if possible, or just show text
                const text = `${name} (${id})${dept ? ` - ${dept}` : ''}`;
                appendResultItem(resultsContainer, text, `/employee-details?id=${encodedId}`);
            });
        }

        if (training.length > 0) {
            appendCategoryHeader(resultsContainer, 'Training');
            training.forEach(train => {
                const title = train.name_of_programme;
                const id = train.name;
                appendResultItem(resultsContainer, title, `/training/${id}`);
            });
        }
    }

    input.addEventListener('input', (e) => {
        const query = e.target.value;

        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
            resultsContainer.classList.add('hidden');
            return;
        }

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });

    return container;
}

function appendCategoryHeader(container, title) {
    const header = document.createElement('div');
    header.className = 'px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wider';
    header.textContent = title;
    container.appendChild(header);
}

function appendResultItem(container, text, linkPath) {
    const item = document.createElement('a');
    item.href = `#${linkPath}`; // For hover status bar
    item.className = 'block px-3 py-1.5 text-gray-900 hover:bg-pelorous-50 cursor-pointer';
    item.textContent = text;

    item.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = linkPath;
        container.classList.add('hidden');
        // Clear input after selection
        const input = container.querySelector('input');
        if (input) input.value = '';
    });

    container.appendChild(item);
}
