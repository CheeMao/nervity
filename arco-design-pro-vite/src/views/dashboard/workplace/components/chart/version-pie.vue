<template>
  <a-card
    class="chart-card"
    :title="title"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '20px' }"
  >
    <Chart height="300px" :option="chartOption" />
  </a-card>
</template>

<script lang="ts" setup>
  import useChartOption from '@/hooks/chart-option';
  import Chart from '@/components/chart/index.vue';

  const props = defineProps<{
    data: { name: string; value: number }[];
    title: string;
    loading?: boolean;
  }>();

  // 自定义调色板
  const colorPalette = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#fa709a',
    '#fee140',
    '#00f2fe',
  ];

  const { chartOption } = useChartOption((isDark) => {
    return {
      color: colorPalette,
      legend: {
        left: 'center',
        data: props.data.map((item) => item.name),
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        textStyle: {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#4E5969',
        },
        itemStyle: {
          borderWidth: 0,
        },
      },
      tooltip: {
        show: true,
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: isDark ? '#232324' : '#fff',
            borderWidth: 3,
            borderRadius: 6,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold',
            },
            scaleSize: 6,
          },
          labelLine: {
            show: false,
          },
          data: props.data,
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
