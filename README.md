# AG Website (Vue)
A re-implementation of autograder-website using Vue.

## Setup
First, install Docker Community Edition: https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1

Then, clone the repo, install dependencies, and build the Docker images. 
```
git clone --recursive https://github.com/eecs-autograder/ag-website-vue.git
cd ag-website-vue
npm install
docker-compose build
```

## Dev commands
To run the dev server (runs on localhost:8080):
```
docker-compose up -d
```

To run the unit tests (with coverage):
```
npm test
```

## Coding Standards
Run `npm run build` to check for style issues using TSLint. All code must be free of TSLint errors.
Note: Not all of the items below are enforcable with TSLint, but they must still be followed.

- Indentation:
    - Indent using 2 spaces in .vue, .html, and .yml/.yaml files.
    - Indent using 4 spaces in .json, .js, .ts, and .md files.
        - Note that npm will overwrite the formatting to 2 spaces on package.json when you use `npm install --save <package>`. Don't bother trying to format package.json yourself.
    - Since .vue files have typescript, html, and css in them, we will use 2 spaces for all of their contents. HTML benefits the most from 2-space indentation.
    - In Vue single-file components, indent one level inside the `<template>` tag, but not in the `<script>` or `<style>` tags.
        
        **Yes:**
        ```
        <template>
          <div>...</div>
        </template>
        
        <script lang="ts">
        @Component
        class MyComponent { ... }
        </script>
        
        <style scoped lang="scss">
        .my-class { ... }
        </style>
        ```
    
        **No:**
        ```
        <template>
          <div>...</div>
        </template>
        
        <script lang="ts">
          @Component
          class MyComponent { ... }
        </script>
        
        <style scoped lang="scss">
          .my-class { ... }
        </style>
        ```
- Use Java/"Egyptian" style curly braces. (Opening braces are on the same line as the class/function/loop/conditional/try-catch they start, closing braces are on their own line):
    ```
    class Spam {

    }

    function egg() {

    }

    if (true) {

    }
    else {

    }

    while (true) {

    }
    ```
    - Note: eslint and tslint-eslint-rules incorrectly refer to this brace style as "Stroustroup".
- Lines of code should be no longer than 100 characters.
- Names:
    - Use `snake_case` for variable, function, method, and file names.
    - Do not start names with a leading underscore. Vue reserves these names for its implementation, and collisions can cause bugs that are hard to diagnose.
    - Start all Vue "data" members (declared as default-initialized member variables in Typescript component classes) with a leading "d_".
        - These members that start with "d_" should only be accessed by the component itself and the test cases for that specific component. If possible, add a property getter and make the data member private.
        ```
        @Component
        class MyComponent {
            // Input to the component
            @Prop({default: True, type: Boolean})
            is_on!: boolean;

            // Use this in the component and test cases (we have an input
            // called is_on, so we can't add a property getter).
            d_is_on = false;

            // Since there's no input with this name, we can use a property
            // getter.
            get gettable_property() {
                return this.d_gettable_property;
            }

            // Since we have a property getter, we can make this private.
            private d_gettable_property: string = '';
        }
        ```
        - If you're writing a component to use **only** for testing (and the component is defined in the same file as the test cases), you may ignore this convention.
        - Rejected alternatives:
            - Leading underscore: Vue reserves names starting with a leading "_" for its implementation.
            - $data.\<member_name\>: Accessing data members through $data loses type information.
            - Trailing underscore: A single trailing underscore is to easy to miss visually.
    - Use `PascalCase` for class, enum, and type names.
    ```
    class SpamEgg {}
    type MyAlias = SpamEgg;
    enum AnEnum {
        val_one = 'val_one',
        val_two = 'val_two
    }
    ```
    - Use UPPER_CASE for global constants or static readonly class variables.
    ```
    const MY_CONST = 42;
    class Spam {
        static readonly CLASS_VAR = 43;
    }
    ```
    - When an imported function, class, enum, etc. needs to be made available to a component
      template, add a readonly variable with the same name to the class.
    ```
    import { MyEnum, my_func } from 'utils'; 
    @Component
    class MyComponent {
        readonly MyEnum = MyEnum;
        readonly my_func = my_func;
    }
    ```
    
- When wrapping a line at an operator, break _before_ the operator:
```
// Yes
if (spamspamspamspamspam
    && egg) {
    ...
}

// No
if (spamspamspamspamspam &&
    egg) {
    ...
}
```
- If the first statement of an `if` block is indented to the same level as the wrapped condition, indent the wrapped condition an extra level.
    - Note: This is only an issue in files where indentation is 4 spaces.
```
if (spamspamspamspamspam
        && egg) {
    do_something();
}
```
- When wrapping a chained function call, prefer to break after the opening parenthesis, placing the closing parenthesis on a new line after the function arguments:
```
// Yes
function_one(
    arg1, arg2
).function_two();

// Avoid
function_one(arg1, arg2)
    .function_two();
```
- When a closing brace, bracket, or parenthesis is on its own line, align
it with the first character of the line that starts the multiline construct:
```
let my_list = [
    'spam',
    'egg',
    'waluigi,
];
```
- Imports
    - In imports, you may use `./` to import from a module in the same directory as the current one.
    - Avoid using `../` relative imports. Prefer an absolute import in those cases.
    - To use an absolute import of a module in the `src` folder, begin the import with `@` (also works for scss imports):
    ```
    // There is a mapping defined in tsconfig.json so that we can say
    // "@" instead of "src".
    import { spam } from "@/my/module";
    ```
    - Similarly, absolute imports in the `test` folder should begin with `@/tests`:
    ```
    // "@/tests" is mapped to "tests" in tsconfig.json.
    import { egg } from "@/tests/utils";
    ```
    
    - Group imports in the following order:
        - Vue libraries whose paths start with 'vue'
        - Vue libraries whose paths start with '@vue'
        - 3rd-party libraries 
        - Imports from this project
        - Imports from this project's `@/test` directory.
        - Parent directory relative imports
        - Current directory relative imports.
    - Separate each group with a blank line.
    - Note: TSLint will enforce these rules.
