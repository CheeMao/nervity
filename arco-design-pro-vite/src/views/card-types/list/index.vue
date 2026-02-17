<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.cardTypes', 'menu.cardTypes.list']"
      icon="icon-idcard"
    />
    <a-card class="general-card" :title="$t('menu.cardTypes.list')">
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
                <a-form-item field="name" :label="$t('cardTypes.form.name')">
                  <a-input
                    v-model="searchForm.name"
                    :placeholder="$t('cardTypes.form.name.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="app_id" :label="$t('cardTypes.form.app')">
                  <a-select
                    v-model="searchForm.app_id"
                    :placeholder="$t('cardTypes.form.app.placeholder')"
                    allow-clear
                  >
                    <a-option
                      v-for="app in appList"
                      :key="app.id"
                      :value="app.id"
                    >
                      {{ app.name }}
                    </a-option>
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
              <template #icon>
                <icon-search />
              </template>
              {{ $t('cardTypes.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('cardTypes.operation.reset') }}
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
              {{ $t('cardTypes.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-button @click="() => fetchData()">
            <template #icon><icon-refresh /></template>
            {{ $t('cardTypes.operation.refresh') }}
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="tableData"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #app_id="{ record }">
          {{ record.app?.name }}
          <span v-if="record.app_id" style="color: #86909c">
            (ID: {{ record.app_id }})
          </span>
        </template>
        <template #value="{ record }">
          {{ formatDuration(record.value) }}
        </template>
        <template #price="{ record }">
          {{ record.price }}
        </template>
        <template #created_at="{ record }">
          {{ formatDate(record.created_at) }}
        </template>
        <template #operations="{ record }">
          <a-space size="small">
            <a-button type="text" size="small" @click="handleEdit(record)">
              {{ $t('cardTypes.operation.edit') }}
            </a-button>
            <a-popconfirm
              :content="$t('cardTypes.operation.deleteConfirm')"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" status="danger" size="small">
                {{ $t('cardTypes.operation.delete') }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- Create/Edit Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="formData" :rules="formRules">
        <a-form-item field="name" :label="$t('cardTypes.form.name')">
          <a-input
            v-model="formData.name"
            :placeholder="$t('cardTypes.form.name.placeholder')"
          />
        </a-form-item>
        <a-form-item field="app_id" :label="$t('cardTypes.form.app')">
          <a-select
            v-model="formData.app_id"
            :placeholder="$t('cardTypes.form.app.placeholder')"
          >
            <a-option v-for="app in appList" :key="app.id" :value="app.id">
              {{ app.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="value" :label="$t('cardTypes.form.value')">
          <div style="width: 100%; display: flex; flex-direction: column">
            <a-input-number
              v-model="formData.value"
              :min="1"
              :placeholder="$t('cardTypes.form.value.placeholder')"
            />
            <div style="margin-top: 10px">
              <a-space wrap>
                <a-tag checkable color="arcoblue" @click="setDuration(3)"
                  >3天</a-tag
                >
                <a-tag checkable color="arcoblue" @click="setDuration(7)"
                  >7天</a-tag
                >
                <a-tag checkable color="arcoblue" @click="setDuration(30)"
                  >30天</a-tag
                >
                <a-tag checkable color="arcoblue" @click="setDuration(180)"
                  >180天</a-tag
                >
                <a-tag checkable color="arcoblue" @click="setDuration(365)"
                  >365天</a-tag
                >
              </a-space>
            </div>
          </div>
          <template #extra>
            {{ $t('cardTypes.form.value.hint') }}
          </template>
        </a-form-item>
        <a-form-item field="price" :label="$t('cardTypes.form.price')">
          <a-input-number
            v-model="formData.price"
            :min="0"
            :placeholder="$t('cardTypes.form.price.placeholder')"
            :precision="2"
          />
        </a-form-item>
        <a-form-item
          field="device_limit"
          :label="$t('cardTypes.form.deviceLimit')"
        >
          <a-input-number
            v-model="formData.device_limit"
            :min="1"
            :placeholder="$t('cardTypes.form.deviceLimit.placeholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue';
  import {
    getCardTypes,
    createCardType,
    updateCardType,
    deleteCardType,
  } from '@/api/card-types';
  import type { CardTypeRecord, CreateCardTypeData } from '@/api/card-types';
  import { getApps } from '@/api/apps';
  import type { AppRecord } from '@/types/apps';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const { t } = useI18n();

  const loading = ref(false);
  const tableData = ref<CardTypeRecord[]>([]);
  const appList = ref<AppRecord[]>([]);
  const searchForm = reactive({
    app_id: undefined,
    name: '',
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });

  const columns = computed<TableColumnData[]>(() => [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    {
      title: t('cardTypes.columns.name'),
      dataIndex: 'name',
      width: 150,
      align: 'center',
    },
    {
      title: t('cardTypes.columns.app'),
      dataIndex: 'app_id',
      slotName: 'app_id',
      width: 150,
      align: 'center',
    },
    {
      title: t('cardTypes.columns.value'),
      dataIndex: 'value',
      slotName: 'value',
      width: 150,
      align: 'center',
    },
    {
      title: t('cardTypes.columns.price'),
      dataIndex: 'price',
      slotName: 'price',
      width: 120,
      align: 'center',
    },
    {
      title: t('cardTypes.columns.createdAt'),
      dataIndex: 'created_at',
      slotName: 'created_at',
      width: 180,
      align: 'center',
    },
    {
      title: t('cardTypes.columns.operations'),
      slotName: 'operations',
      width: 150,
      fixed: 'right',
      align: 'center',
    },
  ]);

  // Modal State
  const modalVisible = ref(false);
  const modalTitle = ref('');
  const formRef = ref();
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const formData = reactive({
    name: '',
    app_id: undefined as number | undefined,
    value: 24, // Default 1 day
    price: 0,
    device_limit: 1,
  });

  const formRules = {
    name: [{ required: true, message: t('cardTypes.form.name.required') }],
    app_id: [{ required: true, message: t('cardTypes.form.app.required') }],
    value: [{ required: true, message: t('cardTypes.form.value.required') }],
    price: [{ required: true, message: t('cardTypes.form.price.required') }],
    device_limit: [
      { required: true, message: t('cardTypes.form.deviceLimit.required') },
    ],
  };

  const fetchData = async (
    params: { page: number; pageSize: number } = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    }
  ) => {
    loading.value = true;
    try {
      const { data } = await getCardTypes({
        ...params,
        app_id: searchForm.app_id,
        name: searchForm.name,
      });
      tableData.value = data.list;
      pagination.total = data.total;
      pagination.current = params.page;
    } catch (err) {
      // silently fail
    } finally {
      loading.value = false;
    }
  };

  const onPageChange = (current: number) => {
    fetchData({ ...pagination, page: current });
  };

  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize; // Update pageSize state
    fetchData({ ...pagination, page: 1, pageSize });
  };

  const fetchApps = async () => {
    try {
      const { data } = await getApps({ page: 1, pageSize: 100 });
      appList.value = data.list;
    } catch (err) {
      // ignore
    }
  };

  const handleSearch = () => {
    fetchData({ ...pagination, page: 1 });
  };

  const handleReset = () => {
    searchForm.app_id = undefined;
    searchForm.name = '';
    fetchData({ ...pagination, page: 1 });
  };

  const handleCreate = () => {
    isEdit.value = false;
    modalTitle.value = t('cardTypes.modal.createTitle');
    formData.name = '';
    formData.app_id = undefined;
    formData.value = 24;
    formData.price = 0;
    formData.device_limit = 1;
    modalVisible.value = true;
  };

  const setDuration = (days: number) => {
    formData.value = days * 24;
  };

  const handleEdit = (record: CardTypeRecord) => {
    isEdit.value = true;
    currentId.value = record.id;
    modalTitle.value = t('cardTypes.modal.editTitle');
    formData.name = record.name;
    formData.app_id = record.app_id;
    formData.value = Math.floor(record.value / 3600);
    formData.price = record.price;
    formData.device_limit = record.device_limit || 1;
    modalVisible.value = true;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCardType(id);
      Message.success(t('cardTypes.message.deleteSuccess'));
      fetchData();
    } catch (err) {
      // ignore
    }
  };

  const handleSubmit = async () => {
    const res = await formRef.value?.validate();
    if (res) return;

    try {
      const submitData = { ...formData, value: formData.value * 3600 };
      if (isEdit.value && currentId.value) {
        await updateCardType(currentId.value, submitData);
        Message.success(t('cardTypes.message.updateSuccess'));
      } else {
        // ensure app_id is number
        await createCardType(submitData as CreateCardTypeData);
        Message.success(t('cardTypes.message.createSuccess'));
      }
      modalVisible.value = false;
      fetchData();
    } catch (err) {
      // ignore
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
  };

  const formatDate = (date: string) => new Date(date).toLocaleString();
  const formatDuration = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    if (d > 0 && h === 0) return `${d}天`;
    if (d === 0 && h > 0) return `${h}小时`;
    if (d === 0 && h === 0) return `0小时`; // or a simpler default
    return `${d}天 ${h}小时`;
  };

  onMounted(() => {
    fetchApps();
    fetchData();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
</style>
