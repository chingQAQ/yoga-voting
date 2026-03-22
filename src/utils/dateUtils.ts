/**
 * 取得下個月所有週一的日期 (格式: YYYY-MM-DD)
 */
export function getNextMonthMondays(): string[] {
  const now = new Date();
  // 1. 設定到下個月的第一天
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = nextMonth.getMonth();
  const mondays: string[] = [];

  // 2. 找到下個月的第一個週一
  // getDay() 回傳 0(日) 到 6(六)，週一是 1
  const day = nextMonth.getDay();
  const diff = (day === 0) ? 1 : (day === 1 ? 0 : 8 - day);
  nextMonth.setDate(nextMonth.getDate() + diff);

  // 3. 迴圈跑完該月所有的週一
  while (nextMonth.getMonth() === month) {
    // 格式化為 YYYY-MM-DD (補零處理)
    const yyyy = nextMonth.getFullYear();
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(nextMonth.getDate()).padStart(2, '0');
    
    mondays.push(`${yyyy}-${mm}-${dd}`);
    
    // 跳到下週
    nextMonth.setDate(nextMonth.getDate() + 7);
  }

  return mondays;
}
