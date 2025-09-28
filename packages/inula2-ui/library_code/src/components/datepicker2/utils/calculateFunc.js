import { formatDateToObject } from "./formatFunc";
//计算给定年月有多少天
export function calculateDaysInYearMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

//计算当年当月的下一个区间
export function calculateNextRange(year, month, type) {
  switch (type) {
    case "date":
    case "week": {
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonth = month === 12 ? 1 : month + 1;
      return { nextYear, nextMonth };
    }
    case "month":
    case "quarter": {
      const nextYear = year + 1;
      const nextMonth = month;
      return { nextYear, nextMonth };
    }
    case "year": {
      const nextYear = year + 10;
      const nextMonth = month;
      return { nextYear, nextMonth };
    }
  }
}

//计算给定年月的当月第一天是星期几
export function calculateFirstWeekDayInYearMonth(year, month) {
  return ((new Date(year, month - 1, 1).getDay() + 6) % 7) + 1;
}

//日期选择器，计算当前渲染年月的calendar渲染数组
export function calculateRenderDateItems(year, month) {
  const curMonthDays = calculateDaysInYearMonth(year, month);
  const curStartWeek = calculateFirstWeekDayInYearMonth(year, month);
  const preMonthDays = calculateDaysInYearMonth(
    month === 1 ? year - 1 : year,
    month === 1 ? 12 : month - 1
  );
  const preMonth = month === 1 ? 12 : month - 1;
  const preYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const items = [];
  for (let i = curStartWeek - 1; i >= 1; i--) {
    items.push({
      year: preYear,
      month: preMonth,
      day: preMonthDays - i + 1,
      isThisPage: false,
    });
  }

  for (let i = 1; i <= curMonthDays; i++) {
    items.push({
      year: year,
      month: month,
      day: i,
      isThisPage: true,
    });
  }

  for (let i = 1; i <= 42 - (curStartWeek + curMonthDays) + 1; i++) {
    items.push({
      year: nextYear,
      month: nextMonth,
      day: i,
      isThisPage: false,
    });
  }

  return items;
}

//周选择器，计算当前的calendar渲染数组
export function calculateRenderWeekItems(year, month) {
  const curMonthDays = calculateDaysInYearMonth(year, month);
  const curStartWeek = calculateFirstWeekDayInYearMonth(year, month);
  const preMonthDays = calculateDaysInYearMonth(
    month === 1 ? year - 1 : year,
    month === 1 ? 12 : month - 1
  );
  const preMonth = month === 1 ? 12 : month - 1;
  const preYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const items = [];
  let weekCount = calculateWeekOfYearForFirstDay(year, month);
  let dayCount = 0;
  for (let i = curStartWeek - 1; i >= 1; i--) {
    if (dayCount % 7 === 0) {
      items.push({
        year: preYear,
        month: preMonth,
        week: weekCount,
        day: null,
        isThisPage: false,
      });
      weekCount++;
    }
    items.push({
      year: preYear,
      month: preMonth,
      week: weekCount - 1,
      day: preMonthDays - i + 1,
      isThisPage: false,
    });
    dayCount++;
  }

  for (let i = 1; i <= curMonthDays; i++) {
    if (dayCount % 7 === 0) {
      items.push({
        year: year,
        month: month,
        week: weekCount,
        day: null,
        isThisPage: false,
      });
      weekCount++;
    }
    items.push({
      year: year,
      month: month,
      week: weekCount - 1,
      day: i,
      isThisPage: true,
    });
    dayCount++;
  }

  for (let i = 1; i <= 42 - (curStartWeek + curMonthDays) + 1; i++) {
    if (dayCount % 7 === 0) {
      items.push({
        year: nextYear,
        month: nextMonth,
        week: weekCount,
        day: null,
        isThisPage: false,
      });
      weekCount++;
    }
    items.push({
      year: nextYear,
      month: nextMonth,
      week: weekCount - 1,
      day: i,
      isThisPage: false,
    });
    dayCount++;
  }

  const ROW = 6,
    COL = 8,
    TOTAL = ROW * COL;
  while (items.length < TOTAL) items.push({});

  const matrix = [];
  for (let r = 0; r < ROW; r++) {
    matrix.push(items.slice(r * COL, (r + 1) * COL));
  }
  return matrix;
}

//年、季度、月选择器，计算当前calendar渲染数组
export function calculateRenderYQMItems(type, year) {
  const items = [];
  switch (type) {
    case "year": {
      const curYearStart = Math.floor(year / 10) * 10;
      items.push({ year: curYearStart - 1, isThisPage: false });
      for (let i = curYearStart; i <= curYearStart + 9; i++) {
        items.push({ year: i, isThisPage: true });
      }
      items.push({ year: curYearStart + 10, isThisPage: false });

      return items;
    }
    case "month": {
      for (let i = 1; i <= 12; i++) {
        items.push({ month: i, isThisPage: true });
      }
      return items;
    }
    case "quarter": {
      for (let i = 1; i <= 4; i++) {
        items.push({ quarter: i, isThisPage: true });
      }
      return items;
    }
  }
}

//计算某年某月某日是某年第几周
export function calculateCurWeek(year, month, day) {
  const date = new Date(year, month - 1, day);

  // 设置日期为当前日期的周四（ISO周计算中，周四决定属于哪一周）
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 4 - (date.getDay() || 7)); // 周日为0，转为7

  const yearStart = new Date(thursday.getFullYear(), 0, 1);

  const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);

  return week;
}

//根据年、月计算当月第一天是当年第几周
export function calculateWeekOfYearForFirstDay(year, month) {
  // 当月第一天
  const firstDay = new Date(year, month - 1, 1);

  // 复制一份，避免污染原日期
  const target = new Date(firstDay);
  const WEEK_START = 1;

  const day = target.getDay();
  const offset = (day + 7 - WEEK_START) % 7;
  target.setDate(target.getDate() - offset);

  // 当年 1 月 1 日
  const yearStart = new Date(year, 0, 1);
  const yearStartDay = yearStart.getDay();
  const yearStartOffset = (yearStartDay + 7 - WEEK_START) % 7;

  yearStart.setDate(yearStart.getDate() - yearStartOffset);

  const delta = firstDay - yearStart; // 毫秒
  const week = Math.floor(delta / (7 * 24 * 3600 * 1000)) + 1;

  return week;
}

//计算当前状态的年月日
export function getTodayDate() {
  const date = new Date();
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

//对比函数，targetDate > baseDate ? true : false
export function compareDate(baseDate, targetDate, type) {
  if (!baseDate || !targetDate) return false;
  let baseDateObj;
  let targetDateObj;
  if (Object.prototype.toString.call(targetDate).slice(8, -1) === "String")
    targetDateObj = formatDateToObject(targetDate, "", type);
  else targetDateObj = targetDate;
  if (Object.prototype.toString.call(baseDate).slice(8, -1) === "String")
    baseDateObj = formatDateToObject(baseDate, "", type);
  else baseDateObj = baseDate;

  switch (type) {
    case "date": {
      if (targetDateObj.year > baseDateObj.year) {
        return true;
      } else if (
        targetDateObj.year === baseDateObj.year &&
        targetDateObj.month > baseDateObj.month
      ) {
        return true;
      } else if (
        targetDateObj.year === baseDateObj.year &&
        targetDateObj.month === baseDateObj.month &&
        targetDateObj.day >= baseDateObj.day
      ) {
        return true;
      }
      break;
    }
    case "week": {
      if (targetDateObj.year > baseDateObj.year) {
        return true;
      } else if (
        targetDateObj.year === baseDateObj.year &&
        targetDateObj.week >= baseDateObj.week
      ) {
        return true;
      }
      break;
    }
    case "month": {
      if (targetDateObj.year > baseDateObj.year) {
        return true;
      } else if (
        targetDateObj.year === baseDateObj.year &&
        targetDateObj.month >= baseDateObj.month
      ) {
        return true;
      }
      break;
    }
    case "quarter": {
      if (targetDateObj.year > baseDateObj.year) {
        return true;
      } else if (
        targetDateObj.year === baseDateObj.year &&
        targetDateObj.quarter >= baseDateObj.quarter
      ) {
        return true;
      }
      break;
    }
    case "year": {
      return targetDateObj.year >= baseDateObj.year;
    }
  }

  return false;
}

export function isEqualedDate(stringBaseDate, objTargetDate, type) {
  if (!stringBaseDate) return false;
  const objBaseDate = formatDateToObject(stringBaseDate, "", type);
  if (type === "week") console.log(111);
  switch (type) {
    case "date": {
      return (
        objBaseDate.year === objTargetDate.year &&
        objBaseDate.month === objTargetDate.month &&
        objBaseDate.day === objTargetDate.day
      );
    }
    case "week": {
      console.log(
        stringBaseDate,
        objTargetDate,
        objBaseDate.year === objTargetDate.year &&
          objBaseDate.week === objTargetDate.week
      );
      return (
        objBaseDate.year === objTargetDate.year &&
        objBaseDate.week === objTargetDate.week
      );
    }
    case "month": {
      return (
        objBaseDate.year === objTargetDate.year &&
        objBaseDate.month === objTargetDate.month
      );
    }
    case "quarter": {
      return (
        objBaseDate.year === objTargetDate.year &&
        objBaseDate.quarter === objTargetDate.quarter
      );
    }
    case "year": {
      return objBaseDate.year === objTargetDate.year;
    }
  }
  return false;
}

const defaultString = (item, type) => {
  switch (type) {
    case "date":
      return `${item.year}-${item.month}-${item.day}`;
    case "week":
      return `${item.year}-${item.week}周`;
    case "month":
      return `${item.year}-${item.month}`;
    case "quarter":
      return `${item.year}-Q${item.quarter}`;
    case "year":
      return `${item.year}`;
  }
};

export function isSelected(
  selectValue,
  confirmValue,
  startConfirmValue,
  endConfirmValue,
  defaultValue,
  hoverValue,
  focusState,
  item,
  type
) {
  if (type === "week" || item.isThisTitleRange) return false;

  if (selectValue) {
    return selectValue === defaultString(item, type);
  } else {
    if (confirmValue) {
      return isEqualedDate(confirmValue, item, type);
    }
    if (startConfirmValue) {
      if (focusState === "10" && hoverValue) return false;
      return isEqualedDate(startConfirmValue, item, type);
    }
    if (endConfirmValue) {
      if (focusState === "01" && hoverValue) return false;
      return isEqualedDate(endConfirmValue, item, type);
    }
    if (defaultValue) {
      return isEqualedDate(defaultValue, item, type);
    }
  }
}

// range样式计算函数
export function isInRangeDate(
  focusState,
  rangeHoverValue,
  startConfirmValue,
  endConfirmValue,
  startSelectValue,
  endSelectValue,
  item,
  type
) {
  if (type === "week" || !item.isThisTitleRange) return false;
  if (!rangeHoverValue) {
    if (startSelectValue && endSelectValue) {
      return (
        (compareDate(startSelectValue, item, type) &&
          compareDate(item, endSelectValue, type)) ||
        (compareDate(endSelectValue, item, type) &&
          compareDate(item, startSelectValue, type))
      );
    }
    if (startSelectValue) {
      return (
        (compareDate(startSelectValue, item, type) &&
          compareDate(item, endConfirmValue, type)) ||
        (compareDate(endConfirmValue, item, type) &&
          compareDate(item, startSelectValue, type))
      );
    } else if (endSelectValue) {
      return (
        (compareDate(startConfirmValue, item, type) &&
          compareDate(item, endSelectValue, type)) ||
        (compareDate(endSelectValue, item, type) &&
          compareDate(item, startConfirmValue, type))
      );
    }
    return (
      compareDate(startConfirmValue, item, type) &&
      compareDate(item, endConfirmValue, type)
    );
  } else {
    if (focusState === "01") {
      return (
        (compareDate(rangeHoverValue, startConfirmValue, type) &&
          compareDate(rangeHoverValue, item, type) &&
          compareDate(item, startConfirmValue, type)) ||
        (compareDate(startConfirmValue, rangeHoverValue, type) &&
          compareDate(startConfirmValue, item, type) &&
          compareDate(item, rangeHoverValue, type))
      );
    } else if (focusState === "10") {
      return (
        (compareDate(rangeHoverValue, endConfirmValue, type) &&
          compareDate(rangeHoverValue, item, type) &&
          compareDate(item, endConfirmValue, type)) ||
        (compareDate(endConfirmValue, rangeHoverValue, type) &&
          compareDate(endConfirmValue, item, type) &&
          compareDate(item, rangeHoverValue, type))
      );
    }
  }
}
