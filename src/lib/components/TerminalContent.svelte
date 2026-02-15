<script lang="ts">
	import { onMount } from 'svelte';
	import Home from '$lib/components/pages/Home.svelte';
	import About from '$lib/components/pages/About.svelte';
	import Projects from '$lib/components/pages/Projects.svelte';
	import Contact from '$lib/components/pages/Contact.svelte';
	
	let { currentPath = '/', terminalId, onNavigate = () => {} } = $props();
	
	function handleNavigate(path: string) {
		onNavigate(path);
	}
	
	onMount(() => {
		const interceptLinks = () => {
			// Find all links within this terminal's content
			const terminalElement = document.querySelector(`[data-terminal-id="${terminalId}"]`);
			if (terminalElement) {
				const links = terminalElement.querySelectorAll('a[href^="/"]');
				links.forEach(link => {
					// Remove any existing listeners first
					(link as HTMLElement).onclick = null;
					
					// Add new click handler
					link.addEventListener('click', (event) => {
						const href = link.getAttribute('href');
						// Only handle internal links that don't include external protocols or mailto
						if (href && href.startsWith('/') && !href.includes('mailto:')) {
							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();
							handleNavigate(href);
						}
					}, { capture: true });
				});
			}
		};
		
		// Intercept links when component mounts
		interceptLinks();
		
		// Re-intercept links whenever content changes (after a small delay)
		const observer = new MutationObserver(() => {
			setTimeout(interceptLinks, 10);
		});
		
		const terminalElement = document.querySelector(`[data-terminal-id="${terminalId}"]`);
		if (terminalElement) {
			observer.observe(terminalElement, { childList: true, subtree: true });
		}
		
		return () => {
			observer.disconnect();
		};
	});
</script>

{#if currentPath === '/'}
	<div data-terminal-id={terminalId}>
		<Home />
	</div>
{:else if currentPath === '/about'}
	<div data-terminal-id={terminalId}>
		<About />
	</div>
{:else if currentPath === '/projects'}
	<div data-terminal-id={terminalId}>
		<Projects />
	</div>
{:else if currentPath === '/contact'}
	<div data-terminal-id={terminalId}>
		<Contact />
	</div>
{:else}
	<div data-terminal-id={terminalId}>
		<Home />
	</div>
{/if}