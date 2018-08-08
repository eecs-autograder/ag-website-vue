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
        '^@ag/(.*)$': '<rootDir>/src/$1',
        '^@ag/tests/(.*)$': '<rootDir>/tests/$1'
    },
    snapshotSerializers: [
        'jest-serializer-vue'
    ],
    roots: [
        "tests"
    ],
    testRegex: "(test_.*)|(test_.*\\.ts)$",
    testURL: 'http://localhost/',

    "collectCoverage": true,
}
