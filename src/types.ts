import { MessageParam } from '@anthropic-ai/sdk/resources/messages';

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  function: (input: any) => Promise<string>;
}

export interface ToolInput {
  [key: string]: any;
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export type ConversationMessage = MessageParam;
