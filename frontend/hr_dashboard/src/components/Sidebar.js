import { ROUTER_BASE } from '../config.js';

export function Sidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'bg-pelorous-900 text-white h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 z-50 w-56'; // Reduced width (w-64 -> w-56)
  sidebar.id = 'sidebar';

  // Toggle Button & Header
  // We need to handle the initial state. Default is expanded (w-56).
  let isCollapsed = false;

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between h-16 px-4 bg-pelorous-950 transition-all duration-300';

  const logoText = document.createElement('span');
  logoText.className = 'text-xl font-bold text-white transition-opacity duration-300';
  logoText.id = 'logo-text';
  logoText.textContent = 'Insights';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'toggle-sidebar';
  toggleBtn.className = 'p-2 rounded-md hover:bg-gray-700 focus:outline-none transition-colors ml-auto';
  toggleBtn.innerHTML = `
    <svg class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  `;

  header.appendChild(logoText);
  header.appendChild(toggleBtn);
  sidebar.appendChild(header);

  const nav = document.createElement('nav');
  nav.className = 'flex-1 px-2 py-2 space-y-0.5 overflow-y-auto';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />' },
    { name: 'Employees', path: '/employees', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />' },
    { name: 'Leaves', path: '/leaves', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />' },
    { name: 'Training', path: '/training', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />' },
    {
      name: 'Armoury',
      path: '/armoury',
      icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />',
      children: [
        { name: 'Weapons', path: '/armoury/weapons' },
        { name: 'Ammunition', path: '/armoury/ammo' },
        { name: 'Equipment', path: '/armoury/equipment' }
      ]
    },
  ];

  navItems.forEach(item => {
    const container = document.createElement('div');
    container.className = 'nav-item-container';

    const link = document.createElement('a');
    link.href = `#${item.path}`;
    link.className = 'flex items-center px-3 py-1.5 text-base text-gray-300 hover:bg-pelorous-800 hover:text-white rounded-lg transition-colors group justify-between';
    link.innerHTML = `
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          ${item.icon}
        </svg>
        <span class="font-medium whitespace-nowrap transition-opacity duration-300 nav-text">${item.name}</span>
      </div>
      ${item.children ? `
        <svg class="w-4 h-4 transform transition-transform duration-200 nav-text ${item.name === 'Armoury' ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      ` : ''}
    `;

    container.appendChild(link);

    if (item.children) {
      const subMenu = document.createElement('div');
      subMenu.className = `pl-9 pt-2 space-y-1 overflow-hidden transition-all duration-300 ${item.name === 'Armoury' ? 'max-h-40' : 'max-h-0'}`;

      item.children.forEach(child => {
        const childLink = document.createElement('a');
        childLink.href = `#${child.path}`;
        childLink.className = 'block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-pelorous-800 rounded-lg transition-colors nav-text';
        childLink.textContent = child.name;
        subMenu.appendChild(childLink);
      });

      container.appendChild(subMenu);

      // Toggle functionality
      link.addEventListener('click', (e) => {
        if (isCollapsed) return; // Don't toggle if sidebar is collapsed

        // If clicking the parent link itself, we might want to navigate OR toggle.
        // Usually parent links with children act as toggles or navigate to a summary page.
        // Here we'll allow navigation but also toggle.

        const isExpanded = subMenu.style.maxHeight !== '0px' && subMenu.classList.contains('max-h-40');

        if (subMenu.classList.contains('max-h-0')) {
          subMenu.classList.remove('max-h-0');
          subMenu.classList.add('max-h-40');
          link.querySelector('svg:last-child').classList.add('rotate-180');
        } else {
          subMenu.classList.add('max-h-0');
          subMenu.classList.remove('max-h-40');
          link.querySelector('svg:last-child').classList.remove('rotate-180');
        }
      });
    }

    nav.appendChild(container);
  });

  // Dynamic Active State Logic
  function updateActiveState() {
    const currentHash = window.location.hash.slice(1) || '/';
    const currentPath = currentHash.split('?')[0];

    sidebar.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('bg-pelorous-800', 'text-white');

      // Reset text color for sub-items
      if (link.parentElement.classList.contains('pl-9')) {
        link.classList.remove('text-white');
        link.classList.add('text-gray-400');
      }

      const href = link.getAttribute('href').slice(1);

      let isActive = false;
      if (href === '/') {
        isActive = currentPath === '/';
      } else if (href === '/employees') {
        isActive = currentPath.startsWith('/employees') || currentPath.startsWith('/employee-details');
      } else {
        isActive = currentPath === href || (href !== '/armoury' && currentPath.startsWith(href));
      }

      if (isActive) {
        link.classList.add('bg-pelorous-800', 'text-white');
        if (link.parentElement.classList.contains('pl-9')) {
          link.classList.remove('text-gray-400');
        }

        // If it's a child, ensure parent is expanded and highlighted
        const parentContainer = link.closest('.nav-item-container');
        if (parentContainer) {
          const parentLink = parentContainer.querySelector('a:first-child');
          // Optional: Highlight parent too
          // parentLink.classList.add('text-white');

          const subMenu = parentContainer.querySelector('div.pl-9');
          if (subMenu) {
            subMenu.classList.remove('max-h-0');
            subMenu.classList.add('max-h-40');
            const arrow = parentLink.querySelector('svg:last-child');
            if (arrow) arrow.classList.add('rotate-180');
          }
        }
      }
    });
  }

  // Listen for hash changes
  window.addEventListener('hashchange', updateActiveState);

  // Initial check
  setTimeout(updateActiveState, 0);


  sidebar.appendChild(nav);

  // Toggle Logic
  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      sidebar.classList.remove('w-56');
      sidebar.classList.add('w-14');

      // Hide text
      sidebar.querySelectorAll('.nav-text').forEach(span => span.classList.add('opacity-0', 'hidden'));
      logoText.classList.add('opacity-0', 'hidden');

      // Center button
      header.classList.remove('justify-between');
      header.classList.add('justify-center');
      toggleBtn.classList.remove('ml-auto');
      toggleBtn.classList.add('mx-auto');

      // Collapse all submenus
      sidebar.querySelectorAll('.pl-9').forEach(menu => {
        menu.classList.add('max-h-0');
        menu.classList.remove('max-h-40');
      });

    } else {
      sidebar.classList.remove('w-14');
      sidebar.classList.add('w-56');

      // Show text
      sidebar.querySelectorAll('.nav-text').forEach(span => {
        span.classList.remove('hidden');
        setTimeout(() => span.classList.remove('opacity-0'), 50);
      });
      logoText.classList.remove('hidden');
      setTimeout(() => logoText.classList.remove('opacity-0'), 50);

      // Reset button position
      header.classList.remove('justify-center');
      header.classList.add('justify-between');
      toggleBtn.classList.remove('mx-auto');
      toggleBtn.classList.add('ml-auto');

      // Re-expand active submenu
      updateActiveState();
    }
  });

  return sidebar;
}
