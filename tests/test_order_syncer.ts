import { vi } from "vitest";

import { OrderSyncer } from "@/order_syncer";

describe("OrderSyncer debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("single schedule fires update after delay", async () => {
    vi.useFakeTimers();
    const update_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(update_fn, vi.fn(), vi.fn());

    syncer.schedule(["b", "a", "c"], ["a", "b", "c"]);
    expect(update_fn).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(update_fn).toHaveBeenCalledTimes(1);
    expect(update_fn).toHaveBeenCalledWith(["b", "a", "c"]);
  });

  test("multiple schedules before delay fires result in one update with the final order", async () => {
    vi.useFakeTimers();
    const update_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(update_fn, vi.fn(), vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(["b", "c", "a"], original);
    syncer.schedule(["c", "b", "a"], original);

    await vi.runAllTimersAsync();

    expect(update_fn).toHaveBeenCalledTimes(1);
    expect(update_fn).toHaveBeenCalledWith(["c", "b", "a"]);
  });

  test("on failure, rollback uses the order from before the first schedule, not the most recent", async () => {
    vi.useFakeTimers();
    const update_fn = vi.fn().mockRejectedValue(new Error("fail"));
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(update_fn, on_rollback, vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(["b", "c", "a"], original);

    await vi.runAllTimersAsync();

    expect(on_rollback).toHaveBeenCalledTimes(1);
    expect(on_rollback).toHaveBeenCalledWith(original);
  });

  test("on failure, on_error is called with the error after rollback", async () => {
    vi.useFakeTimers();
    const error = new Error("fail");
    const update_fn = vi.fn().mockRejectedValue(error);
    const calls: string[] = [];
    const on_rollback = vi.fn(() => {
      calls.push("rollback");
    });
    const on_error = vi.fn(() => {
      calls.push("error");
    });
    const syncer = new OrderSyncer(update_fn, on_rollback, on_error);

    syncer.schedule(["b", "a", "c"], ["a", "b", "c"]);
    await vi.runAllTimersAsync();

    expect(on_error).toHaveBeenCalledTimes(1);
    expect(on_error).toHaveBeenCalledWith(error);
    expect(calls).toEqual(["rollback", "error"]);
  });

  test("after a successful flush, the next schedule uses the new state as its rollback target", async () => {
    vi.useFakeTimers();
    const update_fn = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("fail"));
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(update_fn, on_rollback, vi.fn());

    syncer.schedule(["b", "a", "c"], ["a", "b", "c"]);
    await vi.runAllTimersAsync();

    const post_first_move = ["b", "a", "c"];
    syncer.schedule(["b", "c", "a"], post_first_move);
    await vi.runAllTimersAsync();

    expect(on_rollback).toHaveBeenCalledTimes(1);
    expect(on_rollback).toHaveBeenCalledWith(post_first_move);
  });

  test("flush() with nothing pending does not call update_fn", async () => {
    const update_fn = vi.fn();
    const syncer = new OrderSyncer(update_fn, vi.fn(), vi.fn());

    await syncer.flush();

    expect(update_fn).not.toHaveBeenCalled();
  });

  test("no update is made when the pending order matches the saved order", async () => {
    vi.useFakeTimers();
    const update_fn = vi.fn().mockResolvedValue(undefined);
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(update_fn, on_rollback, vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(original, original);

    await vi.runAllTimersAsync();

    expect(update_fn).not.toHaveBeenCalled();
    expect(on_rollback).not.toHaveBeenCalled();
  });

  test("flush() before the timer fires triggers an immediate update and cancels the timer", async () => {
    vi.useFakeTimers();
    const update_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(update_fn, vi.fn(), vi.fn());

    syncer.schedule(["b", "a"], ["a", "b"]);
    await syncer.flush();

    expect(update_fn).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    expect(update_fn).toHaveBeenCalledTimes(1);
  });
});
