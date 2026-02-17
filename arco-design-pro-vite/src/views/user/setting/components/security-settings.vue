<template>
  <div class="security-settings">
    <a-card :bordered="false" title="修改登录密码">
      <a-form
        :model="passwordForm"
        layout="vertical"
        class="form-wrapper"
        @submit="handleChangePassword"
      >
        <a-form-item field="password" label="新密码" required>
          <a-input-password
            v-model="passwordForm.password"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item field="confirmPassword" label="确认密码" required>
          <a-input-password
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading"
            >确认修改</a-button
          >
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { changePassword } from '@/api/user';

  const loading = ref(false);
  const passwordForm = reactive({ password: '', confirmPassword: '' });

  const handleChangePassword = async () => {
    if (!passwordForm.password || !passwordForm.confirmPassword) {
      Message.error('请输入密码');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      Message.error('两次输入的密码不一致');
      return;
    }

    loading.value = true;
    try {
      await changePassword(passwordForm.password);
      Message.success('密码修改成功');
      passwordForm.password = '';
      passwordForm.confirmPassword = '';
    } catch (err) {
      // error handled by interceptor or global handler usually
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped lang="less">
  .security-settings {
    padding: 20px;
    background-color: var(--color-bg-2);
    min-height: 100%;
  }

  .form-wrapper {
    max-width: 500px;
  }
</style>
