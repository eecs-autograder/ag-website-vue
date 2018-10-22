# AG Website (Vue)
A re-implementation of autograder-website using Vue.

## Setup
```
git clone --recursive https://github.com/eecs-autograder/ag-website-vue.git
cd ag-website-vue
npm install
```

## Dev commands
To run the dev server (runs on localhost:8080):
```
npm run serve
```

To run the unit tests (with coverage):
```
npm test
```

## Coding Standards
When `npm run serve` is running, it will check for style issues using tslint. All code must be free of tslint errors.

- Indentation:
    - Indent using 2 spaces in .vue, .html, and .yml/.yaml files.
    - Indent using 4 spaces in .json, .js, .ts, and .md files.
        - Note that npm will overwrite the formatting to 2 spaces on package.json when you use `npm install --save <package>`. Don't bother trying to format package.json yourself.
    - Since .vue files have typescript, html, and css in them, we will use 2 spaces for all of their contents. HTML benefits the most from 2-space indentation.
- Use Java/Egyptian style curly braces. (Opening braces are on the same line as the class/function/loop/conditional/try-catch they start, closing braces are on their own line):
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
    - Start non-public names with a single leading underscore.
    - Start Vue "data" members (declared as default-initialized member variables in Typescript component classes) with a leading "d_".
        - Note: If a data member is publically accessible and modifiable, you do not need to use this naming convention.
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
    - In Vue (with vue-class-component), private member variables and member variables starting
      with a leading underscore are not registered as data members. If you need to distinguish
      between the name of an input property and its corresponding internal data member, you may
      add a trailing underscore to the data member name:
    ```
    class Diff extends Vue {
        @Prop({default: false, type: Boolean})
        show_whitespace!: boolean;

        show_whitespace_: boolean = false;
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
    - To use an absolute import of a module in the `src` folder, begin the import with `@`:
    ```
    // There is a mapping defined in tsconfig.json so that we can say
    // "@" instead of "src".
    import { spam } from "@/my/module";
    ```
        - Note: This same method works for scss imports.
    - Similarly, absolute imports in the `test` folder should begin with `@/tests`:
    ```
    // "@/tests" is mapped to "tests" in tsconfig.json.
    import { egg } from "@/tests/utils";
    ```
