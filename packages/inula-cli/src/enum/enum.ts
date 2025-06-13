export enum PluginType {
  preset = 'preset',
  plugin = 'plugin',
}

export enum ServiceStage {
  uninitialized,
  constructor,
  init,
  initPlugins,
  initHooks,
  pluginReady,
  getConfig,
  run,
}
