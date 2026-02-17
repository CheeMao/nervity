/// <reference types="vite/client" />

declare module 'vite-plugin-eslint' {
  import { Plugin } from 'vite';
  import { ESLint } from 'eslint';

  interface Options {
    include?: string | string[];
    exclude?: string | string[];
    shouldLint?: (path: string) => boolean;
    formatter?: string | ESLint.Formatter['format'];
    cache?: boolean;
    cacheLocation?: string;
    throwOnWarning?: boolean;
    throwOnError?: boolean;
    extraFileExtensions?: string[];
    fix?: boolean;
  }

  export default function eslintPlugin(options?: Options): Plugin;
}

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
