<template>
  <div class="container">
    <Breadcrumb
      :items="[
        'menu.dashboard',
        'menu.access.control',
        'menu.access.control.blacklist',
      ]"
      icon="icon-safe"
    />
    <a-card class="general-card" :title="$t('blacklist.title')">
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
                <a-form-item field="type" :label="$t('blacklist.form.type')">
                  <a-select v-model="formModel.type" allow-clear>
                    <a-option value="IP">IP</a-option>
                    <a-option value="HWID">HWID</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="value" :label="$t('blacklist.form.value')">
                  <a-input v-model="formModel.value" allow-clear />
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
              {{ $t('blacklist.form.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('blacklist.form.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('blacklist.operation.create') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        @page-change="onPageChange"
      >
        <template #expiredAt="{ record }">
          {{
            record.expired_at
              ? record.expired_at
              : $t('blacklist.columns.permanent')
          }}
        </template>
        <template #operations="{ record }">
          <a-popconfirm
            :content="$t('blacklist.operation.deleteConfirm')"
            @ok="handleDelete(record)"
          >
            <a-button type="text" status="danger" size="small">
              {{ $t('blacklist.operation.delete') }}
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="visible"
      :title="$t('blacklist.modal.title')"
      unmount-on-close
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form :model="submitForm" layout="vertical">
        <a-form-item field="type" :label="$t('blacklist.form.type')" required>
          <a-select v-model="submitForm.type">
            <a-option value="IP">IP</a-option>
            <a-option value="HWID">HWID</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="value" :label="$t('blacklist.form.value')" required>
          <a-input
            v-model="submitForm.value"
            :placeholder="$t('blacklist.form.valuePlaceholder')"
          />
        </a-form-item>
        <a-form-item field="reason" :label="$t('blacklist.form.reason')">
          <a-textarea v-model="submitForm.reason" />
        </a-form-item>
        <a-form-item field="expiredAt" :label="$t('blacklist.form.expiredAt')">
          <a-date-picker
            v-model="submitForm.expiredAt"
            show-time
            style="width: 100%"
          />
          <template #help>
            {{ $t('blacklist.form.expiredAtHelp') }}
          </template>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import {
    queryBlacklist,
    createBlacklist,
    deleteBlacklist,
    BlacklistRecord,
  } from '@/api/blacklist';

  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);
  const renderData = ref<BlacklistRecord[]>([]);
  const formModel = reactive({
    type: '' as '' | 'IP' | 'HWID',
    value: '',
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
  const submitForm = reactive({
    type: 'IP' as 'IP' | 'HWID',
    value: '',
    reason: '',
    expiredAt: '',
  });

  const columns = computed(() => [
    {
      title: t('blacklist.columns.id'),
      dataIndex: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: t('blacklist.columns.type'),
      dataIndex: 'type',
      width: 100,
      align: 'center',
    },
    {
      title: t('blacklist.columns.value'),
      dataIndex: 'value',
      width: 200,
      align: 'center',
    },
    {
      title: t('blacklist.columns.reason'),
      dataIndex: 'reason',
      align: 'center',
    },
    {
      title: t('blacklist.columns.operator'),
      dataIndex: 'operator_username',
      width: 120,
      align: 'center',
    },
    {
      title: t('blacklist.columns.expiredAt'),
      slotName: 'expiredAt',
      width: 180,
      align: 'center',
    },
    {
      title: t('blacklist.columns.createdAt'),
      dataIndex: 'created_at',
      width: 180,
      align: 'center',
    },
    {
      title: t('blacklist.columns.operations'),
      slotName: 'operations',
      width: 100,
      fixed: 'right',
      align: 'center',
    },
  ]);

  const fetchData = async (params: { current: number; pageSize: number }) => {
    setLoading(true);
    try {
      const { data } = await queryBlacklist({
        page: params.current,
        pageSize: params.pageSize,
        type: formModel.type || undefined,
        value: formModel.value || undefined,
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
    formModel.type = '';
    formModel.value = '';
    search();
  };

  const handleAdd = () => {
    submitForm.type = 'IP';
    submitForm.value = '';
    submitForm.reason = '';
    submitForm.expiredAt = '';
    visible.value = true;
  };

  const handleOk = async () => {
    if (!submitForm.value) {
      Message.error(t('blacklist.form.valueRequired'));
      return;
    }
    try {
      await createBlacklist({
        type: submitForm.type,
        value: submitForm.value,
        reason: submitForm.reason,
        expired_at: submitForm.expiredAt || undefined,
      });
      Message.success(t('blacklist.operation.success'));
      visible.value = false;
      search();
    } catch (err) {
      // error
    }
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const handleDelete = async (record: BlacklistRecord) => {
    try {
      await deleteBlacklist(record.id);
      Message.success(t('blacklist.operation.deleteSuccess'));
      search();
    } catch (err) {
      // error
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
</style>
