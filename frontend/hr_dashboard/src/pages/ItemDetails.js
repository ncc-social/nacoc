import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function ItemDetails(params) {
  const { type, id } = params;
  const container = document.createElement('div');
  container.className = 'p-4 space-y-6';

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'flex items-center gap-4';
  header.innerHTML = `
    <button id="back_btn" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
    </button>
    <div>
      <h1 class="text-xl font-bold text-gray-900" id="item_title">Loading...</h1>
      <p class="text-sm text-gray-500">${type}</p>
    </div>
  `;
  container.appendChild(header);

  // --- Content Grid ---
  const contentGrid = document.createElement('div');
  contentGrid.className = 'grid grid-cols-1 lg:grid-cols-5 gap-6';

  // Left Column: 3D Viewer (Only for Weapon/Ammo) - Takes 2/5 (40%)
  const viewerCol = document.createElement('div');
  viewerCol.className = 'lg:col-span-2 space-y-6 order-1';

  if (type === 'Weapon' || type === 'Ammunition') {
    const viewerCard = document.createElement('div');
    viewerCard.className = 'bg-gray-900 rounded-lg shadow-lg overflow-hidden relative h-96 flex items-center justify-center';
    viewerCard.id = 'three_container';
    viewerCard.innerHTML = `
      <div class="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">3D View - Drag to Rotate</div>
      <div id="loading_3d" class="text-white">Loading 3D Model...</div>
    `;
    viewerCol.appendChild(viewerCard);
  } else {
    viewerCol.innerHTML = `
        <div class="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-400">
            No 3D View Available
        </div>
    `;
  }
  contentGrid.appendChild(viewerCol);

  // Right Column: Details - Takes 3/5 (60%)
  const detailsCol = document.createElement('div');
  detailsCol.className = 'lg:col-span-3 space-y-6 order-2';
  detailsCol.innerHTML = `
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Item Information</h3>
      <div id="item_info" class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <!-- Populated dynamically -->
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent History</h3>
      <div id="history_list" class="space-y-4">
        <p class="text-sm text-gray-500">No recent history.</p>
      </div>
    </div>
  `;
  contentGrid.appendChild(detailsCol);

  container.appendChild(contentGrid);

  // --- Actions ---
  container.querySelector('#back_btn').addEventListener('click', () => {
    // Go back to list
    if (type === 'Weapon') window.location.hash = '#/armoury/weapons';
    else if (type === 'Ammunition') window.location.hash = '#/armoury/ammo';
    else window.location.hash = '#/armoury/equipment';
  });

  // --- Fetch Data ---
  fetch(`/api/method/nacoc_armoury.api.get_item_details?item_type=${type}&item_name=${id}`)
    .then(res => res.json())
    .then(data => {
      const { item, related } = data.message;

      // Update Header
      document.getElementById('item_title').textContent = item.item_name || item.weapon_type || item.caliber || id;

      // Update Info
      const infoDiv = document.getElementById('item_info');
      let infoHtml = '';
      const fieldLabels = {
        weapon_type: "Weapon Type",
        serial_no: "Serial No",
        caliber: "Caliber",
        condition: "Condition",
        current_availability: "Availability",
        location: "Storage Location",
        last_service_date: "Last Service Date",
        next_service_due_date: "Next Service Due",
        service_interval_days: "Service Interval (Days)",
        service_cost: "Last Service Cost",
        total_service_cost: "Total Service Cost",
        assigned_to: "Assigned To",
        notes: "Notes",
        item_name: "Item Name",
        category: "Category",
        tracking_type: "Tracking Type",
        qty_on_hand: "Quantity On Hand",
        minimum_stock_level: "Min Stock Level",
      };

      for (const [key, value] of Object.entries(item)) {
        if (
          [
            "name",
            "creation",
            "modified",
            "modified_by",
            "owner",
            "docstatus",
            "idx",
          ].includes(key)
        )
          continue;
        if (!value && key !== "qty_on_hand") continue; // Allow 0 for quantity

        const label =
          fieldLabels[key] || key.replace(/_/g, " ").replace(/id$/, "").trim(); // Basic fallback for unmapped fields
        infoHtml += `
          <div>
            <label class="text-xs text-gray-400 block capitalize">${label}</label>
            <div class="text-sm font-medium text-gray-900 truncate" title="${value}">${value}</div>
          </div>
        `;
      }
      infoDiv.innerHTML = infoHtml;

      // Update History
      const historyDiv = document.getElementById("history_list");

      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${day} ${month} ${year} at ${hours}:${minutes}`;
      };

      if (related.issuance_history && related.issuance_history.length > 0) {
        historyDiv.innerHTML = related.issuance_history
          .map(
            (h) => `
            <div class="border-l-2 border-pelorous-500 pl-3 py-1">
                <div class="text-sm font-medium text-gray-900">Issued ${h.qty ? `(Qty: ${h.qty})` : ''} to ${h.issued_to_name || h.issued_to
              }</div>
                <div class="text-xs text-gray-500">${formatDate(
                h.issue_datetime
              )} - ${h.status}</div>
            </div>
        `
          )
          .join("");
      } else if (
        related.maintenance_history &&
        related.maintenance_history.length > 0
      ) {
        historyDiv.innerHTML = related.maintenance_history
          .map(
            (h) => `
            <div class="border-l-2 border-orange-500 pl-3 py-1">
                <div class="text-sm font-medium text-gray-900">${h.service_type
              }</div>
                <div class="text-xs text-gray-500">${h.service_date} - ${h.remarks || ""
              }</div>
            </div>
        `
          )
          .join("");
      }

      // Initialize 3D Viewer
      if (type === 'Weapon' || type === 'Ammunition') {
        const weaponType = (item.weapon_type || '').toLowerCase();
        const itemName = (item.item_name || '').toLowerCase();
        const caliber = (item.caliber || '').toLowerCase();
        const fullString = weaponType + ' ' + itemName + ' ' + caliber;

        // Sketchfab Embeds
        if (fullString.includes('taurus') && (fullString.includes('pistol') || fullString.includes('gx4'))) {
          renderEmbed(document.getElementById('three_container'), 'https://sketchfab.com/models/fe4f369e9b9e4f818c992ae206262e4f/embed');
        } else if (fullString.includes('taurus') && (fullString.includes('rifle') || fullString.includes('t4'))) {
          renderEmbed(document.getElementById('three_container'), 'https://sketchfab.com/models/9d9a0d3d6d764bc8b850c4823e131c7d/embed');
        }
        // Local GLB Models
        else if (fullString.includes('beretta')) {
          initThreeJS(document.getElementById('three_container'), item.weapon_type || 'Pistol', '/files/beretta_pistol.glb');
        } else if (fullString.includes('glock') || fullString.includes('17')) {
          initThreeJS(document.getElementById('three_container'), item.weapon_type || 'Pistol', '/files/glock_17.glb');
        } else if (fullString.includes('sterling') || fullString.includes('mk4')) {
          initThreeJS(document.getElementById('three_container'), item.weapon_type || 'Rifle', '/files/sterling_smg_mk4.glb');
        }
        // Custom Ammo Models
        else if (fullString.includes('9x19mm')) {
          initThreeJS(document.getElementById('three_container'), 'Ammunition', '/files/9x19mm.glb');
        } else if (fullString.includes('5.56x45mm')) {
          initThreeJS(document.getElementById('three_container'), 'Ammunition', '/files/5.56x45mm.glb');
        }
        // Fallback to Procedural
        else {
          initThreeJS(document.getElementById('three_container'), item.weapon_type || 'Rifle');
        }
      }
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<div class="p-8 text-center text-red-600">Error loading item details.</div>`;
    });

  return container;
}

function renderEmbed(container, src) {
  if (!container) return;
  container.innerHTML = `
        <iframe 
            title="3D Model" 
            frameborder="0" 
            allowfullscreen 
            mozallowfullscreen="true" 
            webkitallowfullscreen="true" 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            xr-spatial-tracking 
            execution-while-out-of-viewport 
            execution-while-not-rendered 
            web-share 
            src="${src}?annotations_visible=0&autostart=1&ui_theme=dark"
            class="w-full h-full"
        ></iframe>
    `;
}

function initThreeJS(container, weaponType = 'Rifle', modelUrl = null) {
  if (!container) return;

  // Remove loading text
  const loading = container.querySelector('#loading_3d');
  if (loading) loading.remove();

  // If previous canvas exists (e.g., from a prior init), remove it to avoid duplicates
  const existingCanvas = container.querySelector('canvas');
  if (existingCanvas) {
    existingCanvas.remove();
  }

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 400;

  const scene = new THREE.Scene();
  // Use transparent scene background so CSS behind the canvas can show a radial gradient
  scene.background = null;

  // Apply a light radial gradient to the viewer container so models 'pop'
  try {
    container.style.background = 'radial-gradient(circle at 30% 20%, #F2F2F2 0%, #BDBDBD 100%)';
    container.style.backgroundSize = 'cover';
  } catch (e) {
    // ignore if container isn't a DOM element
  }

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(5, 2, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  // Prefer modern outputColorSpace
  try {
    if (THREE.SRGBColorSpace !== undefined) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
  } catch (e) {
    // ignore and continue with defaults
    console.warn('Renderer color-space fallback:', e.message || e);
  }
  // Ensure the renderer canvas fills the container and is not duplicated
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  // Make the canvas background transparent so the CSS gradient shows through
  renderer.domElement.style.background = 'transparent';
  container.appendChild(renderer.domElement);

  // If a prior animation frame ID is stored on the container, cancel it
  if (container._threeAnimId) {
    try {
      cancelAnimationFrame(container._threeAnimId);
    } catch (e) {
      /* ignore */
    }
    container._threeAnimId = null;
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // --- Lighting ---
  // Ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
  scene.add(ambientLight);

  // Hemisphere light for natural sky/ground lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.4);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // Directional lights from multiple angles
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3.0);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight2.position.set(-5, 10, -7);
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight3.position.set(0, 0, 10); // Front light
  scene.add(dirLight3);

  // Add a soft fill point light near the camera for better visibility of details
  const fillLight = new THREE.PointLight(0xffffff, 1.6, 50);
  fillLight.position.copy(camera.position);
  scene.add(fillLight);

  // --- Load Model ---
  if (modelUrl) {
    // Create overlay status indicator
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 flex items-center justify-center text-sm text-white pointer-events-none';
    overlay.style.background = 'rgba(0,0,0,0.2)';
    overlay.style.zIndex = '20';
    overlay.style.fontWeight = '600';
    overlay.textContent = 'Loading 3D model...';
    container.appendChild(overlay);

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;

      // Create a wrapper to handle centering and scaling
      // Remove any previously added loaded wrapper to avoid duplicate models
      const previous = scene.getObjectByName('loaded_wrapper');
      if (previous) {
        scene.remove(previous);
      }

      const wrapper = new THREE.Group();
      wrapper.name = 'loaded_wrapper';
      wrapper.add(model);

      // Ensure world matrices are up-to-date before measuring
      wrapper.updateMatrixWorld(true);

      // Compute the bounding box from the wrapper (after adding model)
      const box = new THREE.Box3().setFromObject(wrapper);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Center the model geometry so it sits at the group's origin
      wrapper.position.x -= center.x;
      wrapper.position.y -= center.y;
      wrapper.position.z -= center.z;

      // Normalize scale on the wrapper
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0 && isFinite(maxDim)) {
        const targetSize = 4;
        const scaleFactor = targetSize / maxDim;
        wrapper.scale.setScalar(scaleFactor);
      } else {
        console.warn('Model has 0 size, using default scale');
        wrapper.scale.setScalar(1);
      }

      // After scaling, update matrices and recompute bounds
      wrapper.updateMatrixWorld(true);
      const box2 = new THREE.Box3().setFromObject(wrapper);
      const center2 = box2.getCenter(new THREE.Vector3());

      // Add wrapper to scene
      scene.add(wrapper);

      // Slight rotation for better default view
      wrapper.rotation.y = Math.PI / 8;

      // Fit Camera to Object (use recomputed bounds)
      fitCameraToObject(camera, controls, wrapper, 2.0);

      // Hide overlay on success
      try {
        overlay.style.display = 'none';
      } catch (e) {
        /* ignore */
      }

    }, (xhr) => {
      try {
        if (xhr && xhr.loaded && xhr.total) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          overlay.textContent = `Loading 3D model... ${pct}%`;
        }
      } catch (e) {
        // ignore
      }
    }, (error) => {
      console.error('An error happened loading the GLB:', error);
      try {
        overlay.textContent = 'Failed to load model — using fallback';
        overlay.style.background = 'rgba(128,0,0,0.4)';
        overlay.style.pointerEvents = 'auto';
      } catch (e) { }
      createProceduralModel(scene, weaponType);
    });
  } else {
    createProceduralModel(scene, weaponType);
  }

  // Add control buttons overlay (pan / tilt / zoom)
  const controlsBar = document.createElement('div');
  controlsBar.className = 'absolute right-3 bottom-3 flex flex-col gap-2 z-30';
  controlsBar.style.display = 'flex';
  controlsBar.style.flexDirection = 'column';
  controlsBar.style.gap = '6px';

  const btn = (label, title) => {
    const b = document.createElement('button');
    b.className = 'bg-black/60 text-white rounded p-2 text-xs hover:bg-black/80';
    b.textContent = label;
    b.title = title || label;
    return b;
  };

  const panLeft = btn('\u2190', 'Pan left');
  const panRight = btn('\u2192', 'Pan right');
  const tiltUp = btn('\u2191', 'Tilt up');
  const tiltDown = btn('\u2193', 'Tilt down');
  const zoomIn = btn('+', 'Zoom in');
  const zoomOut = btn('\u2212', 'Zoom out');

  controlsBar.appendChild(panLeft);
  controlsBar.appendChild(panRight);
  controlsBar.appendChild(tiltUp);
  controlsBar.appendChild(tiltDown);
  controlsBar.appendChild(zoomIn);
  controlsBar.appendChild(zoomOut);
  container.appendChild(controlsBar);

  // Utility movement functions
  function getRightVector() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir); // forward
    const right = new THREE.Vector3();
    right.crossVectors(dir, camera.up).normalize();
    return right;
  }

  function getUpVector() {
    return camera.up.clone().normalize();
  }

  function pan(deltaX, deltaY) {
    const right = getRightVector();
    const up = getUpVector();
    const shift = new THREE.Vector3();
    shift.copy(right).multiplyScalar(deltaX).add(up.multiplyScalar(deltaY));
    camera.position.add(shift);
    controls.target.add(shift);
    controls.update();
  }

  function tilt(angleRad) {
    // rotate camera around controls.target by angle around right axis
    const target = controls.target.clone();
    const pos = camera.position.clone().sub(target);
    const right = getRightVector();
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(right, angleRad);
    pos.applyQuaternion(q);
    camera.position.copy(pos.add(target));
    camera.lookAt(target);
    controls.update();
  }

  function zoom(delta) {
    const target = controls.target.clone();
    const dir = target.clone().sub(camera.position).normalize();
    const distance = camera.position.distanceTo(target);
    const amount = Math.min(distance * 0.9, Math.abs(delta));
    camera.position.add(dir.multiplyScalar(amount * Math.sign(delta)));
    controls.update();
  }

  // Wire buttons
  panLeft.addEventListener('click', () => pan(-0.3, 0));
  panRight.addEventListener('click', () => pan(0.3, 0));
  tiltUp.addEventListener('click', () => tilt(-0.12));
  tiltDown.addEventListener('click', () => tilt(0.12));
  zoomIn.addEventListener('click', () => zoom(0.25));
  zoomOut.addEventListener('click', () => zoom(-0.25));

  // Animation Loop
  function animate() {
    container._threeAnimId = requestAnimationFrame(animate);
    controls.update();
    // Keep fill light near the camera so front faces stay lit
    try {
      if (typeof fillLight !== 'undefined' && fillLight) {
        fillLight.position.copy(camera.position);
      }
    } catch (e) { }
    renderer.render(scene, camera);
  }
  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    if (!document.body.contains(container)) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

function fitCameraToObject(camera, controls, object, offset = 1.25) {
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(object);

  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  // Get the max side of the bounding box (fits to width OR height)
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  // Compute distance from object so it fits in view. Use standard formula:
  // cameraZ = (maxDim/2) / tan(fov/2)
  let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
  cameraZ *= offset; // Zoom out a bit

  // Position the camera
  const direction = new THREE.Vector3(0, 0, 1); // Default front view

  camera.position.x = center.x + direction.x * cameraZ;
  camera.position.y = center.y + direction.y * cameraZ * 0.5 + (size.y * 0.5); // Lift up slightly
  camera.position.z = center.z + direction.z * cameraZ;

  camera.lookAt(center);

  // Update controls
  controls.target.copy(center);
  controls.update();
}

function createProceduralModel(scene, weaponType) {
  const group = new THREE.Group();

  // Material
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.9,
    roughness: 0.2,
  });
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    metalness: 0.1,
    roughness: 0.8
  });
  const blackMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.8,
    roughness: 0.4
  });

  const isPistol = weaponType.toLowerCase().includes('pistol') || weaponType.toLowerCase().includes('revolver');

  if (isPistol) {
    // ... (Pistol Geometry - same as before)
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.4), blackMetalMaterial);
    barrel.position.set(0.5, 0.8, 0);
    group.add(barrel);
    const slide = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.5), metalMaterial);
    slide.position.set(0.5, 1.0, 0);
    group.add(slide);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.45), woodMaterial);
    grip.position.set(-0.5, 0.2, 0);
    grip.rotation.z = 0.2;
    group.add(grip);
    const guard = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16, Math.PI), blackMetalMaterial);
    guard.position.set(0, 0.5, 0);
    guard.rotation.z = Math.PI;
    group.add(guard);
  } else {
    // ... (Rifle Geometry - same as before)
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 16), blackMetalMaterial);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(2, 0.6, 0);
    group.add(barrel);
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.4), metalMaterial);
    body.position.set(-0.5, 0.6, 0);
    group.add(body);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.3), woodMaterial);
    stock.position.set(-2.5, 0.4, 0);
    group.add(stock);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 0.3), blackMetalMaterial);
    mag.position.set(0, -0.2, 0);
    mag.rotation.z = 0.2;
    group.add(mag);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.3), woodMaterial);
    grip.position.set(-1.2, 0, 0);
    grip.rotation.z = 0.3;
    group.add(grip);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 16), blackMetalMaterial);
    scope.rotation.z = Math.PI / 2;
    scope.position.set(-0.5, 1.1, 0);
    group.add(scope);
  }

  scene.add(group);

  // Auto-rotate logic for procedural
  function animateProcedural() {
    requestAnimationFrame(animateProcedural);
    group.rotation.y += 0.005;
  }
  animateProcedural();
}
