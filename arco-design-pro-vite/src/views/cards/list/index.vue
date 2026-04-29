<template>
  <div class="container">
    <Breadcrumb :items="['menu.cards', 'menu.cards.list']" icon="icon-idcard" />
    <a-card class="general-card" :title="$t('menu.cards.list')">
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
                <a-form-item field="status" :label="$t('cards.form.status')">
                  <a-select
                    v-model="searchForm.status"
                    :placeholder="$t('cards.form.status')"
                    allow-clear
                  >
                    <a-option :value="CardStatus.UNUSED">{{
                      $t('cards.status.unused')
                    }}</a-option>
                    <a-option :value="CardStatus.USED">{{
                      $t('cards.status.used')
                    }}</a-option>
                    <a-option :value="CardStatus.BANNED">{{
                      $t('cards.status.banned')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="app_id" :label="$t('cards.form.app')">
                  <a-select
                    v-model="searchForm.app_id"
                    :placeholder="$t('cards.form.app')"
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
              <a-col :span="8">
                <a-form-item field="code" :label="$t('cards.form.code')">
                  <a-input
                    v-model="searchForm.code"
                    :placeholder="$t('cards.form.code.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="remark" :label="$t('cards.form.remark')">
                  <a-input
                    v-model="searchForm.remark"
                    :placeholder="$t('cards.form.remark.searchPlaceholder')"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="used_by" :label="$t('cards.form.usedBy')">
                  <a-input
                    v-model="searchForm.used_by"
                    :placeholder="$t('cards.form.usedBy.placeholder')"
                    allow-clear
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
              {{ $t('cards.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('cards.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary" @click="handleGenerate">
              <template #icon><icon-plus /></template>
              {{ $t('cards.operation.generate') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-space>
            <a-button :loading="exportLoading" @click="openExportModal">
              <template #icon><icon-download /></template>
              {{ $t('cards.operation.export') }}
            </a-button>
            <a-button @click="fetchData">
              <template #icon><icon-refresh /></template>
              {{ $t('cards.operation.refresh') }}
            </a-button>
          </a-space>
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
        <template #app_id="{ record }">
          {{ record.app?.name }}
          <span style="color: #86909c">(ID: {{ record.app_id }})</span>
        </template>
        <template #code="{ record }">
          <a-typography-paragraph copyable :copy-text="record.code">
            {{ record.code.slice(0, 12) }}...
          </a-typography-paragraph>
        </template>
        <template #type="{ record }">
          <a-tag :color="record.type === 'activate' ? 'green' : 'blue'">
            {{
              record.type === 'activate'
                ? $t('cards.type.activate')
                : $t('cards.type.recharge')
            }}
          </a-tag>
        </template>
        <template #value="{ record }">
          <a-tag v-if="record.is_permanent" color="gold">永久</a-tag>
          <template v-else>{{ formatValue(record.value) }}</template>
        </template>
        <template #status="{ record }">
          <a-tag :color="getStatusColor(record.status)">
            {{ $t(`cards.status.${record.status}`) }}
          </a-tag>
        </template>
        <template #usage="{ record }">
          <span v-if="record.used_by">
            {{ record.used_by.username || record.used_by.hwid }}
          </span>
          <span v-else>-</span>
        </template>
        <template #created_at="{ record }">
          {{ formatDate(record.created_at) }}
        </template>
        <template #operations="{ record }">
          <a-space size="small">
            <a-popconfirm
              v-if="record.status === CardStatus.UNUSED"
              :content="$t('cards.operation.banConfirm')"
              @ok="handleBan(record.id)"
            >
              <a-button type="text" status="warning" size="small">
                {{ $t('cards.operation.ban') }}
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="record.status === CardStatus.BANNED"
              :content="$t('cards.operation.unbanConfirm')"
              @ok="handleUnban(record.id)"
            >
              <a-button type="text" status="success" size="small">
                {{ $t('cards.operation.unban') }}
              </a-button>
            </a-popconfirm>
            <a-popconfirm
              :content="$t('cards.operation.deleteConfirm')"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" status="danger" size="small">
                {{ $t('cards.operation.delete') }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 生成卡密弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="$t('cards.modal.generateTitle')"
      :ok-loading="modalLoading"
      :width="520"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="app_id" :label="$t('cards.form.app')">
          <a-select
            v-model="formData.app_id"
            :placeholder="$t('cards.form.app.placeholder')"
            @change="handleAppChange"
          >
            <a-option v-for="app in appList" :key="app.id" :value="app.id">
              {{ app.name }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="card_type_id" :label="$t('cards.form.cardType')">
              <a-select
                v-model="formData.card_type_id"
                :placeholder="$t('cards.form.cardType.placeholder')"
                :options="cardTypeList"
                :field-names="{ value: 'id', label: 'name' }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="count" :label="$t('cards.form.count')">
              <a-input-number
                v-model="formData.count"
                :min="1"
                :max="100"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 价格信息 -->
        <div v-if="userStore.role === 'agent'" class="price-info">
          <div class="price-row">
            <span class="price-label">{{ $t('cards.form.unitPrice') }}</span>
            <span class="price-value">¥{{ unitPrice.toFixed(2) }}</span>
          </div>
          <div class="price-row">
            <span class="price-label">{{ $t('cards.form.totalPrice') }}</span>
            <span class="price-value highlight">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="price-row">
            <span class="price-label">{{ $t('cards.form.currentBalance') }}</span>
            <span class="price-value">
              ¥{{ currentBalance.toFixed(2) }}
              <span v-if="!isBalanceSufficient" class="insufficient">
                ({{ $t('cards.form.balance.insufficient') }})
              </span>
            </span>
          </div>
        </div>

        <a-form-item field="remark" :label="$t('cards.form.remark')">
          <a-input
            v-model="formData.remark"
            :placeholder="$t('cards.form.remark.placeholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 导出范围选择弹窗 -->
    <a-modal
      v-model:visible="exportModalVisible"
      :title="$t('cards.export.modal.title')"
      :ok-loading="exportLoading"
      :width="440"
      @ok="handleExportConfirm"
      @cancel="exportModalVisible = false"
    >
      <a-radio-group v-model="exportScope" direction="vertical">
        <a-radio value="current">
          <div>
            <div>{{ $t('cards.export.scope.current') }}</div>
            <div style="color: #86909c; font-size: 12px">
              {{
                $t('cards.export.scope.currentDesc', {
                  page: pagination.current,
                  size: pagination.pageSize,
                })
              }}
            </div>
          </div>
        </a-radio>
        <a-radio value="all">
          <div>
            <div>{{ $t('cards.export.scope.all') }}</div>
            <div style="color: #86909c; font-size: 12px">
              {{ $t('cards.export.scope.allDesc') }}
            </div>
          </div>
        </a-radio>
      </a-radio-group>
    </a-modal>

    <!-- 生成结果弹窗 -->
    <a-modal
      v-model:visible="resultModalVisible"
      :title="$t('cards.generate.result.title')"
      :width="560"
      :footer="false"
      @cancel="resultModalVisible = false"
    >
      <div style="margin-bottom: 12px; color: #86909c">
        {{
          $t('cards.generate.result.subtitle', {
            count: generatedCards.length,
          })
        }}
      </div>
      <a-textarea
        :model-value="generatedCards.map((c) => c.code).join('\n')"
        :auto-size="{ minRows: 6, maxRows: 12 }"
        readonly
      />
      <div style="margin-top: 16px; text-align: right">
        <a-space>
          <a-button @click="resultModalVisible = false">
            {{ $t('cards.generate.result.close') }}
          </a-button>
          <a-button type="primary" @click="handleCopyAll">
            <template #icon><icon-copy /></template>
            {{ $t('cards.generate.result.copyAll') }}
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/store';
  import axios from 'axios';
  import {
    getCards,
    generateCards,
    deleteCard,
    banCard,
    unbanCard,
  } from '@/api/cards';
  import type {
    CardRecord,
    CardListQuery,
    GenerateCardData,
  } from '@/types/cards';
  import { CardStatus } from '@/types/cards';
  import { getApps } from '@/api/apps';
  import type { AppRecord } from '@/types/apps';
  import { getCardTypes } from '@/api/card-types';
  import type { CardTypeRecord } from '@/api/card-types';
  import Breadcrumb from '@/components/breadcrumb/index.vue';

  const userStore = useUserStore();
  const { t } = useI18n();

  const loading = ref(false);
  const exportLoading = ref(false);
  const tableData = ref<CardRecord[]>([]);
  const appList = ref<AppRecord[]>([]);
  const cardTypeList = ref<CardTypeRecord[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 30, 40, 50],
  });

  const searchForm = reactive<CardListQuery>({
    page: 1,
    pageSize: 10,
    status: undefined,
    app_id: undefined,
    code: '',
    remark: '',
    used_by: '',
  });

  const columns = computed<TableColumnData[]>(() => [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    {
      title: t('cards.columns.app'),
      dataIndex: 'app_id',
      slotName: 'app_id',
      width: 140,
      align: 'center',
    },
    {
      title: t('cards.columns.code'),
      dataIndex: 'code',
      slotName: 'code',
      width: 140,
      align: 'center',
    },
    // Type column removed
    {
      title: t('cards.columns.value'), // Now means 'Duration'
      dataIndex: 'value',
      slotName: 'value',
      width: 110,
      align: 'center',
    },
    {
      title: t('cards.columns.status'),
      dataIndex: 'status',
      slotName: 'status',
      width: 90,
      align: 'center',
    },
    {
      title: t('cards.columns.remark'),
      dataIndex: 'remark',
      ellipsis: true,
      tooltip: true,
      width: 100,
      align: 'center',
    },
    {
      title: t('cards.columns.deviceLimit'),
      dataIndex: 'device_limit',
      width: 100,
      align: 'center',
    },
    {
      title: t('cards.columns.usage'),
      slotName: 'usage',
      width: 120,
      align: 'center',
    },
    {
      title: t('cards.columns.createdAt'),
      dataIndex: 'created_at',
      slotName: 'created_at',
      width: 95,
      align: 'center',
    },
    {
      title: t('cards.columns.operations'),
      slotName: 'operations',
      width: 120,
      fixed: 'right',
      align: 'center',
    },
  ]);

  // Modal state
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const formRef = ref();

  const formData = reactive<GenerateCardData & { card_type_id?: number }>({
    value: 24, // Default 1 day in HOURS (UI inputs hours) - Fallback
    app_id: 0,
    count: 1,
    remark: '',
    card_type_id: undefined,
  });

  const formRules = {
    app_id: [{ required: true, message: t('cards.form.app.required') }],
    // value: [{ required: true, message: t('cards.form.value.required') }],
    card_type_id: [
      { required: true, message: t('cards.form.cardType.required') },
    ],
    count: [{ required: true, message: t('cards.form.count.required') }],
  };

  // Computation for Pricing
  const selectedCardType = computed(() => {
    return cardTypeList.value.find((ct) => ct.id === formData.card_type_id);
  });

  const unitPrice = computed(() => {
    if (selectedCardType.value) {
      return Number(selectedCardType.value.price);
    }
    return 0;
  });

  const discountRate = computed(() => {
    // Assuming userStore has agent info flattened or accessible
    // Based on previous work, user info is in userStore.userInfo
    // But we added level/discount_rate to user response.
    // Let's check userStore type or just assume dynamic access for now.
    const user = userStore.userInfo as any;
    return user.discount_rate || 100;
  });

  const finalUnitPrice = computed(() => {
    return unitPrice.value * (discountRate.value / 100);
  });

  const totalPrice = computed(() => {
    return finalUnitPrice.value * (formData.count || 0);
  });

  const currentBalance = computed(() => {
    return Number(userStore.userInfo?.balance || 0);
  });

  const isBalanceSufficient = computed(() => {
    // Only check if user is agent/user and price > 0
    // Developer/Admin might not have balance checks strictly on frontend but logic says agent pays.
    // If user role is AGENT.
    if (userStore.role === 'agent') {
      return currentBalance.value >= totalPrice.value;
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatValue = (value: number) => {
    // Value from backend is in seconds
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    if (days > 0) return `${days}天${hours > 0 ? ` ${hours}小时` : ''}`;
    return `${hours}小时`;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      unused: 'green',
      used: 'gray',
      banned: 'red',
      expired: 'orange',
    };
    return map[status] || 'gray';
  };

  const fetchApps = async () => {
    try {
      const res = await getApps({ page: 1, pageSize: 100 });
      appList.value = res.data.list;
    } catch (err) {
      // handle error silently
    }
  };

  const handleAppChange = async (appId: any) => {
    formData.card_type_id = undefined;
    cardTypeList.value = [];
    if (!appId) return;

    try {
      const { data } = await getCardTypes({
        app_id: appId,
        page: 1,
        pageSize: 1000,
      });
      cardTypeList.value = data.list;
    } catch (err) {
      // ignore
    }
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: CardListQuery = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status: searchForm.status || undefined,
        app_id: searchForm.app_id || undefined,
        code: searchForm.code || undefined,
        remark: searchForm.remark || undefined,
        used_by: searchForm.used_by || undefined,
      };
      const res = await getCards(params);
      tableData.value = res.data.list;
      pagination.total = res.data.total;
    } catch (err) {
      // ignore
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  const handleReset = () => {
    searchForm.status = undefined;
    searchForm.app_id = undefined;
    searchForm.code = '';
    searchForm.remark = '';
    searchForm.used_by = '';
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
    formData.value = 24; // Default 24 hours
    formData.app_id = appList.value.length > 0 ? appList.value[0].id : 0;
    formData.count = 1;
    formData.remark = '';
    formData.card_type_id = undefined;
    // Trigger app change to load types if default app exists
    if (formData.app_id) handleAppChange(formData.app_id);
  };

  const handleGenerate = () => {
    resetForm();
    modalVisible.value = true;
    userStore.info();
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  const resultModalVisible = ref(false);
  const generatedCards = ref<CardRecord[]>([]);

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    if (!isBalanceSufficient.value) {
      Message.error(t('cards.form.balance.insufficient'));
      return;
    }

    modalLoading.value = true;
    try {
      const submitData = { ...formData };

      const res = (await generateCards(submitData)) as unknown as {
        data: CardRecord[];
      };
      const cards = Array.isArray(res?.data) ? res.data : [];

      Message.success(t('cards.message.generateSuccess'));
      modalVisible.value = false;
      resetForm();
      fetchData();
      userStore.info();

      if (cards.length > 0) {
        generatedCards.value = cards;
        resultModalVisible.value = true;
      }
    } catch (err) {
      // handle error
    } finally {
      modalLoading.value = false;
    }
  };

  const handleCopyAll = async () => {
    const text = generatedCards.value.map((c) => c.code).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      Message.success(t('cards.message.copySuccess'));
    } catch {
      Message.error(t('cards.message.copyFail'));
    }
  };

  const handleBan = async (id: number) => {
    try {
      await banCard(id);
      Message.success(t('cards.message.banSuccess'));
      fetchData();
    } catch (err) {
      // handle error silently
    }
  };

  const handleUnban = async (id: number) => {
    try {
      await unbanCard(id);
      Message.success(t('cards.message.unbanSuccess'));
      fetchData();
    } catch (err) {
      // handle error silently
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCard(id);
      Message.success(t('cards.message.deleteSuccess'));
      fetchData();
    } catch (err) {
      // handle error silently
    }
  };

  const exportModalVisible = ref(false);
  const exportScope = ref<'current' | 'all'>('current');

  const openExportModal = () => {
    exportScope.value = 'current';
    exportModalVisible.value = true;
  };

  const handleExportConfirm = async () => {
    exportLoading.value = true;
    try {
      const params = new URLSearchParams();
      if (searchForm.status) params.append('status', searchForm.status);
      if (searchForm.app_id) params.append('app_id', String(searchForm.app_id));
      if (exportScope.value === 'current') {
        params.append('page', String(pagination.current));
        params.append('pageSize', String(pagination.pageSize));
      }

      // 响应拦截器返回 response.data，此处 blob 本身即是 Blob 实例
      const blob = (await axios.get(`/cards/export?${params.toString()}`, {
        responseType: 'blob',
      })) as unknown as Blob;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cards_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Message.success(t('cards.message.exportSuccess'));
      exportModalVisible.value = false;
    } catch (err) {
      Message.error(t('cards.message.exportFail'));
    } finally {
      exportLoading.value = false;
    }
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

  .general-card {
    min-height: 600px;
  }

  .price-info {
    background: var(--color-fill-2);
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px;

      .price-label {
        color: var(--color-text-3);
      }

      .price-value {
        font-weight: 500;

        &.highlight {
          color: rgb(var(--primary-6));
          font-size: 15px;
        }

        .insufficient {
          color: rgb(var(--danger-6));
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
  }
</style>
