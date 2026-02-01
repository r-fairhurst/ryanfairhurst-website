<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
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

{@render children()}

<style>
	:global(body) {
		margin: 0;
		font-family: 'Terminess Nerd Font', system-ui, monospace;
		background-color: #222222;
		color: #e0e0e0;
		font-size: 1rem;
	}


	:global(ul) {
		list-style-type: none;
		padding-left: 0;
	}
	
	:global(li) {
		margin: 0.25rem 0;
		font-size: 1.5rem;
	}

	:global(li:hover) {
		background-color: #851919;
		color: #222222;
	}

	/* Custom red scrollbar */
	:global(*::-webkit-scrollbar) {
		width: 12px;
		height: 12px;
	}

	:global(*::-webkit-scrollbar-track) {
		background: #222222;
		border-radius: 6px;
	}

	:global(*::-webkit-scrollbar-thumb) {
		background: #851919;
		border-radius: 6px;
		border: 2px solid #222222;
	}

	:global(*::-webkit-scrollbar-thumb:hover) {
		background: #a52525;
	}

	:global(*::-webkit-scrollbar-corner) {
		background: #222222;
	}

	/* Firefox scrollbar */
	:global(*) {
		scrollbar-width: thin;
		scrollbar-color: #851919 #222222;
	}
</style>
