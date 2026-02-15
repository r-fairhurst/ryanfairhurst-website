<script lang="ts">
	import { onMount } from 'svelte';
	import Home from '$lib/components/pages/Home.svelte';
	import About from '$lib/components/pages/About.svelte';
	import Projects from '$lib/components/pages/Projects.svelte';
	import Contact from '$lib/components/pages/Contact.svelte';
	
	let { terminalId, onNavigate = () => {} } = $props();
	
	let currentPath = $state('/');
	let commandHistory = $state<string[]>([]);
	let historyIndex = $state(-1);
	let displayingContent = $state<string | null>(null);
	let output = $state<Array<{type: 'command' | 'output' | 'error' | 'content', content: string, contentPath?: string}>>([
		{ type: 'output', content: 'Welcome to Ryan Fairhurst\'s Portfolio Terminal' },
		{ type: 'output', content: 'Type "help" for available commands' },
		{ type: 'output', content: 'Use "ls" to see available files and "cat <file>" to view content' },
		{ type: 'output', content: '' }
	]);
	let currentCommand = $state('');
	let inputElement: HTMLInputElement;
	
	const fileSystem: { [key: string]: { files: string[]; directories: string[] } } = {
		'/': {
			files: ['about.md', 'projects.md', 'contact.md'],
			directories: []
		}
	};
	
	const fileContent: { [key: string]: string } = {
		'/about.md': '/about',
		'/projects.md': '/projects', 
		'/contact.md': '/contact'
	};
	
	const commands = {
		help: () => [
			'Available commands:',
			'  ls          - list directory contents',
			'  cd <dir>    - change directory',
			'  pwd         - print working directory',
			'  cat <file>  - display file contents',
			'  clear       - clear terminal',
			'  help        - show this help message'
		],
		
		ls: () => {
			const currentDir = fileSystem[currentPath];
			if (!currentDir) {
				return ['Directory not found'];
			}
			
			const items: string[] = [];
			
			// Add directories first
			if (currentDir.directories.length > 0) {
				currentDir.directories.forEach((dir: string) => {
					items.push(`  ${dir}/`);
				});
			}
			
			// Add files
			if (currentDir.files.length > 0) {
				currentDir.files.forEach((file: string) => {
					items.push(`  ${file}`);
				});
			}
			
			if (items.length === 0) {
				return ['Directory is empty'];
			}
			
			return items;
		},
		
		pwd: () => [currentPath === '/' ? '/' : currentPath],
		
		cd: (args: string[]) => {
			if (args.length === 0) {
				currentPath = '/';
				onNavigate('/');
				return [`Changed to ${currentPath}`];
			}
			
			const target = args[0];
			let newPath: string;
			
			if (target === '/') {
				newPath = '/';
			} else if (target === '..') {
				newPath = currentPath === '/' ? '/' : '/';
			} else if (target.startsWith('/')) {
				newPath = target;
			} else {
				newPath = currentPath === '/' ? `/${target}` : `${currentPath}/${target}`;
			}
			
			// Check if the target is a file (not a directory)
			const currentDir = fileSystem[currentPath];
			if (currentDir && currentDir.files.includes(target)) {
				return [`cd: ${target}: Not a directory`];
			}
			
			if (currentDir && currentDir.files.includes(`${target}.md`)) {
				return [`cd: ${target}: Not a directory`];
			}
			
			// Check if path exists as a directory
			if (fileSystem.hasOwnProperty(newPath)) {
				currentPath = newPath;
				onNavigate(newPath);
				return [`Changed to ${newPath}`];
			} else {
				return [`cd: ${target}: No such file or directory`];
			}
		},
		
		cat: (args: string[]) => {
			if (args.length === 0) {
				return ['cat: missing file argument'];
			}
			
			const file = args[0];
			let filePath = file;
			
			// Handle relative vs absolute paths
			if (!file.startsWith('/')) {
				filePath = currentPath === '/' ? `/${file}` : `${currentPath}/${file}`;
			}
			
			// Add .md extension if not present and check if file exists
			if (!file.endsWith('.md')) {
				const mdFilePath = `${filePath}.md`;
				if (fileContent.hasOwnProperty(mdFilePath)) {
					displayingContent = fileContent[mdFilePath];
					return [`=== Content of ${file} ===`];
				}
			}
			
			// Check if file exists with .md extension
			if (fileContent.hasOwnProperty(filePath)) {
				displayingContent = fileContent[filePath];
				return [`=== Content of ${file} ===`];
			}
			
			// Check if it's a directory
			if (fileSystem.hasOwnProperty(filePath)) {
				return [`cat: ${file}: Is a directory`];
			}
			
			return [`cat: ${file}: No such file or directory`];
		},
		
		clear: () => {
			output = [];
			displayingContent = null;
			return [];
		}
	};
	
	function executeCommand(cmd: string) {
		const trimmed = cmd.trim();
		if (!trimmed) return;
		
		// Add command to history
		commandHistory.push(trimmed);
		historyIndex = -1;
		
		// Add command to output
		output.push({ type: 'command', content: `${getPrompt()} ${trimmed}` });
		
		// Parse command
		const parts = trimmed.split(' ');
		const command = parts[0];
		const args = parts.slice(1);
		
		if (commands.hasOwnProperty(command)) {
			const result = (commands as any)[command](args);
			result.forEach((line: string) => {
				output.push({ type: 'output', content: line });
			});
			
			// If cat command was used and content should be displayed
			if (command === 'cat' && displayingContent) {
				output.push({ type: 'content', content: '', contentPath: displayingContent });
			}
		} else {
			output.push({ type: 'error', content: `${command}: command not found` });
		}
		
		output.push({ type: 'output', content: '' });
	}
	
	function getPrompt() {
		const path = currentPath === '/' ? '~' : currentPath.replace('/', '');
		return `root@ryanfairhurst:${path}$`;
	}
	
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			executeCommand(currentCommand);
			currentCommand = '';
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (commandHistory.length > 0) {
				historyIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
				currentCommand = commandHistory[historyIndex];
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (historyIndex !== -1) {
				historyIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
				currentCommand = historyIndex === -1 ? '' : commandHistory[historyIndex];
			}
		}
	}
	
	onMount(() => {
		inputElement?.focus();
	});
	
	$effect(() => {
		// Auto-scroll to bottom when output changes
		const terminalElement = document.querySelector(`[data-terminal-id="${terminalId}"] .terminal-shell`);
		if (terminalElement) {
			terminalElement.scrollTop = terminalElement.scrollHeight;
		}
	});
</script>

<div class="terminal-shell" data-terminal-id={terminalId}>
	<div class="output-area">
		{#each output as line}
			{#if line.type === 'content'}
				<div class="content-display">
					{#if line.contentPath === '/'}
						<Home />
					{:else if line.contentPath === '/about'}
						<About />
					{:else if line.contentPath === '/projects'}
						<Projects />
					{:else if line.contentPath === '/contact'}
						<Contact />
					{/if}
				</div>
			{:else}
				<div class="output-line {line.type}">
					{line.content}
				</div>
			{/if}
		{/each}
	</div>
	
	<div class="input-area">
		<span class="prompt">{getPrompt()}</span>
		<input 
			bind:this={inputElement}
			bind:value={currentCommand}
			onkeydown={handleKeyDown}
			class="command-input"
			type="text"
			spellcheck="false"
			autocomplete="off"
		/>
	</div>
</div>

<style>
	.terminal-shell {
		height: 100%;
		display: flex;
		flex-direction: column;
		font-family: inherit;
        font-size: 1.15rem;
		background: transparent;
		color: var(--color-red);
	}
	
	.output-area {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
	}
	
	.output-line {
		margin: 0.1rem 0;
		line-height: 1.4;
		white-space: pre-wrap;
	}
	
	.output-line.command {
		color: var(--color-text);
		font-weight: bold;
	}
	
	.output-line.output {
		color: var(--color-red);
	}
	
	.output-line.error {
		color: #ff6b6b;
	}
	
	.input-area {
		display: flex;
		align-items: center;
		padding: 0 0.5rem 0.5rem;
		border-top: 1px solid var(--color-red-dark);
	}
	
	.prompt {
		color: var(--color-text);
		font-weight: bold;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}
	
	.command-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-red);
		font-family: monospace;
		font-size: inherit;
	}
	
	.content-display {
		border: 1px solid var(--color-red-dark);
		border-radius: 4px;
		padding: 1rem;
		margin: 0.5rem 0;
		background: rgba(34, 34, 34, 0.5);
		overflow-y: auto;
		max-height: 400px;
	}
</style>