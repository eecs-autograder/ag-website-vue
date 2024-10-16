# AG Website
The website frontend for autograder.io, implemented using Vue and Typescript.
For information about contributing to Autograder.io, see our
[contributing guide](https://github.com/eecs-autograder/autograder.io/blob/master/CONTRIBUTING.md).

## Setup
Follow the [dev stack setup tutorial](https://github.com/eecs-autograder/autograder-full-stack/blob/master/docs/development_setup.md) for the [autograder-full-stack repo](https://github.com/eecs-autograder/autograder-full-stack).

## Dev commands
### Run all tests
To run all tests, Node.js version 16 is **required**. Newer versions will not work.
You can install this version with [NVM](https://github.com/nvm-sh/nvm/blob/master/README.md)
by running:
```
nvm install 16
```

To run both component tests and e2e tests:
```
npm test
```

To run linters (eslint, Prettier, type checking, etc.):
```
npm run lint
npm run build
```

### Unit tests
The unit tests currently **require** Node.js version 16. Newer versions will not work.
See above about installing this version.

To run the unit tests (with coverage):
```
npm run component
```

### e2e tests
The e2e tests currently require at least Node.js version 16. Newer versions may work.
See above for installing this version.

To run the e2e tests with a headless browser:
```
npm run e2e
```

To open a full browser from which you can run e2e tests:
```
npm run e2e:browser
```

Both of these npm scripts will start a backend server for the website to interact with and
shut it down once the tests are complete. If you don't want to wait for the app to compile
each time you run the tests, you can alternatively start the backend manually and leave
it running while you run the tests. If you do this, changes to the source code will automatically
cause the app to recompile but it will be much faster than compiling everything from scratch.

```
# start backend
npm run e2e:serve

# in a different terminal, or if you ran the serve script as a background process...
npm run e2e:cy:run

# or to open in a browser...
npm run e2e:cy:open
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
