const resultDiv = document.getElementById("result");

let currentPage = 1;
let pageSize = 20;
let currentSearch = '';
let currentFilter = 'all';
let allLogs = [];
let currentLogs = [];

async function fetchLogs() {
  // Show loading overlay
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('loading-hidden');
  }
  
  try {
    const res = await fetch('http://localhost:3000/Log');
    if (!res.ok) throw new Error('Unable to fetch data');
    allLogs = await res.json();
    
    // Initialize filtered logs
    currentLogs = [...allLogs];
    
    // Update statistics
    updateCounts();
    
    // Filter/Search
    filterLogs();
    
  } catch (e) {
    console.error('Error fetching logs:', e);
    showError('Failed to load logs: ' + e.message);
  } finally {
    // Hide loading with a small delay for smooth transition
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('loading-hidden');
      }
    }, 200);
  }
}

function filterLogs() {
  let filtered = allLogs.filter(log => {
    let matchSearch = !currentSearch || 
      (log.name && log.name.toLowerCase().includes(currentSearch.toLowerCase())) || 
      (log.barcode && log.barcode.toLowerCase().includes(currentSearch.toLowerCase()));
    
    let matchFilter = currentFilter === 'all' || 
      (currentFilter === 'add' && log.action && log.action.includes('เพิ่ม')) || 
      (currentFilter === 'delete' && log.action && log.action.includes('ลบ'));
    
    return matchSearch && matchFilter;
  });
  
  // === เรียง log ใหม่สุดไว้บนสุด ===
  filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Pagination
  const total = filtered.length;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  currentLogs = filtered.slice(start, end);
  
  renderLogs(currentLogs);
  renderPagination(total);
}

function renderLogs(logs) {
  const result = document.getElementById('result');
  if (!logs.length) {
    result.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p class="text-gray-500 text-lg font-medium">No data found</p>
        <p class="text-gray-400 text-sm">Try changing filters or search terms</p>
      </div>
    `;
    return;
  }
  
  result.innerHTML = logs.map(log => {
    let badgeClass = 'bg-yellow-100 text-yellow-700';
    let actionText = log.action || 'Unknown';
    
    if (log.action && (log.action === 'เพิ่ม' || log.action.includes('เพิ่ม'))) {
      badgeClass = 'bg-green-100 text-green-700';
      actionText = 'Add Chemical';
    } else if (log.action && (log.action === 'ลบ' || log.action.includes('ลบ'))) {
      badgeClass = 'bg-red-100 text-red-700';
      actionText = 'Delete Chemical';
    }
    
    return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4 cursor-pointer log-row hover:shadow-md transition-shadow" data-log='${JSON.stringify(log)}'>
        <span class="inline-block px-3 py-1 rounded-lg text-sm font-bold ${badgeClass}">${actionText}</span>
        <div class="flex-1">
          <div class="font-medium text-gray-800">${log.name || 'Unknown Name'}</div>
          <div class="text-sm text-gray-500">Barcode: ${(log.barcode && log.barcode.trim() !== "") ? log.barcode : '-'}</div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600">${formatDate(log.time)}</div>
          <div class="text-xs text-gray-400">${log.user || 'Unknown User'}</div>
        </div>
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click event for modal
  document.querySelectorAll('.log-row').forEach(row => {
    row.addEventListener('click', () => {
      const log = JSON.parse(row.dataset.log);
      showLogDetailModal(log);
    });
  });
}

function renderPagination(total) {
  const pageCount = Math.ceil(total / pageSize);
  const pagination = document.getElementById('pagination');
  if (pageCount <= 1) { 
    pagination.innerHTML = ''; 
    return; 
  }
  
  let html = '';
  for (let i = 1; i <= pageCount; i++) {
    html += `<button class="px-3 py-2 rounded-lg ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors" data-page="${i}">${i}</button>`;
  }
  pagination.innerHTML = html;
  pagination.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      filterLogs();
    });
  });
}

// Update statistics
function updateCounts() {
  const totalLogs = allLogs.length;
  const addLogs = allLogs.filter(log => log.action && (log.action === 'เพิ่ม' || log.action.includes('เพิ่ม'))).length;
  const deleteLogs = allLogs.filter(log => log.action && (log.action === 'ลบ' || log.action.includes('ลบ'))).length;
  const today = new Date().toDateString();
  const todayLogs = allLogs.filter(log => {
    const logDate = new Date(log.time).toDateString();
    return logDate === today;
  }).length;

  // Update statistics cards
  const totalElement = document.getElementById('totalLogsCount');
  const addElement = document.getElementById('addLogsCount');
  const deleteElement = document.getElementById('deleteLogsCount');
  const todayElement = document.getElementById('todayLogsCount');
  const showingElement = document.getElementById('showingLogsCount');

  if (totalElement) totalElement.textContent = totalLogs;
  if (addElement) addElement.textContent = addLogs;
  if (deleteElement) deleteElement.textContent = deleteLogs;
  if (todayElement) todayElement.textContent = todayLogs;
  if (showingElement) showingElement.textContent = currentLogs.length;
}

function showError(msg) {
  document.getElementById('result').innerHTML = `
    <div class="text-center py-8">
      <div class="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <p class="text-red-500 text-lg font-medium">An error occurred</p>
      <p class="text-red-400 text-sm">${msg}</p>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Unknown';
  return d.toLocaleString('th-TH');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Search input
  const searchInput = document.getElementById('log-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value;
      currentPage = 1;
      filterLogs();
    });
  }
  
  // Filter buttons
  const filterAllBtn = document.getElementById('filterAll');
  const filterAddBtn = document.getElementById('filterAdd');
  const filterDeleteBtn = document.getElementById('filterDelete');
  
  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
      currentFilter = 'all';
      currentPage = 1;
      updateFilterButtons();
      filterLogs();
    });
  }
  
  if (filterAddBtn) {
    filterAddBtn.addEventListener('click', () => {
      currentFilter = 'add';
      currentPage = 1;
      updateFilterButtons();
      filterLogs();
    });
  }
  
  if (filterDeleteBtn) {
    filterDeleteBtn.addEventListener('click', () => {
      currentFilter = 'delete';
      currentPage = 1;
      updateFilterButtons();
      filterLogs();
    });
  }
  
  // Filter select
  const filterSelect = document.getElementById('log-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', e => {
      currentFilter = e.target.value;
      currentPage = 1;
      updateFilterButtons();
      filterLogs();
    });
  }
  
  // Clear filter button
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', () => {
      currentSearch = '';
      currentFilter = 'all';
      if (searchInput) searchInput.value = '';
      if (filterSelect) filterSelect.value = 'all';
      currentPage = 1;
      updateFilterButtons();
      filterLogs();
    });
  }
  
  // Export CSV button
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportLogsToCsv);
  }
  
  // Modal close buttons
  const closeLogDetailModal = document.getElementById('closeLogDetailModal');
  if (closeLogDetailModal) {
    closeLogDetailModal.addEventListener('click', () => {
      document.getElementById('logDetailModal').classList.add('hidden');
    });
  }
  
  // Help Modal Functionality
  const helpButton = document.getElementById('helpButton');
  const closeHelpModal = document.getElementById('closeHelpModal');
  const closeHelpModal2 = document.getElementById('closeHelpModal2');
  
  if (helpButton) {
    helpButton.addEventListener('click', function() {
      document.getElementById('helpModal').classList.remove('hidden');
    });
  }
  
  if (closeHelpModal) {
    closeHelpModal.addEventListener('click', function() {
      document.getElementById('helpModal').classList.add('hidden');
    });
  }
  
  if (closeHelpModal2) {
    closeHelpModal2.addEventListener('click', function() {
      document.getElementById('helpModal').classList.add('hidden');
    });
  }
  
  // Contact Modal Functionality
  const contactButton = document.getElementById('contactButton');
  const closeContactModal = document.getElementById('closeContactModal');
  const closeContactModal2 = document.getElementById('closeContactModal2');
  
  if (contactButton) {
    contactButton.addEventListener('click', function() {
      document.getElementById('contactModal').classList.remove('hidden');
    });
  }
  
  if (closeContactModal) {
    closeContactModal.addEventListener('click', function() {
      document.getElementById('contactModal').classList.add('hidden');
    });
  }
  
  if (closeContactModal2) {
    closeContactModal2.addEventListener('click', function() {
      document.getElementById('contactModal').classList.add('hidden');
    });
  }
  
  // Initialize filter buttons
  updateFilterButtons();
  
  // Initial fetch
  fetchLogs();
  
  // Hide initial loading after a short delay
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('loading-hidden');
    }
  }, 500);
});

// Update filter button styles
function updateFilterButtons() {
  const buttons = {
    all: document.getElementById('filterAll'),
    add: document.getElementById('filterAdd'),
    delete: document.getElementById('filterDelete')
  };
  
  Object.keys(buttons).forEach(key => {
    const button = buttons[key];
    if (button) {
      if (key === currentFilter) {
        button.classList.remove('bg-gray-50', 'text-gray-700', 'border-gray-200');
        if (key === 'all') {
          button.classList.add('bg-sky-100', 'text-sky-700', 'border-sky-200');
        } else if (key === 'add') {
          button.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
        } else if (key === 'delete') {
          button.classList.add('bg-rose-50', 'text-rose-700', 'border-rose-200');
        }
      } else {
        button.classList.remove('bg-sky-100', 'text-sky-700', 'border-sky-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-rose-50', 'text-rose-700', 'border-rose-200');
        button.classList.add('bg-gray-50', 'text-gray-700', 'border-gray-200');
      }
    }
  });
}

function exportLogsToCsv() {
  if (!currentLogs.length) {
    alert('No data to export');
    return;
  }
  
  const headers = ['Date', 'Time', 'Action', 'Chemical Name', 'Barcode', 'User', 'Note'];
  const csvContent = [
    headers.join(','),
    ...currentLogs.map(log => [
      new Date(log.time).toLocaleDateString('th-TH'),
      new Date(log.time).toLocaleTimeString('th-TH'),
      log.action || 'Unknown',
      log.name || '',
      log.barcode || '',
      log.user || '',
      log.note || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `log_history_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Modal รายละเอียด log
function showLogDetailModal(log) {
  const modal = document.getElementById('logDetailModal');
  const infoCol = document.getElementById('logDetailInfoCol');
  const imgCol = document.getElementById('logDetailImgCol');
  
  let badgeClass = 'bg-yellow-100 text-yellow-700';
  let actionText = log.action || 'Unknown';
  
  if (log.action && (log.action === 'เพิ่ม' || log.action.includes('เพิ่ม'))) {
    badgeClass = 'bg-green-100 text-green-700';
    actionText = 'Add Chemical';
  } else if (log.action && (log.action === 'ลบ' || log.action.includes('ลบ'))) {
    badgeClass = 'bg-red-100 text-red-700';
    actionText = 'Delete Chemical';
  }
  
  // แสดงรูปจาก database ถ้ามี
  let imgHtml = '';
  if (log.picture && log.picture.data) {
    // กรณี buffer (เช่น MySQL)
    const base64String = arrayBufferToBase64(log.picture.data);
    imgHtml = `<img src="data:image/jpeg;base64,${base64String}" alt="${log.name || ''}" class="w-24 h-24 rounded-lg object-cover shadow-sm border border-gray-200 mx-auto" />`;
  } else if (log.picture && typeof log.picture === 'string' && log.picture.startsWith('data:image')) {
    // กรณี base64 string
    imgHtml = `<img src="${log.picture}" alt="${log.name || ''}" class="w-24 h-24 rounded-lg object-cover shadow-sm border border-gray-200 mx-auto" />`;
  } else {
    imgHtml = '<div class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-3xl text-gray-400 shadow-sm border border-gray-200 mx-auto">?</div>';
  }
  
  imgCol.innerHTML = imgHtml;
  infoCol.innerHTML = `
    <div class="mb-3"><span class="font-bold text-gray-800">Chemical Name:</span> <span class="text-gray-700">${log.name || 'Unknown'}</span></div>
    <div class="mb-3"><span class="font-bold text-gray-800">Barcode:</span> <span class="text-gray-700">${(log.barcode && log.barcode.trim() !== "") ? log.barcode : '-'}</span></div>
    <div class="mb-3"><span class="font-bold text-gray-800">Time:</span> <span class="text-gray-700">${formatDate(log.time)}</span></div>
    <div class="mb-3"><span class="font-bold text-gray-800">User:</span> <span class="text-gray-700">${log.user || 'Unknown'}</span></div>
    <div class="mb-3"><span class="font-bold text-gray-800">Note:</span> <span class="text-gray-700">${log.note || 'None'}</span></div>
  `;
  modal.classList.remove('hidden');
}

// helper สำหรับ buffer => base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Exportable function to refresh logs externally
window.refreshLogs = fetchLogs;