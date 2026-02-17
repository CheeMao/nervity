<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="login-brand">
      <!-- 装饰性背景形状 -->
      <div class="brand-shapes">
        <div class="brand-shape shape-1"></div>
        <div class="brand-shape shape-2"></div>
        <div class="brand-shape shape-3"></div>
      </div>

      <div class="brand-content">
        <!-- Logo -->
        <div class="brand-logo">
          <Logo :size="40" :bg-visible="true" />
          <span class="brand-name">NetVerify</span>
        </div>

        <!-- 主标题 -->
        <h1 class="brand-title">
          企业级<br />
          <span class="brand-title-highlight">软件授权验证平台</span>
        </h1>

        <p class="brand-subtitle">
          为开发者提供安全、灵活、高效的软件授权管理与验证服务
        </p>

        <!-- 特性列表 -->
        <div class="brand-features">
          <div class="brand-feature">
            <div class="feature-check">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>AES+RSA 全链路加密</span>
          </div>
          <div class="brand-feature">
            <div class="feature-check">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>RBAC 权限控制</span>
          </div>
          <div class="brand-feature">
            <div class="feature-check">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>多端 SDK 快速接入</span>
          </div>
          <div class="brand-feature">
            <div class="feature-check">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 5"
                  stroke="#10B981"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>实时心跳 & 设备绑定</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-content">
      <div class="login-content-inner">
        <LoginForm
          v-if="currentView === 'login'"
          @go-to-register="goToRegister"
        />
        <RegisterForm
          v-else
          @back="goToLogin"
          @success="handleRegisterSuccess"
        />
      </div>

      <!-- 底部版权 -->
      <div class="login-footer"> © 2026 NetVerify. All rights reserved. </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import Logo from '@/components/brand/Logo.vue';
  import LoginForm from './components/login-form.vue';
  import RegisterForm from './components/register-form.vue';

  type ViewType = 'login' | 'register';

  const currentView = ref<ViewType>('login');

  const goToRegister = () => {
    currentView.value = 'register';
  };

  const goToLogin = () => {
    currentView.value = 'login';
  };

  const handleRegisterSuccess = () => {
    // 注册成功后跳转回登录页
    currentView.value = 'login';
  };
</script>

<style scoped>
  .login-page {
    display: flex;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
      'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
      sans-serif;
  }

  /* ===== 左侧品牌区 ===== */
  .login-brand {
    position: relative;
    width: 520px;
    min-height: 100vh;
    background: linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* 装饰形状 */
  .brand-shapes {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .brand-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
    filter: blur(60px);
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    background: #818cf8;
    top: -100px;
    right: -80px;
    animation: float1 18s ease-in-out infinite;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    background: #10b981;
    bottom: -60px;
    left: -40px;
    animation: float2 22s ease-in-out infinite;
  }

  .shape-3 {
    width: 200px;
    height: 200px;
    background: #a78bfa;
    top: 50%;
    left: 60%;
    animation: float1 25s ease-in-out infinite reverse;
  }

  @keyframes float1 {
    0%,
    100% {
      transform: translate(0, 0);
    }
    33% {
      transform: translate(20px, -30px);
    }
    66% {
      transform: translate(-15px, 20px);
    }
  }

  @keyframes float2 {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(25px, -20px);
    }
  }

  /* 品牌内容 */
  .brand-content {
    position: relative;
    z-index: 1;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 48px;
  }

  .brand-name {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .brand-title {
    font-size: 36px;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    margin: 0 0 20px;
    letter-spacing: -0.02em;
  }

  .brand-title-highlight {
    background: linear-gradient(135deg, #818cf8, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.6;
    margin: 0 0 40px;
  }

  /* 特性列表 */
  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .brand-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .feature-check {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(16, 185, 129, 0.12);
    border-radius: 8px;
    flex-shrink: 0;
  }

  /* ===== 右侧表单区 ===== */
  .login-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: #f9fafb;
    position: relative;
  }

  .login-content-inner {
    width: 100%;
    max-width: 380px;
  }

  .login-footer {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 13px;
    color: #94a3b8;
  }

  /* ===== 响应式 ===== */
  @media (max-width: 1024px) {
    .login-brand {
      width: 400px;
      padding: 40px;
    }

    .brand-title {
      font-size: 30px;
    }
  }

  @media (max-width: 768px) {
    .login-page {
      flex-direction: column;
    }

    .login-brand {
      width: 100%;
      min-height: auto;
      padding: 40px 24px;
    }

    .brand-features {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px;
    }

    .login-content {
      padding: 40px 24px 80px;
    }
  }
</style>
