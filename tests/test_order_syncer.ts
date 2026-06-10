import { vi } from "vitest";

import { OrderSyncer } from "@/order_syncer";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("OrderSyncer debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("single schedule fires update after delay", async () => {
    vi.useFakeTimers();
    const save_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(save_fn, vi.fn(), vi.fn());

    syncer.schedule(["b", "a", "c"], ["a", "b", "c"]);
    expect(save_fn).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledTimes(1);
    expect(save_fn).toHaveBeenCalledWith(["b", "a", "c"]);
  });

  test("multiple schedules before delay fires result in one update with the final order", async () => {
    vi.useFakeTimers();
    const save_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(save_fn, vi.fn(), vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(["b", "c", "a"], original);
    syncer.schedule(["c", "b", "a"], original);

    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledTimes(1);
    expect(save_fn).toHaveBeenCalledWith(["c", "b", "a"]);
  });

  test("on failure, rollback uses the order from before the first schedule, not the most recent", async () => {
    vi.useFakeTimers();
    const save_fn = vi.fn().mockRejectedValue(new Error("fail"));
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(["b", "c", "a"], ["b", "c", "a"]);

    await vi.runAllTimersAsync();

    expect(on_rollback).toHaveBeenCalledTimes(1);
    expect(on_rollback).toHaveBeenCalledWith(original);
  });

  test("on failure, on_error is called with the error after rollback", async () => {
    vi.useFakeTimers();
    const error = new Error("fail");
    const save_fn = vi.fn().mockRejectedValue(error);
    const calls: string[] = [];
    const on_rollback = vi.fn(() => {
      calls.push("rollback");
    });
    const on_error = vi.fn(() => {
      calls.push("error");
    });
    const syncer = new OrderSyncer(save_fn, on_rollback, on_error);

    syncer.schedule(["b", "a", "c"], ["a", "b", "c"]);
    await vi.runAllTimersAsync();

    expect(on_error).toHaveBeenCalledTimes(1);
    expect(on_error).toHaveBeenCalledWith(error);
    expect(calls).toEqual(["rollback", "error"]);
  });

  test("flush() with nothing pending does not call save_fn", async () => {
    const save_fn = vi.fn();
    const syncer = new OrderSyncer(save_fn, vi.fn(), vi.fn());

    await syncer.flush();

    expect(save_fn).not.toHaveBeenCalled();
  });

  test("no update is made when the pending order matches the saved order", async () => {
    vi.useFakeTimers();
    const save_fn = vi.fn().mockResolvedValue(undefined);
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    const original = ["a", "b", "c"];
    syncer.schedule(["b", "a", "c"], original);
    syncer.schedule(original, original);

    await vi.runAllTimersAsync();

    expect(save_fn).not.toHaveBeenCalled();
    expect(on_rollback).not.toHaveBeenCalled();
  });

  test("flush() before the timer fires triggers an immediate update and cancels the timer", async () => {
    vi.useFakeTimers();
    const save_fn = vi.fn().mockResolvedValue(undefined);
    const syncer = new OrderSyncer(save_fn, vi.fn(), vi.fn());

    syncer.schedule(["b", "a"], ["a", "b"]);
    await syncer.flush();

    expect(save_fn).toHaveBeenCalledTimes(1);

    await vi.runAllTimersAsync();
    expect(save_fn).toHaveBeenCalledTimes(1);
  });
});

describe("OrderSyncer flush, save, rollback combinations; state always reset after flush", () => {
  test("first flush saves new order, second flush saves new order", async () => {
    const first_flush_new_order = ["b", "a", "c"];
    const first_flush_current_order = ["a", "b", "c"];
    const second_flush_new_order = ["b", "c", "a"];
    const second_flush_current_order = ["c", "a", "b"];

    const save_fn = vi.fn().mockResolvedValue(undefined);
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    syncer.schedule(first_flush_new_order, first_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledWith(first_flush_new_order);

    syncer.schedule(second_flush_new_order, second_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledWith(second_flush_new_order);
  });

  test("first flush saves new order, second flush rolls back", async () => {
    const first_flush_new_order = ["b", "a", "c"];
    const first_flush_current_order = ["a", "b", "c"];
    const second_flush_new_order = ["b", "c", "a"];
    const second_flush_current_order = ["c", "a", "b"];

    const save_fn = vi.fn().mockResolvedValueOnce(undefined);
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    syncer.schedule(first_flush_new_order, first_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledWith(first_flush_new_order);

    save_fn.mockRejectedValueOnce(new Error("fail"));
    syncer.schedule(second_flush_new_order, second_flush_current_order);
    await vi.runAllTimersAsync();

    expect(on_rollback).toHaveBeenCalledTimes(1);
    expect(on_rollback).toHaveBeenCalledWith(second_flush_current_order);
  });

  test("first flush saves same order (no-op), second flush saves new order", async () => {
    const first_flush_new_order = ["b", "a", "c"];
    const first_flush_current_order = first_flush_new_order;
    const second_flush_new_order = ["b", "c", "a"];
    const second_flush_current_order = ["c", "a", "b"];

    const save_fn = vi.fn().mockResolvedValue(undefined);
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    syncer.schedule(first_flush_new_order, first_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).not.toHaveBeenCalledWith(first_flush_new_order);

    syncer.schedule(second_flush_new_order, second_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).toHaveBeenCalledWith(second_flush_new_order);
  });

  test("first flush saves same order (no-op), second flush rolls back", async () => {
    const first_flush_new_order = ["b", "a", "c"];
    const first_flush_current_order = first_flush_new_order;
    const second_flush_new_order = ["b", "c", "a"];
    const second_flush_current_order = ["c", "a", "b"];

    const save_fn = vi.fn();
    const on_rollback = vi.fn();
    const syncer = new OrderSyncer(save_fn, on_rollback, vi.fn());

    syncer.schedule(first_flush_new_order, first_flush_current_order);
    await vi.runAllTimersAsync();

    expect(save_fn).not.toHaveBeenCalledWith(first_flush_new_order);

    save_fn.mockRejectedValueOnce(new Error("fail"));
    syncer.schedule(second_flush_new_order, second_flush_current_order);
    await vi.runAllTimersAsync();

    expect(on_rollback).toHaveBeenCalledTimes(1);
    expect(on_rollback).toHaveBeenCalledWith(second_flush_current_order);
  });
});
