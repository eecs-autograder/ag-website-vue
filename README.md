# AG Website
The website frontend for autograder.io, implemented using Vue and Typescript.
For information about contributing to Autograder.io, see our
[contributing guide](https://github.com/eecs-autograder/autograder.io/blob/master/CONTRIBUTING.md).

## Setup
Follow the [dev stack setup tutorial](https://github.com/eecs-autograder/autograder-full-stack/blob/master/docs/development_setup.md) for the [autograder-full-stack repo](https://github.com/eecs-autograder/autograder-full-stack).

## Dev commands
The unit tests currently support Node.js version 16 (newer versions may work too).
You can install this version with [NVM](https://github.com/nvm-sh/nvm/blob/master/README.md)
by running:
```
nvm install 16
```

To run the unit tests (with coverage):
```
npm test
```

To run linters (eslint, Prettier, type checking, etc.):
```
npm run lint
npm run build
```

## Coding Standards
In addition to the items listed here, all source code must follow our
[Typescript/Vue coding standards](https://github.com/eecs-autograder/autograder.io/blob/master/coding_standards_typescript_vue.md).

We are in the process of formatting the codebase using Prettier.
At this time, only apply Prettier to the following:
- New test cases wrritten with Cypress
- New components written using the composition API
- Components being converted to use the composition API
Add the names of such files to the Prettier and eslint commands in static_analysis.bash.

- HTML/CSS
    - Prefer classes to id's unless you can guarantee that only one element
      with the id will exist at a time.
        - Prefer using nested or otherwise more specific CSS class selectors
          when you need to override some imported style.
    - Use skewer-case for class and id names.
    - Avoid adding a class or id solely for the purpose of being able to
      select an element in test cases. Prefer to use a `data-testid=xxx` attribute
      and `wrapper.find('[data-testid=xxx]')` for this purpose. Use snake_case for
      `data-testid` values.
- Copying objects in components
    - If a component needs to modify the members of an object passed as input
      via `@Prop`, make a deep copy of that object and modify the copy.
    - Similarly, if a component does NOT need to modify members of an `@Prop`
      input, do NOT copy the object.
    - When receiving a new or updated object from an observer `update_` function,
      make a deep copy of the object.
    - Use the `deep_copy` function in `src/utils.ts` to make deep copies of
      class instances that have a constructor and/or member functions. For other
      objects, `JSON.parse(JSON.stringify(...))` is the preferred approach.
