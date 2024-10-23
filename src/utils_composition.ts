import type { Ref } from "vue";
import { getCurrentInstance } from "vue";
import VueRouter from "vue-router";

// Given a Ref object, negates the Ref value, calls the given function (and awaiting its returned
// promise), and negates the value again, returning it to its original value.
// IMPORTANT: make sure to either return or await the return value of  this function.
// Usage examples:
//
// return toggle(d_saving, () => {
//   })
export async function toggle<ReturnType>(ref: Ref<boolean>, body: () => Promise<ReturnType>) {
  if (typeof ref.value !== 'boolean') {
    throw new TypeError(`Expected a ref of boolean type, but got "${typeof ref.value}"`)
  }
  let original = ref.value
  try {
    ref.value = !original
    return await body();
  }
  finally {
    ref.value = original
  }
}

export function useRouter(): VueRouter {
  const inst = getCurrentInstance();
  if (inst) {
    return inst.proxy.$root.$router as VueRouter;
  }
  return undefined as any;
}
