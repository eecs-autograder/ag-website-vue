import { Poller } from "@/poller";
import { sleep } from '@/utils';

test('Start and stop poller', async () => {
    let count = 0;
    let poller = new Poller(
        async () => {
            count += 1;
        },
        1
    );

    expect(poller.continue).toBe(false);
    // tslint:disable-next-line: no-floating-promises
    poller.start_after_delay();
    expect(poller.continue).toBe(true);
    expect(count).toEqual(0);

    await sleep(1.1);
    expect(count).toEqual(1);

    await sleep(1.1);
    expect(count).toEqual(2);

    poller.stop();
    await sleep(2);
    expect(count).toEqual(2);
    expect(poller.continue).toBe(false);
});

// This is rather difficult to test properly, so we'll just ignore
// coverage for the "throw" line in start_after_delay for now.
// test('Start already started poller', async () => {
//     let poller = new Poller(async () => {}, 1);
//     expect(poller.continue).toBe(false);
//     // tslint:disable-next-line: no-floating-promises
//     poller.start_after_delay();
//     await sleep(2);
//     expect(poller.continue).toBe(true);
//
//     return expect(() => {
//         return poller.start_after_delay();
//     }).toThrow('This poller has already been started');
// });
