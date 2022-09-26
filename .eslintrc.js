module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ["airbnb", "prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    fetch: false
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  parser: "babel-eslint",
  rules: {
    "linebreak-style": ["error", "windows"],
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    "no-use-before-define": ["error", { variables: false }],
    "react/destructuring-assignment": 0,
    "react/prop-types": 0,
    "global-require": 0,
    "no-plusplus": [2, { allowForLoopAfterthoughts: true }],
    "no-console": process.env.NODE_ENV === "production" ? 2 : 0,
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
    "class-methods-use-this": 0,
    "react/jsx-props-no-spreading": 0
    // 'react/no-string-refs': 0
  }
};
