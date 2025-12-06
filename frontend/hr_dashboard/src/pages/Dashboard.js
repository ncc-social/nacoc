import { employees } from '../data/mockData.js';
import Chart from 'chart.js/auto';
import * as echarts from 'echarts';

export function Dashboard() {
  const container = document.createElement('div');
  container.className = 'p-4 space-y-4'; // Reduced padding and spacing

  // --- Header ---
  const header = document.createElement('h1');
  header.className = 'text-xl font-bold text-gray-900'; // Reduced font size
  header.textContent = 'Dashboard';
  container.appendChild(header);

  // --- Stats Calculations ---
  const currentYear = new Date().getFullYear();
  const activeEmployees = employees.filter(e => e.status !== 'Exited').length;
  const joinedThisYear = employees.filter(e => new Date(e.joinDate).getFullYear() === currentYear).length;
  const exitedThisYear = employees.filter(e => e.exitDate && new Date(e.exitDate).getFullYear() === currentYear).length;

  // --- Stats Cards ---
  const statsGrid = document.createElement('div');
  statsGrid.className = 'grid grid-cols-1 md:grid-cols-4 gap-4'; // Updated to 4 columns

  const stats = [
    {
      title: 'Total Employees',
      value: activeEmployees,
      id: 'total_employees', // Added ID for API targeting
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradient: 'from-pelorous-500 to-pelorous-600'
    },
    {
      title: 'Total Secondment',
      value: 0,
      id: 'total_secondment',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      gradient: 'from-pelorous-500 to-pelorous-600'
    },
    {
      title: 'Joined This Year',
      value: joinedThisYear,
      id: 'new_hires_count', // Added ID for API targeting
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      gradient: 'from-pelorous-500 to-pelorous-600'
    },
    {
      title: 'Exited This Year',
      value: exitedThisYear,
      id: 'employee_exits_count', // Added ID for API targeting
      icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6',
      gradient: 'from-pelorous-500 to-pelorous-600'
    }
  ];

  stats.forEach(stat => {
    const card = document.createElement('div');
    card.className = 'bg-pelorous-900 rounded-xl shadow-sm p-5 border border-pelorous-800 hover:shadow-md transition-all duration-300';

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <p class="text-sm font-semibold text-pelorous-200 uppercase tracking-wider">${stat.title}</p>
          <h3 class="text-3xl font-bold text-white mt-1" id="${stat.id || ''}">${stat.value}</h3>
        </div>
        <div class="p-2 rounded-lg bg-pelorous-800 text-pelorous-100">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${stat.icon}" />
          </svg>
        </div>
      </div>
    `;
    statsGrid.appendChild(card);
  });
  container.appendChild(statsGrid);

  // --- Charts Section ---
  const chartsGrid = document.createElement('div');
  chartsGrid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-4'; // Reduced gap

  // Helper to create chart container
  const createChartCard = (title, elementId, isCanvas = true) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm p-4'; // Reduced padding
    card.innerHTML = `
      <h3 class="text-lg font-semibold text-gray-800 mb-3">${title}</h3> <!-- Reduced font size -->
      <div class="relative h-56 w-full"> <!-- Reduced height -->
        ${isCanvas ? `<canvas id="${elementId}"></canvas>` : `<div id="${elementId}" style="width: 100%; height: 100%;"></div>`}
      </div>
    `;
    return card;
  };

  // Gender Chart uses ECharts (div), Rank Chart uses ECharts (div), Age Chart uses ECharts (div), Experience Chart uses ECharts (div)
  chartsGrid.appendChild(createChartCard('Gender Distribution', 'gender-diversity', false));
  chartsGrid.appendChild(createChartCard('Employee Rank Distribution', 'employees_by_grade_chart', false));
  chartsGrid.appendChild(createChartCard('Age Group Distribution', 'age_group_histogram', false));
  chartsGrid.appendChild(createChartCard('Working Years Distribution', 'experience_chart', false));

  container.appendChild(chartsGrid);

  // --- Render Charts & Fetch Data Logic ---
  setTimeout(() => {
    // renderCharts(); // No longer needed as all charts are now handled by specific functions
    updateEmployeeCount(); // Fetch real data
    updateNewHiresThisYear(); // Fetch new hires data
    updateExitsThisYear(); // Fetch exits data
    updateTotalSecondment(); // Fetch secondment data
    updateGenderDiversity(); // Fetch gender data (ECharts)
    updateEmployeesByGrade(); // Fetch rank data (ECharts)
    loadAgeGroupHistogram(); // Fetch age data (ECharts)
    updateExperienceChart(); // Fetch experience data (ECharts)
  }, 0);

  return container;
}

function updateEmployeeCount(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching employee count...');
  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_total_employees_and_yearly_data' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(res => {
      if (res.message && res.message.total_employees !== undefined) {
        const count = res.message.total_employees;
        const element = document.getElementById("total_employees");
        if (element) {
          element.textContent = count;
          console.log('Employee count updated:', count);
        }
      }
    })
    .catch(err => {
      console.warn('Failed to fetch employee count:', err);
      // Fallback is already in place (mock data)
    });
}

function updateNewHiresThisYear(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching new hires count...');
  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_new_hires_this_year' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(res => {
      const count = (res.message && res.message.count) || 0;
      const element = document.getElementById("new_hires_count");
      if (element) {
        element.textContent = count;
        console.log('New hires count updated:', count);
      }
    })
    .catch(err => {
      console.error("Error fetching new hires:", err);
      // Fallback is already in place (mock data)
    });
}

function updateExitsThisYear(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching exits count...');
  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_exits_this_year' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(res => {
      const count = (res.message && res.message.count) || 0;
      const element = document.getElementById("employee_exits_count");
      if (element) {
        element.textContent = count;
        console.log('Exits count updated:', count);
      }
    })
    .catch(err => {
      console.error("Error fetching exits:", err);
      // Fallback is already in place (mock data)
    });
}

function updateTotalSecondment(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching total secondment...');
  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_total_secondment' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(res => {
      const count = (res.message && res.message.total_secondment) || 0;
      const element = document.getElementById("total_secondment");
      if (element) {
        element.textContent = count;
        console.log('Total secondment updated:', count);
      }
    })
    .catch(err => {
      console.error("Error fetching total secondment:", err);
    });
}

function updateGenderDiversity(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching gender distribution...');

  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_gender_distribution' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(res => {
      const data = res.message;
      renderGenderChart(data.labels, data.counts);
    })
    .catch(err => {
      console.error("Error fetching gender data:", err);
      // Fallback to mock data
      const genderCounts = employees.reduce((acc, e) => {
        if (e.status === 'Exited') return acc;
        const gender = e.personalInfo?.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {});
      renderGenderChart(Object.keys(genderCounts), Object.values(genderCounts));
    });
}

function renderGenderChart(labels, counts) {
  const chartEl = document.getElementById('gender-diversity');
  if (!chartEl) return;

  const myChart = echarts.init(chartEl);
  const fontStack = getComputedStyle(document.documentElement).getPropertyValue('--font-family-base').trim();

  // Map labels and counts to ECharts data format
  const data = labels.map((label, index) => ({
    value: counts[index],
    name: label
  }));

  const option = {
    textStyle: {
      fontFamily: fontStack
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: 'Gender Distribution',
        type: 'pie',
        radius: ['50%', '90%'],
        center: ['50%', '70%'],
        // adjust the start and end angle
        startAngle: 180,
        endAngle: 360,
        data: data,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter(param) {
            return param.percent + '%';
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        // Use theme colors
        color: ['#178fa3', '#adf0f4', '#9CA3AF']
      }
    ]
  };

  myChart.setOption(option);

  // Handle resize
  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

function updateEmployeesByGrade(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching employees by grade...');

  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_employees_by_rank' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(res => {
      const data = res.message;
      if (!data || !data.labels || !data.male || !data.female) {
        console.error("Invalid or incomplete data for grade chart");
        return;
      }
      renderRankChart(data.labels, data.male, data.female);
    })
    .catch(err => {
      console.error("Error loading employees by grade chart:", err);
      // Fallback to mock data
      const rankCounts = employees.reduce((acc, e) => {
        if (e.status === 'Exited') return acc;
        const rank = e.personalInfo?.rank || 'Unassigned';
        if (!acc[rank]) acc[rank] = { male: 0, female: 0 };
        const gender = e.personalInfo?.gender === 'Male' ? 'male' : 'female';
        acc[rank][gender]++;
        return acc;
      }, {});

      const labels = Object.keys(rankCounts);
      const maleData = labels.map(l => rankCounts[l].male);
      const femaleData = labels.map(l => rankCounts[l].female);

      renderRankChart(labels, maleData, femaleData);
    });
}

function renderRankChart(labels, maleData, femaleData) {
  const chartEl = document.getElementById('employees_by_grade_chart');
  if (!chartEl) return;

  const myChart = echarts.init(chartEl);
  const fontStack = getComputedStyle(document.documentElement).getPropertyValue('--font-family-base').trim();

  const option = {
    textStyle: {
      fontFamily: fontStack
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Male', 'Female'],
      top: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Male',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: maleData,
        color: '#178fa3'
      },
      {
        name: 'Female',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: femaleData,
        color: '#adf0f4'
      }
    ]
  };

  myChart.setOption(option);

  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

function loadAgeGroupHistogram(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching age group distribution...');

  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_age_group_distribution' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(res => {
      const data = res.message;
      if (!data || !data.labels || !data.male || !data.female) {
        console.error("Invalid or incomplete data for age chart");
        return;
      }
      renderAgeChart(data.labels, data.male, data.female);
    })
    .catch(err => {
      console.error("Error loading age group histogram:", err);
      // Fallback to mock data
      const ageGroups = { '< 25': { male: 0, female: 0 }, '25-35': { male: 0, female: 0 }, '35-45': { male: 0, female: 0 }, '45+': { male: 0, female: 0 } };
      const currentYear = new Date().getFullYear();

      employees.forEach(e => {
        if (e.status === 'Exited' || !e.personalInfo?.dob) return;
        const birthYear = new Date(e.personalInfo.dob).getFullYear();
        const age = currentYear - birthYear;
        const gender = e.personalInfo?.gender === 'Male' ? 'male' : 'female';

        if (age < 25) ageGroups['< 25'][gender]++;
        else if (age <= 35) ageGroups['25-35'][gender]++;
        else if (age <= 45) ageGroups['35-45'][gender]++;
        else ageGroups['45+'][gender]++;
      });

      const labels = Object.keys(ageGroups);
      const maleData = labels.map(l => ageGroups[l].male);
      const femaleData = labels.map(l => ageGroups[l].female);

      renderAgeChart(labels, maleData, femaleData);
    });
}

function renderAgeChart(labels, maleData, femaleData) {
  const chartEl = document.getElementById('age_group_histogram');
  if (!chartEl) return;

  const myChart = echarts.init(chartEl);
  const fontStack = getComputedStyle(document.documentElement).getPropertyValue('--font-family-base').trim();

  const option = {
    textStyle: {
      fontFamily: fontStack
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Male', 'Female'],
      top: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Male',
        type: 'bar',
        // No stack property for side-by-side bars
        data: maleData,
        color: '#178fa3'
      },
      {
        name: 'Female',
        type: 'bar',
        barGap: 0,
        // No stack property for side-by-side bars
        data: femaleData,
        color: '#adf0f4'
      }
    ]
  };

  myChart.setOption(option);

  window.addEventListener('resize', () => {
    myChart.resize();
  });
}

function updateExperienceChart(department) {
  const query = department ? '?department=' + encodeURIComponent(department) : '';
  console.log('Fetching experience distribution...');

  fetch('https://jupiter.ncc.gov.gh/api/method/nacoc.my_scripts.executive_dashboard.get_experience_bins' + query, {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(res => {
      const data = res.message;
      if (!data || !data.labels || !data.male || !data.female) {
        console.error("Invalid or incomplete data for experience chart");
        return;
      }
      renderExperienceChart(data.labels, data.male, data.female);
    })
    .catch(err => {
      console.error("Error loading experience chart:", err);
      // Fallback to mock data
      const tenureGroups = { '< 1 Year': { male: 0, female: 0 }, '1-3 Years': { male: 0, female: 0 }, '3-5 Years': { male: 0, female: 0 }, '5+ Years': { male: 0, female: 0 } };
      const currentYear = new Date().getFullYear();

      employees.forEach(e => {
        if (e.status === 'Exited') return;
        const joinYear = new Date(e.joinDate).getFullYear();
        const tenure = currentYear - joinYear;
        const gender = e.personalInfo?.gender === 'Male' ? 'male' : 'female';

        if (tenure < 1) tenureGroups['< 1 Year'][gender]++;
        else if (tenure <= 3) tenureGroups['1-3 Years'][gender]++;
        else if (tenure <= 5) tenureGroups['3-5 Years'][gender]++;
        else tenureGroups['5+ Years'][gender]++;
      });

      const labels = Object.keys(tenureGroups);
      const maleData = labels.map(l => tenureGroups[l].male);
      const femaleData = labels.map(l => tenureGroups[l].female);

      renderExperienceChart(labels, maleData, femaleData);
    });
}

function renderExperienceChart(labels, maleData, femaleData) {
  const chartEl = document.getElementById('experience_chart');
  if (!chartEl) return;

  const myChart = echarts.init(chartEl);
  const fontStack = getComputedStyle(document.documentElement).getPropertyValue('--font-family-base').trim();

  const option = {
    textStyle: {
      fontFamily: fontStack
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['Male', 'Female'],
      top: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Male',
        type: 'bar',
        // No stack property for side-by-side bars
        data: maleData,
        color: '#178fa3'
      },
      {
        name: 'Female',
        type: 'bar',
        barGap: 0,
        // No stack property for side-by-side bars
        data: femaleData,
        color: '#adf0f4'
      }
    ]
  };

  myChart.setOption(option);

  window.addEventListener('resize', () => {
    myChart.resize();
  });
}
