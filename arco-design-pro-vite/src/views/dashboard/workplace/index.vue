<template>
  <div class="workplace-container">
    <Banner />
    <component
      :is="currentPanel"
      :overview-data="overviewData"
      :loading="loading"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/store';
  import { getOverview, OverviewData } from '@/api/statistics';
  import Banner from './components/banner.vue';
  import AdminPanel from './components/admin-panel.vue';
  import DeveloperPanel from './components/developer-panel.vue';
  import AgentPanel from './components/agent-panel.vue';

  const userStore = useUserStore();
  const loading = ref(false);
  const overviewData = ref<OverviewData>({
    totalUsers: 0,
    todayNewUsers: 0,
    totalApps: 0,
    totalCards: 0,
    usedCards: 0,
    // Agent specific fields - 必须初始化，否则 undefined 会导致显示异常
    unusedCards: 0,
    balance: 0,
    todaySales: 0,
    monthSales: 0,
  });

  const currentPanel = computed(() => {
    switch (userStore.role) {
      case 'admin':
        return AdminPanel;
      case 'developer':
        return DeveloperPanel;
      case 'agent':
        return AgentPanel;
      default:
        return AdminPanel;
    }
  });

  const fetchData = async () => {
    loading.value = true;
    try {
      const res = await getOverview();
      const raw = res.data;
      // balance 从 API 返回的是字符串，需要转为数字，否则 a-statistic 动画模式会显示 Invalid Date
      if (raw.balance !== undefined) {
        raw.balance = Number(raw.balance);
      }
      overviewData.value = { ...overviewData.value, ...raw };
    } catch (err) {
      // 静默处理错误
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });
</script>

<script lang="ts">
  export default {
    name: 'Dashboard',
  };
</script>

<style lang="less" scoped>
  .workplace-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 100%;
  }
</style>
