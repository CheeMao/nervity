<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.remote.variables', 'menu.remote.variables.list']"
      icon="icon-cloud"
    />
    <a-card class="general-card" :title="$t('menu.remote.variables.list')">
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
                  field="key"
                  :label="$t('remote.variables.columns.key')"
                >
                  <a-input
                    v-model="searchForm.key"
                    :placeholder="
                      $t('remote.variables.form.search.placeholder')
                    "
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="app_id"
                  :label="$t('remote.variables.columns.appId')"
                >
                  <a-select
                    v-model="searchForm.app_id"
                    :placeholder="$t('remote.variables.form.selectApp')"
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
              {{ $t('remote.variables.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              {{ $t('remote.variables.operation.reset') }}
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
              {{ $t('remote.variables.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-button @click="fetchData">
            <template #icon><icon-refresh /></template>
            {{ $t('remote.variables.operation.refresh') }}
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
            :title="$t('remote.variables.columns.id')"
            data-index="id"
            :width="80"
            align="center"
          />
          <a-table-column
            :title="$t('remote.variables.columns.key')"
            data-index="key"
            align="center"
            :width="200"
          />
          <a-table-column
            :title="$t('remote.variables.columns.value')"
            data-index="value"
            :width="200"
            ellipsis
            tooltip
            align="center"
          />
          <a-table-column
            :title="$t('remote.variables.columns.appId')"
            data-index="app_id"
            :width="160"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.app?.name }}
              <span style="color: #86909c">(ID: {{ record.app_id }})</span>
            </template>
          </a-table-column>

          <a-table-column
            :title="$t('remote.variables.columns.description')"
            data-index="description"
            ellipsis
            tooltip
            align="center"
            :width="200"
          />
          <a-table-column
            :title="$t('remote.variables.columns.createdAt')"
            data-index="created_at"
            :width="180"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.created_at) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('remote.variables.columns.operation')"
            :width="150"
            fixed="right"
            align="center"
          >
            <template #cell="{ record }">
              <a-space size="small">
                <a-button type="text" size="small" @click="handleEdit(record)">
                  {{ $t('remote.variables.operation.edit') }}
                </a-button>
                <a-popconfirm
                  :content="$t('remote.variables.operation.deleteConfirm')"
                  @ok="handleDelete(record.id)"
                >
                  <a-button type="text" status="danger" size="small">
                    {{ $t('remote.variables.operation.delete') }}
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
          ? $t('remote.variables.modal.editTitle')
          : $t('remote.variables.modal.createTitle')
      "
      :ok-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="key" :label="$t('remote.variables.form.key')">
          <a-input v-model="formData.key" placeholder="variable_key" />
        </a-form-item>
        <a-form-item field="value" :label="$t('remote.variables.form.value')">
          <a-textarea v-model="formData.value" placeholder="variable_value" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
              field="app_id"
              :label="$t('remote.variables.form.appId')"
            >
              <a-select
                v-model="formData.app_id"
                :placeholder="$t('remote.variables.form.selectApp')"
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
        <a-form-item
          field="description"
          :label="$t('remote.variables.form.description')"
        >
          <a-textarea v-model="formData.description" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import {
    queryRemoteVariables,
    createRemoteVariable,
    updateRemoteVariable,
    deleteRemoteVariable,
    RemoteVariableRecord,
    RemoteVariableParams,
    CreateRemoteVariableData,
  } from '@/api/remote-variables';
  import { getApps } from '@/api/apps';
  import type { AppRecord } from '@/types/apps';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const { t } = useI18n();

  const loading = ref(false);
  const tableData = ref<RemoteVariableRecord[]>([]);
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
    key: '',
    app_id: undefined as number | undefined,
  });

  // Create/Edit Modal
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const editingId = ref<number | null>(null);
  const formRef = ref();
  const formData = reactive<CreateRemoteVariableData>({
    key: '',
    value: '',
    description: '',
    app_id: 1,
  });

  const formRules = {
    key: [{ required: true, message: 'Required' }],
    value: [{ required: true, message: 'Required' }],
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
      const params: RemoteVariableParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        key: searchForm.key || undefined,
        app_id: searchForm.app_id,
      };
      const res = await queryRemoteVariables(params);
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
    searchForm.key = '';
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
    formData.key = '';
    formData.value = '';
    formData.description = '';
    formData.app_id =
      appList.value.length > 0 ? appList.value[0].id : (undefined as any);

    editingId.value = null;
    modalVisible.value = true;
  };

  const handleEdit = (record: RemoteVariableRecord) => {
    formData.key = record.key;
    formData.value = record.value;
    formData.description = record.description || '';
    formData.app_id = record.app_id;

    editingId.value = record.id;
    modalVisible.value = true;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRemoteVariable(id);
      Message.success(t('remote.variables.message.deleteSuccess'));
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
        await updateRemoteVariable(editingId.value, formData);
        Message.success(t('remote.variables.message.updateSuccess'));
      } else {
        await createRemoteVariable(formData);
        Message.success(t('remote.variables.message.createSuccess'));
      }
      modalVisible.value = false;
      fetchData();
    } catch (err) {
      // error
    } finally {
      modalLoading.value = false;
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
