import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

const model = new ChatOpenAI({
  model: "gpt-4o",
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
});

const tavilySearch = new TavilySearch({
  maxResults: 5,
});

export const agent = createReactAgent({
  llm: model,
  tools: [tavilySearch],
  prompt: `You are a helpful AI assistant with access to web search capabilities.

When users ask about current events, recent news, or anything requiring up-to-date information, use the tavily_search tool to find relevant results.

Format your responses in markdown when appropriate. Be concise and helpful.`,
});
