import { sleep } from '@/utils';

export class Poller {
    private poll_fn: () => Promise<void>;
    private delay_seconds: number;

    get continue() {
        return this.continue_;
    }
    private continue_: boolean = false;

    constructor(poll_fn: () => Promise<void>, delay_seconds: number) {
        this.poll_fn = poll_fn;
        this.delay_seconds = delay_seconds;
    }

    async start_after_delay() {
        if (this.continue_) {
            // istanbul ignore next
            throw new Error('This poller has already been started');
        }

        this.continue_ = true;
        await sleep(this.delay_seconds);
        while (this.continue_) {
            await this.poll_fn();
            await sleep(this.delay_seconds);
        }
    }

    stop() {
        this.continue_ = false;
    }
}
