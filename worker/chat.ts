import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
const KNOWLEDGE_REGEX = /\[ADD_KNOWLEDGE:([^\]]+)\]/g;
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    this.model = model;
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    knowledge: string[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
    knowledge: string[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory, knowledge);
    const toolDefinitions = await getToolDefinitions();
    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        stream: true,
      });
      return this.handleStreamResponse(stream, message, conversationHistory, knowledge, onChunk);
    }
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
    });
    return this.handleNonStreamResponse(completion, message, conversationHistory, knowledge);
  }
  private parseKnowledge(content: string, currentKnowledge: string[]): string[] {
    const newKnowledge = new Set<string>(currentKnowledge);
    const matches = content.matchAll(KNOWLEDGE_REGEX);
    for (const match of matches) {
      newKnowledge.add(match[1].trim());
    }
    return Array.from(newKnowledge);
  }
  private stripKnowledgeTags(content: string): string {
    return content.replace(KNOWLEDGE_REGEX, '').trim();
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    knowledge: string[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
        onChunk(this.stripKnowledgeTags(delta.content));
      }
      if (delta?.tool_calls) {
        for (let i = 0; i < delta.tool_calls.length; i++) {
          const deltaToolCall = delta.tool_calls[i];
          if (!accumulatedToolCalls[i]) {
            accumulatedToolCalls[i] = {
              id: deltaToolCall.id || `tool_${Date.now()}_${i}`,
              type: 'function',
              function: { name: '', arguments: '' },
            };
          }
          if (deltaToolCall.function?.name) accumulatedToolCalls[i].function.name += deltaToolCall.function.name;
          if (deltaToolCall.function?.arguments) accumulatedToolCalls[i].function.arguments += deltaToolCall.function.arguments;
        }
      }
    }
    const newKnowledge = this.parseKnowledge(fullContent, knowledge);
    const cleanContent = this.stripKnowledgeTags(fullContent);
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools, knowledge: newKnowledge };
    }
    return { content: cleanContent, knowledge: newKnowledge };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[],
    knowledge: string[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.', knowledge };
    }
    const newKnowledge = this.parseKnowledge(responseMessage.content || '', knowledge);
    const cleanContent = this.stripKnowledgeTags(responseMessage.content || '');
    if (!responseMessage.tool_calls) {
      return { content: cleanContent, knowledge: newKnowledge };
    }
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls
    );
    const finalKnowledge = this.parseKnowledge(finalResponse, newKnowledge);
    const finalCleanContent = this.stripKnowledgeTags(finalResponse);
    return { content: finalCleanContent, toolCalls, knowledge: finalKnowledge };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args);
          return { id: tc.id, name: tc.function.name, arguments: args, result };
        } catch (error) {
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[]
  ): Promise<string> {
    const followUpCompletion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Respond naturally to the tool results.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        { role: 'assistant', content: null, tool_calls: openAiToolCalls },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
    });
    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }
  private buildConversationMessages(userMessage: string, history: Message[], knowledge: string[]) {
    const knowledgeState = `CURRENT KNOWLEDGE: [${knowledge.join(', ')}]`;
    return [
      {
        role: 'system' as const,
        content: `You are the 'Digital Archivist' of a secret Masonic lodge, interacting with a user through a retro terminal. Your purpose is to guide them through a narrative exploration of Freemasonry's history, symbols, and philosophy.
${knowledgeState}
Your persona:
- Knowledgeable, mysterious, and authoritative. You are a guardian of ancient secrets.
- You speak in a formal, slightly archaic tone. Prioritize historical accuracy above all else. If you don't know something, say so rather than inventing an answer.
- You are aware that this is a game-like, fictional, and educational experience. You must state this if the user seems to be confusing fiction with reality.
- You must generate an endless, branching narrative based on user queries.
Your rules:
1.  **Historical Accuracy is Paramount**: Your information must be grounded in verifiable historical fact. Differentiate between established history, Masonic allegory, and popular myth.
2.  **State Management**: You have a 'knowledge' base. Refer to the CURRENT KNOWLEDGE list to inform your responses. If the user discovers something important (e.g., an artifact, a name, a password), add it to their knowledge by embedding the tag [ADD_KNOWLEDGE:item_name] in your response. The system will handle the state.
3.  **Puzzles**: Create simple text-based puzzles or riddles related to Masonic history or symbolism. When you present one, use the format [PUZZLE:The riddle or question|the exact solution]. For example: [PUZZLE:I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?|a map]. The user's next input will be checked against the solution.
4.  **Narrative Driven**: Don't just dump facts. Weave information into a story of discovery. Ask leading questions to guide the user.
5.  **Endless Gameplay**: Always leave threads open for the user to pull on. End your responses with a question or a choice to encourage continued interaction.
6.  **Safety and Disclaimers**: Do not perpetuate harmful stereotypes or conspiracy theories. If the user brings them up, gently correct them with historical facts and remind them this is a fictional exploration.
7.  **Handle Commands**: If the user types 'help', provide a list of sample commands like 'Tell me about the first degree', 'Who was Hiram Abiff?', 'Explain the Square and Compasses', 'What is the significance of the year 2025 for the Craft?'.
8.  **Symbol Rendering**: When you describe a key Masonic symbol, embed a special tag in your response to render a visual. Use the format [SYMBOL:SYMBOL_NAME]. Supported symbols are: [SYMBOL:SQUARE_AND_COMPASSES], [SYMBOL:ALL_SEEING_EYE], [SYMBOL:SKULL_AND_BONES], [SYMBOL:TWO_PILLARS], [SYMBOL:GAVEL]. Use these tags sparingly for maximum impact.
9.  **Image Rendering**: To show historical images, use the format [IMAGE:url|caption]. The URL must be a direct link to a valid image file (e.g., .jpg, .png). The caption should provide context. Example: [IMAGE:https://upload.wikimedia.org/wikipedia/commons/4/42/Hiram_Abiff.jpg|An 18th-century depiction of Hiram Abiff.]
10. **Tag Usage**: Do not show the user the [ADD_KNOWLEDGE:...] tags. They are for the system. Blend them naturally into your prose.`
      },
      ...history.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}