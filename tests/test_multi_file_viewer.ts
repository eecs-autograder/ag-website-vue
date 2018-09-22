import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
@Component({
    template:  `<div>
                  <multi_file_viewer
                    ref="multi_file">
                  </multi_file_viewer>
                </div>`,
    components: {
        'multi_file_viewer': MultiFileViewer
    }
})
class WrapperComponent extends Vue { }

=======
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).
describe('MultiFileViewer.vue', () => {

    test('MultiFileViewer data set to values passed in by parent', () => {
        @Component({
            template:  `<multi_file_viewer ref="multi_file"
                                           :height_of_view_file="height_of_view_file_in">
                        </multi_file_viewer>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        class WrapperComponent2 extends Vue {
            height_of_view_file_in = { "height": "540px" };
        }

        const wrapper = mount(WrapperComponent2);
        const multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.scrollable_height).toEqual(
            wrapper.vm.$data.height_of_view_file_in
        );
    });

    test('When a file is added it becomes the active file/tab ', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(view_file_component.text()).toContain('Mango Body');

        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain('Nectarine Body');
    });

    test('Clicking on a tab makes it the active tab', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain('Nectarine Body');

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('Only one copy of a file and its contents can exist at once in the mfv', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('When leftmost tab is active & gets deleted, right neighbor becomes active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Kiwi Body');

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        leftmost_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
=======
        class WrapperComponent extends Vue {
            height_of_view_file_in = { "height": "540px" };
        }

        const wrapper = mount(WrapperComponent);
        const multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(-1);
        expect(multi_file_viewer.vm.$data.scrollable_height).toEqual(
            wrapper.vm.$data.height_of_view_file_in
        );

    });

    test('When a file is added it becomes the active file/tab ', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(-1);

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(1);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(4);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_4_content);
    });

    test('Clicking on a tab makes it the active tab', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(-1);

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);

        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);

        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);

        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(4);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_4_content);

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
    });

    test('Only one copy of a file and its contents can exist at once in the mfv', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(-1);

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(1);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');

        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        add_first_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);
    });

    test('When leftmost tab is active & gets deleted, right neighbor becomes active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        leftmost_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let leftmost_tab_close_x = wrapper.findAll('.close-x');
        leftmost_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('When the only tab gets deleted, the active_tab_index becomes negative', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        expect(leftmost_tab.text()).toContain('Kiwi');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
=======
        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

    });

    test('When the only tab gets deleted, the active_tab_index becomes negative', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        console.log(view_file_component.html());
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        expect(leftmost_tab.text()).toContain(wrapper.vm.$data.file1);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let leftmost_tab_close_x = wrapper.findAll('.close-x').at(0);
        leftmost_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
    });

    test('When an active middle tab gets deleted, the right neighbor becomes active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        let view_file_component = wrapper.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Nectarine Body');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
=======
        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
    });

    test('When an active middle tab gets deleted, the right neighbor becomes active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_4_content);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let second_tab_close_button = wrapper.findAll('.close-x').at(1);
        second_tab_close_button.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Mango Body');
    });

    test('Deleting rightmost active tab causes left neighbor to become active', async () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        await multi_file_viewer.$nextTick();

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
=======
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);
    });

    test('Deleting rightmost active tab causes left neighbor to become active', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(-1);

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(4);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_4_content);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let rightmost_tab_close_x = wrapper.findAll('.close-x').at(3);
        rightmost_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
    });

    test('Close middle tab when middle tab is not active', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');
        multi_file_viewer.add_to_viewing('Nectarine', 'Nectarine Body');

        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(4);
=======
        multi_file_viewer =  wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
    });

    test('Close middle tab when middle tab is not active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_4_content);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
=======
        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);

>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).
    });


    test('Close leftmost tab when it is not active', () => {
<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);

        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
=======
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let first_tab_close_button = wrapper.findAll('.close-x').at(0);
        first_tab_close_button.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
    });

    test('Close rightmost tab when it is not active', () => {

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Kiwi', 'Kiwi Body');
        multi_file_viewer.add_to_viewing('Lime', 'Lime Body');
        multi_file_viewer.add_to_viewing('Mango', 'Mango Body');

        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
=======
        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);

    });

    test('Close rightmost tab when it is not active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Kiwi </p>
                          <p class="second-button" @click="open_file(2)"> Add Lime </p>
                          <p class="third-button" @click="open_file(3)"> Add Mango </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Nectarine </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
            }

            file1 = "Kiwi Header";

            file2 = "Lime Header";

            file3 = "Mango Header";

            file4 = "Nectarine Header";

            file_1_content = "Kiwi Body";

            file_2_content = "Lime Body";

            file_3_content = "Mango Body";

            file_4_content = "Nectarine Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_2_content);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_3_content);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');

        let third_tab_close_x = wrapper.findAll('.close-x').at(2);
        third_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
=======
        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.$data.active_tab_index).toEqual(0);
=======
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).
    });


    test('Close tab to left of active tab (active tab is not rightmost tab)', () => {
<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba

        const wrapper = mount(WrapperComponent).find({ref: 'multi_file'});
        let multi_file_viewer = <MultiFileViewer> wrapper.vm;

        multi_file_viewer.add_to_viewing('Monday', 'Monday Body');
        multi_file_viewer.add_to_viewing('Tuesday', 'Tuesday Body');
        multi_file_viewer.add_to_viewing('Wednesday', 'Wednesday Body');
        multi_file_viewer.add_to_viewing('Thursday', 'Thursday Body');
        multi_file_viewer.add_to_viewing('Friday', 'Friday Body');

        expect(multi_file_viewer.$data.active_tab_index).toEqual(4);
        expect(multi_file_viewer.$data.files_currently_viewing.length).toEqual(5);
=======
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file(1)"> Add Monday </p>
                          <p class="second-button" @click="open_file(2)"> Add Tuesday </p>
                          <p class="third-button" @click="open_file(3)"> Add Wednesday </p>
                          <p class="fourth-button" @click="open_file(4)"> Add Thursday </p>
                          <p class="fifth-button" @click="open_file(5)"> Add Friday </p>
                          <div class="mvf-container">
                            <multi_file_viewer
                              ref="multi_file">
                            </multi_file_viewer>
                          </div>
                        </div>`,
            components: {
                'multi_file_viewer': MultiFileViewer
            }
        })

        class WrapperComponent extends Vue {

            open_file(file_number: number) {
                let mfv: MultiFileViewer = <MultiFileViewer> this.$refs.multi_file;
                if (file_number === 1) {
                    mfv.add_to_viewing(this.file1, this.file_1_content);
                }
                else if (file_number === 2) {
                    mfv.add_to_viewing(this.file2, this.file_2_content);
                }
                else if (file_number === 3) {
                    mfv.add_to_viewing(this.file3, this.file_3_content);
                }
                else if (file_number === 4) {
                    mfv.add_to_viewing(this.file4, this.file_4_content);
                }
                else {
                    mfv.add_to_viewing(this.file5, this.file_5_content);
                }
            }

            file1 = "Monday";

            file2 = "Tuesday";

            file3 = "Wednesday";

            file4 = "Thursday";

            file5 = "Friday";

            file_1_content = "Monday Body";

            file_2_content = "Tuesday Body";

            file_3_content = "Wednesday Body";

            file_4_content = "Thursday Body";

            file_5_content = "Friday Body";
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain(wrapper.vm.$data.file_1_content);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);

        let add_fifth_file_button = wrapper.find(".fifth-button");
        add_fifth_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(4);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(5);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        // click on fourth
        let fourth_tab = wrapper.findAll('.tab-label').at(3);
        fourth_tab.trigger('click');
<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.active_tab_index).toEqual(3);
=======
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        // delete the first tab
        let first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.active_tab_index).toEqual(2);
=======
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).

        // delete the 'new' first tab
        first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
<<<<<<< 9413525b70c229b186d7c4f4d77e711373f7beba
        expect(multi_file_viewer.$data.active_tab_index).toEqual(1);
=======
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
>>>>>>> Added a test for deleting a tab to the left of the active tab. Cleaned up the testing file (got rid of mentions of 'active' and 'inactive' header classes and replaced them with findAlls for the 'tab-label' and 'close-x' classes. Got rid of the toggle_viewing_files function, the viewing_a_file boolean, and the active_tab_label string because they weren't being used. Updated the remove_from_viewing function to only manually update the active_tab_id if a tab to the left of the active tab gets deleted and the active tab wasn't the rightmost tab. Transferred some colors from the autograder-website to ag-website-vue. Added another example of the multi_file_viewer to its demo file. This example shows how the view_file components will be displayed if an object is not passed in for the prop 'height_of_view_file' --default height of the view_file is just enough to show its own contents. In order for all of the view_files inside of the multi_file_viewer to be the same size (or a certain size), the user must pass in an object specifying the desired height to 'height_of_view_file', (min-height, and max-height can be added here too).
    });
});
