var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class PluginAPI {
    constructor(opts) {
        this.path = opts.path;
        this.manager = opts.manager;
        this.logger = opts.logger;
    }
    register(hook) {
        if (!this.manager.hooksByPluginPath[this.path]) {
            this.manager.hooksByPluginPath[this.path] = [];
        }
        this.manager.hooksByPluginPath[this.path].push(hook);
    }
    registerCommand(command) {
        const { name } = command;
        this.manager.commands[name] = command;
        if (command.initialState) {
            this.manager.setStore(name, command.initialState);
        }
    }
    registerHook(hook) {
        this.register(hook);
    }
    registerMethod(fn) {
        this.manager.registerFunction.push(fn);
    }
    applyHook(name, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const hooks = this.manager.hooks[name] || [];
            let config = undefined;
            for (const hook of hooks) {
                if (this.manager.store[name]) {
                    config = this.manager.store[name];
                }
                if (hook.fn) {
                    yield hook.fn(args, config);
                }
            }
            return this.manager.store[name];
        });
    }
}
