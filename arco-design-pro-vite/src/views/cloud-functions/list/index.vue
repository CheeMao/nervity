<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.cloud.functions', 'menu.cloud.functions.list']"
      icon="icon-cloud"
    />
    <a-card class="general-card" :title="$t('menu.cloud.functions.list')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  field="name"
                  :label="$t('cloud.functions.columns.triggerName')"
                >
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="$t('cloud.functions.form.search.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="app_id"
                  :label="$t('cloud.functions.columns.appId')"
                >
                  <a-select
                    v-model="searchForm.app_id"
                    :placeholder="$t('cloud.functions.form.selectApp')"
                    allow-clear
                    allow-search
                  >
                    <a-option
                      v-for="app in appList"
                      :key="app.id"
                      :value="app.id"
                      :label="app.name"
                    />
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              {{ $t('cloud.functions.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              {{ $t('cloud.functions.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleCreate">
              <template #icon><icon-plus /></template>
              {{ $t('cloud.functions.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-button @click="fetchData">
            <template #icon><icon-refresh /></template>
            {{ $t('cloud.functions.operation.refresh') }}
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :data="tableData"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column
            :title="$t('cloud.functions.columns.id')"
            data-index="id"
            :width="60"
            align="center"
          />
          <a-table-column
            :title="$t('cloud.functions.columns.triggerName')"
            data-index="trigger_name"
            :width="180"
            align="center"
          />
          <a-table-column
            :title="$t('cloud.functions.columns.appId')"
            data-index="app_id"
            :width="180"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.app?.name }}
              <span style="color: #86909c">(ID: {{ record.app_id }})</span>
            </template>
          </a-table-column>

          <a-table-column
            :title="$t('cloud.functions.columns.createdAt')"
            data-index="created_at"
            :width="180"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.created_at) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('cloud.functions.columns.operation')"
            :width="250"
            fixed="right"
            align="center"
          >
            <template #cell="{ record }">
              <a-space size="small">
                <a-button type="text" size="small" @click="handleRun(record)">
                  {{ $t('cloud.functions.operation.run') }}
                </a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  {{ $t('cloud.functions.operation.edit') }}
                </a-button>
                <a-popconfirm
                  :content="$t('cloud.functions.operation.deleteConfirm')"
                  @ok="handleDelete(record.id)"
                >
                  <a-button type="text" status="danger" size="small">
                    {{ $t('cloud.functions.operation.delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="
        editingId
          ? $t('cloud.functions.modal.editTitle')
          : $t('cloud.functions.modal.createTitle')
      "
      :ok-loading="modalLoading"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="trigger_name"
              :label="$t('cloud.functions.form.triggerName')"
            >
              <a-input
                v-model="formData.trigger_name"
                placeholder="func_name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="app_id"
              :label="$t('cloud.functions.form.appId')"
            >
              <a-select
                v-model="formData.app_id"
                :placeholder="$t('cloud.functions.form.selectApp')"
                allow-search
              >
                <a-option
                  v-for="app in appList"
                  :key="app.id"
                  :value="app.id"
                  :label="app.name"
                />
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="code" :label="$t('cloud.functions.form.code')">
          <a-textarea
            v-model="formData.code"
            :auto-size="{ minRows: 10, maxRows: 20 }"
            placeholder="return 'Hello World';"
            style="font-family: monospace"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Run Modal -->
    <a-modal
      v-model:visible="runModalVisible"
      :title="$t('cloud.functions.modal.runTitle')"
      :ok-loading="runLoading"
      @ok="handleSubmitRun"
      @cancel="runModalVisible = false"
    >
      <a-form :model="runForm" layout="vertical">
        <a-form-item field="data" label="Input Data (JSON)">
          <a-textarea
            v-model="runForm.data"
            :auto-size="{ minRows: 4, maxRows: 10 }"
            placeholder='{ "key": "value" }'
            style="font-family: monospace"
          />
        </a-form-item>
      </a-form>
      <div
        v-if="runResult"
        style="
          margin-top: 10px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        "
      >
        <pre>{{ runResult }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import {
    queryCloudFunctions,
    createCloudFunction,
    updateCloudFunction,
    deleteCloudFunction,
    runCloudFunction,
    CloudFunctionRecord,
    CloudFunctionParams,
    CreateCloudFunctionData,
  } from '@/api/cloud-functions';
  import { getApps } from '@/api/apps';
  import type { AppRecord } from '@/types/apps';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const { t } = useI18n();

  const loading = ref(false);
  const tableData = ref<CloudFunctionRecord[]>([]);
  const appList = ref<AppRecord[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 30, 40, 50],
  });

  const searchForm = reactive({
    name: '',
    app_id: undefined as number | undefined,
  });

  // Create/Edit Modal
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const editingId = ref<number | null>(null);
  const formRef = ref();
  const formData = reactive<CreateCloudFunctionData>({
    trigger_name: '',
    code: '',
    app_id: 1,
  });

  // Run Modal
  const runModalVisible = ref(false);
  const runLoading = ref(false);
  const runForm = reactive({
    data: '{}',
    appId: 0,
    triggerName: '',
  });
  const runResult = ref('');

  const formRules = {
    trigger_name: [{ required: true, message: 'Required' }],
    code: [{ required: true, message: 'Required' }],
    app_id: [{ required: true, message: 'Required' }],
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 获取应用列表
  const fetchAppList = async () => {
    try {
      const res = await getApps({ page: 1, pageSize: 1000 });
      appList.value = res.data.list || [];
    } catch (err) {
      // error
    }
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: CloudFunctionParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchForm.name || undefined,
        app_id: searchForm.app_id,
      };
      const res = await queryCloudFunctions(params);
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (err) {
      // error
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  const handleReset = () => {
    searchForm.name = '';
    searchForm.app_id = undefined;
    handleSearch();
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

  const handleCreate = () => {
    formData.trigger_name = '';
    formData.code = '';
    formData.app_id =
      appList.value.length > 0 ? appList.value[0].id : (undefined as any);
    editingId.value = null;
    modalVisible.value = true;
  };

  const handleEdit = (record: CloudFunctionRecord) => {
    formData.trigger_name = record.trigger_name;
    formData.code = record.code;
    formData.app_id = record.app_id;
    editingId.value = record.id;
    modalVisible.value = true;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCloudFunction(id);
      Message.success(t('cloud.functions.message.deleteSuccess'));
      fetchData();
    } catch (err) {
      // error
    }
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    modalLoading.value = true;
    try {
      if (editingId.value) {
        await updateCloudFunction(editingId.value, formData);
        Message.success(t('cloud.functions.message.updateSuccess'));
      } else {
        await createCloudFunction(formData);
        Message.success(t('cloud.functions.message.createSuccess'));
      }
      modalVisible.value = false;
      fetchData();
    } catch (err) {
      // error
    } finally {
      modalLoading.value = false;
    }
  };

  const handleRun = (record: CloudFunctionRecord) => {
    runForm.appId = record.app_id;
    runForm.triggerName = record.trigger_name;
    runForm.data = '{}';
    runResult.value = '';
    runModalVisible.value = true;
  };

  const handleSubmitRun = async () => {
    runLoading.value = true;
    try {
      let data = {};
      try {
        data = JSON.parse(runForm.data);
      } catch (e) {
        Message.error('Invalid JSON');
        runLoading.value = false;
        return;
      }
      const res = await runCloudFunction(runForm.appId, runForm.triggerName, {
        data,
      });
      runResult.value = JSON.stringify(res.data, null, 2);
      Message.success('Execution Complete');
    } catch (err) {
      // error
    } finally {
      runLoading.value = false;
    }
  };

  onMounted(() => {
    fetchAppList();
    fetchData();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .general-card {
    min-height: 600px;
  }
</style>
