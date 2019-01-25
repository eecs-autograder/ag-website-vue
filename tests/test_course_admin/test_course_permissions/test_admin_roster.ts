// await patch_async_static_method(
//     Project, 'create',
//     () => Promise.resolve(new_project),
//     async () => {
//
//         let mock_result = await Project.create(
//             {name: new_project_name, course: 2}
//         );
//         expect(mock_result).toEqual(new_project);

// async add_admins_to_roster(new_admins: string[]) {
//     await this.d_course.add_admins(new_admins);
//     this.admins = await this.d_course.get_admins();
// }




// console.log(wrapper.html());

// let validated_input = wrapper.find({ref: 'add_permissions_input'});
// (<HTMLInputElement> validated_input.find(
//     '#textarea'
// ).element).value = "letitsnow@umich.edu  sevenEleven@umich.edu";
// validated_input.find('#textarea').trigger('input');
//
// let permissions_form = wrapper.find('#add-permissions-form');
// permissions_form.trigger('submit.native');
// await course_permissions.$nextTick();
//
// expect(wrapper.emitted().add_permissions.length).toBe(1);
//
// console.log(wrapper.emitted().add_permissions[0][0]);

// console.log(all_users.at(0).text());
// console.log(all_users.at(1).text());
// console.log(all_users.at(2).text());
// console.log(all_users.at(3).text());
// console.log(all_users.at(4).text());
// console.log(all_users.at(5).text());
// expect(all_users.at(0).text()).toEqual(user_2.username);
// expect(all_users.at(1).text()).toEqual(user_1.username);
// expect(all_users.at(2).text()).toEqual(user_4.username);
// expect(all_users.at(3).text()).toEqual(new_user_1.username);
// expect(all_users.at(4).text()).toEqual(new_user_2.username);
// expect(all_users.at(5).text()).toEqual(user_3.username);


// amandaplease, coolmom, freshPrince, letitsnow, sevenEleven, worldsbestbo$$
// amandaplease - 2
// coolmom - 1
// freshPrince - 4
// letitsnow - new_user_1
// sevenEleven - new_user_2
// worldsbestbo$$ - 3


// let updated_roster = [user_1, user_2, user_3, new_user_1, new_user_2];
