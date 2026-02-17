<template>
  <div class="register-form-wrapper">
    <div class="register-form-header">
      <h2 class="register-form-title">创建账号</h2>
      <p class="register-form-sub-title">注册 NetVerify 开发者或代理商账号</p>
    </div>
    <div v-if="errorMessage" class="register-form-error-msg">
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
      ref="registerForm"
      :model="formData"
      class="register-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <!-- 注册类型选择 -->
      <a-form-item
        field="registerType"
        :rules="[{ required: true, message: $t('login.register.type.errMsg') }]"
        hide-label
      >
        <a-radio-group
          v-model="formData.registerType"
          type="button"
          style="width: 100%"
        >
          <a-radio value="developer" style="flex: 1; text-align: center">
            {{ $t('login.register.type.developer') }}
          </a-radio>
          <a-radio value="agent" style="flex: 1; text-align: center">
            {{ $t('login.register.type.agent') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <!-- 代理商模式：开发者账号验证 -->
      <a-form-item
        v-if="formData.registerType === 'agent'"
        field="developerUsername"
        :rules="[
          { required: true, message: $t('login.register.developer.errMsg') },
        ]"
        hide-label
      >
        <a-input-group style="width: 100%">
          <a-input
            v-model="formData.developerUsername"
            :placeholder="$t('login.register.developer.placeholder')"
            :disabled="developerVerified"
            style="flex: 1"
          >
            <template #prefix>
              <icon-user-group />
            </template>
          </a-input>
          <a-button
            v-if="!developerVerified"
            type="primary"
            :loading="verifyLoading"
            @click="verifyDeveloper"
          >
            {{ $t('login.register.developer.verify') }}
          </a-button>
          <a-tag v-else color="green" style="height: 32px; line-height: 32px">
            <icon-check /> {{ $t('login.register.developer.verified') }}
          </a-tag>
        </a-input-group>
      </a-form-item>

      <!-- 用户名 -->
      <a-form-item
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="formData.username"
          :placeholder="$t('login.register.username.placeholder')"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>

      <!-- 密码 -->
      <a-form-item
        field="password"
        :rules="[
          { required: true, message: $t('login.form.password.errMsg') },
          { minLength: 6, message: $t('login.register.password.minLength') },
        ]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="formData.password"
          :placeholder="$t('login.register.password.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- 确认密码 -->
      <a-form-item
        field="confirmPassword"
        :rules="[
          {
            required: true,
            message: $t('login.register.confirmPassword.errMsg'),
          },
          { validator: validateConfirmPassword },
        ]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="formData.confirmPassword"
          :placeholder="$t('login.register.confirmPassword.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>

      <a-space :size="16" direction="vertical">
        <a-button
          type="primary"
          html-type="submit"
          long
          :loading="loading"
          :disabled="formData.registerType === 'agent' && !developerVerified"
        >
          {{ $t('login.register.submit') }}
        </a-button>
        <a-button
          type="text"
          long
          class="register-form-back-btn"
          @click="goBack"
        >
          {{ $t('login.register.back') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { publicRegister, lookupDeveloper } from '@/api/user';
  import type { RegisterType } from '@/api/user';

  const emit = defineEmits(['back', 'success']);

  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const verifyLoading = ref(false);
  const developerVerified = ref(false);
  const developerId = ref<number | null>(null);

  const formData = reactive({
    registerType: 'developer' as RegisterType,
    username: '',
    password: '',
    confirmPassword: '',
    developerUsername: '',
  });

  // 监听注册类型变化，重置开发者验证状态
  watch(
    () => formData.registerType,
    () => {
      developerVerified.value = false;
      developerId.value = null;
      formData.developerUsername = '';
      errorMessage.value = '';
    }
  );

  // 验证确认密码
  const validateConfirmPassword = (
    value: string,
    callback: (error?: string) => void
  ) => {
    if (value !== formData.password) {
      callback(t('login.register.confirmPassword.notMatch'));
    } else {
      callback();
    }
  };

  // 验证开发者账号
  const verifyDeveloper = async () => {
    if (!formData.developerUsername) {
      errorMessage.value = t('login.register.developer.errMsg');
      return;
    }

    verifyLoading.value = true;
    errorMessage.value = '';

    try {
      const { data } = await lookupDeveloper(formData.developerUsername);
      developerId.value = data.id;
      developerVerified.value = true;
      Message.success(t('login.register.developer.verifySuccess'));
    } catch (err: any) {
      errorMessage.value =
        err.message || t('login.register.developer.verifyFailed');
    } finally {
      verifyLoading.value = false;
    }
  };

  // 提交注册
  const handleSubmit = async ({
    errors,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (loading.value) return;
    if (errors) return;

    // 代理商模式必须先验证开发者
    if (formData.registerType === 'agent' && !developerVerified.value) {
      errorMessage.value = t('login.register.developer.verifyFirst');
      return;
    }

    setLoading(true);
    errorMessage.value = '';

    try {
      const { data } = await publicRegister({
        username: formData.username,
        password: formData.password,
        registerType: formData.registerType,
        developerUsername:
          formData.registerType === 'agent'
            ? formData.developerUsername
            : undefined,
      });

      if (data.isActive) {
        Message.success(data.message);
      } else {
        Message.info(data.message);
      }

      emit('success', data);
    } catch (err: any) {
      errorMessage.value = err.message || t('login.register.failed');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    emit('back');
  };
</script>

<style lang="less" scoped>
  .register-form {
    &-wrapper {
      width: 100%;
    }

    &-header {
      margin-bottom: 24px;
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

    &-back-btn {
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

  :deep(.arco-radio-group-button .arco-radio-button.arco-radio-checked) {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
  }

  :deep(.arco-tag-green) {
    background: #d1fae5;
    color: #059669;
    border-color: #a7f3d0;
  }
</style>
