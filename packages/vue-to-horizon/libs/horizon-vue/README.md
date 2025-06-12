# vue-to-horizon

## Quickstart

-go to root folder: cd ../..

```shell
npm i
npm run build
npm run horizon:vue-chat
```

## Template parser

### Instalation:

-this project is part of workspaces and modules are installed in root directory

### Usage:

```shell
horizon-vue [action] --src [source] --out [output] [--fast]
```

_horizon-vue run --src ../horizon-examples/vue-basic-example/src --out ./build_

**source**: root direcotry containing App.vue file
**output**: output directory of new project directory
**action**: one of following:

**convert**: only translates templates and creates output project
**run**: same as convert, but also serves project
**watch**: same as run but also watches source directory for any changes

## Directives conversion process

built-in directives (
✔ v-text,
✔ v-html,
✔ v-show,
✔ v-if,
✔ v-else,
✔ v-else-if.
✔ v-for,
✔ v-on,
✔ v-bind,
✔ v-model,
✔ v-slot,
✔ v-pre,
? v-once, - blocked by jsx parser: boolean attributes are not parsed correctly
? v-memo, - bug: different implementation in vue
v-cloak
? v-model - missing component implementation,
)
