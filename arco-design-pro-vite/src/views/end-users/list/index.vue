<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.card.management', 'menu.end.users.list']"
      icon="icon-idcard"
    />
    <a-card class="general-card" :title="$t('menu.end.users.list')">
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
                  field="keyword"
                  :label="$t('end.users.form.keyword')"
                >
                  <a-input
                    v-model="searchForm.keyword"
                    :placeholder="$t('end.users.form.search.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="is_active"
                  :label="$t('end.users.form.status')"
                >
                  <a-select
                    v-model="searchForm.is_active"
                    :placeholder="$t('end.users.form.status')"
                    allow-clear
                  >
                    <a-option :value="true">{{
                      $t('end.users.status.active')
                    }}</a-option>
                    <a-option :value="false">{{
                      $t('end.users.status.inactive')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="app_id" :label="$t('end.users.form.appId')">
                  <a-input-number
                    v-model="searchForm.app_id"
                    :placeholder="$t('end.users.form.appId')"
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
              <template #icon><icon-search /></template>
              {{ $t('end.users.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              {{ $t('end.users.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <!-- 批量操作预留位置 -->
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-space>
            <a-button @click="fetchData">
              <template #icon><icon-refresh /></template>
              {{ $t('end.users.operation.refresh') }}
            </a-button>
          </a-space>
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
            :title="$t('end.users.columns.id')"
            data-index="id"
            :width="80"
          />
          <a-table-column
            :title="$t('end.users.columns.username')"
            data-index="username"
            :width="140"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.username || '-' }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.deviceName')"
            :width="120"
            align="center"
          >
            <template #cell="{ record }">
              <div v-if="record.devices && record.devices.length > 0">
                <div
                  v-for="device in record.devices.slice(0, 2)"
                  :key="device.id"
                  style="margin-bottom: 4px"
                >
                  <span v-if="device.device_name">
                    {{ device.device_name }}
                  </span>
                  <span v-else style="color: var(--color-text-3)">-</span>
                </div>
                <div
                  v-if="record.devices.length > 2"
                  style="color: var(--color-text-3); font-size: 12px"
                >
                  +{{ record.devices.length - 2 }} more
                </div>
              </div>
              <span v-else style="color: var(--color-text-3)">-</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.hwid')"
            data-index="hwid"
            ellipsis
            tooltip
            :width="160"
            align="center"
          >
            <template #cell="{ record }">
              <div v-if="record.devices && record.devices.length > 0">
                <div
                  v-for="device in record.devices.slice(0, 2)"
                  :key="device.id"
                  style="margin-bottom: 4px"
                >
                  <a-tooltip :content="device.hwid">
                    <span>{{ device.hwid.slice(0, 16) }}...</span>
                  </a-tooltip>
                </div>
                <div
                  v-if="record.devices.length > 2"
                  style="color: var(--color-text-3); font-size: 12px"
                >
                  +{{ record.devices.length - 2 }} more
                </div>
              </div>
              <span v-else style="color: var(--color-text-3)">-</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.app')"
            data-index="app.name"
            :width="160"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.app?.name }}
              <span style="color: #86909c">(ID: {{ record.app_id }})</span>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.expireTime')"
            data-index="expire_time"
            :width="160"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.expire_time) }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.deviceCount')"
            :width="100"
            align="center"
          >
            <template #cell="{ record }">
              <span
                >{{ record.device_count ?? 0 }} /
                {{ record.max_devices ?? 1 }}</span
              >
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.isActive')"
            data-index="is_active"
            :width="100"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag :color="record.is_active ? 'green' : 'red'">
                {{
                  record.is_active
                    ? $t('end.users.status.active')
                    : $t('end.users.status.inactive')
                }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('end.users.columns.lastLogin')"
            data-index="last_login"
            :width="160"
            align="center"
          >
            <template #cell="{ record }">
              {{ formatDate(record.last_login) }}
            </template>
          </a-table-column>

          <a-table-column
            :title="$t('end.users.columns.operation')"
            :width="240"
            fixed="right"
            align="center"
          >
            <template #cell="{ record }">
              <a-space size="small">
                <a-button type="text" size="small" @click="handleEdit(record)">
                  {{ $t('end.users.operation.edit') }}
                </a-button>
                <a-popconfirm
                  :content="$t('end.users.operation.unbindConfirm')"
                  @ok="handleUnbind(record.id)"
                >
                  <a-button
                    type="text"
                    status="warning"
                    size="small"
                    :disabled="!record.device_count"
                  >
                    {{ $t('end.users.operation.unbind') }}
                  </a-button>
                </a-popconfirm>
                <a-popconfirm
                  :content="$t('end.users.operation.deleteConfirm')"
                  @ok="handleDelete(record.id)"
                >
                  <a-button type="text" status="danger" size="small">
                    {{ $t('end.users.operation.delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- Edit Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="$t('end.users.modal.editTitle')"
      :ok-loading="modalLoading"
      unmount-on-close
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form ref="formRef" :model="formData" layout="vertical">
        <a-form-item field="username" :label="$t('end.users.form.username')">
          <a-input v-model="formData.username" />
        </a-form-item>
        <a-form-item field="is_active" :label="$t('end.users.form.isActive')">
          <a-switch v-model="formData.is_active" />
        </a-form-item>
        <a-form-item
          field="expire_time"
          :label="$t('end.users.form.expireTime')"
        >
          <a-date-picker
            v-model="formData.expire_time"
            show-time
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item field="password" :label="$t('end.users.form.password')">
          <a-input-password
            v-model="formData.password"
            placeholder="Leave empty to keep unchanged"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import axios from 'axios';
  import {
    queryEndUsers,
    updateEndUser,
    deleteEndUser,
    unbindEndUserHwid,
    EndUserRecord,
    EndUserParams,
    UpdateEndUserData,
  } from '@/api/end-users';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const { t } = useI18n();

  const loading = ref(false);
  const exportLoading = ref(false);
  const tableData = ref<EndUserRecord[]>([]);
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
    keyword: '',
    app_id: undefined as number | undefined,
    is_active: undefined as boolean | undefined,
  });

  // Modal
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const editingId = ref<number | null>(null);
  const formRef = ref();
  const formData = reactive<UpdateEndUserData>({
    username: '',
    is_active: true,
    expire_time: '',
    password: '',
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: EndUserParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: searchForm.keyword || undefined,
        app_id: searchForm.app_id,
        is_active: searchForm.is_active,
      };
      const res = await queryEndUsers(params);
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
    searchForm.keyword = '';
    searchForm.app_id = undefined;
    searchForm.is_active = undefined;
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

  const handleEdit = (record: EndUserRecord) => {
    formData.username = record.username || '';
    formData.is_active = record.is_active;
    formData.expire_time = record.expire_time;
    formData.password = ''; // Don't show password
    editingId.value = record.id;
    modalVisible.value = true;
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleSubmit = async () => {
    modalLoading.value = true;
    try {
      if (editingId.value) {
        // Filter out empty password
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        await updateEndUser(editingId.value, dataToUpdate);
        Message.success(t('end.users.message.updateSuccess'));
      }
      modalVisible.value = false;
      fetchData();
    } catch (err) {
      // error
    } finally {
      modalLoading.value = false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEndUser(id);
      Message.success(t('end.users.message.deleteSuccess'));
      fetchData();
    } catch (err) {
      // error
    }
  };

  const handleUnbind = async (id: number) => {
    try {
      await unbindEndUserHwid(id);
      Message.success(t('end.users.message.unbindSuccess'));
      fetchData();
    } catch (err) {
      // error
    }
  };

  const handleExport = async () => {
    exportLoading.value = true;
    try {
      const params = new URLSearchParams();
      if (searchForm.keyword) params.append('keyword', searchForm.keyword);
      if (searchForm.app_id) params.append('app_id', String(searchForm.app_id));
      if (searchForm.is_active !== undefined)
        params.append('is_active', String(searchForm.is_active));

      // 响应拦截器会返回 response.data，所以这里 response 就是 Blob
      const blob = (await axios.get(`/end-users/export?${params.toString()}`, {
        responseType: 'blob',
      })) as unknown as Blob;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `end_users_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Message.success(t('end.users.message.exportSuccess'));
    } catch (err) {
      // error
    } finally {
      exportLoading.value = false;
    }
  };

  fetchData();
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .general-card {
    min-height: 600px;
  }
</style>
