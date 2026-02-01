<script>
	import Terminal from '$lib/components/Terminal.svelte';
</script>

<Terminal 
	title="ryanfairhurst@hometerminal" 
	showBackButton={false} 
	draggable={true} 
	resizable={true}
	class="terminal-wrapper"
>
	<h1>Welcome to My Site</h1>
	<p>
		It's created with SvelteKit and interact.js to provide a draggable and resizable window.
	</p>
	<p>This terminal window can be dragged by its header and resized from any edge!</p>

	<ul>
		<li>> Home</li>
		<li>> About</li>
		<li>> Projects</li>
		<li>> Contact</li>
	</ul>
</Terminal>
