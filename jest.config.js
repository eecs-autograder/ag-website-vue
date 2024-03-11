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
        '^@/tests/(.*)$': '<rootDir>/tests/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.js',
    },
    snapshotSerializers: [
        'jest-serializer-vue'
    ],
    roots: [
        "tests"
    ],
    testRegex: "^(test_.*)|(test_.*\\.ts)$",
    testPathIgnorePatterns: ["/node_modules/", "/__snapshots__/"],
    testURL: 'http://localhost/',

    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/src/**/*.{ts,vue}",
        "!<rootDir>/src/demos/**",
        "!<rootDir>/src/components/project_admin/project_stats/bugs_exposed_histogram.vue",
        "!<rootDir>/src/components/project_admin/project_stats/submission_score_histogram/submission_score_histogram_chart.vue",
        "!<rootDir>/src/components/project_admin/project_stats/first_submission_time_vs_final_score.vue",
        "!<rootDir>/src/components/project_admin/project_stats/submissions_over_time_graph.vue",
    ],
    coverageThreshold: {
        global: {
            branches: 95,
            lines: 100,
            statements: 100
        }
    },
    cache: false,

    setupFilesAfterEnv: ["./tests/setup.ts"],

    // https://kulshekhar.github.io/ts-jest/user/config/isolatedModules
    globals: {'ts-jest': {isolatedModules: true}}
};
