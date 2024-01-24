module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "standard",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "plugins": [
        "vue",
        "vuetify"
    ],
    "rules": {
        "vuetify/no-deprecated-classes": "warn",
        "vuetify/grid-usage": "warn"
    }
};