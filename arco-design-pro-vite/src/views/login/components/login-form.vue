<template>
  <div class="login-form-wrapper">
    <div class="login-form-header">
      <h2 class="login-form-title">欢迎回来</h2>
      <p class="login-form-sub-title">登录您的 NetVerify 账号</p>
    </div>
    <div v-if="errorMessage" class="login-form-error-msg">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M7 4v3M7 9h.01"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      {{ errorMessage }}
    </div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: $t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          :placeholder="$t('login.form.password.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberPassword"
            :model-value="loginConfig.rememberPassword"
            @change="setRememberPassword as any"
          >
            {{ $t('login.form.rememberPassword') }}
          </a-checkbox>
          <a-link>{{ $t('login.form.forgetPassword') }}</a-link>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading">
          {{ $t('login.form.login') }}
        </a-button>
        <a-button
          type="text"
          long
          class="login-form-register-btn"
          @click="goToRegister"
        >
          {{ $t('login.form.register') }}
        </a-button>
      </a-space>
    </a-form>

    <a-modal
      v-model:visible="visible"
      title="二步验证"
      @ok="handle2FABSubmit"
      @cancel="handleCancel"
    >
      <a-form :model="twoFactorForm" layout="vertical">
        <a-form-item field="code" label="验证码" required>
          <a-input
            v-model="twoFactorForm.code"
            placeholder="请输入6位验证码"
            :max-length="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';

  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();

  const emit = defineEmits(['goToRegister']);

  const loginConfig = useStorage('login-config', {
    rememberPassword: true,
    username: 'admin', // 演示默认值
    password: 'admin', // demo default value
  });
  const userInfo = reactive({
    username: loginConfig.value.username,
    password: loginConfig.value.password,
  });

  const visible = ref(false);
  const twoFactorForm = reactive({
    code: '',
    loginValues: {} as any,
  });

  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (loading.value) return;
    if (!errors) {
      setLoading(true);
      try {
        await userStore.login(values as LoginData);
        const { redirect, ...othersQuery } = router.currentRoute.value.query;
        router.push({
          name: (redirect as string) || 'Workplace',
          query: {
            ...othersQuery,
          },
        });
        Message.success(t('login.form.login.success'));
        const { rememberPassword } = loginConfig.value;
        const { username, password } = values;
        // 实际生产环境需要进行加密存储。
        // The actual production environment requires encrypted storage.
        loginConfig.value.username = rememberPassword ? username : '';
        loginConfig.value.password = rememberPassword ? password : '';
      } catch (err) {
        const error = err as any;
        if (error.response?.data?.message === '2FA required') {
          // Show 2FA modal
          twoFactorForm.loginValues = values;
          twoFactorForm.code = '';
          visible.value = true;
          errorMessage.value = '';
        } else {
          errorMessage.value = (err as Error).message;
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handle2FABSubmit = async () => {
    if (!twoFactorForm.code) return;
    setLoading(true);
    try {
      await userStore.login({
        ...twoFactorForm.loginValues,
        code: twoFactorForm.code,
      } as LoginData);
      visible.value = false;
      // Redirect logic same as above (duplicate code, better refactor)
      const { redirect, ...othersQuery } = router.currentRoute.value.query;
      router.push({
        name: (redirect as string) || 'Workplace',
        query: {
          ...othersQuery,
        },
      });
      Message.success(t('login.form.login.success'));
    } catch (err) {
      errorMessage.value = (err as Error).message;
      visible.value = false; // Close on error? or keep open?
      // If code invalid, maybe keep open.
      // But store login throws, so we catch here.
      // If invalid code, we can show message.
      Message.error(`验证失败: ${(err as Error).message}`);
      // Re-open if closed?
      // visible.value = true; // It was not closed yet wait.
      // HandleOK closes modal automatically? No, manual control.
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    visible.value = false;
  };
  const setRememberPassword = (value: boolean) => {
    loginConfig.value.rememberPassword = value;
  };

  const goToRegister = () => {
    emit('goToRegister');
  };
</script>

<style lang="less" scoped>
  .login-form {
    &-wrapper {
      width: 100%;
    }

    &-header {
      margin-bottom: 32px;
    }

    &-title {
      color: #1e1b4b;
      font-weight: 700;
      font-size: 28px;
      line-height: 36px;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    &-sub-title {
      color: #94a3b8;
      font-size: 15px;
      line-height: 22px;
      margin: 0;
    }

    &-error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: #fef2f2;
      color: #dc2626;
      font-size: 13px;
      border-radius: 10px;
      border: 1px solid #fecaca;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: #6366f1 !important;
      font-weight: 500;
    }
  }

  /* 覆盖 Arco 主题色为靛蓝 */
  :deep(.arco-btn-primary) {
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border: none;
    border-radius: 10px;
    height: 42px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    transition: all 0.25s ease;
  }

  :deep(.arco-btn-primary:hover) {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
  }

  :deep(.arco-input-wrapper) {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    height: 42px;
    background: #fff;
    transition: all 0.2s ease;
  }

  :deep(.arco-input-wrapper:hover) {
    border-color: #6366f1;
  }

  :deep(.arco-input-wrapper.arco-input-focus) {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  :deep(.arco-link) {
    color: #6366f1;
  }

  :deep(.arco-checkbox-checked .arco-checkbox-icon) {
    background-color: #6366f1;
    border-color: #6366f1;
  }
</style>
