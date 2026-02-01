<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Terminal from '$lib/components/Terminal.svelte';
	import { page } from '$app/stores';

	let { children } = $props();
	
	// Generate terminal title based on current route
	const getTerminalTitle = $derived(() => {
		const pathname = $page.route?.id || '/';
		const routeName = pathname === '/' ? 'home' : pathname.replace('/', '');
		return `root@ryanfairhurst:~/${routeName}`;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<style>
		@font-face {
			font-family: 'Terminess Nerd Font';
			src: url('/fonts/TerminessNerdFontMono-Regular.ttf') format('truetype');
			font-weight: normal;
			font-style: normal;
		}
		@font-face {
			font-family: 'Terminess Nerd Font';
			src: url('/fonts/TerminessNerdFontMono-Bold.ttf') format('truetype');
			font-weight: bold;
			font-style: normal;
		}
		@font-face {
			font-family: 'Terminess Nerd Font';
			src: url('/fonts/TerminessNerdFontMono-Italic.ttf') format('truetype');
			font-weight: normal;
			font-style: italic;
		}
		@font-face {
			font-family: 'Terminess Nerd Font';
			src: url('/fonts/TerminessNerdFontMono-BoldItalic.ttf') format('truetype');
			font-weight: bold;
			font-style: italic;
		}
	</style>
</svelte:head>

<Terminal 
	title={getTerminalTitle()}
	showBackButton={false} 
	draggable={true} 
	resizable={true}
>
	{@render children()}
</Terminal>

<style>
	:root {
		--color-red: #c13030;
		--color-red-dark: #8b1f1f;
		--color-background: #222222;
		--color-text: #d4a574;
		--color-red-light: #d14545;
		--color-red-shadow: rgba(193, 48, 48, 0.3);
	}

	:global(body) {
		margin: 0;
		font-family: 'Terminess Nerd Font', system-ui, monospace;
		background-color: var(--color-background);
		color: var(--color-text);
		font-size: 1rem;
	}

	:global(h1) {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-red);
	}

	:global(h2) {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid var(--color-red);
	}

	:global(h3) {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	:global(p) {
		font-size: 1.25rem;
		color: var(--color-red);
	}

	:global(ul) {
		list-style-type: none;
		padding-left: 0;
	}
	
	:global(li) {
		margin: 0.25rem 0;
		font-size: 1.5rem;
		color: var(--color-red);
	}

	:global(li:hover) {
		background-color: var(--color-red);
		color: var(--color-background);
	}

	:global(li:hover a) {
		color: var(--color-background);
	}

	:global(a) {
		color: var(--color-red);
		text-decoration: underline;
	}
	
	:global(a:hover) {
		color: var(--color-background) !important;
		background-color: var(--color-red);
	}
	
	:global(a:visited) {
		color: var(--color-red-dark);
	}

	:global(a:hover:visited) {
		color: var(--color-background) !important;
	}

	/* Custom red scrollbar */
	:global(*::-webkit-scrollbar) {
		width: 12px;
		height: 12px;
	}

	:global(*::-webkit-scrollbar-track) {
		background: var(--color-background);
		border-radius: 6px;
	}

	:global(*::-webkit-scrollbar-thumb) {
		background: var(--color-red);
		border-radius: 6px;
		border: 2px solid var(--color-background);
	}

	:global(*::-webkit-scrollbar-thumb:hover) {
		background: var(--color-red-light);
	}

	:global(*::-webkit-scrollbar-corner) {
		background: var(--color-background);
	}

	/* Firefox scrollbar */
	:global(*) {
		scrollbar-color: var(--color-red) var(--color-background);
	}
</style>
