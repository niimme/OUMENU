/**
 * OU Dining Menus - Minimalist React Application
 * University of Oklahoma Housing & Food Services
 * Styled with modern, minimalist Sooner athletics aesthetic (soonersports.evenue.net)
 */

const { useState, useEffect, useMemo } = React;

const LOCATIONS_META = [
  {
    key: 'residential_colleges',
    name: 'Residential Colleges',
    sub: 'Headington & Dunham Colleges',
    hoursBreakfast: '8:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 2:00 PM',
    hoursDinner: '4:30 PM – 8:00 PM (M–F) • 4:00 PM – 7:00 PM (Weekends)',
    hoursDinnerWeekday: '4:30 PM – 8:00 PM',
    hoursDinnerWeekend: '4:00 PM – 7:00 PM'
  },
  {
    key: 'couch_restaurants',
    name: 'Couch Restaurants',
    sub: 'Couch Center',
    hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 2:30 PM',
    hoursDinner: '4:30 PM – 8:00 PM (M–F) • 4:00 PM – 7:00 PM (Weekends)',
    hoursDinnerWeekday: '4:30 PM – 8:00 PM',
    hoursDinnerWeekend: '4:00 PM – 7:00 PM'
  },
  {
    key: 'wagner_dining_hall',
    name: 'Wagner Dining Hall',
    sub: 'Headington Hall',
    hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 1:30 PM',
    hoursDinner: '4:30 PM – 8:00 PM (Sun–Thu)'
  }
];

const MEALS = [
  { key: 'all', label: 'All Meals' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' }
];

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
  if (totalMinutes < 10 * 60 + 30) return 'breakfast';
  if (totalMinutes < 15 * 60) return 'lunch';
  return 'dinner';
}

function getTodayName() {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'long'
    }).format(new Date());
  } catch (e) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  }
}

function computeDayDates(weekInfo) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let baseDate = null;
  if (weekInfo) {
    const match = weekInfo.match(/([A-Za-z]+)\s+(\d{1,2})/);
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

  const map = {};
  days.forEach((d, idx) => {
    const target = new Date(baseDate);
    target.setDate(baseDate.getDate() + idx);
    const m = target.getMonth() + 1;
    const day = target.getDate();
    const monthShort = target.toLocaleString('en-US', { month: 'short' });
    map[d] = {
      short: `${monthShort.slice(0, 3)} ${day}`,
      full: `${monthShort} ${day}`
    };
  });
  return map;
}

// Official Oklahoma Sooners Interlocking OU Logo
function OuLogo({ className = "ou-logo-svg" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 194 250"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="University of Oklahoma"
    >
      <g transform="matrix(1.25 0 0 -1.25 -775.87 1678.6)">
        <path
          d="m661.27 1232.3v47.009h34.063v-47.009l5.7807 5.3895v63.809l-6.8661 6.4048h-31.891l-6.8676-6.4048v-63.809l5.7807-5.3895zm30.759-88.883-30.759 28.683v25.122h-9.0861l-30.759 28.683v87.381l30.759 28.683h52.237l30.759-28.683v-87.381l-30.759-28.683h-9.0876v-13.335l6.8676-6.4048h31.893l6.8661 6.4048v95.422h34.065v-107.21l-30.758-28.683h-52.237z"
          fill="#ffffff"
        />
        <path
          d="m695.33 1310.7 8.5367-7.9619v-66.205l-8.5367-7.9604h-2.756v48.022h-28.553v-48.022h-2.753l-8.5382 7.9604v66.205l8.5382 7.9619h34.062zm48.382-34.105v-93.865l-8.5382-7.9619h-34.063l-8.5367 7.9619v17.29h10.757l29.09 27.124v84.985l-29.09 27.126h-50.066l-29.089-27.126v-84.985l29.089-27.124h10.757v-26.679l29.09-27.127h50.065l29.089 27.127v103.25h-28.553z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

function StationGroup({ station }) {
  if (
    station.title.includes('Everyday Classics') ||
    station.title.includes('Daily Restaurant Stations')
  ) {
    return null;
  }

  return (
    <div className="station-group">
      <div className="station-title">{station.title}</div>
      <ul className="dish-list">
        {station.items.map((item, idx) => (
          <li key={idx} className="dish-item">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LocationCard({ loc, mealType, day, locData }) {
  const isOpen = locData && locData.available;
  const isWeekend = day === 'Saturday' || day === 'Sunday';

  let hours = loc.hoursLunch;
  if (mealType === 'breakfast') {
    hours = loc.hoursBreakfast;
  } else if (mealType === 'dinner') {
    if (loc.hoursDinnerWeekend && isWeekend) {
      hours = loc.hoursDinnerWeekend;
    } else if (loc.hoursDinnerWeekday && !isWeekend) {
      hours = loc.hoursDinnerWeekday;
    } else {
      hours = loc.hoursDinner;
    }
  }

  const validStations = useMemo(() => {
    if (!locData || !locData.stations) return [];
    return locData.stations.filter(
      s => !s.title.includes('Everyday Classics') && !s.title.includes('Daily Restaurant Stations')
    );
  }, [locData]);

  return (
    <div className={`location-card ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="location-card-header">
        <div className="location-identity">
          <h4 className="location-title">{loc.name}</h4>
          <p className="location-sub">{loc.sub}</p>
        </div>
        <span className={`status-tag ${isOpen ? 'status-open' : 'status-closed'}`}>
          <span className="status-dot" />
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="location-hours">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{hours}</span>
      </div>

      <div className="location-menu-body">
        {!isOpen ? (
          <div className="notice-closed">
            {locData?.note || 'Closed for this meal period'}
          </div>
        ) : (
          <>
            {locData?.note && (
              <div className="notice-note">{locData.note}</div>
            )}
            {validStations.length === 0 ? (
              <div className="notice-empty">No menu items published</div>
            ) : (
              validStations.map((station, sIdx) => (
                <StationGroup key={sIdx} station={station} />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MealSection({ day, dateInfo, mealType, rowData }) {
  const mealTitles = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
  };

  return (
    <section className="meal-section">
      <div className="meal-section-header">
        <h3 className="meal-section-title">{mealTitles[mealType]}</h3>
        <span className="meal-section-meta">
          {day}{dateInfo ? ` • ${dateInfo.full}` : ''}
        </span>
      </div>
      <div className="location-grid">
        {LOCATIONS_META.map(loc => {
          const locData = rowData ? rowData.locations[loc.key] : null;
          return (
            <LocationCard
              key={loc.key}
              loc={loc}
              mealType={mealType}
              day={day}
              locData={locData}
            />
          );
        })}
      </div>
    </section>
  );
}

function App() {
  const [menuData, setMenuData] = useState(null);
  const [liveWeekInfo, setLiveWeekInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedFile, setSelectedFile] = useState('data/menu_data.json');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const today = useMemo(() => getTodayName(), []);
  const [activeDay, setActiveDay] = useState(today);
  const [activeMeal, setActiveMeal] = useState(() => getCurrentMealByTime());

  // Load history index
  useEffect(() => {
    fetch(`data/history/index.json?v=${Date.now()}`, { cache: 'no-cache' })
      .then(res => res.ok ? res.json() : [])
      .then(list => setHistoryList(Array.isArray(list) ? list : []))
      .catch(() => setHistoryList([]));
  }, []);

  // Fetch chosen menu file (current or archived week)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetch(`${selectedFile}?v=${Date.now()}`, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setMenuData(data);
          setLoading(false);
          // If this is the current live menu, lock in liveWeekInfo
          if (selectedFile === 'data/menu_data.json' && data.week_info) {
            setLiveWeekInfo(data.week_info);
          }
          if (data.days_order && !data.days_order.includes(today)) {
            setActiveDay('Monday');
          }
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFile, today]);


  // Close drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dayDates = useMemo(() => {
    return computeDayDates(menuData?.week_info);
  }, [menuData?.week_info]);

  const daysOrder = menuData?.days_order || [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const visibleDays = useMemo(() => {
    if (activeDay === 'all') return daysOrder;
    return [activeDay];
  }, [activeDay, daysOrder]);

  const visibleMeals = useMemo(() => {
    if (activeMeal === 'all') return ['breakfast', 'lunch', 'dinner'];
    return [activeMeal];
  }, [activeMeal]);

  // Determine current live week title
  const currentWeekTitle = liveWeekInfo || (selectedFile === 'data/menu_data.json' ? menuData?.week_info : '') || 'Live Week';

  // Filter historyList to ONLY show true past weeks (excluding the current live week)
  const pastWeeks = useMemo(() => {
    const normLive = (currentWeekTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return historyList.filter((item) => {
      if (!item) return false;
      if (item.path === 'data/menu_data.json') return false;
      const normItem = (item.week_info || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normLive && normItem === normLive) return false;
      return true;
    });
  }, [historyList, currentWeekTitle]);

  const isLive = selectedFile === 'data/menu_data.json';

  return (
    <div className="app-shell">
      {/* 1. Sleek Minimalist Top Navbar (inspired by soonersports.evenue.net) */}
      <header className="navbar-minimal">
        <div className="navbar-inner">
          <div className="navbar-left">
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              title="Menu"
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>

            <div
              className="brand-link"
              onClick={() => setSelectedFile('data/menu_data.json')}
              role="button"
              tabIndex={0}
            >
              <div className="navbar-ou-logo-wrap">
                <OuLogo className="navbar-ou-logo" />
              </div>
              <div className="brand-headings">
                <span className="brand-name">OU DINING</span>
                <span className="brand-subname">HOUSING &amp; FOOD</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Slide-out Navigation Drawer */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-brand">
                <div className="drawer-ou-logo-wrap">
                  <OuLogo className="drawer-logo" />
                </div>
                <div>
                  <h3 className="drawer-title">OU Dining Menus</h3>
                  <p className="drawer-sub">The University of Oklahoma</p>
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {/* Select Menu Week Dropdown inside Drawer */}
              <div className="drawer-section">
                <div className="drawer-section-title">Select Menu Week</div>
                <div className="drawer-week-selector-wrap">
                  <select
                    className="drawer-week-select"
                    value={selectedFile}
                    onChange={(e) => {
                      setSelectedFile(e.target.value);
                      setDrawerOpen(false);
                    }}
                    aria-label="Select menu week"
                  >
                    <option value="data/menu_data.json">
                      Current: {currentWeekTitle}
                    </option>
                    {pastWeeks.map((item) => (
                      <option key={item.filename} value={item.path}>
                        Past: {item.week_info}
                      </option>
                    ))}
                  </select>
                  <span className="drawer-select-chevron" aria-hidden="true">▾</span>
                </div>
                <div className="drawer-week-status">
                  <span className={`status-pill ${isLive ? 'status-pill-live' : 'status-pill-archive'}`}>
                    <span className="status-indicator-dot" />
                    {isLive ? 'Viewing Live Menus' : 'Viewing Archived Week'}
                  </span>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">Dining Hall Locations</div>
                <div className="drawer-info-card">
                  <strong>Residential Colleges</strong>
                  <p>Headington &amp; Dunham Colleges</p>
                  <span className="drawer-hours-badge">Lunch: 11am–2pm • Dinner: 4:30pm–8pm (7pm wknd)</span>
                </div>
                <div className="drawer-info-card">
                  <strong>Couch Restaurants</strong>
                  <p>Couch Center (Tower Cafeteria)</p>
                  <span className="drawer-hours-badge">Breakfast • Lunch: 11am–2:30pm • Dinner: 4:30pm–8pm (7pm wknd)</span>
                </div>
                <div className="drawer-info-card">
                  <strong>Wagner Dining Hall</strong>
                  <p>Headington Hall</p>
                  <span className="drawer-hours-badge">Breakfast: 7am–10:30am • Lunch: 11am–1:30pm • Dinner: 4:30pm–8pm</span>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">Official Links</div>
                <a
                  href="https://www.ou.edu/housingandfood/dining"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-ext-link"
                >
                  <span>OU Dining &amp; Catering Website</span>
                  <span>↗</span>
                </a>
                <a
                  href="https://www.ou.edu/housingandfood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-ext-link"
                >
                  <span>Housing &amp; Food Services</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Minimalist Hero Container (styled after soonersports.evenue.net) */}
      <main className="main-wrapper">
        <div className="hero-card-container">
          {/* Deep Crimson Header Card */}
          <div className="hero-crimson-card">
            <p className="hero-crimson-sub">
              Housing &amp; Food Services • University of Oklahoma
            </p>
            <h1 className="hero-crimson-title">Campus Dining Menus</h1>
            <div className="hero-crimson-meta">
              <span>{menuData?.week_info || currentWeekTitle}</span>
              <span className="meta-sep">•</span>
              <span>Residential Colleges • Couch • Wagner</span>
            </div>
          </div>

          {/* Clean White Card Body */}
          <div className="hero-white-body">
            <div className="body-heading-row">
              <div>
                <h2 className="body-section-title">Select Dining Menus</h2>
                <p className="body-section-subtitle">
                  Choose a day and meal period to view current station offerings.
                </p>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="minimal-filter-controls">
              {/* Day Pills Bar */}
              <div className="day-pills-scroll">
                <button
                  type="button"
                  className={`day-pill-btn ${activeDay === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActiveDay('all')}
                >
                  All Days
                </button>
                {daysOrder.map((day) => {
                  const isToday = day.toLowerCase() === today.toLowerCase();
                  const dInfo = dayDates[day];
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`day-pill-btn ${activeDay === day ? 'is-active' : ''}`}
                      onClick={() => setActiveDay(day)}
                    >
                      <span>{day.slice(0, 3)}</span>
                      {dInfo && <span className="pill-date">{dInfo.short.split(' ')[1]}</span>}
                      {isToday && <span className="pill-today-dot" title="Today" />}
                    </button>
                  );
                })}
              </div>

              {/* Meal Pills Bar */}
              <div className="meal-pills-bar">
                {MEALS.map((meal) => (
                  <button
                    key={meal.key}
                    type="button"
                    className={`meal-pill-btn ${activeMeal === meal.key ? 'is-active' : ''}`}
                    onClick={() => setActiveMeal(meal.key)}
                  >
                    {meal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menus Content */}
            <div className="menus-content-area">
              {loading && (
                <div className="state-notice">
                  <div className="loading-spinner" />
                  <p>Loading dining menus...</p>
                </div>
              )}

              {error && (
                <div className="state-notice error">
                  <p>Unable to load dining menu data.</p>
                  <p className="notice-sub">Please verify data/menu_data.json exists.</p>
                </div>
              )}

              {!loading && !error && menuData && (
                <div className="menus-flow">
                  {visibleDays.map((day) => {
                    const isToday = day.toLowerCase() === today.toLowerCase();
                    const dateInfo = dayDates[day];

                    return (
                      <div key={day} className="day-block">
                        {activeDay === 'all' && (
                          <div className="day-block-header">
                            <div className="day-heading-wrap">
                              <h3 className="day-heading">{day}</h3>
                              {dateInfo && <span className="day-heading-date">• {dateInfo.full}</span>}
                              {isToday && <span className="today-badge">Today</span>}
                            </div>
                          </div>
                        )}

                        {visibleMeals.map((mealType) => {
                          const rowData = menuData.rows.find(
                            (r) => r.day === day && r.meal === mealType
                          );
                          return (
                            <MealSection
                              key={`${day}-${mealType}`}
                              day={day}
                              dateInfo={dateInfo}
                              mealType={mealType}
                              rowData={rowData}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Minimalist Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-copy">
            University of Oklahoma Housing &amp; Food Services • Menus subject to change
          </p>
          <div className="footer-links">
            <a
              href="https://www.ou.edu/housingandfood/dining"
              target="_blank"
              rel="noopener noreferrer"
            >
              Official Dining
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
