import MultiFileViewer from '@/components/multi_file_viewer.vue';
import { config, mount } from '@vue/test-utils';
import Vue from 'vue';
import Component from 'vue-class-component';

beforeAll(() => {
    config.logModifiedComponents = false;
});

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
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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

            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
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
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(view_file_component.text()).toContain('Mango Body');

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(4);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(view_file_component.text()).toContain('Nectarine Body');
    });

    test('Clicking on a tab makes it the active tab', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
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
        expect(view_file_component.text()).toContain('Nectarine Body');

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
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
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
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');

        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');

        add_first_file_button.trigger('click');
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(2);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');
    });

    test('When leftmost tab is active & gets deleted, right neighbor becomes active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(view_file_component.text()).toContain('Lime Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        leftmost_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x');
        leftmost_tab_close_x.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(view_file_component.text()).toContain('Lime Body');

    });

    test('When the only tab gets deleted, the active_tab_index becomes negative', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        console.log(view_file_component.html());
        expect(view_file_component.text()).toContain('Kiwi Body');

        let leftmost_tab = wrapper.findAll('.tab-label').at(0);
        expect(leftmost_tab.text()).toContain('Kiwi');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);

        let leftmost_tab_close_x = wrapper.findAll('.close-x').at(0);
        leftmost_tab_close_x.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});

        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(0);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
    });

    test('When an active middle tab gets deleted, the right neighbor becomes active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Lime Body');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Mango Body');

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Nectarine Body');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);

        let second_tab = wrapper.findAll('.tab-label').at(1);
        second_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);

        let second_tab_close_button = wrapper.findAll('.close-x').at(1);
        second_tab_close_button.trigger('click');

        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Mango Body');
    });

    test('Deleting rightmost active tab causes left neighbor to become active', () => {
        @Component({
            template:  `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
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
        expect(view_file_component.text()).toContain('Nectarine Body');

        let rightmost_tab_close_x = wrapper.findAll('.close-x').at(3);
        rightmost_tab_close_x.trigger('click');

        multi_file_viewer =  wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.file_names_and_content.size).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
    });

    test('Close middle tab when middle tab is not active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Lime Body');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Mango Body');

        let add_fourth_file_button = wrapper.find(".fourth-button");
        add_fourth_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Nectarine Body');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(4);

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);
    });


    test('Close leftmost tab when it is not active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Lime Body');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Mango Body');
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);

        let first_tab_close_button = wrapper.findAll('.close-x').at(0);
        first_tab_close_button.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
        expect(view_file_component.text()).toContain('Mango Body');

    });

    test('Close rightmost tab when it is not active', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Kiwi')"> Add Kiwi </p>
                          <p class="second-button" @click="open_file('Lime')"> Add Lime </p>
                          <p class="third-button" @click="open_file('Mango')"> Add Mango </p>
                          <p class="fourth-button" @click="open_file('Nectarine')"> Add Nectarine
                          </p>
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
            files_and_content = new Map<string, string>([
                ['Kiwi', 'Kiwi Body'],
                ['Lime', 'Lime Body'],
                ['Mango', 'Mango Body'],
                ['Nectarine', 'Nectarine Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Kiwi Body');

        let add_second_file_button = wrapper.find(".second-button");
        add_second_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Lime Body');

        let add_third_file_button = wrapper.find(".third-button");
        add_third_file_button.trigger('click');
        expect(view_file_component.text()).toContain('Mango Body');
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(3);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);

        let first_tab = wrapper.findAll('.tab-label').at(0);
        first_tab.trigger('click');

        let third_tab_close_x = wrapper.findAll('.close-x').at(2);
        third_tab_close_x.trigger('click');

        multi_file_viewer = wrapper.find({ref: 'multi_file'});
        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(2);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');

        let second_tab_close_x = wrapper.findAll('.close-x').at(1);
        second_tab_close_x.trigger('click');

        expect(multi_file_viewer.vm.$data.files_currently_viewing.length).toEqual(1);
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(0);
        expect(view_file_component.text()).toContain('Kiwi Body');
    });


    test('Close tab to left of active tab (active tab is not rightmost tab)', () => {
        @Component({
            template: `<div>
                          <p class="first-button" @click="open_file('Monday')"> Add M </p>
                          <p class="second-button" @click="open_file('Tuesday')"> Add T </p>
                          <p class="third-button" @click="open_file('Wednesday')"> Add W </p>
                          <p class="fourth-button" @click="open_file('Thursday')"> Add Th </p>
                          <p class="fifth-button" @click="open_file('Friday')"> Add F </p>
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

            files_and_content = new Map<string, string>([
                ['Monday', 'Monday Body'],
                ['Tuesday', 'Tuesday Body'],
                ['Wednesday', 'Wednesday Body'],
                ['Thursday', 'Thursday Body'],
                ['Friday', 'Friday Body']
            ]);

            open_file(file_in: string) {
                let mfv = <MultiFileViewer> this.$refs.multi_file;
                mfv.add_to_viewing(file_in, this.files_and_content.get(file_in));
            }
        }

        const wrapper = mount(WrapperComponent);
        let multi_file_viewer = wrapper.find({ref: 'multi_file'});

        let add_first_file_button = wrapper.find(".first-button");
        add_first_file_button.trigger('click');

        let view_file_component = multi_file_viewer.find({ref: 'view_file_component'});
        expect(view_file_component.text()).toContain('Monday Body');
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

        // click on fourth
        let fourth_tab = wrapper.findAll('.tab-label').at(3);
        fourth_tab.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(3);

        // delete the first tab
        let first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(2);

        // delete the 'new' first tab
        first_tab_close_x = wrapper.findAll('.close-x').at(0);
        first_tab_close_x.trigger('click');
        expect(multi_file_viewer.vm.$data.active_tab_index).toEqual(1);
    });
});
