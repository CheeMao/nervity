<template>
  <div class="container">
    <Breadcrumb :items="['menu.users', 'menu.users.list']" icon="icon-user" />
    <a-card class="general-card" :title="$t('menu.users.list')">
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
                  field="username"
                  :label="$t('users.form.username')"
                >
                  <a-input
                    v-model="searchForm.username"
                    :placeholder="$t('users.form.search.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="role" :label="$t('users.form.role')">
                  <a-select
                    v-model="searchForm.role"
                    :placeholder="$t('users.columns.role')"
                    allow-clear
                  >
                    <a-option :value="UserRole.ADMIN">{{
                      $t('users.role.admin')
                    }}</a-option>
                    <a-option :value="UserRole.DEVELOPER">{{
                      $t('users.role.developer')
                    }}</a-option>
                    <a-option :value="UserRole.AGENT">{{
                      $t('users.role.agent')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="is_active" :label="$t('users.form.status')">
                  <a-select
                    v-model="searchForm.is_active"
                    :placeholder="$t('users.columns.status')"
                    allow-clear
                  >
                    <a-option :value="true">{{
                      $t('users.status.active')
                    }}</a-option>
                    <a-option :value="false">{{
                      $t('users.status.inactive')
                    }}</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="remark" :label="$t('users.form.remark')">
                  <a-input
                    v-model="searchForm.remark"
                    :placeholder="$t('users.form.search.remark.placeholder')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="created_at"
                  :label="$t('users.form.created_at')"
                >
                  <a-range-picker
                    v-model="searchForm.created_at"
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
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              {{ $t('users.operation.search') }}
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('users.operation.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-button
            v-permission:perm="['user:create']"
            type="primary"
            @click="handleCreate"
          >
            <template #icon><icon-plus /></template>
            {{ $t('users.operation.create') }}
          </a-button>
        </a-col>
        <a-col :span="12" style="display: flex; justify-content: end">
          <a-button @click="fetchData">
            <template #icon><icon-refresh /></template>
            {{ $t('users.operation.refresh') }}
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
        <template #email="{ record }">
          {{ record.email || '-' }}
        </template>
        <template #role="{ record }">
          <a-tag
            :color="
              record.role === UserRole.ADMIN
                ? 'red'
                : record.role === UserRole.DEVELOPER
                ? 'arcoblue'
                : record.role === UserRole.AGENT
                ? 'orange'
                : 'gray'
            "
          >
            {{ $t(`users.role.${record.role}`) }}
          </a-tag>
        </template>
        <template #balance="{ record }">
          ¥{{ formatBalance(record.balance) }}
        </template>
        <template #is_active="{ record }">
          <a-tag :color="record.is_active ? 'green' : 'red'">
            {{
              record.is_active
                ? $t('users.status.active')
                : $t('users.status.inactive')
            }}
          </a-tag>
        </template>

        <template #created_at="{ record }">
          {{ formatDate(record.created_at) }}
        </template>
        <template #expire_at="{ record }">
          {{
            record.expire_at
              ? formatDate(record.expire_at)
              : $t('users.columns.permanent')
          }}
        </template>
        <template #operations="{ record }">
          <a-space size="small">
            <a-button type="text" size="small" @click="handleEdit(record)">
              {{ $t('users.operation.edit') }}
            </a-button>
            <a-popconfirm
              :content="$t('users.operation.deleteConfirm')"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" status="danger" size="small">
                {{ $t('users.operation.delete') }}
              </a-button>
            </a-popconfirm>
            <a-button type="text" size="small" @click="handleViewLogs(record)">
              {{ $t('users.operation.balanceLogs') }}
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <BalanceLogDrawer
      v-model:visible="logsDrawerVisible"
      :user-id="logsUserId"
    />

    <!-- 新建用户弹窗 -->
    <a-modal
      v-model:visible="createModalVisible"
      :title="$t('users.modal.createTitle')"
      :ok-loading="modalLoading"
      :width="600"
      @ok="handleCreateSubmit"
      @cancel="handleCreateModalCancel"
    >
      <a-form
        ref="createFormRef"
        :model="createFormData"
        :rules="createFormRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" :label="$t('users.form.username')">
              <a-input v-model="createFormData.username" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="password" :label="$t('users.form.password')">
              <a-input-password
                v-model="createFormData.password"
                :placeholder="$t('users.form.password.required')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" :label="$t('users.form.email')">
              <a-input v-model="createFormData.email" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="role" :label="$t('users.form.role')">
              <a-select v-model="createFormData.role" placeholder="选择角色">
                <a-option v-if="canCreateDeveloper" :value="UserRole.DEVELOPER">{{
                  $t('users.role.developer')
                }}</a-option>
                <a-option :value="UserRole.AGENT">{{
                  $t('users.role.agent')
                }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="createFormData.role === UserRole.AGENT">
            <a-col :span="12">
              <a-form-item field="level" :label="$t('users.form.level')">
                <a-input-number v-model="createFormData.level" :min="1" :step="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="discount_rate" :label="$t('users.form.discount_rate')">
                <a-input-number
                  v-model="createFormData.discount_rate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col :span="12">
            <a-form-item field="balance" :label="$t('users.form.balance')">
              <a-input-number
                v-model="createFormData.balance"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="is_active" :label="$t('users.form.isActive')">
              <a-switch v-model="createFormData.is_active" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="expire_at" :label="$t('users.form.expire_at')" :label-col-props="{ span: 3 }" :wrapper-col-props="{ span: 21 }">
              <a-date-picker
                v-model="createFormData.expire_at"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="remark" :label="$t('users.form.remark')" :label-col-props="{ span: 3 }" :wrapper-col-props="{ span: 21 }">
              <a-textarea v-model="createFormData.remark" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="$t('users.modal.editTitle')"
      :ok-loading="modalLoading"
      :width="600"
      @ok="handleSubmit"
      @cancel="handleModalCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="username" :label="$t('users.form.username')">
              <a-input v-model="formData.username" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" :label="$t('users.form.email')">
              <a-input v-model="formData.email" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="password" :label="$t('users.form.password')">
              <a-input-password
                v-model="formData.password"
                :placeholder="$t('users.form.password.placeholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="role" :label="$t('users.form.role')">
              <a-select v-model="formData.role" placeholder="Select Role">
                <a-option v-if="canCreateDeveloper" :value="UserRole.DEVELOPER">{{
                  $t('users.role.developer')
                }}</a-option>
                <a-option :value="UserRole.AGENT">{{
                  $t('users.role.agent')
                }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <template v-if="formData.role === UserRole.AGENT">
            <a-col :span="12">
              <a-form-item field="level" :label="$t('users.form.level')">
                <a-input-number v-model="formData.level" :min="1" :step="1" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="discount_rate" :label="$t('users.form.discount_rate')">
                <a-input-number
                  v-model="formData.discount_rate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col :span="12">
            <a-form-item field="balance" :label="$t('users.form.balance')">
              <a-input-number v-model="formData.balance" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="is_active" :label="$t('users.form.isActive')">
              <a-switch v-model="formData.is_active" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="expire_at" :label="$t('users.form.expire_at')" :label-col-props="{ span: 3 }" :wrapper-col-props="{ span: 21 }">
              <a-date-picker
                v-model="formData.expire_at"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item field="remark" :label="$t('users.form.remark')" :label-col-props="{ span: 3 }" :wrapper-col-props="{ span: 21 }">
              <a-textarea v-model="formData.remark" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/store';
  import {
    getUsers,
    updateUser,
    deleteUser,
    createUser,
  } from '@/api/users-admin';
  import type {
    UserRecord,
    UpdateUserData,
    UserListQuery,
    CreateUserData,
  } from '@/types/users';
  import { UserRole } from '@/types/users';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import BalanceLogDrawer from '../components/balance-logs.vue';

  const { t } = useI18n();
  const userStore = useUserStore();

  const loading = ref(false);
  const tableData = ref<UserRecord[]>([]);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    showJumper: true,
    pageSizeOptions: [10, 20, 30, 40, 50],
  });

  const searchForm = reactive<UserListQuery & { created_at?: Date[] }>({
    page: 1,
    pageSize: 10,
    username: '',
    role: undefined,
    is_active: undefined,
    remark: '',
    created_at: [],
  });

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('users.columns.id'),
      dataIndex: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: t('users.columns.username'),
      dataIndex: 'username',
      width: 120,
      align: 'center',
    },
    {
      title: t('users.columns.email'),
      dataIndex: 'email',
      slotName: 'email',
      width: 80,
      ellipsis: true,
      tooltip: true,
      align: 'center',
    },
    {
      title: t('users.columns.role'),
      dataIndex: 'role',
      slotName: 'role',
      width: 100,
      align: 'center',
    },
    {
      title: t('users.columns.balance'),
      dataIndex: 'balance',
      slotName: 'balance',
      width: 100,
      align: 'center',
    },
    {
      title: t('users.columns.status'),
      dataIndex: 'is_active',
      slotName: 'is_active',
      width: 100,
      align: 'center',
    },

    {
      title: t('users.columns.createdAt'),
      dataIndex: 'created_at',
      slotName: 'created_at',
      width: 100,
      align: 'center',
    },
    {
      title: t('users.columns.expire_at'),
      dataIndex: 'expire_at',
      slotName: 'expire_at',
      width: 100,
      align: 'center',
    },
    {
      title: t('users.columns.remark'),
      dataIndex: 'remark',
      slotName: 'remark',
      width: 80,
      align: 'center',
    },
    {
      title: t('users.columns.operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 220,
      fixed: 'center',
      align: 'center',
    },
  ]);

  // 判断当前用户是否可以创建开发者
  const canCreateDeveloper = computed(() => {
    return userStore.role === 'admin' || userStore.role_name === 'Super Admin';
  });

  // 编辑 Modal state
  const modalVisible = ref(false);
  const modalLoading = ref(false);
  const editingId = ref<number | null>(null);
  const formRef = ref();

  const formData = reactive<UpdateUserData>({
    username: '',
    email: '',
    password: '',
    role: UserRole.AGENT,
    balance: 0,
    is_active: true,
    expire_at: undefined,
    remark: '',
    level: 1,
    discount_rate: 100,
  });

  // 新建 Modal state
  const createModalVisible = ref(false);
  const createFormRef = ref();

  const createFormData = reactive<CreateUserData>({
    username: '',
    password: '',
    email: '',
    role: UserRole.AGENT,
    balance: 0,
    is_active: true,
    expire_at: undefined,
    remark: '',
    level: 1,
    discount_rate: 100,
  });

  const logsDrawerVisible = ref(false);
  const logsUserId = ref<number | null>(null);

  const formRules = {
    username: [{ required: true, message: '用户名不能为空' }],
  };

  const createFormRules = {
    username: [{ required: true, message: '用户名不能为空' }],
    password: [{ required: true, message: '密码不能为空' }],
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatBalance = (balance: any) => {
    const num = parseFloat(String(balance ?? 0));
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: UserListQuery = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        username: searchForm.username || undefined,
        role: searchForm.role || undefined,
        is_active: searchForm.is_active,
        remark: searchForm.remark || undefined,
        created_at_start: searchForm.created_at?.[0]
          ? new Date(searchForm.created_at[0]).toISOString()
          : undefined,
        created_at_end: searchForm.created_at?.[1]
          ? new Date(searchForm.created_at[1]).toISOString()
          : undefined,
      };
      const res = await getUsers(params);
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
    searchForm.username = '';
    searchForm.role = undefined;
    searchForm.is_active = undefined;
    searchForm.remark = '';
    searchForm.created_at = [];
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

  // 新建用户
  const handleCreate = () => {
    createFormData.username = '';
    createFormData.password = '';
    createFormData.email = '';
    createFormData.role = canCreateDeveloper.value
      ? UserRole.DEVELOPER
      : UserRole.AGENT;
    createFormData.balance = 0;
    createFormData.is_active = true;
    createFormData.expire_at = undefined;
    createFormData.remark = '';
    createFormData.level = 1;
    createFormData.discount_rate = 100;
    createModalVisible.value = true;
  };

  const handleCreateModalCancel = () => {
    createModalVisible.value = false;
  };

  const handleCreateSubmit = async () => {
    const valid = await createFormRef.value?.validate();
    if (valid) return;

    modalLoading.value = true;
    try {
      await createUser(createFormData);
      Message.success(t('users.message.createSuccess'));
      createModalVisible.value = false;
      fetchData();
    } catch (err) {
      // handle error silently
    } finally {
      modalLoading.value = false;
    }
  };

  const handleEdit = (record: UserRecord) => {
    formData.username = record.username;
    formData.email = record.email || '';
    formData.password = ''; // Reset password field
    formData.role = record.role;
    formData.balance = Number(record.balance);
    formData.is_active = record.is_active;
    formData.expire_at = record.expire_at;
    formData.remark = record.remark;
    formData.level = record.level || 1;
    formData.discount_rate = record.discount_rate || 100;

    editingId.value = record.id;
    modalVisible.value = true;
  };

  const handleModalCancel = () => {
    modalVisible.value = false;
  };

  const handleViewLogs = (record: UserRecord) => {
    logsUserId.value = record.id;
    logsDrawerVisible.value = true;
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    modalLoading.value = true;
    try {
      if (editingId.value) {
        await updateUser(editingId.value, formData);
        Message.success(t('users.message.updateSuccess'));
      }
      modalVisible.value = false;
      fetchData();
    } catch (err) {
      // handle error silently
    } finally {
      modalLoading.value = false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      Message.success(t('users.message.deleteSuccess'));
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
