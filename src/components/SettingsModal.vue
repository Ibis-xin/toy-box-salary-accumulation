<template>
  <Transition name="fade">
    <div v-if="props.show" class="settings-overlay" @click.self="handleClose">
      <div class="settings-modal">
        <header data-tauri-drag-region class="settings-header">
          <div class="header-left">
            <button
              v-if="activeTab !== 'menu'"
              class="back-btn"
              @click="activeTab = 'menu'"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2>{{ tabTitles[activeTab] }}</h2>
          </div>
          <button class="close-btn" @click="handleClose">&times;</button>
        </header>

        <main data-tauri-drag-region class="settings-content">
          <Transition :name="transitionName" mode="out-in">
            <MenuList
              v-if="activeTab === 'menu'"
              :items="menuItems"
              v-model="activeTab"
            ></MenuList>

            <!-- 薪資設定 -->
            <div v-else-if="activeTab === 'salary'" class="submenu-content">
              <div data-tauri-drag-region class="input-stack">
                <div data-tauri-drag-region class="input-item-row">
                  <label>到職日期</label>
                  <input type="date" v-model="settings.hireDate" />
                </div>
                <div data-tauri-drag-region class="input-item-row">
                  <label>到職薪資</label>
                  <input type="number" v-model.number="settings.baseSalary" />
                </div>
              </div>

              <div data-tauri-drag-region class="separator"></div>

              <div data-tauri-drag-region class="section-header">
                <span class="info-text">調薪歷史紀錄</span>
                <button class="add-btn" @click="handleAddSalaryRecord">
                  + 新增
                </button>
              </div>

              <div data-tauri-drag-region class="events-list">
                <div
                  v-for="record in sortedSalaryRecords"
                  :key="record.id"
                  class="event-item"
                >
                  <div class="event-inputs">
                    <input type="month" v-model="record.date" />
                    <input
                      type="number"
                      v-model.number="record.amount"
                      placeholder="金額"
                    />
                  </div>
                  <div class="event-actions">
                    <button
                      class="delete-btn"
                      @click="removeSalaryRecord(record.id)"
                    >
                      🗑️ 刪除紀錄
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="settings.salaryRecords.length === 0"
                class="empty-state"
              >
                暫無調薪紀錄
              </div>
            </div>

            <!-- 目標達成設定 -->
            <div v-else-if="activeTab === 'targets'" class="submenu-content">
              <div data-tauri-drag-region class="section-header">
                <span class="info-text">設定您的儲蓄或財富目標</span>
                <button class="add-btn" @click="handleAddTargetGoal">
                  + 新增
                </button>
              </div>

              <div data-tauri-drag-region class="events-list">
                <div
                  v-for="goal in settings.targetGoals"
                  :key="goal.id"
                  class="event-item"
                >
                  <div class="event-inputs">
                    <input
                      type="text"
                      v-model="goal.name"
                      placeholder="目標名稱"
                    />
                    <input
                      type="number"
                      v-model.number="goal.amount"
                      placeholder="金額"
                    />
                  </div>
                  <div class="event-actions">
                    <button
                      class="delete-btn"
                      @click="removeTargetGoal(goal.id)"
                    >
                      🗑️ 刪除目標
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="settings.targetGoals.length === 0" class="empty-state">
                暫無設定目標
              </div>
            </div>

            <!-- 發薪設定 -->
            <div v-else-if="activeTab === 'time'" class="submenu-content">
              <div data-tauri-drag-region class="input-stack">
                <div data-tauri-drag-region class="input-item-row">
                  <label>上班時間</label>
                  <input type="time" v-model="settings.workStartTime" />
                </div>
                <div data-tauri-drag-region class="input-item-row">
                  <label>下班時間</label>
                  <input type="time" v-model="settings.workEndTime" />
                </div>
                <div data-tauri-drag-region class="input-item-row">
                  <label>午休開始</label>
                  <input type="time" v-model="settings.lunchStartTime" />
                </div>
                <div data-tauri-drag-region class="input-item-row">
                  <label>發薪日期</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    v-model.number="settings.payday"
                  />
                </div>
                <div data-tauri-drag-region class="switch-item">
                  <label>顯示發薪倒數</label>
                  <label class="switch">
                    <input type="checkbox" v-model="settings.showPayday" />
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </Transition>
        </main>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useSettings } from "../composables/useSettings";
import MenuList from "./MenuList.vue";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const {
  settings,
  addSalaryRecord,
  removeSalaryRecord,
  addTargetGoal,
  removeTargetGoal,
} = useSettings();

const sortedSalaryRecords = computed(() => {
  return [...settings.salaryRecords].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
});

const activeTab = ref<"menu" | "salary" | "time" | "targets">("menu");
const transitionName = ref("slide-right");

const tabTitles = {
  menu: "系統設定",
  salary: "薪資與紀錄",
  time: "發薪設定",
  targets: "目標達成",
};

const menuItems = [
  { label: "薪資與紀錄", value: "salary", icon: "💰" },
  { label: "發薪設定", value: "time", icon: "🕒" },
  { label: "目標達成", value: "targets", icon: "🎯" },
];

// 切換 tab 時調整動畫方向
watch(activeTab, (newTab) => {
  if (newTab === "menu") {
    transitionName.value = "slide-left";
  } else {
    transitionName.value = "slide-right";
  }
});

const handleClose = () => {
  emit("close");
  // 關閉後重置回選單頁
  setTimeout(() => {
    activeTab.value = "menu";
  }, 300);
};

const handleAddTargetGoal = () => {
  addTargetGoal({
    name: "新目標",
    amount: 1000000,
  });
};

const handleAddSalaryRecord = () => {
  addSalaryRecord({
    date: new Date().toISOString().slice(0, 7), // YYYY-MM
    amount: settings.baseSalary,
  });
};
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.settings-modal {
  background: var(--bg-app);
  height: 100vh;
  width: 100vw;
  border-left: 1px solid var(--border-glass);
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
}

.settings-header {
  padding: 0 var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-glass);
  height: 54px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-header h2 {
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.back-btn {
  background: var(--bg-glass);
  border: none;
  color: var(--text-primary);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.back-btn:hover {
  background: var(--bg-glass-hover);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--text-primary);
}

.settings-content {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
  position: relative;
}

/* 子選單共用 */
.submenu-content {
  width: 100%;
}

.switch-group,
.input-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.switch-item,
.input-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background: var(--bg-glass-light);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  word-break: keep-all;
}

.switch-item label,
.input-item-row label {
  font-size: 0.85rem;
  color: var(--text-primary);
  opacity: 0.8;
}

/* Switch UI */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--bg-glass-hover);
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input[type="time"],
input[type="number"],
input[type="date"],
input[type="month"],
input[type="text"] {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 8px 12px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box; /* 關鍵：確保寬度包含內距 */
  text-align: left;
  transition: all var(--transition-fast);
}

/* 針對並排列的輸入框限制寬度，避免太長 */
.input-item-row input {
  width: 140px;
  text-align: center;
}

input[type="month"]::-webkit-calendar-picker-indicator,
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.5;
  cursor: pointer;
}

input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--primary-gradient-start);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input::placeholder {
  color: var(--text-secondary);
  opacity: 0.5;
}

input[type="text"] {
  width: 100%;
  text-align: left;
}

/* 調薪記錄特有 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}

.info-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  background: var(--bg-glass-light);
  padding: 14px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-glass);
  transition: transform var(--transition-fast);
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.event-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.event-inputs input {
  width: 100%;
}

.event-actions {
  display: flex;
  gap: 8px;
}

.privacy-toggle,
.delete-btn {
  flex: 1;
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
  padding: 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.privacy-toggle.active {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--primary-gradient-start);
}

.add-btn {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  border: none;
  color: white;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  opacity: 0.5;
}

/* 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .settings-modal {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from .settings-modal {
  transform: translateX(100%);
}
.fade-leave-to .settings-modal {
  transform: translateX(100%);
}

/* Tab 切換動畫 */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
