import { GlobalSearch } from './GlobalSearch.js';

export function Header() {
  const header = document.createElement('header');
  // Reduced height (h-14 -> h-12)
  header.className = 'bg-white shadow h-12 flex items-center justify-between px-4';

  // Search Bar Container
  const searchContainer = document.createElement('div');
  searchContainer.className = 'flex-1 flex justify-center lg:justify-start';
  const globalSearch = GlobalSearch();
  // You might need to adjust GlobalSearch styling internally too if it's too big, 
  // but for now let's assume it fits or we'll adjust it later.
  searchContainer.appendChild(globalSearch);

  // Right Side (Profile/Notifications)
  const rightSide = document.createElement('div');
  rightSide.className = 'ml-4 flex items-center md:ml-6';

  // Notification Button
  const notifBtn = document.createElement('button');
  notifBtn.className = 'bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500';
  notifBtn.innerHTML = `
        <span class="sr-only">View notifications</span>
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    `;

  // Profile Dropdown (Placeholder)
  const profileDiv = document.createElement('div');
  profileDiv.className = 'ml-3 relative';
  profileDiv.innerHTML = `
        <div>
            <button type="button" class="max-w-xs bg-white flex items-center text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pelorous-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <img class="h-7 w-7 rounded-full" src="https://ui-avatars.com/api/?name=Admin+User&background=178fa3&color=fff" alt="">
            </button>
        </div>
    `;

  rightSide.appendChild(notifBtn);
  rightSide.appendChild(profileDiv);

  header.appendChild(searchContainer);
  header.appendChild(rightSide);

  return header;
}
