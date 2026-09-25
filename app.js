/**
 * OU Dining Menus - Split Lunch & Dinner Cards Application Logic
 * University of Oklahoma Housing & Food Services
 */

document.addEventListener('DOMContentLoaded', () => {
  let menuData = null;
  let activeDay = 'Monday';
  let activeMealFilter = 'all'; // 'all' (Split View), 'lunch', 'dinner'
  let currentSearchQuery = '';
  let activeDietaryTags = new Set();

  // DOM Elements
  const weekLabel = document.getElementById('week-label');
  const activeDayHeading = document.getElementById('active-day-heading');
  const activeTodayBadge = document.getElementById('active-today-badge');
  const activeDaySubtitle = document.getElementById('active-day-subtitle');
  const splitMenusContainer = document.getElementById('split-menus-container');
  const breakfastDayLabel = document.getElementById('breakfast-day-label');
  const lunchDayLabel = document.getElementById('lunch-day-label');
  const dinnerDayLabel = document.getElementById('dinner-day-label');
  const breakfastSplitBlock = document.getElementById('breakfast-split-block');
  const lunchSplitBlock = document.getElementById('lunch-split-block');
  const dinnerSplitBlock = document.getElementById('dinner-split-block');
  const breakfastCardsRow = document.getElementById('breakfast-cards-row');
  const lunchCardsRow = document.getElementById('lunch-cards-row');
  const dinnerCardsRow = document.getElementById('dinner-cards-row');
  const dayNavButtonsContainer = document.getElementById('day-nav-buttons');
  const searchInput = document.getElementById('dish-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const searchMatchCount = document.getElementById('search-match-count');
  const mealFilterContainer = document.getElementById('meal-filter');
  const dietaryFilterContainer = document.getElementById('dietary-filter');
  const btnToday = document.getElementById('btn-today-shortcut');
  const btnPrint = document.getElementById('btn-print');
  const btnEverydayModal = document.getElementById('btn-everyday-modal');
  const everydayModal = document.getElementById('everyday-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Detect current day
  const todayDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  // Location Metadata
  const locationsMeta = [
    {
      key: 'residential_colleges',
      cssClass: 'res-card',
      name: 'Residential Colleges',
      sub: 'Headington & Dunham Colleges',
      icon: '🏛️',
      hoursBreakfast: '8:00 AM – 10:30 AM (M–F)',
      hoursLunch: '11:00 AM – 2:00 PM',
      hoursDinner: '4:30 PM – 8:00 PM'
    },
    {
      key: 'couch_restaurants',
      cssClass: 'couch-card',
      name: 'Couch Restaurants',
      sub: 'Couch Center',
      icon: '🍽️',
      hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
      hoursLunch: '10:30 AM – 2:30 PM',
      hoursDinner: '4:30 PM – 9:00 PM'
    },
    {
      key: 'wagner_dining_hall',
      cssClass: 'wagner-card',
      name: 'Wagner Dining Hall',
      sub: 'Headington Hall (Athletics)',
      icon: '🏆',
      hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
      hoursLunch: '11:00 AM – 1:30 PM',
      hoursDinner: '5:00 PM – 7:30 PM (Sun–Thu)'
    }
  ];

  // Initialize
  loadMenuData();

  async function loadMenuData() {
    try {
      const response = await fetch('data/menu_data.json');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      menuData = await response.json();
      initApp();
    } catch (err) {
      console.error('Failed to load menu data:', err);
      lunchCardsRow.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #dc2626; background: #fff; border-radius: 12px;">
          <h3>Failed to load dining menu data</h3>
          <p style="margin-top: 0.5rem; color: #6b7280;">Please run <code>python3 scrape_menus.py</code> in the terminal to refresh the local data cache.</p>
        </div>
      `;
    }
  }

  function initApp() {
    if (!menuData) return;

    if (menuData.week_info) {
      weekLabel.textContent = menuData.week_info;
    }

    // Default to today if valid, else Monday
    if (menuData.days_order && menuData.days_order.includes(todayDayName)) {
      activeDay = todayDayName;
    } else {
      activeDay = 'Monday';
    }

    renderDayNavButtons();
    renderDayMenus(activeDay);
    setupEventListeners();
  }

  function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
      applyFiltersAndHighlights();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      applyFiltersAndHighlights();
      searchInput.focus();
    });

    // Meal Filter (Split View / Lunch Only / Dinner Only)
    mealFilterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      mealFilterContainer.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMealFilter = btn.dataset.meal;
      updateMealSectionVisibility();
      applyFiltersAndHighlights();
    });

    // Dietary Filter Chips
    dietaryFilterContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.diet-chip');
      if (!chip) return;
      const tag = chip.dataset.tag;
      if (activeDietaryTags.has(tag)) {
        activeDietaryTags.delete(tag);
        chip.classList.remove('active');
      } else {
        activeDietaryTags.add(tag);
        chip.classList.add('active');
      }
      applyFiltersAndHighlights();
    });

    // Today Shortcut Button
    btnToday.addEventListener('click', () => {
      switchDay(todayDayName);
    });

    // Everyday Stations Modal
    btnEverydayModal.addEventListener('click', () => {
      everydayModal.style.display = 'flex';
    });
    modalCloseBtn.addEventListener('click', () => {
      everydayModal.style.display = 'none';
    });
    everydayModal.addEventListener('click', (e) => {
      if (e.target === everydayModal) {
        everydayModal.style.display = 'none';
      }
    });

    // Print
    btnPrint.addEventListener('click', () => {
      window.print();
    });

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
  // Day Navigation
  // =========================================================================
  function renderDayNavButtons() {
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

      const isToday = day.toLowerCase() === todayDayName.toLowerCase();
      const abbr = day.slice(0, 3);

      btn.innerHTML = `
        <span class="day-abbr">${abbr}</span>
        <span class="day-full">${day}</span>
        ${isToday ? '<span style="font-size:0.65rem; margin-left:0.25rem; opacity:0.85;">★</span>' : ''}
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
    dayNavButtonsContainer.querySelectorAll('.day-nav-btn').forEach(btn => {
      const isMatch = btn.dataset.day === day;
      btn.classList.toggle('active', isMatch);
      if (isMatch) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
    renderDayMenus(day);
    applyFiltersAndHighlights();
  }

  // =========================================================================
  // Render Day Menus: Single Day or All Days (Monday – Sunday)
  // =========================================================================
  function createMealSplitBlock(day, mealType, rowData) {
    const sec = document.createElement('section');
    sec.className = `meal-split-block ${mealType}-block`;

    let icon = '☀️';
    let title = 'Lunch Menus';
    let hoursPill = '10:30 AM – 2:30 PM (Varies by location)';
    if (mealType === 'breakfast') {
      icon = '🥞';
      title = 'Breakfast Menus';
      hoursPill = '7:00 AM – 10:30 AM (Varies by location)';
    } else if (mealType === 'dinner') {
      icon = '🌙';
      title = 'Dinner Menus';
      hoursPill = '4:30 PM – 9:00 PM (Varies by location)';
    }

    sec.innerHTML = `
      <div class="meal-split-header ${mealType}-header">
        <div class="meal-header-title">
          <span class="meal-header-icon">${icon}</span>
          <span class="meal-header-text">${title}</span>
          <span class="meal-header-day">• ${day}</span>
        </div>
        <span class="meal-header-pill">${hoursPill}</span>
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
      activeDayHeading.textContent = 'All Days (Monday – Sunday)';
      activeTodayBadge.style.display = 'none';
      if (activeDaySubtitle) {
        activeDaySubtitle.innerHTML = `Showing complete menus for <strong>all 7 days</strong> across campus dining locations`;
      }

      if (splitMenusContainer) {
        splitMenusContainer.innerHTML = '';
        const days = menuData.days_order || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        days.forEach(d => {
          const isToday = d.toLowerCase() === todayDayName.toLowerCase();
          const isWeekend = d === 'Saturday' || d === 'Sunday';

          const daySec = document.createElement('div');
          daySec.className = 'day-group-section';
          daySec.id = `day-group-${d.toLowerCase()}`;

          const header = document.createElement('div');
          header.className = 'day-group-header';
          header.innerHTML = `
            <div class="day-group-title">
              <h3>📅 ${d}</h3>
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
    activeDayHeading.textContent = day;
    const isToday = day.toLowerCase() === todayDayName.toLowerCase();
    activeTodayBadge.style.display = isToday ? 'inline-block' : 'none';
    if (activeDaySubtitle) {
      activeDaySubtitle.innerHTML = `Split into dedicated <strong>🥞 Breakfast</strong>, <strong>☀️ Lunch</strong>, and <strong>🌙 Dinner</strong> cards across all 3 dining locations`;
    }

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
          <span class="venue-icon">${loc.icon}</span>
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
      subNotice.textContent = `ℹ️ ${locData.note}`;
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
        li.dataset.dishName = item.name.toLowerCase();
        li.dataset.tags = (item.tags || []).join(',');

        let tagsHtml = '';
        if (item.tags && item.tags.length > 0) {
          tagsHtml = item.tags.map(tag => {
            if (tag === 'vegan') return `<span class="dietary-tag tag-vegan" title="Vegan">🌱 Vegan</span>`;
            if (tag === 'vegetarian') return `<span class="dietary-tag tag-vegetarian" title="Vegetarian">🥗 Veg</span>`;
            if (tag === 'seafood') return `<span class="dietary-tag tag-seafood" title="Seafood">🐟 Seafood</span>`;
            if (tag === 'poultry') return `<span class="dietary-tag tag-poultry" title="Poultry">🍗 Poultry</span>`;
            if (tag === 'meat') return `<span class="dietary-tag tag-meat" title="Meat">🥩 Meat</span>`;
            return '';
          }).join('');
        }

        li.innerHTML = `
          <span class="dish-name">${escapeHtml(item.name)}</span>
          <div class="dish-tags">${tagsHtml}</div>
        `;
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

  // =========================================================================
  // Filtering & Highlighting
  // =========================================================================
  function applyFiltersAndHighlights() {
    const cards = document.querySelectorAll('.split-location-card');
    let totalMatches = 0;
    const hasSearch = currentSearchQuery.length > 0;
    const hasDietary = activeDietaryTags.size > 0;

    cards.forEach(card => {
      let cardHasSearchMatch = false;
      const dishItems = card.querySelectorAll('.dish-item');

      dishItems.forEach(item => {
        const dishName = item.dataset.dishName;
        const tags = item.dataset.tags ? item.dataset.tags.split(',') : [];

        // Search match
        if (hasSearch) {
          if (dishName.includes(currentSearchQuery)) {
            item.classList.add('search-match');
            cardHasSearchMatch = true;
            totalMatches++;
          } else {
            item.classList.remove('search-match');
          }
        } else {
          item.classList.remove('search-match');
        }

        // Dietary match
        if (hasDietary) {
          const hasAnySelectedTag = Array.from(activeDietaryTags).some(t => tags.includes(t));
          if (hasAnySelectedTag) {
            item.classList.add('diet-match');
          } else {
            item.classList.remove('diet-match');
          }
        } else {
          item.classList.remove('diet-match');
        }
      });

      if (hasSearch) {
        if (!cardHasSearchMatch) {
          card.classList.add('dimmed');
        } else {
          card.classList.remove('dimmed');
        }
      } else {
        card.classList.remove('dimmed');
      }
    });

    if (activeDay === 'all') {
      document.querySelectorAll('.day-group-section').forEach(sec => {
        const hasCardMatch = sec.querySelectorAll('.split-location-card:not(.dimmed)').length > 0;
        if (hasSearch && !hasCardMatch) {
          sec.classList.add('dimmed-day');
        } else {
          sec.classList.remove('dimmed-day');
        }
      });
    }

    if (hasSearch) {
      searchMatchCount.style.display = 'block';
      const scopeText = activeDay === 'all' ? 'across the week' : 'today';
      searchMatchCount.textContent = `${totalMatches} ${totalMatches === 1 ? 'dish' : 'dishes'} found ${scopeText}`;
    } else {
      searchMatchCount.style.display = 'none';
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
