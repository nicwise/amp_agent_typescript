import * as fs from 'fs';
import * as path from 'path';
import { ToolDefinition } from './types';

export async function readFile(input: { path: string }): Promise<string> {
  try {
    const content = await fs.promises.readFile(input.path, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

export async function listFiles(input: { path?: string }): Promise<string> {
  try {
    const targetPath = input.path || '.';
    const entries = await fs.promises.readdir(targetPath, { withFileTypes: true });
    
    const files: string[] = [];
    const dirs: string[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(`${entry.name}/`);
      } else {
        files.push(entry.name);
      }
    }
    
    const result = [...dirs.sort(), ...files.sort()];
    return result.join('\n');
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

export async function editFile(input: { path: string; old_str: string; new_str: string }): Promise<string> {
  try {
    let content: string;
    
    try {
      content = await fs.promises.readFile(input.path, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, create new file with new_str content
        await fs.promises.writeFile(input.path, input.new_str, 'utf-8');
        return `Created new file: ${input.path}`;
      }
      throw error;
    }
    
    if (!content.includes(input.old_str)) {
      throw new Error(`String "${input.old_str}" not found in file`);
    }
    
    const newContent = content.replace(input.old_str, input.new_str);
    await fs.promises.writeFile(input.path, newContent, 'utf-8');
    
    return `Successfully edited file: ${input.path}`;
  } catch (error) {
    throw new Error(`Failed to edit file: ${error}`);
  }
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file to read'
        }
      },
      required: ['path']
    },
    function: readFile
  },
  {
    name: 'list_files',
    description: 'List files and directories in a given path',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to list files from (optional, defaults to current directory)'
        }
      }
    },
    function: listFiles
  },
  {
    name: 'edit_file',
    description: 'Edit a file by replacing old_str with new_str, or create a new file if it doesn\'t exist',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file to edit'
        },
        old_str: {
          type: 'string',
          description: 'The string to find and replace'
        },
        new_str: {
          type: 'string',
          description: 'The string to replace old_str with'
        }
      },
      required: ['path', 'old_str', 'new_str']
    },
    function: editFile
  }
];
