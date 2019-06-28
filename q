[33mcommit 5ff7950c845a852cb56f49eb9bc3394b6ac1071a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 28 10:23:57 2019 -0400

    Removed comments and unnecessary html code.

[33mcommit cd799fed5274ec7efc45b3f6566ed67b181b688c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 28 09:52:33 2019 -0400

    One single function in ag_suites.vue now updates the active suite/command. Added test cases/changed test cases to reflect the changes requested on the pull request.

[33mcommit f2641c7e508c84c3e8912bc9b22769e98a6cf303[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 25 10:37:15 2019 -0400

    Adding the padding back to the tab-body in ag_suite/command_settings. Added check to see if suite had been the active level when clicked on, so that it could be viewed instead of closing automatically.

[33mcommit 3ff875ac965791adff6be530c74252c065f98ce2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 25 10:29:21 2019 -0400

    Removed unnecessary css classes from files inside ag_suites.

[33mcommit 32cd9cd188196054fdfd7ee67d899c7af6f9be1c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 25 09:59:29 2019 -0400

    Removed console.log statements, comments and introduced the reset_active_indices function to the update_ag_test_suite/case/command functions.

[33mcommit 80ae3a4859aeee11b828831f4f9e0da800a2308c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 25 08:49:53 2019 -0400

    Filled in tests in test_ag_suites.ts.

[33mcommit 23eb0aeb374306efd515c2d41104b92be83ca481[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 21 10:18:14 2019 -0400

    Added tests for ag_case_settings.

[33mcommit f5af13c83e4d8a2c4b9f1c07ccd49508ce66fd77[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Jun 20 09:38:46 2019 -0400

    Added the item-to-delete class around the suite/case/command name in the deeletion modals.

[33mcommit 3578c34324847d79c22d7ebe3d0a87f45e03d633[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 19 14:24:27 2019 -0400

    Added display: flex to the second outermost div in the validated-input component so that the suffix slot element is centered alongside the validated input.

[33mcommit f00cbdfcbfa172e4b648cf75a8f44357a18db1e4[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Jun 17 14:00:19 2019 -0400

    Updated the modal for adding a test case in ag_suite_panel.

[33mcommit 872b11a0577c94e5109f4bd9b512d9383eb8e02b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 14 13:22:01 2019 -0400

    Trying to figure out how to implement going to the next and previous commands.

[33mcommit 765b9971c60686e807af84b5cea266cba6930a5c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Jun 13 19:03:59 2019 -0400

    Fixed the tests for ag_command_settings, ag_suite_settings, ag_case_panel and ag_suite_panel.

[33mcommit 5e96e830c1082a425e4bfc24e941a6400e8249d3[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Jun 13 15:06:27 2019 -0400

    Swapped all dropdowns in the ag_suites directory for select elements.

[33mcommit a4b4f7623bdaba693f5042e6b71532e176b5eab7[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 12 22:13:45 2019 -0400

    Fixed a logic error in prev_command_is_available.

[33mcommit e88df06513570e7ff7fe4efc227cf89f3bc7678e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 12 21:32:27 2019 -0400

    Ag_suites now implements all AGTestSuite/Case/Command observers.

[33mcommit c21f537042d010a2a98a744ccc489d0e9fa8fdd4[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 12 01:10:06 2019 -0400

    Added an invoke_focus method to the ValidatedInput component.

[33mcommit 046320cfa90330253cdc3e281a2f74d2b8b7d484[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Jun 10 09:24:15 2019 -0400

    Added buttons to navigate to the next and previous commands.

[33mcommit 21390ba3ba8646269b1b442c9759d4a5e09c956d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 5 12:41:10 2019 -0400

    Added the 'instructor_files' and 'expected_student_files' fields to the Project instances in the edit_groups components.

[33mcommit 2de60bf975b1944a2067104ce0d1a5ae065c4749[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Jun 5 11:52:18 2019 -0400

    Fixed test cases to reflect the new layout of the ag_suites component.

[33mcommit c83d427fc382326cd36315e1c55ee0ee2441afda[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 31 16:31:17 2019 -0400

    Added tests for the ag_case_panel component.

[33mcommit 69e2ccb36420449a526622a8931ff5c422d5fb8f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 31 15:03:40 2019 -0400

    Added tests for the ag_suite_panel component.

[33mcommit fa63fc7a840abd958c9c4bd06d74a55269c0d784[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 31 11:07:58 2019 -0400

    Add test cases to test_ag_command_settings for the 'make_min_value_validator's.

[33mcommit 15f18602ba0f8efd7e0c17bb487f30172da5dbb8[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 31 10:38:15 2019 -0400

    Adding tests for the ag_command_settings component.

[33mcommit 28d4fe7da3b36922b6dab8e6ffdece6cb943b144[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 29 14:15:41 2019 -0400

    Adding tests for ag_suite_settings.

[33mcommit 4c5012aef93ed172725812ce574158bfcfdbd5dd[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 15 13:15:48 2019 -0400

    Placed more repeated styling (among the ag_tests components) into the ag_tests.scss file.

[33mcommit 7613341d519c49e185245afb23ca4249b1271c72[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 14 17:46:27 2019 -0400

    Added separate scrolling for the navigation bar and the tab body content.

[33mcommit 2525f57094b0a99212b3e508b8be55309bac915b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 14 11:14:57 2019 -0400

    Added modals to create new suites, cases, and commands once those methods are available.

[33mcommit 717c4dff7fa04b8764f8c0afdd405f1d391a7637[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 13 14:33:47 2019 -0400

    Working on the layout of the AGSuiteSettings component.

[33mcommit fddfa0ed379eb8863a0d292c0602ff2cda56a5b1[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 10 18:54:18 2019 -0400

    In the process of converting the old AGTestCommand code to accomodate the components that have been created since last working on it.

[33mcommit a0660790a2461b300ad2d587e911f9a1d511867d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 12:25:39 2019 -0400

    Added AGTestCases to ProjectAdmin.

[33mcommit 7d0b23e8db5e51cf6d4b649271e2a3e58ef10dab[m
Merge: 00bd291 35c224f
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 26 11:24:11 2019 -0400

    Merge pull request #235 from eecs-autograder/tab_scrolling
    
    Added a scroll_body option to tabs component.

[33mcommit 35c224fb18ffb962f3ab72778d3006545dc24fe2[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 25 15:46:08 2019 -0400

    Added a scroll_body option to tabs component.
    Added css classes for independent column scrolling.

[33mcommit 00bd29189aefc833c09dd6e29dadb2402e41c698[m
Merge: f72f321 b621074
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 19 21:50:23 2019 -0400

    Merge pull request #226 from eecs-autograder/216_rename_dropdown_menu_show_and_hide_methods
    
    216 rename dropdown menu show and hide methods

[33mcommit b621074e45b9bec88684a6aa1d05c58cb2d0b73c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 14 18:41:59 2019 -0400

    Changed 'show_the_dropdown_menu' and 'hide_the_dropdown_menu' methods in the dropdown component to 'show' and 'hide'.

[33mcommit f72f3212afa62a82bf5fa74ba4fbd65b77cdc13a[m
Merge: 94fe021 d045175
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 19 21:30:15 2019 -0400

    Merge pull request #225 from eecs-autograder/202_add_input_dropdown_label_to_forms_scss_file
    
    Add more form styling to forms.css

[33mcommit d04517545b8201b89835999ae4ebb4b7ecfcdecf[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 19 21:25:11 2019 -0400

    Reduced margin between checkbox and label.
    Renamed get_course_info to format_course_name.
    Removed extra spaces produced by format_course_name when semester or year is null.

[33mcommit 5904ca29381bdbf3e82d9a91a86b1a8dce2e111f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 18 17:33:56 2019 -0400

    Reduced the border-radius and padding on the checkbox element.

[33mcommit b4a2ac7abbd9daa581367d7400ba329ab360c5cd[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 18 15:02:44 2019 -0400

    Changed the styling of checkboxes in forms.scss.

[33mcommit e241649f95ac2c08c0af6598350a88219b544f1c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 18 10:47:46 2019 -0400

    Removed the line that checked if course.name was null from get_course_info.

[33mcommit 62a8216a0a03805efbb503bdead6f9a13fe9eace[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Jun 18 10:44:03 2019 -0400

    Added a get_course_info function to utils.ts.

[33mcommit 07154bce78f3f8b9e22f831bf93b8a81ecef7daa[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Jun 17 15:50:52 2019 -0400

    Changed the color of the outline of the checkbox square to be darker.

[33mcommit 87710794b094bfb5b56d9162cd4e1e55e201bb52[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Jun 17 09:31:20 2019 -0400

    Changed fieldset, legend, and input[type=checkbox] in forms.scss to .fieldset, .legend, and .checkbox.

[33mcommit 61db485a95691d01370a225e742caa4ccac61be8[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 14 17:20:49 2019 -0400

    Added the dropdown_height prop to the cloning_destinations_dropdown in the single_project component.

[33mcommit 600d9b6b5ff7f6f84a06f647de1261fe7fdbb2aa[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 14 14:54:19 2019 -0400

    The new_course_semester is now chosen using a select element.

[33mcommit 85eb82ce39d10de1b6bbf8fcef97580b73b5d960[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Jun 14 13:52:26 2019 -0400

    Added the instructor_files and expected_student_files fields to all Project instances.

[33mcommit de2a5df8a77db12d5aeef355851430084c7bb23c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Jun 10 14:30:01 2019 -0400

    Working on adding classes to forms.scss.

[33mcommit 94fe021109c434eee4b8bc466b5bd25c767ba2b6[m
Merge: d9efbb9 1013be9
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Jun 8 22:17:05 2019 -0400

    Merge pull request #221 from eecs-autograder/123_189_204_validated_input_and_form_fixes
    
    Validated input and form fixes

[33mcommit 1013be986b40fbf75c91f14284936b0d08b16fe0[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Jun 8 21:55:36 2019 -0400

    Added option to validated input that lets warnings show up if the user clicks on and then away from an invalid input (such as one that's initially empty) without editing it.

[33mcommit 3448f93cdb4d78d17784df85aed38339f6093995[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Jun 8 15:09:49 2019 -0400

    Removed .native from validated form submit event handlers and test emitters.
    Also made the validated form's internal native submit handler automatically prevent the default form submit behavior.

[33mcommit d27adc939e15e364f846120e1bec615054bb6da3[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Jun 8 14:55:27 2019 -0400

    Added an unregister method to validated form and made validated inputs call it when they're destroyed.

[33mcommit 3d8ee21a0b53b269585c39e23834e35bae1d56a5[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Jun 8 12:43:59 2019 -0400

    Added event forwarding to validated form. Prevented submit events from triggering if the form is invalid.

[33mcommit d9efbb9011935602be8e8ab4472ebbe84c9c702f[m
Merge: 1908327 fc779ef
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 14:37:19 2019 -0400

    Merge pull request #171 from eecs-autograder/153_importing_standards
    
    Upgraded tslint and added import grouping rules.

[33mcommit fc779ef3180b9952eec82c8a6685b5cda0c81f62[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 14:33:32 2019 -0400

    Updated coding standards.

[33mcommit aba2cbc2210dae8c64cd45cad76441c746c2711e[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 13:58:39 2019 -0400

    Tweaked import grouping settings and re-ordered imports to comply.

[33mcommit 7db43f262c73c1e9f37665e4c186cd8da43d39e2[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 11 20:21:20 2019 -0400

    Upgraded tslint and added import grouping rules.

[33mcommit 1908327a0b9132c2acff27f1a62cf615446d70a5[m
Merge: 0319eea fd8d492
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 12:49:00 2019 -0400

    Merge pull request #220 from eecs-autograder/183_merge_groups_manual_rebase
    
    Applied Ashley's merge groups implementation and made changes to accommodate changes to group editing

[33mcommit fd8d492ff0ba3b4b2c01a74c3f50d016158a80ca[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 12:19:00 2019 -0400

    Applied Ashley's merge groups implementation and made changes to accomodate changes to group editing.

[33mcommit 0319eeaf1a7c2c33ddea9e688d9c1e8dde814671[m
Merge: 44d91fc 8e32165
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 10:57:34 2019 -0400

    Merge pull request #217 from eecs-autograder/course_and_project_settings_tweaks
    
    Course and project settings tweaks.

[33mcommit 8e32165e0988a3b032ae6682ef6d3eb3782ae1c5[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 10:53:33 2019 -0400

    Course and project settings tweaks.
    - Replaced semester dropdown with a select tag.
    - Started forms.scss with select styling.
    - Added allowed_guest_domain input to course settings.
    - Added initializer for d_course to course settings.
    - Made course settings and project settings make a deep copy of their inputs.

[33mcommit 44d91fcb5a2805102f7c7c20dd79af3305a5ad41[m
Merge: 67458d5 2c974f0
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Jun 7 09:48:54 2019 -0400

    Merge pull request #174 from eecs-autograder/173_project_settings
    
    Project settings component

[33mcommit 2c974f023f7cc3be663f454a259b69d775090ac6[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 19:17:57 2019 -0400

    Fixed build errors by adding more test utility functions.

[33mcommit 7217de4b3683d36994c8acfb92fbf7beeb27c26a[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 18:20:38 2019 -0400

    Removed allowSyntheticDefaultImports from tsconfig.

[33mcommit a11a58922c0ed95f55e3624274dcbd712e138a55[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 18:18:43 2019 -0400

    Removed some accidental imports.

[33mcommit 728e471b6aae30e83454adbba294575c9550fe74[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 18:09:10 2019 -0400

    Finished adding tests.

[33mcommit 8861265f0a0cd834aaaf3a5050c2544d5d69367b[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 17:47:02 2019 -0400

    Updated nullable field inputs in project settings form so that they convert from null to empty str and vice versa.
    Also replaced dropdowns in the form with <select> tags with custom styling.
    Working on making sure all form bindings are tested.
    
    Also added testing utility functions to fix #210.

[33mcommit 8002ce5a2bfe80597907e1b6fafe48cf33b427c4[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Jun 6 12:25:17 2019 -0400

    Made the allow submissions past limit checkbox disabled instead of hidden when submission limit per day is null.
    Also re-ordered more of the project settings form inputs.

[33mcommit 88801f91bb390bb8848c1eafbdba29f68d33c43c[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 5 17:42:16 2019 -0400

    Fixed linter warnings.

[33mcommit 6cac4b4049fd747bd3ffe4216a5c23bd00bc52ac[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 5 17:33:32 2019 -0400

    Added datetime and time pickers to project settings and updated tests.

[33mcommit 9ab7feb76a196cbe480ef644bdb2b99ca006f512[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Jun 5 13:24:09 2019 -0400

    Wrote clearable-datetime-picker css definition to use in group and project editing.

[33mcommit 8cbb090256a6a05ff75b91003c8cc7f18983dd1a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 10:55:37 2019 -0400

    Adding a spinner that is visible next to the 'save updates' button while save_project_settings() runs.

[33mcommit 5c7e4e61c22a0e941f443e8f1e77e76d0af5a41c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 19:46:01 2019 -0400

    Removed a console.log statement from submission_policy_selected().

[33mcommit 4b507be5ca166866d43631bac8be32e159c88560[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 15:56:44 2019 -0400

    Added an array of final_graded_submission_policy_options with their corresponding labels to the ProjectSettings component for the ultimate_submission_policy dropdown.

[33mcommit f801c96f069cbfb9d5b69fa9aa191382caff64c2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 13:17:26 2019 -0400

    Added tests to test_project_settings that concern the use of moment().

[33mcommit 2ec38459e2d0804e183f68896bdf181af1089e7b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 26 23:58:19 2019 -0400

    Added datetime picker components for the soft_closing_time and closing_time values.

[33mcommit 8ac3cdaf927b6393a26f90cc14ca1cc41edf7f46[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 26 23:07:08 2019 -0400

    Added a timepicker to ProjectSettings to v-model submission_limit_reset_time.

[33mcommit 89a2ec1d67868cd2d37d71ff02e5985090e8ec0c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 26 12:07:05 2019 -0400

    Added tests for checking that soft_closing_time, closing_time and submission_limit_per_day are updated correctly before the call to save on d_project in the ProjectSettings component.

[33mcommit 5ddf46796cac0c5e7ed126564249c1b4fb0d316a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 25 23:23:40 2019 -0400

    Added fieldset and legend elements to the ProjectSettings component html template.

[33mcommit f7552e42a7031f08db7d6b327929ceef630dddd1[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 25 19:31:06 2019 -0400

    Updated created() and save_project_settings() to accomodate the submission_limit_per_day variable.

[33mcommit 221f0447c2789685cb0467e85d86ea179c10bc3a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 25 19:26:03 2019 -0400

    Trying to figure out the best way to represent d_project.submission_limit_per_day as an input/test the accessibility of the allow_submissions_past_limit input.

[33mcommit 49743e018c99030c26ebe456c922ee270d68b6d5[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 25 10:36:38 2019 -0400

    Added tests the submission_limit_per_day_exists() method in test_project_settings.ts.

[33mcommit 9891ee1d0cd86d4ef6d5aae01e7019d3a93037fa[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 25 10:03:40 2019 -0400

    Added the submission_limit_per_day_exists() getter function to ProjectSettings.

[33mcommit 7cd25cf1092d6860100bf36c38120696313fb7a6[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 24 20:59:12 2019 -0400

    Added tests for the ProjectSettings component.

[33mcommit 89f5c886a4137522d361af61fbf0d84baabee1a5[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 22:05:48 2019 -0400

    Initial commit for the ProjectSettings component. Transferred over code from the original branch.

[33mcommit 67458d58903ceedce568ef84d353cabaebbf0559[m
Merge: 9cc6468 2be10a5
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:57:29 2019 -0400

    Merge pull request #172 from eecs-autograder/115_edit_groups_new_branch
    
    Edit groups component

[33mcommit 2be10a5e09ac04d30d3dd68dce087b5de51a0b81[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:49:23 2019 -0400

    Updated package-lock.json

[33mcommit 6d80a8ccf9f73c46a84a731720b1af6c20c790f5[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:47:56 2019 -0400

    Changed Edit Groups tab title to Groups & Extensions

[33mcommit 4c0f736b2d8dee19a30939d743e3c754b9b6d13e[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:45:21 2019 -0400

    Cleanup

[33mcommit 496cedd07cfe4911d8796bc60f797b2d4b2d6c89[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:43:06 2019 -0400

    Changed group lookup so that it doesn't copy its input.
    This fixes an issue where new groups weren't showing up in the edit groups group lookup.

[33mcommit 914aa5cb7f42f5d368b7350264454f100bb2dcfb[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:33:25 2019 -0400

    Reverted changes having to do with merging groups.

[33mcommit b3db744c5bdb96208df088b724e085d154dbee62[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 14:23:56 2019 -0400

    Updated edit_groups to use ArraySet.

[33mcommit dae9483b2a4f17a398f7cfbcd16ea745e73e0613[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 13:15:48 2019 -0400

    Renamed a test.

[33mcommit affeb39fdb4ca01b0111e384bd6b62c0aa9b4327[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 13:13:38 2019 -0400

    Removed member variables that just copied attributes from project or course.
    Changed group editing and creating to take the course as input.

[33mcommit 648a5c84fd1b2a925f87ab80249b65954e224277[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 12:01:22 2019 -0400

    Re-styled revoke extension button.
    Added type="button" to add group member button.

[33mcommit 3ab770475ec9f07bce31c593f5208c13ec576680[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Jun 4 11:26:38 2019 -0400

    Added datetime picker to edit_single_group.vue and updated tests.
    Also added revoke extension button instead of toggle.

[33mcommit 807130652f0a8050d39ae96f0db6da1cbb88c476[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 17:08:14 2019 -0400

    Datetime picker fixes:
    - Added type="button" to buttons
    - Fixed initialization of d_time when input is null

[33mcommit c852f92f32af9a875ed875d97e37c51f83afb745[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri May 3 21:28:57 2019 -0400

    When a user attempts to save or edit a group now with an input that just contains the allowed_guest_domain, execution of the function will be cut short and an error message will be displayed below any input that contains just the allowed_guest_domain.

[33mcommit 02a5a26ec7dceda400973601bee8120a9a980117[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu May 2 18:18:14 2019 -0400

    Removed the project prop applied to the GroupLookup component used in EditGroups.

[33mcommit c0feb852f41c2518b92e74d2a5f5463d5433ac08[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 11:27:56 2019 -0400

    Added a spinner that is visible next to the 'update group' button when update_group() is called.

[33mcommit b717070f7ee45beaf71a77839b6e1f2b22221212[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 11:08:46 2019 -0400

    Changed the toggle color in EditSingleGroup to the default color.

[33mcommit 109d37f5e63b656a9818eba9f1f3a448bd33e5bf[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 11:01:51 2019 -0400

    Removed imports that were no longer needed in the EditGroups directory. Changed the create() and save() group functions to make sure at least one member name field remains after checking for invalid inputs. Updated sort_groups_with_extensions() to use localcompare on the 0th index member names to break datetime ties.

[33mcommit c0f41eb3205eecb76ce43502cc533dd71b5bad88[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 20:29:24 2019 -0400

    Updated the group member name related test cases for hte CreateSingleGroup component to work with the text input tags.

[33mcommit 46cceea81bae30d21079edb64e30457f1bd628a2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 19:41:57 2019 -0400

    Updated the group member name related test cases for the EditSingleGroup component to work with the text input tags.

[33mcommit 1ed5271aee6c48f91305c203a454552be12a1d10[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 29 18:21:40 2019 -0400

    Added the vue-ctk-date-time-picker to EditSingleGroup.

[33mcommit 464f1fa388f3d20f5ecc6ebdcfc72720de55bd07[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 21:45:21 2019 -0400

    Created a separate describe function to test what should happen when a group starts out without an extension, adds one, then attempts to save that group.

[33mcommit 631a7713c2c804bc597f46a38f56aad124bdd5f8[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 20:47:22 2019 -0400

    Set max_group_size back to project.max_group_size in the create() function for the EditSingleGroup component.

[33mcommit a1af7c089810c2f5e53e3de47ad016df9c79110d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 20:43:03 2019 -0400

    Added tests for trimming group member names before saving/creating a group.

[33mcommit 1f405d724a1e5884f5fb4b918741c638b875769b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 20:18:11 2019 -0400

    Group member names are now trimmed before an attempt to create or save a group.

[33mcommit c2de6cd8817260a443d48754532f75a7ccd93d54[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 18:06:06 2019 -0400

    Updated the path for the EditGroups import in the ProjectAdmin component.

[33mcommit d7caeb85cbc18a6f329b0b20624208efd2aecb0d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 16:18:03 2019 -0400

    Added a second test to test_edit_groups for inserting a new group (Group is inserted at the back of groups).

[33mcommit b0de0ba306eb3a976542a2ffbd156c6f62353ca9[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 22 17:06:07 2019 -0400

    Moved the 'create' and 'merge' group buttons into a fixed footer element. Added an scss file for edit_groups shared styles.

[33mcommit 206d529b0c39dfc9be8202f5a0ba36908b6af47e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 22 11:32:45 2019 -0400

    Trying to find a datetime-picker that works.

[33mcommit 0344228a21624bfe936ebaa03c7cc8b968bcd5c5[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 19 12:03:29 2019 -0400

    Added tests for the EditGroups component.

[33mcommit e95fe23eddcc3715fefd8c10e1a318619c16cfb7[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 18 15:59:52 2019 -0400

    Added tests for the CreateSingleGroup component.

[33mcommit e4eb069976ab5d0810fef36886ecb486badb405b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 18 13:11:15 2019 -0400

    Implemented a deep copy of the group passed into the EditSingleGroup component.

[33mcommit 9606c9d85728bc660647fdc02dbeba98685123eb[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 16 16:34:06 2019 -0400

    Added the modal for creating a group and implemented the update_group_created and update_group_changed methods in the EditGroups component.

[33mcommit 3b70b99ca3341fd17831772bca3cee55da29377f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 15 18:17:40 2019 -0400

    Removed the corresponding catch blocks in the save_group and create_group functions in edit_single_group and create_single_group, respectively.

[33mcommit b22426b1611ccab1a74c056ed46b12822f5a7c51[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 15 17:25:36 2019 -0400

    Added a Watcher to the dropdown_typeahead to update the d_choices array when the contents of the choices array passed in as a prop changes.

[33mcommit 63912f7d2f7042617c069eb67de5e552c721be7a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 11 13:24:13 2019 -0400

    Created the extensions table in EditGroups.

[33mcommit e3d67836bdb362bf6686ce13fb5c06f7ef0c8721[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 9 16:56:00 2019 -0400

    Working on developing the EditSingleGroup component.

[33mcommit c933cb13581eb737ee8f56a57d7f616d89ce481d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 8 18:59:04 2019 -0400

    Removed the portion of the html template in the GroupLookup component that displayed the selected group.

[33mcommit 862dd7add7a5045c623fe59eaf1a141d4c8c7f71[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 13 16:52:13 2019 -0400

    Working on a design for the GroupLookup component.

[33mcommit 9cc6468b4fd4eff91a53f91bd2c1db18b0b3a5c6[m
Merge: eed4508 b3d4424
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 16:05:13 2019 -0400

    Merge pull request #201 from eecs-autograder/5_datetime_picker
    
    Add datetime picker and time picker components

[33mcommit b3d4424f7fce0bb717c316bbcaa51a2145a17363[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 15:59:29 2019 -0400

    Removed print statement.

[33mcommit cc03c4d3d9d418bf0f5b523377a0a2e64975cc19[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 15:44:42 2019 -0400

    Minor style tweaks.

[33mcommit 38b665bba8828be2395eacbf43514fcf73cc4d4f[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 15:31:41 2019 -0400

    Suppressed warnings about momentjs import.

[33mcommit 3952d72b2745c1b5cd1c2fa94ae2d57e7ba1784c[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 15:18:33 2019 -0400

    Refactored DatetimePicker to use momentjs
    Also added and refactored some tests.

[33mcommit 7ac4a43f0152a8eabe4c044e7761954e0b5b1f0e[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Jun 3 13:55:59 2019 -0400

    Changed TimePicker to v-model on a string instead of Time object.

[33mcommit 68700bca541b2ede510b9ecc13d17b51d0149e29[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri May 31 15:40:50 2019 -0400

    Pulled time picker functionality into a separate component.
    DateTimePicker tests still need updating.

[33mcommit 7b30a76fd4357e155de81b57580fa40d82787cc4[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri May 31 12:15:50 2019 -0400

    Tweaked backspace behavior in datetime picker.
    Pressing backspace now sets hours to 12 and minutes to 0 and immediately emits the new time.

[33mcommit ea4a182304bbbdf8fe5a68194867e6e9c6dd5640[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri May 31 11:38:51 2019 -0400

    Suppressed typescript warning about missing type declaration for timezone-mock library.

[33mcommit 868929784c61348e4a9366e84f7e8ff55c9923e9[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri May 31 11:19:55 2019 -0400

    Added library to mock the local timezone in tests.

[33mcommit d8fb023b9fcae6301fa4ddbe44be220083601dd1[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 22 15:35:29 2019 -0400

    Fixed the test cases regarding pressing the BackSpace key while the hour-input or minute-input has focus.

[33mcommit 4c7df9319a8ec10565fa6aa41bfa6df9b3e10635[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 22 14:50:32 2019 -0400

    Added tests for the DatetimePicker component.

[33mcommit 2f96d5e999c71d153bc24205667a5717a7459ed2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 20 17:30:16 2019 -0400

    Changed the update_hours/minutes functions to manipulate hours_str and minutes_str based on their HourInputState and MinuteInputState respectively.

[33mcommit 7131f0a1f374175b4acdf3a8662645decd878a65[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 20 14:48:58 2019 -0400

    Working on combining the DatePicker and TimePicker components.

[33mcommit eed450870e6de9a9dfec7b0fe17dd50b2c85dba4[m
Merge: 1f64957 2237e72
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 16:00:30 2019 -0400

    Merge pull request #192 from eecs-autograder/178_instructor_files_adjustments
    
    178 instructor files adjustments

[33mcommit 2237e72485833f45556af805e957f58b46d6c510[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 6 14:41:07 2019 -0400

    Adjusted a test for the InstructorFiles component to look for a different class name.

[33mcommit 7d6ba45b5b88b81a860b0ff5cb95dbf82eea099a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 6 13:15:56 2019 -0400

    Added an icon in place of a label to toggle d_collapsed when the screen width is small.

[33mcommit 1f6495797fde9cc977d6fc5ea32f22bb4ace2d0b[m
Merge: 21ea2e9 5927d46
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 15:46:23 2019 -0400

    Merge pull request #196 from eecs-autograder/193_dull_effect_on_button_when_disabled
    
    193 dull effect on button when disabled

[33mcommit 5927d46549cd34e2ab6e28168866b10b3607ea2a[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 15:42:14 2019 -0400

    Changed color of create expected student file button to green.

[33mcommit a0d914ef5091d59f85b9eb149ec609dc24d93989[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 13 15:32:36 2019 -0400

    Changed the selector for the styles extended to the color-specified buttons to be a class selector instead of an HTML selector.

[33mcommit 8c2806f45b5e0db643b3fe4fef4c0746e869c45c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 13 15:24:55 2019 -0400

    Added back a css property that I shouldn't have deleted while rebasing 193 off of develop.

[33mcommit 78032f266f969765fab3bcc68df4d7031b46ac6a[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu May 9 16:00:33 2019 -0400

    Changed the majority of color arguments to the disabled_state mixin to use rgba + lightness.

[33mcommit 17ac185e767194678d3bafcceef8a56689412472[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu May 9 14:52:21 2019 -0400

    Added mixins to button_styles.scss for the various input states.

[33mcommit 6e3834b035410f42df8947ae3fa505b3e7486951[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 8 19:13:34 2019 -0400

    Working on making the buttons look dull when disabled, and clickable when not.

[33mcommit 21ea2e9c7607203a9de4b9ed6b13eb79bfc05896[m
Merge: c81d7e7 3fc49bd
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 15:14:57 2019 -0400

    Merge pull request #197 from eecs-autograder/116_reduce_margin_below_error_messages_in_validated_input
    
    Reduce margin below error messages in validated form?

[33mcommit 3fc49bd7076ca21a7d7fa27f9662f5c14a07fc2b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu May 9 21:23:42 2019 -0400

    Set the margin-bottom to 0 for the 'error-ul' class in the ValidatedInput component.

[33mcommit c81d7e7a0a7e3827bc36f17ed38530fd119780ee[m
Merge: 522dfa8 d36a87e
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 14:51:43 2019 -0400

    Merge pull request #195 from eecs-autograder/180_expected_student_files_adjustments
    
    180 expected student files adjustments

[33mcommit d36a87e431679d563b1404818ec5770bb97af6ee[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 14:45:53 2019 -0400

    Removed todo comment.

[33mcommit 878f93bb07d07c94230ba4b1c301b2842f465e36[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 7 15:48:30 2019 -0400

    Removed the odd_index prop from the SingleExpectedStudentFile component.

[33mcommit c2371587798caca58b8192a228d24afc705b6d1c[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 7 15:39:13 2019 -0400

    Changed the color scheme of the ExpectedStudentFiles component to be lighter.

[33mcommit ba26f47c1374a506c7fb085e34fc0e5e9f7b7724[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 7 11:03:54 2019 -0400

    Changed the color scheme for the SingleExpectedStudentFile component.

[33mcommit 522dfa833f133dfc5afabf466fd336cc2198899b[m
Merge: fa3aaf2 c4dc5b3
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 14:38:13 2019 -0400

    Merge pull request #194 from eecs-autograder/188_single_course_adjustment
    
    188 single course adjustment

[33mcommit c4dc5b32cb9ba2082d854c0e3b1d2803e3bcf421[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue May 7 13:25:17 2019 -0400

    Removed the pointer cursor from the 'toolbox' element in SingleCourse.

[33mcommit fa3aaf231e77119fc620a7ece498b3987920ff1e[m
Merge: 61fc7d3 e1697a5
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 14:29:39 2019 -0400

    Merge pull request #191 from eecs-autograder/177_tooltip_adjustments
    
    177 Tooltip Adjustments

[33mcommit e1697a592cab7271f3d1bd9dc48dc36bd7364247[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 11:41:45 2019 -0400

    Made the font-size for the tooltip smaller as well as the value assigned for border-radius. Made the font-family match that of App.vue.

[33mcommit 61fc7d3006c7af54a73592678599e719cc02f735[m
Merge: 8239448 46a9a47
Author: James Perretta <jameslp@umich.edu>
Date:   Mon May 13 14:20:19 2019 -0400

    Merge pull request #184 from eecs-autograder/182_course_view_component
    
    182 course view component

[33mcommit 46a9a4779466def732bbe7dbf8a8994c257b7fda[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 6 14:32:17 2019 -0400

    Split a line that was too long in the CourseView component.

[33mcommit deb70d0e079b7f909fe9f0125ff6b6f4303681e7[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon May 6 14:30:42 2019 -0400

    The CourseView component now uses a table to display the project links.

[33mcommit 744876bf11585aeacb2729f4209d46eadac1c457[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 19:48:54 2019 -0400

    Added a minimum width to the element with class 'project'.

[33mcommit 2f08ebcb149c95eb7c23676b5a5235a541327d45[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 18:55:28 2019 -0400

    Added the CourseView component and tests for the CourseView component.

[33mcommit 823944869ceba4cd69a6192ad6b5f960b865f80d[m
Merge: ff48bb4 22d2a0d
Author: James Perretta <jameslp@umich.edu>
Date:   Thu May 2 15:02:35 2019 -0400

    Merge pull request #185 from eecs-autograder/179_course_admin_adjustments
    
    179 course admin adjustments

[33mcommit 22d2a0dc1ceaebdc063106c1d5dfbcca9aabdd26[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 18:06:30 2019 -0400

    Removed the border added to the validated inputs in the CourseSettings component because it was the same as the default border styling.

[33mcommit 7ccbc45f94977bbd7d685fd141c9b3f26708bf92[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 17:48:01 2019 -0400

    Restyled the roster table to look like the group extensions table from EditGroups. Removed the part of the 'empty-roster-message' that included an instruction that assumed the user had access to a visual layout of the page.

[33mcommit 2a7674f829a4eee8ed5b6fab5c15ed519054dbad[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed May 1 11:59:57 2019 -0400

    Moved the 'add project' button inside of the ValidatedForm associated with the new_project name ValidatedInput. Adjusted the test cases to trigger submit on the form instead of clicking on the 'add project' button.

[33mcommit ff48bb4f40a9ecde0bbf780ea973f901064125e3[m
Merge: 11a6b65 21b6b62
Author: James Perretta <jameslp@umich.edu>
Date:   Thu May 2 14:20:02 2019 -0400

    Merge pull request #176 from eecs-autograder/175_course_list_adjustments
    
    175 Course List Adjustments

[33mcommit 21b6b629fc7664016d78799b426c7b574e0f5cdf[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 30 11:35:28 2019 -0400

    Changed the name of the class of the SingleCourse component to be 'SingleCourse'. Added a div inside the edit-course-settings link in SingleCourse and applied padding to that to make the clickable area larger.

[33mcommit 11a6b65d566905c21672bd2528509bcf1b9d101f[m
Merge: c4d7532 f397cc1
Author: James Perretta <jameslp@umich.edu>
Date:   Thu May 2 14:09:22 2019 -0400

    Merge pull request #163 from eecs-autograder/114_group_lookup_component
    
    114 group lookup component

[33mcommit f397cc15ac73efb0a33f5f9804b74e26e6524ec2[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu May 2 14:00:31 2019 -0400

    Removed uneeded matchMedia mocking in group lookup tests.

[33mcommit 312a3a0f4d211d46ed7a18716bcb87be24a8847e[m
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Apr 30 17:53:10 2019 -0400

    Updated dropdown typeahead so that the 'no results' message shows when choices is empty and the user clicks on the text input.
    Removed the group lookup demo and other unused demos.
    Added an exampe to the dropdown typeahead demo with an empty choices array.

[33mcommit f41184d17efdec77aff4816f94696f7335a3bb4f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 17:49:07 2019 -0400

    Removed the search-bar-label (class and corresponding element) from the GroupLookup component.

[33mcommit dfaf0f65e6782e0994d88e7bbeddd7d1ac986d2e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 17:45:55 2019 -0400

    Removed the project prop from the GroupLookup Demo.

[33mcommit 593c1ad35c1103da73960b207639de305b004899[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 23 17:35:50 2019 -0400

    Removed the ValidatedInput import from the GroupLookup component.

[33mcommit 44cc9a6f2104dfdf144d34543569e592fa71e866[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 15 13:18:17 2019 -0400

    Removed async from 'created' function in GroupLookup.

[33mcommit 724313aa3f4738ab17904dd6bc56a2cdb3925287[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 12 22:28:41 2019 -0400

    Added tests for the dropdown_typeahead to test 1) when choices is an empty array, 2) that clear_filter_text behaves as expected.

[33mcommit f036aa6105122bc93989e9d9f74ff50130ef6158[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 12 20:38:12 2019 -0400

    Updated ag-client-typescript to version 0.0.0-dev.14. Imported 'Group' in the GroupLookup component.

[33mcommit 520a7fcafd494c711903ce6c12a1f966dd009bff[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 8 18:59:04 2019 -0400

    Removed the portion of the html template in the GroupLookup component that displayed the selected group.

[33mcommit 10f622fe0a11c088c6b4b3dafb3fbf14ac2a337e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Mar 14 13:14:40 2019 -0400

    Added a validated input component to the group_lookup component to be displayed when the group is being edited.

[33mcommit 9010a7ceb0de4b559b7398c0f28aef38ad09e5b6[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 13 17:58:04 2019 -0400

    Added some tests for the GroupLookup component.

[33mcommit cdc292a39d831578ccd02e9460c6f528deaad2f1[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 13 16:52:13 2019 -0400

    Working on a design for the GroupLookup component.

[33mcommit c4d7532694798f1710b667f7fd1f4bf7e161276a[m
Merge: 0f6f2d9 5fd5bac
Author: James Perretta <jameslp@umich.edu>
Date:   Tue Apr 30 16:29:37 2019 -0400

    Merge pull request #167 from eecs-autograder/array_set
    
    Implemented ArraySet data structure

[33mcommit 5fd5bacf0d34afeaa03cb6d5a3aa6e8e7f8fbcba[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Apr 20 19:57:58 2019 -0400

    Changed ArraySet.data to be a ReadonlyArray and added an internal property for casting to a mutable array.
    This lets us more easily enforce that users aren't supposed to modify ArraySet.data.

[33mcommit 0af06bece2bcbc9b26ffe9a70abb5677bbbe7f28[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Apr 20 19:50:36 2019 -0400

    Switched to ArraySet in file_upload.vue for d_files.

[33mcommit 00345cf85fc4647ceb7c17e3e4bfd088ea93654d[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Apr 20 19:14:22 2019 -0400

    Switched to ArraySet in file_upload.vue for d_empty_filenames.

[33mcommit 62ebb690c6a4920c362ebc5ca10d43c3a0b6341a[m
Author: James Perretta <jameslp@umich.edu>
Date:   Sat Apr 20 18:58:15 2019 -0400

    Implemented ArraySet container class.

[33mcommit 0f6f2d95624aeb9c373af15fa92552a53809ec50[m
Merge: 5eff2dd b2b6a9b
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:42:32 2019 -0400

    Merge pull request #162 from eecs-autograder/103_expected_student_files_new_branch
    
    103 expected student files component in project admin

[33mcommit b2b6a9bc5f3b714dfddb0068bccb9fc72eaea7e2[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:37:59 2019 -0400

    Finished rename of actively_updating -> editing in tests.

[33mcommit dfeb08d232d19e221302a561e557ec53b8901616[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:31:12 2019 -0400

    Tweaked the "update" and "cancel" buttons in SingleExpectedStudentFile edit mode.
    Renamed the "update" button to "save".
    Swapped the positions of the button (save is on the left now).
    Substituted the hsl colors used for green button in button_styles.scss to use the green defined in colors.scss (the colors remain the same).
    Added a white button style to button_styles.scss and made the cancel button white.

[33mcommit 53d532013130628ca14da45e07fc3a684515755c[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:14:38 2019 -0400

    Renamed SingleExpectedStudentFile.delete_pattern_permanently() to delete_expected_student_file().
    Also made some minor formatting changes.

[33mcommit b240d8c9ce7794819c55a555875b5dcc83edf6e6[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:04:00 2019 -0400

    Renamed SingleExpectedStudentFile.actively_updating to editing.

[33mcommit 170e9977115e8462deb3a7f056a4f05fbd1c81ee[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 22 21:01:30 2019 -0400

    Renamed ExpectedStudentFileForm.reset_expected_student_file_values() to reset().
    Made some minor formatting changes.

[33mcommit 20bec99f46b0bff5219c73c5104fa43fff1d5a38[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 12 20:15:41 2019 -0400

    Added the ExpectedStudentFiles component to ProjectAdmin. Stubbed ExpectedStudentFile.get_all_from_project in test_project_admin.ts.

[33mcommit 3ab545925d34ed5e8befcf26ad8acb5db56cfe65[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 12 18:25:26 2019 -0400

    Put each import back on a single line, (for the imports relating to the expected_student_file components).

[33mcommit 2b23b572a7248380e67c6453a76911820deee5e4[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 11 15:09:55 2019 -0400

    Set d_expected_student_file to an ExpectedStudentFileFormData with default arguments on initialization in the ExpectedStudentFileForm component.

[33mcommit 07f69ad38219a2f566217b7ef48aba92d98eba85[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 11 14:10:38 2019 -0400

    Added the non-null assertion operator to d_expected_student_file in both the SingleExpecteStudentFile and ExpectedStudentFileForm components.

[33mcommit 2a0448953a2bfb33806fc5db9bdb3993619f3b2e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 8 12:34:55 2019 -0400

    Updated styles of elements in the delete file modal in SingleExpectedStudentFiles component.

[33mcommit f4afbf463f8500d62c4731a4eb37f6a40fedc7ff[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 5 20:29:37 2019 -0400

    Added a test to test_expected_student_files.ts and fixed the test case involving editing a file.

[33mcommit b88967a4ad86888f3e68b88a12a65383712e85a2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 5 18:45:59 2019 -0400

    Working on the expected_student_file_tests.

[33mcommit 920d0490e74b7c5c48e33f3ed4181c87a7ce6955[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Mar 26 16:12:32 2019 -0400

    Updated the test case involving deletion of a file in test_expected_student_files.ts.

[33mcommit 79e537d740a01234dda236bfb7143bc5c9688d98[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Mar 26 15:13:57 2019 -0400

    Added tests to test_single_expected_student_file to test an invalid edit, and the watcher on expected_student_file.

[33mcommit c096780060be48fd4051439312d94c605a704d58[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Mar 22 21:37:11 2019 -0400

    Working on implementing the expected_student_files tests without errors.

[33mcommit ed162f9af78d5b79457366080be4d02515b02d35[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Mar 22 15:03:51 2019 -0400

    Filled in the tests for the ExpectedStudentFileForm component. Most do not pass due to a RangeError: 'Maximum call stack size exceeded'.

[33mcommit 1cd0680486076413d5cc61c31b60b5b6bbad7d09[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Mar 22 13:30:05 2019 -0400

    Removed the on_form_validity_change prop from ExpectedStudentFileForm component and changed the form_validity_change event to emit an event itself.

[33mcommit 88f353f8a822ce61e4cde2e94ede54cb3443979d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Mar 21 17:35:16 2019 -0400

    Started to test the ExpectedStudentFileForm component.

[33mcommit 248115879eb33b012e53775b24e88412de1ab53d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Mar 21 15:32:41 2019 -0400

    Changed the type of the expected_student_file data member to be 'ExpectedStudentFileFormData' in the ExpectedStudentFileForm component.

[33mcommit cf8ccc6cb81f7d0a5964630138e71fe08864bbdf[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Mar 21 11:13:13 2019 -0400

    Added the APIError component to the CreateExpectedStudentFile and SingleExpectedStudentFile components.

[33mcommit 5a1c84bccc0ec881286622a896001215997666ab[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 20 17:06:16 2019 -0400

    Created the expected_student_file_form.

[33mcommit 17bda5a80423b9e59573130c8a9a249a30f782df[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Mar 19 14:44:55 2019 -0400

    Added watcher for wildcard_is_present in the create_expected_student_file_component. Started to swap out patch methods for sinon methods.

[33mcommit f4a40aad56d6be1e56323afcb4a0726f0e64dbb2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Mar 15 21:29:23 2019 -0400

    Started to implement tests for the create_expected_student_file component.

[33mcommit 24a862a35b5652d2108c9bcee60b9d469a8184a6[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Mar 15 20:12:13 2019 -0400

    Added the ExpectedStudentFile http methods to the SingleExpectedStudentFile component.

[33mcommit 5eff2dd09d132947cc3a4370a1b507a58bb596f0[m
Merge: 5d72f92 4df4970
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:59:16 2019 -0400

    Merge pull request #159 from eecs-autograder/158_project_view_skeleton
    
    158 project view skeleton

[33mcommit 4df4970b3d13e80a04b3c80fa41a60964727c76e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 16:57:24 2019 -0400

    Fixed typo in value assigned to current_tab in test_project_submission.ts.

[33mcommit 83504b150bbe8b95504b834b00c44ff7301497ca[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 14:23:46 2019 -0400

    Added tests for the ProjectSubmission component revolving routing.

[33mcommit 5edc488891a7a6ac3f9a8a7b8f4cbed584be63c2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 10:19:47 2019 -0400

    Added the skeleton of the ProjectSubmission component.

[33mcommit 5d72f923595b498e99faa855b9e73e62d27c072e[m
Merge: d0ecf61 39fd286
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:52:42 2019 -0400

    Merge pull request #157 from eecs-autograder/144_remove_text_highlighting_from_clone_courses_modal
    
    144 remove text highlighting from clone courses modal

[33mcommit 39fd2867ef56f0c682b4ffc5432a61f49b8eaa36[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:48:45 2019 -0400

    Changed the text on the clone course button from 'Create Course' to 'Clone Course'

[33mcommit 357753fff7bcbb8ed525a3553850d5861453fc9b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Fri Apr 5 14:10:00 2019 -0400

    Fixed the styling of the 'Add to Roster' button in the Roster component.

[33mcommit d4411fba5f9d8f154be7995a316c33f12d9493de[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 16:37:46 2019 -0400

    Swapped the input element of type=submit out for a button of type submit in the SingleCourse component. Removed the background color from the modal header in both the clone course modal and clone project modal, and turned the name of the item to be cloned -blue.

[33mcommit d0ecf6103aca7a6b553bc040afb1de1f1b0c403e[m
Merge: 4dcf8e2 fe52585
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:43:07 2019 -0400

    Merge pull request #156 from eecs-autograder/147_add_instructor_files_component_to_appropriate_tab_in_project_admin
    
    147 add instructor files component to appropriate tab in project admin

[33mcommit fe52585edcaa3baf84b496394b081ab625fcfd30[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:37:53 2019 -0400

    Squashed commits:
    - Added the InstructorFile component to the projectAdmin component.
    - Added mock stubs for InstructorFile api methods to test_project_admin.ts.

[33mcommit 4dcf8e212d1683fd6e7feb163174344d3a26dd1d[m
Merge: 0f7b0f3 30197c6
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:26:13 2019 -0400

    Merge pull request #161 from eecs-autograder/move_instructor_files_component
    
    Move instructor files component

[33mcommit 30197c65438055e1ec8015d735a0353c5d55bfe6[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:15:40 2019 -0400

    Replaced some relative imports with absolute ones. Fixed some import ordering.

[33mcommit 8f27d2fb01497c1dd5a3f8e649b957700e33d861[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:07:05 2019 -0400

    Updated line length checker to be able to ignore imports.

[33mcommit 7e45643714337dbe554ac9c79f74f88ba48e6182[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 19:43:00 2019 -0400

    Moved instructor files components into project admin folder.

[33mcommit 0f7b0f31b11b191b0100525ad1779fd444d129da[m
Merge: 2f2e799 55408b0
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 20:19:31 2019 -0400

    Merge pull request #160 from eecs-autograder/sidebar_with_menu_toggle
    
    Added toggle menu button to UI demos

[33mcommit 55408b0889e7bda2558fadce98e43f13b44d7320[m
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 19:56:26 2019 -0400

    Wrapped line that was too long.

[33mcommit ed8d130586bc31b8852c6977cd1db58d2edbd1d6[m
Author: James Perretta <jameslp@umich.edu>
Date:   Fri Apr 5 14:37:01 2019 -0400

    Added independent column scrolling to UI demos.
    Also removed hello_world.ts.

[33mcommit a81457e89ca65d57952441f8f36b8d1e93e87951[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 18:11:28 2019 -0400

    Experimenting with adding a toggle menu button to the UI demo.

[33mcommit 2f2e79915d5ab43e7effa2335c0e3710d20ca505[m
Merge: 63b9dee d9f8167
Author: James Perretta <jameslp@umich.edu>
Date:   Mon Apr 8 11:21:37 2019 -0400

    Merge pull request #155 from eecs-autograder/139_remove_wrapper_exists_print_statements_from_tests
    
    Removed the 'wrapper exists' print statement from test_single_course.ts.

[33mcommit d9f8167cbe2d997bec512aec2ee5a65d9ef20af2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 17:06:48 2019 -0400

    Removed the 'wrapper exists' print statement from test_single_course.ts.

[33mcommit 63b9dee6a04bd32349a0e1493042b0b7a52003ec[m
Merge: 00282b9 a1cf5a2
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 16:24:49 2019 -0400

    Merge pull request #133 from eecs-autograder/117_switch_to_sinon_for_mocking_course_list
    
    117 switch to sinon for mocking course list

[33mcommit a1cf5a2370f01039af43a6d4251be49be47a4df2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 16:58:04 2019 -0400

    Added sinon to both test_course_list.ts and test_single_course.ts.

[33mcommit 00282b9ea3ffc61f181323d5536afe1435245ff6[m
Merge: ae3f085 c7a51a4
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 16:21:03 2019 -0400

    Merge pull request #136 from eecs-autograder/117_switch_to_sinon_for_mocking_roster
    
    117 switch to sinon for mocking roster

[33mcommit c7a51a4a0ba2528b23fcfa7318374c14ad10a352[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 11:00:28 2019 -0400

    Added sinon to test_student_roster.ts.

[33mcommit ad4d02909f2f003038531b2e4455b882f8ec6a8f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 10:51:50 2019 -0400

    Added sinon to test_staff_roster.ts.

[33mcommit 69856f126316f06f82959d13c47d75631a794b84[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 10:42:45 2019 -0400

    Added sinon to test_handgrader_roster.ts.

[33mcommit 43e203268981c8e04ccc4571d58958137fd1272e[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 10:30:26 2019 -0400

    Added sinon to test_admin_roster.ts.

[33mcommit ae3f0850c3110f1ee7fa71727c48f2958c2e9c07[m
Merge: 9039a59 c4a94f3
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 16:16:52 2019 -0400

    Merge pull request #137 from eecs-autograder/117_switch_to_sinon_for_mocking_course_settings
    
    Added sinon to test_course_settings.ts.

[33mcommit c4a94f31e69eeb8139c0a45e8213a885374daff9[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 12:23:55 2019 -0400

    Added sinon to test_course_settings.ts.

[33mcommit 9039a59d15075ec06b91c1aa63e29112b1747c4f[m
Merge: c0dedd9 75613bd
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 16:02:54 2019 -0400

    Merge pull request #152 from eecs-autograder/side_tabs_and_demo_url
    
    Sidebar tabs and UI demo route

[33mcommit 75613bdaf6f32e7249adb8710e10eaaa6c5c5895[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:57:46 2019 -0400

    Removed some commented-out css and blank lines.

[33mcommit 2534ed22aad0a697c85206c6efa517eb1a4b18eb[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:38:09 2019 -0400

    Added snapshot test for sidebar tabs.

[33mcommit 5a336d7f2d4cb854af6729edbe3638b506baba51[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:25:19 2019 -0400

    Added test case to cover tab_position=side

[33mcommit b8872f893dab48b6b5bccd4ff440f8f48f330ddc[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:19:28 2019 -0400

    Removed test_hello_world.ts

[33mcommit eb03f869dfdc435567f33d51b418b6bdeaa0451d[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:13:53 2019 -0400

    Styled the sidebar in the UI demo.
    Added box-sizing: border-box; to file upload component.

[33mcommit 1dc740037937b10bf5f6323a2c01f22f3853fd46[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:12:38 2019 -0400

    In "side" mode for tabs, made the sidebar have sticky positioning.
    Added class hooks for the tab headers container and the teb body container in tabs component.

[33mcommit 2153f280071d1885b2e04c87c6cedd8c2c7c6606[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Mar 27 21:29:46 2019 -0400

    Renamed and moved HelloWorld component to UIDemos. Started working on an option in the tabs component to display the tabs as a sidebar.

[33mcommit c0dedd987e05237e007acccee50ecc2ef0e117b5[m
Merge: 5f115f3 a8cc14a
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:53:38 2019 -0400

    Merge pull request #148 from eecs-autograder/117_switch_to_sinon_for_mocking_context_menu
    
    117 switch to sinon for mocking context menu

[33mcommit a8cc14ae9cdde3a42eaca85fc33322c5813f788d[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Thu Apr 4 11:40:09 2019 -0400

    Made d_height_of_menu and d_width_of_menu public in the ContextMenu component in order to stub them in tests.

[33mcommit 856308329ae6c4472f51d52fa8b45947175e4cbc[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 18:05:44 2019 -0400

    Added a fake for recording wheel events in a test in test_context_menu.ts.

[33mcommit 30c8b857f79997d6114a8a21bfcbfc2905166744[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 16:50:09 2019 -0400

    Added sinon to test_context_menu.ts.

[33mcommit 5f115f3350d194a250dd152dd7ba433d278879fc[m
Merge: 1139e5f 05f4726
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:48:04 2019 -0400

    Merge pull request #149 from eecs-autograder/117_switch_to_sinon_for_mocking_file_upload
    
    117 switch to sinon for mocking file upload

[33mcommit 05f47260711be289cd94b767b47d788f25426cb6[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 16:03:04 2019 -0400

    Updated ag-client-typescript to version 0.0.0-dev-13.

[33mcommit 26691f23584f4d25748736947b9e264d0f3d21b7[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Apr 3 13:34:30 2019 -0400

    Added sinon to test_file_upload.ts.

[33mcommit 1139e5fdf65487061abe753fc34305d88978642a[m
Merge: 1a39f9c fc0b18b
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 15:08:23 2019 -0400

    Merge pull request #151 from eecs-autograder/run_tests_python36_require
    
    Made python 3.6 explicitly required for run_tests.py.

[33mcommit fc0b18b82d2589204cc977be492e934683adef96[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Apr 4 14:34:05 2019 -0400

    Made python 3.6 explicitly required for run_tests.py.

[33mcommit 1a39f9c6c61330783101bf63382c56f848fceaf5[m
Merge: 47f101d 08d29cb
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Apr 3 21:39:53 2019 -0400

    Merge pull request #128 from eecs-autograder/121_project_admin
    
    121 project admin skeleton

[33mcommit 08d29cbc6a550e4e9480c1c09bd5ab99414039d2[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Apr 3 21:37:01 2019 -0400

    Commented out the HelloWorld tag in App.vue. Removed some extra newlines form test_project_admin.ts.

[33mcommit edf95c6a05005d55217273fe6da4d410f13a0a45[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 15:06:44 2019 -0400

    Added more tests for the ProjectAdmin component that focus on the current_tab query key and the possible values associated with it.

[33mcommit f05e2eebf949ba54682ecb50323520db216f7f9f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 13:32:36 2019 -0400

    Added a comment for tslint to ignore the naming convention with regards to the localVue variable in test_project_admin.ts.

[33mcommit 1f9837e800f23de6dc649f6746b311e2f5b09d63[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 11:23:10 2019 -0400

    Removed the break statements in the final clauses of the switch statements in ProjectAdmin.

[33mcommit 4a06115ea693178476a769975d79d6a58e133ea9[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 11:21:27 2019 -0400

    Added 'current_tab' information for routing to the ProjectAdmin component.

[33mcommit b8b6e17722c6f55cef55a52fcc31b4fcb6c91962[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 27 17:23:02 2019 -0400

    Deleted a console.log statement from the ProjectAdmin component.

[33mcommit 1d74f45a1e725ea97bb2b91b01c95760fcb7e046[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 27 17:21:49 2019 -0400

    Added tests for the ProjectAdmin component.

[33mcommit 84b66a83e68096be64ffa9af932a73912debdfbf[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 27 16:55:47 2019 -0400

    Fixed error regarding Project.create() in the ManageProjects component.

[33mcommit 18ea437b468c1cb0c73217f39123b8d3f7d8f23f[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 27 16:38:05 2019 -0400

    Created the ProjectAdmin component and added it to the list of Routes in main.ts.

[33mcommit 47f101deefcfc322ef7d0191b7f06a868e1a1ea0[m
Merge: 273d1c5 919e2be
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Apr 3 21:18:40 2019 -0400

    Merge pull request #130 from eecs-autograder/120_add_current_tab_info_to_url_for_course_admin
    
    Added tests to test_course_admin.ts to test current tab info in the page URL

[33mcommit 919e2be9e9e5a881a8d4926a7b2454687501e1d9[m
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Apr 3 20:52:31 2019 -0400

    Removed comment about describe block ordering in test_course_admin.ts, as it doesn't appear to be a reproducible issue.

[33mcommit 49ce4de2c1d9f9eb3dbef035c17db4fa198c0fc6[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Tue Apr 2 13:30:34 2019 -0400

    Stopped propagation of the click event from the dropdown menu in the Dropdown component.

[33mcommit 5144557266c821bca1ff6538b319e3028361a7b4[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 1 16:48:53 2019 -0400

    Added a message about the inconsistency of success with regards to the 'Changing Tabs' test suite in test_course_admin.ts.

[33mcommit 804327eade71b1282fe9743c48ae98b8ed3a0d59[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 1 16:38:34 2019 -0400

    Removed the 'roster' import from test_course_admin.ts

[33mcommit 543499d80df25e4334870125c87e732dfe317af2[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Mon Apr 1 16:21:43 2019 -0400

    Added tests to test_course_admin.ts to test the new routing related functionality added to the CourseAdmin component.

[33mcommit 273d1c5a95c652ca20236aa1fef435623bb91c79[m
Merge: 5a0c083 f2fb603
Author: James Perretta <jameslp@umich.edu>
Date:   Wed Apr 3 20:48:53 2019 -0400

    Merge pull request #106 from eecs-autograder/80_upload_instructor_files
    
    80 upload instructor files

[33mcommit f2fb6031e1d3eb2d44631117ac6f15c52c8398a4[m
Author: James Perretta <jameslp@umich.edu>
Date:   Thu Mar 28 16:18:45 2019 -0400

    Replaced setData with setProps to prevent Vue warning about mutating props.

[33mcommit 0c79db206ad57e0b3761eacd3dee3eeb65951c7b[m
Author: Ashley Berg <ashberg@umich.edu>
Date:   Wed Mar 27 15:21:33 2019 -0400

    Fixed the errors in the ViewFileDemo regarding Promise.resolve(string) for the file_contents prop.
