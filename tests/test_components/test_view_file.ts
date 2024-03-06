import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import hljs, { AutoHighlightResult } from 'highlight.js';
import * as sinon from 'sinon';

import ViewFile from '@/components/view_file.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import { compress_whitespace, wait_for_load, wait_until } from '@/tests/utils';


describe('ViewFile.vue', () => {
    let wrapper: Wrapper<ViewFile>;
    const filename = 'ke$ha_file.cpp';
    const content = Promise.resolve('line one\nline two');
    const height_in = "250px";

    beforeEach(async () => {
        wrapper = mount(ViewFile, {
            propsData: {
                filename: filename,
                file_contents: content,
                view_file_height: height_in
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('ViewFile data set to values passed in by parent', async () => {
        let view_file_wrapper = wrapper.find('.view-file-component');
        expect(view_file_wrapper.element.style.height).toEqual('250px');
        expect(wrapper.vm.d_filename).toBe(filename);
        expect(wrapper.vm.d_file_contents).toBe(await content);
    });

    test('File content and line numbers displayed in order', async () => {
        const line_numbers = wrapper.findAll('.line-number');
        expect(line_numbers.length).toEqual(2);
        expect(line_numbers.at(0).text()).toContain('1');
        expect(line_numbers.at(1).text()).toContain('2');

        const content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');
    });

    test('The contents of a ViewFile component can change', async () => {
        let content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('line one');
        expect(content_lines.at(1).text()).toContain('line two');

        await wrapper.setProps({file_contents: Promise.resolve("Blue \nMoon")});
        expect(await wait_for_load(wrapper)).toBe(true);

        content_lines = wrapper.findAll('.line-of-file-content');
        expect(content_lines.length).toEqual(2);
        expect(content_lines.at(0).text()).toContain('Blue');
        expect(content_lines.at(1).text()).toContain('Moon');
    });

    test('The filename of a ViewFile Component can change', async () => {
        let new_filename = "macklemore.cpp";
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_filename).toEqual(filename);

        wrapper.setProps({filename: new_filename});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_filename).toEqual(new_filename);
    });

    test('File too large, user prompted before displaying', async () => {
        await wrapper.setProps({display_size_threshold: 2});
        expect(wrapper.findAll('.line-of-file-content').length).toEqual(0);
        expect(wrapper.find('.large-file-message').exists()).toBe(true);

        await wrapper.find('.large-file-message .orange-button').trigger('click');
        expect(wrapper.findAll('.line-of-file-content').length).toEqual(2);
        expect(wrapper.find('.large-file-message').exists()).toBe(false);

        // display anyway flag should be reset when content changes.
        await wrapper.setProps({file_contents: Promise.resolve('Some content')});
        expect(await wait_for_load(wrapper)).toBe(true);
        expect(wrapper.findAll('.line-of-file-content').length).toEqual(0);
        expect(wrapper.find('.large-file-message').exists()).toBe(true);
    });

    test('1000 lines initially rendered, show more button used', async () => {
        await wrapper.setProps(
            {file_contents: Promise.resolve(Array(2700).fill('spam').join('\n'))});
        expect(await wait_for_load(wrapper)).toBe(true);

        expect(wrapper.findAll('.line-of-file-content').length).toEqual(1000);

        await wrapper.findComponent({ref: 'show_more_button'}).trigger('click');
        expect(wrapper.findAll('.line-of-file-content').length).toEqual(2000);

        await wrapper.findComponent({ref: 'show_more_button'}).trigger('click');
        expect(wrapper.findAll('.line-of-file-content').length).toEqual(2700);

        expect(wrapper.findComponent({ref: 'show_more_button'}).exists()).toBe(false);
    });

    test('Progress bar', async () => {
        wrapper.vm.d_loading = true;
        wrapper.setProps({progress: 42});

        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({name: 'ProgressBar'}).exists()).toBe(true);
        expect(wrapper.find('viewing-container').exists()).toBe(false);
    });

    test('File copies to clipboard', async () => {
        // Set mocks
        const write_text_mock = sinon.stub();
        Object.assign(navigator, {
            clipboard: {
                writeText: write_text_mock,
            },
        });

        const clock = sinon.useFakeTimers();

        // Init
        const file_text = 'Just keep <span class="dori">swimming,\nswimming,\nswimming!</span>';
        await wrapper.setProps({file_contents: Promise.resolve(file_text)});
        expect(await wait_for_load(wrapper)).toBe(true);

        // Test
        expect(wrapper.find('.copy-button-clickable').exists()).toBe(true);
        wrapper.find('.copy-button-clickable').trigger('click');
        await wrapper.vm.$nextTick();

        expect(write_text_mock.calledOnce).toBe(true);
        expect(write_text_mock.getCall(0).args[0]).toBe(file_text);

        expect(wrapper.vm.d_is_file_copying).toBe(true);
        clock.tick(3000);
        expect(wrapper.vm.d_is_file_copying).toBe(false);
    });

    test('Code file copies unhighlighted code to clipboard', async () => {
        // Set mocks
        const write_text_mock = sinon.stub();
        Object.assign(navigator, {
            clipboard: {
                writeText: write_text_mock,
            },
        });

        const clock = sinon.useFakeTimers();

        // Init
        const file_text = 'Just keep <span class="dori">swimming,\nswimming,\nswimming!</span>';
        await wrapper.setProps({
            is_code_file: true,
            file_contents: Promise.resolve(file_text)
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        // Test
        expect(wrapper.find('.copy-button-clickable').exists()).toBe(true);
        wrapper.find('.copy-button-clickable').trigger('click');
        await wrapper.vm.$nextTick();

        expect(write_text_mock.calledOnce).toBe(true);
        expect(write_text_mock.getCall(0).args[0]).toBe(file_text);

        expect(wrapper.vm.d_is_file_copying).toBe(true);
        clock.tick(3000);
        expect(wrapper.vm.d_is_file_copying).toBe(false);
    });

    describe('Code file tests', () => {
        test('Code file has appropriate styling when displayed', async () => {
            await wrapper.setProps({is_code_file: true});

            expect(wrapper.find('.viewing-container').exists()).toBe(true);
            expect(wrapper.find('.viewing-container').classes()).toContain('hljs');

            const line_numbers = wrapper.findAll('.line-number');
            for (const line_number of line_numbers.wrappers) {
                expect(line_number.classes()).toContain('line-number-code');
            }
        });

        test('Code content processed correctly with no mid-span newline', async () => {
            const hljs_stub = sinon.stub(hljs, 'highlightAuto');
            hljs_stub.returns({
                relevance: 1,
                value: 'Hello <span class="hljs-keyword">world</span>',
                illegal: false,
            });

            await wrapper.setProps({
                is_code_file: true,
                file_contents: Promise.resolve("Hello world")
            });
            expect(await wait_for_load(wrapper)).toBe(true);

            const content_lines = wrapper.findAll('.line-of-file-content');
            expect(content_lines.length).toEqual(1);
            expect(content_lines.at(0).html()).toContain(
                'Hello <span class="hljs-keyword">world</span>'
            );
        });

        test('Code content processed correctly with exactly one mid-span newline', async () => {
            const hljs_stub = sinon.stub(hljs, 'highlightAuto');
            hljs_stub.returns({
                relevance: 1,
                value: 'omg <span class="hljs-keyword">HELLO\nworld</span>',
                illegal: false,
            });

            await wrapper.setProps({
                is_code_file: true,
                file_contents: Promise.resolve("omg HELLO\nworld")
            });
            expect(await wait_for_load(wrapper)).toBe(true);

            const content_lines = wrapper.findAll('.line-of-file-content');
            expect(content_lines.length).toEqual(2);
            expect(content_lines.at(0).html()).toContain(
                'omg <span class="hljs-keyword">HELLO</span>'
            );
            expect(content_lines.at(1).html()).toContain(
                '<span class="hljs-keyword">world</span>'
            );
        });

        test('Code content processed correctly with multiple mid-span newlines', async () => {
            const hljs_stub = sinon.stub(hljs, 'highlightAuto');
            hljs_stub.returns({
                relevance: 1,
                value: 'You were the <span class="hljs-string">chosen one.\n' +
                'It was said you would destroy the Sith,\n' +
                'not join them.</span> Bring balance to the force...',
                illegal: false,
            });

            await wrapper.setProps({ is_code_file: true });
            await wrapper.setProps({
                file_contents: Promise.resolve(
                    'You were the chosen one.\n' +
                    'It was said you would destroy the Sith,\n' +
                    'not join them. Bring balance to the force...',
                )
            });
            expect(await wait_for_load(wrapper)).toBe(true);

            const content_lines = wrapper.findAll('.line-of-file-content');
            expect(content_lines.length).toEqual(3);
            expect(content_lines.at(0).html()).toContain(
                'You were the <span class="hljs-string">chosen one.</span>'
            );
            expect(content_lines.at(1).html()).toContain(
                '<span class="hljs-string">It was said you would destroy the Sith,</span>'
            );
            expect(content_lines.at(2).html()).toContain(
                '<span class="hljs-string">not join them.</span> Bring balance to the force...'
            );
        });
    });
});

describe('ViewFile handgrading tests', () => {
    let wrapper: Wrapper<ViewFile>;

    let content = Promise.resolve(Array(20).fill('line').join('\n'));
    let filename = 'an_file.txt';

    let rubric: ag_cli.HandgradingRubric;
    let annotation_no_long_description: ag_cli.Annotation;
    let annotation_with_long_description: ag_cli.Annotation;
    let result: ag_cli.HandgradingResult;
    let comment: ag_cli.Comment;
    let applied_annotation_no_long_description: ag_cli.AppliedAnnotation;
    let applied_annotation_with_long_description: ag_cli.AppliedAnnotation;

    beforeEach(async () => {
        let project = data_ut.make_project(data_ut.make_course().pk);
        rubric = data_ut.make_handgrading_rubric(project.pk);
        annotation_no_long_description = data_ut.make_annotation(rubric.pk, {
            short_description: 'I short description',
            long_description: '',
            deduction: -1,
            max_deduction: -2,
        });
        annotation_with_long_description = data_ut.make_annotation(rubric.pk, {
            short_description: 'I haz descriptions',
            long_description: 'Such descriptive longness',
            deduction: -4,
        });
        rubric.annotations = [annotation_no_long_description, annotation_with_long_description];

        let group = data_ut.make_group(project.pk);
        result = data_ut.make_handgrading_result(
            rubric, group.pk, data_ut.make_submission(group).pk);

        // The comment with no location should get filtered out
        data_ut.make_comment(result, null, 'No');
        comment = data_ut.make_comment(
            result, {filename: filename, first_line: 3, last_line: 5}, 'I am such very comment');
        applied_annotation_no_long_description = data_ut.make_applied_annotation(
            result, annotation_no_long_description,
            {filename: filename, first_line: 5, last_line: 5}
        );
        applied_annotation_with_long_description = data_ut.make_applied_annotation(
            result, annotation_with_long_description,
            {filename: filename, first_line: 10, last_line: 13}
        );

        wrapper = managed_mount(ViewFile, {
            propsData: {
                filename: filename,
                file_contents: content,
                handgrading_result: result,
                readonly_handgrading_results: false,
                enable_custom_comments: true,
            }
        });
        await wrapper.vm.$nextTick();
    });

    test('Commented lines highlighted', () => {
        let highlighted_line_indices = [
            3, 4, 5,
            10, 11, 12, 13
        ];
        expect(wrapper.findAll('.commented-line').length).toEqual(highlighted_line_indices.length);

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        for (let index of highlighted_line_indices) {
            expect(code_lines.at(index).classes()).toEqual(['commented-line']);
        }
    });

    test('Comments and applied annotations displayed at last highlighted line', () => {
        let rows = wrapper.findAll('tr');
        let comment_wrapper = rows.at(6);
        expect(comment_wrapper.find('.comment-line-range').text()).toEqual('Lines 4 - 6');
        expect(comment_wrapper.find('.comment-message').text()).toEqual(comment.text);

        let no_long_description_wrapper = rows.at(7);
        expect(no_long_description_wrapper.find('.comment-line-range').text()).toEqual('Line 6');
        expect(
            compress_whitespace(no_long_description_wrapper.find('.comment-message').text())
        ).toEqual(
            annotation_no_long_description.short_description
            + ` (${annotation_no_long_description.deduction}`
            + `/${annotation_no_long_description.max_deduction} max)`
        );

        let with_long_description_wrapper = rows.at(16);
        expect(with_long_description_wrapper.find('.comment-line-range').text()).toEqual(
            'Lines 11 - 14'
        );
        expect(
            compress_whitespace(with_long_description_wrapper.find('.comment-message').text())
        ).toEqual(
            annotation_with_long_description.short_description
            + ` (${annotation_with_long_description.deduction})`
        );
    });

    test('Hovered comment highlighted differently', async () => {
        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        let single_line_comment = wrapper.findAll('.comment').at(1);
        await single_line_comment.trigger('mouseenter');
        expect(code_lines.at(5).classes()).toContain('hovered-comment-line');
        await single_line_comment.trigger('mouseleave');
        expect(code_lines.at(5).classes()).not.toContain('hovered-comment-line');
    });

    describe('Add applied annotation tests', () => {
        let create_stub: sinon.SinonStub;

        function make_create_result(first_line: number, last_line: number) {
            return data_ut.make_applied_annotation(
                result,
                annotation_no_long_description,
                {
                    filename: filename,
                    first_line: first_line,
                    last_line: last_line,
                },
                false
            );
        }

        beforeEach(() => {
            create_stub = sinon.stub(
                ag_cli.AppliedAnnotation, 'create').rejects(new Error('Stub me'));
        });

        test('Add new single-line applied annotation', async () => {
            expect(wrapper.findAll('.comment').length).toEqual(3);
            let new_applied_annotation = make_create_result(0, 0);
            create_stub.resolves(new_applied_annotation);

            let code_lines = wrapper.findAllComponents({ref: 'code_line'});
            code_lines.at(0).trigger('mousedown');
            code_lines.at(0).trigger('mouseup');

            await wrapper.vm.$nextTick();

            wrapper.findAllComponents({name: 'ContextMenuItem'}).at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

            expect(create_stub.calledOnce).toBe(true);
            expect(create_stub.calledOnceWith(
                result.pk,
                {
                    annotation: annotation_no_long_description.pk,
                    location: {
                        first_line: 0,
                        last_line: 0,
                        filename: filename,
                    }
                }
            )).toBe(true);

            // Modifying the object we passed in should work because
            // view file should not by copying or modifying the object.
            result.applied_annotations.push(new_applied_annotation);
            await wrapper.vm.$nextTick();
            expect(wrapper.findAll('.comment').length).toEqual(4);
            expect(wrapper.findAll('.comment').at(0).find('.comment-message').text()).toContain(
                annotation_no_long_description.short_description
            );

            expect(
                wrapper.findComponent({ref: 'handgrading_context_menu'}).element
            ).not.toBeVisible();
            expect(wrapper.vm.d_first_highlighted_line).toBeNull();
            expect(wrapper.vm.d_last_highlighted_line).toBeNull();
        });

        test('Add new multi-line-annotation', async () => {
            expect(wrapper.findAll('.comment').length).toEqual(3);

            let new_applied_annotation = make_create_result(0, 2);
            create_stub.resolves(new_applied_annotation);

            let code_lines = wrapper.findAllComponents({ref: 'code_line'});
            // Highlighed region expands up and down
            code_lines.at(1).trigger('mousedown');
            code_lines.at(0).trigger('mouseenter');
            code_lines.at(1).trigger('mouseenter');
            code_lines.at(2).trigger('mouseenter');
            code_lines.at(2).trigger('mouseup');

            await wrapper.vm.$nextTick();

            wrapper.findAllComponents({name: 'ContextMenuItem'}).at(0).trigger('click');
            expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);

            expect(create_stub.calledOnce).toBe(true);
            expect(create_stub.calledOnceWith(
                result.pk,
                {
                    annotation: annotation_no_long_description.pk,
                    location: {
                        first_line: 0,
                        last_line: 2,
                        filename: filename,
                    }
                }
            )).toBe(true);

            wrapper.vm.handgrading_result!.applied_annotations.push(new_applied_annotation);
            await wrapper.vm.$nextTick();
            expect(wrapper.findAll('.comment').length).toEqual(4);
            expect(wrapper.findAll('.comment').at(0).find('.comment-message').text()).toContain(
                annotation_no_long_description.short_description
            );

            expect(
                wrapper.findComponent({ref: 'handgrading_context_menu'}).element
            ).not.toBeVisible();
            expect(wrapper.vm.d_first_highlighted_line).toBeNull();
            expect(wrapper.vm.d_last_highlighted_line).toBeNull();
        });
    });

    test('Custom comments enabled', async () => {
        expect(wrapper.vm.enable_custom_comments).toBe(true);
        expect(wrapper.findAll('.comment').length).toEqual(3);
        expect(wrapper.findAll('.delete').length).toEqual(3);

        let text = 'I am such a very comment indeed';
        let new_comment = data_ut.make_comment(
            result,
            {
                filename: filename,
                first_line: 2,
                last_line: 2,
            },
            text,
            false
        );
        let create_stub = sinon.stub(ag_cli.Comment, 'create').resolves(new_comment);

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        code_lines.at(0).trigger('mousedown');
        code_lines.at(0).trigger('mouseup');
        await wrapper.vm.$nextTick();

        wrapper.findAllComponents({name: 'ContextMenuItem'}).at(2).trigger('click');
        await wrapper.vm.$nextTick();

        wrapper.findComponent({ref: 'comment_text'}).setValue(text);
        wrapper.find('.modal .green-button').trigger('click');

        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);
        expect(wrapper.find('.modal').exists()).toBe(false);

        expect(create_stub.calledOnce).toBe(true);
        expect(create_stub.calledOnceWith(
            result.pk,
            {
                text: text,
                location: {
                    first_line: 0,
                    last_line: 0,
                    filename: filename,
                }
            }
        )).toBe(true);

        wrapper.vm.handgrading_result!.comments.push(new_comment);
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(4);
        expect(wrapper.findAll('.comment').at(0).find('.comment-message').text()).toContain(
            text
        );
    });

    test('Custom comments disabled', async () => {
        wrapper.setProps({enable_custom_comments: false});
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.delete').length).toEqual(2);
        // Custom comments should NOT be deletable, but applied annotations
        // should be
        expect(wrapper.findAll('.comment').at(0).find('.delete').exists()).toBe(false);
        expect(wrapper.findAll('.comment').at(1).find('.delete').exists()).toBe(true);
        expect(wrapper.findAll('.comment').at(2).find('.delete').exists()).toBe(true);

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        code_lines.at(0).trigger('mousedown');
        code_lines.at(0).trigger('mouseup');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAllComponents({name: 'ContextMenuItem'}).length).toEqual(2);
    });

    test('Delete applied annotation', async () => {
        expect(wrapper.findAll('.comment').length).toEqual(3);

        let delete_stub = sinon.stub(applied_annotation_with_long_description, 'delete');
        wrapper.findAll('.delete').at(2).trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);
        expect(delete_stub.calledOnce).toBe(true);

        wrapper.vm.handgrading_result!.applied_annotations.pop();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(2);
    });

    test('Delete comment', async () => {
        expect(wrapper.findAll('.comment').length).toEqual(3);

        let delete_stub = sinon.stub(comment, 'delete');
        wrapper.findAll('.delete').at(0).trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);
        expect(delete_stub.calledOnce).toBe(true);

        wrapper.vm.handgrading_result!.comments.pop();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.comment').length).toEqual(2);
    });

    test('Readonly mode', async () => {
        wrapper.setProps({readonly_handgrading_results: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll('.delete').length).toEqual(0);
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        code_lines.at(0).trigger('mousedown');
        code_lines.at(1).trigger('mouseenter');
        code_lines.at(2).trigger('mouseenter');
        code_lines.at(2).trigger('mouseup');

        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();
    });

    test('Highlighting events ignored while saving', async () => {
        await wrapper.setData({d_saving: true});
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        await code_lines.at(0).trigger('mousedown');
        await code_lines.at(1).trigger('mouseenter');
        await code_lines.at(2).trigger('mouseenter');
        await code_lines.at(2).trigger('mouseup');

        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();
    });

    test('Highlight events out of order ignored', async () => {
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        await code_lines.at(0).trigger('mouseenter');
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        await code_lines.at(0).trigger('mouseup');
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        await code_lines.at(0).trigger('mousedown');
        await code_lines.at(1).trigger('mousedown');
        expect(wrapper.vm.d_first_highlighted_line).toEqual(0);
        expect(wrapper.vm.d_last_highlighted_line).toEqual(0);
    });

    test('Highlighting disabled when context menu open', async () => {
        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        await code_lines.at(0).trigger('mousedown');
        await code_lines.at(0).trigger('mouseup');
        expect(wrapper.findComponent({ref: 'handgrading_context_menu'}).element).toBeVisible();

        expect(wrapper.vm.d_first_highlighted_line).toEqual(0);
        expect(wrapper.vm.d_last_highlighted_line).toEqual(0);

        await code_lines.at(1).trigger('mouseenter');
        await code_lines.at(2).trigger('mouseenter');
        await code_lines.at(3).trigger('mouseenter');
        expect(wrapper.vm.d_first_highlighted_line).toEqual(0);
        expect(wrapper.vm.d_last_highlighted_line).toEqual(0);

        await code_lines.at(4).trigger('mousedown');
        await code_lines.at(4).trigger('mouseup');
        expect(wrapper.vm.d_first_highlighted_line).toEqual(0);
        expect(wrapper.vm.d_last_highlighted_line).toEqual(0);
    });

    test('Deletion disabled while saving', async () => {
        wrapper.setData({d_saving: true});
        await wrapper.vm.$nextTick();
        let delete_stubs = [
            sinon.stub(comment, 'delete'),
            sinon.stub(applied_annotation_with_long_description, 'delete'),
            sinon.stub(applied_annotation_no_long_description, 'delete'),
        ];

        for (let delete_button of wrapper.findAll('.delete').wrappers) {
            delete_button.trigger('click');
            await wrapper.vm.$nextTick();
        }

        for (let stub of delete_stubs) {
            expect(stub.callCount).toEqual(0);
        }
    });

    test('Highlighting events ignored while handgrading disabled', async () => {
        await wrapper.setProps({handgrading_result: null});
        await wrapper.setData({d_handgrading_result: null});

        expect(wrapper.findAll('.delete').length).toEqual(0);
        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        await code_lines.at(0).trigger('mousedown');
        await code_lines.at(1).trigger('mouseenter');
        await code_lines.at(2).trigger('mouseenter');
        await code_lines.at(2).trigger('mouseup');

        expect(wrapper.vm.d_first_highlighted_line).toBeNull();
        expect(wrapper.vm.d_last_highlighted_line).toBeNull();
    });

    test('No annotations, custom comments not allowed', async () => {
        result.handgrading_rubric.annotations = [];
        wrapper = managed_mount(ViewFile, {
            propsData: {
                filename: filename,
                file_contents: content,
                handgrading_result: result,
                readonly_handgrading_results: false,
                enable_custom_comments: false,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        let code_lines = wrapper.findAllComponents({ref: 'code_line'});
        await code_lines.at(0).trigger('mousedown');
        await code_lines.at(0).trigger('mouseup');
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent({ref: 'handgrading_context_menu'}).element).toBeVisible();
        expect(wrapper.findComponent({ref: 'handgrading_context_menu'}).text()).toEqual('');
    });
});
