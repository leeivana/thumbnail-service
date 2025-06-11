export default {
    preset: "ts-jest/presets/default-esm", // preset that supports ESM + TS
    testEnvironment: "node",

    globals: {
        "ts-jest": {
            useESM: true,
        },
    },

    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    extensionsToTreatAsEsm: [".ts", ".tsx"],
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!lowdb)"],
    testPathIgnorePatterns: ["/dist/"],
};
