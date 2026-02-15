<script lang="ts">
	let { content = '' } = $props();
	
	function parseMarkdown(md: string): string {
		if (!md) return '';
		
		let html = md
			// Headers
			.replace(/^### (.*$)/gm, '<h3>$1</h3>')
			.replace(/^## (.*$)/gm, '<h2>$1</h2>')  
			.replace(/^# (.*$)/gm, '<h1>$1</h1>')
			
			// Bold and italic
			.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/__(.*?)__/g, '<strong>$1</strong>')
			.replace(/_(.*?)_/g, '<em>$1</em>')
			
			// Code blocks
			.replace(/```([^`]*?)```/gs, '<pre class="code-block"><code>$1</code></pre>')
			.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
			
			// Links
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
			
			// Lists
			.replace(/^\* (.*$)/gm, '<li>$1</li>')
			.replace(/^- (.*$)/gm, '<li>$1</li>')
			.replace(/^\+ (.*$)/gm, '<li>$1</li>')
			
			// Line breaks
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');
		
		// Wrap in paragraphs and fix lists
		html = '<p>' + html + '</p>';
		html = html.replace(/<p>(<li>.*?<\/li>)<\/p>/gs, '<ul>$1</ul>');
		html = html.replace(/<\/li><br><li>/g, '</li><li>');
		html = html.replace(/<p><\/p>/g, '');
		
		return html;
	}
	
	let parsedContent = $derived(parseMarkdown(content));
</script>

<div class="markdown-content">
	{@html parsedContent}
</div>

<style>
	.markdown-content {
		color: var(--color-red);
		font-family: 'Terminess Nerd Font', system-ui, monospace;
		line-height: 1.6;
	}
	
	.markdown-content :global(h1) {
		font-size: 2.5rem;
		margin: 1.5rem 0 1rem 0;
		border-bottom: 2px solid var(--color-red);
		padding-bottom: 0.5rem;
		color: var(--color-text);
	}
	
	.markdown-content :global(h2) {
		font-size: 2rem;
		margin: 1.25rem 0 0.75rem 0;
		border-bottom: 1px solid var(--color-red);
		padding-bottom: 0.25rem;
		color: var(--color-text);
	}
	
	.markdown-content :global(h3) {
		font-size: 1.5rem;
		margin: 1rem 0 0.5rem 0;
		color: var(--color-text);
	}
	
	.markdown-content :global(p) {
		margin: 0.75rem 0;
		color: var(--color-red);
		font-size: 1.1rem;
	}
	
	.markdown-content :global(ul) {
		list-style-type: none;
		padding-left: 0;
		margin: 0.75rem 0;
	}
	
	.markdown-content :global(li) {
		margin: 0.25rem 0;
		padding-left: 1rem;
		color: var(--color-red);
		font-size: 1.1rem;
		position: relative;
	}
	
	.markdown-content :global(li:before) {
		content: '>';
		position: absolute;
		left: 0;
		color: var(--color-text);
		font-weight: bold;
	}
	
	.markdown-content :global(li:hover) {
		background-color: var(--color-red);
		color: var(--color-background);
		border-radius: 2px;
		padding-right: 0.5rem;
	}
	
	.markdown-content :global(a) {
		color: var(--color-red);
		text-decoration: underline;
		transition: all 0.2s ease;
	}
	
	.markdown-content :global(a:hover) {
		color: var(--color-background) !important;
		background-color: var(--color-red);
		padding: 0.1rem 0.2rem;
		border-radius: 2px;
	}
	
	.markdown-content :global(strong) {
		color: var(--color-text);
		font-weight: bold;
	}
	
	.markdown-content :global(em) {
		color: var(--color-text);
		font-style: italic;
	}
	
	.markdown-content :global(.code-block) {
		background: rgba(34, 34, 34, 0.8);
		border: 1px solid var(--color-red-dark);
		border-radius: 4px;
		padding: 1rem;
		margin: 1rem 0;
		overflow-x: auto;
		font-family: monospace;
		font-size: 0.9rem;
		color: var(--color-red);
	}
	
	.markdown-content :global(.code-block code) {
		background: transparent;
		padding: 0;
		border: none;
		color: inherit;
	}
	
	.markdown-content :global(.inline-code) {
		background: rgba(193, 48, 48, 0.2);
		border: 1px solid var(--color-red-dark);
		border-radius: 3px;
		padding: 0.1rem 0.3rem;
		font-family: monospace;
		font-size: 0.9em;
		color: var(--color-text);
	}
</style>