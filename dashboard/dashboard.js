/**
 * Coding Profile Dashboard
 * Modular, isolated implementation using IIFE pattern
 */
const CodingDashboard = (() => {
  // Configuration - UPDATE THIS URL after deploying backend
  const CONFIG = {
    API_BASE: 'https://coding-profile-backend-1.onrender.com/api',
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  };

  // Platform configurations
  const PLATFORMS = {
    leetcode: {
      name: 'LeetCode',
      icon: '⚡',
      color: '#ffa116',
      hasDifficulty: true
    },
    codeforces: {
      name: 'Codeforces',
      icon: '🏆',
      color: '#1890ff',
      hasRating: true
    },
    codechef: {
      name: 'CodeChef',
      icon: '👨‍🍳',
      color: '#5b4638',
      hasRating: true,
      hasStars: true
    },
    geeksforgeeks: {
      name: 'GeeksforGeeks',
      icon: '🌿',
      color: '#2f8d46',
      hasDifficulty: true
    }
  };

  // State
  let statsData = null;
  let heatmapData = null;
  let tooltip = null;

  /**
   * Initialize the dashboard
   */
  const init = async () => {
    console.log('🚀 Initializing Coding Profile Dashboard...');

    createTooltip();

    try {
      // Fetch data in parallel
      const [stats, heatmap] = await Promise.all([
        fetchStats(),
        fetchHeatmap()
      ]);

      statsData = stats;
      heatmapData = heatmap;

      render();
      console.log('✅ Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      renderError(error.message);
    }
  };

  /**
   * Fetch statistics from API
   */
  const fetchStats = async () => {
    const response = await fetch(`${CONFIG.API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    const data = await response.json();
    return data.data;
  };

  /**
   * Fetch heatmap data from API
   */
  const fetchHeatmap = async () => {
    const response = await fetch(`${CONFIG.API_BASE}/heatmap`);
    if (!response.ok) throw new Error('Failed to fetch heatmap data');
    const data = await response.json();
    return data.data;
  };

  /**
   * Create tooltip element
   */
  const createTooltip = () => {
    tooltip = document.createElement('div');
    tooltip.className = 'cpd-tooltip';
    document.body.appendChild(tooltip);
  };

  /**
   * Show tooltip
   */
  const showTooltip = (event, content) => {
    tooltip.innerHTML = content;
    tooltip.classList.add('visible');

    const x = event.clientX + 10;
    const y = event.clientY + 10;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  };

  /**
   * Hide tooltip
   */
  const hideTooltip = () => {
    tooltip.classList.remove('visible');
  };

  /**
   * Main render function
   */
  const render = () => {
    const root = document.getElementById('cpd-root');
    if (!root) return;

    root.innerHTML = `
      ${renderStatsGrid()}
      ${renderChartsSection()}
      ${renderHeatmapSection()}
    `;

    // Initialize charts after DOM is ready
    setTimeout(initCharts, 100);
  };

  /**
   * Render platform stats cards
   */
  const renderStatsGrid = () => {
    if (!statsData) return '<p class="cpd-loading">Loading statistics...</p>';

    const cards = Object.entries(PLATFORMS).map(([key, platform]) => {
      const data = statsData[key];
      if (!data) return '';

      return renderPlatformCard(key, platform, data);
    }).join('');

    return `<div class="cpd-stats-grid">${cards}</div>`;
  };

  /**
   * Render individual platform card
   */
  const renderPlatformCard = (key, platform, data) => {
    const statusClass = data.fetchStatus || 'success';

    let difficultyBar = '';
    if (platform.hasDifficulty && data.easySolved !== undefined) {
      const total = (data.easySolved || 0) + (data.mediumSolved || 0) + (data.hardSolved || 0);
      const easyPct = total ? ((data.easySolved / total) * 100) : 0;
      const mediumPct = total ? ((data.mediumSolved / total) * 100) : 0;
      const hardPct = total ? ((data.hardSolved / total) * 100) : 0;

      difficultyBar = `
        <div class="cpd-difficulty-bar">
          <div class="cpd-difficulty-segment easy" style="width: ${easyPct}%"></div>
          <div class="cpd-difficulty-segment medium" style="width: ${mediumPct}%"></div>
          <div class="cpd-difficulty-segment hard" style="width: ${hardPct}%"></div>
        </div>
        <div class="cpd-difficulty-labels">
          <span><span class="cpd-difficulty-dot easy"></span> Easy: ${data.easySolved || 0}</span>
          <span><span class="cpd-difficulty-dot medium"></span> Medium: ${data.mediumSolved || 0}</span>
          <span><span class="cpd-difficulty-dot hard"></span> Hard: ${data.hardSolved || 0}</span>
        </div>
      `;
    }

    let ratingInfo = '';
    if (platform.hasRating && data.rating) {
      ratingInfo = `
        <div class="cpd-rating-info">
          <div>
            <span class="cpd-rating-value">${data.rating}</span>
            ${data.maxRating ? `<span style="color:#888; font-size:0.8rem"> / ${data.maxRating} max</span>` : ''}
          </div>
          ${data.rank ? `<span class="cpd-rating-rank">${data.rank}</span>` : ''}
          ${platform.hasStars && data.stars ? `<span class="cpd-rating-rank">${'★'.repeat(data.stars)}</span>` : ''}
        </div>
      `;
    }

    return `
      <div class="cpd-platform-card">
        <div class="cpd-platform-header">
          <div class="cpd-platform-icon ${key}">${platform.icon}</div>
          <div>
            <h3 class="cpd-platform-name">
              ${platform.name}
              <span class="cpd-status-indicator ${statusClass}" title="${statusClass}"></span>
            </h3>
          </div>
        </div>
        <div class="cpd-stats-main">
          <span class="cpd-stats-number">${data.totalSolved || 0}</span>
          <span class="cpd-stats-label">problems solved</span>
        </div>
        ${difficultyBar}
        ${ratingInfo}
      </div>
    `;
  };

  /**
   * Render charts section
   */
  const renderChartsSection = () => {
    return `
      <div class="cpd-charts-section">
        <h3 class="cpd-section-title">📊 Statistics Overview</h3>
        <div class="cpd-charts-grid">
          <div class="cpd-chart-card">
            <div class="cpd-chart-title">Problems Solved by Platform</div>
            <div class="cpd-chart-wrapper">
              <canvas id="cpd-platform-chart"></canvas>
            </div>
          </div>
          <div class="cpd-chart-card">
            <div class="cpd-chart-title">Rating Comparison</div>
            <div class="cpd-chart-wrapper">
              <canvas id="cpd-rating-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Render heatmap section
   */
  const renderHeatmapSection = () => {
    if (!heatmapData || heatmapData.length === 0) {
      return `
        <div class="cpd-heatmap-section">
          <div class="cpd-heatmap-container">
            <p class="cpd-loading">No activity data available yet.</p>
          </div>
        </div>
      `;
    }

    // Calculate statistics
    const totalContributions = heatmapData.reduce((sum, d) => sum + d.count, 0);
    const activeDays = heatmapData.filter(d => d.count > 0).length;

    // Build heatmap grid
    const heatmapGrid = buildHeatmapGrid(heatmapData);

    return `
      <div class="cpd-heatmap-section">
        <div class="cpd-heatmap-container">
          <div class="cpd-heatmap-header">
            <h3 class="cpd-heatmap-title">📅 Coding Activity</h3>
            <div class="cpd-heatmap-stats">
              <span><strong>${totalContributions}</strong> submissions</span>
              <span><strong>${activeDays}</strong> active days</span>
            </div>
          </div>
          ${heatmapGrid}
          <div class="cpd-heatmap-legend">
            <span>Less</span>
            <div class="cpd-legend-cell" style="background:#161b22"></div>
            <div class="cpd-legend-cell" style="background:#0e4429"></div>
            <div class="cpd-legend-cell" style="background:#006d32"></div>
            <div class="cpd-legend-cell" style="background:#26a641"></div>
            <div class="cpd-legend-cell" style="background:#39d353"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Build heatmap grid structure
   */
  const buildHeatmapGrid = (data) => {
    // Create a map of date to data
    const dateMap = {};
    data.forEach(d => {
      dateMap[d.date] = d;
    });

    // Generate last 365 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);

    // Get the day of week for start date (0 = Sunday)
    const startDay = startDate.getDay();

    // Build weeks array
    const weeks = [];
    let currentWeek = [];

    // Add empty cells for days before start
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    // Add all days
    let current = new Date(startDate);
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const dayData = dateMap[dateStr] || { date: dateStr, count: 0, level: 0 };
      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Generate months header
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthsHtml = '<div class="cpd-heatmap-months">';
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const validDay = week.find(d => d !== null);
      if (validDay) {
        const month = new Date(validDay.date).getMonth();
        if (month !== lastMonth) {
          monthsHtml += `<span class="cpd-heatmap-month">${months[month]}</span>`;
          lastMonth = month;
        }
      }
    });
    monthsHtml += '</div>';

    // Generate grid
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let gridHtml = '<div class="cpd-heatmap-grid">';
    gridHtml += monthsHtml;

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      gridHtml += '<div class="cpd-heatmap-row">';
      gridHtml += `<span class="cpd-heatmap-day-label">${dayIndex % 2 === 1 ? days[dayIndex] : ''}</span>`;
      gridHtml += '<div class="cpd-heatmap-cells">';

      weeks.forEach(week => {
        const day = week[dayIndex];
        if (day === null) {
          gridHtml += '<div class="cpd-heatmap-cell" style="visibility:hidden"></div>';
        } else {
          gridHtml += `<div class="cpd-heatmap-cell" data-level="${day.level}" data-date="${day.date}" data-count="${day.count}"></div>`;
        }
      });

      gridHtml += '</div></div>';
    }

    gridHtml += '</div>';

    // Add event listeners after DOM update
    setTimeout(() => {
      document.querySelectorAll('.cpd-heatmap-cell[data-date]').forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
          const date = e.target.dataset.date;
          const count = e.target.dataset.count;
          const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          showTooltip(e, `<strong>${count}</strong> submissions on ${formattedDate}`);
        });
        cell.addEventListener('mouseleave', hideTooltip);
      });
    }, 100);

    return gridHtml;
  };

  /**
   * Initialize Chart.js charts
   */
  const initCharts = () => {
    if (!statsData || typeof Chart === 'undefined') return;

    // Platform problems chart
    const platformCtx = document.getElementById('cpd-platform-chart');
    if (platformCtx) {
      new Chart(platformCtx, {
        type: 'doughnut',
        data: {
          labels: Object.values(PLATFORMS).map(p => p.name),
          datasets: [{
            data: Object.keys(PLATFORMS).map(k => statsData[k]?.totalSolved || 0),
            backgroundColor: ['#ffa116', '#1890ff', '#5b4638', '#2f8d46'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#aaa', padding: 15 }
            }
          }
        }
      });
    }

    // Rating comparison chart
    const ratingCtx = document.getElementById('cpd-rating-chart');
    if (ratingCtx) {
      const ratingsData = {
        labels: [],
        data: [],
        colors: []
      };

      if (statsData.leetcode?.rating) {
        ratingsData.labels.push('LeetCode');
        ratingsData.data.push(statsData.leetcode.rating);
        ratingsData.colors.push('#ffa116');
      }
      if (statsData.codeforces?.rating) {
        ratingsData.labels.push('Codeforces');
        ratingsData.data.push(statsData.codeforces.rating);
        ratingsData.colors.push('#1890ff');
      }
      if (statsData.codechef?.rating) {
        ratingsData.labels.push('CodeChef');
        ratingsData.data.push(statsData.codechef.rating);
        ratingsData.colors.push('#5b4638');
      }

      new Chart(ratingCtx, {
        type: 'bar',
        data: {
          labels: ratingsData.labels,
          datasets: [{
            label: 'Current Rating',
            data: ratingsData.data,
            backgroundColor: ratingsData.colors,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#333' },
              ticks: { color: '#aaa' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#aaa' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  };

  /**
   * Render error state
   */
  const renderError = (message) => {
    const root = document.getElementById('cpd-root');
    if (!root) return;

    root.innerHTML = `
      <div class="cpd-error">
        <p>⚠️ Unable to load coding statistics</p>
        <p style="font-size:0.85rem; margin-top:10px;">${message}</p>
        <p style="font-size:0.8rem; color:#888; margin-top:15px;">
          The backend server might be starting up. Please refresh in a minute.
        </p>
      </div>
    `;
  };

  // Public API
  return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', CodingDashboard.init);
