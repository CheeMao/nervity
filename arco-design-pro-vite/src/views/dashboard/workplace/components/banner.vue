<template>
  <div class="banner-wrap">
    <!-- 装饰性背景元素 -->
    <div class="banner-bg-decor">
      <div class="decor-circle decor-1"></div>
      <div class="decor-circle decor-2"></div>
      <div class="decor-circle decor-3"></div>
    </div>
    <div class="banner-content">
      <div class="banner-text">
        <h2 class="greeting">{{ greeting }}，{{ userInfo.name }} 👋</h2>
        <p class="banner-desc">{{ todayDate }} · 祝你工作顺利</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useUserStore } from '@/store';

  const userStore = useUserStore();
  const userInfo = computed(() => ({
    name: userStore.name,
  }));

  // 根据时间段生成问候语
  const greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  });

  // 格式化今日日期
  const todayDate = computed(() => {
    const now = new Date();
    const weekDays = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDay = weekDays[now.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  });
</script>

<style scoped lang="less">
  .banner-wrap {
    position: relative;
    padding: 28px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 60%, #f093fb 100%);
    border-radius: 12px;
    overflow: hidden;
    color: #fff;
  }

  .banner-bg-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .decor-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  .decor-1 {
    width: 200px;
    height: 200px;
    top: -60px;
    right: -40px;
  }

  .decor-2 {
    width: 120px;
    height: 120px;
    bottom: -30px;
    right: 120px;
    background: rgba(255, 255, 255, 0.06);
  }

  .decor-3 {
    width: 80px;
    height: 80px;
    top: 10px;
    right: 200px;
    background: rgba(255, 255, 255, 0.04);
  }

  .banner-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .greeting {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 6px;
    color: #fff;
    letter-spacing: -0.01em;
  }

  .banner-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
  }
</style>
