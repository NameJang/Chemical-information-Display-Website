// JS for Create Barcode page

let selectingForBarcode = false;
let chemicalsNoBarcode = [];

window.onload = function() {
    showLoadingOverlay();
    fetchChemicalsNoBarcode();
    setupEventListeners();
};

// ซ่อน overlay loading หลัง DOM โหลด (เหมือนหน้าอื่น)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(hideLoadingOverlay, 200);
});

function setupEventListeners() {
    const newBarcodeBtn = document.getElementById('newBarcodeBtn');
    if (newBarcodeBtn) {
        newBarcodeBtn.addEventListener('click', function() {
            selectingForBarcode = true;
            showCreateBarcodePrompt();
        });
    }
}

function showCreateBarcodePrompt() {
    if (window.Swal) {
        Swal.fire({
            title: 'สร้างบาร์โค้ดใหม่',
            text: 'กรุณาเลือกสารเคมีเพื่อสร้างบาร์โค้ดใหม่',
            icon: 'info',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก',
            showCancelButton: true
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                selectingForBarcode = false;
            }
        });
    } else {
        alert('สร้างบาร์โค้ดใหม่\nกรุณาเลือกสารเคมีเพื่อสร้างบาร์โค้ดใหม่');
    }
}

async function fetchChemicalsNoBarcode() {
    const container = document.getElementById('cardContainer');
    if (!container) return;
    // Show loading overlay อย่างเดียว
    showLoadingOverlay();
    
    try {
        const res = await fetch('http://localhost:3000/Storage/no-barcode');
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        chemicalsNoBarcode = await res.json();
        displayNoBarcodeChemicals(chemicalsNoBarcode);
    } catch (error) {
        console.error('Error fetching chemicals:', error);
        showErrorState(container, error.message);
    } finally {
        setTimeout(hideLoadingOverlay, 200);
    }
}

function showErrorState(container, errorMessage) {
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-red-600">
            <svg class="w-16 h-16 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 class="text-lg font-medium mb-2">เกิดข้อผิดพลาด</h3>
            <p class="text-sm text-gray-600 mb-4">ไม่สามารถโหลดข้อมูลได้</p>
            <button onclick="fetchChemicalsNoBarcode()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                ลองใหม่
            </button>
        </div>
    `;
}

function displayNoBarcodeChemicals(chemicals) {
    const container = document.getElementById('cardContainer');
    if (!container) return;
    container.innerHTML = '';
    
    if (chemicals.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <svg class="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="text-lg font-medium mb-2">ไม่พบสารเคมีที่ไม่มีบาร์โค้ด</h3>
                <p class="text-sm">ทุกสารเคมีมีบาร์โค้ดแล้ว</p>
            </div>
        `;
        return;
    }
    
    chemicals.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = "relative rounded-xl shadow-md hover:shadow-xl text-center storage-card bg-white border border-gray-200 hover:border-indigo-300 text-gray-800 transition-all duration-200 cursor-pointer transform hover:scale-105 hover:bg-indigo-50 flex flex-col justify-between items-center p-4";
        card.style.minHeight = "180px";
        card.style.height = "100%";
        // ไม่ต้องใส่ animation ใด ๆ
        
        card.innerHTML = `
            <div class="absolute top-2 right-2">
                <span class="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                    ${item.locatename || 'N/A'}
                </span>
            </div>
            <div class="flex flex-col flex-1 justify-center items-center w-full h-full">
                <div class="flex items-center justify-center w-full flex-1">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex-1 flex items-center justify-center w-full">
                    <h3 class="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight text-center w-full">
                        ${item.name}
                    </h3>
                </div>
            </div>
            <div class="w-full mt-3 flex justify-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    ไม่มีบาร์โค้ด
                </span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (selectingForBarcode) {
                openBarcodePopup(item);
                selectingForBarcode = false;
            }
        });
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        container.appendChild(card);
    });
}

function pad2(n) { return n.toString().padStart(2, '0'); }

async function openBarcodePopup(chemical) {
    // Show loading state
    Swal.fire({
        title: 'กำลังประมวลผล...',
        text: 'กำลังดึงข้อมูลบาร์โค้ด',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // 1. ดึง ImportDate จาก backend (table barcode)
        let importDate = null;
        try {
            const res = await fetch(`http://localhost:3000/barcode/latest-import-date?name=${encodeURIComponent(chemical.name)}`);
            if (!res.ok) throw new Error('Failed to fetch import date');
            const data = await res.json();
            importDate = data.ImportDate || null;
        } catch (e) {
            console.error('Error fetching import date:', e);
        }

        if (!importDate) {
            Swal.fire({
                title: 'ไม่พบวันรับเข้าใน barcode',
                text: 'กรุณากรอกวันรับเข้าเอง',
                icon: 'warning',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        // สร้าง dateObj และแปลงเป็น YYYY-MM-DD
        const dateObj = new Date(importDate);
        const YYYY = dateObj.getFullYear();
        const MM = pad2(dateObj.getMonth() + 1);
        const DD = pad2(dateObj.getDate());
        const importDateStr = `${YYYY}-${MM}-${DD}`;

        // ดึง count ขวดที่ name+importdate นี้
        let CC = '01';
        try {
            const res = await fetch(`http://localhost:3000/barcode/count-by-name-importdate?name=${encodeURIComponent(chemical.name)}&importdate=${encodeURIComponent(importDateStr)}`);
            if (!res.ok) throw new Error('Failed to fetch count');
            const data = await res.json();
            CC = pad2((data.count || 0) + 1);
        } catch (e) {
            console.error('Error fetching count:', e);
            CC = '01';
        }

        const barcode = `${chemical.locatename}${CC}${DD}${MM}${YYYY}`;

        Swal.fire({
            title: 'สร้างบาร์โค้ด',
            html: `
                <div class="text-left space-y-3">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="font-semibold text-gray-700 mb-1">ชื่อสารเคมี:</div>
                        <div class="text-gray-900">${chemical.name}</div>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="font-semibold text-blue-700 mb-1">บาร์โค้ด:</div>
                        <div class="font-mono text-lg text-blue-900 bg-white p-2 rounded border">${barcode}</div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'สร้าง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280'
        }).then(async result => {
            if (result.isConfirmed) {
                await createBarcode(chemical.name, barcode);
            }
        });
    } catch (error) {
        console.error('Error in openBarcodePopup:', error);
        Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถสร้างบาร์โค้ดได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'ตกลง'
        });
    }
}

async function createBarcode(chemicalName, barcode) {
    try {
        const res = await fetch('http://localhost:3000/barcode/update-null-barcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: chemicalName,
                barcode: barcode
            })
        });
        
        if (res.ok) {
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'สร้างบาร์โค้ดเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            });
            
            // Refresh the card list
            fetchChemicalsNoBarcode();
            
            // Refresh logs if available
            if (window.refreshLogs) window.refreshLogs();
        } else {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update barcode');
        }
    } catch (error) {
        console.error('Error creating barcode:', error);
        Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: error.message || 'ไม่สามารถสร้างบาร์โค้ดได้',
            icon: 'error',
            confirmButtonText: 'ตกลง'
        });
    }
} 

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('loading-hidden');
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('loading-hidden');
} 