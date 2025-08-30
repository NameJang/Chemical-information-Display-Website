const resultDiv = document.getElementById("result");

// แสดงการ์ด (ถ้าต้องการ)
const html = [...expiringSoon, ...expired].map(item => {
  let isExpiredCard = isExpired(item.expireddate);
  let cardClass = isExpiredCard
    ? 'bg-red-50 border border-red-200'
    : 'bg-yellow-50 border border-yellow-200';
  let icon = isExpiredCard
    ? '<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-2xl mr-4">⚠️</div>'
    : '<div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mr-4">⏰</div>';
  let expClass = isExpiredCard ? 'text-red-700 font-bold' : 'text-yellow-700 font-bold';
  return `
    <div class="flex items-center ${cardClass} rounded-xl p-6 shadow gap-4 mb-2">
      ${icon}
      <div>
        <div class="text-lg font-bold text-blue-700 mb-1">${item.name || '-'}</div>
        <div class="${expClass} mb-1">
          Exp : ${formatDateTH(item.expireddate)}
        </div>
        <div class="text-blue-700 font-bold">Barcode : ${item.barcode || '-'}</div>
      </div>
      <img src="../Assets/123.jpg" class="w-16 h-16 object-cover rounded-full border-2 border-blue-200 ml-auto" />
    </div>
  `;
}).join('');

function showNotificationDetailModal(item) {
  const modal = document.getElementById('notificationDetailModal');
  const infoCol = document.getElementById('notificationDetailInfoCol');
  const imgCol = document.getElementById('notificationDetailImgCol');
  // สี badge ตามสถานะ
  let badgeClass = 'bg-blue-100 text-blue-700';
  if (isExpired(item.expireddate)) badgeClass = 'bg-red-100 text-red-700';
  else if (isExpiringSoon(item.expireddate)) badgeClass = 'bg-yellow-100 text-yellow-700';
  // แสดงรูปจาก database
  let imgHtml = '';
  if (item.picture && item.picture.data) {
    const base64String = arrayBufferToBase64(item.picture.data);
    imgHtml = `<img src="data:image/jpeg;base64,${base64String}" alt="${item.name || ''}" class="w-24 h-24 rounded-xl object-cover shadow border mx-auto" />`;
  } else if (item.picture && typeof item.picture === 'string' && item.picture.startsWith('data:image')) {
    imgHtml = `<img src="${item.picture}" alt="${item.name || ''}" class="w-24 h-24 rounded-xl object-cover shadow border mx-auto" />`;
  } else {
    imgHtml = '<div class="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-3xl text-slate-400 shadow border mx-auto">?</div>';
  }
  imgCol.innerHTML = imgHtml;
  infoCol.innerHTML = `
    <div class="mb-2"><span class="font-bold">Chemical Name:</span> ${item.name || ''}</div>
    <div class="mb-2"><span class="font-bold">Barcode:</span> ${item.barcode || ''}</div>
    <div class="mb-2"><span class="font-bold">Expiry Date:</span> <span class="inline-block px-2 py-1 rounded text-xs font-bold ${badgeClass}">${formatDateTH(item.expireddate)}</span></div>
    <div class="mb-2"><span class="font-bold">Note:</span> ${item.note || '-'}</div>
  `;
  modal.classList.remove('hidden');
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// เพิ่ม event ให้การ์ด notification
function addNotificationCardEvents() {
  const container = document.getElementById('notificationCardContainer');
  container.querySelectorAll('.notification-card').forEach((card, idx) => {
    card.addEventListener('click', () => {
      showNotificationDetailModal(card._itemData);
    });
  });
}

// ปรับ render card ให้แนบข้อมูล item กับ DOM และเพิ่มคลาส notification-card
async function fetchAndRender() {
  try {
    const res = await fetch('http://localhost:3000/Barcode');
    if (!res.ok) throw new Error('Unable to fetch data');
    const data = await res.json();
    const chemicals = Array.isArray(data) ? data : [data];
    const expiringSoon = chemicals.filter(item => isExpiringSoon(item.expireddate));
    const expired = chemicals.filter(item => isExpired(item.expireddate));
    const html = [...expiringSoon, ...expired].map((item, idx) => {
      let expClass = '';
      if (isExpired(item.expireddate)) {
        expClass = 'text-red-500 font-bold';
      } else if (isExpiringSoon(item.expireddate)) {
        expClass = 'text-yellow-300 font-bold';
      }
      // สี border card
      let cardBorder = isExpired(item.expireddate) ? 'border-red-300' : isExpiringSoon(item.expireddate) ? 'border-yellow-300' : 'border-blue-200';
      // รูป
      let imgHtml = '';
      if (item.picture && item.picture.data) {
        const base64String = arrayBufferToBase64(item.picture.data);
        imgHtml = `<img src="data:image/jpeg;base64,${base64String}" class="w-20 h-20 object-cover rounded-full border-2 border-white" />`;
      } else if (item.picture && typeof item.picture === 'string' && item.picture.startsWith('data:image')) {
        imgHtml = `<img src="${item.picture}" class="w-20 h-20 object-cover rounded-full border-2 border-white" />`;
      } else {
        imgHtml = '<div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-3xl text-slate-400 border-2 border-white">?</div>';
      }
      return `
        <div class="flex items-center justify-between bg-zinc-800 ${cardBorder} notification-card rounded-xl p-4 shadow mb-2 cursor-pointer" data-idx="${idx}">
          <div>
            <div class="text-xl font-bold mb-1">${item.name || '-'}</div>
            <div class="${expClass} mb-1">Exp : ${formatDateTH(item.expireddate)}</div>
            <div class="text-white mb-1 font-bold">Barcode : ${item.barcode || '-'}</div>
          </div>
          ${imgHtml}
        </div>
      `;
    }).join('');
    const container = document.getElementById('notificationCardContainer');
    container.innerHTML = html || '<div class="text-center text-gray-400">No chemicals found that are expiring soon or expired</div>';
    // แนบข้อมูล item กับ DOM
    [...expiringSoon, ...expired].forEach((item, idx) => {
      const card = container.querySelector(`.notification-card[data-idx="${idx}"]`);
      if (card) card._itemData = item;
    });
    addNotificationCardEvents();
  } catch (err) {
    document.getElementById('notificationCardContainer').innerHTML = `<div class="text-center text-red-400">${err.message}</div>`;
    console.error(err);
  }
}

document.getElementById('closeNotificationDetailModal').addEventListener('click', () => {
  document.getElementById('notificationDetailModal').classList.add('hidden');
});