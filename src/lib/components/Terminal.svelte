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
        onFocus = () => {},
        ...restProps
    } = $props();

    // Mobile detection
    let isMobile = $state(false);
    
    // Reactive properties that consider mobile state
    const effectiveDraggable = $derived(draggable && !isMobile);
    const effectiveResizable = $derived(resizable && !isMobile);
    
    let terminalElement: HTMLDivElement;
    let interactInstance: any = null;
    let isMinimized = $state(false);
    let isMaximized = $state(false);
    let originalSize = $state({ width: 1200, height: 500, x: 0, y: 0 });
    let isDragging = $state(false);
    let currentSize = $state({ width: 1200, height: 500 }); // Track current size
    
    onMount(() => {
        // Check for mobile on mount
        const checkMobile = () => {
            isMobile = window.innerWidth <= 768; // Standard mobile breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        if (terminalElement) {
            // Set initial position - mobile uses fixed positioning
            if (isMobile) {
                terminalElement.style.position = 'fixed';
                terminalElement.style.top = '0';
                terminalElement.style.left = '0';
                terminalElement.style.width = '100vw';
                terminalElement.style.height = '100vh';
                terminalElement.setAttribute('data-x', '0');
                terminalElement.setAttribute('data-y', '0');
            } else {
                // Desktop behavior - center using transform only
                const initialX = window.innerWidth / 2 - 600; // Half of default width (1200px)
                const initialY = window.innerHeight / 2 - 250; // Half of default height (500px)
                
                // Set position attributes and transform
                terminalElement.setAttribute('data-x', initialX.toString());
                terminalElement.setAttribute('data-y', initialY.toString());
                terminalElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
            }
            
            // Initialize interact.js only for desktop
            if (!isMobile) {
                interactInstance = interactjs(terminalElement);
                
                // Make draggable if enabled - use the drag handle (window header)
                if (effectiveDraggable) {
                    interactInstance.draggable({
                        allowFrom: '.drag-handle', // Only allow dragging from elements with this class
                        listeners: {
                            start: dragStartListener,
                            move: dragMoveListener,
                            end: dragEndListener
                        },
                        modifiers: [
                            interactjs.modifiers.restrictRect({
                                restriction: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
                                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                            })
                        ]
                    });
                }
                
                // Make resizable if enabled
                if (effectiveResizable) {
                    interactInstance.resizable({
                        edges: { left: true, right: true, bottom: true, top: true },
                        listeners: {
                            start: resizeStartListener,
                            move: resizeMoveListener,
                            end: resizeEndListener
                        },
                        modifiers: [
                            interactjs.modifiers.restrictEdges({
                                outer: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
                            }),
                            interactjs.modifiers.restrictSize({
                                min: { width: minWidth, height: minHeight }
                            })
                        ]
                    });
                }
            }
        }
        
        // Cleanup function
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    });
    
    onDestroy(() => {
        if (interactInstance) {
            interactInstance.unset();
        }
    });
    
    function dragStartListener(event: any) {
        // Bring terminal to front when drag starts
        onFocus();
        
        const target = event.target;
        target.classList.add('dragging');
        isDragging = true;
        
        // Store the current computed size to prevent reset
        const computedStyle = window.getComputedStyle(target);
        currentSize.width = parseInt(computedStyle.width);
        currentSize.height = parseInt(computedStyle.height);
        
        // Preserve size during drag
        target.style.width = `${currentSize.width}px`;
        target.style.height = `${currentSize.height}px`;
    }
    
    function dragMoveListener(event: any) {
        const target = event.target;
        // Get the dragged position from the data attributes
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        
        // Update position using transform only
        target.style.transform = `translate(${x}px, ${y}px)`;
        
        // Maintain size during drag
        target.style.width = `${currentSize.width}px`;
        target.style.height = `${currentSize.height}px`;
        
        // Update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
    
    function dragEndListener(event: any) {
        const target = event.target;
        target.classList.remove('dragging');
        
        // Add a small delay before allowing clicks again
        setTimeout(() => {
            isDragging = false;
        }, 100);
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
        
        // Update our size tracking
        currentSize.width = event.rect.width;
        currentSize.height = event.rect.height;
        
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
        isMinimized = !isMinimized;
        if (terminalElement) {
            if (isMinimized) {
                // Store current size and position before minimizing
                const rect = terminalElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(terminalElement);
                originalSize = {
                    width: parseInt(computedStyle.width),
                    height: parseInt(computedStyle.height),
                    x: parseFloat(terminalElement.getAttribute('data-x') || '0') || 0,
                    y: parseFloat(terminalElement.getAttribute('data-y') || '0') || 0
                };
            }
        }
    }
    
    function handleMaximize() {
        // Disable maximize on mobile since it's always fullscreen
        if (isMobile) return;
        
        isMaximized = !isMaximized;
        if (terminalElement) {
            if (isMaximized) {
                // Store current size and position before maximizing
                const rect = terminalElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(terminalElement);
                originalSize = {
                    width: parseInt(computedStyle.width),
                    height: parseInt(computedStyle.height),
                    x: parseFloat(terminalElement.getAttribute('data-x') || '0') || 0,
                    y: parseFloat(terminalElement.getAttribute('data-y') || '0') || 0
                };
                
                // Maximize to full viewport
                terminalElement.style.width = '100vw';
                terminalElement.style.height = '100vh';
                terminalElement.style.transform = 'translate(0px, 0px)';
                terminalElement.setAttribute('data-x', '0');
                terminalElement.setAttribute('data-y', '0');
            } else {
                // Restore original size and position
                terminalElement.style.width = `${originalSize.width}px`;
                terminalElement.style.height = `${originalSize.height}px`;
                terminalElement.style.transform = `translate(${originalSize.x}px, ${originalSize.y}px)`;
                terminalElement.setAttribute('data-x', originalSize.x.toString());
                terminalElement.setAttribute('data-y', originalSize.y.toString());
            }
        }
    }
    
</script>

<div 
    bind:this={terminalElement}
    class={"terminal " + className + (effectiveDraggable ? ' draggable' : '') + (effectiveResizable ? ' resizable' : '') + (isMinimized ? ' minimized' : '') + (isMaximized ? ' maximized' : '') + (isMobile ? ' mobile' : '')}
    {...restProps}
>
    <div class="terminal-header drag-handle">
        <span class="terminal-title">{title}</span>
        <div class="terminal-controls">
            {#if !isMobile}
                <button class="control-button maximize" onclick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
                    {isMaximized ? "⧉" : "+"}
                </button>
            {/if}
            <button class="control-button close" onclick={handleClose} title="Close">
                ×
            </button>
        </div>
    </div>
    <div class="terminal-content" role="button" tabindex="0" aria-label="Terminal content area">
        {#if !isMinimized}
            {@render children()}
        {/if}
    </div>
</div>

<style>
    .terminal {
        font-family: 'Terminess Nerd Font', system-ui, monospace;
        background-color: #222222;
        color: var(--color-red);
        
        width: 1200px;
        height: 500px;
        min-width: 300px;
        min-height: 200px;
        
        border: 2px solid var(--color-red);
        overflow: hidden;
        
        /* Enable interaction */
        touch-action: none;
        box-sizing: border-box;
        
        /* Position for transform origin */
        position: absolute;
        top: 0;
        left: 0;
        
        /* Prevent flashing during drag operations */
        will-change: transform;
        transform-origin: 0 0;
        backface-visibility: hidden;
        
        /* Flex layout for content */
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
    }
    
    /* Disable transitions during drag to prevent flashing */
    .terminal.dragging {
        transition: none !important;
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
        background: linear-gradient(-45deg, transparent 30%, var(--color-red) 30%, var(--color-red) 40%, transparent 40%, transparent 60%, var(--color-red) 60%, var(--color-red) 70%, transparent 70%);
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
        box-shadow: 0 8px 16px var(--color-red-shadow);
    }
    
    .terminal.resizing::after {
        border-color: var(--color-red);
        border-style: dashed;
    }
    
    /* Minimized state */
    .terminal.minimized {
        height: auto !important;
        min-height: auto !important;
    }
    
    .terminal.minimized .terminal-content {
        display: none;
    }
    
    /* Maximized state */
    .terminal.maximized {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 1000;
        border-radius: 0;
    }
    
    .terminal.maximized::before {
        display: none; /* Hide resize handle when maximized */
    }
    
    .terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        background-color: var(--color-red);
        color: var(--color-background);
        min-height: 2.5rem;
        height: auto;
        border-bottom: 2px solid var(--color-red-dark);
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
        border-color: var(--color-background);
        color: var(--color-background);
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
        background-color: var(--color-background);
        border-color: var(--color-red);
    }
    
    .control-button.close:hover {
        color: var(--color-red);
    }
    
    .control-button.minimize:hover {
        color: var(--color-red);
    }
    
    .control-button.maximize:hover {
        color: var(--color-red);
    }
    
    .terminal-content {
        flex: 1;
        overflow: auto;
        padding: 0.5rem;
        background-color: inherit;
    }
    
    /* Mobile styles */
    .terminal.mobile {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        border-radius: 0;
        z-index: 1000;
        transform: none !important;
        transition: none !important;
    }
    
    .terminal.mobile::before,
    .terminal.mobile::after {
        display: none; /* Hide resize handles on mobile */
    }
    
    .terminal.mobile .terminal-header {
        cursor: default; /* Disable drag cursor on mobile */
    }
    
    /* Mobile responsive adjustments */
    @media (max-width: 768px) {
        .terminal {
            /* Force mobile layout even if mobile class isn't applied yet */
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0;
            transform: none !important;
        }
        
        .terminal::before,
        .terminal::after {
            display: none; /* Hide all resize handles */
        }
        
        .terminal-header {
            cursor: default;
        }
        
        .control-button.maximize {
            display: none; /* Hide maximize button on mobile */
        }
        
        .terminal-title {
            font-size: 1.25rem; /* Slightly smaller title on mobile */
        }
    }
</style>