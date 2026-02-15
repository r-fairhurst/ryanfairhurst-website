<script lang="ts">
	let { onDoubleClick = () => {} } = $props();
	
	function handleDoubleClick() {
		onDoubleClick();
	}
	
	function handleKeyDown(event: KeyboardEvent) {
		// Handle keyboard interaction for accessibility
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleDoubleClick();
		}
	}
</script>

<div 
	class="desktop-icon" 
	ondblclick={handleDoubleClick} 
	onkeydown={handleKeyDown}
	role="button" 
	tabindex="0" 
	aria-label="Terminal application - Double click to open"
>
	<div class="icon-container">
		<!-- Shortcut arrow indicator -->
		<div class="shortcut-arrow">
			<svg viewBox="0 0 12 12" fill="currentColor">
				<path d="M0 0 L12 0 L12 12 Z" />
			</svg>
		</div>
		
		<!-- Terminal icon -->
		<svg class="terminal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
			<line x1="8" y1="21" x2="16" y2="21"></line>
			<line x1="12" y1="17" x2="12" y2="21"></line>
			<polyline points="6,8 10,12 6,16"></polyline>
			<line x1="12" y1="14" x2="18" y2="14"></line>
		</svg>
	</div>
	<span class="icon-label">Terminal</span>
</div>

<style>
	.desktop-icon {
		position: fixed;
		top: 2rem;
		left: 2rem;
		transform: none;
		
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		
		padding: 1rem;
		cursor: pointer;
		user-select: none;
		
		color: var(--color-red);
		font-family: 'Terminess Nerd Font', system-ui, monospace;
		
		transition: all 0.2s ease;
	}
	
	.desktop-icon:hover {
		background-color: rgba(193, 48, 48, 0.1);
		transform: scale(1.05);
	}
	
	.desktop-icon:active {
		transform: scale(0.98);
	}
	
	.icon-container {
		position: relative;
		width: 4rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		
		background: linear-gradient(135deg, var(--color-background) 0%, #333 100%);
		border: 2px solid var(--color-red);	
		box-shadow: 
			inset 0 1px 2px rgba(255,255,255,0.1),
			0 4px 8px rgba(0,0,0,0.3);
	}
	
	.shortcut-arrow {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 16px;
		height: 16px;
		
		color: #ffffff;
		background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
		border: 1px solid #999;
		
		display: flex;
		align-items: center;
		justify-content: center;
		
		box-shadow: 0 1px 3px rgba(0,0,0,0.4);
		z-index: 1;
	}
	
	.shortcut-arrow svg {
		width: 8px;
		height: 8px;
		color: #333;
	}
	
	.terminal-icon {
		width: 2.5rem;
		height: 2.5rem;
		color: var(--color-red);
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
	}
	
	.icon-label {
		font-size: 0.9rem;
		font-weight: normal;
		text-align: center;
		color: var(--color-red);
		text-shadow: 0 1px 2px rgba(0,0,0,0.5);
		
		background: rgba(34, 34, 34, 0.8);
		padding: 0.2rem 0.5rem;
		border: 1px solid rgba(193, 48, 48, 0.3);
	}
	
	@media (max-width: 768px) {
		.icon-container {
			width: 3.5rem;
			height: 3.5rem;
		}
		
		.terminal-icon {
			width: 2rem;
			height: 2rem;
		}
		
		.icon-label {
			font-size: 0.8rem;
		}
	}
</style>