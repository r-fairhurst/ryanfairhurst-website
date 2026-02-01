<script lang="ts">
    import interact from 'interactjs';
    import { onMount, onDestroy } from 'svelte';
    
    const interactjs = (interact as any).default || interact;
    
    let {
        children,
        class: className = '',
        title = 'Terminal',
        showBackButton = false,
        backPath = '/',
        draggable = true,
        resizable = true,
        minWidth = 300,
        minHeight = 200,
        onClose = () => {},
        ...restProps
    } = $props();
    
    let terminalElement: HTMLDivElement;
    let interactInstance: any = null;
    
    onMount(() => {
        if (terminalElement) {
            // Initialize interact.js
            interactInstance = interactjs(terminalElement);
            
            // Make draggable if enabled - use the drag handle (window header)
            if (draggable) {
                interactInstance.draggable({
                    allowFrom: '.drag-handle', // Only allow dragging from elements with this class
                    listeners: {
                        start: dragStartListener,
                        move: dragMoveListener,
                        end: dragEndListener
                    },
                    modifiers: [
                        interactjs.modifiers.restrictRect({
                            restriction: 'parent',
                            endOnly: true
                        })
                    ],
                    inertia: true
                });
            }
            
            // Make resizable if enabled
            if (resizable) {
                interactInstance.resizable({
                    edges: { left: true, right: true, bottom: true, top: true },
                    listeners: {
                        start: resizeStartListener,
                        move: resizeMoveListener,
                        end: resizeEndListener
                    },
                    modifiers: [
                        interactjs.modifiers.restrictEdges({
                            outer: 'parent'
                        }),
                        interactjs.modifiers.restrictSize({
                            min: { width: minWidth, height: minHeight }
                        })
                    ],
                    inertia: true
                });
            }
        }
    });
    
    onDestroy(() => {
        if (interactInstance) {
            interactInstance.unset();
        }
    });
    
    function dragStartListener(event: any) {
        const target = event.target;
        target.classList.add('dragging');
    }
    
    function dragMoveListener(event: any) {
        const target = event.target;
        // Get the dragged position from the data attributes
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        
        // Translate the element
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        // Update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    
    function dragEndListener(event: any) {
        const target = event.target;
        target.classList.remove('dragging');
    }
    
    function resizeStartListener(event: any) {
        const target = event.target;
        target.classList.add('resizing');
    }
    
    function resizeMoveListener(event: any) {
        const target = event.target;
        let x = parseFloat(target.getAttribute('data-x')) || 0;
        let y = parseFloat(target.getAttribute('data-y')) || 0;
        
        // Update the element's style
        target.style.width = `${event.rect.width}px`;
        target.style.height = `${event.rect.height}px`;
        
        // Translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    
    function resizeEndListener(event: any) {
        const target = event.target;
        target.classList.remove('resizing');
    }
    
    function handleClose() {
        onClose();
    }
    
    function handleMinimize() {
        console.log('Minimize clicked');
    }
    
    function handleMaximize() {
        console.log('Maximize clicked');
    }
</script>

<div 
    bind:this={terminalElement}
    class={"terminal " + className + (draggable ? ' draggable' : '') + (resizable ? ' resizable' : '')}
    {...restProps}
>
    <div class="terminal-header drag-handle">
        <span class="terminal-title">{title}</span>
        <div class="terminal-controls">
            <button class="control-button minimize" onclick={handleMinimize} title="Minimize">
                −
            </button>
            <button class="control-button maximize" onclick={handleMaximize} title="Maximize">
                +
            </button>
            {#if showBackButton}
                <button class="control-button close" onclick={handleClose} title="Close">
                    ×
                </button>
            {/if}
        </div>
    </div>
    <div class="terminal-content">
        {@render children()}
    </div>
</div>

<style>
    .terminal {
        font-family: 'Terminess Nerd Font', system-ui, monospace;
        background-color: inherit;
        color: #851919;
        
        width: 600px;
        height: 400px;
        min-width: 300px;
        min-height: 200px;
        
        border: 2px solid #851919;
        overflow: hidden;
        
        /* Enable interaction */
        touch-action: none;
        box-sizing: border-box;
        
        /* Position the box in the center of the screen initially */
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        
        /* Flex layout for content */
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
    }
    
    .terminal.resizable {
        border-width: 4px;
    }
    
    /* Add resize handles */
    .terminal.resizable::before {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: linear-gradient(-45deg, transparent 30%, #851919 30%, #851919 40%, transparent 40%, transparent 60%, #851919 60%, #851919 70%, transparent 70%);
        cursor: nw-resize;
        opacity: 0.7;
        z-index: 1;
    }
    
    .terminal.resizable::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 1px dashed transparent;
        pointer-events: none;
        transition: border-color 0.2s;
    }
    
    /* Visual feedback during interaction */
    .terminal:active,
    .terminal.dragging {
        opacity: 0.9;
        box-shadow: 0 8px 16px rgba(133, 25, 25, 0.3);
    }
    
    .terminal.resizing::after {
        border-color: #851919;
        border-style: dashed;
    }
    
    .terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        background-color: #851919;
        color: #222222;
        min-height: 2.5rem;
        height: auto;
        border-bottom: 2px solid #651515;
        flex-shrink: 0;
        user-select: none;
        cursor: move;
    }
    
    .terminal-title {
        font-weight: bold;
        text-align: left;
        flex-grow: 1;
        font-size: 1.5rem;
    }
    
    .terminal-controls {
        display: flex;
        gap: 0.375rem;
        flex-shrink: 0;
        align-items: center;
    }
    
    .control-button {
        background: transparent;
        border-color: #222222;
        color: #222222;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0.25rem;
        min-width: 1.75rem;
        height: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-family: monospace;
        transition: all 0.2s ease;
    }
    
    .control-button:hover {
        transform: translateY(-1px);
        border-color: #FFFFFF;
    }
    
    .control-button.close:hover {
        color: white;
    }
    
    .control-button.minimize:hover {
        color: white;
    }
    
    .control-button.maximize:hover {
        color: white;
    }
    
    .terminal-content {
        flex: 1;
        overflow: auto;
        padding: 0.5rem;
        background-color: inherit;
    }
</style>