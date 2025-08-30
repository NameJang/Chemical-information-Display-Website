var isDeleteMode = false;
var chemicalToDelete = null;
let isEditingChemical = false;
let allChemicals = []; // Store all chemicals for search functionality

function handleClick(el) {
    name1 = el.dataset.name;
    setname(name1);
}
function setname(name){
    console.log(name)
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterChemicals(searchTerm);
        });
    }
}

function filterChemicals(searchTerm) {
    const container = document.getElementById("cardContainer");
    if (!container) return;

    if (!searchTerm) {
        // If search is empty, show all chemicals
        displayChemicals(allChemicals);
        return;
    }

    // Filter chemicals based on search term
    const filteredChemicals = allChemicals.filter(chemical => {
        const name = (chemical.name || '').toLowerCase();
        const formula = (chemical.formula || '').toLowerCase();
        const type = (chemical.type || '').toLowerCase();
        const location = (chemical.locatename || '').toLowerCase();
        
        return name.includes(searchTerm) || 
               formula.includes(searchTerm) || 
               type.includes(searchTerm) || 
               location.includes(searchTerm);
    });

    displayChemicals(filteredChemicals);
}

function displayChemicals(chemicals) {
    const container = document.getElementById("cardContainer");
    if (!container) return;

    container.innerHTML = ""; // Clear previous cards
    container.style.display = "flex";
    container.style.flexWrap = "wrap";
    container.style.gap = "40px";
    container.style.justifyContent = "flex-start";

    if (chemicals.length === 0) {
        container.innerHTML = `
            <div class="col-span-full px-6 py-8 text-center">
                <div class="flex flex-col items-center justify-center">
                    <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium">No chemicals found</p>
                    <p class="text-gray-400 text-sm">Try adjusting your search criteria</p>
                </div>
            </div>
        `;
        return;
    }

    chemicals.forEach((item) => {
        const card = document.createElement("div");
        card.setAttribute("style", "display: flex; flex-direction: column; justify-content: center; align-items: center; width: 190px; height: 190px; cursor: pointer;");
        card.className = "relative rounded-2xl shadow-lg hover:shadow-2xl text-center storage-card bg-slate-200 border border-slate-200 ring-1 ring-slate-300 text-slate-800 transition";

        // Add data attributes for all item properties
        Object.keys(item).forEach(key => {
            card.dataset[key] = JSON.stringify(item[key]);
        });

        card.innerHTML = `
            <div class="absolute top-2 right-3 text-xs text-indigo-600 font-bold">${item.locatename}</div>
            ${item.picture && item.picture.length > 30
                ? `<img src="data:image/jpeg;base64,${item.picture}" alt="${item.name}" class="w-20 h-20 object-cover mb-2 rounded-md" />`
                : `<div class="w-20 h-20 mb-2 bg-slate-400 rounded-md"></div>`
            }
            <p class="text-lg font-semibold text-slate-900 mb-1 mt-3">${item.name}</p>
        `;
        card.addEventListener('click', () => {
            window.currentname = item.name;
            if (isDeleteMode) {
                document.querySelectorAll('.storage-card').forEach(c => {
                    c.style.border = '1px solid #FFFFFF';
                });
                if (chemicalToDelete === item.name) {
                    chemicalToDelete = null;
                } else {
                    chemicalToDelete = item.name;
                    card.style.border = '2px solid #4F46E5';
                }
                return;
            }
            document.querySelectorAll('.storage-card').forEach(c => {
                c.style.border = '1px solid #FFFFFF';
            });
            card.style.border = '2px solid #4F46E5';
            showRightDetailsModal(item, allChemicals);
        });
        container.appendChild(card);
    });
}

async function fetchStorageData() {
    // Show loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('loading-hidden');
    }
    
    try {
        const response = await fetch("/Storage");
        const data = await response.json();
        console.log(data);
        
        // Store all chemicals for search functionality
        allChemicals = data;
        
        // Display all chemicals initially
        displayChemicals(allChemicals);

        // Fetch and update the total count
        await updateTotalCount();
        
        // Fetch and update the out-of-stock count
        await updateOutOfStockCount();
        
        // Fetch and update the expiring soon count
        await updateExpiringSoonCount();
        
        // Fetch and update the expired count
        await updateExpiredCount();
        
        // Fetch and update the in-stock count
        await updateInStockCount();
        
        // Fetch and update the room temperature count
        await updateRoomTempCount();

    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        // Hide loading with a small delay for smooth transition
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('loading-hidden');
            }
        }, 300);
    }
}

function arrayBufferToBase64(buffer) {
    const binary = new Uint8Array(buffer).reduce((acc, byte) => acc + String.fromCharCode(byte), "");
    return btoa(binary);
}

function showNoDataMessage() {
    const el = document.getElementById('rightDetailsContent');
    if (el) {
        el.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <span class="text-2xl">👁️</span><br>
                No data added to system yet
            </div>
        `;
    } else {
        Swal.fire('No data added to system yet', '', 'info');
    }
}

function showRightDetailsModal(selectedItem, allItems) {
    window.currentDetailItem = selectedItem;
    let modal = document.getElementById('itemDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'itemDetailsModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.right = '0';
        modal.style.width = '400px';
        modal.style.height = '100vh';
        modal.style.backgroundColor = '#f8fafc';
        modal.style.zIndex = '1000';
        modal.style.boxShadow = '-5px 0 24px 0 rgba(30,41,59,0.10)';
        modal.style.transition = 'transform 0.3s ease';
        modal.style.overflowY = 'auto';
        modal.style.padding = '0';
        modal.style.color = '#1e293b';
        document.body.appendChild(modal);
    } else {
        modal.style.backgroundColor = '#f8fafc';
        modal.style.color = '#1e293b';
    }

    fetch(`http://localhost:3000/Barcode/name/${encodeURIComponent(selectedItem.name)}`)
        .then(response => {
            if (!response.ok) {
                return { data: [] };
            }
            return response.json();
        })
        .then(barcodeData => {
            const barcodes = Array.isArray(barcodeData.data) ? barcodeData.data : [];
            const today = new Date();
            const totalItems = selectedItem.amount !== undefined ? selectedItem.amount : 0;
            const nearExpiryItems = barcodes.filter(item => {
                if (!item.expireddate) return false;
                const expiryDate = new Date(item.expireddate);
                const diffTime = expiryDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 && diffDays <= 21;
            }).length;
            const expiredItems = barcodes.filter(item => {
                if (!item.expireddate) return false;
                const expiryDate = new Date(item.expireddate);
                return expiryDate < today;
            }).length;

            modal.innerHTML = `
            <div style="position: relative; font-family: 'Kanit', sans-serif; min-height: 100vh; background: #f8fafc; padding-bottom: 32px;">
                <div style='margin-top: 32px; padding: 0 24px 0 24px;'>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; position: relative;">
                    <h2 style="font-size: 1.6rem; font-weight: bold; background: linear-gradient(90deg,#2563eb,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #2563eb; margin: 0; flex: 1;">${selectedItem.name}</h2>
                    <button class='eye-icon' title='View left side details' style="width: 40px; height: 40px; background: #fff; border-radius: 50%; border: 2.5px solid #2563eb; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(37,99,235,0.10); cursor: pointer; transition: box-shadow 0.2s, border-color 0.2s, background 0.2s; outline: none; margin-right: 16px;">
                      <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='#2563eb' viewBox='0 0 16 16'>
                        <path d='M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z'/>
                        <path d='M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z'/>
                      </svg>
                    </button>
                    <button id="modalCloseButton" style="width: 36px; height: 36px; background: #f1f5f9; border: none; border-radius: 50%; color: #64748b; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1001; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(30,41,59,0.06); margin-left: 0;">×</button>
                  </div>
                  <style>
                  .eye-icon:hover {
                    border-color: #1d4ed8 !important;
                    background: #eff6ff !important;
                    box-shadow: 0 4px 16px 0 rgba(37,99,235,0.18);
                  }
                  .eye-icon:active {
                    background: #dbeafe !important;
                  }
                  </style>
                  <!-- Statistics Summary -->
                  <div style="display: flex; justify-content: space-between; margin-bottom: 28px; gap: 12px;">
                      <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                          <div style="font-size: 13px; color: #64748b; margin-bottom: 2px;">Total Items</div>
                          <div style="font-size: 1.5rem; font-weight: bold; color: #2563eb;">${totalItems}</div>
                      </div>
                      <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                          <div style="font-size: 13px; color: #eab308; margin-bottom: 2px;">Near Expiry</div>
                          <div style="font-size: 1.5rem; font-weight: bold; color: #eab308;">${nearExpiryItems}</div>
                      </div>
                      <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                          <div style="font-size: 13px; color: #ef4444; margin-bottom: 2px;">Expired</div>
                          <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${expiredItems}</div>
                      </div>
                  </div>
                  <!-- Main Item Card Display -->
                  <div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.04); border: 1.5px solid #e5e7eb; color: #1e293b; padding: 18px 12px; margin-bottom: 12px; min-height: 60px; max-height: 340px; overflow-y: auto;">
                      ${barcodes.length > 0
                          ? barcodes.map(bc => `
                              <div style="background: #fff; border-radius: 12px; margin-bottom: 12px; padding: 12px 10px; display: flex; flex-direction: column; align-items: flex-start; border: 1.5px solid #e5e7eb; box-shadow: 0 1px 4px rgba(30,41,59,0.03);">
                                  <div style="font-weight: bold; color: #ef4444; font-size: 1.1rem; margin-bottom: 2px;">Exp : ${bc.expireddate ? formatThaiDate(bc.expireddate) : 'N/A'}</div>
                                  <div style="font-weight: bold; color: #2563eb; font-size: 1.2rem;">Barcode : ${bc.barcode || 'N/A'}</div>
                              </div>
                          `).join('')
                          : '<div style="color:#94a3b8; text-align:center;">No barcode data</div>'
                      }
                  </div>
                </div>
            </div>
        `;

            modal.querySelector('.eye-icon').addEventListener('click', () => {
                showLeftDetailsPanel(selectedItem);
            });
            document.getElementById('modalCloseButton').addEventListener('click', () => {
                closeRightModal();
            });
            modal.style.transform = 'translateX(0)';
        })
        .catch(error => {
            const today = new Date();
            const totalItems = selectedItem.amount !== undefined ? selectedItem.amount : 0;
            const nearExpiryItems = 0;
            const expiredItems = 0;
            modal.innerHTML = `
            <div style="position: relative; font-family: 'Kanit', sans-serif; min-height: 100vh; background: #f8fafc; padding-bottom: 32px;">
                <button id="modalCloseButton" style="position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; background: #f1f5f9; border: none; border-radius: 50%; color: #64748b; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1001; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(30,41,59,0.06);">×</button>
                <div class="eye-icon" style="position: absolute; top: 22px; left: 50%; transform: translateX(-50%); width: 38px; height: 38px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; border: 1.5px solid #e5e7eb; box-shadow: 0 2px 8px rgba(59,130,246,0.08);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#2563eb" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                </div>
                <div style="margin-top: 80px; padding: 0 24px 0 24px;">
                    <h2 style="font-size: 1.6rem; margin-bottom: 24px; font-weight: bold; text-align: center; background: linear-gradient(90deg,#2563eb,#7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #2563eb;">${selectedItem.name}</h2>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 28px; gap: 12px;">
                        <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 2px;">Total Items</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #2563eb;">${totalItems}</div>
                        </div>
                        <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                            <div style="font-size: 13px; color: #eab308; margin-bottom: 2px;">Near Expiry</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #eab308;">${nearExpiryItems}</div>
                        </div>
                        <div style="flex:1; background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.06); border: 1.5px solid #e5e7eb; text-align: center; padding: 18px 0;">
                            <div style="font-size: 13px; color: #ef4444; margin-bottom: 2px;">Expired</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">${expiredItems}</div>
                        </div>
                    </div>
                    <div style="background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(30,41,59,0.04); border: 1.5px solid #e5e7eb; color: #1e293b; padding: 18px 12px; margin-bottom: 12px; min-height: 60px; max-height: 340px; overflow-y: auto;">
                        <div style="color:#94a3b8; text-align:center;">Error loading barcode data</div>
                    </div>
                </div>
            </div>
            `;
            modal.querySelector('.eye-icon').addEventListener('click', () => {
                showLeftDetailsPanel(selectedItem);
            });
            document.getElementById('modalCloseButton').addEventListener('click', () => {
                closeRightModal();
            });
            modal.style.transform = 'translateX(0)';
        });
}

function showLeftDetailsPanel(item) {
    const leftPanel = document.getElementById('leftDetailsPanel');
    const titleEl = document.getElementById('leftDetailsTitle');
    const imageContainer = document.getElementById('leftDetailsImageContainer');
    const detailsContainer = document.getElementById('chemicalDetailsContainer');

    if (!leftPanel || !titleEl || !imageContainer || !detailsContainer) {
        console.error('Required elements for the left details panel are not found.');
        return;
    }

    titleEl.textContent = item.name || 'Unknown Name';

    if (item.picture && item.picture.length > 30) {
        imageContainer.innerHTML = `<img src="data:image/jpeg;base64,${item.picture}" alt="${item.name}" class="w-full h-full object-contain" />`;
    } else {
        imageContainer.innerHTML = `
            <div class="text-slate-400">
                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">No image available</p>
            </div>
        `;
    }

    detailsContainer.innerHTML = `
        <p><strong>Location:</strong> ${item.locatename || 'N/A'}</p>
        <p><strong>Formula:</strong> ${item.formula || 'N/A'}</p>
        <p><strong>Type:</strong> <span data-field="Type">${item.type || 'N/A'}</span></p>
        <p><strong>Warning:</strong> <span data-field="Warning" class="text-red-500 font-semibold">${item.warning || 'N/A'}</span></p>
        <p><strong>Elucidation:</strong> <span data-field="Elucidation">${item.elucidation || 'N/A'}</span></p>
        <p><strong>Amount:</strong> <span class="font-bold text-blue-600">${item.amount !== undefined ? item.amount : 'N/A'}</span></p>
    `;

    fetchShelfCountForChemical(item.name);
    fetchCabinetCountForChemical(item.name);

    leftPanel.style.transform = 'translateX(0)';
}

// Function to fetch shelf count for a specific chemical
async function fetchShelfCountForChemical(chemicalName) {
    console.log('Fetching shelf count for chemical:', chemicalName);
    try {
        const url = `http://localhost:3000/Barcode/count/location/shelf/${encodeURIComponent(chemicalName)}`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Update the shelf count display in the left panel
        const shelfCountElement = document.getElementById('shelfCountDisplay');
        console.log('Shelf count element found:', !!shelfCountElement);
        
        if (shelfCountElement) {
            shelfCountElement.textContent = data.shelfCount;
            console.log('Updated shelf count to:', data.shelfCount);
        }
    } catch (error) {
        console.error("Error fetching shelf count for chemical:", error);
        // Set default value if error occurs
        const shelfCountElement = document.getElementById('shelfCountDisplay');
        if (shelfCountElement) {
            shelfCountElement.textContent = '0';
        }
    }
}

// Function to fetch cabinet count for a specific chemical
async function fetchCabinetCountForChemical(chemicalName) {
    console.log('Fetching cabinet count for chemical:', chemicalName);
    try {
        const url = `http://localhost:3000/Barcode/count/location/cabinet/${encodeURIComponent(chemicalName)}`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        // Update the cabinet count display in the left panel
        const cabinetCountElement = document.getElementById('cabinetCountDisplay');
        console.log('Cabinet count element found:', !!cabinetCountElement);
        
        if (cabinetCountElement) {
            cabinetCountElement.textContent = data.cabinetCount;
            console.log('Updated cabinet count to:', data.cabinetCount);
        }
    } catch (error) {
        console.error("Error fetching cabinet count for chemical:", error);
        // Set default value if error occurs
        const cabinetCountElement = document.getElementById('cabinetCountDisplay');
        if (cabinetCountElement) {
            cabinetCountElement.textContent = '0';
        }
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function closeLeftPanel() {
    const leftPanel = document.getElementById('leftDetailsPanel');
    if (leftPanel) {
        leftPanel.style.transform = 'translateX(-100%)';
    }
}

function closeRightModal() {
    const modal = document.getElementById('itemDetailsModal');
    if (modal) {
        modal.style.transform = 'translateX(100%)';
    }

    // Remove highlight from all cards when modal is closed
    document.querySelectorAll('.storage-card').forEach(c => {
        c.style.border = '1px solid #FFFFFF';
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

// เปิด popup เมื่อกดปุ่ม "เพิ่มสารชนิดนี้"
// อ้างอิงถึง DOM elements - moved inside functions to avoid timing issues
var addChemicalButton, popupOverlay, addChemicalPopup, popupCancel, popupConfirm;

// Initialize DOM elements when document is ready
function initializeDOMElements() {
    addChemicalButton = document.getElementById("addChemicalButton");
    popupOverlay = document.getElementById("popupOverlay");
    addChemicalPopup = document.getElementById("addChemicalPopup");
    popupCancel = document.getElementById("popup_cancel");
    popupConfirm = document.getElementById("popup_confirm");

    // Add event listeners only if elements exist
    if (addChemicalButton) {
        addChemicalButton.addEventListener("click", () => {
            closeRightModal();
            popupOverlay.classList.remove("hidden");
            addChemicalPopup.classList.remove("hidden");
        });
    }

    if (popupCancel) {
        popupCancel.addEventListener("click", closePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener("click", (event) => {
            if (event.target === popupOverlay) closePopup(); // ปิดเมื่อคลิกด้านนอก popup
        });
    }

    if (popupConfirm) {
        popupConfirm.addEventListener("click", handlePopupConfirm);
    }

    // Add event listener for edit chemical button
    const editChemicalButton = document.getElementById("editChemicalButton");
    if (editChemicalButton) {
        editChemicalButton.addEventListener("click", handleEditChemical);
    }

    setupDeleteFunctionality();
    setupSearchFunctionality();
}

function closePopup() {
    popupOverlay.classList.add("hidden");
    addChemicalPopup.classList.add("hidden");

    // Reset form
    document.getElementById("popup_barcode").value = "";
    document.getElementById("popup_expire").value = "";
    document.getElementById("popup_import").value = "";
    document.getElementById("popup_location").value = "";
}

function handlePopupConfirm() {
    const barcode = document.getElementById("popup_barcode").value;
    const expire = document.getElementById("popup_expire").value;
    const importDate = document.getElementById("popup_import").value;
    const location = document.getElementById("popup_location").value.trim();

    // ใช้ชื่อสารจากตัวแปร global currentname
    let name = window.currentname || '';
    if (!name) {
        Swal.fire('Please fill in all required fields', '', 'info');
        return;
    }
    // ถ้าไม่กรอก barcode ให้เพิ่ม barcode เป็น null ใน table barcode ด้วย
    if (!barcode || barcode.trim() === "") {
        const data = {
            Name: name,
            Barcode: null, // ส่ง null ไป backend
            Location: location,
            ImportDate: importDate,
            ExpiredDate: expire
        };
        fetch("http://localhost:3000/Barcode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error("Error sending data");
            return response.json();
        })
        .then(result => {
            // หลังจากเพิ่มข้อมูลสำเร็จ ให้เรียก API เพิ่มจำนวน
            return fetch(`http://localhost:3000/Storage/Increase/${encodeURIComponent(name)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (!response.ok) throw new Error("Error adding quantity");
                return response.json();
            }).then(async result => {
                // === เพิ่ม log ===
                try {
                    await fetch("http://localhost:3000/Log", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: name,
                            barcode: null, // ส่ง null จริงๆ
                            action: "เพิ่มจำนวน +1 (no barcode)"
                        })
                    });
                } catch (e) {
                    console.error("Error logging add action", e);
                }
                Swal.fire('Chemical data added (no barcode)', '', 'success');
                closePopup();
                fetchStorageData();
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire('Error sending data', '', 'error');
        });
        return;
    }
    // ถ้ามี barcode: ทำงานแบบเดิม
    const data = {
        Name: name,
        Barcode: barcode.trim(),
        Location: location,
        ImportDate: importDate,
        ExpiredDate: expire
    };
    fetch("http://localhost:3000/Barcode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) throw new Error("Error sending data");
            return response.json();
        })
        .then(result => {
            // หลังจากเพิ่มข้อมูลสำเร็จ ให้เรียก API เพิ่มจำนวน
            return fetch(`http://localhost:3000/Storage/Increase/${encodeURIComponent(name)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (!response.ok) throw new Error("Error adding quantity");
                return response.json();
            }).then(async result => {
                // === เพิ่ม log ===
                try {
                    await fetch("http://localhost:3000/Log", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name: name,
                            barcode: barcode.trim(),
                            action: "เพิ่มจำนวน +1"
                        })
                    });
                } catch (e) {
                    console.error("Error logging add action", e);
                }
                Swal.fire('Chemical data added successfully', '', 'success');
                closePopup();
                fetchStorageData();
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire('Error sending data', '', 'error');
        });
}

// เปิด popup เมื่อกดปุ่มยืมสาร
document.getElementById('borrowButton').addEventListener('click', () => {
    document.getElementById('borrowPopupOverlay').style.display = 'flex';
});

// ปิด popup
document.getElementById('borrow_cancel').addEventListener('click', () => {
    document.getElementById('borrowPopupOverlay').style.display = 'none';
});

// ยืนยันข้อมูลและส่งไป backend
document.getElementById('borrow_confirm').addEventListener('click', () => {
    const name = document.getElementById('borrow_name').value.trim();
    const barcode = document.getElementById('borrow_barcode').value.trim();
    const className = document.getElementById('borrow_class').value.trim();
    const phone = document.getElementById('borrow_phone').value.trim();

    if (!name || !barcode || !className || !phone) {
        Swal.fire('Please fill in all required fields', '', 'info');
        return;
    }

    const borrowData = {
        Name: name,
        Barcode: barcode,
        BorrowTime: new Date().toISOString(),
        ClassName: className,
        Phonenumber: phone
    };

    fetch('http://localhost:3000/Chemical_Returns/Borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowData)
    })
    .then(res => {
        if (!res.ok) throw new Error("ส่งข้อมูลล้มเหลว");
        return res.json();
    })
    .then(data => {
        Swal.fire('Borrowing recorded successfully', '', 'success');
        document.getElementById('borrowPopupOverlay').style.display = 'none';
    })
    .catch(err => {
        console.error(err);
        Swal.fire('Error sending data', '', 'error');
    });
});

// เปิด popup คืนสาร
document.getElementById('returnButton').addEventListener('click', () => {
    document.getElementById('returnPopupOverlay').style.display = 'flex';
});

// ปิด popup
document.getElementById('return_cancel').addEventListener('click', () => {
    document.getElementById('returnPopupOverlay').style.display = 'none';
});

// ยืนยันคืนสาร
document.getElementById('return_confirm').addEventListener('click', () => {
    const name = document.getElementById('return_name').value.trim();
    const barcode = document.getElementById('return_barcode').value.trim();
    const className = document.getElementById('return_class').value.trim();
    const phone = document.getElementById('return_phone').value.trim();

    if (!name || !barcode || !className || !phone) {
        Swal.fire('Please fill in all required fields', '', 'info');
        return;
    }

    const returnData = {
        Name: name,
        Barcode: barcode,
        ReturnTime: new Date().toISOString(),
        ClassName: className,
        Phonenumber: phone
    };

    fetch('http://localhost:3000/Chemical_Returns/Return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData)
    })
    .then(res => {
        if (!res.ok) throw new Error("ไม่สามารถส่งข้อมูลได้");
        return res.json();
    })
    .then(data => {
        Swal.fire('Return recorded successfully', '', 'success');
        document.getElementById('returnPopupOverlay').style.display = 'none';
    })
    .catch(err => {
        console.error(err);
        Swal.fire('Error saving', '', 'error');
    });
});

window.onload = function() {
    initializeDOMElements();
    fetchStorageData();
    setupAddChemicalFormHandler();
};

function setupAddChemicalFormHandler() {
    const form = document.getElementById('addChemicalForm');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const Name = form.elements['Name'].value.trim();
        const formula = form.elements['formula'].value.trim();
        const Type = form.elements['Type'].value.trim();
        const Warning = form.elements['Warning'].value.trim();
        const Elucidation = form.elements['Elucidation'].value.trim();
        const LocateName = form.elements['LocateName'].value.trim();
        const PictureInput = form.elements['Picture'];
        const file = PictureInput && PictureInput.files && PictureInput.files[0] ? PictureInput.files[0] : null;

        if (!Name || !formula || !Type || !LocateName) {
            Swal.fire('Please fill in all required fields', '', 'info');
            return;
        }

        let pictureBase64 = '';
        if (file) {
            pictureBase64 = await fileToBase64(file);
        }
        const data = { Name, formula, Type, Warning, Elucidation, LocateName, picture: pictureBase64 };

        try {
            const response = await fetch('http://localhost:3000/Storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                let errMsg = 'Error saving data';
                try {
                    const err = await response.json();
                    errMsg = err.error || errMsg;
                } catch {}
                throw new Error(errMsg);
            }

            Swal.fire('Chemical data added successfully', '', 'success');
            if (window.Alpine) {
                window.Alpine.store && window.Alpine.store('showAddChemicalModal', false);
            } else {
                const modal = document.querySelector('[x-show="showAddChemicalModal"]');
                if (modal) modal.style.display = 'none';
            }
            form.reset();
            fetchStorageData();
        } catch (err) {
            console.error('Error adding chemical:', err);
            Swal.fire(err.message || 'Error occurred', '', 'error');
        }
    });
}

// เพิ่มฟังก์ชันแปลงไฟล์เป็น base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // ตัด data:image/jpeg;base64, ออก
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Function to fetch and update the total count
async function updateTotalCount() {
    try {
        const response = await fetch("http://localhost:3000/Barcode/count");
        const data = await response.json();
        
        // Update the total count display
        const totalCountElement = document.getElementById('totalCount');
        if (totalCountElement) {
            totalCountElement.textContent = data.totalRows;
        }
    } catch (error) {
        console.error("Error fetching total count:", error);
    }
}

// Function to fetch and update the out-of-stock count
async function updateOutOfStockCount() {
    try {
        const response = await fetch("http://localhost:3000/Storage/count/zero");
        const data = await response.json();
        
        // Update the out-of-stock count display
        const outOfStockElement = document.getElementById('outOfStockCount');
        if (outOfStockElement) {
            outOfStockElement.textContent = data.zero_amount_count;
        }
    } catch (error) {
        console.error("Error fetching out-of-stock count:", error);
    }
}

// Function to fetch and update the expiring soon count
async function updateExpiringSoonCount() {
    try {
        const response = await fetch("http://localhost:3000/Barcode/count/expiring-soon");
        const data = await response.json();
        
        // Update the expiring soon count display
        const expiringSoonElement = document.getElementById('expiringSoonCount');
        if (expiringSoonElement) {
            expiringSoonElement.textContent = data.expiringSoon;
        }
    } catch (error) {
        console.error("Error fetching expiring soon count:", error);
    }
}

// Function to fetch and update the expired count
async function updateExpiredCount() {
    try {
        const response = await fetch("http://localhost:3000/Barcode/count/expired");
        const data = await response.json();
        
        // Update the expired count display
        const expiredElement = document.getElementById('expiredCount');
        if (expiredElement) {
            expiredElement.textContent = data.expiredCount;
        }
    } catch (error) {
        console.error("Error fetching expired count:", error);
    }
}

// Function to fetch and update the in-stock count
async function updateInStockCount() {
    try {
        const response = await fetch("http://localhost:3000/Barcode/count/location/cabinet");
        const data = await response.json();
        
        // Update the in-stock count display
        const inStockElement = document.getElementById('inStockCount');
        if (inStockElement) {
            inStockElement.textContent = data.cabinetCount;
        }
    } catch (error) {
        console.error("Error fetching in-stock count:", error);
    }
}

// Function to fetch and update the room temperature count
async function updateRoomTempCount() {
    try {
        const response = await fetch("http://localhost:3000/Barcode/count/location/shelf");
        const data = await response.json();
        
        // Update the room temperature count display
        const roomTempElement = document.getElementById('roomTempCount');
        if (roomTempElement) {
            roomTempElement.textContent = data.shelfCount;
        }
    } catch (error) {
        console.error("Error fetching room temperature count:", error);
    }
}

function formatThaiDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
}

// === Delete Chemical Popup Logic ===
const deleteConfirmBtn = document.getElementById('delete_confirm');
if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', async () => {
        const barcode = document.getElementById('delete_barcode').value.trim();
        const deleteTime = document.getElementById('delete_time').value;
        // ใช้ currentname เป็นชื่อสาร
        const name = window.currentname;
        if (!barcode) {
            Swal.fire('Please enter Barcode', '', 'info');
            return;
        }
        if (!deleteTime) {
            Swal.fire('Please fill in all required fields', '', 'info');
            return;
        }
        if (!name) {
            Swal.fire('ไม่พบชื่อสาร', '', 'info');
            return;
        }
        const confirmResult = await Swal.fire({
            title: 'Confirm Deletion',
            text: 'คุณแน่ใจว่าต้องการลบจำนวนสารนี้ -1 ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });
        if (!confirmResult.isConfirmed) return;
        try {
            // ลดจำนวนสาร -1 แทนที่จะลบ barcode
            const res = await fetch(`http://localhost:3000/Storage/Decrease/${encodeURIComponent(name)}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error('ลบจำนวนไม่สำเร็จ');
            // ส่ง log
            await fetch('http://localhost:3000/Log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    barcode: barcode,
                    action: 'ลบจำนวน -1'
                })
            });
            document.getElementById('deletePopupOverlay').classList.add('hidden');
            setTimeout(() => {
                Swal.fire('ลบจำนวนสำเร็จ (-1)', '', 'success');
            }, 200);
            await fetchStorageData(); // รีเฟรชข้อมูล
            // อัปเดต Total Items ใน ItemDetailModal ถ้ายังเปิดอยู่
            const modal = document.getElementById('itemDetailsModal');
            if (modal && modal.style.transform === 'translateX(0)') {
                // หา allItems ใหม่ (fetchStorageData อาจจะรีเฟรช data)
                // สมมติว่า fetchStorageData อัปเดตข้อมูลใน cardContainer แล้ว
                // ให้ใช้ window.currentDetailItem ที่เก็บไว้
                if (window.currentDetailItem) {
                    showRightDetailsModal(window.currentDetailItem, allChemicals); // allItems ไม่จำเป็นต้องใช้ใน modal นี้
                }
            }
        } catch (err) {
            console.error(err);
            Swal.fire('เกิดข้อผิดพลาดในการลบจำนวน', '', 'error');
        }
    });
}

// เพิ่ม event สำหรับปุ่มลบสารชนิดนี้ (deleteChemicalButton)
// const deleteChemicalBtn = document.getElementById('deleteChemicalButton');
// if (deleteChemicalBtn) {
//     deleteChemicalBtn.addEventListener('click', () => {
//         if (!currentname) {
//             alert('กรุณาเลือกสารก่อนลบ');
//             return;
//         }
//         // เปิด popup แทนที่จะลด amount ทันที
//         document.getElementById('deletePopupOverlay').classList.remove('hidden');
//     });
// }

function setupDeleteFunctionality() {
    const deleteModeButton = document.getElementById('deleteModeButton');
    if (!deleteModeButton) return;

    deleteModeButton.addEventListener('click', async () => {
        if (!isDeleteMode) {
            // เข้าสู่โหมดลบ
            isDeleteMode = true;
            deleteModeButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            deleteModeButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
            Swal.fire('Delete mode: Select a chemical and press delete again to confirm');
            closeRightModal();
            closeLeftPanel();
        } else {
            // อยู่ในโหมดลบแล้ว
            if (chemicalToDelete) {
                (async () => {
                    const result = await Swal.fire({
                        title: 'Confirm Deletion',
                        text: `Are you sure you want to delete '${chemicalToDelete}'?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete',
                        cancelButtonText: 'Cancel'
                    });
                    if (result.isConfirmed) {
                        deleteChemical(chemicalToDelete);
                    }
                })();
            } else {
                // ไม่ได้เลือกสาร
                isDeleteMode = false;
                deleteModeButton.classList.add('bg-red-600', 'hover:bg-red-700');
                deleteModeButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                Swal.fire('Exited delete mode', '', 'info');
            }
        }
    });
}

async function deleteChemical(chemicalName) {
    try {
        const response = await fetch(`http://localhost:3000/Storage/${encodeURIComponent(chemicalName)}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Unable to delete chemical');
        }
        Swal.fire(`Chemical '${chemicalName}' has been deleted successfully`, '', 'success');
        fetchStorageData();
    } catch (error) {
        console.error('Error deleting chemical:', error);
        Swal.fire(`Error deleting chemical: ${error.message}`, '', 'error');
    } finally {
        isDeleteMode = false;
        chemicalToDelete = null;
        const deleteModeButton = document.getElementById('deleteModeButton');
        if(deleteModeButton) {
            deleteModeButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            deleteModeButton.classList.add('bg-red-600', 'hover:bg-red-700');
        }
    }
}

function cancelChemicalEdit() {
    
    // Re-render the details panel to show the original, non-editable data
    if (window.currentDetailItem) {
        showLeftDetailsPanel(window.currentDetailItem);
    }
}

async function saveChemicalChanges() {
    if (!window.currentDetailItem) return;

    const name = window.currentDetailItem.name;
    const detailsContainer = document.getElementById('chemicalDetailsContainer');
    
    const typeInput = detailsContainer.querySelector('[data-edit-field="Type"]');
    const warningInput = detailsContainer.querySelector('[data-edit-field="Warning"]');
    const elucidationInput = detailsContainer.querySelector('[data-edit-field="Elucidation"]');

    const updatedData = {
        Type: typeInput.value,
        Warning: warningInput.value,
        Elucidation: elucidationInput.value
    };

    try {
        const response = await fetch(`http://localhost:3000/Storage/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Update failed');
        }

        const result = await response.json();
        
        // Update the global item details
        window.currentDetailItem = { ...window.currentDetailItem, ...updatedData };
        
        Swal.fire('สำเร็จ', 'ข้อมูลสารเคมีถูกอัปเดตแล้ว', 'success');

        // Exit edit mode and refresh data
        cancelChemicalEdit();
        fetchStorageData();

    } catch (err) {
        console.error('Error updating chemical:', err);
        Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
    }
}

function handleEditChemical() {
    if (isEditingChemical) return;
    if (!window.currentDetailItem) {
        Swal.fire('Error', 'Please select a chemical before editing.', 'error');
        return;
    }

    Swal.fire({
        title: 'Enter Edit Mode?',
        text: `Do you want to edit the information of "${window.currentDetailItem.name}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            isEditingChemical = true;
            const detailsContainer = document.getElementById('chemicalDetailsContainer');
            const editableFields = ['Type', 'Warning', 'Elucidation'];

            editableFields.forEach(field => {
                const span = detailsContainer.querySelector(`span[data-field="${field}"]`);
                if (span) {
                    const currentValue = span.textContent;
                    const parentP = span.parentElement;

                    if (field === 'Elucidation') {
                        parentP.innerHTML = `<strong>${field}:</strong> <textarea data-edit-field="${field}" class="w-full mt-1 p-2 border border-slate-300 rounded-lg">${currentValue}</textarea>`;
                    } else {
                        parentP.innerHTML = `<strong>${field}:</strong> <input type="text" data-edit-field="${field}" value="${currentValue}" class="w-full mt-1 p-2 border border-slate-300 rounded-lg" />`;
                    }
                }
            });

            // Add action buttons
            const actionButtons = document.createElement('div');
            actionButtons.className = 'flex justify-end gap-3 mt-4';
            actionButtons.innerHTML = `
                <button id="cancelEditBtn" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Cancel</button>
                <button id="confirmEditBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
            `;
            detailsContainer.appendChild(actionButtons);

            document.getElementById('cancelEditBtn').addEventListener('click', cancelChemicalEdit);
            document.getElementById('confirmEditBtn').addEventListener('click', saveChemicalChanges);
        }
    });
}

// ===== BARCODE SCANNING FUNCTIONALITY =====

// เพิ่ม event listener สำหรับปุ่มสแกนบาร์โค้ด
document.addEventListener('DOMContentLoaded', function() {
    const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
    if (scanBarcodeBtn) {
        scanBarcodeBtn.addEventListener('click', function() {
            startBarcodeScanPolling();
        });
    }
    
    // เพิ่ม event listener สำหรับ input field ของบาร์โค้ด (สำหรับทดสอบ)
    const popupBarcodeInput = document.getElementById('popup_barcode');
    if (popupBarcodeInput) {
        popupBarcodeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const barcode = this.value.trim();
                if (barcode) {
                    // บันทึกบาร์โค้ดเมื่อกด Enter
                    scanBarcode(barcode).then(() => {
                        Swal.fire('บันทึกบาร์โค้ดสำเร็จ', `บาร์โค้ด: ${barcode}`, 'success');
                    }).catch(error => {
                        console.error('เกิดข้อผิดพลาดในการบันทึกบาร์โค้ด:', error);
                    });
                }
            }
        });
    }
});

// ฟังก์ชัน scanBarcode สำหรับบันทึกบาร์โค้ด
async function scanBarcode(barcode) {
    try {
        const response = await fetch('http://localhost:3000/Barcode/set-current', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: barcode })
        });
        
        if (!response.ok) {
            throw new Error('ไม่สามารถบันทึกบาร์โค้ดได้');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error scanning barcode:', error);
        throw error;
    }
}

// ฟังก์ชัน polling barcode
function startBarcodeScanPolling() {
    const barcodeInput = document.getElementById('popup_barcode');
    if (!barcodeInput) return;
    barcodeInput.value = 'กำลังรอการแสกน..';
    barcodeInput.focus();

    let polling = true;
    let lastBarcode = '';
    let elapsed = 0;
    const interval = 500; // ms
    const timeout = 20000; // 20 วินาที

    // ดึงค่าเดิมก่อนเริ่ม polling
    fetch('http://localhost:3000/Barcode/current')
        .then(res => res.json())
        .then(data => {
            lastBarcode = data.currentBarcode || '';
        })
        .catch(() => {
            lastBarcode = '';
        })
        .finally(() => {
            const poll = setInterval(async () => {
                elapsed += interval;
                try {
                    const response = await fetch('http://localhost:3000/Barcode/current');
                    if (response.ok) {
                        const result = await response.json();
                        const current = result.currentBarcode || '';
                        if (current && current !== lastBarcode) {
                            barcodeInput.value = current;
                            barcodeInput.focus();
                            clearInterval(poll);
                            polling = false;
                            return;
                        }
                    }
                } catch (e) {}
                if (elapsed >= timeout) {
                    barcodeInput.value = '';
                    barcodeInput.placeholder = 'Scan timeout';
                    clearInterval(poll);
                    polling = false;
                }
            }, interval);
        });
}

// Hide loading overlay when page is fully loaded
function hideInitialLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.classList.add('loading-hidden');
        }, 500);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    setupAddChemicalFormHandler();
    setupDeleteFunctionality();
    setupSearchFunctionality();
    fetchStorageData();
    
    // Hide initial loading after a short delay
    hideInitialLoading();
});

function openAddChemicalPopup() {
    closeRightModal();
    const popupOverlay = document.getElementById('popupOverlay');
    const addChemicalPopup = document.getElementById('addChemicalPopup');
    popupOverlay.classList.remove('hidden');
    addChemicalPopup.classList.remove('hidden');
    // clear ค่า input barcode ทุกครั้ง
    const barcodeInput = document.getElementById('popup_barcode');
    if (barcodeInput) {
        barcodeInput.value = '';
        setTimeout(() => {
            barcodeInput.focus();
        }, 100); // delay เล็กน้อยเพื่อให้ DOM render popup เสร็จ
    }
    // clear ค่าอื่น ๆ ด้วยถ้าต้องการ
    const expireInput = document.getElementById('popup_expire');
    if (expireInput) expireInput.value = '';
    const importInput = document.getElementById('popup_import');
    if (importInput) importInput.value = '';
    const locationInput = document.getElementById('popup_location');
    if (locationInput) locationInput.value = '';
    const pictureInput = document.getElementById('popup_picture');
    if (pictureInput) pictureInput.value = '';
}

// เพิ่ม event สำหรับปุ่มเปิด popup (addChemicalButton)
document.addEventListener('DOMContentLoaded', function() {
    const addChemicalButton = document.getElementById('addChemicalButton');
    if (addChemicalButton) {
        addChemicalButton.addEventListener('click', openAddChemicalPopup);
    }
});