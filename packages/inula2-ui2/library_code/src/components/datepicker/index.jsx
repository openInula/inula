import './index.css';
import Icon from '../icon';
import Button from '../button';

const DatePicker = ({
  value,
  defaultValue,
  placeholder,
  onChange,
  disabled = false,
  size = 'default', // small, default, large
  clearable = true,
  showToday = true,
  needConfirm = false,
  style = {},
  hoverIcon = false,
  className = '',
  mode = 'date', // date, week, month, quarter, year
  picker = 'single', // single, range
  ...rest
}) => {
  // State variables
  let isOpen = false;
  let selectedDate = value !== undefined ? value : defaultValue || (picker === 'range' ? [] : '');
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let currentView = mode; // date, week, month, quarter, year
  let rangeStart = null;
  let rangeEnd = null;
  let hoverDate = null;

  // If selectedDate is provided, set currentMonth and currentYear to match it
  if (selectedDate) {
    let dateToUse = selectedDate;
    // For range picker, use the first date if it's an array
    if (Array.isArray(selectedDate) && selectedDate.length > 0) {
      dateToUse = selectedDate[0];
    }

    const date = parseDate(dateToUse);
    if (date) {
      currentMonth = date.getMonth();
      currentYear = date.getFullYear();
    }
  }

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Format week as YYYY-WW
  function formatWeek(date) {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-${String(week).padStart(2, '0')}周`;
  }

  // Format month as YYYY-MM
  function formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Format quarter as YYYY-QN
  function formatQuarter(date) {
    const year = date.getFullYear();
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${year}-Q${quarter}`;
  }

  // Format year as YYYY
  function formatYear(date) {
    return `${date.getFullYear()}`;
  }

  // Get week number of the year
  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Get week start and end dates (修正版本)
  function getWeekDates(date) {
    const day = date.getDay();
    // 计算本周的周一
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.getFullYear(), date.getMonth(), diff);
    // 计算本周的周日
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  }

  const onIconHover = () => {
    hoverIcon = true;
  }

  const onIconLeave = () => {
    hoverIcon = false;
  }

  // Parse date string to Date object
  function parseDate(dateString) {
    if (!dateString) return null;

    // Handle array case (for range picker)
    if (Array.isArray(dateString)) {
      if (dateString.length > 0) {
        return parseDate(dateString[0]); // Parse the first date in the range
      }
      return null;
    }

    // Ensure dateString is a string
    if (typeof dateString !== 'string') {
      return null;
    }

    if (mode === 'week' && dateString.includes('周')) {
      const match = dateString.match(/(\d{4})-(\d{2})周/);
      if (match) {
        const year = parseInt(match[1]);
        const week = parseInt(match[2]);
        // 计算该周的第一天
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToAdd = (week - 1) * 7;
        const weekStart = new Date(firstDayOfYear);
        weekStart.setDate(firstDayOfYear.getDate() + daysToAdd);
        return weekStart;
      }
    } else if (mode === 'month' && dateString.includes('-')) {
      const [year, month] = dateString.split('-').map(Number);
      return new Date(year, month - 1, 1);
    } else if (mode === 'quarter' && dateString.includes('Q')) {
      const match = dateString.match(/(\d{4})-Q(\d)/);
      if (match) {
        const year = parseInt(match[1]);
        const quarter = parseInt(match[2]);
        const month = (quarter - 1) * 3;
        return new Date(year, month, 1);
      }
    } else if (mode === 'year') {
      const year = parseInt(dateString);
      return new Date(year, 0, 1);
    } else {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return null;
  }

  // Get days in month
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }

  // Handle date selection
  function handleDateSelect(day) {
    const newDate = new Date(currentYear, currentMonth, day);
    let formattedValue;

    switch (mode) {
      case 'date':
        formattedValue = formatDate(newDate);
        break;
      case 'week':
        // 在周模式下，选择日期时应该选择该日期所在的整周
        formattedValue = formatWeek(newDate);
        break;
      case 'month':
        formattedValue = formatMonth(newDate);
        break;
      case 'quarter':
        formattedValue = formatQuarter(newDate);
        break;
      case 'year':
        formattedValue = formatYear(newDate);
        break;
      default:
        formattedValue = formatDate(newDate);
    }

    if (picker === 'range') {
      handleRangeSelect(formattedValue, newDate);
    } else {
      if (!needConfirm) {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
        if (onChange) {
          onChange(formattedValue);
        }
        setTimeout(() => {
          isOpen = false;
        }, 100);
      } else {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
      }
    }
  }

  // Handle range selection
  function handleRangeSelect(formattedValue, dateObj) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // 开始新的范围选择
      rangeStart = dateObj;
      rangeEnd = null;
      if (value === undefined) {
        selectedDate = [formattedValue];
      }
    } else if (rangeStart && !rangeEnd) {
      // 完成范围选择
      if (dateObj < rangeStart) {
        rangeEnd = rangeStart;
        rangeStart = dateObj;
      } else {
        rangeEnd = dateObj;
      }

      const startFormatted = formatDateByMode(rangeStart);
      const endFormatted = formatDateByMode(rangeEnd);

      if (value === undefined) {
        selectedDate = [startFormatted, endFormatted];
      }

      if (!needConfirm) {
        if (onChange) {
          onChange([startFormatted, endFormatted]);
        }
        setTimeout(() => {
          isOpen = false;
        }, 100);
      }
    }
  }

  // Format date by current mode
  function formatDateByMode(date) {
    switch (mode) {
      case 'date':
        return formatDate(date);
      case 'week':
        return formatWeek(date);
      case 'month':
        return formatMonth(date);
      case 'quarter':
        return formatQuarter(date);
      case 'year':
        return formatYear(date);
      default:
        return formatDate(date);
    }
  }

  // Handle week selection
  function handleWeekSelect(weekStart) {
    const formattedValue = formatWeek(weekStart);

    if (!needConfirm) {
      if (value === undefined) {
        selectedDate = formattedValue;
      }
      if (onChange) {
        onChange(formattedValue);
      }
      setTimeout(() => {
        isOpen = false;
      }, 100);
    } else {
      if (value === undefined) {
        selectedDate = formattedValue;
      }
    }
  }

  // Handle month selection
  function handleMonthSelect(month) {
    const newDate = new Date(currentYear, month, 1);
    const formattedValue = formatMonth(newDate);

    if (picker === 'range') {
      handleRangeSelect(formattedValue, newDate);
    } else {
      if (!needConfirm) {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
        if (onChange) {
          onChange(formattedValue);
        }
        setTimeout(() => {
          isOpen = false;
        }, 100);
      } else {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
      }
    }
  }

  // Handle quarter selection
  function handleQuarterSelect(quarter) {
    const month = (quarter - 1) * 3;
    const newDate = new Date(currentYear, month, 1);
    const formattedValue = formatQuarter(newDate);

    if (picker === 'range') {
      handleRangeSelect(formattedValue, newDate);
    } else {
      if (!needConfirm) {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
        if (onChange) {
          onChange(formattedValue);
        }
        setTimeout(() => {
          isOpen = false;
        }, 100);
      } else {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
      }
    }
  }

  // Handle year selection
  function handleYearSelect(year) {
    const newDate = new Date(year, 0, 1);
    const formattedValue = formatYear(newDate);

    if (picker === 'range') {
      handleRangeSelect(formattedValue, newDate);
    } else {
      if (!needConfirm) {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
        if (onChange) {
          onChange(formattedValue);
        }
        setTimeout(() => {
          isOpen = false;
        }, 100);
      } else {
        if (value === undefined) {
          selectedDate = formattedValue;
        }
      }
    }
  }

  // Handle month navigation
  function handlePrevMonth() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear = currentYear - 1;
    } else {
      currentMonth = currentMonth - 1;
    }

    // 强制重新渲染日历
    forceUpdate();

    // 确保周视图正确更新（非范围模式才单面板刷新）
    if (mode === 'week' && picker !== 'range') {
      setTimeout(() => {
        const dropdown = document.querySelector('.inula-datepicker-dropdown');
        if (dropdown) {
          updateWeekView(dropdown);
        }
      }, 0);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear = currentYear + 1;
    } else {
      currentMonth = currentMonth + 1;
    }

    // 强制重新渲染日历
    forceUpdate();

    // 确保周视图正确更新（非范围模式才单面板刷新）
    if (mode === 'week' && picker !== 'range') {
      setTimeout(() => {
        const dropdown = document.querySelector('.inula-datepicker-dropdown');
        if (dropdown) {
          updateWeekView(dropdown);
        }
      }, 0);
    }
  }

  // Handle year navigation
  function handlePrevYear() {
    currentYear = currentYear - 1;

    // 强制重新渲染日历
    forceUpdate();

    // 确保周视图正确更新（非范围模式才单面板刷新）
    if (mode === 'week' && picker !== 'range') {
      setTimeout(() => {
        const dropdown = document.querySelector('.inula-datepicker-dropdown');
        if (dropdown) {
          updateWeekView(dropdown);
        }
      }, 0);
    }
  }

  function handleNextYear() {
    currentYear = currentYear + 1;

    // 强制重新渲染日历
    forceUpdate();

    // 确保周视图正确更新（非范围模式才单面板刷新）
    if (mode === 'week' && picker !== 'range') {
      setTimeout(() => {
        const dropdown = document.querySelector('.inula-datepicker-dropdown');
        if (dropdown) {
          updateWeekView(dropdown);
        }
      }, 0);
    }
  }

  // 强制更新组件
  function forceUpdate() {
    // 直接更新日历内容，而不是关闭再打开
    const dropdown = document.querySelector('.inula-datepicker-dropdown');
    if (dropdown) {
      // 更新标题显示
      const headerView = dropdown.querySelector('.inula-datepicker-header-view');
      if (headerView) {
        if (mode === 'date' || mode === 'week') {
          headerView.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
        } else if (mode === 'year') {
          headerView.textContent = `${currentYear - 5}年-${currentYear + 4}年`;
        } else {
          headerView.textContent = `${currentYear}年`;
        }
      }

      // 更新双面板标题（范围模式）
      if (picker === 'range') {
        const panelTitles = dropdown.querySelectorAll('.inula-datepicker-panel-title');
        if (panelTitles && panelTitles.length >= 2) {
          panelTitles[0].textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
          const next = getNextMonthYear();
          panelTitles[1].textContent = `${next.year}年 ${monthNames[next.month]}`;
        }
      }

      // 根据当前模式更新内容
      updateCalendarContent(dropdown);
    }
  }

  // 根据当前模式更新日历内容
  function updateCalendarContent(dropdown) {
    switch (mode) {
      case 'date':
        updateDateView(dropdown);
        break;
      case 'week':
        if (picker === 'range') {
          const next = getNextMonthYear();
          updateWeekViewWithParams(dropdown, 0, currentYear, currentMonth, false);
          updateWeekViewWithParams(dropdown, 1, next.year, next.month, true);
        } else {
          updateWeekView(dropdown);
        }
        break;
      case 'month':
        updateMonthView(dropdown);
        break;
      case 'quarter':
        updateQuarterView(dropdown);
        break;
      case 'year':
        updateYearView(dropdown);
        break;
    }
  }

  // 更新日期视图
  function updateDateView(dropdown) {
    const daysContainers = dropdown.querySelectorAll('.inula-datepicker-panel .inula-datepicker-days:last-child');

    // 左侧（当前月）
    const leftContainer = daysContainers[0] || dropdown.querySelector('.inula-datepicker-days:last-child');
    if (leftContainer) {
      leftContainer.innerHTML = '';
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
      for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'inula-datepicker-day empty';
        leftContainer.appendChild(emptyDay);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = formatDate(date) === formatDate(new Date());
        let isSelected = mode === 'date' ? selectedDate === formatDate(date) : false;
        const dayElement = document.createElement('div');
        dayElement.className = `inula-datepicker-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`;
        dayElement.textContent = day;
        if (!disabled) dayElement.addEventListener('click', () => handleDateSelect(day));
        leftContainer.appendChild(dayElement);
      }
    }

    // 右侧（下一月）
    if (picker === 'range') {
      const next = getNextMonthYear();
      const rightContainer = daysContainers[1];
      if (rightContainer) {
        rightContainer.innerHTML = '';
        const daysInMonth = getDaysInMonth(next.year, next.month);
        const firstDayOfMonth = getFirstDayOfMonth(next.year, next.month);
        for (let i = 0; i < firstDayOfMonth; i++) {
          const emptyDay = document.createElement('div');
          emptyDay.className = 'inula-datepicker-day empty';
          rightContainer.appendChild(emptyDay);
        }
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(next.year, next.month, day);
          const isToday = formatDate(date) === formatDate(new Date());
          const dayElement = document.createElement('div');
          dayElement.className = `inula-datepicker-day ${isToday ? 'today' : ''} ${disabled ? 'disabled' : ''}`;
          dayElement.textContent = day;
          if (!disabled) rightContainer.appendChild(dayElement);
          if (!disabled) rightContainer.lastChild.addEventListener('click', () => handleNextMonthDateSelect(day));
        }
      }
    }
  }

  // 更新周视图
  function updateWeekView(dropdown) {
    const weekNumbersContainer = dropdown.querySelector('.inula-datepicker-week-numbers');
    const weeksContainer = dropdown.querySelector('.inula-datepicker-weeks');

    if (weekNumbersContainer && weeksContainer) {
      // 清空现有内容
      weekNumbersContainer.innerHTML = '';
      weeksContainer.innerHTML = '';

      // 获取当月第一天
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

      // 获取当月第一天所在周的周一
      const firstMonday = new Date(firstDayOfMonth);
      const dayOfWeek = firstDayOfMonth.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是周日，则往前推6天；否则，往前推(1-dayOfWeek)天
      firstMonday.setDate(firstDayOfMonth.getDate() + diff);

      // 计算当月有多少天
      const daysInMonth = getDaysInMonth(currentYear, currentMonth);

      // 计算当月最后一天
      const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth);

      // 计算当月最后一天所在周的周日
      const lastSunday = new Date(lastDayOfMonth);
      const lastDayOfWeek = lastDayOfMonth.getDay();
      lastSunday.setDate(lastDayOfMonth.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));

      // 计算总周数
      const totalDays = Math.round((lastSunday - firstMonday) / (24 * 60 * 60 * 1000)) + 1;
      const totalWeeks = Math.ceil(totalDays / 7);

      // 从第一个周一开始，生成每周的日期
      let currentDate = new Date(firstMonday);

      for (let week = 0; week < totalWeeks; week++) {
        const weekStartDate = new Date(currentDate);
        const weekNumber = getWeekNumber(weekStartDate);

        // 创建周号
        const weekNumberElement = document.createElement('div');
        weekNumberElement.className = 'inula-datepicker-week-number';
        weekNumberElement.textContent = weekNumber;
        weekNumbersContainer.appendChild(weekNumberElement);

        // 创建周行
        const weekRowElement = document.createElement('div');
        weekRowElement.className = 'inula-datepicker-week-row';

        // 为这一周添加7天
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          const dayDate = new Date(currentDate);
          dayDate.setDate(currentDate.getDate() + dayOfWeek);

          const day = dayDate.getDate();
          const month = dayDate.getMonth();
          const year = dayDate.getFullYear();
          const isCurrentMonth = month === currentMonth && year === currentYear;
          const isToday = formatDate(dayDate) === formatDate(new Date());
          let isInSelectedWeek = false;
          let isWeekStart = false;
          let isWeekEnd = false;

          if (selectedDate) {
            const selectedWeek = parseDate(selectedDate);
            if (selectedWeek) {
              const selectedWeekDates = getWeekDates(selectedWeek);
              isInSelectedWeek = dayDate >= selectedWeekDates.start && dayDate <= selectedWeekDates.end;

              if (isInSelectedWeek) {
                const dayOfWeekNum = dayDate.getDay();
                isWeekStart = dayOfWeekNum === 1;
                isWeekEnd = dayOfWeekNum === 0;
              }
            }
          }

          const isDisabled = disabled;

          const dayElement = document.createElement('div');
          dayElement.className = `inula-datepicker-week ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isInSelectedWeek ? 'week-selected' : ''} ${isWeekStart ? 'week-start' : ''} ${isWeekEnd ? 'week-end' : ''} ${isDisabled ? 'disabled' : ''}`;
          dayElement.textContent = day;

          // 为不在当前月的日期添加样式
          if (!isCurrentMonth) {
            dayElement.style.color = '#ccc';
          }

          if (!isDisabled) {
            dayElement.addEventListener('click', () => handleDateSelect(day));
          }

          weekRowElement.appendChild(dayElement);
        }

        weeksContainer.appendChild(weekRowElement);

        // 移动到下一周的周一
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }
  }

  // 更新指定索引的周视图（用于范围双面板）
  function updateWeekViewWithParams(dropdown, targetIndex, year, month, useNextHandler = false) {
    const weekNumbersContainers = dropdown.querySelectorAll('.inula-datepicker-week-numbers');
    const weeksContainers = dropdown.querySelectorAll('.inula-datepicker-weeks');

    const weekNumbersContainer = weekNumbersContainers[targetIndex];
    const weeksContainer = weeksContainers[targetIndex];

    if (weekNumbersContainer && weeksContainer) {
      weekNumbersContainer.innerHTML = '';
      weeksContainer.innerHTML = '';

      const firstDayOfMonth = new Date(year, month, 1);
      const firstMonday = new Date(firstDayOfMonth);
      const dayOfWeek = firstDayOfMonth.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      firstMonday.setDate(firstDayOfMonth.getDate() + diff);

      const daysInMonth = getDaysInMonth(year, month);
      const lastDayOfMonth = new Date(year, month, daysInMonth);
      const lastSunday = new Date(lastDayOfMonth);
      const lastDayOfWeek = lastDayOfMonth.getDay();
      lastSunday.setDate(lastDayOfMonth.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));

      const totalDays = Math.round((lastSunday - firstMonday) / (24 * 60 * 60 * 1000)) + 1;
      const totalWeeks = Math.ceil(totalDays / 7);

      let currentDateLocal = new Date(firstMonday);

      for (let week = 0; week < totalWeeks; week++) {
        const weekStartDate = new Date(currentDateLocal);
        const weekNumber = getWeekNumber(weekStartDate);

        const weekNumberElement = document.createElement('div');
        weekNumberElement.className = 'inula-datepicker-week-number';
        weekNumberElement.textContent = weekNumber;
        weekNumbersContainer.appendChild(weekNumberElement);

        const weekRowElement = document.createElement('div');
        weekRowElement.className = 'inula-datepicker-week-row';

        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          const dayDate = new Date(currentDateLocal);
          dayDate.setDate(currentDateLocal.getDate() + dayOfWeek);

          const day = dayDate.getDate();
          const m = dayDate.getMonth();
          const y = dayDate.getFullYear();
          const isCurrentMonth = m === month && y === year;
          const isToday = formatDate(dayDate) === formatDate(new Date());
          let isInSelectedWeek = false;
          let isWeekStart = false;
          let isWeekEnd = false;

          if (selectedDate) {
            const selectedWeek = parseDate(selectedDate);
            if (selectedWeek) {
              const selectedWeekDates = getWeekDates(selectedWeek);
              isInSelectedWeek = dayDate >= selectedWeekDates.start && dayDate <= selectedWeekDates.end;
              if (isInSelectedWeek) {
                const dayOfWeekNum = dayDate.getDay();
                isWeekStart = dayOfWeekNum === 1;
                isWeekEnd = dayOfWeekNum === 0;
              }
            }
          }

          const dayElement = document.createElement('div');
          dayElement.className = `inula-datepicker-week ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isInSelectedWeek ? 'week-selected' : ''} ${isWeekStart ? 'week-start' : ''} ${isWeekEnd ? 'week-end' : ''} ${disabled ? 'disabled' : ''}`;
          dayElement.textContent = day;

          if (!disabled) {
            const handler = useNextHandler ? () => handleNextMonthDateSelect(day) : () => handleDateSelect(day);
            dayElement.addEventListener('click', handler);
          }

          if (!isCurrentMonth) {
            dayElement.style.color = '#ccc';
          }

          weekRowElement.appendChild(dayElement);
        }

        weeksContainer.appendChild(weekRowElement);
        currentDateLocal.setDate(currentDateLocal.getDate() + 7);
      }
    }
  }

  // 更新月份视图
  function updateMonthView(dropdown) {
    const monthsContainer = dropdown.querySelector('.inula-datepicker-months');

    if (monthsContainer) {
      // 清空现有内容
      monthsContainer.innerHTML = '';

      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const isSelected = selectedDate === formatMonth(date);

        const monthElement = document.createElement('div');
        monthElement.className = `inula-datepicker-month ${isSelected ? 'selected' : ''}`;
        monthElement.textContent = monthNames[month];
        monthElement.addEventListener('click', () => handleMonthSelect(month));

        monthsContainer.appendChild(monthElement);
      }
    }
  }

  // 更新季度视图
  function updateQuarterView(dropdown) {
    const quartersContainer = dropdown.querySelector('.inula-datepicker-quarters');

    if (quartersContainer) {
      // 清空现有内容
      quartersContainer.innerHTML = '';

      for (let quarter = 1; quarter <= 4; quarter++) {
        const date = new Date(currentYear, (quarter - 1) * 3, 1);
        const isSelected = selectedDate === formatQuarter(date);

        const quarterElement = document.createElement('div');
        quarterElement.className = `inula-datepicker-quarter ${isSelected ? 'selected' : ''}`;
        quarterElement.textContent = `Q${quarter}`;
        quarterElement.addEventListener('click', () => handleQuarterSelect(quarter));

        quartersContainer.appendChild(quarterElement);
      }
    }
  }

  // 更新年份视图
  function updateYearView(dropdown) {
    const yearsContainer = dropdown.querySelector('.inula-datepicker-years');

    if (yearsContainer) {
      // 清空现有内容
      yearsContainer.innerHTML = '';

      const startYear = currentYear - 5;

      for (let year = startYear; year <= startYear + 9; year++) {
        const date = new Date(year, 0, 1);
        const isSelected = selectedDate === formatYear(date);

        const yearElement = document.createElement('div');
        yearElement.className = `inula-datepicker-year ${isSelected ? 'selected' : ''}`;
        yearElement.textContent = year;
        yearElement.addEventListener('click', () => handleYearSelect(year));

        yearsContainer.appendChild(yearElement);
      }
    }
  }

  // Handle today button click
  function handleTodayClick() {
    const today = new Date();
    let formattedToday;

    switch (mode) {
      case 'date':
        formattedToday = formatDate(today);
        break;
      case 'week':
        formattedToday = formatWeek(today);
        break;
      case 'month':
        formattedToday = formatMonth(today);
        break;
      case 'quarter':
        formattedToday = formatQuarter(today);
        break;
      case 'year':
        formattedToday = formatYear(today);
        break;
      default:
        formattedToday = formatDate(today);
    }

    // 对于范围选择器，今天按钮只设置单个日期
    const todayValue = picker === 'range' ? [formattedToday] : formattedToday;

    if (value === undefined) {
      selectedDate = todayValue;
    }

    // 重置范围选择状态
    if (picker === 'range') {
      rangeStart = today;
      rangeEnd = null;
      hoverDate = null;
    }

    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    if (!needConfirm) {
      if (onChange) {
        onChange(todayValue);
      }
      setTimeout(() => {
        isOpen = false;
      }, 100);
    }
  }

  // Handle confirm button click
  function handleConfirm() {
    isOpen = false;
    if (onChange) {
      onChange(selectedDate);
    }
  }

  // Handle clear button click
  function handleClear(e) {
    e.stopPropagation();
    const emptyValue = picker === 'range' ? [] : '';
    if (value === undefined) {
      selectedDate = emptyValue;
    }
    rangeStart = null;
    rangeEnd = null;
    hoverDate = null;
    if (onChange) {
      onChange(emptyValue);
    }
  }

  // Toggle calendar visibility
  function handleToggle(e) {
    e.stopPropagation();
    if (!disabled) {
      isOpen = !isOpen;

      // 如果打开日历，确保使用最新的年月数据渲染
      if (isOpen) {
        // 如果有选中日期，使用选中日期的年月
        if (selectedDate) {
          let dateToUse = selectedDate;
          // For range picker, use the first date if it's an array
          if (Array.isArray(selectedDate) && selectedDate.length > 0) {
            dateToUse = selectedDate[0];
          }

          const date = parseDate(dateToUse);
          if (date) {
            currentMonth = date.getMonth();
            currentYear = date.getFullYear();
          }
        }
      }
    }
  }

  // Handle click outside
  function handleBlur() {
    isOpen = false;
  }

  // Render calendar days
  function renderCalendarDays() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="inula-datepicker-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = formatDate(date) === formatDate(new Date());
      let isSelected = false;
      let isInSelectedWeek = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;
      let isRangeHover = false;

      if (picker === 'range' && Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          const startDate = parseDate(selectedDate[0]);
          const endDate = parseDate(selectedDate[1]);
          if (startDate && endDate) {
            if (mode === 'week') {
              // 周模式下的范围选择
              const startWeekDates = getWeekDates(startDate);
              const endWeekDates = getWeekDates(endDate);
              isInRange = date >= startWeekDates.start && date <= endWeekDates.end;
              isRangeStart = date >= startWeekDates.start && date <= startWeekDates.end;
              isRangeEnd = date >= endWeekDates.start && date <= endWeekDates.end;
            } else {
              // 日期模式下的范围选择
              isRangeStart = formatDate(date) === formatDate(startDate);
              isRangeEnd = formatDate(date) === formatDate(endDate);
              isInRange = date >= startDate && date <= endDate;
            }
          }
        } else if (selectedDate.length === 1 && rangeStart) {
          if (mode === 'week') {
            // 周模式下的悬停效果
            const startWeekDates = getWeekDates(rangeStart);
            isInRange = date >= startWeekDates.start && date <= startWeekDates.end;
            if (hoverDate) {
              const hoverWeekDates = getWeekDates(hoverDate);
              isInRange = date >= startWeekDates.start && date <= hoverWeekDates.end;
            }
          } else {
            // 日期模式下的悬停效果
            isRangeStart = formatDate(date) === formatDate(rangeStart);
            if (hoverDate && date >= rangeStart && date <= hoverDate) {
              isRangeHover = true;
            }
          }
        }
      } else if (picker === 'single') {
        if (mode === 'date') {
          isSelected = selectedDate === formatDate(date);
        } else if (mode === 'week' && selectedDate) {
          const selectedWeek = parseDate(selectedDate);
          if (selectedWeek) {
            const selectedWeekDates = getWeekDates(selectedWeek);
            // 比较日期是否在选中周内
            const currentDate = new Date(currentYear, currentMonth, day);
            isInSelectedWeek = currentDate >= selectedWeekDates.start && currentDate <= selectedWeekDates.end;
          }
        }
      }

      const isDisabled = disabled;

      days.push(
        <div
          key={day}
          className={`inula-datepicker-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isInSelectedWeek ? 'week-selected' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''} ${isInRange ? 'in-range' : ''} ${isRangeHover ? 'range-hover' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={isDisabled ? undefined : () => handleDateSelect(day)}
          onMouseEnter={() => {
            if (picker === 'range' && rangeStart && !rangeEnd) {
              hoverDate = date;
            }
          }}
          onMouseLeave={() => {
            if (picker === 'range') {
              hoverDate = null;
            }
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  }

  // Get next month and year for range picker
  function getNextMonthYear() {
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear = currentYear + 1;
    }

    return { month: nextMonth, year: nextYear };
  }

  // Render next month calendar days for range picker
  function renderNextMonthCalendarDays() {
    const { month: nextMonth, year: nextYear } = getNextMonthYear();
    const daysInMonth = getDaysInMonth(nextYear, nextMonth);
    const firstDayOfMonth = getFirstDayOfMonth(nextYear, nextMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="inula-datepicker-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(nextYear, nextMonth, day);
      const isToday = formatDate(date) === formatDate(new Date());
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;
      let isRangeHover = false;

      if (picker === 'range' && Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          const startDate = parseDate(selectedDate[0]);
          const endDate = parseDate(selectedDate[1]);
          if (startDate && endDate) {
            if (mode === 'week') {
              // 周模式下的范围选择
              const startWeekDates = getWeekDates(startDate);
              const endWeekDates = getWeekDates(endDate);
              isInRange = date >= startWeekDates.start && date <= endWeekDates.end;
              isRangeStart = date >= startWeekDates.start && date <= startWeekDates.end;
              isRangeEnd = date >= endWeekDates.start && date <= endWeekDates.end;
            } else {
              // 日期模式下的范围选择
              isRangeStart = formatDate(date) === formatDate(startDate);
              isRangeEnd = formatDate(date) === formatDate(endDate);
              isInRange = date >= startDate && date <= endDate;
            }
          }
        } else if (selectedDate.length === 1 && rangeStart) {
          if (mode === 'week') {
            // 周模式下的悬停效果
            const startWeekDates = getWeekDates(rangeStart);
            isInRange = date >= startWeekDates.start && date <= startWeekDates.end;
            if (hoverDate) {
              const hoverWeekDates = getWeekDates(hoverDate);
              isInRange = date >= startWeekDates.start && date <= hoverWeekDates.end;
            }
          } else {
            // 日期模式下的悬停效果
            isRangeStart = formatDate(date) === formatDate(rangeStart);
            if (hoverDate && date >= rangeStart && date <= hoverDate) {
              isRangeHover = true;
            }
          }
        }
      }

      const isDisabled = disabled;

      days.push(
        <div
          key={day}
          className={`inula-datepicker-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''} ${isInRange ? 'in-range' : ''} ${isRangeHover ? 'range-hover' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={isDisabled ? undefined : () => handleNextMonthDateSelect(day)}
          onMouseEnter={() => {
            if (picker === 'range' && rangeStart && !rangeEnd) {
              hoverDate = date;
            }
          }}
          onMouseLeave={() => {
            if (picker === 'range') {
              hoverDate = null;
            }
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  }

  // Handle date selection for next month in range picker
  function handleNextMonthDateSelect(day) {
    const { month: nextMonth, year: nextYear } = getNextMonthYear();
    const newDate = new Date(nextYear, nextMonth, day);
    let formattedValue;

    switch (mode) {
      case 'date':
        formattedValue = formatDate(newDate);
        break;
      case 'week':
        formattedValue = formatWeek(newDate);
        break;
      case 'month':
        formattedValue = formatMonth(newDate);
        break;
      case 'quarter':
        formattedValue = formatQuarter(newDate);
        break;
      case 'year':
        formattedValue = formatYear(newDate);
        break;
      default:
        formattedValue = formatDate(newDate);
    }

    if (picker === 'range') {
      handleRangeSelect(formattedValue, newDate);
    }
  }

  // Render week view
  function renderWeekView() {
    // 当mode为week时，按周来渲染
    const weeks = [];
    const weekNumbers = [];

    // 获取当月第一天
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

    // 获取当月第一天所在周的周一
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是周日，则往前推6天；否则，往前推(1-dayOfWeek)天
    firstMonday.setDate(firstDayOfMonth.getDate() + diff);

    // 计算当月有多少天
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // 计算当月最后一天
    const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth);

    // 计算当月最后一天所在周的周日
    const lastSunday = new Date(lastDayOfMonth);
    const lastDayOfWeek = lastDayOfMonth.getDay();
    lastSunday.setDate(lastDayOfMonth.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));

    // 计算总周数
    const totalDays = Math.round((lastSunday - firstMonday) / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    // 从第一个周一开始，生成每周的日期
    let currentDate = new Date(firstMonday);

    for (let week = 0; week < totalWeeks; week++) {
      const weekDays = [];
      const weekStartDate = new Date(currentDate);
      const weekNumber = getWeekNumber(weekStartDate);

      // 为这一周添加7天
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dayDate = new Date(currentDate);
        dayDate.setDate(currentDate.getDate() + dayOfWeek);

        const day = dayDate.getDate();
        const month = dayDate.getMonth();
        const year = dayDate.getFullYear();
        const isCurrentMonth = month === currentMonth && year === currentYear;
        const isToday = formatDate(dayDate) === formatDate(new Date());
        let isInSelectedWeek = false;
        let isWeekStart = false;
        let isWeekEnd = false;

        if (picker === 'range' && Array.isArray(selectedDate)) {
          // 周范围选择逻辑
          if (selectedDate.length === 2) {
            const startDate = parseDate(selectedDate[0]);
            const endDate = parseDate(selectedDate[1]);
            if (startDate && endDate) {
              const startWeekDates = getWeekDates(startDate);
              const endWeekDates = getWeekDates(endDate);
              
              // 检查日期是否在周范围内
              isInSelectedWeek = (dayDate >= startWeekDates.start && dayDate <= endWeekDates.end);
              
              // 判断是否是范围的开始和结束
              if (isInSelectedWeek) {
                const dayOfWeekNum = dayDate.getDay();
                // 周开始：周一且在开始周内
                isWeekStart = dayOfWeekNum === 1 && dayDate >= startWeekDates.start && dayDate <= startWeekDates.end;
                // 周结束：周日且在结束周内
                isWeekEnd = dayOfWeekNum === 0 && dayDate >= endWeekDates.start && dayDate <= endWeekDates.end;
              }
            }
          } else if (selectedDate.length === 1 && rangeStart) {
            const startWeekDates = getWeekDates(rangeStart);
            isInSelectedWeek = dayDate >= startWeekDates.start && dayDate <= startWeekDates.end;
            
            if (hoverDate) {
              const hoverWeekDates = getWeekDates(hoverDate);
              // 检查是否在悬停的周范围内
              isInSelectedWeek = isInSelectedWeek || (dayDate >= startWeekDates.start && dayDate <= hoverWeekDates.end);
            }
          }
        } else if (picker === 'single' && selectedDate) {
          const selectedWeek = parseDate(selectedDate);
          if (selectedWeek) {
            const selectedWeekDates = getWeekDates(selectedWeek);
            isInSelectedWeek = dayDate >= selectedWeekDates.start && dayDate <= selectedWeekDates.end;

            // 判断是否是周的开始和结束
            if (isInSelectedWeek) {
              const dayOfWeekNum = dayDate.getDay();
              isWeekStart = dayOfWeekNum === 1; // 周一
              isWeekEnd = dayOfWeekNum === 0; // 周日
            }
          }
        }

        const isDisabled = disabled;

        weekDays.push(
          <div
            key={`week-${week}-day-${dayOfWeek}`}
            className={`inula-datepicker-week ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isInSelectedWeek ? 'week-selected' : ''} ${isWeekStart ? 'range-start' : ''} ${isWeekEnd ? 'range-end' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={isDisabled ? undefined : () => handleDateSelect(day)}
            onMouseEnter={() => {
              if (picker === 'range' && rangeStart && !rangeEnd) {
                hoverDate = dayDate;
              }
            }}
            onMouseLeave={() => {
              if (picker === 'range') {
                hoverDate = null;
              }
            }}
            style={!isCurrentMonth ? { color: '#ccc' } : {}}
          >
            {day}
          </div>
        );
      }

      weeks.push(
        <div key={`week-${week}`} className="inula-datepicker-week-row">
          {weekDays}
        </div>
      );

      weekNumbers.push(
        <div key={`week-number-${week}`} className="inula-datepicker-week-number">
          {weekNumber}
        </div>
      );

      // 移动到下一周的周一
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return { weeks, weekNumbers };
  }

  // Render next month week view for range picker
  function renderNextMonthWeekView() {
    const { month: nextMonth, year: nextYear } = getNextMonthYear();
    const weeks = [];
    const weekNumbers = [];

    const firstDayOfMonth = new Date(nextYear, nextMonth, 1);
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstMonday.setDate(firstDayOfMonth.getDate() + diff);

    const daysInMonth = getDaysInMonth(nextYear, nextMonth);
    const lastDayOfMonth = new Date(nextYear, nextMonth, daysInMonth);
    const lastSunday = new Date(lastDayOfMonth);
    const lastDayOfWeek = lastDayOfMonth.getDay();
    lastSunday.setDate(lastDayOfMonth.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));

    const totalDays = Math.round((lastSunday - firstMonday) / (24 * 60 * 60 * 1000)) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    let currentDate = new Date(firstMonday);

    for (let week = 0; week < totalWeeks; week++) {
      const weekDays = [];
      const weekStartDate = new Date(currentDate);
      const weekNumber = getWeekNumber(weekStartDate);

      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dayDate = new Date(currentDate);
        dayDate.setDate(currentDate.getDate() + dayOfWeek);

        const day = dayDate.getDate();
        const month = dayDate.getMonth();
        const year = dayDate.getFullYear();
        const isCurrentMonth = month === nextMonth && year === nextYear;
        const isToday = formatDate(dayDate) === formatDate(new Date());
        let isInSelectedWeek = false;
        let isWeekStart = false;
        let isWeekEnd = false;

        if (picker === 'range' && Array.isArray(selectedDate)) {
          if (selectedDate.length === 2) {
            const startDate = parseDate(selectedDate[0]);
            const endDate = parseDate(selectedDate[1]);
            if (startDate && endDate) {
              const startWeekDates = getWeekDates(startDate);
              const endWeekDates = getWeekDates(endDate);
              isInSelectedWeek = (dayDate >= startWeekDates.start && dayDate <= endWeekDates.end);
              if (isInSelectedWeek) {
                const dayOfWeekNum = dayDate.getDay();
                isWeekStart = dayOfWeekNum === 1 && dayDate >= startWeekDates.start && dayDate <= startWeekDates.end;
                isWeekEnd = dayOfWeekNum === 0 && dayDate >= endWeekDates.start && dayDate <= endWeekDates.end;
              }
            }
          } else if (selectedDate.length === 1 && rangeStart) {
            const startWeekDates = getWeekDates(rangeStart);
            isInSelectedWeek = dayDate >= startWeekDates.start && dayDate <= startWeekDates.end;
            if (hoverDate) {
              const hoverWeekDates = getWeekDates(hoverDate);
              isInSelectedWeek = isInSelectedWeek || (dayDate >= startWeekDates.start && dayDate <= hoverWeekDates.end);
            }
          }
        } else if (picker === 'single' && selectedDate) {
          const selectedWeek = parseDate(selectedDate);
          if (selectedWeek) {
            const selectedWeekDates = getWeekDates(selectedWeek);
            isInSelectedWeek = dayDate >= selectedWeekDates.start && dayDate <= selectedWeekDates.end;
            if (isInSelectedWeek) {
              const dayOfWeekNum = dayDate.getDay();
              isWeekStart = dayOfWeekNum === 1;
              isWeekEnd = dayOfWeekNum === 0;
            }
          }
        }

        const isDisabled = disabled;

        weekDays.push(
          <div
            key={`next-week-${week}-day-${dayOfWeek}`}
            className={`inula-datepicker-week ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isInSelectedWeek ? 'week-selected' : ''} ${isWeekStart ? 'range-start' : ''} ${isWeekEnd ? 'range-end' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={isDisabled ? undefined : () => handleNextMonthDateSelect(day)}
            onMouseEnter={() => {
              if (picker === 'range' && rangeStart && !rangeEnd) {
                hoverDate = dayDate;
              }
            }}
            onMouseLeave={() => {
              if (picker === 'range') {
                hoverDate = null;
              }
            }}
            style={!isCurrentMonth ? { color: '#ccc' } : {}}
          >
            {day}
          </div>
        );
      }

      weeks.push(
        <div key={`next-week-${week}`} className="inula-datepicker-week-row">
          {weekDays}
        </div>
      );

      weekNumbers.push(
        <div key={`next-week-number-${week}`} className="inula-datepicker-week-number">
          {weekNumber}
        </div>
      );

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return { weeks, weekNumbers };
  }

  // Render month view
  function renderMonthView() {
    const months = [];

    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (picker === 'range' && Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          const startDate = parseDate(selectedDate[0]);
          const endDate = parseDate(selectedDate[1]);
          if (startDate && endDate) {
            isRangeStart = formatMonth(date) === formatMonth(startDate);
            isRangeEnd = formatMonth(date) === formatMonth(endDate);
            isInRange = date >= startDate && date <= endDate;
          }
        } else if (selectedDate.length === 1 && rangeStart) {
          isRangeStart = formatMonth(date) === formatMonth(rangeStart);
        }
      } else if (picker === 'single') {
        isSelected = selectedDate === formatMonth(date);
      }

      months.push(
        <div
          key={month}
          className={`inula-datepicker-month ${isSelected ? 'selected' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''} ${isInRange ? 'in-range' : ''}`}
          onClick={() => handleMonthSelect(month)}
        >
          {monthNames[month]}
        </div>
      );
    }

    return months;
  }

  // Render quarter view
  function renderQuarterView() {
    const quarters = [];

    for (let quarter = 1; quarter <= 4; quarter++) {
      const date = new Date(currentYear, (quarter - 1) * 3, 1);
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (picker === 'range' && Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          const startDate = parseDate(selectedDate[0]);
          const endDate = parseDate(selectedDate[1]);
          if (startDate && endDate) {
            isRangeStart = formatQuarter(date) === formatQuarter(startDate);
            isRangeEnd = formatQuarter(date) === formatQuarter(endDate);
            isInRange = date >= startDate && date <= endDate;
          }
        } else if (selectedDate.length === 1 && rangeStart) {
          isRangeStart = formatQuarter(date) === formatQuarter(rangeStart);
        }
      } else if (picker === 'single') {
        isSelected = selectedDate === formatQuarter(date);
      }

      quarters.push(
        <div
          key={quarter}
          className={`inula-datepicker-quarter ${isSelected ? 'selected' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''} ${isInRange ? 'in-range' : ''}`}
          onClick={() => handleQuarterSelect(quarter)}
        >
          Q{quarter}
        </div>
      );
    }

    return quarters;
  }

  // Render year view
  function renderYearView() {
    const years = [];
    const startYear = currentYear - 5;

    for (let year = startYear; year <= startYear + 9; year++) {
      const date = new Date(year, 0, 1);
      let isSelected = false;
      let isRangeStart = false;
      let isRangeEnd = false;
      let isInRange = false;

      if (picker === 'range' && Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          const startDate = parseDate(selectedDate[0]);
          const endDate = parseDate(selectedDate[1]);
          if (startDate && endDate) {
            isRangeStart = formatYear(date) === formatYear(startDate);
            isRangeEnd = formatYear(date) === formatYear(endDate);
            isInRange = date >= startDate && date <= endDate;
          }
        } else if (selectedDate.length === 1 && rangeStart) {
          isRangeStart = formatYear(date) === formatYear(rangeStart);
        }
      } else if (picker === 'single') {
        isSelected = selectedDate === formatYear(date);
      }

      years.push(
        <div
          key={year}
          className={`inula-datepicker-year ${isSelected ? 'selected' : ''} ${isRangeStart ? 'range-start' : ''} ${isRangeEnd ? 'range-end' : ''} ${isInRange ? 'in-range' : ''}`}
          onClick={() => handleYearSelect(year)}
        >
          {year}
        </div>
      );
    }

    return years;
  }

  // Month names for display
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  // Day names for display
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // Week names for display
  const weekNames = ['一', '二', '三', '四', '五', '六', '日'];

  // Determine size class
  const sizeClass = size === 'small' ? 'inula-datepicker-small' :
    size === 'large' ? 'inula-datepicker-large' : '';

  // Get placeholder based on mode and picker type
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    const baseText = (() => {
      switch (mode) {
        case 'week':
          return '周';
        case 'month':
          return '月份';
        case 'quarter':
          return '季度';
        case 'year':
          return '年份';
        default:
          return '日期';
      }
    })();

    return picker === 'range' ? `请选择${baseText}范围` : `请选择${baseText}`;
  };

  // Get display value for input
  const getDisplayValue = () => {
    if (picker === 'range') {
      if (Array.isArray(selectedDate)) {
        if (selectedDate.length === 2) {
          return `${selectedDate[0]}  ~  ${selectedDate[1]}`;
        } else if (selectedDate.length === 1) {
          return selectedDate[0];
        }
      }
      return '';
    }
    return selectedDate || '';
  };

  // Get range start value
  const getRangeStartValue = () => {
    if (Array.isArray(selectedDate) && selectedDate.length > 0) {
      return selectedDate[0];
    }
    return '';
  };

  // Get range end value
  const getRangeEndValue = () => {
    if (Array.isArray(selectedDate) && selectedDate.length > 1) {
      return selectedDate[1];
    }
    return '';
  };

  return (
    <div
      className={`inula-datepicker ${picker === 'range' ? 'inula-datepicker-range' : ''} ${disabled ? 'inula-datepicker-disabled' : ''} ${sizeClass} ${className}`}
      tabIndex={0}
      onBlur={handleBlur}
      style={style}
      {...rest}
    >
      <div
        className="inula-datepicker-input"
        onClick={(e) => handleToggle(e)}
      >
        {picker === 'range' ? (
          <>
            <input
              type="text"
              placeholder="开始日期"
              value={getRangeStartValue()}
              readOnly
              disabled={disabled}
              className="inula-datepicker-range-start"
              onMouseEnter={onIconHover}
              onMouseLeave={onIconLeave}
            />
            <span className="inula-datepicker-separator">~</span>
            <input
              type="text"
              placeholder="结束日期"
              value={getRangeEndValue()}
              readOnly
              disabled={disabled}
              className="inula-datepicker-range-end"
              onMouseEnter={onIconHover}
              onMouseLeave={onIconLeave}
            />
            <if cond={((Array.isArray(selectedDate) && selectedDate.length > 0)) && clearable && !disabled && hoverIcon}>
              <span onMouseEnter={onIconHover}
                onMouseLeave={onIconLeave} className="inula-datepicker-icon" onClick={handleClear}><Icon value="xmark" size={14} color="#999" /></span>
            </if>
            <else>
              <span onMouseEnter={onIconHover}
                onMouseLeave={onIconLeave} className="inula-datepicker-icon" ><Icon value="calendar" size={16} color="#999" /></span>
            </else>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={getDisplayValue()}
              readOnly
              disabled={disabled}
              onMouseEnter={onIconHover}
              onMouseLeave={onIconLeave}
            />
            <if cond={selectedDate && clearable && !disabled && hoverIcon}>
              <span onMouseEnter={onIconHover}
                onMouseLeave={onIconLeave} className="inula-datepicker-icon" onClick={handleClear}><Icon value="xmark" size={14} color="#999" /></span>
            </if>
            <else>
              <span onMouseEnter={onIconHover}
                onMouseLeave={onIconLeave} className="inula-datepicker-icon" ><Icon value="calendar" size={16} color="#999" /></span>
            </else>
          </>
        )}
      </div>

      {isOpen && (
        <div className="inula-datepicker-dropdown" onClick={(e) => e.stopPropagation()}>
          {picker !== 'range' && (
            <div className="inula-datepicker-header">
              <button className="inula-datepicker-prev-year" onClick={handlePrevYear}>
                <span>«</span>
              </button>
              {(mode === 'date' || mode === 'week') && (
                <button className="inula-datepicker-prev-month" onClick={handlePrevMonth}>
                  <span>‹</span>
                </button>
              )}
              <span className="inula-datepicker-header-view">
                {mode === 'date' && `${currentYear}年 ${monthNames[currentMonth]}`}
                {mode === 'week' && `${currentYear}年 ${monthNames[currentMonth]}`}
                {mode === 'month' && `${currentYear}年`}
                {mode === 'quarter' && `${currentYear}年`}
                {mode === 'year' && `${currentYear - 5}年-${currentYear + 4}年`}
              </span>
              {(mode === 'date' || mode === 'week') && (
                <button className="inula-datepicker-next-month" onClick={handleNextMonth}>
                  <span>›</span>
                </button>
              )}
              <button className="inula-datepicker-next-year" onClick={handleNextYear}>
                <span>»</span>
              </button>
            </div>
          )}

          <div className="inula-datepicker-body">
            {picker === 'range' && mode === 'date' ? (
              <>
                {/* 左侧月份面板 */}
                <div className="inula-datepicker-panel">
                  <div className="inula-datepicker-panel-header">
                    <button onClick={handlePrevYear}>
                      <span>«</span>
                    </button>
                    <button onClick={handlePrevMonth}>
                      <span>‹</span>
                    </button>
                    <span className="inula-datepicker-panel-title">
                      {currentYear}年 {monthNames[currentMonth]}
                    </span>
                    <div style={{ width: '48px' }}></div>
                  </div>
                  <div className="inula-datepicker-days">
                    {dayNames.map((day, index) => (
                      <div key={index} className="inula-datepicker-day-name">{day}</div>
                    ))}
                  </div>
                  <div className="inula-datepicker-days">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* 右侧月份面板 */}
                <div className="inula-datepicker-panel">
                  <div className="inula-datepicker-panel-header">
                    <div style={{ width: '48px' }}></div>
                    <span className="inula-datepicker-panel-title">
                      {getNextMonthYear().year}年 {monthNames[getNextMonthYear().month]}
                    </span>
                    <button className="inula-datepicker-next-month" onClick={handleNextMonth}>
                      <span>›</span>
                    </button>
                    <button className="inula-datepicker-next-year" onClick={handleNextYear}>
                      <span>»</span>
                    </button>
                  </div>
                  <div className="inula-datepicker-days">
                    {dayNames.map((day, index) => (
                      <div key={index} className="inula-datepicker-day-name">{day}</div>
                    ))}
                  </div>
                  <div className="inula-datepicker-days">
                    {renderNextMonthCalendarDays()}
                  </div>
                </div>
              </>
            ) : picker === 'range' && mode === 'week' ? (
              <>
                {/* 左侧周面板 */}
                <div className="inula-datepicker-panel inula-datepicker-calendar">
                  <div className="inula-datepicker-panel-header">
                    <button onClick={handlePrevYear}>
                      <span>«</span>
                    </button>
                    <button onClick={handlePrevMonth}>
                      <span>‹</span>
                    </button>
                    <span className="inula-datepicker-panel-title">
                      {currentYear}年 {monthNames[currentMonth]}
                    </span>
                    <div style={{ width: '48px' }}></div>
                  </div>
                  <div className="inula-datepicker-weekdays">
                    {weekNames.map((day, index) => (
                      <div key={index} className="inula-datepicker-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="inula-datepicker-week-container">
                    <div className="inula-datepicker-week-numbers">
                      {renderWeekView().weekNumbers}
                    </div>
                    <div className="inula-datepicker-weeks">
                      {renderWeekView().weeks}
                    </div>
                  </div>
                </div>

                {/* 右侧周面板 */}
                <div className="inula-datepicker-panel inula-datepicker-calendar">
                  <div className="inula-datepicker-panel-header">
                    <div style={{ width: '48px' }}></div>
                    <span className="inula-datepicker-panel-title">
                      {getNextMonthYear().year}年 {monthNames[getNextMonthYear().month]}
                    </span>
                    <button className="inula-datepicker-next-month" onClick={handleNextMonth}>
                      <span>›</span>
                    </button>
                    <button className="inula-datepicker-next-year" onClick={handleNextYear}>
                      <span>»</span>
                    </button>
                  </div>
                  <div className="inula-datepicker-weekdays">
                    {weekNames.map((day, index) => (
                      <div key={index} className="inula-datepicker-weekday">{day}</div>
                    ))}
                  </div>
                  <div className="inula-datepicker-week-container">
                    <div className="inula-datepicker-week-numbers">
                      {renderNextMonthWeekView().weekNumbers}
                    </div>
                    <div className="inula-datepicker-weeks">
                      {renderNextMonthWeekView().weeks}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {mode === 'date' && (
                  <>
                    <div className="inula-datepicker-days">
                      {dayNames.map((day, index) => (
                        <div key={index} className="inula-datepicker-day-name">{day}</div>
                      ))}
                    </div>
                    <div className="inula-datepicker-days">
                      {renderCalendarDays()}
                    </div>
                  </>
                )}
                {mode === 'week' && (
                  <>
                    <div className="inula-datepicker-weekdays">
                      {weekNames.map((day, index) => (
                        <div key={index} className="inula-datepicker-weekday">{day}</div>
                      ))}
                    </div>
                    <div className="inula-datepicker-week-container">
                      <div className="inula-datepicker-week-numbers">
                        {renderWeekView().weekNumbers}
                      </div>
                      <div className="inula-datepicker-weeks">
                        {renderWeekView().weeks}
                      </div>
                    </div>
                  </>
                )}
                {mode === 'month' && (
                  <div className="inula-datepicker-months">
                    {renderMonthView()}
                  </div>
                )}
                {mode === 'quarter' && (
                  <div className="inula-datepicker-quarters">
                    {renderQuarterView()}
                  </div>
                )}
                {mode === 'year' && (
                  <div className="inula-datepicker-years">
                    {renderYearView()}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="inula-datepicker-footer">
            <div>
              {showToday && (
                <Button type="primary" onClick={handleTodayClick}>
                  今天
                </Button>
              )}
            </div>
            <div>
              {needConfirm && (
                <Button type="primary" onClick={handleConfirm}>
                  确定
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
