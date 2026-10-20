/**
 * OU Dining Menus - Split Lunch & Dinner Cards Application Logic
 * University of Oklahoma Housing & Food Services
 */

document.addEventListener('DOMContentLoaded', () => {
  let menuData = null;
  let activeDay = 'Monday';

  // Automatically determine current meal based on time of day (Central Time / America/Chicago)
  function getCurrentMealByTime() {
    let hour = 12;
    let minute = 0;
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      for (const p of parts) {
        if (p.type === 'hour') hour = parseInt(p.value, 10);
        if (p.type === 'minute') minute = parseInt(p.value, 10);
      }
      if (hour === 24) hour = 0;
    } catch (e) {
      const now = new Date();
      hour = now.getHours();
      minute = now.getMinutes();
    }

    const totalMinutes = hour * 60 + minute;

    // Breakfast: 12:00 AM – 10:30 AM
    // Lunch: 10:30 AM – 3:00 PM (15:00)
    // Dinner: 3:00 PM – 11:59 PM
    if (totalMinutes < 10 * 60 + 30) {
      return 'breakfast';
    } else if (totalMinutes < 15 * 60) {
      return 'lunch';
    } else {
      return 'dinner';
    }
  }

  let activeMealFilter = getCurrentMealByTime(); // Automatically default to current meal of the day

  // DOM Elements
  const splitMenusContainer = document.getElementById('split-menus-container');
  const lunchCardsRow = document.getElementById('lunch-cards-row');
  const dayNavButtonsContainer = document.getElementById('day-nav-buttons');
  const mealFilterContainer = document.getElementById('meal-filter');

  // Immediately reflect active meal on segmented control buttons
  if (mealFilterContainer) {
    mealFilterContainer.querySelectorAll('.seg-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.meal === activeMealFilter);
    });
  }

  // Detect current day (Central Time / America/Chicago)
  let todayDayName = 'Monday';
  try {
    todayDayName = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'long'
    }).format(new Date());
  } catch (e) {
    todayDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  }

  // Location Metadata
  const locationsMeta = [
    {
      key: 'residential_colleges',
      cssClass: 'res-card',
      name: 'Residential Colleges',
      sub: 'Headington & Dunham Colleges',
      hoursBreakfast: '8:00 AM – 10:30 AM (M–F)',
      hoursLunch: '11:00 AM – 2:00 PM',
      hoursDinner: '4:30 PM – 8:00 PM'
    },
    {
      key: 'couch_restaurants',
      cssClass: 'couch-card',
      name: 'Couch Restaurants',
      sub: 'Couch Center',
      hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
      hoursLunch: '10:30 AM – 2:30 PM',
      hoursDinner: '4:30 PM – 9:00 PM'
    },
    {
      key: 'wagner_dining_hall',
      cssClass: 'wagner-card',
      name: 'Wagner Dining Hall',
      sub: 'Headington Hall (Athletics)',
      hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
      hoursLunch: '11:00 AM – 1:30 PM',
      hoursDinner: '5:00 PM – 8:00 PM (Sun–Thu)'
    }
  ];

  // Initialize
  loadMenuData();

  async function loadMenuData() {
    try {
      const response = await fetch(`data/menu_data.json?v=${Date.now()}`, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      menuData = await response.json();
      initApp();
    } catch (err) {
      console.error('Failed to load menu data:', err);
      if (lunchCardsRow) {
        lunchCardsRow.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #dc2626; background: #fff; border-radius: 12px;">
            <h3>Failed to load dining menu data</h3>
            <p style="margin-top: 0.5rem; color: #6b7280;">Please run <code>python3 scrape_menus.py</code> in the terminal to refresh the local data cache.</p>
          </div>
        `;
      }
    }
  }

  function initApp() {
    if (!menuData) return;

    // Default to today if valid, else Monday
    if (menuData.days_order && menuData.days_order.includes(todayDayName)) {
      activeDay = todayDayName;
    } else {
      activeDay = 'Monday';
    }

    // Ensure meal filter UI button reflects the active meal
    if (mealFilterContainer) {
      mealFilterContainer.querySelectorAll('.seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.meal === activeMealFilter);
      });
    }

    renderDayNavButtons();
    renderDayMenus(activeDay);
    setupEventListeners();
  }

  function setupEventListeners() {
    // Meal Filter (Split View / Breakfast Only / Lunch Only / Dinner Only)
    if (mealFilterContainer) {
      mealFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        mealFilterContainer.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMealFilter = btn.dataset.meal;
        updateMealSectionVisibility();

        if (activeMealFilter === 'all') {
          const currentMeal = getCurrentMealByTime();
          const targetBlock = document.getElementById(`${currentMeal}-split-block`) || document.querySelector(`.${currentMeal}-block`);
          if (targetBlock) {
            targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }

    // Back to top floating button
    const btnBackToTop = document.getElementById('btn-back-to-top');
    if (btnBackToTop) {
      btnBackToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      window.addEventListener('scroll', () => {
        if (window.scrollY > 280) {
          btnBackToTop.classList.add('visible');
        } else {
          btnBackToTop.classList.remove('visible');
        }
      }, { passive: true });
    }
  }

  // =========================================================================
  // Date Helper for Weekdays
  // =========================================================================
  function getDayDate(dayName) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIdx = days.indexOf(dayName);
    if (dayIdx === -1) return null;

    let baseDate = null;
    if (menuData && menuData.week_info) {
      const match = menuData.week_info.match(/([A-Za-z]+)\s+(\d{1,2})/);
      if (match) {
        const monthStr = match[1];
        const dayNum = parseInt(match[2], 10);
        const year = new Date().getFullYear();
        const monthIdx = new Date(`${monthStr} 1, ${year}`).getMonth();
        if (!isNaN(monthIdx)) {
          baseDate = new Date(year, monthIdx, dayNum);
        }
      }
    }

    if (!baseDate || isNaN(baseDate.getTime())) {
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const distanceToMonday = (currentDayOfWeek + 6) % 7;
      baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
    }

    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + dayIdx);

    const m = targetDate.getMonth() + 1;
    const d = targetDate.getDate();
    const monthShort = targetDate.toLocaleString('en-US', { month: 'short' });

    return {
      monthNum: m,
      dayNum: d,
      monthShort: monthShort,
      shortStr: `${m}/${d}`, // e.g. "10/19"
      fullStr: `${monthShort} ${d}` // e.g. "Oct 19"
    };
  }

  // =========================================================================
  // Day Navigation
  // =========================================================================
  function renderDayNavButtons() {
    if (!dayNavButtonsContainer) return;
    dayNavButtonsContainer.innerHTML = '';

    // "All Days" button
    const allBtn = document.createElement('button');
    allBtn.className = `day-nav-btn all-days-btn ${activeDay === 'all' ? 'active' : ''}`;
    allBtn.dataset.day = 'all';
    allBtn.innerHTML = `
      <span class="day-abbr">All</span>
      <span class="day-full">All Days</span>
    `;
    allBtn.addEventListener('click', () => {
      switchDay('all');
    });
    dayNavButtonsContainer.appendChild(allBtn);

    const days = menuData.days_order || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach(day => {
      const btn = document.createElement('button');
      btn.className = `day-nav-btn ${day === activeDay ? 'active' : ''}`;
      btn.dataset.day = day;

      const abbr = day.slice(0, 3);
      const dateInfo = getDayDate(day);
      const dateShort = dateInfo ? ` ${dateInfo.shortStr}` : '';
      const dateFull = dateInfo ? `, ${dateInfo.fullStr}` : '';

      btn.innerHTML = `
        <span class="day-abbr">${abbr}${dateShort}</span>
        <span class="day-full">${day}${dateFull}</span>
      `;

      btn.addEventListener('click', () => {
        switchDay(day);
      });

      dayNavButtonsContainer.appendChild(btn);
    });

    // Auto-scroll active day into view on mobile
    setTimeout(() => {
      const activeBtn = dayNavButtonsContainer.querySelector('.day-nav-btn.active');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 150);
  }

  function switchDay(day) {
    activeDay = day;
    if (dayNavButtonsContainer) {
      dayNavButtonsContainer.querySelectorAll('.day-nav-btn').forEach(btn => {
        const isMatch = btn.dataset.day === day;
        btn.classList.toggle('active', isMatch);
        if (isMatch) {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }
    renderDayMenus(day);
  }

  // =========================================================================
  // Render Day Menus: Single Day or All Days (Monday – Sunday)
  // =========================================================================
  function createMealSplitBlock(day, mealType, rowData) {
    const sec = document.createElement('section');
    sec.className = `meal-split-block ${mealType}-block`;

    let title = 'Lunch Menus';
    if (mealType === 'breakfast') {
      title = 'Breakfast Menus';
    } else if (mealType === 'dinner') {
      title = 'Dinner Menus';
    }

    const dateInfo = getDayDate(day);
    const dateSuffix = dateInfo ? `, ${dateInfo.fullStr}` : '';

    sec.innerHTML = `
      <div class="meal-split-header ${mealType}-header">
        <div class="meal-header-title">
          <span class="meal-header-text">${title}</span>
          <span class="meal-header-day">• ${day}${dateSuffix}</span>
        </div>
      </div>
      <div class="meal-cards-row"></div>
    `;

    const cardsRow = sec.querySelector('.meal-cards-row');
    locationsMeta.forEach(loc => {
      const locData = rowData ? rowData.locations[loc.key] : null;
      cardsRow.appendChild(createLocationCard(loc, mealType, locData));
    });

    return sec;
  }

  function renderDayMenus(day) {
    if (day === 'all') {
      if (splitMenusContainer) {
        splitMenusContainer.innerHTML = '';
        const days = menuData.days_order || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach(d => {
          const isToday = d.toLowerCase() === todayDayName.toLowerCase();
          const isWeekend = d === 'Saturday' || d === 'Sunday';
          const dateInfo = getDayDate(d);
          const dateText = dateInfo ? `, ${dateInfo.fullStr}` : '';

          const daySec = document.createElement('div');
          daySec.className = 'day-group-section';
          daySec.id = `day-group-${d.toLowerCase()}`;

          const header = document.createElement('div');
          header.className = 'day-group-header';
          header.innerHTML = `
            <div class="day-group-title">
              <h3>${d}${dateText}</h3>
              ${isToday ? '<span class="today-badge">Today</span>' : ''}
            </div>
            <span class="day-group-pill">${isWeekend ? 'Weekend Dining' : 'Weekday Dining'}</span>
          `;
          daySec.appendChild(header);

          const bRow = menuData.rows.find(r => r.day === d && r.meal === 'breakfast');
          const lRow = menuData.rows.find(r => r.day === d && r.meal === 'lunch');
          const dRow = menuData.rows.find(r => r.day === d && r.meal === 'dinner');

          daySec.appendChild(createMealSplitBlock(d, 'breakfast', bRow));
          daySec.appendChild(createMealSplitBlock(d, 'lunch', lRow));
          daySec.appendChild(createMealSplitBlock(d, 'dinner', dRow));

          splitMenusContainer.appendChild(daySec);
        });
      }

      updateMealSectionVisibility();
      return;
    }

    // Single Day View
    if (splitMenusContainer) {
      splitMenusContainer.innerHTML = '';
      const bRow = menuData.rows.find(r => r.day === day && r.meal === 'breakfast');
      const lRow = menuData.rows.find(r => r.day === day && r.meal === 'lunch');
      const dRow = menuData.rows.find(r => r.day === day && r.meal === 'dinner');

      splitMenusContainer.appendChild(createMealSplitBlock(day, 'breakfast', bRow));
      splitMenusContainer.appendChild(createMealSplitBlock(day, 'lunch', lRow));
      splitMenusContainer.appendChild(createMealSplitBlock(day, 'dinner', dRow));
    }

    updateMealSectionVisibility();
  }

  function createLocationCard(loc, mealType, locData) {
    const card = document.createElement('div');
    card.className = `split-location-card ${loc.cssClass}`;
    card.dataset.location = loc.key;
    card.dataset.meal = mealType;

    const isOpen = locData && locData.available;
    let hours = loc.hoursLunch;
    if (mealType === 'breakfast') hours = loc.hoursBreakfast;
    else if (mealType === 'dinner') hours = loc.hoursDinner;

    // Card Venue Header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-venue-header';
    headerDiv.innerHTML = `
      <div class="card-venue-top">
        <div class="card-venue-badge">
          <span class="venue-sub-tag">${loc.sub}</span>
        </div>
        <span class="venue-status-pill ${isOpen ? 'status-open' : 'status-closed'}">
          ${isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
      <h3 class="card-venue-name">${loc.name}</h3>
      <div class="card-venue-hours">Hours: ${hours}</div>
    `;
    card.appendChild(headerDiv);

    // Card Menu Body
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-menu-body';

    if (!isOpen) {
      const notice = document.createElement('div');
      notice.className = 'empty-menu-notice';
      notice.textContent = locData?.note || 'Closed for this meal period';
      bodyDiv.appendChild(notice);
      card.appendChild(bodyDiv);
      return card;
    }

    if (locData.note) {
      const subNotice = document.createElement('div');
      subNotice.className = 'empty-menu-notice';
      subNotice.textContent = locData.note;
      bodyDiv.appendChild(subNotice);
    }

    if (!locData.stations || locData.stations.length === 0) {
      card.appendChild(bodyDiv);
      return card;
    }

    locData.stations.forEach(station => {
      // Omit static everyday classics to keep the daily card crisp and focused
      if (station.title.includes('Everyday Classics') || station.title.includes('Daily Restaurant Stations')) {
        return;
      }

      const group = document.createElement('div');
      group.className = 'station-group-block';

      let badgeClass = '';
      if (station.title.includes('Hot Line') || station.title.includes("Chef's Choice") || station.title.includes('Breakfast')) {
        badgeClass = 'featured';
      } else if (station.title.includes('Shanghai') || station.title.includes('Asian')) {
        badgeClass = 'asian';
      } else if (station.title.includes('Made To Order') || station.title.includes('Made-to-Order') || station.title.includes('Specialty')) {
        badgeClass = 'custom';
      }

      group.innerHTML = `
        <span class="station-badge-label ${badgeClass}">
          ${escapeHtml(station.title)}
        </span>
      `;

      const ul = document.createElement('ul');
      ul.className = 'dish-list';

      station.items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'dish-item';
        li.innerHTML = `<span class="dish-name">${escapeHtml(item.name)}</span>`;
        ul.appendChild(li);
      });

      group.appendChild(ul);
      bodyDiv.appendChild(group);
    });

    card.appendChild(bodyDiv);
    return card;
  }

  // =========================================================================
  // Meal Filter Visibility (Split View vs Breakfast vs Lunch vs Dinner)
  // =========================================================================
  function updateMealSectionVisibility() {
    document.querySelectorAll('.breakfast-block').forEach(b => {
      if (activeMealFilter === 'lunch' || activeMealFilter === 'dinner') {
        b.classList.add('hidden-by-filter');
      } else {
        b.classList.remove('hidden-by-filter');
      }
    });
    document.querySelectorAll('.lunch-block').forEach(b => {
      if (activeMealFilter === 'breakfast' || activeMealFilter === 'dinner') {
        b.classList.add('hidden-by-filter');
      } else {
        b.classList.remove('hidden-by-filter');
      }
    });
    document.querySelectorAll('.dinner-block').forEach(b => {
      if (activeMealFilter === 'breakfast' || activeMealFilter === 'lunch') {
        b.classList.add('hidden-by-filter');
      } else {
        b.classList.remove('hidden-by-filter');
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
