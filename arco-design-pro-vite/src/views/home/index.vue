<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-inner">
        <div class="navbar-left">
          <div class="logo-group">
            <div class="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M2 17l10 5 10-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 12l10 5 10-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="logo-text">NetVerify</span>
          </div>
        </div>
        <div class="navbar-center">
          <a
            href="#features"
            class="nav-link"
            @click.prevent="scrollToSection('features')"
            >功能特性</a
          >
          <a
            href="#workflow"
            class="nav-link"
            @click.prevent="scrollToSection('workflow')"
            >工作流程</a
          >
          <a
            href="#security"
            class="nav-link"
            @click.prevent="scrollToSection('security')"
            >安全保障</a
          >
        </div>
        <div class="navbar-right">
          <button class="btn-login" @click="goToLogin">登录</button>
          <button class="btn-register" @click="goToRegister">免费注册</button>
        </div>
        <!-- 移动端菜单按钮 -->
        <button
          class="mobile-menu-btn"
          aria-label="切换菜单"
          @click="toggleMobileMenu"
        >
          <svg
            v-if="!mobileMenuOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <!-- 移动端下拉菜单 -->
      <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
        <a
          href="#features"
          class="mobile-nav-link"
          @click.prevent="
            scrollToSection('features');
            mobileMenuOpen = false;
          "
          >功能特性</a
        >
        <a
          href="#workflow"
          class="mobile-nav-link"
          @click.prevent="
            scrollToSection('workflow');
            mobileMenuOpen = false;
          "
          >工作流程</a
        >
        <a
          href="#security"
          class="mobile-nav-link"
          @click.prevent="
            scrollToSection('security');
            mobileMenuOpen = false;
          "
          >安全保障</a
        >
        <div class="mobile-nav-buttons">
          <button class="btn-login" @click="goToLogin">登录</button>
          <button class="btn-register" @click="goToRegister">免费注册</button>
        </div>
      </div>
    </nav>

    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="14"
              height="14"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>企业级软件授权解决方案</span>
          </div>
          <h1 class="hero-title">
            一站式<span class="gradient-text">软件授权</span><br />验证平台
          </h1>
          <p class="hero-subtitle">
            开箱即用的用户管理、卡密激活、设备绑定、云函数执行和代理商分销系统，
            为您的软件保驾护航。
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="goToRegister">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="18"
                height="18"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              立即开始
            </button>
            <button class="btn-secondary" @click="scrollToSection('features')">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="18"
                height="18"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              了解更多
            </button>
          </div>
          <div class="hero-stats-row">
            <div class="hero-stat">
              <strong>AES+RSA</strong>
              <span>混合加密</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <strong>RBAC</strong>
              <span>权限控制</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <strong>SDK</strong>
              <span>快速接入</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="code-window">
            <div class="code-titlebar">
              <div class="code-dot red"></div>
              <div class="code-dot yellow"></div>
              <div class="code-dot green"></div>
              <span class="code-filename">client.py</span>
            </div>
            <div class="code-body">
              <pre><code><span class="code-keyword">from</span> netverify <span class="code-keyword">import</span> NetVerifyClient

client = NetVerifyClient(
    app_id=<span class="code-string">"your_app_id"</span>,
    app_secret=<span class="code-string">"your_secret"</span>
)

<span class="code-comment"># 验证卡密激活</span>
result = client.redeem(
    code=<span class="code-string">"XXXX-XXXX-XXXX"</span>,
    hwid=device.get_hwid()
)

<span class="code-keyword">if</span> result.success:
    print(<span class="code-string">f"激活成功，到期：{result.expire_at}"</span>)</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section id="features" class="section features-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">核心功能</span>
          <h2 class="section-title">为软件开发者打造的全套验证系统</h2>
          <p class="section-desc">覆盖从用户管理到代理商分销的完整业务链路</p>
        </div>
        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
          >
            <div class="feature-icon" :style="{ background: feature.bg }">
              <div v-html="feature.icon"></div>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 工作流程 -->
    <section id="workflow" class="section workflow-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">接入流程</span>
          <h2 class="section-title">三步完成软件授权接入</h2>
          <p class="section-desc">简单的 API 调用，快速集成到您的软件中</p>
        </div>
        <div class="workflow-steps">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="workflow-step"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div v-if="index < steps.length - 1" class="step-connector">
              <svg
                viewBox="0 0 60 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M0 12h50M44 6l6 6-6 6" stroke-dasharray="4 4" />
              </svg>
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术优势 -->
    <section id="security" class="section stats-section">
      <div class="section-inner">
        <div class="section-header">
          <span class="section-badge">安全与性能</span>
          <h2 class="section-title">多重安全防护，极致性能体验</h2>
        </div>
        <div class="stats-grid">
          <div
            v-for="(stat, index) in techStats"
            :key="index"
            class="stat-card"
          >
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-detail">{{ stat.detail }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="section-inner">
        <div class="cta-content">
          <h2 class="cta-title">准备好保护您的软件了吗？</h2>
          <p class="cta-desc"
            >注册账号，几分钟内即可完成 SDK 接入与卡密系统部署</p
          >
          <div class="cta-actions">
            <button class="btn-cta" @click="goToRegister">
              免费注册开始使用
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="18"
                height="18"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button class="btn-cta-secondary" @click="goToLogin">
              已有账号？直接登录
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer-section">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="logo-group">
              <div class="logo-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    fill="currentColor"
                    opacity="0.8"
                  />
                  <path
                    d="M2 17l10 5 10-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 12l10 5 10-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span class="logo-text">NetVerify</span>
            </div>
            <p class="footer-tagline">企业级软件授权验证平台</p>
          </div>
          <div class="footer-links-group">
            <div class="footer-col">
              <h4>产品</h4>
              <a href="#features" @click.prevent="scrollToSection('features')"
                >功能特性</a
              >
              <a href="#workflow" @click.prevent="scrollToSection('workflow')"
                >接入流程</a
              >
              <a href="#security" @click.prevent="scrollToSection('security')"
                >安全保障</a
              >
            </div>
            <div class="footer-col">
              <h4>开发者</h4>
              <span class="footer-link-text">API 文档</span>
              <span class="footer-link-text">Python SDK</span>
              <span class="footer-link-text">接入指南</span>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© {{ currentYear }} NetVerify. All rights reserved.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const isScrolled = ref(false);
  const mobileMenuOpen = ref(false);
  const currentYear = computed(() => new Date().getFullYear());

  // 滚动检测
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  // 导航功能
  const goToLogin = () => {
    router.push({ name: 'login' });
  };

  const goToRegister = () => {
    router.push({ name: 'login', query: { view: 'register' } });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  };

  // 功能特性数据
  const features = [
    {
      title: '用户管理与认证',
      desc: '完整的用户注册、登录、JWT 认证体系，支持 RBAC 角色权限和 TOTP 二次验证。',
      bg: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.8" width="28" height="28"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    },
    {
      title: '卡密激活系统',
      desc: '支持批量生成时长卡，灵活配置卡密类型，一键核销完成用户激活或续期。',
      bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="1.8" width="28" height="28"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>',
    },
    {
      title: '设备绑定与心跳',
      desc: '基于 HWID 的设备绑定机制，可配置设备上限，实时心跳检测设备在线状态。',
      bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.8" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    },
    {
      title: '云函数执行',
      desc: 'VM2 沙箱隔离的服务端函数执行环境，支持自定义业务逻辑的安全运行。',
      bg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.8" width="28" height="28"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    },
    {
      title: '代理商分销',
      desc: '支持多级代理商体系，独立的代理面板，余额管理，灵活的卡密生成与分发。',
      bg: 'linear-gradient(135deg, #FCE7F3, #FBCFE8)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="1.8" width="28" height="28"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      title: '安全防护',
      desc: 'AES/RSA 混合通信加密、HMAC 签名验证、IP/HWID 黑名单和完整操作审计日志。',
      bg: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="1.8" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    },
  ];

  // 流程步骤
  const steps = [
    {
      title: '创建应用',
      desc: '在管理面板中创建您的软件应用，配置密钥和参数，定义卡密类型和时长。',
    },
    {
      title: '生成卡密',
      desc: '批量生成激活卡密，支持设置设备限制和有效期，可分配给代理商分销。',
    },
    {
      title: '客户端接入',
      desc: '使用 Python SDK 或直接调用 API，几行代码即可完成卡密核销和设备验证。',
    },
  ];

  // 技术统计
  const techStats = [
    {
      value: '全链路',
      label: '通信加密',
      detail: 'AES-256 + RSA 混合加密',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.8" width="32" height="32"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    },
    {
      value: '实时',
      label: '心跳监测',
      detail: '设备在线状态实时更新',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.8" width="32" height="32"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    },
    {
      value: '多端',
      label: 'SDK 支持',
      detail: 'Python SDK + RESTful API',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.8" width="32" height="32"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    },
    {
      value: 'RBAC',
      label: '权限管理',
      detail: '角色级细粒度权限控制',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.8" width="32" height="32"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    },
  ];
</script>

<style scoped>
  /* ===== 全局设定 ===== */
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  .home-page {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
      'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
      sans-serif;
    color: #1e1b4b;
    background: #f5f3ff;
    overflow-x: hidden;
  }

  /* ===== 导航栏 ===== */
  .navbar {
    position: fixed;
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 100;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.08);
    transition: all 0.3s ease;
  }

  .navbar.scrolled {
    top: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 4px 30px rgba(99, 102, 241, 0.12);
  }

  .navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    color: #6366f1;
  }

  .logo-icon svg {
    width: 100%;
    height: 100%;
  }

  .logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: -0.02em;
  }

  .navbar-center {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: pointer;
  }

  .nav-link:hover {
    color: #6366f1;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-login {
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #6366f1;
    background: transparent;
    border: 1px solid #6366f1;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn-login:hover {
    background: #6366f1;
    color: #fff;
  }

  .btn-register {
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: #6366f1;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .btn-register:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  /* 移动端菜单按钮 */
  .mobile-menu-btn {
    display: none;
    width: 40px;
    height: 40px;
    padding: 8px;
    background: none;
    border: none;
    color: #1e1b4b;
    cursor: pointer;
  }

  .mobile-menu-btn svg {
    width: 100%;
    height: 100%;
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    gap: 4px;
    padding: 0 28px 20px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, padding 0.3s ease;
  }

  .mobile-menu.open {
    max-height: 300px;
    padding-bottom: 20px;
  }

  .mobile-nav-link {
    display: block;
    padding: 12px 0;
    font-size: 15px;
    font-weight: 500;
    color: #475569;
    text-decoration: none;
    border-bottom: 1px solid #e2e8f0;
    cursor: pointer;
  }

  .mobile-nav-buttons {
    display: flex;
    gap: 12px;
    padding-top: 16px;
  }

  .mobile-nav-buttons .btn-login,
  .mobile-nav-buttons .btn-register {
    flex: 1;
    text-align: center;
  }

  /* ===== Hero 区域 ===== */
  .hero {
    position: relative;
    padding: 160px 24px 100px;
    overflow: hidden;
  }

  .hero-bg-shapes {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .shape-1 {
    width: 500px;
    height: 500px;
    background: #818cf8;
    top: -120px;
    right: -100px;
    animation: float1 20s ease-in-out infinite;
  }

  .shape-2 {
    width: 400px;
    height: 400px;
    background: #10b981;
    bottom: -80px;
    left: -60px;
    animation: float2 25s ease-in-out infinite;
  }

  .shape-3 {
    width: 300px;
    height: 300px;
    background: #7c3aed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: float3 18s ease-in-out infinite;
  }

  @keyframes float1 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-40px, 30px) scale(1.05);
    }
  }

  @keyframes float2 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(30px, -20px) scale(1.08);
    }
  }

  @keyframes float3 {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .hero-inner {
    display: flex;
    align-items: center;
    gap: 60px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .hero-content {
    flex: 1;
    min-width: 0;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    color: #6366f1;
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 52px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #1e1b4b;
    margin: 0 0 20px;
  }

  .gradient-text {
    background: linear-gradient(135deg, #6366f1, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 18px;
    line-height: 1.7;
    color: #475569;
    margin: 0 0 36px;
    max-width: 480px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.45);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 500;
    color: #1e1b4b;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #cbd5e1;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
  }

  .btn-secondary:hover {
    background: #fff;
    border-color: #6366f1;
    color: #6366f1;
  }

  .hero-stats-row {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
  }

  .hero-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hero-stat strong {
    font-size: 16px;
    font-weight: 700;
    color: #6366f1;
  }

  .hero-stat span {
    font-size: 13px;
    color: #64748b;
  }

  .hero-stat-divider {
    width: 1px;
    height: 32px;
    background: rgba(99, 102, 241, 0.15);
  }

  /* 代码展示窗口 */
  .hero-visual {
    flex: 0 0 460px;
  }

  .code-window {
    background: #0f172a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .code-titlebar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .code-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .code-dot.red {
    background: #ef4444;
  }
  .code-dot.yellow {
    background: #f59e0b;
  }
  .code-dot.green {
    background: #22c55e;
  }

  .code-filename {
    margin-left: 12px;
    font-size: 13px;
    color: #94a3b8;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  .code-body {
    padding: 24px;
    overflow-x: auto;
  }

  .code-body pre {
    margin: 0;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 14px;
    line-height: 1.8;
    color: #e2e8f0;
  }

  .code-body code {
    font-family: inherit;
  }

  .code-keyword {
    color: #c084fc;
  }
  .code-string {
    color: #34d399;
  }
  .code-comment {
    color: #64748b;
  }

  /* ===== 通用区块样式 ===== */
  .section {
    padding: 100px 24px;
  }

  .section-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-badge {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(99, 102, 241, 0.08);
    color: #6366f1;
    font-size: 13px;
    font-weight: 600;
    border-radius: 100px;
    margin-bottom: 16px;
    letter-spacing: 0.02em;
  }

  .section-title {
    font-size: 36px;
    font-weight: 700;
    color: #1e1b4b;
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }

  .section-desc {
    font-size: 17px;
    color: #64748b;
    margin: 0;
    line-height: 1.6;
  }

  /* ===== 功能卡片 ===== */
  .features-section {
    background: #fff;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .feature-card {
    padding: 32px;
    background: #fafbfc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    transition: all 0.25s ease;
    cursor: default;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.2);
  }

  .feature-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    margin-bottom: 20px;
  }

  .feature-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e1b4b;
    margin: 0 0 10px;
  }

  .feature-desc {
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
    margin: 0;
  }

  /* ===== 工作流程 ===== */
  .workflow-section {
    background: #f5f3ff;
  }

  .workflow-steps {
    display: flex;
    justify-content: center;
    gap: 0;
    position: relative;
  }

  .workflow-step {
    flex: 0 0 300px;
    text-align: center;
    padding: 40px 32px;
    position: relative;
  }

  .step-number {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  }

  .step-connector {
    position: absolute;
    top: 68px;
    right: -30px;
    width: 60px;
    color: #cbd5e1;
    z-index: 1;
  }

  .step-connector svg {
    width: 100%;
    height: auto;
  }

  .step-title {
    font-size: 20px;
    font-weight: 600;
    color: #1e1b4b;
    margin: 0 0 12px;
  }

  .step-desc {
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
    margin: 0;
  }

  /* ===== 技术统计 ===== */
  .stats-section {
    background: #fff;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .stat-card {
    text-align: center;
    padding: 36px 24px;
    background: #f5f3ff;
    border: 1px solid #ede9fe;
    border-radius: 16px;
    transition: all 0.25s ease;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.08);
  }

  .stat-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #6366f1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 16px;
    font-weight: 600;
    color: #1e1b4b;
    margin-bottom: 8px;
  }

  .stat-detail {
    font-size: 13px;
    color: #94a3b8;
  }

  /* ===== CTA 区域 ===== */
  .cta-section {
    background: linear-gradient(135deg, #1e1b4b, #6366f1);
    padding: 80px 24px;
  }

  .cta-content {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-title {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }

  .cta-desc {
    font-size: 17px;
    color: rgba(255, 255, 255, 0.75);
    margin: 0 0 36px;
    line-height: 1.6;
  }

  .cta-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 36px;
    font-size: 16px;
    font-weight: 600;
    color: #6366f1;
    background: #fff;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .btn-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }

  .btn-cta-secondary {
    padding: 14px 36px;
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    font-family: inherit;
  }

  .btn-cta-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }

  /* ===== Footer ===== */
  .footer-section {
    background: #1e1b4b;
    color: #94a3b8;
    padding: 60px 24px 30px;
  }

  .footer-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-top {
    display: flex;
    justify-content: space-between;
    gap: 60px;
    padding-bottom: 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .footer-brand .logo-icon {
    color: #818cf8;
  }

  .footer-brand .logo-text {
    color: #fff;
  }

  .footer-tagline {
    margin-top: 12px;
    font-size: 14px;
    color: #64748b;
  }

  .footer-links-group {
    display: flex;
    gap: 64px;
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .footer-col h4 {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
  }

  .footer-col a {
    font-size: 14px;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: pointer;
  }

  .footer-col a:hover {
    color: #818cf8;
  }

  .footer-link-text {
    font-size: 14px;
    color: #64748b;
  }

  .footer-bottom {
    padding-top: 24px;
    text-align: center;
    font-size: 13px;
    color: #475569;
  }

  /* ===== 响应式 ===== */
  @media (max-width: 1024px) {
    .hero-visual {
      flex: 0 0 380px;
    }

    .hero-title {
      font-size: 42px;
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .workflow-steps {
      flex-wrap: wrap;
      gap: 20px;
    }

    .workflow-step {
      flex: 0 0 auto;
      width: 100%;
    }

    .step-connector {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .navbar-center,
    .navbar-right {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .mobile-menu {
      display: flex;
    }

    .hero {
      padding: 120px 20px 60px;
    }

    .hero-inner {
      flex-direction: column;
      gap: 40px;
    }

    .hero-visual {
      flex: none;
      width: 100%;
      max-width: 460px;
    }

    .hero-title {
      font-size: 34px;
    }

    .hero-subtitle {
      font-size: 16px;
    }

    .hero-stats-row {
      gap: 16px;
    }

    .section-title {
      font-size: 28px;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .footer-top {
      flex-direction: column;
      gap: 32px;
    }

    .cta-title {
      font-size: 28px;
    }
  }

  @media (max-width: 480px) {
    .hero-title {
      font-size: 28px;
    }

    .hero-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      justify-content: center;
      width: 100%;
    }

    .hero-stats-row {
      flex-wrap: wrap;
      gap: 16px;
    }

    .hero-stat-divider {
      display: none;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .cta-actions {
      flex-direction: column;
    }
  }

  /* ===== prefers-reduced-motion ===== */
  @media (prefers-reduced-motion: reduce) {
    .shape {
      animation: none;
    }

    .feature-card:hover,
    .stat-card:hover,
    .btn-primary:hover,
    .btn-register:hover,
    .btn-cta:hover {
      transform: none;
    }
  }
</style>
