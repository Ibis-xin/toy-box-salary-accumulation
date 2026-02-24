<template>
  <div data-tauri-drag-region class="widget-container">
    <header data-tauri-drag-region class="header">
      <h1 data-tauri-drag-region>薪資累計</h1>

      <div class="window-controls">
        <button class="settings-trigger" @click="isSettingsOpen = true">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
            />
          </svg>
        </button>
        <button class="control-btn minimize" @click="closeWindow">
          <svg width="10" height="1" viewBox="0 0 10 1">
            <line
              x1="0"
              y1="0.5"
              x2="10"
              y2="0.5"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </button>
      </div>
    </header>

    <div data-tauri-drag-region class="content-card">
      <section data-tauri-drag-region class="salary-accumulator">
        <div class="salary-label">累計薪資</div>
        <div class="salary-value">
          <span class="currency">$</span>
          <span class="amount" :class="{ 'pulse-text': isPulsing }">
            {{ formattedSalary }}
          </span>
        </div>
        <div class="salary-sub">每秒更新中...</div>
      </section>

      <PaydayGrid v-show="settings.showPayday" :payday="settings.payday" />

      <div class="countdown-list">
        <div
          v-for="goal in targetGoalStats"
          :key="goal.id"
          class="countdown-item target-goal"
          :class="{ completed: goal.isCompleted }"
        >
          <div class="item-header">
            <span class="item-label"> 🎯 {{ goal.name }} </span>
            <span
              class="item-value"
              :class="{ 'completed-text': goal.isCompleted }"
            >
              {{
                goal.isCompleted
                  ? "已達成！"
                  : `${goal.estimatedArrivalDate?.format("YYYY-MM-DD")}`
              }}
            </span>
          </div>
          <ProgressBar
            :target="goal.amount.toLocaleString()"
            :progress="goal.progress"
            :color="
              goal.isCompleted
                ? 'var(--color-success)'
                : 'var(--primary-gradient-start)'
            "
          />
        </div>

        <div v-if="targetGoalStats.length === 0" class="empty-goals-hint">
          可在設定中新增目標 🎯
        </div>
      </div>
    </div>

    <SettingsModal :show="isSettingsOpen" @close="isSettingsOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { getCurrentWindow } from "@tauri-apps/api/window";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { computed, onMounted, ref, watch } from "vue";
import ProgressBar from "./components/ProgressBar.vue";
import SettingsModal from "./components/SettingsModal.vue";
import PaydayGrid from "./components/PaydayGrid.vue";
import { useCountdown } from "./composables/useCountdown";
import { useSalaryAccumulator } from "./composables/useSalaryAccumulator";
import { useSettings } from "./composables/useSettings";

const appWindow = getCurrentWindow();
const isSettingsOpen = ref(false);
const { settings } = useSettings();
const { totalAccumulatedSalary, targetGoalStats } = useSalaryAccumulator();
useCountdown();

const formattedSalary = computed(() => {
  return totalAccumulatedSalary.value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

const isPulsing = ref(false);
watch(totalAccumulatedSalary, () => {
  isPulsing.value = true;
  setTimeout(() => {
    isPulsing.value = false;
  }, 100);
});

onMounted(async () => {
  // 自動開啟開機自啟
  try {
    const isAutoStartEnabled = await isEnabled();
    if (!isAutoStartEnabled) {
      await enable();
    }
  } catch (err) {
    console.error("Failed to enable autostart:", err);
  }
});

const closeWindow = () => appWindow.close();
</script>

<style>
/* Layout & Container */
.widget-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Header Section */
.header {
  background: var(--bg-app);
  backdrop-filter: blur(16px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  z-index: 4;
}

.header h1 {
  margin: 0;
  font-family: var(--font-family-title);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(
    135deg,
    var(--text-primary) 0%,
    var(--text-secondary) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.window-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.control-btn,
.settings-trigger {
  background: var(--bg-glass);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.control-btn:hover,
.settings-trigger:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
}

.control-btn.close:hover {
  background: var(--color-danger);
}

.settings-trigger svg {
  transition: transform var(--transition-fast);
}

.settings-trigger:hover svg {
  transform: rotate(70deg);
}

.content-card {
  background: var(--bg-app);
  backdrop-filter: blur(16px) saturate(180%);
  padding: var(--spacing-lg);
  padding-top: 10px;
  position: relative;
  z-index: 2;
  box-shadow: var(--shadow-card);
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Salary Accumulator Styles */
.salary-accumulator {
  text-align: center;
  padding: var(--spacing-xl) 0;
  background: var(--bg-glass-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-glass);
}

.salary-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-xs);
}

.salary-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  color: var(--text-primary);
}

.currency {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-gradient-start);
}

.amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  font-family: "JetBrains Mono", monospace;
  transition: transform 0.1s;
}

.pulse-text {
  transform: scale(1.02);
  color: var(--color-success);
}

.salary-sub {
  font-size: 10px;
  color: var(--color-success);
  margin-top: 4px;
  opacity: 0.8;
}

/* Countdown List Styles */
.countdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.countdown-item {
  background: rgba(255, 255, 255, 0.02);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.item-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.item-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.goal-amount {
  font-size: 10px;
  opacity: 0.6;
  margin-left: 4px;
}

.completed-text {
  color: var(--color-success) !important;
  font-weight: var(--font-weight-bold);
}

.target-goal.completed {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
}
</style>
