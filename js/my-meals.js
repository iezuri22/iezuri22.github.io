// ============================================================
// MY MEALS PAGE — Food log view
// ============================================================

function renderMyMeals() {
  const log = getFoodLog();
  const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack'];

  // Initialize myMealsDate if not set
  if (!state.myMealsDate) state.myMealsDate = getToday();
  const dateStr = state.myMealsDate;
  const dateLabel = getFoodLogDateLabel(dateStr);
  const todayStr = getToday();
  const showTodayBtn = dateStr !== todayStr;

  // Get entries for the current date
  const dayEntries = log.filter(e => e.dateCooked.split('T')[0] === dateStr);

  // Build slots for this day
  const slotHtml = mealSlots.map(slot => {
    const slotEntries = dayEntries.filter(e => e.mealType === slot);
    if (slot === 'snack') {
      if (slotEntries.length === 0) {
        return renderEmptyMealSlot(slot, dateStr);
      }
      return slotEntries.map(entry => renderFilledMealSlot(entry, dateStr)).join('') + renderEmptyMealSlot(slot, dateStr, true);
    }
    if (slotEntries.length === 0) {
      return renderEmptyMealSlot(slot, dateStr);
    }
    // Show latest entry (first in array since unshift) with stacked badge
    const latestEntry = slotEntries[0];
    const extraCount = slotEntries.length - 1;
    return renderFilledMealSlot(latestEntry, dateStr, extraCount, slotEntries) + renderAddAnotherRow(slot, dateStr);
  }).join('');

  // Build mini calendar for desktop sidebar
  const miniCalendarHtml = renderMyMealsMiniCalendar(dateStr, log);

  // Recent photos for desktop sidebar
  const recentPhotos = log.filter(e => e.myPhoto || (e.photo && e.photo.startsWith('data:'))).slice(0, 6);
  const photoPreviewHtml = recentPhotos.length > 0 ? `
    <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color};">Cooking Journal</div>
        <button onclick="navigateTo('my-plates')" style="font-size: 12px; color: ${CONFIG.primary_action_color}; background: none; border: none; cursor: pointer;">View all</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
        ${recentPhotos.map(e => `
          <div style="aspect-ratio: 1; border-radius: 8px; overflow: hidden;">
            <img src="${esc(e.myPhoto || e.photo)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <div id="my-meals-swipe-zone" style="padding: 0 12px; flex: 1;">
      <div class="desktop-mymeals-layout">
        <div class="desktop-mymeals-main">
          <!-- Date Navigation Header -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: ${CONFIG.space_md}; padding: 4px 0;">
            <button onclick="navigateMyMealsDate(-1)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: transparent; color: ${CONFIG.text_color}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>
            <div style="text-align: center; min-width: 140px;">
              <div style="font-size: 16px; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color};">${esc(dateLabel)}</div>
              ${showTodayBtn ? `<button onclick="state.myMealsDate = getToday(); render();" style="font-size: 12px; color: ${CONFIG.primary_action_color}; background: none; border: none; cursor: pointer; margin-top: 2px; font-weight: 600;">Jump to Today</button>` : ''}
            </div>
            <button onclick="navigateMyMealsDate(1)" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: transparent; color: ${CONFIG.text_color}; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </div>

          <!-- Meal Slots for this day -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${slotHtml}
          </div>

          ${dayEntries.length === 0 ? `
            <div style="text-align: center; padding: ${CONFIG.space_xl} ${CONFIG.space_md}; margin-top: ${CONFIG.space_md};">
              <div style="font-size: 32px; opacity: 0.3; margin-bottom: ${CONFIG.space_sm};">🍽</div>
              <div style="color: ${CONFIG.text_muted}; font-size: 14px;">No meals logged for this day</div>
              <div style="color: ${CONFIG.text_tertiary}; font-size: 12px; margin-top: 4px;">Tap + to log what you ate</div>
            </div>
          ` : ''}
        </div>
        <div class="desktop-mymeals-side">
          ${miniCalendarHtml}
          ${photoPreviewHtml}
        </div>
      </div>
    </div>
    <!-- FAB -->
    <button onclick="showQuickLogModal()" style="position: fixed; bottom: 68px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background: ${CONFIG.primary_action_color}; border: none; color: white; font-size: 28px; cursor: pointer; z-index: 45; box-shadow: 0 2px 8px rgba(232,93,93,0.3); display: flex; align-items: center; justify-content: center;" title="Log a meal">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
    </button>
  `;
}

function renderMyMealsMiniCalendar(selectedDate, log) {
  const d = new Date(selectedDate + 'T12:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();
  const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = getToday();

  // Dates with logged meals
  const loggedDates = new Set(log.map(e => e.dateCooked?.split('T')[0]).filter(Boolean));

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = ds === selectedDate;
    const isToday = ds === todayStr;
    const hasLog = loggedDates.has(ds);
    const bg = isSelected ? CONFIG.primary_action_color : isToday ? 'rgba(232,93,93,0.15)' : 'transparent';
    const color = isSelected ? 'white' : CONFIG.text_color;
    cells += `<div onclick="state.myMealsDate='${ds}'; render();" style="width:32px; height:32px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:8px; cursor:pointer; background:${bg}; color:${color}; font-size:12px; font-weight:${isSelected || isToday ? '600' : '400'}; transition: background 150ms ease;">
      ${day}
      ${hasLog ? `<div style="width:4px;height:4px;border-radius:50%;background:${isSelected ? 'white' : CONFIG.primary_action_color};margin-top:1px;"></div>` : ''}
    </div>`;
  }

  return `
    <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: 16px;">
      <div style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 12px; text-align: center;">${monthName}</div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; justify-items: center;">
        ${['S','M','T','W','T','F','S'].map(d => `<div style="font-size:10px; color:${CONFIG.text_muted}; font-weight:600; padding:4px 0;">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>
  `;
}

function navigateMyMealsDate(direction) {
  if (!state.myMealsDate) state.myMealsDate = getToday();
  const d = new Date(state.myMealsDate + 'T12:00:00');
  d.setDate(d.getDate() + direction);
  state.myMealsDate = _localDateStr(d);
  render();
}

function initMyMealsSwipeGestures() {
  const zone = document.getElementById('my-meals-swipe-zone');
  if (!zone) return;
  let startX = 0, startY = 0, swiping = false;
  zone.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });
  zone.addEventListener('touchend', (e) => {
    if (!swiping) return;
    swiping = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) > 100 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) navigateMyMealsDate(-1); // swipe right = prev day
      else navigateMyMealsDate(1); // swipe left = next day
    }
  }, { passive: true });
}

function renderEmptyMealSlot(mealType, dateStr, isAddMore) {
  const label = isAddMore ? '+ Add another snack' : `+ Add ${mealType}`;
  return `
    <div onclick="openAddMealForSlot('${mealType}', '${dateStr}')"
      style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; cursor: pointer; border: 1.5px dashed rgba(255,255,255,0.12); background: transparent; transition: background 0.15s;">
      <div style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.04);">
        <svg width="20" height="20" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 12px; color: ${CONFIG.text_tertiary};">${label}</div>
        <div style="font-size: 11px; color: ${CONFIG.text_tertiary}; opacity: 0.6; margin-top: 2px;">${capitalize(mealType)}</div>
      </div>
    </div>
  `;
}

function renderFilledMealSlot(entry, dateStr, extraCount, allSlotEntries) {
  extraCount = extraCount || 0;
  const isPlanned = entry.status !== 'eaten';
  const hasMyPhoto = !!(entry.myPhoto || (entry.photo && entry.photo.startsWith('data:')));
  const thumb = hasMyPhoto ? (entry.myPhoto || entry.photo) : (entry.photo || entry.image);
  const ratingIcon = entry.wouldMakeAgain === true ? ' 👍' : entry.wouldMakeAgain === false ? ' 👎' : '';
  const statusLabel = isPlanned ? 'Planned' : 'Cooked';
  const statusColor = isPlanned ? CONFIG.text_muted : CONFIG.success_color;
  const borderStyle = isPlanned ? '1.5px dashed rgba(255,255,255,0.15)' : '1.5px solid rgba(255,255,255,0.06)';
  const bgColor = isPlanned ? 'transparent' : CONFIG.surface_color;
  const escapedName = esc(entry.recipeName).replace(/'/g, "\\'");
  const escapedDateLabel = esc(getFoodLogDateLabel(dateStr)).replace(/'/g, "\\'");
  const stackedIds = allSlotEntries ? allSlotEntries.map(e => e.id).join(',') : '';
  const isBatch = !!entry.batchId;
  const onclickTarget = isBatch ? `state.batchViewId='${entry.batchId}';state.batchComponentIndex=0;navigateTo('batch-view')` : (extraCount > 0 ? `openStackedMealDetail('${entry.mealType}', '${dateStr}', '${stackedIds}')` : `openFoodLogDetail('${entry.id}')`);

  return `
    <div style="position: relative; border-radius: 10px; border: ${borderStyle}; background: ${bgColor}; overflow: hidden;">
      ${isBatch ? `<div style="position:absolute; top:6px; left:6px; z-index:2; width:22px; height:22px; border-radius:5px; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center;">
        <svg width="13" height="13" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>
      </div>` : ''}
      <!-- Action buttons (top right) -->
      <div style="position: absolute; top: 6px; right: 6px; z-index: 2; display: flex; gap: 4px;">
        <button onclick="event.stopPropagation(); openSwapMeal('${entry.id}', '${entry.mealType}', '${dateStr}')" title="Swap meal"
          style="width: 26px; height: 26px; border-radius: 8px; border: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
        </button>
        <button onclick="event.stopPropagation(); confirmDeleteMeal('${entry.id}', '${escapedName}', '${escapedDateLabel}')" title="Delete meal"
          style="width: 26px; height: 26px; border-radius: 8px; border: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); color: ${CONFIG.danger_color}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
        </button>
      </div>
      <!-- Main card content -->
      <div onclick="${onclickTarget}" class="card-press" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; cursor: pointer; transition: background 0.15s;">
        <div style="width: 44px; height: 44px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated}; ${isPlanned ? 'opacity: 0.7;' : ''} position: relative;">
          ${thumb ? `<img src="${esc(thumb)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:4px;"><span style="font-size:9px;font-weight:700;color:${CONFIG.text_muted};text-align:center;line-height:1.2;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(entry.recipeName)}</span></div>`}
          ${hasMyPhoto ? `<div style="position: absolute; bottom: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: ${CONFIG.primary_action_color}; display: flex; align-items: center; justify-content: center;"><svg width="10" height="10" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/></svg></div>` : ''}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 14px; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${isPlanned ? 'opacity: 0.8;' : ''}">${esc(entry.recipeName)}${ratingIcon}</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
            <span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.06); color: ${CONFIG.text_muted}; font-weight: 500;">${capitalize(entry.mealType)}</span>
            <span style="font-size: 10px; color: ${statusColor}; font-weight: 500;">${statusLabel}</span>
            ${entry.notes ? `<span style="font-size: 11px; color: ${CONFIG.text_tertiary};">Has notes</span>` : ''}
          </div>
        </div>
        ${extraCount > 0 ? `<span style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,0.08); color: ${CONFIG.text_muted}; font-weight: 600; flex-shrink: 0;">+${extraCount}</span>` : ''}
        <svg width="16" height="16" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
      </div>
    </div>
  `;
}

function renderAddAnotherRow(mealType, dateStr) {
  return `
    <div onclick="openAddMealForSlot('${mealType}', '${dateStr}')"
      style="display: flex; align-items: center; justify-content: center; height: 36px; border-radius: 8px; cursor: pointer; border: 1px dashed rgba(255,255,255,0.08); background: transparent; margin-top: 4px;">
      <span style="font-size: 12px; color: ${CONFIG.text_tertiary};">+ Add another ${mealType}</span>
    </div>
  `;
}

function showMealActionSheet(mealType, dateStr, swapLogId) {
  if (!dateStr) dateStr = state.myMealsDate || getToday();
  if (!mealType) mealType = detectMealType ? detectMealType() : 'dinner';
  const label = capitalize(mealType);
  const dateLabel = typeof getFoodLogDateLabel === 'function' ? getFoodLogDateLabel(dateStr) : getDateLabel(dateStr);
  const isSwap = !!swapLogId;
  const title = isSwap ? `Swap ${label}` : `Add ${label}`;

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <div style="width: 36px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.2); margin: 0 auto 16px;"></div>
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${title}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">${dateLabel}</div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="closeModal(); showRecipePickerForSlot('${mealType}', '${dateStr}'${isSwap ? `; window._swapLogIdForPicker = '${swapLogId}'` : ''})"
          style="width: 100%; padding: 16px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(232,93,93,0.12); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600;">Pick from recipes</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">Choose from your recipe collection</div>
          </div>
        </button>

        <button onclick="closeModal(); showQuickLogModalForSlot('${mealType}', '${dateStr}')"
          style="width: 100%; padding: 16px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(232,93,93,0.12); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600;">Log manually</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">Type what you ate, add a photo</div>
          </div>
        </button>
      </div>

      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function startSwipeForSlot(mealType, dateStr, swapLogId) {
  // Persist swap state in sessionStorage so it survives cross-page navigation
  sessionStorage.setItem('yummy_swipe_slot', JSON.stringify({
    mealType: mealType,
    dateStr: dateStr,
    swapLogId: swapLogId || null,
    returnToFoodLog: true
  }));
  // Navigate to home page — the swipe deck will be built on home init from sessionStorage
  navigateTo('home');
}

function openAddMealForSlot(mealType, dateStr) {
  showMealActionSheet(mealType, dateStr);
}

function showRecipePickerForSlot(mealType, dateStr) {
  const allRecipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  state._pickerMealType = mealType;
  state._pickerDateStr = dateStr;
  state._pickerSearch = '';
  state._pickerFilter = mealType; // Default to current meal type filter

  // Map meal types to recipe categories
  const mealCategoryMap = {
    breakfast: ['breakfast'],
    lunch: ['lunch', 'dinner'],
    dinner: ['lunch', 'dinner'],
    snack: ['snack', 'dessert']
  };
  const matchCategories = mealCategoryMap[mealType] || [];

  // Build cooking history from food log
  const foodLog = getFoodLog();
  const cookCounts = {};
  const lastCooked = {};
  foodLog.forEach(entry => {
    const rid = entry.recipeId;
    if (!rid) return;
    cookCounts[rid] = (cookCounts[rid] || 0) + 1;
    const d = entry.dateCooked || '';
    if (!lastCooked[rid] || d > lastCooked[rid]) lastCooked[rid] = d;
  });

  const savedSet = new Set(getSavedRecipes());

  function sortRecipes(list) {
    return list.sort((a, b) => {
      const aId = a.__backendId || a.id;
      const bId = b.__backendId || b.id;
      const aSaved = savedSet.has(aId) ? 1 : 0;
      const bSaved = savedSet.has(bId) ? 1 : 0;
      if (aSaved !== bSaved) return bSaved - aSaved;
      const aCooked = cookCounts[aId] || 0;
      const bCooked = cookCounts[bId] || 0;
      if (aCooked !== bCooked) {
        // Both cooked: sort by most recently cooked
        if (aCooked > 0 && bCooked > 0) {
          return (lastCooked[bId] || '').localeCompare(lastCooked[aId] || '');
        }
        return bCooked - aCooked;
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  }

  state._pickerLimit = 30;

  const renderPickerGrid = (searchTerm, filter) => {
    if (filter === undefined) filter = state._pickerFilter;
    let filtered = allRecipes;
    // Apply category filter
    if (filter === 'saved') {
      const savedFiltered = filtered.filter(r => savedSet.has(r.__backendId || r.id));
      const cats = mealCategoryMap[mealType] || [];
      const matchingSaved = cats.length > 0
        ? savedFiltered.filter(r => cats.includes((r.category || '').toLowerCase()))
        : savedFiltered;
      filtered = matchingSaved.length > 0 ? matchingSaved : savedFiltered;
    } else if (filter && filter !== 'all') {
      const cats = mealCategoryMap[filter] || [];
      if (cats.length > 0) {
        filtered = filtered.filter(r => cats.includes((r.category || '').toLowerCase()));
      }
    }
    // Apply search
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(r => (r.title || '').toLowerCase().includes(s));
    }
    filtered = sortRecipes([...filtered]);
    if (filtered.length === 0) {
      return `<div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: ${CONFIG.text_muted}; font-size: 14px;">No recipes found</div>`;
    }
    const totalCount = filtered.length;
    const limited = filtered.slice(0, state._pickerLimit);
    let html = limited.map(r => {
      const id = r.__backendId || r.id;
      const img = recipeThumb(r);
      const isSaved = savedSet.has(id);
      const cooked = cookCounts[id] || 0;
      return `
        <div onclick="selectRecipeForSlot('${id}', '${esc(mealType)}', '${esc(dateStr)}')" class="card-press"
          style="cursor: pointer; border-radius: 8px; overflow: hidden; background: ${CONFIG.surface_color}; position: relative;">
          <div style="width: 100%; aspect-ratio: 1; overflow: hidden; background: ${CONFIG.surface_elevated}; position: relative;">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:8px;"><span style="color:${CONFIG.text_color};font-size:11px;font-weight:600;text-align:center;-webkit-line-clamp:3;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(r.title)}</span></div>`}
            ${isSaved ? `<div style="position:absolute;top:4px;right:4px;width:20px;height:20px;background:rgba(0,0,0,0.5);border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" fill="${CONFIG.primary_action_color}" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></div>` : ''}
            ${cooked > 0 ? `<div style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.6);color:${CONFIG.text_color};font-size:9px;font-weight:600;padding:2px 6px;border-radius:8px;">Cooked ${cooked}x</div>` : ''}
          </div>
          <div style="padding: 4px 4px 6px; font-size: 13px; font-weight: 600; color: ${CONFIG.text_color}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${esc(r.title)}</div>
        </div>`;
    }).join('');
    if (totalCount > state._pickerLimit) {
      html += `<div style="grid-column: 1 / -1; text-align: center; padding: 12px;">
        <button onclick="state._pickerLimit += 30; window._updatePickerGrid();"
          style="padding: 10px 24px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: ${CONFIG.text_color}; font-size: 13px; font-weight: 500; cursor: pointer;">
          Load more (${totalCount - state._pickerLimit} remaining)
        </button>
      </div>`;
    }
    return html;
  };

  const mealLabel = capitalize(mealType);
  const filterPills = [
    { key: 'all', label: 'All' },
    { key: mealType, label: mealLabel },
    { key: 'saved', label: 'Saved' }
  ];

  const renderPills = (activeFilter) => {
    return filterPills.map(p => {
      const isActive = p.key === activeFilter;
      return `<button onclick="window._setPickerFilter('${p.key}')"
        style="padding: 6px 14px; border-radius: 16px; border: 1px solid ${isActive ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; background: ${isActive ? 'rgba(232,93,93,0.15)' : 'transparent'}; color: ${isActive ? CONFIG.primary_action_color : CONFIG.text_muted}; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap;">${p.label}</button>`;
    }).join('');
  };

  openModal(`
    <div style="color: ${CONFIG.text_color}; max-height: 80vh; display: flex; flex-direction: column;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_sm};">Pick from Recipes</h3>
      <input type="text" id="recipePickerSearch" placeholder="Search recipes..."
        oninput="state._pickerLimit = 30; window._updatePickerGrid();"
        style="width: 100%; padding: 10px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; margin-bottom: ${CONFIG.space_sm};" />
      <div id="recipePickerPills" style="display: flex; gap: 8px; margin-bottom: ${CONFIG.space_sm}; overflow-x: auto;">
        ${renderPills(mealType)}
      </div>
      <div id="recipePickerGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; overflow-y: auto; max-height: 50vh; padding-bottom: 8px;">
        ${renderPickerGrid('', mealType)}
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);

  window._renderPickerGrid = renderPickerGrid;
  window._setPickerFilter = function(filter) {
    state._pickerFilter = filter;
    state._pickerLimit = 30;
    const pillsEl = document.getElementById('recipePickerPills');
    if (pillsEl) pillsEl.innerHTML = renderPills(filter);
    window._updatePickerGrid();
  };
  window._updatePickerGrid = function() {
    const searchVal = document.getElementById('recipePickerSearch')?.value || '';
    document.getElementById('recipePickerGrid').innerHTML = renderPickerGrid(searchVal, state._pickerFilter);
  };
}

function selectRecipeForSlot(recipeId, mealType, dateStr) {
  const recipe = state.recipes.find(r => (r.__backendId || r.id) === recipeId);
  if (!recipe) { closeModal(); return; }
  closeModal();
  const isFuture = isFutureDate(dateStr);
  // Pre-fill with recipe data, then let user add their photo
  state._quickLogPhoto = null;
  state._quickLogMealType = mealType;
  state._quickLogDateStr = dateStr;
  state._selectedRecipeForLog = recipe;
  const ingredients = recipeIngList(recipe).map(i => i.name).filter(Boolean);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Log ${esc(recipe.title)}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_md};">${capitalize(mealType)} — ${getFoodLogDateLabel(dateStr)}</div>

      ${recipeThumb(recipe) ? `<div style="width: 100%; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: ${CONFIG.space_md}; background: ${CONFIG.surface_elevated};"><img src="${esc(recipeThumb(recipe))}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}

      <div style="margin-bottom: ${CONFIG.space_md};">
        <button onclick="document.getElementById('quickLogPhotoInput').click()" id="quickLogPhotoBtn"
          style="width: 100%; padding: 14px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; background: transparent; color: ${CONFIG.text_muted}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          Add my photo
        </button>
        <input type="file" id="quickLogPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleQuickLogPhoto(this)" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes <span style="opacity: 0.5;">(optional)</span></label>
        <textarea id="quickLogNotes" rows="2" placeholder="How was it?"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};"></textarea>
      </div>

      <button onclick="submitRecipeSlotLog()"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Add to meal plan
      </button>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function submitRecipeSlotLog() {
  const recipe = state._selectedRecipeForLog;
  if (!recipe) return;
  const notes = document.getElementById('quickLogNotes')?.value.trim() || null;
  const dateStr = state._quickLogDateStr || getToday();
  const ingredients = recipeIngList(recipe).map(i => i.name).filter(Boolean);
  // Handle swap mode: delete old entry first
  if (window._swapLogIdForPicker) {
    deleteFoodLogEntry(window._swapLogIdForPicker);
    window._swapLogIdForPicker = null;
  }
  addFoodLogEntry({
    recipeId: recipe.__backendId || recipe.id,
    recipeName: recipe.title,
    image: recipeThumb(recipe) || null,
    ingredients,
    category: recipe.category,
    mealType: state._quickLogMealType || 'dinner',
    myPhoto: state._quickLogPhoto || null,
    photo: state._quickLogPhoto || null,
    notes,
    dateStr: dateStr,
    status: 'planned'
  });
  closeModal();
  showToast('Meal added!', 'success');
  state._selectedRecipeForLog = null;
  // Use targeted update to avoid full DOM rebuild (prevents video restart / page blink)
  if (typeof updateMealPlanSection === 'function') {
    updateMealPlanSection();
  } else {
    render();
  }
}

function openSwipeForFoodLog(mealType, dateStr) {
  // Persist swap state in sessionStorage so it survives cross-page navigation
  sessionStorage.setItem('yummy_swipe_slot', JSON.stringify({
    mealType: mealType,
    dateStr: dateStr,
    swapLogId: null,
    returnToFoodLog: true
  }));
  state.viewingDate = dateStr;
  state.homeTab = 'swipe';
  state.swipeMealType = mealType;
  state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(mealType) : buildSwipeDeck(mealType);
  state.swipeIndex = 0;
  state._returnToFoodLog = true;
  navigateTo('home');
}

function showQuickLogModalForSlot(mealType, dateStr) {
  state._quickLogPhoto = null;
  state._quickLogMealType = mealType;
  state._quickLogDateStr = dateStr;
  const isFuture = isFutureDate(dateStr);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Log ${capitalize(mealType)}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">${getFoodLogDateLabel(dateStr)}</div>

      <div style="margin-bottom: ${CONFIG.space_sm};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">What did you eat?</label>
        <input type="text" id="quickLogName" placeholder="e.g., Chicken tacos, leftover pizza"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" autofocus />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <button onclick="document.getElementById('quickLogPhotoInput').click()" id="quickLogPhotoBtn"
          style="width: 100%; padding: 14px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; background: transparent; color: ${CONFIG.text_muted}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          Add a photo
        </button>
        <input type="file" id="quickLogPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleQuickLogPhoto(this)" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes <span style="opacity: 0.5;">(optional)</span></label>
        <textarea id="quickLogNotes" rows="2" placeholder="How was it?"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};"></textarea>
      </div>

      <button onclick="submitQuickLogForSlot()"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Add to meal plan
      </button>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function submitQuickLogForSlot() {
  const name = document.getElementById('quickLogName')?.value.trim();
  if (!name) {
    showToast('Please enter what you ate', 'error');
    return;
  }
  const notes = document.getElementById('quickLogNotes')?.value.trim() || null;
  const dateStr = state._quickLogDateStr || getToday();
  const isFuture = isFutureDate(dateStr);
  addFoodLogEntry({
    recipeName: name,
    mealType: state._quickLogMealType || 'dinner',
    photo: state._quickLogPhoto || null,
    notes,
    dateStr: dateStr,
    status: 'planned'
  });
  closeModal();
  showToast('Meal added!', 'success');
  render();
}

// ============================================================
// STACKED MEAL DETAIL VIEW
// ============================================================
function openStackedMealDetail(mealType, dateStr, idsStr) {
  const ids = idsStr.split(',');
  const log = getFoodLog();
  const entries = ids.map(id => log.find(e => e.id === id)).filter(Boolean);
  if (entries.length === 0) return;
  if (entries.length === 1) { openFoodLogDetail(entries[0].id); return; }

  const dateLabel = getFoodLogDateLabel(dateStr);
  const rows = entries.map((entry, i) => {
    const isPlanned = entry.status !== 'eaten';
    const hasMyPhoto = !!(entry.myPhoto || (entry.photo && entry.photo.startsWith('data:')));
    const thumb = hasMyPhoto ? (entry.myPhoto || entry.photo) : (entry.photo || entry.image);
    const statusLabel = isPlanned ? 'Planned' : 'Cooked';
    const statusColor = isPlanned ? CONFIG.text_muted : CONFIG.success_color;
    const escapedName = esc(entry.recipeName).replace(/'/g, "\\'");
    const escapedDateLabel = esc(dateLabel).replace(/'/g, "\\'");

    return `
      <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; background: ${CONFIG.surface_color}; ${i === 0 ? 'border: 1px solid rgba(255,255,255,0.1);' : ''}">
        <div style="width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
          ${thumb ? `<img src="${esc(thumb)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:4px;"><span style="font-size:9px;font-weight:700;color:${CONFIG.text_muted};text-align:center;line-height:1.2;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(entry.recipeName)}</span></div>`}
        </div>
        <div style="flex: 1; min-width: 0;" onclick="closeModal(); openFoodLogDetail('${entry.id}');" class="card-press" style="cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="font-size: 14px; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(entry.recipeName)}</div>
            ${i === 0 ? `<span style="font-size: 10px; padding: 1px 6px; border-radius: 6px; background: rgba(232,93,93,0.15); color: ${CONFIG.primary_action_color}; font-weight: 600;">Latest</span>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
            <span style="font-size: 10px; color: ${statusColor}; font-weight: 500;">${statusLabel}</span>
            ${entry.notes ? `<span style="font-size: 10px; color: ${CONFIG.text_tertiary};">Has notes</span>` : ''}
          </div>
        </div>
        <button onclick="event.stopPropagation(); confirmDeleteStackedMeal('${entry.id}', '${escapedName}', '${mealType}', '${dateStr}')" title="Delete"
          style="width: 28px; height: 28px; border-radius: 8px; border: none; background: rgba(255,69,58,0.1); color: ${CONFIG.danger_color}; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
        </button>
      </div>
    `;
  }).join('');

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${capitalize(mealType)} Meals</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_md};">${dateLabel} &middot; ${entries.length} meals</div>
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 60vh; overflow-y: auto;">
        ${rows}
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    </div>
  `);
}

function confirmDeleteStackedMeal(logId, name, mealType, dateStr) {
  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Delete Meal?</h3>
      <div style="font-size: 14px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">Remove "${name}" from this slot?</div>
      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: ${CONFIG.text_color}; cursor: pointer;">Cancel</button>
        <button onclick="deleteFoodLogEntry('${logId}'); closeModal(); render(); showToast('Meal removed', 'success');"
          style="flex: 1; padding: 12px; background: rgba(255,69,58,0.15); border: 1px solid rgba(255,69,58,0.3); border-radius: 10px; color: ${CONFIG.danger_color}; font-weight: 600; cursor: pointer;">Delete</button>
      </div>
    </div>
  `);
}

// ============================================================
// FOOD LOG DETAIL VIEW
// ============================================================
function openFoodLogDetail(logId) {
  state._viewingLogId = logId;
  state.currentView = 'food-log-detail';
  render();
}

function renderFoodLogDetail() {
  const logId = state._viewingLogId;
  const log = getFoodLog();
  const entry = log.find(e => e.id === logId);
  if (!entry) return '<div style="padding: 24px; color: #8e8e93;">Entry not found.</div>';

  const recipeImage = entry.image;
  const myPhoto = entry.myPhoto || (entry.photo && entry.photo.startsWith('data:') ? entry.photo : null);
  const dateLabel = getFoodLogDateLabel(entry.dateCooked.split('T')[0]);
  const starRating = entry.starRating || 0;

  return `
    <div style="background: ${CONFIG.background_color}; min-height: 100vh; padding-bottom: 120px; max-width: 600px; margin: 0 auto;">
      <!-- Hero Recipe Photo -->
      ${recipeImage ? `
      <div style="width: 100%; aspect-ratio: 16/9; max-height: 35vh; overflow: hidden; background: ${CONFIG.surface_elevated};">
        <img src="${esc(recipeImage)}" style="width:100%;height:100%;object-fit:cover;" />
      </div>
      ` : ''}

      <div style="padding: 0 20px;">
        <!-- My Photo (compact upload) -->
        <div style="margin: 16px 0;">
          ${myPhoto ? `
            <div style="width: 100%; height: 120px; border-radius: ${CONFIG.border_radius}; overflow: hidden; background: ${CONFIG.surface_elevated}; position: relative;">
              <img src="${esc(myPhoto)}" style="width:100%;height:100%;object-fit:cover;" />
              <button onclick="triggerFoodLogPhoto('${logId}')" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border: none; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
                Change
              </button>
            </div>
          ` : `
            <div onclick="triggerFoodLogPhoto('${logId}')" style="width: 100%; height: 120px; border-radius: ${CONFIG.border_radius}; overflow: hidden; background: ${CONFIG.surface_color}; border: 1px dashed rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="display: flex; align-items: center; gap: 6px; color: ${CONFIG.text_muted}; font-size: 13px;">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
                Add my photo
              </div>
            </div>
          `}
        </div>
        <input type="file" id="foodLogPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleFoodLogPhoto('${logId}', this)" />

        <!-- Title & meta -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px;">
          <div style="font-size: 22px; font-weight: 700; color: ${CONFIG.text_color}; flex: 1;">${esc(entry.recipeName)}</div>
          <div style="display: flex; gap: 6px; flex-shrink: 0; margin-left: 8px;">
            <button onclick="openSwapMeal('${logId}', '${entry.mealType}', '${entry.dateCooked.split('T')[0]}')" title="Swap meal"
              style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: ${CONFIG.surface_color}; color: ${CONFIG.text_muted}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
            </button>
            <button onclick="showEditMealModal('${logId}')" title="Edit meal"
              style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: ${CONFIG.surface_color}; color: ${CONFIG.text_muted}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
            </button>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: ${CONFIG.space_lg};">
          ${entry.mealType ? `<span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); color: ${CONFIG.text_muted}; font-weight: 500;">${capitalize(entry.mealType)}</span>` : ''}
          <span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); color: ${CONFIG.text_muted}; font-weight: 500;">${dateLabel}</span>
          ${entry.status !== 'eaten'
            ? `<span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: ${CONFIG.text_muted}; font-weight: 600;">Planned</span>`
            : `<span style="font-size: 11px; padding: 3px 10px; border-radius: 10px; background: rgba(50,215,75,0.12); border: 1px solid rgba(50,215,75,0.2); color: ${CONFIG.success_color}; font-weight: 600;">Cooked</span>`}
        </div>

        <!-- I Made This button (green) -->
        ${entry.status !== 'eaten' ? `
          <button onclick="markMealAsCooked('${logId}')"
            style="width: 100%; padding: 14px; background: ${CONFIG.success_color}; border: none; border-radius: 12px; color: ${CONFIG.background_color}; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: ${CONFIG.space_lg}; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: ${CONFIG.font_family};">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            I made this!
          </button>
        ` : ''}

        <!-- Would you make this again? -->
        <div style="margin-bottom: ${CONFIG.space_lg};">
          <div style="font-size: 11px; color: ${CONFIG.text_tertiary}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500;">Would you make this again?</div>
          <div style="display: flex; gap: 12px;">
            <button onclick="rateFoodLogEntry('${logId}', true)" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid ${entry.wouldMakeAgain === true ? CONFIG.success_color : 'rgba(255,255,255,0.08)'}; background: ${entry.wouldMakeAgain === true ? 'rgba(50,215,75,0.1)' : CONFIG.surface_color}; color: ${entry.wouldMakeAgain === true ? CONFIG.success_color : CONFIG.text_color}; font-size: 14px; font-weight: 500; cursor: pointer; text-align: center; font-family: ${CONFIG.font_family}; transition: all 0.15s ease;">
              Yes!
            </button>
            <button onclick="rateFoodLogEntry('${logId}', false)" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid ${entry.wouldMakeAgain === false ? CONFIG.text_muted : 'rgba(255,255,255,0.08)'}; background: ${entry.wouldMakeAgain === false ? 'rgba(255,255,255,0.06)' : CONFIG.surface_color}; color: ${entry.wouldMakeAgain === false ? CONFIG.text_color : CONFIG.text_color}; font-size: 14px; font-weight: 500; cursor: pointer; text-align: center; font-family: ${CONFIG.font_family}; transition: all 0.15s ease;">
              Meh
            </button>
          </div>
        </div>

        <!-- Star Rating -->
        <div style="margin-bottom: ${CONFIG.space_lg};">
          <div style="font-size: 11px; color: ${CONFIG.text_tertiary}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500;">Rating</div>
          <div id="meal-star-rating" style="display: flex; gap: 8px;">
            ${[1,2,3,4,5].map(n => `<button onclick="setStarRating('${logId}', ${n})" style="font-size: 28px; color: ${n <= starRating ? CONFIG.warning_color : CONFIG.text_muted}; cursor: pointer; background: none; border: none; padding: 0; transition: color 0.1s ease; line-height: 1;">&#9733;</button>`).join('')}
          </div>
        </div>

        <!-- Notes -->
        <div style="margin-bottom: ${CONFIG.space_lg};">
          <div style="font-size: 11px; color: ${CONFIG.text_tertiary}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500;">Notes</div>
          <textarea id="foodLogNotes" rows="3" placeholder="How was it? Any adjustments next time?"
            style="width: 100%; padding: 14px 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; min-height: 80px; font-family: ${CONFIG.font_family}; outline: none;"
            onfocus="this.style.borderColor='${CONFIG.success_color}'" onblur="this.style.borderColor='rgba(255,255,255,0.08)'; saveFoodLogNotes('${logId}')">${esc(entry.notes || '')}</textarea>
        </div>

        <!-- Category & Ingredients -->
        ${entry.ingredients && entry.ingredients.length > 0 ? `
          <div style="margin-bottom: ${CONFIG.space_lg};">
            <div style="font-size: 11px; color: ${CONFIG.text_tertiary}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; font-weight: 500;">Ingredients</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${entry.ingredients.map(ing => `<span style="font-size: 12px; padding: 4px 12px; border-radius: 10px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); color: ${CONFIG.text_muted};">${esc(ing)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- View Recipe -->
        ${entry.recipeId ? `
          <button onclick="openRecipeView('${entry.recipeId}')" style="width: 100%; padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: ${CONFIG.font_family};">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            View Recipe
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

function setStarRating(logId, rating) {
  const entry = getFoodLog().find(e => e.id === logId);
  if (!entry) return;
  const newRating = entry.starRating === rating ? 0 : rating;
  updateFoodLogEntry(logId, { starRating: newRating });
  // Inline update — only re-render the star container
  const container = document.getElementById('meal-star-rating');
  if (container) {
    container.innerHTML = [1,2,3,4,5].map(n =>
      `<button onclick="setStarRating('${logId}', ${n})" style="font-size: 28px; color: ${n <= newRating ? CONFIG.warning_color : CONFIG.text_muted}; cursor: pointer; background: none; border: none; padding: 0; transition: color 0.1s ease; line-height: 1;">&#9733;</button>`
    ).join('');
  }
}

function triggerFoodLogPhoto(logId) {
  document.getElementById('foodLogPhotoInput')?.click();
}

function handleFoodLogPhoto(logId, input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    // Compress and store
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = h * maxDim / w; w = maxDim; }
        else { w = w * maxDim / h; h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      updateFoodLogEntry(logId, { myPhoto: base64, photo: base64 });
      showToast('Photo saved!', 'success');
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function rateFoodLogEntry(logId, wouldMakeAgain) {
  const entry = getFoodLog().find(e => e.id === logId);
  if (!entry) return;
  // Toggle: if same rating, clear it
  const newRating = entry.wouldMakeAgain === wouldMakeAgain ? null : wouldMakeAgain;
  updateFoodLogEntry(logId, { wouldMakeAgain: newRating });
  render();
}

function saveFoodLogNotes(logId) {
  const notes = document.getElementById('foodLogNotes')?.value || '';
  updateFoodLogEntry(logId, { notes: notes.trim() || null });
}

// ============================================================
// COOKING JOURNAL - Photo Gallery
// ============================================================

function renderMyPlates() {
  const log = getFoodLog();
  const photosEntries = log.filter(e => {
    if (e.myPhoto) return true;
    if (e.photo && e.photo.startsWith('data:')) return true;
    return false;
  });

  if (photosEntries.length === 0) {
    return `
      <div style="padding: ${CONFIG.space_md}; padding-bottom: 80px; max-width: 600px; margin: 0 auto; text-align: center;">
        <div style="padding: ${CONFIG.space_2xl} ${CONFIG.space_md};">
          <div style="font-size: 48px; opacity: 0.3; margin-bottom: ${CONFIG.space_md};">
            <svg width="48" height="48" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          </div>
          <div style="color: ${CONFIG.text_color}; font-size: 18px; font-weight: 600; margin-bottom: ${CONFIG.space_sm};">No photos yet</div>
          <div style="color: ${CONFIG.text_muted}; font-size: 14px;">Your cooking photos will appear here.<br>Add photos when logging meals!</div>
        </div>
      </div>
    `;
  }

  // Group by meal type in order
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const grouped = {};
  photosEntries.forEach(e => {
    const mt = (e.mealType || 'dinner').toLowerCase();
    if (!grouped[mt]) grouped[mt] = [];
    grouped[mt].push({
      id: e.id,
      photo: e.myPhoto || e.photo,
      recipeName: e.recipeName || 'Unknown',
      mealType: mt,
      date: e.dateCooked?.split('T')[0] || '',
      dateLabel: getFoodLogDateLabel(e.dateCooked?.split('T')[0] || getToday())
    });
  });

  // Collapsed state from localStorage
  const collapsedState = JSON.parse(localStorage.getItem('myPlatesCollapsed') || '{}');

  const sections = mealOrder
    .filter(mt => grouped[mt] && grouped[mt].length > 0)
    .map(mt => {
      const photos = grouped[mt];
      const count = photos.length;
      const label = capitalize(mt);
      const isCollapsed = collapsedState[mt] === true;

      return `
        <div style="margin-bottom: ${CONFIG.space_md};">
          <div onclick="togglePlatesSection('${mt}')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px ${CONFIG.space_md}; cursor: pointer; -webkit-tap-highlight-color: transparent;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px; font-weight: 700; color: ${CONFIG.text_color};">${label}</span>
              <span style="font-size: 13px; color: ${CONFIG.text_muted};">&middot; ${count} photo${count !== 1 ? 's' : ''}</span>
            </div>
            <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="2" viewBox="0 0 24 24" style="transition: transform 0.2s; transform: rotate(${isCollapsed ? '-90deg' : '0deg'});">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          ${isCollapsed ? '' : `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 0 1px;">
              ${photos.map(p => `
                <div onclick="showPlateFullscreen('${p.id}')" style="cursor: pointer;">
                  <div style="aspect-ratio: 1; overflow: hidden; position: relative;">
                    <img src="${esc(p.photo)}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                  </div>
                  <div style="padding: 4px 4px 8px; font-size: 12px; font-weight: 600; color: ${CONFIG.text_color}; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${esc(p.recipeName)}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }).join('');

  return `
    <div style="padding: 0; padding-bottom: 80px; max-width: 600px; margin: 0 auto;">
      ${sections}
    </div>
  `;
}

function togglePlatesSection(mealType) {
  const collapsedState = JSON.parse(localStorage.getItem('myPlatesCollapsed') || '{}');
  collapsedState[mealType] = !collapsedState[mealType];
  localStorage.setItem('myPlatesCollapsed', JSON.stringify(collapsedState));
  render();
}

function showPlateFullscreen(logId) {
  const log = getFoodLog();
  const entry = log.find(e => e.id === logId);
  if (!entry) return;
  const photo = entry.myPhoto || entry.photo;
  const dateLabel = getFoodLogDateLabel(entry.dateCooked?.split('T')[0] || getToday());

  // Find all photos for same recipe
  const sameName = log.filter(e =>
    (e.recipeName || '').toLowerCase().trim() === (entry.recipeName || '').toLowerCase().trim() &&
    (e.myPhoto || (e.photo && e.photo.startsWith('data:')))
  );
  const hasMultiple = sameName.length > 1;
  const coverPrefs = JSON.parse(localStorage.getItem('myPlatesCovers') || '{}');
  const coverKey = (entry.recipeName || '').toLowerCase().trim();
  const isCover = coverPrefs[coverKey] === logId;

  // Per-photo notes
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  const existingNote = photoNotes[logId] || '';

  // Recipe link button
  const hasRecipeLink = !!entry.recipeId;

  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <div style="width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; margin-bottom: ${CONFIG.space_md}; background: ${CONFIG.surface_elevated};">
        <img src="${esc(photo)}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${esc(entry.recipeName)}</div>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: 4px;">${dateLabel}</div>
      <div style="font-size: 12px; color: ${CONFIG.text_tertiary}; margin-bottom: ${CONFIG.space_md};">${capitalize(entry.mealType || 'meal')}</div>

      <!-- Notes section -->
      <div id="plateNoteSection" style="text-align: left; margin-bottom: ${CONFIG.space_md}; padding: ${CONFIG.space_sm} 0;">
        ${existingNote ? `
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
            <div id="plateNoteDisplay" style="font-size: 14px; color: ${CONFIG.text_muted}; line-height: 1.4; flex: 1;">${esc(existingNote)}</div>
            <button onclick="editPlateNote('${logId}')" style="background: none; border: none; cursor: pointer; padding: 4px; flex-shrink: 0;">
              <svg width="14" height="14" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
            </button>
          </div>
        ` : `
          <div onclick="editPlateNote('${logId}')" style="font-size: 14px; color: ${CONFIG.text_muted}; cursor: pointer; padding: 8px 0;">+ Add a note</div>
        `}
      </div>

      ${hasRecipeLink ? `
        <button onclick="closeModal(); openRecipeView('${entry.recipeId}')"
          style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; font-size: 14px; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          View recipe <span style="font-size: 16px;">&rarr;</span>
        </button>
      ` : ''}
      ${hasMultiple ? `
        <button onclick="setAsCoverPhoto('${logId}', '${esc(coverKey)}')"
          style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid ${isCover ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; background: ${isCover ? 'rgba(232,93,93,0.15)' : CONFIG.surface_elevated}; color: ${isCover ? CONFIG.primary_action_color : CONFIG.text_color}; font-size: 14px; cursor: pointer; margin-bottom: 8px;">
          ${isCover ? 'Cover photo' : 'Set as cover'}
        </button>
      ` : ''}
      <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Close</button>
    </div>
  `);
}

function editPlateNote(logId) {
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  const existingNote = photoNotes[logId] || '';
  const section = document.getElementById('plateNoteSection');
  if (!section) return;

  section.innerHTML = `
    <textarea id="plateNoteInput" rows="3" placeholder="Add a note about this meal..."
      style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family}; line-height: 1.4;">${esc(existingNote)}</textarea>
    <div style="display: flex; gap: 8px; margin-top: 8px;">
      <button onclick="savePlateNote('${logId}')"
        style="flex: 1; padding: 10px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">Save</button>
      <button onclick="showPlateFullscreen('${logId}')"
        style="padding: 10px 16px; background: transparent; color: ${CONFIG.text_muted}; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; cursor: pointer;">Cancel</button>
    </div>
  `;
  const input = document.getElementById('plateNoteInput');
  if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
}

function savePlateNote(logId) {
  const input = document.getElementById('plateNoteInput');
  if (!input) return;
  const note = input.value.trim();
  const photoNotes = JSON.parse(localStorage.getItem('myPlatesNotes') || '{}');
  if (note) {
    photoNotes[logId] = note;
  } else {
    delete photoNotes[logId];
  }
  localStorage.setItem('myPlatesNotes', JSON.stringify(photoNotes));
  showToast('Note saved!', 'success');
  showPlateFullscreen(logId);
}

function setAsCoverPhoto(logId, coverKey) {
  const coverPrefs = JSON.parse(localStorage.getItem('myPlatesCovers') || '{}');
  coverPrefs[coverKey] = logId;
  localStorage.setItem('myPlatesCovers', JSON.stringify(coverPrefs));
  showToast('Set as cover photo!', 'success');
  closeModal();
}

// ============================================================
// QUICK LOG MODAL (floating + button)
// ============================================================
function showQuickLogModal() {
  const mealType = detectMealType ? detectMealType() : 'dinner';
  const dateStr = ((state.currentView === 'my-meals' || state.currentView === 'home') && state.myMealsDate) ? state.myMealsDate : getToday();
  showMealActionSheet(mealType, dateStr);
}

function selectQuickLogMealType(mt) {
  state._quickLogMealType = mt;
  ['breakfast','lunch','dinner','snack'].forEach(t => {
    const btn = document.getElementById('qlpill-' + t);
    if (!btn) return;
    const active = t === mt;
    btn.style.border = `1px solid ${active ? 'rgba(232,93,93,0.4)' : 'rgba(255,255,255,0.15)'}`;
    btn.style.background = active ? 'rgba(232,93,93,0.15)' : 'transparent';
    btn.style.color = active ? '#e85d5d' : 'rgba(255,255,255,0.6)';
    btn.style.fontWeight = active ? '600' : '400';
  });
}

function handleQuickLogPhoto(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = h * maxDim / w; w = maxDim; }
        else { w = w * maxDim / h; h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      state._quickLogPhoto = canvas.toDataURL('image/jpeg', 0.7);
      const btn = document.getElementById('quickLogPhotoBtn');
      if (btn) {
        btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="#32d74b" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Photo added!';
        btn.style.borderColor = 'rgba(50,215,75,0.3)';
        btn.style.color = '#32d74b';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitQuickLog() {
  const name = document.getElementById('quickLogName')?.value.trim();
  if (!name) {
    showToast('Please enter what you ate', 'error');
    return;
  }
  const notes = document.getElementById('quickLogNotes')?.value.trim() || null;
  const dateStr = state._quickLogDateStr || getToday();
  const isFuture = isFutureDate(dateStr);
  addFoodLogEntry({
    recipeName: name,
    mealType: state._quickLogMealType || 'dinner',
    photo: state._quickLogPhoto || null,
    notes,
    dateStr: dateStr,
    status: 'planned'
  });
  closeModal();
  showToast('Meal added!', 'success');
  render();
}

// ============================================================
// SWAP MEAL — Open swipe deck to replace a logged meal
// ============================================================
function openSwapMeal(logId, mealType, dateStr) {
  showMealActionSheet(mealType, dateStr, logId);
}

function markMealAsCooked(logId) {
  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <div style="font-size: 40px; margin-bottom: ${CONFIG.space_md};">
        <svg width="40" height="40" fill="none" stroke="${CONFIG.success_color}" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z"/></svg>
      </div>
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Nice! You made it!</h3>
      <div style="font-size: 14px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">Want to add a photo of what you cooked?</div>
      <button onclick="closeModal(); triggerCookedPhoto('${logId}')"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
        Add a photo
      </button>
      <button onclick="markFoodLogEaten('${logId}'); closeModal(); showToast('Marked as cooked!', 'success'); render();"
        style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">
        Skip photo
      </button>
    </div>
  `);
}

function triggerCookedPhoto(logId) {
  state._cookedPhotoLogId = logId;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.style.display = 'none';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = h * maxDim / w; w = maxDim; }
          else { w = w * maxDim / h; h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        updateFoodLogEntry(logId, { myPhoto: base64, photo: base64, status: 'eaten' });
        showToast('Marked as cooked with photo!', 'success');
        render();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    document.body.removeChild(input);
  };
  document.body.appendChild(input);
  input.click();
}

function confirmDeleteMeal(logId, mealName, dateLabel) {
  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <div style="font-size: 32px; margin-bottom: ${CONFIG.space_md};">
        <svg width="32" height="32" fill="none" stroke="${CONFIG.danger_color}" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto;"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
      </div>
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Remove meal?</h3>
      <div style="font-size: 14px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">Remove ${mealName} from ${dateLabel}?</div>
      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 14px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button onclick="deleteFoodLogEntry('${logId}'); closeModal(); showToast('Meal removed', 'success'); render();"
          style="flex: 1; padding: 14px; background: rgba(255,69,58,0.15); color: ${CONFIG.danger_color}; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">Delete</button>
      </div>
    </div>
  `);
}

// ============================================================
// EDIT MEAL MODAL — Manual override for food log entries
// ============================================================
function showEditMealModal(logId) {
  const log = getFoodLog();
  const entry = log.find(e => e.id === logId);
  if (!entry) return;

  state._editLogId = logId;
  state._editLogPhoto = entry.photo || null;

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_lg};">Edit Meal</h3>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Meal name</label>
        <input type="text" id="editMealName" value="${esc(entry.recipeName)}"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <button onclick="document.getElementById('editMealPhotoInput').click()" id="editMealPhotoBtn"
          style="width: 100%; padding: 14px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; background: transparent; color: ${CONFIG.text_muted}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          ${(entry.photo) ? 'Change photo' : 'Add photo'}
        </button>
        <input type="file" id="editMealPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleEditMealPhoto(this)" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes</label>
        <textarea id="editMealNotes" rows="2" placeholder="How was it?"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};">${esc(entry.notes || '')}</textarea>
      </div>

      <div style="margin-bottom: ${CONFIG.space_lg};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Would make again?</label>
        <div style="display: flex; gap: 8px;">
          <button onclick="state._editLogRating = true; document.getElementById('editRateUp').style.borderColor='rgba(50,215,75,0.5)'; document.getElementById('editRateUp').style.background='rgba(50,215,75,0.1)'; document.getElementById('editRateDown').style.borderColor='rgba(255,255,255,0.1)'; document.getElementById('editRateDown').style.background='transparent';"
            id="editRateUp" style="flex: 1; padding: 12px; border-radius: 10px; border: 2px solid ${entry.wouldMakeAgain === true ? 'rgba(50,215,75,0.5)' : 'rgba(255,255,255,0.1)'}; background: ${entry.wouldMakeAgain === true ? 'rgba(50,215,75,0.1)' : 'transparent'}; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; text-align: center;">
            👍 Yes
          </button>
          <button onclick="state._editLogRating = false; document.getElementById('editRateDown').style.borderColor='rgba(255,69,58,0.5)'; document.getElementById('editRateDown').style.background='rgba(255,69,58,0.1)'; document.getElementById('editRateUp').style.borderColor='rgba(255,255,255,0.1)'; document.getElementById('editRateUp').style.background='transparent';"
            id="editRateDown" style="flex: 1; padding: 12px; border-radius: 10px; border: 2px solid ${entry.wouldMakeAgain === false ? 'rgba(255,69,58,0.5)' : 'rgba(255,255,255,0.1)'}; background: ${entry.wouldMakeAgain === false ? 'rgba(255,69,58,0.1)' : 'transparent'}; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; text-align: center;">
            👎 Nah
          </button>
        </div>
      </div>

      <button onclick="submitEditMeal()"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Save Changes
      </button>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);

  // Initialize rating state
  state._editLogRating = entry.wouldMakeAgain;
}

function handleEditMealPhoto(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = h * maxDim / w; w = maxDim; }
        else { w = w * maxDim / h; h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      state._editLogPhoto = canvas.toDataURL('image/jpeg', 0.7);
      const btn = document.getElementById('editMealPhotoBtn');
      if (btn) {
        btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="#32d74b" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Photo updated!';
        btn.style.borderColor = 'rgba(50,215,75,0.3)';
        btn.style.color = '#32d74b';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitEditMeal() {
  const logId = state._editLogId;
  if (!logId) return;
  const name = document.getElementById('editMealName')?.value.trim();
  if (!name) {
    showToast('Please enter a meal name', 'error');
    return;
  }
  const notes = document.getElementById('editMealNotes')?.value.trim() || null;
  const updates = {
    recipeName: name,
    notes: notes,
    wouldMakeAgain: state._editLogRating !== undefined ? state._editLogRating : null
  };
  // If photo was changed/added
  if (state._editLogPhoto) {
    updates.photo = state._editLogPhoto;
  }
  updateFoodLogEntry(logId, updates);
  closeModal();
  showToast('Meal updated!', 'success');
  render();
}

// ============================================================
// PAGE RENDER & INIT
// On my-meals.html, this file provides render() and init().
// On index.html, home.js provides render() and init() and uses
// the rendering functions above (renderMyMeals, etc.) directly.
// ============================================================

(function() {
  // Only auto-init on my-meals.html — on index.html, home.js handles init
  if (!window.location.pathname.includes('my-meals')) return;

  var MY_MEALS_VIEW_RENDERERS = {
    'my-meals': renderMyMeals,
    'home': renderMyMeals,
    'food-log-detail': renderFoodLogDetail
  };

  window.render = function() {
    var app = document.getElementById('app');
    if (!app) return;

    var renderer = MY_MEALS_VIEW_RENDERERS[state.currentView];
    var content;
    if (renderer) {
      content = renderer();
    } else {
      content = renderMyMeals();
      state.currentView = 'my-meals';
    }

    app.innerHTML = '<div class="' + getAppShellClass() + '" style="background: ' + CONFIG.background_color + '; min-height: 100dvh; padding-bottom: 56px;">'
      + renderDesktopSidebar()
      + renderNav()
      + '<div class="desktop-content-area">'
      + renderDesktopPageTitle()
      + content
      + '</div>'
      + renderBottomNav()
      + '</div>';

    if (state.currentView === 'my-meals' || state.currentView === 'home') {
      initMyMealsSwipeGestures();
    }
  };

  function init() {
    loadAllState();
    var targetView = sessionStorage.getItem('yummy_target_view');
    if (targetView && MY_MEALS_VIEW_RENDERERS[targetView]) {
      sessionStorage.removeItem('yummy_target_view');
      state.currentView = targetView;
    } else {
      state.currentView = 'my-meals';
    }
    setupKeyboardShortcuts();
    window.render();
  }

  init();
})();
