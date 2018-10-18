import Diff from '@/components/diff.vue';
import { config, mount } from '@vue/test-utils';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('Diff tests', () => {
    let diff: string[];

    beforeEach(() => {
        diff = [
            '  one\r\n',
            '  two\n',
            '- left one\n',
            '- left two\n',
            '- left three\n',
            '  three\n',
            '+ right one\n',
            '+ right two\n',
            '  four\n',
            '  five\n',
        ];
    });

    test.skip('Overflow y scrolling', () => {
        // FIXME: element.scrollHeight is 0 for some reason.

        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: diff,
                diff_height: '100px'
            }
        });

        let body_wrapper = wrapper.find('#diff-body-wrapper');
        expect(body_wrapper.element.style.height).toEqual("100px");
        expect(body_wrapper.element.scrollHeight).toBeGreaterThan(100);
    });

    test('Diff rendering no whitespace', () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: diff,
            }
        });

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(10);

        let expected_left = [
            {line_number: 1, prefix: '  ', content: 'one\r\n'},
            {line_number: 2, prefix: '  ', content: 'two\n'},
            {line_number: 3, prefix: '- ', content: 'left one\n'},
            {line_number: 4, prefix: '- ', content: 'left two\n'},
            {line_number: 5, prefix: '- ', content: 'left three\n'},
            {line_number: 6, prefix: '  ', content: 'three\n'},
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
            {line_number: 7, prefix: '  ', content: 'four\n'},
            {line_number: 8, prefix: '  ', content: 'five\n'},
        ];
        expect(wrapper.vm.d_left).toEqual(expected_left);

        let expected_right = [
            {line_number: 1, prefix: '  ', content: 'one\r\n'},
            {line_number: 2, prefix: '  ', content: 'two\n'},
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
            {line_number: 3, prefix: '  ', content: 'three\n'},
            {line_number: 4, prefix: '+ ', content: 'right one\n'},
            {line_number: 5, prefix: '+ ', content: 'right two\n'},
            {line_number: 6, prefix: '  ', content: 'four\n'},
            {line_number: 7, prefix: '  ', content: 'five\n'},
        ];
        expect(wrapper.vm.d_right).toEqual(expected_right);

        expect(wrapper.vm.$el).toMatchSnapshot();
    });

    test('Diff rendering with whitespace', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: [
                    '  line one\r\n'
                ],
            }
        });
        wrapper.setData({d_show_whitespace: true});
        await wrapper.vm.$nextTick();

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(1);
        let cells = rows.at(0).findAll('td');

        expect(cells.at(1).find('.content').text()).toEqual('line\u2219one\\r\r\u21b5');
        expect(cells.at(3).find('.content').text()).toEqual('line\u2219one\\r\r\u21b5');
    });

    test('Diff rendering with whitespace snapshot', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: diff,
            }
        });
        wrapper.setData({d_show_whitespace: true});
        await wrapper.vm.$nextTick();

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(10);

        expect(wrapper.vm.$el).toMatchSnapshot();
    });
});

describe('Diff test edge cases', () => {
    test('Empty diff input', () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: [],
            }
        });

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(0);
    });

    test('Right side only', () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: [
                    '+ one\n',
                    '+ two\n',
                    '+ three\n',
                ],
            }
        });

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(3);

        expect(wrapper.vm.d_left).toEqual([
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
        ]);

        let expected_right = [
            {line_number: 1, prefix: '+ ', content: 'one\n'},
            {line_number: 2, prefix: '+ ', content: 'two\n'},
            {line_number: 3, prefix: '+ ', content: 'three\n'},

        ];
        expect(wrapper.vm.d_right).toEqual(expected_right);
    });

    test('Left side only', () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: [
                    '- one\n',
                    '- two\n',
                    '- three\n',
                ]
            }
        });

        let rows = wrapper.findAll('#diff-body tr');
        expect(rows.length).toEqual(3);

        let expected_left = [
            {line_number: 1, prefix: '- ', content: 'one\n'},
            {line_number: 2, prefix: '- ', content: 'two\n'},
            {line_number: 3, prefix: '- ', content: 'three\n'},
        ];
        expect(wrapper.vm.d_left).toEqual(expected_left);

        expect(wrapper.vm.d_right).toEqual([
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
            {line_number: null, prefix: null, content: null},
        ]);
    });

    test('Error invalid prefix', () => {
        expect(() => {
            mount(Diff, {
                propsData: {
                    diff_contents: [
                        'spam\n',
                        '- two\n',
                        '- three\n',
                    ]
                }
            });
        }).toThrow('Invalid prefix: "sp". Prefixes must be one of: "- ", "+ ", "  "');
    });
});
