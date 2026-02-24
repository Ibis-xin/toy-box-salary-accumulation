<template>
  <div data-tauri-drag-region class="progress-bar-wrapper">
    <div
      v-if="label || remainingText"
      data-tauri-drag-region
      class="progress-info"
    >
      <span v-if="label" data-tauri-drag-region class="label">{{ label }}</span>
      <span v-if="remainingText" data-tauri-drag-region class="remaining-text">
        {{ remainingText }}
      </span>
    </div>
    <div data-tauri-drag-region class="progress-container">
      <div
        data-tauri-drag-region
        class="progress-fill"
        :style="{
          width: `${progress}%`,
          background: color ? color : undefined,
        }"
      >
        <div data-tauri-drag-region class="progress-glow"></div>
      </div>
    </div>

    <div data-tauri-drag-region class="progress-percentage">
      <span>{{ target }}</span>
      <span>{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  target?: string;
  progress: number;
  remainingText?: string;
  color?: string;
}>();
</script>

<style scoped>
.progress-bar-wrapper {
  width: 100%;
  margin-bottom: var(--spacing-md);
  font-family: inherit;
  color: var(--text-primary);
  user-select: none;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-xs);
}

.label {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  opacity: var(--opacity-active);
}

.remaining-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  opacity: var(--opacity-glass);
}

.progress-container {
  height: 8px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-glass);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-gradient-start),
    var(--primary-gradient-end)
  );
  border-radius: var(--radius-md);
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-percentage {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  opacity: var(--opacity-muted);
}
</style>
