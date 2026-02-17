<template>
  <!-- 统计卡片区域 -->
  <a-row :gutter="16">
    <a-col :xs="12" :sm="12" :md="6" :lg="6">
      <div class="stat-card">
        <div
          class="stat-card__bg"
          style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        ></div>
        <div class="stat-card__content">
          <div class="stat-card__top">
            <div class="stat-card__icon">
              <icon-storage :size="20" />
            </div>
            <span
              v-if="(overviewData.usedCards || 0) > 0"
              class="stat-card__trend"
            >
              已售 {{ overviewData.usedCards }}
            </span>
          </div>
          <div class="stat-card__number">
            <a-statistic
              :value="overviewData.unusedCards"
              :value-from="0"
              animation
            />
          </div>
          <div class="stat-card__label">我的库存</div>
        </div>
      </div>
    </a-col>
    <a-col :xs="12" :sm="12" :md="6" :lg="6">
      <div class="stat-card">
        <div
          class="stat-card__bg"
          style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        ></div>
        <div class="stat-card__content">
          <div class="stat-card__top">
            <div class="stat-card__icon">
              <IconSafe :size="20" />
            </div>
          </div>
          <div class="stat-card__number">
            <a-statistic
              :value="overviewData.balance"
              :precision="2"
              :value-from="0"
              animation
            >
              <template #suffix>
                <span class="unit">元</span>
              </template>
            </a-statistic>
          </div>
          <div class="stat-card__label">账户余额</div>
        </div>
      </div>
    </a-col>
    <a-col :xs="12" :sm="12" :md="6" :lg="6">
      <div class="stat-card">
        <div
          class="stat-card__bg"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        ></div>
        <div class="stat-card__content">
          <div class="stat-card__top">
            <div class="stat-card__icon">
              <icon-user-group :size="20" />
            </div>
          </div>
          <div class="stat-card__number">
            <a-statistic
              :value="overviewData.totalUsers"
              :value-from="0"
              animation
            />
          </div>
          <div class="stat-card__label">我的用户</div>
        </div>
      </div>
    </a-col>
    <a-col :xs="12" :sm="12" :md="6" :lg="6">
      <div class="stat-card">
        <div
          class="stat-card__bg"
          style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        ></div>
        <div class="stat-card__content">
          <div class="stat-card__top">
            <div class="stat-card__icon">
              <icon-bar-chart :size="20" />
            </div>
            <span
              v-if="(overviewData.monthSales || 0) > 0"
              class="stat-card__trend"
            >
              本月 {{ overviewData.monthSales }}
            </span>
          </div>
          <div class="stat-card__number">
            <a-statistic
              :value="overviewData.todaySales"
              :value-from="0"
              animation
            />
          </div>
          <div class="stat-card__label">今日销售</div>
        </div>
      </div>
    </a-col>
  </a-row>

  <!-- 图表区域 -->
  <a-row :gutter="16" style="margin-top: 20px">
    <a-col :xs="24" :sm="24" :md="12" :lg="12">
      <SalesTrend
        :data="trendData.salesTrend"
        :loading="loading"
        :title="$t('workplace.salesTrend')"
      />
    </a-col>
    <a-col :xs="24" :sm="24" :md="12" :lg="12">
      <VersionPie
        :data="trendData.cardStatusDistribution"
        :loading="loading"
        :title="$t('workplace.cardStatusDistribution')"
      />
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { OverviewData, getTrend } from '@/api/statistics';
  import { IconSafe } from '@arco-design/web-vue/es/icon';
  import SalesTrend from './chart/sales-trend.vue';
  import VersionPie from './chart/version-pie.vue';

  defineProps<{
    overviewData: OverviewData;
    loading: boolean;
  }>();

  const trendData = ref({
    salesTrend: [],
    cardStatusDistribution: [],
  });

  const fetchTrend = async () => {
    try {
      const { data } = await getTrend();
      trendData.value = data;
    } catch (err) {
      // 静默处理
    }
  };

  onMounted(() => {
    fetchTrend();
  });
</script>

<style lang="less" scoped>
  .stat-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
  }

  .stat-card__bg {
    position: absolute;
    inset: 0;
  }

  .stat-card__content {
    position: relative;
    z-index: 1;
    padding: 24px;
    color: #fff;
  }

  .stat-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .stat-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .stat-card__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    padding: 3px 10px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
  }

  .stat-card__number {
    :deep(.arco-statistic-value) {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }
  }

  .stat-card__label {
    margin-top: 6px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.75);
    font-weight: 400;
  }

  .unit {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin-left: 4px;
    font-weight: 400;
  }
</style>
