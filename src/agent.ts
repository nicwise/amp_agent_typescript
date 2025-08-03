import Anthropic from '@anthropic-ai/sdk';
import { MessageParam, ToolUseBlock, TextBlock, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { ToolDefinition, ConversationMessage } from './types';

export class Agent {
  private client: Anthropic;
  private tools: ToolDefinition[];
  private conversation: MessageParam[] = [];

  constructor(client: Anthropic, tools: ToolDefinition[]) {
    this.client = client;
    this.tools = tools;
  }

  async run(getUserInput: () => Promise<string>): Promise<void> {
    console.log('Claude Agent started. Type your messages below (Ctrl+C to exit):');
    
    while (true) {
      try {
        const userInput = await getUserInput();
        
        // Add user message to conversation
        this.conversation.push({
          role: 'user',
          content: userInput
        });

        // Run inference and handle response
        await this.processConversation();
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  private async processConversation(): Promise<void> {
    const response = await this.runInference();
    
    // Process the response content
    const toolResults: ToolResultBlockParam[] = [];
    let hasToolUse = false;

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log('\nClaude:', block.text);
      } else if (block.type === 'tool_use') {
        hasToolUse = true;
        console.log(`\n[Using tool: ${block.name}]`);
        
        try {
          const result = await this.executeTool(block);
          toolResults.push(result);
        } catch (error) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Error: ${error}`,
            is_error: true
          });
        }
      }
    }

    // Add Claude's response to conversation
    this.conversation.push({
      role: 'assistant',
      content: response.content
    });

    // If there were tool uses, add the results as a new user message
    if (hasToolUse && toolResults.length > 0) {
      this.conversation.push({
        role: 'user',
        content: toolResults
      });
      
      // Process the conversation again with tool results
      await this.processConversation();
    }
  }

  private async runInference() {
    const tools = this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema
    }));

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: this.conversation,
      tools: tools
    });

    return response;
  }

  private async executeTool(toolUse: ToolUseBlock): Promise<ToolResultBlockParam> {
    const tool = this.tools.find(t => t.name === toolUse.name);
    
    if (!tool) {
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Tool "${toolUse.name}" not found`,
        is_error: true
      };
    }

    try {
      const result = await tool.function(toolUse.input);
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result
      };
    } catch (error) {
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Error executing ${toolUse.name}: ${error}`,
        is_error: true
      };
    }
  }
}
