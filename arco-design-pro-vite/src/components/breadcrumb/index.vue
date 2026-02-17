<template>
  <a-breadcrumb class="container-breadcrumb">
    <a-breadcrumb-item>
      <component :is="icon" />
    </a-breadcrumb-item>
    <a-breadcrumb-item v-for="item in items" :key="item">
      {{ $t(item) }}
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';

  defineProps({
    items: {
      type: Array as PropType<string[]>,
      default() {
        return [];
      },
    },
    icon: {
      type: String,
      default: 'icon-apps',
    },
  });
</script>

<style scoped lang="less">
  .container-breadcrumb {
    margin: 16px 0;
    :deep(.arco-breadcrumb-item) {
      color: rgb(var(--gray-6));
      &:last-child {
        color: rgb(var(--gray-8));
      }
    }
  }
</style>
