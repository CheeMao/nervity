<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.dashboard', 'menu.operation.logs']"
      icon="icon-file"
    />
    <a-card class="general-card" :title="$t('operationLogs.title')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  field="method"
                  :label="$t('operationLogs.form.method')"
                >
                  <a-select v-model="formModel.method" allow-clear>
                    <a-option value="GET">GET</a-option>
                    <a-option value="POST">POST</a-option>
                    <a-option value="PUT">PUT</a-option>
                    <a-option value="DELETE">DELETE</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="statusCode"
                  :label="$t('operationLogs.form.statusCode')"
                >
                  <a-input-number v-model="formModel.statusCode" allow-clear />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="dateRange"
                  :label="$t('operationLogs.form.dateRange')"
                >
                  <a-range-picker
                    v-model="formModel.dateRange"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ $t('operationLogs.form.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('operationLogs.form.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        @page-change="onPageChange"
      >
        <template #statusCode="{ record }">
          <a-tag :color="record.status_code >= 400 ? 'red' : 'green'">
            {{ record.status_code }}
          </a-tag>
        </template>
        <template #executionTime="{ record }">
          {{ record.execution_time }} ms
        </template>
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="viewDetails(record)">
            详情
          </a-button>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="visible"
      :title="$t('operationLogs.modal.title')"
      :footer="false"
    >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item :label="$t('operationLogs.columns.id')">
          {{ currentRecord?.id }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.adminUsername')">
          {{ currentRecord?.admin_username }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.method')">
          {{ currentRecord?.method }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.path')">
          {{ currentRecord?.path }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.statusCode')">
          <a-tag
            :color="
              (currentRecord?.status_code || 200) >= 400 ? 'red' : 'green'
            "
          >
            {{ currentRecord?.status_code }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.executionTime')">
          {{ currentRecord?.execution_time }} ms
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.ip')">
          {{ currentRecord?.ip }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.modal.label.userAgent')">
          {{ currentRecord?.user_agent }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.modal.label.query')">
          <pre class="code-block">{{
            formatJson(currentRecord?.query || null)
          }}</pre>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.modal.label.body')">
          <pre class="code-block">{{
            formatJson(currentRecord?.body || null)
          }}</pre>
        </a-descriptions-item>
        <a-descriptions-item
          v-if="currentRecord?.error_message"
          :label="$t('operationLogs.modal.label.error')"
        >
          <span style="color: red">{{ currentRecord?.error_message }}</span>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('operationLogs.columns.createdAt')">
          {{ currentRecord?.created_at }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import {
    queryOperationLogList,
    OperationLogRecord,
    OperationLogParams,
  } from '@/api/operation-logs';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const renderData = ref<OperationLogRecord[]>([]);
  const formModel = reactive({
    method: '',
    statusCode: undefined,
    dateRange: [],
  });
  const pagination = reactive<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 30, 40, 50],
  });

  const visible = ref(false);
  const currentRecord = ref<OperationLogRecord | null>(null);

  const columns = computed(() => [
    {
      title: t('operationLogs.columns.id'),
      dataIndex: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.adminUsername'),
      dataIndex: 'admin_username',
      width: 120,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.method'),
      dataIndex: 'method',
      width: 100,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.path'),
      dataIndex: 'path',
      ellipsis: true,
      tooltip: true,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.statusCode'),
      slotName: 'statusCode',
      width: 100,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.executionTime'),
      slotName: 'executionTime',
      width: 120,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.ip'),
      dataIndex: 'ip',
      width: 140,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.createdAt'),
      dataIndex: 'created_at',
      width: 180,
      align: 'center',
    },
    {
      title: t('operationLogs.columns.operations'),
      slotName: 'operations',
      width: 100,
      fixed: 'right',
      align: 'center',
    },
  ]);

  const fetchData = async (params: { current: number; pageSize: number }) => {
    setLoading(true);
    try {
      const { data } = await queryOperationLogList({
        page: params.current,
        pageSize: params.pageSize,
        startTime: formModel.dateRange?.[0],
        endTime: formModel.dateRange?.[1],
        method: formModel.method || undefined,
        status_code: formModel.statusCode,
      });
      renderData.value = data.list;
      pagination.current = params.current;
      pagination.total = data.total;
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    fetchData({
      current: 1,
      pageSize: pagination.pageSize,
    });
  };

  const onPageChange = (current: number) => {
    fetchData({
      current,
      pageSize: pagination.pageSize,
    });
  };

  const reset = () => {
    formModel.method = '';
    formModel.statusCode = undefined;
    formModel.dateRange = [];
    search();
  };

  const viewDetails = (record: OperationLogRecord) => {
    currentRecord.value = record;
    visible.value = true;
  };

  const formatJson = (jsonStr: string | null) => {
    if (!jsonStr) return '-';
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  fetchData({ current: 1, pageSize: 20 });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  :deep(.arco-table-th) {
    background-color: var(--color-neutral-2);
  }
  .general-card {
    padding-top: 20px;
  }
  .code-block {
    background: var(--color-fill-2);
    padding: 8px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
</style>
