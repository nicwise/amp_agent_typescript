# Claude Agent - TypeScript Implementation

A TypeScript implementation of a Claude API client with basic file manipulation tools, based on the [Amp blog post](https://ampcode.com/how-to-build-an-agent).

## Features

- Interactive conversation with Claude
- File system tools:
  - `read_file` - Read file contents
  - `list_files` - List files and directories
  - `edit_file` - Edit files by string replacement

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Anthropic API key:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

Or export it directly:
```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

3. Build the project:
```bash
npm run build
```

4. Run the agent:
```bash
npm start
```

Or run in development mode:
```bash
npm run dev
```

## Usage

Once running, you can chat with Claude and it will have access to file system tools. Try asking it to:

- List files in the current directory
- Read a specific file
- Edit a file by replacing text
- Create new files

Example interactions:
- "List the files in this directory"
- "Read the package.json file"
- "Create a new file called hello.txt with the content 'Hello World'"
- "In the README.md file, replace 'Claude Agent' with 'My Agent'"

## Architecture

The implementation follows the same structure as the Go version:

- `Agent` class manages the conversation loop
- Tools are defined with schemas and implementation functions
- The agent handles tool execution and result formatting
- Conversation history is maintained for context
