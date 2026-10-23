/**
 * OU Dining Menus - Minimalist React Application
 * University of Oklahoma Housing & Food Services
 */

const { useState, useEffect, useMemo } = React;

const LOCATIONS_META = [
  {
    key: 'residential_colleges',
    name: 'Residential Colleges',
    sub: 'Headington & Dunham Colleges',
    hoursBreakfast: '8:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 2:00 PM',
    hoursDinner: '4:30 PM – 8:00 PM'
  },
  {
    key: 'couch_restaurants',
    name: 'Couch Restaurants',
    sub: 'Couch Center',
    hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 2:30 PM',
    hoursDinner: '4:30 PM – 8:00 PM'
  },
  {
    key: 'wagner_dining_hall',
    name: 'Wagner Dining Hall',
    sub: 'Headington Hall (Athletics)',
    hoursBreakfast: '7:00 AM – 10:30 AM (M–F)',
    hoursLunch: '11:00 AM – 1:30 PM',
    hoursDinner: '5:00 PM – 8:00 PM (Sun–Thu)'
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

function LocationCard({ loc, mealType, locData }) {
  const isOpen = locData && locData.available;
  let hours = loc.hoursLunch;
  if (mealType === 'breakfast') hours = loc.hoursBreakfast;
  else if (mealType === 'dinner') hours = loc.hoursDinner;

  const validStations = useMemo(() => {
    if (!locData || !locData.stations) return [];
    return locData.stations.filter(
      s => !s.title.includes('Everyday Classics') && !s.title.includes('Daily Restaurant Stations')
    );
  }, [locData]);

  return (
    <div className={`location-card ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="location-card-header">
        <div>
          <h4 className="location-title">{loc.name}</h4>
          <p className="location-sub">{loc.sub}</p>
        </div>
        <span className={`status-tag ${isOpen ? 'status-open' : 'status-closed'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="location-hours">{hours}</div>

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedFile, setSelectedFile] = useState('data/menu_data.json');

  const today = useMemo(() => getTodayName(), []);
  const [activeDay, setActiveDay] = useState(today);
  const [activeMeal, setActiveMeal] = useState(() => getCurrentMealByTime());
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dayDates = useMemo(() => {
    return computeDayDates(menuData?.week_info);
  }, [menuData?.week_info]);

  const daysOrder = menuData?.days_order || [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const visibleDays = activeDay === 'all' ? daysOrder : [activeDay];
  const visibleMeals = activeMeal === 'all' ? ['breakfast', 'lunch', 'dinner'] : [activeMeal];

  return (
    <div className="app-shell">
      {/* Official OU Top Utility Bar */}
      <div className="ou-global-bar">
        <div className="ou-global-inner">
          <div className="ou-global-links">
            <a href="https://www.ou.edu" target="_blank" rel="noopener noreferrer" className="ou-global-link" title="OU Home">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span>OU.EDU</span>
            </a>
            <span className="ou-global-sep">|</span>
            <a href="https://www.ou.edu/housingandfood" target="_blank" rel="noopener noreferrer" className="ou-global-link">
              Housing &amp; Food
            </a>
          </div>
          <div className="ou-wordmark-text">
            The UNIVERSITY <em>of</em> OKLAHOMA
          </div>
        </div>
      </div>

      {/* Main OU Department Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-lockup">
            <div className="ou-monogram-shield">
              <span className="ou-monogram-text">OU</span>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">HOUSING &amp; FOOD SERVICES</h1>
              <p className="brand-sub">The UNIVERSITY <em>of</em> OKLAHOMA</p>
            </div>
          </div>
          <div className="header-badge-group">
            <span className="brand-badge">
              {selectedFile === 'data/menu_data.json' ? 'LIVE DINING MENUS' : 'ARCHIVED MENU'}
            </span>
            {historyList.length > 0 ? (
              <div className="week-selector-wrap">
                <select
                  className="week-select"
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  aria-label="Select menu week"
                >
                  <option value="data/menu_data.json">
                    Current: {menuData?.week_info || 'Live Week'}
                  </option>
                  {historyList
                    .filter((h) => h.path !== 'data/menu_data.json')
                    .map((item) => (
                      <option key={item.filename} value={item.path}>
                        Past: {item.week_info}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              menuData?.week_info && <span className="week-pill">{menuData.week_info}</span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner with Official Theme */}
      <section className="hero-banner">
        <div className="hero-inner">
          <h2 className="hero-heading">CAMPUS DINING MENUS</h2>
          <p className="hero-subtitle">
            Residential Colleges • Couch Restaurants • Wagner Dining Hall
          </p>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="filter-bar">
        <div className="filter-inner">
          {/* Day Selector */}
          <div className="day-tabs-scroll">
            <div className="segmented-group">
              <button
                type="button"
                className={`tab-btn ${activeDay === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveDay('all')}
              >
                All Days
              </button>
              {daysOrder.map(day => {
                const isToday = day.toLowerCase() === today.toLowerCase();
                const dInfo = dayDates[day];
                return (
                  <button
                    key={day}
                    type="button"
                    className={`tab-btn ${activeDay === day ? 'is-active' : ''}`}
                    onClick={() => setActiveDay(day)}
                  >
                    <span>{day.slice(0, 3)}</span>
                    {dInfo && <span className="tab-date">{dInfo.short.split(' ')[1]}</span>}
                    {isToday && <span className="today-dot" title="Today" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meal Filter */}
          <div className="meal-filter-group">
            <div className="segmented-group">
              {MEALS.map(meal => (
                <button
                  key={meal.key}
                  type="button"
                  className={`tab-btn ${activeMeal === meal.key ? 'is-active' : ''}`}
                  onClick={() => setActiveMeal(meal.key)}
                >
                  {meal.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="content-container">
        {loading && (
          <div className="state-notice">
            <div className="loading-spinner" />
            <p>Loading current menus...</p>
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
            {visibleDays.map(day => {
              const isToday = day.toLowerCase() === today.toLowerCase();
              const dateInfo = dayDates[day];

              return (
                <div key={day} className="day-block">
                  {activeDay === 'all' && (
                    <div className="day-block-header">
                      <div className="day-heading-wrap">
                        <h2 className="day-heading">{day}</h2>
                        {dateInfo && <span className="day-heading-date">• {dateInfo.full}</span>}
                        {isToday && <span className="today-pill">Today</span>}
                      </div>
                    </div>
                  )}

                  {visibleMeals.map(mealType => {
                    const rowData = menuData.rows.find(
                      r => r.day === day && r.meal === mealType
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
      </main>

      {/* Minimal Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <p className="footer-copy">
            University of Oklahoma Housing & Food Services • Menus subject to change
          </p>
          <div className="footer-links">
            <a
              href="https://www.ou.edu/housingandfood/dining"
              target="_blank"
              rel="noopener noreferrer"
            >
              Official Dining
            </a>
            <span>•</span>
            <a
              href="https://github.com/niimme/OUMENU"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </div>
        </div>
      </footer>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
