/* Vue.js TypeScript declarations */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Ensure Vue.js functions are properly exported
declare module 'vue' {
  import type { Ref, ComputedRef, WatchStopHandle } from '@vue/reactivity'
  
  export function ref<T>(value: T): Ref<T>
  export function reactive<T extends object>(target: T): T
  export function computed<T>(getter: () => T): ComputedRef<T>
  export function onMounted(hook: () => void): void
  export function onUnmounted(hook: () => void): void
  export function provide<T>(key: string | symbol, value: T): void
  export function inject<T>(key: string | symbol, defaultValue?: T): T | undefined
  export function watch<T>(source: T, callback: (newVal: T, oldVal: T) => void): WatchStopHandle
  export function nextTick(callback?: () => void): Promise<void>
  export function defineEmits<T = {}>(): T
  export function defineProps<T = {}>(): T
  export function createApp(rootComponent: any): any
  
  // Re-export all Vue types and functions
  export * from '@vue/runtime-core'
  export * from '@vue/reactivity'
}

declare module '@vue/runtime-core' {
  export interface GlobalProperties {
    // Add global properties here if needed
  }
}
