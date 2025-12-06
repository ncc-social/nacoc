import './style.css';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { Dashboard } from './pages/Dashboard.js';
import { Employees } from './pages/Employees.js';
import { EmployeeDetails } from './pages/EmployeeDetails.js';
import { Leaves } from './pages/Leaves.js';
import { Training } from './pages/Training.js';
import { TrainingDetails } from './pages/TrainingDetails.js';
import { Armoury } from './pages/Armoury.js';
import { IssuanceDetails } from './pages/IssuanceDetails.js';
import { ReturnDetails } from './pages/ReturnDetails.js';
import { WeaponList } from './pages/WeaponList.js';
import { AmmoList } from './pages/AmmoList.js';
import { EquipmentList } from './pages/EquipmentList.js';
import { ItemDetails } from './pages/ItemDetails.js';

const app = document.querySelector('#app');

// Layout Structure
const layout = document.createElement('div');
layout.className = 'flex h-screen bg-gray-100 overflow-hidden';

const sidebar = Sidebar();
layout.appendChild(sidebar);

const mainContent = document.createElement('div');
mainContent.className = 'flex-1 flex flex-col overflow-hidden ml-56 transition-all duration-300';
mainContent.id = 'main-content';

const header = Header();
mainContent.appendChild(header);

const pageContent = document.createElement('main');
pageContent.className = 'flex-1 overflow-x-hidden overflow-y-auto bg-gray-100';
pageContent.id = 'page-content';
mainContent.appendChild(pageContent);

layout.appendChild(mainContent);
app.appendChild(layout);

// Handle Sidebar Collapse
const toggleBtn = sidebar.querySelector('#toggle-sidebar');
toggleBtn.addEventListener('click', () => {
  if (mainContent.classList.contains('ml-56')) {
    mainContent.classList.remove('ml-56');
    mainContent.classList.add('ml-14');
  } else {
    mainContent.classList.remove('ml-14');
    mainContent.classList.add('ml-56');
  }
});

import { ROUTER_BASE } from './config.js';

// Router
const routes = [
  { path: /^\/$/, component: Dashboard },
  { path: /^\/employees$/, component: Employees },
  { path: /^\/employees$/, component: Employees },
  { path: /^\/employee-details$/, component: EmployeeDetails }, // Query param route
  {
    path: /^\/leaves$/,
    component: Leaves
  },
  { path: /^\/training$/, component: Training },
  { path: /^\/training\/(.+)$/, component: TrainingDetails },
  { path: /^\/armoury$/, component: Armoury },
  { path: /^\/armoury\/issuance\/(.+)$/, component: IssuanceDetails },
  { path: /^\/armoury\/return-inspection\/(.+)$/, component: ReturnDetails },
  { path: /^\/armoury\/weapons$/, component: WeaponList },
  { path: /^\/armoury\/ammo$/, component: AmmoList },
  { path: /^\/armoury\/equipment$/, component: EquipmentList },
  { path: /^\/armoury\/details\/(.+)\/(.+)$/, component: ItemDetails }, // /details/:type/:id
];

function router() {
  // Get hash path, remove the '#'
  let path = window.location.hash.slice(1) || '/';

  // Remove query params from path if any (they are after ?)
  const queryIndex = path.indexOf('?');
  if (queryIndex !== -1) {
    path = path.slice(0, queryIndex);
  }

  let component = null;
  let params = {};

  for (const route of routes) {
    const match = path.match(route.path);
    if (match) {
      component = route.component;
      // Extract params from regex capture groups if any
      if (match.length > 1) {
        // Handle multiple params (e.g. type and id)
        if (match.length === 3) {
          params = { ...params, type: match[1], id: match[2] };
        } else {
          params = { ...params, id: match[1] };
        }
      }
      break;
    }
  }

  // Parse query parameters from the hash (e.g., #/path?id=123)
  // Note: window.location.search is for real query params, but with hash routing 
  // params are usually after the hash.
  const hashString = window.location.hash;
  const qIndex = hashString.indexOf('?');
  if (qIndex !== -1) {
    const searchParams = new URLSearchParams(hashString.slice(qIndex));
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
  }

  // Fallback to Dashboard if no match (or 404 page)
  if (!component) {
    component = Dashboard;
  }

  pageContent.innerHTML = '';
  // Pass params to the component
  pageContent.appendChild(component(params));
}

// Handle navigation
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Initial render
router();
