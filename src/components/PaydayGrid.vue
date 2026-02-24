<template>
  <div class="payday-grid-container">
    <div class="grid-header">
      <span class="grid-label">💰 發薪進度日曆</span>
      <span class="grid-value">{{ daysRemaining }} 天後發薪</span>
    </div>
    <div class="grid-wrapper">
      <div
        v-for="day in days"
        :key="day.date.format('YYYY-MM-DD')"
        class="grid-item"
        :class="{
          'is-past': day.isPast,
          'is-today': day.isToday,
          'is-future': day.isFuture,
        }"
        :title="day.date.format('YYYY-MM-DD')"
      ></div>
    </div>
    <div class="grid-footer">
      <div class="legend">
        <div class="legend-item">
          <span class="box past"></span><span>已過</span>
        </div>
        <div class="legend-item">
          <span class="box today"></span><span>今天</span>
        </div>
        <div class="legend-item">
          <span class="box future"></span><span>未到</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";

const props = defineProps<{
  payday: number;
}>();

const now = ref(dayjs());
let timer: any;

onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs();
  }, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const days = computed(() => {
  let nextPayday = dayjs().date(props.payday).startOf("day");

  // 如果今天已經是發薪日或之後，目標就是下個月的發薪日
  if (
    now.value.isSame(nextPayday, "day") ||
    now.value.isAfter(nextPayday, "day")
  ) {
    nextPayday = nextPayday.add(1, "month");
  }

  const prevPayday = nextPayday.subtract(1, "month");

  const result = [];
  let current = prevPayday;

  // 遍歷整個週期（上個月發薪日到這個月發薪日前一天）
  while (current.isBefore(nextPayday)) {
    result.push({
      date: current,
      isPast: current.isBefore(now.value, "day"),
      isToday: current.isSame(now.value, "day"),
      isFuture: current.isAfter(now.value, "day"),
    });
    current = current.add(1, "day");
  }

  return result;
});

const daysRemaining = computed(() => {
  let nextPayday = dayjs().date(props.payday).startOf("day");
  if (
    now.value.isSame(nextPayday, "day") ||
    now.value.isAfter(nextPayday, "day")
  ) {
    nextPayday = nextPayday.add(1, "month");
  }
  return nextPayday.diff(now.value.startOf("day"), "day");
});
</script>

<style scoped>
.payday-grid-container {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  background: var(--bg-glass-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-glass);
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.grid-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.grid-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 4px;
  justify-items: center;
  padding: var(--spacing-xs) 0;
}

.grid-item {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.is-past {
  background-color: var(--color-success);
  opacity: 0.8;
}

.is-today {
  background-color: #facc15; /* 黃色 */
  box-shadow: 0 0 8px #facc15;
  transform: scale(1.1);
  z-index: 1;
}

.is-future {
  background-color: var(--bg-glass);
}

.grid-footer {
  margin-top: var(--spacing-sm);
  display: flex;
  justify-content: flex-end;
}

.legend {
  display: flex;
  gap: var(--spacing-md);
  font-size: 8px;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.box {
  width: 8px;
  height: 8px;
  border-radius: 1px;
}

.box.past {
  background-color: var(--color-success);
}
.box.today {
  background-color: #facc15;
}
.box.future {
  background-color: var(--bg-glass);
}

@media (max-width: 300px) {
  .grid-item {
    width: 8px;
    height: 8px;
  }
}
</style>
