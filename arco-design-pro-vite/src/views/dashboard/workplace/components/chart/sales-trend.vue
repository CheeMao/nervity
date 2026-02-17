<template>
  <a-card
    class="chart-card"
    :title="$t('workplace.salesTrend')"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '16px 20px 0 20px' }"
  >
    <Chart height="300px" :option="chartOption" />
  </a-card>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import useChartOption from '@/hooks/chart-option';
  import Chart from '@/components/chart/index.vue';

  const props = defineProps<{
    data: { date: string; count: number }[];
    loading?: boolean;
    title?: string;
  }>();

  const { chartOption } = useChartOption((isDark) => {
    return {
      grid: {
        left: '4%',
        right: '0',
        top: '20',
        bottom: '30',
      },
      xAxis: {
        type: 'category',
        offset: 2,
        data: props.data.map((item) => item.date),
        boundaryGap: false,
        axisLabel: {
          color: '#4E5969',
          formatter(value: any, idx: number) {
            if (idx === 0) return '';
            if (idx === props.data.length - 1) return '';
            return `${value}`;
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisPointer: {
          show: true,
          lineStyle: {
            color: '#722ED1',
            width: 2,
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisLabel: {
          formatter(value: any, idx: number) {
            if (idx === 0) return value;
            return `${value}`;
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: isDark ? '#3F3F3F' : '#E5E8EF',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter(params) {
          const [firstElement] = params as any[];
          return `<div>
            <p class="tooltip-title">${firstElement.axisValueLabel}</p>
            <div class="tooltip-content">
              <span class="tooltip-dot" style="background-color: ${
                firstElement.color
              }"></span>
              <span class="tooltip-name">${props.title || '卡密激活'}</span>
              <span class="tooltip-value">${firstElement.value}</span>
            </div>
          </div>`;
        },
        className: 'echarts-tooltip-diy',
      },
      series: [
        {
          data: props.data.map((item) => item.count),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          showSymbol: false,
          itemStyle: {
            color: '#722ED1',
          },
          lineStyle: {
            width: 2.5,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(114, 46, 209, 0.25)',
                },
                {
                  offset: 1,
                  color: 'rgba(114, 46, 209, 0)',
                },
              ],
              global: false,
            },
          },
        },
      ],
    };
  });
</script>

<style scoped lang="less">
  .chart-card {
    border-radius: 12px;
    border: 1px solid var(--color-border);
    box-shadow: none;
    min-height: 370px;

    :deep(.arco-card-header) {
      border-bottom: none;
    }

    :deep(.arco-card-header-title) {
      font-size: 15px;
      font-weight: 600;
    }
  }
</style>
