import { test, expect } from "@jest/globals";
import { ConstitutionalChain } from "../constitutional_ai/constitutional_chain.js";
import { ConstitutionalPrinciple } from "../constitutional_ai/constitutional_principle.js";
import { LLMChain } from "../llm_chain.js";
import { PromptTemplate } from "../../prompts/index.js";
import { BaseLLM } from "../../llms/base.js";
class FakeLLM extends BaseLLM {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "nrMapCalls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "nrReduceCalls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    _llmType() {
        return "fake";
    }
    async _generate(prompts) {
        return {
            generations: prompts.map((prompt) => [
                {
                    text: prompt,
                    score: 0,
                },
            ]),
        };
    }
}
test("Test ConstitutionalChain", async () => {
    const llm = new FakeLLM({});
    const qaPrompt = new PromptTemplate({
        template: "Q: {question} A:",
        inputVariables: ["question"],
    });
    const qaChain = new LLMChain({
        llm,
        prompt: qaPrompt,
    });
    const critiqueWord = "Tell me if this answer is good.";
    const revisionWord = "Give a better answer.";
    const constitutionalChain = ConstitutionalChain.fromLLM(llm, {
        chain: qaChain,
        constitutionalPrinciples: [
            new ConstitutionalPrinciple({
                critiqueRequest: critiqueWord,
                revisionRequest: revisionWord,
            }),
        ],
    });
    const { output } = await constitutionalChain.call({
        question: "What is the meaning of life?",
    });
    expect(output).toContain(critiqueWord);
    expect(output).toContain(revisionWord);
});
