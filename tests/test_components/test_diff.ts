import { mount, Wrapper } from '@vue/test-utils';

import Diff from '@/components/diff.vue';


describe('Diff tests', () => {
    test('Diff rendering no whitespace', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([
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
                    '+ right three\n',
                ]),
            }
        });
        await wrapper.vm.$nextTick();

        let rows = wrapper.findAll('.diff-body tr');
        expect(rows.length).toEqual(11);

        let expected_left: RenderedDiffCell[] = [
            {line_number: 1, prefix: '', content: 'one'},
            {line_number: 2, prefix: '', content: 'two'},
            {line_number: 3, prefix: '-', content: 'left one'},
            {line_number: 4, prefix: '-', content: 'left two'},
            {line_number: 5, prefix: '-', content: 'left three'},
            {line_number: 6, prefix: '', content: 'three'},
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
            {line_number: 7, prefix: '', content: 'four'},
            {line_number: 8, prefix: '', content: 'five'},
            {line_number: '', prefix: '', content: ''},
        ];

        let expected_right: RenderedDiffCell[] = [
            {line_number: 1, prefix: '', content: 'one'},
            {line_number: 2, prefix: '', content: 'two'},
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
            {line_number: 3, prefix: '', content: 'three'},
            {line_number: 4, prefix: '+', content: 'right one'},
            {line_number: 5, prefix: '+', content: 'right two'},
            {line_number: 6, prefix: '', content: 'four'},
            {line_number: 7, prefix: '', content: 'five'},
            {line_number: 8, prefix: '+', content: 'right three'},
        ];

        do_diff_render_test(wrapper, expected_left, expected_right, false);
    });

    test('Diff rendering with whitespace', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([
                    '  line \tone\r\n',
                    '- line \tone\r\n'
                ]),
            }
        });
        wrapper.setData({d_show_whitespace: true});
        await wrapper.vm.$nextTick();

        let expected_left: RenderedDiffCell[] = [
            {line_number: 1, prefix: '', content: 'line\u2219\u21e5\tone\\r\r\u21b5'},
            {line_number: 2, prefix: '-', content: 'line\u2219\u21e5\tone\\r\r\u21b5'},
        ];

        let expected_right: RenderedDiffCell[] = [
            {line_number: 1, prefix: '', content: 'line\u2219\u21e5\tone\\r\r\u21b5'},
            {line_number: '', prefix: '', content: ''},
        ];

        do_diff_render_test(wrapper, expected_left, expected_right, true);
    });
});

describe('Diff test edge cases', () => {
    test('Empty diff input', () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([]),
            }
        });

        let rows = wrapper.findAll('.diff-body tr');
        expect(rows.length).toEqual(0);
    });

    test('Right side only', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([
                    '+ one\n',
                    '+ two\n',
                    '+ three\n',
                ]),
            }
        });
        await wrapper.vm.$nextTick();

        let expected_left: RenderedDiffCell[] = [
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
        ];

        let expected_right: RenderedDiffCell[] = [
            {line_number: 1, prefix: '+', content: 'one'},
            {line_number: 2, prefix: '+', content: 'two'},
            {line_number: 3, prefix: '+', content: 'three'},

        ];

        do_diff_render_test(wrapper, expected_left, expected_right, false);
    });

    test('Left side only', async () => {
        const wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([
                    '- one\n',
                    '- two\n',
                    '- three\n',
                ])
            }
        });
        await wrapper.vm.$nextTick();

        let expected_left: RenderedDiffCell[] = [
            {line_number: 1, prefix: '-', content: 'one'},
            {line_number: 2, prefix: '-', content: 'two'},
            {line_number: 3, prefix: '-', content: 'three'},
        ];

        let expected_right: RenderedDiffCell[] = [
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
            {line_number: '', prefix: '', content: ''},
        ];

        do_diff_render_test(wrapper, expected_left, expected_right, false);
    });

    test('Invalid prefix treated as +', async () => {
        let wrapper = mount(Diff, {
            propsData: {
                diff_contents: Promise.resolve([
                    'spam\n',
                    '- two\n',
                    '- three\n',
                ])
            }
        });
        await wrapper.vm.$nextTick();

        let expected_left: RenderedDiffCell[] = [
            {line_number: 1, prefix: '-', content: 'two'},
            {line_number: 2, prefix: '-', content: 'three'},
        ];

        let expected_right: RenderedDiffCell[] = [
            {line_number: 1, prefix: '+', content: 'spam'},
            {line_number: '', prefix: '', content: ''},
        ];

        do_diff_render_test(wrapper, expected_left, expected_right, false);
    });
});

test('1000 lines initially rendered, show more button used', async () => {
    let diff_contents = Promise.resolve(Array(2700).fill('  spam'));
    let wrapper = mount(Diff, {
        propsData: {
            diff_contents: diff_contents
        }
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.diff-body tr').length).toEqual(1000);

    wrapper.find('[data-testid=show_more_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.diff-body tr').length).toEqual(2000);

    wrapper.find('[data-testid=show_more_button]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.diff-body tr').length).toEqual((await diff_contents).length);

    expect(wrapper.find('[data-testid=show_more_button]').exists()).toBe(false);
});

type RenderedDiffCell = {line_number: number | '', prefix: '+' | '-' | '', content: string};

function do_diff_render_test(
    wrapper: Wrapper<Diff>,
    expected_left: RenderedDiffCell[],
    expected_right: RenderedDiffCell[],
    show_whitespace: boolean
) {
    let rows = wrapper.findAll('.diff-body tr');
    expect(rows.length).toEqual(expected_left.length);
    expect(rows.length).toEqual(expected_right.length);

    let visible_selector = show_whitespace ? '.content.with-whitespace' : '.content.no-whitespace';
    let hidden_selector = show_whitespace ? '.content.no-whitespace' : '.content.with-whitespace';

    for (let [i, row] of rows.wrappers.entries()) {
        let cells = row.findAll('td');

        expect(cells.at(0).text()).toEqual(expected_left[i].line_number.toString());

        expect(cells.at(1).find('.prefix').text()).toEqual(
            expected_left[i].prefix);
        expect(cells.at(1).find(visible_selector).text()).toEqual(
            expected_left[i].content);
        expect(cells.at(1).find(hidden_selector).element).not.toBeVisible();

        expect(cells.at(2).text()).toEqual(expected_right[i].line_number.toString());

        expect(cells.at(3).find('.prefix').text()).toEqual(
            expected_right[i].prefix);
        expect(cells.at(3).find(visible_selector).text()).toEqual(
            expected_right[i].content);
        expect(cells.at(3).find(hidden_selector).element).not.toBeVisible();
    }
}
