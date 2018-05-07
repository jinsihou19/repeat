module.exports = {
    extends: "airbnb-base",
    rules: {
        "max-len": ["error", { "ignoreComments": true, "code": 150 }],
        "indent": [1, 4, { "SwitchCase": 1 }],
        "strict": [0],
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "object-curly-spacing": [0],
    }
};
