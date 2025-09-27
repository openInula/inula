# openinula2.0 Component Library

[![NPM version](https://img.shields.io/npm/v/inulaUI.svg?style=flat)](https://npmjs.org/package/inulaUI)
[![NPM downloads](http://img.shields.io/npm/dm/inulaUI.svg?style=flat)](https://npmjs.org/package/inulaUI)

## Project Overview

openinula2.0 Component Library is a modern React UI component library based on [openinula](https://github.com/openinula/openinula). It includes a rich set of foundational components suitable for enterprise-level middle/backend and mobile application development. The component library features a modern design style, supports light/dark theme switching, and offers excellent extensibility and usability.

## Development Guide

Navigate to the library directory:

```bash
npm install
npm run dev
```

Components should be named in lowercase and placed in the components directory. The directory structure is as follows (using Button component as an example):

```
button/
├── demos/      # Button examples (different functionalities in separate files)
├── demo.jsx    # Main demo file for button
├── index.jsx   # Button component implementation
└── index.css   # Button styles
```

## Directory Structure

```
openInula2.0_Library/
├── inulaUI/                # Main component library package
│   ├── docs/               # Documentation & guides
│   ├── src/                # Component source code
│   │   ├── button/         # Button component
│   │   │   ├── demos/      # Button component demos
│   │   │   ├── index.jsx   # Button component implementation
│   │   │   ├── index.md    # Button component documentation
│   │   │   └── index.css   # Button styles
│   │   ├── index.ts        # Entry file
│   │   └── global.d.ts     # Global type declarations
│   ├── package.json        # Component library package configuration
│   └── ...
├── library_code/           # Demo/Test project for component library
│   ├── src/
│   │   ├── components/
│   │   │   └── button/
│   │   │       ├── demos/  # Button demos
│   │   │       ├── demo.jsx
│   │   │       ├── index.jsx
│   │   │       └── index.css
│   │   ├── index.jsx       # Entry point
│   │   └── index.css
│   ├── index.html
│   └── ...
└── README.md               # Project documentation
```

## Contribution Guide

1. Fork this repository and create your feature branch.
2. Ensure all lint checks and unit tests pass before submitting code.
3. Provide detailed description of changes when submitting PR.
4. Contributions including documentation improvements, bug fixes, or new components are welcome.

## License

MIT
