// TypeScript declarations for interact.js usage in Svelte
declare module 'interactjs' {
  interface InteractEvent {
    target: HTMLElement;
    dx: number;
    dy: number;
    x0: number;
    y0: number;
    pageX: number;
    pageY: number;
    deltaRect: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
    rect: {
      width: number;
      height: number;
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
    relatedTarget?: HTMLElement;
    angle?: number;
    scale?: number;
  }
}