import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import { Agent } from './agent';
import { toolDefinitions } from './tools';

async function getUserInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\nYou: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Please set the ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  const client = new Anthropic({
    apiKey: apiKey
  });

  const agent = new Agent(client, toolDefinitions);
  
  try {
    await agent.run(getUserInput);
  } catch (error) {
    console.error('Agent error:', error);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  process.exit(0);
});

main().catch(console.error);
