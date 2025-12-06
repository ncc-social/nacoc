import { ROUTER_BASE } from '../config.js';

export function TrainingDetails({ id }) {
    const container = document.createElement('div');
    container.className = 'p-6 max-w-5xl mx-auto';

    // Back Link
    const backLink = document.createElement('a');
    backLink.href = '#/training';
    backLink.className = 'inline-flex items-center text-sm text-pelorous-600 hover:text-pelorous-900 mb-4';
    backLink.innerHTML = `
        <svg class="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Training
    `;
    backLink.onclick = (e) => {
        e.preventDefault();
        window.location.hash = '/training';
    };
    container.appendChild(backLink);

    // Loading State
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex justify-center items-center py-12';
    loadingDiv.innerHTML = `
        <svg class="animate-spin h-8 w-8 text-pelorous-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2 text-lg text-gray-500">Loading training details...</span>
    `;
    container.appendChild(loadingDiv);

    // Fetch Data
    const query = new URLSearchParams({ training_name: id }).toString();
    fetch(`https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_training_by_name?${query}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            const program = data.message;
            container.removeChild(loadingDiv);

            if (!program) {
                container.innerHTML += '<div class="text-center text-gray-500 mt-10">Training program not found</div>';
                return;
            }

            renderDetails(program);
        })
        .catch(err => {
            console.error("Error fetching training details:", err);
            container.removeChild(loadingDiv);
            container.innerHTML += `
            <div class="text-center text-gray-500 mt-10">
                Failed to load training details. Please try again later.
            </div>
        `;
        });

    function renderDetails(program) {
        // Map API fields
        const title = program.name_of_programme;
        const description = program.programme_info;
        const category = program.type;
        const institution = program.institution;
        const mode = program.mode_of_programme;
        const venue = program.venue;
        const startDate = program.start_date;
        const endDate = program.end_date;
        const funding = program.source_of_funding;
        const participants = program.participants || [];
        const totalAttendees = participants.length;

        // Header Section
        const header = document.createElement('div');
        header.className = 'bg-white shadow overflow-hidden sm:rounded-lg mb-6';
        header.innerHTML = `
            <div class="px-4 py-4 sm:px-6 flex justify-between items-start">
                <div>
                    <h3 class="text-base leading-6 font-medium text-gray-900">${title}</h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">${description || 'No description available.'}</p>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryTheme(category).badge}">
                    ${category}
                </span>
            </div>
            <div class="border-t border-gray-200 px-4 py-4 sm:px-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">Institution</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${institution || '-'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">Mode</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${mode || '-'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">Venue</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${venue || '-'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">Start Date</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${startDate || '-'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">End Date</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${endDate || '-'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-xs font-medium text-gray-500">Funding Source</dt>
                        <dd class="mt-0.5 text-sm text-gray-900">${funding || '-'}</dd>
                    </div>
                </dl>
            </div>
        `;
        container.appendChild(header);

        // Participants Table
        const tableSection = document.createElement('div');
        tableSection.className = 'bg-white shadow overflow-hidden sm:rounded-lg';

        const tableHeader = document.createElement('div');
        tableHeader.className = 'px-4 py-4 sm:px-6 border-b border-gray-200';
        tableHeader.innerHTML = `<h3 class="text-base leading-6 font-medium text-gray-900">Participants (${totalAttendees})</h3>`;
        tableSection.appendChild(tableHeader);

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${generateParticipantsRows(participants)}
            </tbody>
        `;
        tableSection.appendChild(table);
        container.appendChild(tableSection);
    }

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

function generateParticipantsRows(participants) {
    if (!participants || participants.length === 0) {
        return '<tr><td colspan="4" class="px-4 py-4 text-center text-sm text-gray-500">No participants found.</td></tr>';
    }

    return participants.map(p => {
        const name = p.full_name || p.employee; // Fallback to ID if name missing
        const image = p.employee_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=random`;
        const dept = p.department_name || '-';
        const rank = p.Rank || '-';
        const attendance = p.Attendance || 'Present'; // Default to Present

        let statusColor;
        switch (attendance) {
            case 'Present': statusColor = 'bg-green-100 text-green-800'; break;
            case 'Absent': statusColor = 'bg-red-100 text-red-800'; break;
            case 'Irregular': statusColor = 'bg-yellow-100 text-yellow-800'; break;
            default: statusColor = 'bg-gray-100 text-gray-800';
        }

        return `
            <tr>
                <td class="px-4 py-2 whitespace-nowrap">
                    <div class="flex items-center cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-1 -m-1" onclick="window.location.hash = '/employee-details?id=${encodeURIComponent(p.employee)}&tab=training'">
                        <div class="flex-shrink-0 h-6 w-6">
                            <img class="h-6 w-6 rounded-full" src="${image}" alt="">
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-pelorous-600 hover:text-pelorous-900">${name}</div>
                            <div class="text-xs text-gray-500">${p.employee}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    ${dept}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    ${rank}
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-4 font-semibold rounded-full ${statusColor}">
                        ${attendance}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}
