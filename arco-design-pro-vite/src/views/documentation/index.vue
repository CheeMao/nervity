<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.documentation', 'menu.documentation.index']"
      icon="icon-book"
    />
    <a-card class="general-card" :title="$t('documentation.title')">
      <a-tabs v-model:active-key="activeTab" type="rounded">
        <!-- 概述 -->
        <a-tab-pane key="overview" :title="$t('documentation.tab.overview')">
          <overview-section />
        </a-tab-pane>

        <!-- 用户认证 -->
        <a-tab-pane key="auth" :title="$t('documentation.tab.auth')">
          <auth-section />
        </a-tab-pane>

        <!-- 卡密管理 -->
        <a-tab-pane key="card" :title="$t('documentation.tab.card')">
          <card-section />
        </a-tab-pane>

        <!-- 设备管理 -->
        <a-tab-pane key="device" :title="$t('documentation.tab.device')">
          <device-section />
        </a-tab-pane>

        <!-- 远程变量 -->
        <a-tab-pane key="variable" :title="$t('documentation.tab.variable')">
          <variable-section />
        </a-tab-pane>

        <!-- 云函数 -->
        <a-tab-pane key="cloud" :title="$t('documentation.tab.cloud')">
          <cloud-section />
        </a-tab-pane>

        <!-- 数据加密 -->
        <a-tab-pane
          key="encryption"
          :title="$t('documentation.tab.encryption')"
        >
          <encryption-section />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import OverviewSection from './components/overview-section.vue';
  import AuthSection from './components/auth-section.vue';
  import CardSection from './components/card-section.vue';
  import DeviceSection from './components/device-section.vue';
  import VariableSection from './components/variable-section.vue';
  import CloudSection from './components/cloud-section.vue';
  import EncryptionSection from './components/encryption-section.vue';

  const activeTab = ref('overview');
</script>

<style scoped>
  .container {
    padding: 0 20px 20px 20px;
  }

  :deep(.arco-tabs-content) {
    padding-top: 16px;
  }
</style>
