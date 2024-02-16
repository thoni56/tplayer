module.exports = {
    "env": {
        "browser": true, // For renderer process
        "es6": true,
        "node": true, // For main process
    },
    "extends": [
        "standard", // Standard JavaScript style guide
        "plugin:@typescript-eslint/recommended", // TypeScript recommendations
        "plugin:vue/recommended" // Vue recommendations
    ],
    "parser": "vue-eslint-parser",
    "parserOptions": {
        "parser": "@typescript-eslint/parser", // Use TypeScript parser for `<script>` tags
        "ecmaVersion": 2018,
        "sourceType": "module", // Allows for the use of imports
    },
    "plugins": [
        "vue",
        "vuetify",
        "@typescript-eslint" // Add TypeScript plugin
    ],
    "rules": {
        "vuetify/no-deprecated-classes": "warn",
        "vuetify/grid-usage": "warn",
        // Add or adjust rules as needed for TypeScript
    }
};
