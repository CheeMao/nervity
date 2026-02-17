<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.access.control', 'menu.access.control.roles']"
      icon="icon-safe"
    />
    <a-card class="general-card" :title="$t('menu.access.control.roles')">
      <a-row :gutter="24">
        <!-- 左侧：角色列表 -->
        <a-col :span="8">
          <div class="role-list-header">
            <span class="title">{{ $t('access.control.role.list') }}</span>
            <a-button type="primary" size="small" @click="handleAdd">
              <template #icon><icon-plus /></template>
              {{ $t('access.control.role.create') }}
            </a-button>
          </div>
          <a-spin :loading="loading" style="width: 100%">
            <div class="role-list">
              <div
                v-for="role in renderData"
                :key="role.id"
                class="role-item"
                :class="{ active: selectedRole?.id === role.id }"
                @click="selectRole(role)"
              >
                <div class="role-info">
                  <div class="role-name">
                    {{ role.name }}
                    <a-tag v-if="role.is_system" size="small" color="blue">
                      {{ $t('access.control.role.system.hint') }}
                    </a-tag>
                  </div>
                  <div class="role-desc">{{ role.description }}</div>
                </div>
                <div class="role-count">
                  {{ role.permissions?.length || 0 }}
                  {{ $t('access.control.role.permissions') }}
                </div>
              </div>
            </div>
          </a-spin>
        </a-col>

        <!-- 右侧：权限编辑区 -->
        <a-col :span="16">
          <div v-if="selectedRole" class="permission-editor">
            <div class="editor-header">
              <a-form :model="form" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item
                      :label="$t('access.control.role.name')"
                      field="name"
                    >
                      <a-input
                        v-model="form.name"
                        :disabled="selectedRole.is_system"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item
                      :label="$t('access.control.role.description')"
                      field="description"
                    >
                      <a-input v-model="form.description" />
                    </a-form-item>
                  </a-col>
                </a-row>
              </a-form>
            </div>

            <a-divider />

            <div class="permissions-section">
              <div class="section-title">
                <span>{{ $t('access.control.role.permissions.config') }}</span>
                <span class="selected-count">
                  {{ $t('access.control.role.permissions.selected') }}:
                  {{ form.permissionIds.length }}
                </span>
              </div>

              <div class="module-list">
                <a-collapse :default-active-key="moduleNames" :bordered="false">
                  <a-collapse-item
                    v-for="module in permissionModules"
                    :key="module.name"
                    :header="module.label"
                  >
                    <template #extra>
                      <div class="module-extra" @click.stop>
                        <span class="count"
                          >{{ getModuleSelectedCount(module.name) }}/{{
                            module.permissions.length
                          }}</span
                        >
                        <a-switch
                          size="small"
                          :model-value="isModuleAllSelected(module.name)"
                          @change="toggleModuleAll(module.name, $event)"
                        />
                        <span class="select-all-text">{{
                          $t('access.control.role.select.all')
                        }}</span>
                      </div>
                    </template>
                    <a-checkbox-group
                      v-model="form.permissionIds"
                      class="permission-checkboxes"
                    >
                      <a-row :gutter="[16, 8]">
                        <a-col
                          v-for="perm in module.permissions"
                          :key="perm.id"
                          :span="8"
                        >
                          <a-checkbox :value="perm.id">
                            {{ perm.description }}
                          </a-checkbox>
                        </a-col>
                      </a-row>
                    </a-checkbox-group>
                  </a-collapse-item>
                </a-collapse>
              </div>
            </div>

            <div class="editor-footer">
              <a-space size="small">
                <a-button type="primary" :loading="saving" @click="handleSave">
                  {{ $t('button.save') }}
                </a-button>
                <a-popconfirm
                  v-if="!selectedRole.is_system"
                  :content="$t('access.control.role.delete.confirm')"
                  @ok="handleDelete"
                >
                  <a-button status="danger">{{ $t('button.delete') }}</a-button>
                </a-popconfirm>
              </a-space>
            </div>
          </div>

          <div v-else class="empty-state">
            <a-empty description="请选择一个角色进行编辑" />
          </div>
        </a-col>
      </a-row>

      <!-- 新建角色 Modal -->
      <a-modal
        v-model:visible="createVisible"
        :title="$t('access.control.role.create')"
        @ok="handleCreate"
      >
        <a-form ref="createFormRef" :model="createForm">
          <a-form-item
            field="name"
            :label="$t('access.control.role.name')"
            :rules="[{ required: true, message: '请输入角色名称' }]"
          >
            <a-input v-model="createForm.name" />
          </a-form-item>
          <a-form-item
            field="description"
            :label="$t('access.control.role.description')"
          >
            <a-textarea v-model="createForm.description" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    Role,
    Permission,
  } from '@/api/access-control';
  import { Message } from '@arco-design/web-vue';

  const { t } = useI18n();
  const loading = ref(false);
  const saving = ref(false);
  const renderData = ref<Role[]>([]);
  const permissions = ref<Permission[]>([]);
  const selectedRole = ref<Role | null>(null);
  const createVisible = ref(false);
  const createFormRef = ref();

  const form = reactive({
    name: '',
    description: '',
    permissionIds: [] as number[],
  });

  const createForm = reactive({
    name: '',
    description: '',
  });

  // 模块名称映射（按照左侧导航结构组织）
  const moduleLabels: Record<string, string> = {
    // 按照导航菜单结构
    统计分析: '📊 仪表盘',
    用户管理: '👥 后台用户',
    应用管理: '📱 应用管理',
    卡密管理: '🎫 卡密管理',
    卡密类型: '🏷️ 卡密类型',
    终端用户: '👤 终端用户',
    云函数: '☁️ 云函数',
    远程变量: '📝 远程变量',
    系统管理: '⚙️ 系统管理（角色权限）',
    黑名单: '🚫 黑名单',
    操作日志: '📋 操作日志',
    系统文档: '📚 系统文档',
  };

  // 模块排序（按照导航顺序）
  const moduleOrder = [
    '统计分析',
    '用户管理',
    '应用管理',
    '卡密类型',
    '卡密管理',
    '终端用户',
    '云函数',
    '远程变量',
    '系统管理',
    '黑名单',
    '操作日志',
    '系统文档',
  ];

  // 按模块分组权限（按导航顺序排序）
  const permissionModules = computed(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.value.forEach((p) => {
      if (!groups[p.module]) {
        groups[p.module] = [];
      }
      groups[p.module].push(p);
    });

    // 按照 moduleOrder 排序
    const sortedModules = moduleOrder
      .filter((name) => groups[name])
      .map((name) => ({
        name,
        label: moduleLabels[name] || name,
        permissions: groups[name],
      }));

    // 添加未在排序列表中的模块
    Object.keys(groups).forEach((name) => {
      if (!moduleOrder.includes(name)) {
        sortedModules.push({
          name,
          label: moduleLabels[name] || name,
          permissions: groups[name],
        });
      }
    });

    return sortedModules;
  });

  const moduleNames = computed(() =>
    permissionModules.value.map((m) => m.name)
  );

  // 获取模块已选数量
  const getModuleSelectedCount = (moduleName: string) => {
    const module = permissionModules.value.find((m) => m.name === moduleName);
    if (!module) return 0;
    return module.permissions.filter((p) => form.permissionIds.includes(p.id))
      .length;
  };

  // 检查模块是否全选
  const isModuleAllSelected = (moduleName: string) => {
    const module = permissionModules.value.find((m) => m.name === moduleName);
    if (!module || module.permissions.length === 0) return false;
    return module.permissions.every((p) => form.permissionIds.includes(p.id));
  };

  // 切换模块全选
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleModuleAll = (moduleName: string, checked: any) => {
    const module = permissionModules.value.find((m) => m.name === moduleName);
    if (!module) return;

    const modulePermIds = module.permissions.map((p) => p.id);
    if (checked) {
      // 添加所有
      const newIds = new Set([...form.permissionIds, ...modulePermIds]);
      form.permissionIds = Array.from(newIds);
    } else {
      // 移除所有
      form.permissionIds = form.permissionIds.filter(
        (id) => !modulePermIds.includes(id)
      );
    }
  };

  const selectRole = (role: Role) => {
    selectedRole.value = role;
    form.name = role.name;
    form.description = role.description;
    form.permissionIds = role.permissions?.map((p) => p.id) || [];
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const { data } = await getRoles();
      renderData.value = data;
      // 自动选择第一个角色
      if (data.length > 0 && !selectedRole.value) {
        selectRole(data[0]);
      }
    } finally {
      loading.value = false;
    }
  };

  const fetchPermissions = async () => {
    const { data } = await getPermissions();
    permissions.value = data;
  };

  const handleAdd = () => {
    createForm.name = '';
    createForm.description = '';
    createVisible.value = true;
  };

  const handleCreate = async () => {
    await createFormRef.value?.validate();
    await createRole({
      name: createForm.name,
      description: createForm.description,
      permissionIds: [],
    });
    Message.success(t('access.control.role.save.success'));
    createVisible.value = false;
    await fetchData();
  };

  const handleSave = async () => {
    if (!selectedRole.value) return;
    saving.value = true;
    try {
      await updateRole(selectedRole.value.id, {
        name: form.name,
        description: form.description,
        permissionIds: form.permissionIds,
      });
      Message.success(t('access.control.role.save.success'));
      await fetchData();
      // 重新选择当前角色以刷新数据
      const updated = renderData.value.find(
        (r) => r.id === selectedRole.value?.id
      );
      if (updated) selectRole(updated);
    } finally {
      saving.value = false;
    }
  };

  const handleDelete = async () => {
    if (!selectedRole.value) return;
    await deleteRole(selectedRole.value.id);
    Message.success(t('access.control.role.delete.success'));
    selectedRole.value = null;
    await fetchData();
  };

  onMounted(() => {
    fetchData();
    fetchPermissions();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }

  .role-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title {
      font-weight: 600;
      font-size: 14px;
    }
  }

  .role-list {
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    max-height: 600px;
    overflow-y: auto;
  }

  .role-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-1);
    transition: all 0.2s;

    &:hover {
      background-color: var(--color-fill-2);
    }

    &.active {
      background-color: var(--color-primary-light-1);
      border-left: 3px solid rgb(var(--primary-6));
    }

    &:last-child {
      border-bottom: none;
    }

    .role-info {
      flex: 1;
    }

    .role-name {
      font-weight: 500;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-desc {
      font-size: 12px;
      color: var(--color-text-3);
    }

    .role-count {
      font-size: 12px;
      color: var(--color-text-3);
      white-space: nowrap;
    }
  }

  .permission-editor {
    background: var(--color-bg-2);
    border-radius: 4px;
    padding: 20px;
    min-height: 600px;
  }

  .editor-header {
    margin-bottom: 8px;
  }

  .permissions-section {
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 600;

      .selected-count {
        font-size: 12px;
        color: var(--color-text-3);
        font-weight: normal;
      }
    }
  }

  .module-list {
    :deep(.arco-collapse-item-header) {
      font-weight: 500;
    }

    .module-extra {
      display: flex;
      align-items: center;
      gap: 8px;

      .count {
        font-size: 12px;
        color: var(--color-text-3);
      }

      .select-all-text {
        font-size: 12px;
        color: var(--color-text-2);
      }
    }
  }

  .permission-checkboxes {
    width: 100%;
  }

  .editor-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: var(--color-bg-2);
    border-radius: 4px;
  }
</style>
