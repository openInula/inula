export declare enum PluginType {
    preset = "preset",
    plugin = "plugin"
}
export declare enum ServiceStage {
    uninitialized = 0,
    constructor = 1,
    init = 2,
    initPlugins = 3,
    initHooks = 4,
    pluginReady = 5,
    getConfig = 6,
    run = 7
}
