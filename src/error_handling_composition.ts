import type { Ref } from 'vue'

import APIErrors from '@/components/api_errors.vue';

export function handle_api_errors_async(
    // tslint:disable-next-line:no-any
    api_calling_func: any,
    // tslint:disable-next-line:no-any
    error_handler_func: (response: unknown) => void
) {
    // tslint:disable-next-line:no-any
    return async function(...args: any[]) {
        try {
            return await api_calling_func(args)
        } catch (e) {
            error_handler_func(e)
        }
    }
}

export function make_error_handler_func(api_errors: Ref<APIErrors | undefined>) {
    // tslint:disable-next-line:no-any
    return function(response: unknown) {
        (<APIErrors> api_errors.value).show_errors_from_response(response);
    }
}