import { DirectiveBinding } from 'vue';
import { useUserStore } from '@/store';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value, arg } = binding;
  const userStore = useUserStore();
  const { role, permissions } = userStore;

  if (!Array.isArray(value)) {
    throw new Error(
      `need roles or permissions! Like v-permission="['admin','user']" or v-permission:perm="['user:create']"`
    );
  }

  if (value.length === 0) {
    return;
  }

  // Check permissions mode: v-permission:perm="['user:create']"
  if (arg === 'perm') {
    const userPermissions = permissions || [];
    // All permissions required (every)
    const hasPermission = value.every((p) => userPermissions.includes(p));
    if (!hasPermission && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    return;
  }

  // Default: check roles mode: v-permission="['admin','user']"
  const hasPermission = value.includes(role);
  if (!hasPermission && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
