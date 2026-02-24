import dayjs from "dayjs";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useSettings } from "./useSettings";

export function useSalaryAccumulator() {
  const { settings } = useSettings();
  const now = ref(dayjs());
  let timer: number;

  onMounted(() => {
    // 0.1s 更新一次，讓數字跳動更平滑，像遊戲攻擊數
    timer = window.setInterval(() => {
      now.value = dayjs();
    }, 100);
  });

  onUnmounted(() => clearInterval(timer));

  /**
   * 計算至今累計薪資
   * 邏輯：
   * 1. 過去的每一天 (包括假日)：獲得該月日薪 (月薪 / 該月天數)
   * 2. 今天：根據目前時間，在工作時段內按比例增加。
   *    - 總工作秒數 = 8 小時 = 28,800 秒
   *    - 秒薪 = 當日日薪 / 28,800
   */
  const totalAccumulatedSalary = computed(() => {
    const hireDate = dayjs(settings.hireDate).startOf("day");
    const today = dayjs().startOf("day");

    if (now.value.isBefore(hireDate)) return 0;

    // --- A. 計算從到職日到昨天的累積 ---
    let total = 0;

    // 遍歷每一段薪資週期
    const timeline = [
      { date: hireDate, amount: settings.baseSalary },
      ...settings.salaryRecords
        .map((r) => ({
          date: dayjs(r.date).startOf("month"),
          amount: r.amount,
        }))
        .filter((r) => r.date.isAfter(hireDate)),
    ].sort((a, b) => a.date.unix() - b.date.unix());

    for (let i = 0; i < timeline.length; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];
      const start = current.date;
      let end = next ? next.date : today; // 算到昨天為止

      // 如果這段薪資是在今天之後才開始，跳過
      if (start.isAfter(today) || start.isSame(today)) continue;
      if (end.isAfter(today)) end = today;

      // 在這個薪資區段內，每個月分開算（因為每月天數不同）
      let tempDate = start;
      while (tempDate.isBefore(end)) {
        const daysInMonth = tempDate.daysInMonth();
        const dailyRate = current.amount / daysInMonth;

        // 找出這個月在這個區段內的有效天數
        const monthEnd = tempDate.endOf("month").add(1, "day");
        const actualEnd = monthEnd.isAfter(end) ? end : monthEnd;
        const daysCount = actualEnd.diff(tempDate, "day");

        total += daysCount * dailyRate;
        tempDate = actualEnd;
      }
    }

    // --- B. 計算今天的即時累積 ---
    const currentBaseSalary =
      [...timeline]
        .reverse()
        .find(
          (r) => r.date.isBefore(now.value) || r.date.isSame(now.value, "day"),
        )?.amount || settings.baseSalary;

    const daysInCurrentMonth = now.value.daysInMonth();
    const todayDailyRate = currentBaseSalary / daysInCurrentMonth;
    const workSecondsPerDay = 8 * 3600; // 8小時工時
    const ratePerWorkSec = todayDailyRate / workSecondsPerDay;

    // 解析今天的時間點
    const parseTodayTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return now.value.hour(h).minute(m).second(0);
    };

    const workStart = parseTodayTime(settings.workStartTime);
    const workEnd = parseTodayTime(settings.workEndTime);
    const lunchStart = parseTodayTime(settings.lunchStartTime);
    const lunchEnd = lunchStart.add(1, "hour");

    let activeSecs = 0;

    if (now.value.isAfter(workStart)) {
      const currentEnd = now.value.isAfter(workEnd) ? workEnd : now.value;

      // 基礎工時 (到目前為止經過的秒數)
      activeSecs = currentEnd.diff(workStart, "second");

      // 扣除午休 (如果現在已經過了午休)
      if (now.value.isAfter(lunchStart)) {
        const lunchOverlappedSecs =
          Math.min(currentEnd.unix(), lunchEnd.unix()) -
          Math.max(workStart.unix(), lunchStart.unix());
        if (lunchOverlappedSecs > 0) {
          activeSecs -= lunchOverlappedSecs;
        }
      }
    }

    // 確保不會算出負數或超過一天產值
    activeSecs = Math.max(0, Math.min(workSecondsPerDay, activeSecs));
    total += activeSecs * ratePerWorkSec;

    return total;
  });

  /** 目標進度統計列表 */
  const targetGoalStats = computed(() => {
    // 獲取目前的月薪用於預估
    const currentBaseSalary =
      [...settings.salaryRecords]
        .map((r) => ({ date: dayjs(r.date), amount: r.amount }))
        .sort((a, b) => b.date.unix() - a.date.unix())
        .find(
          (r) => r.date.isBefore(now.value) || r.date.isSame(now.value, "day"),
        )?.amount || settings.baseSalary;

    // 估算日薪 (以平均 30.44 天計算)
    const dailyRate = currentBaseSalary / 30.44;

    const stats = settings.targetGoals.map((goal) => {
      const progress =
        goal.amount > 0
          ? (totalAccumulatedSalary.value / goal.amount) * 100
          : 0;
      const formattedProgress = Math.min(100, parseFloat(progress.toFixed(2)));

      let estimatedArrival = null;
      if (progress < 100 && dailyRate > 0) {
        const remaining = goal.amount - totalAccumulatedSalary.value;
        const daysNeeded = remaining / dailyRate;
        estimatedArrival = dayjs().add(daysNeeded, "day");
      } else if (progress >= 100) {
        // 已達標標記為已達標
        estimatedArrival = null; // 或者可以設為一個過去的值，但這裡為了排序邏輯設為 null
      }

      return {
        ...goal,
        progress: formattedProgress,
        estimatedArrivalDate: estimatedArrival,
        isCompleted: progress >= 100,
      };
    });

    // 排序邏輯：
    // 1. 未達標的排前面，且預計時間越近越前面
    // 2. 已達標的排後面，且金額越大排越前面 (代表越遠大的目標達成了)
    return stats.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;

      if (!a.isCompleted && !b.isCompleted) {
        // 兩個都未達標，比時間 (近的在前)
        return (
          (a.estimatedArrivalDate?.unix() || 0) -
          (b.estimatedArrivalDate?.unix() || 0)
        );
      }

      // 兩個都已達標，比金額 (大的在前)
      return b.amount - a.amount;
    });
  });

  return {
    totalAccumulatedSalary,
    targetGoalStats,
    now,
  };
}
