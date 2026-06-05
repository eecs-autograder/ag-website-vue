import { arrays_equal, SafePromise } from "./utils";

/**
 * Debounced syncer for "items are now in this order" updates. Coalesces rapid
 * reorders into a single API call, rolls back the UI on failure, and skips the
 * call when the final order matches the starting order.
 *
 * @example
 * ```ts
 * const syncer = new OrderSyncer(
 *     items => MyEntity.update_order(parent_pk, items.map(i => i.pk)),
 *     saved => { this.items.splice(0, this.items.length, ...saved); },
 *     err => GlobalErrorsSubject.get_instance().report_error(err),
 * );
 * // Each time the order changes:
 * const prev = this.items.slice();
 * this.items.splice(/* ... *\/);
 * syncer.schedule(this.items, prev);
 * ```
 */
export class OrderSyncer<T> {
  private debounce_timer: ReturnType<typeof setTimeout> | null = null;
  private order: {pending: T[], saved: T[]} | null = null;

  /**
   * @param save_fn     Called with the final order when the debounce expires.
   * @param on_rollback Called with the saved order if `update_fn` rejects, so
   *                    the consumer can restore the UI.
   * @param on_error    Called with the error after `on_rollback`. {@link flush}
   *                    itself never rejects — errors always go through `on_error`.
   * @param delay       Debounce window in milliseconds.
   */
  constructor(
    private readonly save_fn: (new_order: T[]) => Promise<unknown>,
    private readonly on_rollback: (saved_order: T[]) => void,
    private readonly on_error: (error: unknown) => void,
    private readonly delay = 500,
  ) {}

  /**
   * Queues an order update and (re)starts the debounce timer.
   *
   * @param new_order   The new order to sync to the server when the debounce
                        expires.
   * @param current_order Order to roll back to on failure. Only takes effect on the
   *                    first call of a batch — once set, it stays locked until the
   *                    next flush completes. Must be a snapshot taken *before* the
   *                    mutation that produced `items`.
   */
  schedule(new_order: T[], current_order: T[]): void {
    if (this.order === null) {
        this.order = {
            pending: new_order,
            saved: current_order,
        };
    }
    else {
        this.order.pending = new_order.slice();
    }

    if (this.debounce_timer !== null) {
      clearTimeout(this.debounce_timer);
    }
    this.debounce_timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  /**
   * Cancels the debounce and runs the pending update immediately. No-op if
   * nothing is pending.
   *
   * @returns An empty promise that can be awaited or safely ignored.
   */
  flush(): SafePromise<void> {
    return this._flush() as SafePromise<void>;
  }

  private async _flush(): Promise<void> {
    if (this.debounce_timer !== null) {
      clearTimeout(this.debounce_timer);
      this.debounce_timer = null;
    }

    if (this.order === null) {
        return;
    }

    if (arrays_equal(this.order.pending, this.order.saved)
    ) {
      this.order = null;
      return;
    }

    const pending_order = this.order.pending;
    const saved_order = this.order.saved;
    this.order = null;

    try {
      await this.save_fn(pending_order);
    } catch (e) {
      this.on_rollback(saved_order);
      this.on_error(e);
    }
  }
}
