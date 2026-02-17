<template>
  <a-drawer
    :visible="visible"
    :title="$t('balanceLogs.title')"
    :width="800"
    :footer="false"
    @cancel="handleCancel"
  >
    <a-table
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      :columns="columns"
      :data="tableData"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #amount="{ record }">
        <span :style="{ color: record.amount >= 0 ? 'green' : 'red' }">
          {{ record.amount >= 0 ? '+' : ''
          }}{{ Number(record.amount).toFixed(2) }}
        </span>
      </template>
      <template #type="{ record }">
        {{ $t(`balanceLogs.type.${record.type}`) }}
      </template>
      <template #balanceAfter="{ record }">
        {{ Number(record.balance_after).toFixed(2) }}
      </template>
      <template #operator="{ record }">
        {{ record.operator?.username || '-' }}
      </template>
      <template #createdAt="{ record }">
        {{ new Date(record.created_at).toLocaleString() }}
      </template>
    </a-table>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { queryBalanceLogs, BalanceLog } from '@/api/balance-logs';
  import type { TableColumnData } from '@arco-design/web-vue';

  const props = defineProps<{
    visible: boolean;
    userId: number | null;
  }>();

  const emit = defineEmits(['update:visible']);

  const { t } = useI18n();
  const loading = ref(false);
  const tableData = ref<BalanceLog[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50],
  });

  const columns = computed<TableColumnData[]>(() => [
    { title: t('balanceLogs.columns.id'), dataIndex: 'id', width: 80 },
    {
      title: t('balanceLogs.columns.amount'),
      dataIndex: 'amount',
      slotName: 'amount',
      width: 120,
    },
    {
      title: t('balanceLogs.columns.type'),
      dataIndex: 'type',
      slotName: 'type',
      width: 120,
    },
    {
      title: t('balanceLogs.columns.balanceAfter'),
      dataIndex: 'balance_after',
      slotName: 'balanceAfter',
      width: 120,
    },
    {
      title: t('balanceLogs.columns.description'),
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: t('balanceLogs.columns.operator'),
      dataIndex: 'operator',
      slotName: 'operator',
      width: 120,
    },
    {
      title: t('balanceLogs.columns.createdAt'),
      dataIndex: 'created_at',
      slotName: 'createdAt',
      width: 180,
    },
  ]);

  const fetchData = async () => {
    if (!props.userId) return;
    loading.value = true;
    try {
      const res = await queryBalanceLogs({
        userId: props.userId,
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (err) {
      // handle error
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchData();
  };

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };

  watch(
    () => props.visible,
    (val) => {
      if (val && props.userId) {
        pagination.current = 1;
        fetchData();
      }
    }
  );
</script>
