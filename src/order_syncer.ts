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
  private saved_order: T[] | null = null;
  private pending_items: T[] | null = null;

  /**
   * @param update_fn   Called with the final order when the debounce expires.
   * @param on_rollback Called with the saved order if `update_fn` rejects, so
   *                    the consumer can restore the UI.
   * @param on_error    Called with the error after `on_rollback`. {@link flush}
   *                    itself never rejects — errors always go through `on_error`.
   * @param delay       Debounce window in milliseconds.
   */
  constructor(
    private readonly update_fn: (items: T[]) => Promise<unknown>,
    private readonly on_rollback: (saved_order: T[]) => void,
    private readonly on_error: (error: unknown) => void,
    private readonly delay = 500,
  ) {}

  /**
     * Queues an order update and (re)starts the debounce timer.
     *
     * @param items       The new order to sync to the server when the debounce
                          expires.
     * @param saved_order Order to roll back to on failure. Only takes effect on the
     *                    first call of a batch — once set, it stays locked until the
     *                    next flush completes. Must be a snapshot taken *before* the
     *                    mutation that produced `items`.
     */
  schedule(items: T[], saved_order: T[]): void {
    if (this.saved_order === null) {
      this.saved_order = saved_order;
    }
    this.pending_items = items.slice();
    if (this.debounce_timer !== null) {
      clearTimeout(this.debounce_timer);
    }
    this.debounce_timer = setTimeout(() => {
      void this.flush();
    }, this.delay);
  }

  /**
   * Cancels the debounce and runs the pending update immediately. No-op if
   * nothing is pending. Safe to call from `beforeDestroy()` to drain in-flight
   * work.
   */
  async flush(): Promise<void> {
    if (this.debounce_timer !== null) {
      clearTimeout(this.debounce_timer);
      this.debounce_timer = null;
    }
    if (this.pending_items === null) {
      return;
    }
    const items = this.pending_items;
    const rollback = this.saved_order!;
    this.pending_items = null;
    this.saved_order = null;
    if (items.every((item, i) => item === rollback[i])) {
      return;
    }
    try {
      await this.update_fn(items);
    } catch (e) {
      this.on_rollback(rollback);
      this.on_error(e);
    }
  }
}
