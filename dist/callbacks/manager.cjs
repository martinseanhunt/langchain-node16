"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackManager = exports.CallbackManagerForToolRun = exports.CallbackManagerForChainRun = exports.CallbackManagerForLLMRun = exports.BaseCallbackManager = void 0;
const uuid_1 = require("uuid");
const base_js_1 = require("./base.cjs");
const console_js_1 = require("./handlers/console.cjs");
const initialize_js_1 = require("./handlers/initialize.cjs");
const base_js_2 = require("../memory/base.cjs");
const env_js_1 = require("../util/env.cjs");
class BaseCallbackManager {
    setHandler(handler) {
        return this.setHandlers([handler]);
    }
}
exports.BaseCallbackManager = BaseCallbackManager;
class BaseRunManager {
    constructor(runId, handlers, inheritableHandlers, _parentRunId) {
        Object.defineProperty(this, "runId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: runId
        });
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: handlers
        });
        Object.defineProperty(this, "inheritableHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: inheritableHandlers
        });
        Object.defineProperty(this, "_parentRunId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _parentRunId
        });
    }
    async handleText(text) {
        await Promise.all(this.handlers.map(async (handler) => {
            try {
                await handler.handleText?.(text, this.runId, this._parentRunId);
            }
            catch (err) {
                console.error(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
            }
        }));
    }
}
class CallbackManagerForLLMRun extends BaseRunManager {
    async handleLLMNewToken(token) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMNewToken?.(token, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
                }
            }
        }));
    }
    async handleLLMError(err) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMError?.(err, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleLLMError: ${err}`);
                }
            }
        }));
    }
    async handleLLMEnd(output) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMEnd?.(output, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
                }
            }
        }));
    }
}
exports.CallbackManagerForLLMRun = CallbackManagerForLLMRun;
class CallbackManagerForChainRun extends BaseRunManager {
    getChild() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        return manager;
    }
    async handleChainError(err) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreChain) {
                try {
                    await handler.handleChainError?.(err, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleChainError: ${err}`);
                }
            }
        }));
    }
    async handleChainEnd(output) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreChain) {
                try {
                    await handler.handleChainEnd?.(output, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
                }
            }
        }));
    }
    async handleAgentAction(action) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleAgentAction?.(action, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
                }
            }
        }));
    }
    async handleAgentEnd(action) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleAgentEnd?.(action, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
                }
            }
        }));
    }
}
exports.CallbackManagerForChainRun = CallbackManagerForChainRun;
class CallbackManagerForToolRun extends BaseRunManager {
    getChild() {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        return manager;
    }
    async handleToolError(err) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleToolError?.(err, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleToolError: ${err}`);
                }
            }
        }));
    }
    async handleToolEnd(output) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleToolEnd?.(output, this.runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
                }
            }
        }));
    }
}
exports.CallbackManagerForToolRun = CallbackManagerForToolRun;
class CallbackManager extends BaseCallbackManager {
    constructor(parentRunId) {
        super();
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inheritableHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "callback_manager"
        });
        Object.defineProperty(this, "_parentRunId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.handlers = [];
        this.inheritableHandlers = [];
        this._parentRunId = parentRunId;
    }
    async handleLLMStart(llm, prompts, runId = (0, uuid_1.v4)(), _parentRunId = undefined, extraParams = undefined) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMStart?.(llm, prompts, runId, this._parentRunId, extraParams);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                }
            }
        }));
        return new CallbackManagerForLLMRun(runId, this.handlers, this.inheritableHandlers, this._parentRunId);
    }
    async handleChatModelStart(llm, messages, runId = (0, uuid_1.v4)(), _parentRunId = undefined, extraParams = undefined) {
        let messageStrings;
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreLLM) {
                try {
                    if (handler.handleChatModelStart)
                        await handler.handleChatModelStart?.(llm, messages, runId, this._parentRunId, extraParams);
                    else if (handler.handleLLMStart) {
                        messageStrings = messages.map((x) => (0, base_js_2.getBufferString)(x));
                        await handler.handleLLMStart?.(llm, messageStrings, runId, this._parentRunId, extraParams);
                    }
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                }
            }
        }));
        return new CallbackManagerForLLMRun(runId, this.handlers, this.inheritableHandlers, this._parentRunId);
    }
    async handleChainStart(chain, inputs, runId = (0, uuid_1.v4)()) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreChain) {
                try {
                    await handler.handleChainStart?.(chain, inputs, runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
                }
            }
        }));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this._parentRunId);
    }
    async handleToolStart(tool, input, runId = (0, uuid_1.v4)()) {
        await Promise.all(this.handlers.map(async (handler) => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleToolStart?.(tool, input, runId, this._parentRunId);
                }
                catch (err) {
                    console.error(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
                }
            }
        }));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this._parentRunId);
    }
    addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) {
            this.inheritableHandlers.push(handler);
        }
    }
    removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler) => _handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler) => _handler !== handler);
    }
    setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers) {
            this.addHandler(handler, inherit);
        }
    }
    copy(additionalHandlers = [], inherit = true) {
        const manager = new CallbackManager(this._parentRunId);
        for (const handler of this.handlers) {
            const inheritable = this.inheritableHandlers.includes(handler);
            manager.addHandler(handler, inheritable);
        }
        for (const handler of additionalHandlers) {
            if (
            // Prevent multiple copies of console_callback_handler
            manager.handlers
                .filter((h) => h.name === "console_callback_handler")
                .some((h) => h.name === handler.name)) {
                continue;
            }
            manager.addHandler(handler, inherit);
        }
        return manager;
    }
    static fromHandlers(handlers) {
        class Handler extends base_js_1.BaseCallbackHandler {
            constructor() {
                super();
                Object.defineProperty(this, "name", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: (0, uuid_1.v4)()
                });
                Object.assign(this, handlers);
            }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
    }
    static async configure(inheritableHandlers, localHandlers, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
            if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
                callbackManager = new CallbackManager();
                callbackManager.setHandlers(inheritableHandlers?.map(ensureHandler) ?? [], true);
            }
            else {
                callbackManager = inheritableHandlers;
            }
            callbackManager = callbackManager.copy(Array.isArray(localHandlers)
                ? localHandlers.map(ensureHandler)
                : localHandlers?.handlers, false);
        }
        const verboseEnabled = (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_VERBOSE") || options?.verbose;
        const tracingV2Enabled = (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_TRACING_V2") ?? false;
        const tracingEnabled = tracingV2Enabled ||
            ((0, env_js_1.getEnvironmentVariable)("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
            if (!callbackManager) {
                callbackManager = new CallbackManager();
            }
            if (verboseEnabled &&
                !callbackManager.handlers.some((handler) => handler.name === console_js_1.ConsoleCallbackHandler.prototype.name)) {
                const consoleHandler = new console_js_1.ConsoleCallbackHandler();
                callbackManager.addHandler(consoleHandler, true);
            }
            if (tracingEnabled &&
                !callbackManager.handlers.some((handler) => handler.name === "langchain_tracer")) {
                if (tracingV2Enabled) {
                    callbackManager.addHandler(await (0, initialize_js_1.getTracingV2CallbackHandler)(), true);
                }
                else {
                    const session = (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_SESSION");
                    callbackManager.addHandler(await (0, initialize_js_1.getTracingCallbackHandler)(session), true);
                }
            }
        }
        return callbackManager;
    }
}
exports.CallbackManager = CallbackManager;
function ensureHandler(handler) {
    if ("name" in handler) {
        return handler;
    }
    return base_js_1.BaseCallbackHandler.fromMethods(handler);
}
