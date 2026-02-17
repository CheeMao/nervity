<template>
  <svg
    :viewBox="viewBox"
    :width="size"
    :height="size"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      v-if="bgVisible"
      width="32"
      height="32"
      rx="8"
      :fill="bgColor || 'rgba(255,255,255,0.15)'"
    />
    <path
      d="M8 12l8-4 8 4v8l-8 4-8-4V12z"
      :stroke="primaryColor || '#fff'"
      stroke-width="1.5"
      fill="none"
    />
    <path
      d="M8 12l8 4 8-4M16 16v8"
      :stroke="secondaryColor || '#818CF8'"
      stroke-width="1.5"
    />
  </svg>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  interface Props {
    size?: number | string;
    viewBox?: string;
    primaryColor?: string;
    secondaryColor?: string;
    bgColor?: string;
    bgVisible?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    size: 40,
    viewBox: '0 0 32 32',
    primaryColor: '',
    secondaryColor: '',
    bgColor: '',
    bgVisible: true,
  });
</script>
