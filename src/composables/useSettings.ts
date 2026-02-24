import { reactive, watch } from "vue";

export interface SalaryRecord {
  id: string;
  date: string; // YYYY-MM 格式，代表從該月份 1 號開始生效
  amount: number;
}

export interface TargetGoal {
  id: string;
  name: string;
  amount: number;
}

export interface UserSettings {
  payday: number;
  workStartTime: string;
  workEndTime: string;
  lunchStartTime: string;
  showOffWork: boolean;
  showHoliday: boolean;
  showPayday: boolean;
  hireDate: string;
  baseSalary: number;
  targetGoals: TargetGoal[];
  salaryRecords: SalaryRecord[];
}

const STORAGE_KEY = "toy-box-settings";

const defaultSettings: UserSettings = {
  payday: 5,
  workStartTime: "08:30",
  workEndTime: "17:30",
  lunchStartTime: "12:00",
  showOffWork: false,
  showHoliday: false,
  showPayday: true,
  hireDate: new Date().toISOString().split("T")[0],
  baseSalary: 30000,
  targetGoals: [
    { id: crypto.randomUUID(), name: "第一個 100 萬", amount: 1000000 },
  ],
  salaryRecords: [],
};

// 從 localStorage 讀取初始值
const loadSettings = (): UserSettings => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultSettings };
  try {
    const parsed = JSON.parse(saved);
    // 確保舊使用者也能獲得新的目標欄位
    return {
      ...defaultSettings,
      ...parsed,
      targetGoals: parsed.targetGoals || [...defaultSettings.targetGoals],
    };
  } catch (e) {
    console.error("Failed to parse settings:", e);
    return { ...defaultSettings };
  }
};

// 全域共用的響應式狀態
const settings = reactive<UserSettings>(loadSettings());

// 自動儲存變更
watch(
  settings,
  (newSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  },
  { deep: true },
);

export function useSettings() {
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    Object.assign(settings, newSettings);
  };

  const addSalaryRecord = (record: Omit<SalaryRecord, "id">) => {
    settings.salaryRecords.push({
      ...record,
      id: crypto.randomUUID(),
    });
  };

  const removeSalaryRecord = (id: string) => {
    settings.salaryRecords = settings.salaryRecords.filter((r) => r.id !== id);
  };

  const updateSalaryRecord = (id: string, updates: Partial<SalaryRecord>) => {
    const index = settings.salaryRecords.findIndex((r) => r.id === id);
    if (index !== -1) {
      settings.salaryRecords[index] = {
        ...settings.salaryRecords[index],
        ...updates,
      };
    }
  };

  const addTargetGoal = (goal: Omit<TargetGoal, "id">) => {
    settings.targetGoals.push({
      ...goal,
      id: crypto.randomUUID(),
    });
  };

  const removeTargetGoal = (id: string) => {
    settings.targetGoals = settings.targetGoals.filter((g) => g.id !== id);
  };

  return {
    settings,
    updateSettings,
    addSalaryRecord,
    removeSalaryRecord,
    updateSalaryRecord,
    addTargetGoal,
    removeTargetGoal,
  };
}
