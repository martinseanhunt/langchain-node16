import { test, expect } from "@jest/globals";
import * as uuid from "uuid";
import { CallbackManager } from "../manager.js";
import { BaseCallbackHandler } from "../base.js";
import { HumanChatMessage, } from "../../schema/index.js";
class FakeCallbackHandler extends BaseCallbackHandler {
    constructor(inputs) {
        super(inputs);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `fake-${uuid.v4()}`
        });
        Object.defineProperty(this, "starts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "ends", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "errors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "chainStarts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "chainEnds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "llmStarts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "llmEnds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "llmStreams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "toolStarts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "toolEnds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "agentEnds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "texts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    async handleLLMStart(_llm, _prompts) {
        this.starts += 1;
        this.llmStarts += 1;
    }
    async handleLLMEnd(_output) {
        this.ends += 1;
        this.llmEnds += 1;
    }
    async handleLLMNewToken(_token) {
        this.llmStreams += 1;
    }
    async handleLLMError(_err) {
        this.errors += 1;
    }
    async handleChainStart(_chain, _inputs) {
        this.starts += 1;
        this.chainStarts += 1;
    }
    async handleChainEnd(_outputs) {
        this.ends += 1;
        this.chainEnds += 1;
    }
    async handleChainError(_err) {
        this.errors += 1;
    }
    async handleToolStart(_tool, _input) {
        this.starts += 1;
        this.toolStarts += 1;
    }
    async handleToolEnd(_output) {
        this.ends += 1;
        this.toolEnds += 1;
    }
    async handleToolError(_err) {
        this.errors += 1;
    }
    async handleText(_text) {
        this.texts += 1;
    }
    async handleAgentAction(_action) {
        this.starts += 1;
        this.toolStarts += 1;
    }
    async handleAgentEnd(_action) {
        this.ends += 1;
        this.agentEnds += 1;
    }
    copy() {
        const newInstance = new FakeCallbackHandler();
        newInstance.name = this.name;
        newInstance.starts = this.starts;
        newInstance.ends = this.ends;
        newInstance.errors = this.errors;
        newInstance.chainStarts = this.chainStarts;
        newInstance.chainEnds = this.chainEnds;
        newInstance.llmStarts = this.llmStarts;
        newInstance.llmEnds = this.llmEnds;
        newInstance.llmStreams = this.llmStreams;
        newInstance.toolStarts = this.toolStarts;
        newInstance.toolEnds = this.toolEnds;
        newInstance.agentEnds = this.agentEnds;
        newInstance.texts = this.texts;
        return newInstance;
    }
}
class FakeCallbackHandlerWithChatStart extends FakeCallbackHandler {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "chatModelStarts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    async handleChatModelStart(_llm, _messages) {
        this.starts += 1;
        this.chatModelStarts += 1;
    }
}
test("CallbackManager", async () => {
    const manager = new CallbackManager();
    const handler1 = new FakeCallbackHandler();
    const handler2 = new FakeCallbackHandler();
    manager.addHandler(handler1);
    manager.addHandler(handler2);
    const llmCb = await manager.handleLLMStart({ name: "test" }, ["test"]);
    await llmCb.handleLLMEnd({ generations: [] });
    await llmCb.handleLLMNewToken("test");
    await llmCb.handleLLMError(new Error("test"));
    const chainCb = await manager.handleChainStart({ name: "test" }, { test: "test" });
    await chainCb.handleChainEnd({ test: "test" });
    await chainCb.handleChainError(new Error("test"));
    const toolCb = await manager.handleToolStart({ name: "test" }, "test");
    await toolCb.handleToolEnd("test");
    await toolCb.handleToolError(new Error("test"));
    await chainCb.handleText("test");
    await chainCb.handleAgentAction({
        tool: "test",
        toolInput: "test",
        log: "test",
    });
    await chainCb.handleAgentEnd({ returnValues: { test: "test" }, log: "test" });
    for (const handler of [handler1, handler2]) {
        expect(handler.starts).toBe(4);
        expect(handler.ends).toBe(4);
        expect(handler.errors).toBe(3);
        expect(handler.llmStarts).toBe(1);
        expect(handler.llmEnds).toBe(1);
        expect(handler.llmStreams).toBe(1);
        expect(handler.chainStarts).toBe(1);
        expect(handler.chainEnds).toBe(1);
        expect(handler.toolStarts).toBe(2);
        expect(handler.toolEnds).toBe(1);
        expect(handler.agentEnds).toBe(1);
        expect(handler.texts).toBe(1);
    }
});
test("CallbackManager Chat Message Handling", async () => {
    const manager = new CallbackManager();
    const handler1 = new FakeCallbackHandler();
    const handler2 = new FakeCallbackHandlerWithChatStart();
    manager.addHandler(handler1);
    manager.addHandler(handler2);
    const llmCb = await manager.handleChatModelStart({ name: "test" }, [
        [new HumanChatMessage("test")],
    ]);
    await llmCb.handleLLMEnd({ generations: [] });
    // Everything treated as llm in handler 1
    expect(handler1.llmStarts).toBe(1);
    expect(handler2.llmStarts).toBe(0);
    expect(handler2.chatModelStarts).toBe(1);
    // These should all be treated the same
    for (const handler of [handler1, handler2]) {
        expect(handler.starts).toBe(1);
        expect(handler.ends).toBe(1);
        expect(handler.errors).toBe(0);
        expect(handler.llmEnds).toBe(1);
    }
});
test("CallbackHandler with ignoreLLM", async () => {
    const handler = new FakeCallbackHandler({
        ignoreLLM: true,
    });
    const manager = new CallbackManager();
    manager.addHandler(handler);
    const llmCb = await manager.handleLLMStart({ name: "test" }, ["test"]);
    await llmCb.handleLLMEnd({ generations: [] });
    await llmCb.handleLLMNewToken("test");
    await llmCb.handleLLMError(new Error("test"));
    expect(handler.starts).toBe(0);
    expect(handler.ends).toBe(0);
    expect(handler.errors).toBe(0);
    expect(handler.llmStarts).toBe(0);
    expect(handler.llmEnds).toBe(0);
    expect(handler.llmStreams).toBe(0);
});
test("CallbackHandler with ignoreChain", async () => {
    const handler = new FakeCallbackHandler({
        ignoreChain: true,
    });
    const manager = new CallbackManager();
    manager.addHandler(handler);
    const chainCb = await manager.handleChainStart({ name: "test" }, { test: "test" });
    await chainCb.handleChainEnd({ test: "test" });
    await chainCb.handleChainError(new Error("test"));
    expect(handler.starts).toBe(0);
    expect(handler.ends).toBe(0);
    expect(handler.errors).toBe(0);
    expect(handler.chainStarts).toBe(0);
    expect(handler.chainEnds).toBe(0);
});
test("CallbackHandler with ignoreAgent", async () => {
    const handler = new FakeCallbackHandler({
        ignoreAgent: true,
    });
    const manager = new CallbackManager();
    manager.addHandler(handler);
    const toolCb = await manager.handleToolStart({ name: "test" }, "test");
    await toolCb.handleToolEnd("test");
    await toolCb.handleToolError(new Error("test"));
    const chainCb = await manager.handleChainStart({ name: "agent_executor" }, {});
    await chainCb.handleAgentAction({
        tool: "test",
        toolInput: "test",
        log: "test",
    });
    await chainCb.handleAgentEnd({ returnValues: { test: "test" }, log: "test" });
    expect(handler.starts).toBe(1);
    expect(handler.ends).toBe(0);
    expect(handler.errors).toBe(0);
    expect(handler.toolStarts).toBe(0);
    expect(handler.toolEnds).toBe(0);
    expect(handler.agentEnds).toBe(0);
});
test("CallbackManager with child manager", async () => {
    const llmRunId = "llmRunId";
    const chainRunId = "chainRunId";
    let llmWasCalled = false;
    let chainWasCalled = false;
    const manager = CallbackManager.fromHandlers({
        async handleLLMStart(_llm, _prompts, runId, parentRunId) {
            expect(runId).toBe(llmRunId);
            expect(parentRunId).toBe(chainRunId);
            llmWasCalled = true;
        },
        async handleChainStart(_chain, _inputs, runId, parentRunId) {
            expect(runId).toBe(chainRunId);
            expect(parentRunId).toBe(undefined);
            chainWasCalled = true;
        },
    });
    const chainCb = await manager.handleChainStart({ name: "test" }, { test: "test" }, chainRunId);
    await chainCb.getChild().handleLLMStart({ name: "test" }, ["test"], llmRunId);
    expect(llmWasCalled).toBe(true);
    expect(chainWasCalled).toBe(true);
});
test("CallbackManager with child manager inherited handlers", async () => {
    const callbackManager1 = new CallbackManager();
    const handler1 = new FakeCallbackHandler();
    const handler2 = new FakeCallbackHandler();
    const handler3 = new FakeCallbackHandler();
    const handler4 = new FakeCallbackHandler();
    callbackManager1.setHandlers([handler1, handler2]);
    expect(callbackManager1.handlers).toEqual([handler1, handler2]);
    expect(callbackManager1.inheritableHandlers).toEqual([handler1, handler2]);
    const callbackManager2 = callbackManager1.copy([handler3, handler4]);
    expect(callbackManager2.handlers).toEqual([
        handler1,
        handler2,
        handler3,
        handler4,
    ]);
    expect(callbackManager2.inheritableHandlers).toEqual([
        handler1,
        handler2,
        handler3,
        handler4,
    ]);
    const callbackManager3 = callbackManager1.copy([handler3, handler4], false);
    expect(callbackManager3.handlers).toEqual([
        handler1,
        handler2,
        handler3,
        handler4,
    ]);
    expect(callbackManager3.inheritableHandlers).toEqual([handler1, handler2]);
    const chainCb = await callbackManager3.handleChainStart({ name: "test" }, { test: "test" });
    const childManager = chainCb.getChild();
    expect(childManager.handlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
    ]);
    expect(childManager.inheritableHandlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
    ]);
    const toolCb = await childManager.handleToolStart({ name: "test" }, "test");
    const childManager2 = toolCb.getChild();
    expect(childManager2.handlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
    ]);
    expect(childManager2.inheritableHandlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
    ]);
});
test("CallbackManager.copy()", () => {
    const callbackManager1 = new CallbackManager();
    const handler1 = new FakeCallbackHandler();
    const handler2 = new FakeCallbackHandler();
    const handler3 = new FakeCallbackHandler();
    const handler4 = new FakeCallbackHandler();
    callbackManager1.addHandler(handler1, true);
    callbackManager1.addHandler(handler2, false);
    expect(callbackManager1.handlers).toEqual([handler1, handler2]);
    expect(callbackManager1.inheritableHandlers).toEqual([handler1]);
    const callbackManager2 = callbackManager1.copy([handler3]);
    expect(callbackManager2.handlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
        handler3.name,
    ]);
    expect(callbackManager2.inheritableHandlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler3.name,
    ]);
    const callbackManager3 = callbackManager2.copy([handler4], false);
    expect(callbackManager3.handlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler2.name,
        handler3.name,
        handler4.name,
    ]);
    expect(callbackManager3.inheritableHandlers.map((h) => h.name)).toEqual([
        handler1.name,
        handler3.name,
    ]);
});
