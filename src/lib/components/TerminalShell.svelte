<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Home from '$lib/components/pages/Home.svelte';
	import About from '$lib/components/pages/About.svelte';
	import Projects from '$lib/components/pages/Projects.svelte';
	import Contact from '$lib/components/pages/Contact.svelte';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	
	let { terminalId, onNavigate = () => {} } = $props();
	
	let outputAreaElement: HTMLDivElement;
	
	let currentPath = $state('/');
	let commandHistory = $state<string[]>([]);
	let historyIndex = $state(-1);
	let displayingContent = $state<string | null>(null);
	let output = $state<Array<{type: 'command' | 'output' | 'error' | 'content', content: string, contentPath?: string, githubContent?: string}>>([
		{ type: 'output', content: 'Welcome to Ryan Fairhurst\'s Portfolio Terminal' },
		{ type: 'output', content: 'Type "help" for available commands' },
		{ type: 'output', content: 'Use "ls" to see available files and "cat <file>" to view content' },
		{ type: 'output', content: '' }
	]);
	let currentCommand = $state('');
	let inputElement: HTMLInputElement;
	
	// Auto-scroll to bottom when output changes
	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (outputAreaElement) {
				outputAreaElement.scrollTop = outputAreaElement.scrollHeight;
			}
		});
	}
	
	// Effect to scroll when output changes
	$effect(() => {
		if (output.length > 0) {
			scrollToBottom();
		}
	});
	
	const fileSystem: { [key: string]: { files: string[]; directories: string[] } } = {
		'/': {
			files: ['about.md', 'projects.md', 'contact.md'],
			directories: ['writeups']
		},
		'/writeups': {
			files: [],
			directories: []
		}
	};
	
	const fileContent: { [key: string]: string } = {
		'/about.md': '/about',
		'/projects.md': '/projects', 
		'/contact.md': '/contact'
	};
	
	const GITHUB_API_BASE = 'https://api.github.com/repos/r-fairhurst/ctf-writeups/contents';
	let writeupCache = $state<{[key: string]: any}>({});
	let loadingWriteups = $state(false);
	
	async function fetchWriteups(path: string = ''): Promise<any[]> {
		try {
			const url = `${GITHUB_API_BASE}${path}`;
			const response = await fetch(url);
			
			if (!response.ok) {
				throw new Error(`Failed to fetch: ${response.status}`);
			}
			
			return await response.json();
		} catch (error) {
			console.error('Error fetching writeups:', error);
			return [];
		}
	}
	
	async function fetchReadmeContent(path: string): Promise<string> {
		try {
			const items = await fetchWriteups(path);
			const readme = items.find(item => 
				item.name.toLowerCase() === 'readme.md' && item.type === 'file'
			);
			
			if (!readme) {
				return 'No README found in this directory.';
			}
			
			const response = await fetch(readme.download_url);
			if (!response.ok) {
				throw new Error(`Failed to fetch README: ${response.status}`);
			}
			
			return await response.text();
		} catch (error) {
			console.error('Error fetching README:', error);
			return 'Error loading README content.';
		}
	}
	
	async function loadWriteupsDirectory(path: string): Promise<string[]> {
		if (writeupCache[path]) {
			return writeupCache[path];
		}
		
		loadingWriteups = true;
		try {
			const items = await fetchWriteups(path);
			const result = [];
			
			for (const item of items) {
				if (item.type === 'dir') {
					// Check if this directory contains a README
					const hasReadme = await fetchWriteups(`${path}/${item.name}`)
						.then(dirItems => 
							dirItems.some(dirItem => 
								dirItem.name.toLowerCase() === 'readme.md' && dirItem.type === 'file'
							)
						)
						.catch(() => false);
					
					if (hasReadme) {
						result.push(`${item.name}.md`);
					} else {
						result.push(`${item.name}/`);
					}
				}
			}
			
			writeupCache[path] = result;
			return result;
		} finally {
			loadingWriteups = false;
		}
	}
	
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
		
		ls: async () => {
			const currentDir = fileSystem[currentPath];
			if (!currentDir) {
				return ['Directory not found'];
			}
			
			const items: string[] = [];
			
			// Handle writeups directory specially
			if (currentPath === '/writeups') {
				if (loadingWriteups) {
					return ['Loading writeups from GitHub...'];
				}
				
				try {
					const writeupItems = await loadWriteupsDirectory('');
					items.push(...writeupItems.map(item => `  ${item}`));
				} catch (error) {
					return ['Error loading writeups from GitHub'];
				}
			} 
			// Handle subdirectories within writeup directories
			else if (currentPath.startsWith('/writeups/')) {
				const githubPath = currentPath.replace('/writeups', '');
				try {
					const githubItems = await fetchWriteups(githubPath);
					for (const item of githubItems) {
						if (item.type === 'dir') {
							items.push(`  ${item.name}/`);
						} else if (item.type === 'file') {
							items.push(`  ${item.name}`);
						}
					}
				} catch (error) {
					return ['Error loading directory contents from GitHub'];
				}
			} 
			// Handle static directories
			else {
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
			}
			
			if (items.length === 0) {
				return ['Directory is empty'];
			}
			
			return items;
		},
		
		pwd: () => [currentPath === '/' ? '/' : currentPath],
		
		cd: async (args: string[]) => {
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
				// Handle going back from writeups subdirectories
				if (currentPath.startsWith('/writeups/')) {
					newPath = '/writeups';
				} else {
					newPath = currentPath === '/' ? '/' : '/';
				}
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
			
			// Handle GitHub writeups directories
			if (currentPath === '/writeups') {
				try {
					const items = await fetchWriteups('');
					const writeupDir = items.find(item => 
						item.type === 'dir' && (item.name === target || item.name === target.replace('/', ''))
					);
					
					if (writeupDir) {
						newPath = `/writeups/${writeupDir.name}`;
						// Dynamically add to file system
						fileSystem[newPath] = {
							files: [],
							directories: []
						};
						currentPath = newPath;
						onNavigate(newPath);
						return [`Changed to ${newPath}`];
					}
				} catch (error) {
					return [`cd: ${target}: Error accessing directory`];
				}
			}
			
			// Handle subdirectories within writeup directories
			if (currentPath.startsWith('/writeups/')) {
				const parentPath = currentPath.replace('/writeups/', '');
				try {
					const items = await fetchWriteups(`/${parentPath}`);
					const subDir = items.find(item => 
						item.type === 'dir' && (item.name === target || item.name === target.replace('/', ''))
					);
					
					if (subDir) {
						newPath = `${currentPath}/${subDir.name}`;
						// Dynamically add to file system
						fileSystem[newPath] = {
							files: [],
							directories: []
						};
						currentPath = newPath;
						onNavigate(newPath);
						return [`Changed to ${newPath}`];
					}
				} catch (error) {
					return [`cd: ${target}: Error accessing directory`];
				}
			}
			
			// Check if path exists as a directory in static file system
			if (fileSystem.hasOwnProperty(newPath)) {
				currentPath = newPath;
				onNavigate(newPath);
				return [`Changed to ${newPath}`];
			} else {
				return [`cd: ${target}: No such file or directory`];
			}
		},
		
		cat: async (args: string[]) => {
			if (args.length === 0) {
				return ['cat: missing file argument'];
			}
			
			const file = args[0];
			let filePath = file;
			
			// Handle relative vs absolute paths
			if (!file.startsWith('/')) {
				filePath = currentPath === '/' ? `/${file}` : `${currentPath}/${file}`;
			}
			
		// Handle files within writeups directories
		if (currentPath.startsWith('/writeups')) {
			try {
				let githubPath = '';
				let fileName = file;
				
				if (currentPath === '/writeups') {
					// Looking for a writeup directory's README
					const writeupName = file.replace('.md', '');
					const items = await fetchWriteups('');
					const writeupDir = items.find(item => 
						item.type === 'dir' && item.name === writeupName
					);
					
					if (!writeupDir) {
						return [`cat: ${file}: No such writeup found`];
					}
					
					// Fetch README content from the writeup directory
					const readmeContent = await fetchReadmeContent(`/${writeupDir.name}`);
					displayingContent = 'github-content';
					writeupCache[`content-${writeupName}`] = readmeContent;
					return [`=== ${writeupName} writeup ===`];
				} else {
					// We're inside a writeup directory, look for files there
					githubPath = currentPath.replace('/writeups', '');
					
					// Check if file exists in current GitHub directory
					const items = await fetchWriteups(githubPath);
					const targetFile = items.find(item => 
						item.type === 'file' && (item.name === fileName || item.name === fileName.replace('.md', ''))
					);
					
					if (targetFile) {
						if (targetFile.name.toLowerCase() === 'readme.md' || targetFile.name.toLowerCase().includes('readme')) {
							const readmeContent = await fetchReadmeContent(githubPath);
							displayingContent = 'github-content';
							writeupCache[`content-${fileName.replace('.md', '')}`] = readmeContent;
							return [`=== ${targetFile.name} ===`];
						} else {
							// For other files, fetch content directly
							const response = await fetch(targetFile.download_url);
							if (response.ok) {
								const content = await response.text();
								displayingContent = 'github-content';
								writeupCache[`content-${fileName.replace('.md', '')}`] = content;
								return [`=== ${targetFile.name} ===`];
							}
						}
					}
					
					return [`cat: ${file}: No such file found in this directory`];
				}
			} catch (error: any) {
				return [`Error loading file: ${error instanceof Error ? error.message : 'Unknown error'}`];
			}
		}
			
			// Handle regular static files
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
	
	async function executeCommand(cmd: string) {
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
			try {
				const result = await (commands as any)[command](args);
				result.forEach((line: string) => {
					output.push({ type: 'output', content: line });
				});
				
				// If cat command was used and content should be displayed
				if (command === 'cat' && displayingContent) {
					if (displayingContent === 'github-content') {
						// Find the writeup name from the args
						const writeupName = args[0]?.replace('.md', '');
						const content = writeupCache[`content-${writeupName}`];
						output.push({ type: 'content', content: '', contentPath: 'github', githubContent: content });
					} else {
						output.push({ type: 'content', content: '', contentPath: displayingContent });
					}
				}
			} catch (error: any) {
				output.push({ type: 'error', content: `Error executing ${command}: ${error.message || 'Unknown error'}` });
			}
		} else {
			output.push({ type: 'error', content: `${command}: command not found` });
		}
		
		output.push({ type: 'output', content: '' });
		
		// Ensure scrolling after command execution
		scrollToBottom();
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
	<div class="output-area" bind:this={outputAreaElement}>
		{#each output as line}
			{#if line.type === 'content'}
				<div class="content-display">
					{#if line.contentPath === 'github' && line.githubContent}
						<MarkdownRenderer content={line.githubContent} />
					{:else if line.contentPath === '/'}
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
		font-family: inherit;
		font-size: inherit;
	}
	
	.content-display {
		border: 1px solid var(--color-red-dark);
		border-radius: 4px;
		padding: 1rem;
		margin: 0.5rem 0;
		background: rgba(34, 34, 34, 0.5);
		overflow-y: auto;
	}
</style>