import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Exa from "exa-js";

const model = new ChatOpenAI({
  model: "gpt-4o",
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
});

const exa = new Exa(process.env.EXA_API_KEY!);

const exaSearch = tool(
  async ({ query }) => {
    const results = await exa.search(query, {
      type: "auto",
      numResults: 5,
      contents: {
        text: { maxCharacters: 10000 },
      },
    });

    return results.results
      .map((r) => `**${r.title}**\n${r.url}\n${r.text}`)
      .join("\n\n---\n\n");
  },
  {
    name: "web_search",
    description: "Search the web for current information, news, or any topic.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

export const agent = createReactAgent({
  llm: model,
  tools: [exaSearch],
  prompt: `You are a helpful AI assistant with access to web search capabilities.

When users ask about current events, recent news, or anything requiring up-to-date information, use the web_search tool to find relevant results.

Format your responses in markdown when appropriate. Be concise and helpful.`,
});