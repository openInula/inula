import { vueReactive } from '@cloudsop/horizon';
import { emit } from '@cloudsop/horizon-adapter';

export const ref = vueReactive.useReference;
export const useRef = vueReactive.useReference;
export const isRef = vueReactive.isRef;
export const unref = vueReactive.unref;
export const shallowRef = vueReactive.shallowRef;
export const toRef = vueReactive.toRef;
export const toRefs = vueReactive.toRefs;
export const reactive = vueReactive.useReactive;
export const useReactive = vueReactive.useReactive;
export const isReactive = vueReactive.isReactive;
export const isShallow = vueReactive.isShallow;
export const computed = vueReactive.useComputed;
export const useComputed = vueReactive.useComputed;
export const watchEffect = vueReactive.watchEffect;
export const watch = vueReactive.useWatch;
export const $watch = vueReactive.watch;
export const useWatch = vueReactive.useWatch;
export const toRaw = vueReactive.toRaw;

export const $nextTick = vueReactive.nextTick;
export const nextTick = vueReactive.nextTick;
export const $emit = emit;

export const useInstance = vueReactive.useInstance;
export const toInstance = vueReactive.toInstance;
export const markRaw = vueReactive.markRaw;

export * from '@cloudsop/horizon-adapter';
