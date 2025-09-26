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

export function Teleport({ to, children }) {
  const container = window.horizon.useState(() => {
    document.createElement('div');
  });

  window.horizon.useEffect(() => {
    to.appendChild(container);

    return () => {
      to.removeChild(container);
    };
  }, [to, container]);

  return window.horizon.createPortal(children, container);
}

export function useWindowSize(options = {}) {
  const {
    initialWidth = Number.POSITIVE_INFINITY,
    initialHeight = Number.POSITIVE_INFINITY,
    listenOrientation = true,
    includeScrollbar = true,
  } = options;

  const width = ref(initialWidth);
  const height = ref(initialHeight);

  function update() {
    if (window) {
      if (includeScrollbar) {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
      } else {
        width.value = window.document.documentElement.clientWidth;
        height.value = window.document.documentElement.clientHeight;
      }
    }
  }

  update();

  window.horizon.useEffect(() => {
    window.addEventListener('resize', update);
    if (listenOrientation) window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      if (listenOrientation) window.removeEventListener('orientationchange', update);
    };
  });

  return { width: width.value, height: height.value };
}

export function createVNode(component, props) {
  return window.horizon.createElement(component, props, props.children);
}

export function render(vnode, target) {
  window.horizon.render(vnode, target);
}

export * from '@cloudsop/horizon-adapter';
