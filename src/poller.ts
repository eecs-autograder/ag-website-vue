import { sleep } from '@/utils';

export class Poller {
  private poll_fn: () => Promise<void>;
  private delay_seconds: number;

  get continue() {
    return this._continue;
  }
  private _continue: boolean = false;

  constructor(poll_fn: () => Promise<void>,
              delay_seconds: number) {
    this.poll_fn = poll_fn;
    this.delay_seconds = delay_seconds;
  }

  async start_after_delay() {
    if (this._continue) {
      // istanbul ignore next
      throw new Error('This poller has already been started');
    }

    this._continue = true;
    await sleep(this.delay_seconds);
    while (this._continue) {
      await this.poll_fn();
      await sleep(this.delay_seconds);
    }
  }

  stop() {
    this._continue = false;
  }
}
