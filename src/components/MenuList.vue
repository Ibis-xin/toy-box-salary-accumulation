<template>
  <div class="menu-list">
    <button v-for="item in props.items" class="menu-item" @click="model = item.value">
      <span class="menu-icon">{{ item.icon }}</span>
      <span class="menu-label">{{ item.label }}</span>
      <span class="menu-arrow">›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { label: string; value: string; icon: string }[];
}>();

const model = defineModel<string>();
</script>

<style scoped>
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  background: var(--bg-glass-light);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background: var(--bg-glass-hover);
  transform: translateX(4px);
}

.menu-icon {
  font-size: 1.2rem;
  margin-right: 12px;
}

.menu-label {
  flex: 1;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

.menu-arrow {
  color: var(--text-secondary);
  font-size: 1.2rem;
  opacity: 0.5;
}
</style>
