<template>
  <div class="container">
    <Breadcrumb :items="['menu.apps', 'menu.apps.list']" icon="icon-apps" />
    <a-card class="general-card" :title="$t('menu.apps.list')">
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
                <a-form-item field="name" :label="$t('apps.form.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="$t('apps.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              {{ $t('apps.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('apps.operation.reset') }}
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
              {{ $t('apps.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-button @click="fetchData">
            <template #icon><icon-refresh /></template>
            {{ $t('apps.operation.refresh') }}
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="tableData"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #app_secret="{ record }">
          <a-typography-paragraph copyable :copy-text="record.app_secret">
            {{ record.app_secret.slice(0, 8) }}...
          </a-typography-paragraph>
        </template>
        <template #heart_interval="{ record }">
          {{ record.heart_interval }}s
        </template>
        <template #is_active="{ record }">
          <a-tag :color="record.is_active ? 'green' : 'red'">
            {{
              record.is_active
                ? $t('apps.status.active')
                : $t('apps.status.inactive')
            }}
          </a-tag>
        </template>
        <template #created_at="{ record }">
          {{ formatDate(record.created_at) }}
        </template>
        <template #operations="{ record }">
          <a-space size="small">
            <a-button type="text" size="small" @click="handleEdit(record)">
              {{ $t('apps.operation.edit') }}
            </a-button>
            <a-popconfirm
              :content="$t('apps.operation.deleteConfirm')"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" status="danger" size="small">
                {{ $t('apps.operation.delete') }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 创建/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="
        isEdit ? $t('apps.modal.editTitle') : $t('apps.modal.createTitle')
      "
      :ok-loading="modalLoading"
      :width="600"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <!-- 基本信息 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="name" :label="$t('apps.form.name')">
              <a-input
                v-model="formData.name"
                :placeholder="$t('apps.form.name.placeholder')"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="!isEdit" :span="12">
            <a-form-item field="app_secret" :label="$t('apps.form.appSecret')">
              <a-input
                v-model="formData.app_secret"
                :placeholder="$t('apps.form.appSecret.placeholder')"
              >
                <template #append>
                  <a-button type="text" @click="generateSecret">
                    <icon-refresh />
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="version" :label="$t('apps.form.version')">
              <a-input v-model="formData.version" placeholder="1.0.0" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              field="heart_interval"
              :label="$t('apps.form.heartInterval')"
            >
              <a-input-number
                v-model="formData.heart_interval"
                :min="10"
                :max="3600"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="download_url" :label="$t('apps.form.downloadUrl')">
          <a-input v-model="formData.download_url" placeholder="https://..." />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item
              field="force_update"
              :label="$t('apps.form.forceUpdate')"
            >
              <a-switch v-model="formData.force_update" />
            </a-form-item>
          </a-col>
          <a-col v-if="isEdit" :span="8">
            <a-form-item field="is_active" :label="$t('apps.form.isActive')">
              <a-switch v-model="formData.is_active" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="agent_visible">
              <template #label>
                <span>{{ $t('apps.form.agentVisible') }}</span>
                <a-tooltip :content="$t('apps.form.agentVisible.help')">
                  <icon-question-circle
                    style="margin-left: 4px; color: var(--color-text-3)"
                  />
                </a-tooltip>
              </template>
              <a-switch v-model="formData.agent_visible" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 试用配置 -->
        <a-divider>{{ $t('apps.form.trialConfig') }}</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item
              field="trial_enabled"
              :label="$t('apps.form.trialEnabled')"
            >
              <a-switch v-model="formData.trial_enabled" />
            </a-form-item>
          </a-col>
          <a-col v-if="formData.trial_enabled" :span="8">
            <a-form-item
              field="trial_duration"
              :label="$t('apps.form.trialDuration')"
            >
              <a-input-number
                v-model="formData.trial_duration"
                :min="60"
                :max="86400 * 30"
                :placeholder="$t('apps.form.trialDuration.placeholder')"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="formData.trial_enabled" :span="8">
            <a-form-item
              field="trial_device_limit"
              :label="$t('apps.form.trialDeviceLimit')"
            >
              <a-input-number
                v-model="formData.trial_device_limit"
                :min="1"
                :max="10"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item v-if="formData.trial_enabled">
          <template #extra>
            {{ $t('apps.form.trialDuration.help') }}
          </template>
        </a-form-item>

        <!-- 其他配置 -->
        <a-divider>{{ $t('apps.form.otherConfig') }}</a-divider>
        <a-form-item field="announcement" :label="$t('apps.form.announcement')">
          <a-textarea
            v-model="formData.announcement"
            :placeholder="$t('apps.form.announcement.placeholder')"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { getApps, createApp, updateApp, deleteApp } from '@/api/apps';
  import type {
    AppRecord,
    CreateAppData,
    UpdateAppData,
    AppListQuery,
  } from '@/types/apps';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const { t } = useI18n();

  const loading = ref(false);
  const tableData = ref<AppRecord[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 30, 40, 50],
  });

  const searchForm = reactive<AppListQuery>({
    page: 1,
    pageSize: 10,
    name: '',
  });

  const columns = computed<TableColumnData[]>(() => [
    { title: 'ID', dataIndex: 'id', width: 80, align: 'center' },
    { title: t('apps.columns.name'), dataIndex: 'name', align: 'center' },
    {
      title: t('apps.columns.appSecret'),
      dataIndex: 'app_secret',
      slotName: 'app_secret',
      align: 'center',
    },
    {
      title: t('apps.columns.version'),
      dataIndex: 'version',
      width: 100,
      align: 'center',
    },
    {
      title: t('apps.columns.heartInterval'),
      dataIndex: 'heart_interval',
      slotName: 'heart_interval',
      width: 120,
      align: 'center',
    },
    {
      title: t('apps.columns.status'),
      dataIndex: 'is_active',
      slotName: 'is_active',
      width: 100,
      align: 'center',
    },
    {
      title: t('apps.columns.createdAt'),
      dataIndex: 'created_at',
      slotName: 'created_at',
      width: 100,
      align: 'center',
    },
    {
      title: t('apps.columns.operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 200,
      align: 'center',
    },
  ]);

  // Modal state
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const isEdit = ref(false);
  const editingId = ref<number | null>(null);
  const formRef = ref();

  const formData = reactive<
    CreateAppData & {
      is_active?: boolean;
      trial_enabled?: boolean;
      trial_duration?: number;
      trial_device_limit?: number;
      announcement?: string;
      agent_visible?: boolean;
    }
  >({
    name: '',
    app_secret: '',
    version: '1.0.0',
    download_url: '',
    heart_interval: 60,
    force_update: false,
    is_active: true,
    trial_enabled: false,
    trial_duration: 86400,
    trial_device_limit: 1,
    announcement: '',
    agent_visible: true,
  });

  const formRules = {
    name: [{ required: true, message: t('apps.form.name.required') }],
    app_secret: [
      { required: true, message: t('apps.form.appSecret.required') },
    ],
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const generateSecret = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i += 1) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    formData.app_secret = result;
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: AppListQuery = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        name: searchForm.name || undefined,
      };
      const res = await getApps(params);
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (err) {
      // handle error silently
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

  const resetForm = () => {
    formData.name = '';
    formData.app_secret = '';
    formData.version = '1.0.0';
    formData.download_url = '';
    formData.heart_interval = 60;
    formData.force_update = false;
    formData.is_active = true;
    formData.trial_enabled = false;
    formData.trial_duration = 86400;
    formData.trial_device_limit = 1;
    formData.announcement = '';
    formData.agent_visible = true;
  };

  const handleCreate = () => {
    resetForm();
    generateSecret();
    isEdit.value = false;
    editingId.value = null;
    modalVisible.value = true;
  };

  const handleEdit = (record: AppRecord) => {
    formData.name = record.name;
    formData.app_secret = record.app_secret;
    formData.version = record.version;
    formData.download_url = record.download_url || '';
    formData.heart_interval = record.heart_interval;
    formData.force_update = record.force_update;
    formData.is_active = record.is_active;
    formData.trial_enabled = record.trial_enabled || false;
    formData.trial_duration = record.trial_duration || 86400;
    formData.trial_device_limit = record.trial_device_limit || 1;
    formData.announcement = record.announcement || '';
    formData.agent_visible = record.agent_visible !== false;
    isEdit.value = true;
    editingId.value = record.id;
    modalVisible.value = true;
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    modalLoading.value = true;
    try {
      if (isEdit.value && editingId.value) {
        const updateData: UpdateAppData = {
          name: formData.name,
          version: formData.version,
          download_url: formData.download_url,
          heart_interval: formData.heart_interval,
          force_update: formData.force_update,
          is_active: formData.is_active,
          trial_enabled: formData.trial_enabled,
          trial_duration: formData.trial_duration,
          trial_device_limit: formData.trial_device_limit,
          announcement: formData.announcement,
          agent_visible: formData.agent_visible,
        };
        await updateApp(editingId.value, updateData);
        Message.success(t('apps.message.updateSuccess'));
      } else {
        await createApp(formData);
        Message.success(t('apps.message.createSuccess'));
      }
      modalVisible.value = false;
      resetForm();
      fetchData();
    } catch (err) {
      // handle error silently
    } finally {
      modalLoading.value = false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteApp(id);
      Message.success(t('apps.message.deleteSuccess'));
      fetchData();
    } catch (err) {
      // handle error silently
    }
  };

  // 初始化
  onMounted(() => {
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
