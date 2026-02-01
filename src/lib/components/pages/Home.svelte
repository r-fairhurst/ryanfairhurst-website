<h1>Welcome!</h1>
<p>This site serves as a portfolio, showcasing my projects, skills, and experiences.</p>
<p>It's created with <strong>SvelteKit</strong> and <strong>interact.js</strong> to provide a draggable and resizable window.</p>
<p>This terminal window can be dragged by its header and resized from any edge!</p>

<div class="navigation">
	<ul>
		<li><a href="/about">> About</a></li>
		<li><a href="/projects">> Projects</a></li>
		<li><a href="/contact">> Contact</a></li>
	</ul>
</div>

<style>
	.navigation {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #851919;
	}

	a {
		color: inherit;
		text-decoration: none;
		display: block;
		padding: 0.25rem 0.5rem;
		border-radius: 3px;
		transition: background-color 0.2s;
	}

	a:hover {
		background-color: rgba(133, 25, 25, 0.3);
	}
</style>
