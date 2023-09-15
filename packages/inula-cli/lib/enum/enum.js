export var PluginType;
(function (PluginType) {
    PluginType["preset"] = "preset";
    PluginType["plugin"] = "plugin";
})(PluginType || (PluginType = {}));
export var ServiceStage;
(function (ServiceStage) {
    ServiceStage[ServiceStage["uninitialized"] = 0] = "uninitialized";
    ServiceStage[ServiceStage["constructor"] = 1] = "constructor";
    ServiceStage[ServiceStage["init"] = 2] = "init";
    ServiceStage[ServiceStage["initPlugins"] = 3] = "initPlugins";
    ServiceStage[ServiceStage["initHooks"] = 4] = "initHooks";
    ServiceStage[ServiceStage["pluginReady"] = 5] = "pluginReady";
    ServiceStage[ServiceStage["getConfig"] = 6] = "getConfig";
    ServiceStage[ServiceStage["run"] = 7] = "run";
})(ServiceStage || (ServiceStage = {}));
