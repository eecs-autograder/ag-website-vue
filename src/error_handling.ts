import { Vue } from 'vue-property-decorator';

import APIErrors from '@/components/api_errors.vue';

// tslint:disable-next-line:no-any
type PropertyDescriptorType = TypedPropertyDescriptor<(...args: any[]) => any>;

export function handle_api_errors_async(
    // tslint:disable-next-line:no-any
    error_handler_func: (self: any, response: unknown) => void) {
    // tslint:disable-next-line:no-any
    function decorator(target: any, property_key: string | symbol,
                       property_descriptor: PropertyDescriptorType) {
        return {
            // tslint:disable-next-line:no-any
            value: async function(...args: any[]) {
                try {
                    return await property_descriptor.value!.apply(this, args);
                }
                catch (e) {
                    error_handler_func(this, e);
                }
            }
        };
    }
    return decorator;
}

export function make_error_handler_func(api_errors_ref: string = 'api_errors') {
    // tslint:disable-next-line:no-any
    return function(component: Vue, response: unknown) {
        (<APIErrors> component.$refs[api_errors_ref]).show_errors_from_response(response);
    };
}

export class GlobalErrorsSubject {
    static get_instance() {
        if (GlobalErrorsSubject.instance === null) {
            GlobalErrorsSubject.instance = new GlobalErrorsSubject();
        }
        return GlobalErrorsSubject.instance;
    }

    subscribe(observer: GlobalErrorsObserver) {
        this.subscribers.add(observer);
    }

    unsubscribe(observer: GlobalErrorsObserver) {
        this.subscribers.delete(observer);
    }

    report_error(error: unknown) {
        for (let subscriber of this.subscribers) {
            subscriber.handle_error(error);
        }
    }

    private static instance: GlobalErrorsSubject | null = null;

    private subscribers = new Set<GlobalErrorsObserver>();
}

export interface GlobalErrorsObserver {
    handle_error(error: unknown): void;
}

export function handle_global_errors_async(
    target: object, property_key: string | symbol, property_descriptor: PropertyDescriptorType
) {
    return {
            // tslint:disable-next-line:no-any
        value: async function(...args: any[]) {
            try {
                return await property_descriptor.value!.apply(this, args);
            }
            catch (e) {
                GlobalErrorsSubject.get_instance().report_error(e);
            }
        }
    };
}
