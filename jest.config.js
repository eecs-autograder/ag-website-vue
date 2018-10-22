module.exports = {
    moduleFileExtensions: [
        'js',
        'jsx',
        'json',
        'vue',
        'ts',
        'tsx'
    ],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/tests/(.*)$': '<rootDir>/tests/$1'
    },
    snapshotSerializers: [
        'jest-serializer-vue'
    ],
    roots: [
        "tests"
    ],
    testRegex: "(test_.*)|(test_.*\\.ts)$",
    testPathIgnorePatterns: ["/node_modules/", "/__snapshots__/"],
    testURL: 'http://localhost/',

    collectCoverage: true,
    collectCoverageFrom: ["<rootDir>/src/**/*.{ts,vue}", "!<rootDir>/src/demos/**"],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};
