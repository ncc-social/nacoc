import { ROUTER_BASE } from '../config.js';

export function Training() {
    const container = document.createElement('div');
    container.className = 'p-6';

    // Header
    const header = document.createElement('div');
    header.className = 'mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4';

    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold text-gray-900';
    title.textContent = 'Training Programs';
    header.appendChild(title);

    // Search Input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by name...';
    searchInput.className = 'block w-48 pl-2 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-pelorous-500 focus:border-pelorous-500';
    header.appendChild(searchInput);
    container.appendChild(header);

    // Grid Container
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8';
    container.appendChild(grid);

    // Load More Button Container
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'flex justify-center hidden';
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-pelorous-700 bg-pelorous-100 hover:bg-pelorous-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500';
    loadMoreBtn.textContent = 'Load More';
    loadMoreContainer.appendChild(loadMoreBtn);
    container.appendChild(loadMoreContainer);

    // State
    let currentPage = 1;
    const pageSize = 15;
    let isLoading = false;
    let debounceTimeout;

    // Initial Loading State
    grid.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2 text-lg text-gray-500">Loading training programs...</span>
        </div>
    `;

    function fetchTraining(reset = false) {
        if (isLoading) return;
        isLoading = true;

        if (reset) {
            currentPage = 1;
            grid.innerHTML = `
                <div class="col-span-full flex justify-center items-center py-12">
                    <svg class="animate-spin h-8 w-8 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="ml-2 text-lg text-gray-500">Searching...</span>
                </div>
            `;
            loadMoreContainer.classList.add('hidden');
        }

        const query = searchInput.value;
        const queryParams = new URLSearchParams({
            page_size: pageSize,
            page: currentPage,
            search: query
        });

        fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_training_data?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                const result = data.message || {};
                const trainingData = result.data || [];
                const hasMore = result.has_more;

                if (reset) {
                    grid.innerHTML = '';
                    if (trainingData.length === 0) {
                        grid.innerHTML = `
                            <div class="col-span-full text-center py-12 text-gray-500">
                                No training programs found matching "${query}".
                            </div>
                        `;
                    }
                }

                trainingData.forEach(program => {
                    const card = createCard(program);
                    grid.appendChild(card);
                });

                if (hasMore) {
                    loadMoreContainer.classList.remove('hidden');
                } else {
                    loadMoreContainer.classList.add('hidden');
                }
            })
            .catch(err => {
                console.error("Error fetching training data:", err);
                if (reset) {
                    grid.innerHTML = `
                        <div class="col-span-full text-center py-12 text-gray-500">
                            Failed to load training programs. Please try again later.
                        </div>
                    `;
                }
            })
            .finally(() => {
                isLoading = false;
            });
    }

    function createCard(program) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 cursor-pointer flex flex-col';

        // Map API fields
        const id = program.name;
        const title = program.name_of_programme;
        const category = program.type;
        const mode = program.mode_of_programme;
        const attendees = program.participant_count;
        const startDate = program.start_date;

        card.onclick = () => {
            window.location.hash = `/training/${id}`;
        };

        const theme = getCategoryTheme(category);

        // Card Header (Color strip based on category)
        const colorStrip = document.createElement('div');
        colorStrip.className = `h-1.5 w-full ${theme.border}`;
        card.appendChild(colorStrip);

        const content = document.createElement('div');
        content.className = 'p-5 flex-1 flex flex-col';

        // Title & Category
        const topRow = document.createElement('div');
        topRow.className = 'flex justify-between items-start mb-3';

        const progTitle = document.createElement('h3');
        progTitle.className = 'text-[13px] font-bold text-gray-900 line-clamp-2 flex-1 pr-2';
        progTitle.textContent = title;
        topRow.appendChild(progTitle);

        const categoryBadge = document.createElement('span');
        categoryBadge.className = `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme.badge}`;
        categoryBadge.textContent = category;
        topRow.appendChild(categoryBadge);

        content.appendChild(topRow);

        // Details
        const details = document.createElement('div');
        details.className = 'mt-auto space-y-2';

        // Mode
        const modeRow = document.createElement('div');
        modeRow.className = 'flex items-center text-sm text-gray-500';
        modeRow.innerHTML = `
            <svg class="mr-1.5 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            ${mode || 'TBD'}
        `;
        details.appendChild(modeRow);

        // Attendees
        const attendeesRow = document.createElement('div');
        attendeesRow.className = 'flex items-center text-sm text-gray-500';
        attendeesRow.innerHTML = `
            <svg class="mr-1.5 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            ${attendees || 0} Attendees
        `;
        details.appendChild(attendeesRow);

        // Date
        const dateRow = document.createElement('div');
        dateRow.className = 'flex items-center text-sm text-gray-500';
        dateRow.innerHTML = `
            <svg class="mr-1.5 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            ${startDate || 'TBD'}
        `;
        details.appendChild(dateRow);

        content.appendChild(details);
        card.appendChild(content);

        return card;
    }

    // Event Listeners
    loadMoreBtn.onclick = () => {
        currentPage++;
        fetchTraining(false);
    };

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            fetchTraining(true);
        }, 300);
    });

    // Initial Fetch
    fetchTraining(true);

    return container;
}

function getCategoryTheme(category) {
    if (!category) return { border: 'bg-gray-500', badge: 'bg-gray-100 text-gray-800' };

    const lower = category.toLowerCase();

    // Define specific themes for known categories
    if (lower.includes('technical')) return { border: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800' };
    if (lower.includes('soft skill')) return { border: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800' };
    if (lower.includes('compliance')) return { border: 'bg-red-500', badge: 'bg-red-100 text-red-800' };
    if (lower.includes('leadership')) return { border: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800' };
    if (lower.includes('seminar')) return { border: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' };
    if (lower.includes('workshop')) return { border: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800' };
    if (lower.includes('conference')) return { border: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-800' };
    if (lower.includes('orientation')) return { border: 'bg-lime-500', badge: 'bg-lime-100 text-lime-800' };

    // Hash-based fallback for consistent colors on unknown categories
    const colors = [
        { border: 'bg-pink-500', badge: 'bg-pink-100 text-pink-800' },
        { border: 'bg-pelorous-500', badge: 'bg-pelorous-100 text-pelorous-800' },
        { border: 'bg-teal-500', badge: 'bg-teal-100 text-teal-800' },
        { border: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800' },
        { border: 'bg-violet-500', badge: 'bg-violet-100 text-violet-800' },
        { border: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800' }
    ];

    let hash = 0;
    for (let i = 0; i < lower.length; i++) {
        hash = lower.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}
