import { createPortal } from '../../src/Nodes/UtilNodes/Portal';
import { describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { domTest as it } from './utils';
import { render } from '../../src/render';
vi.mock('../../src/scheduler', async () => {
  return {
    schedule: (task: () => void) => {
      task();
    },
  };
});

describe('Portal', () => {
  let portalRoot: HTMLElement;

  beforeEach(() => {
    portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    document.body.removeChild(portalRoot);
  });

  it('renders content into portal container', ({ container }) => {
    function PortalComponent() {
      return <Portal target={portalRoot}>Portal Content</Portal>;
    }

    render(<PortalComponent />, container);
    expect(portalRoot.textContent).toBe('Portal Content');
  });

  it('unmounts portal content when component unmounts', ({ container }) => {
    let hide: () => void;
    function PortalComponent() {
      let show = true;
      hide = () => {
        show = false;
      };
      return (
        <if cond={show}>
          <Portal target={portalRoot}>
            <h1>Portal Content</h1>
          </Portal>
        </if>
      );
    }

    render(<PortalComponent />, container);
    expect(portalRoot.innerHTML).toBe('<h1>Portal Content</h1>');
    hide!();
    expect(portalRoot.innerHTML).toBe('');
  });

  it('portal children should update correctly', ({ container }) => {
    let add: () => void;
    function PortalComponent() {
      let count = 0;
      add = () => {
        count++;
      };
      return (
        <Portal target={portalRoot}>
          <h1>{count}</h1>
        </Portal>
      );
    }
    render(<PortalComponent />, container);
    expect(portalRoot.innerHTML).toBe('<h1>0</h1>');
    add!();
    expect(portalRoot.innerHTML).toBe('<h1>1</h1>');
  });

  // ... existing code ...

  it('supports multiple portals to the same target', ({ container }) => {
    function MultiPortalComponent() {
      return (
        <>
          <Portal target={portalRoot}>First Content</Portal>
          <Portal target={portalRoot}>Second Content</Portal>
        </>
      );
    }

    render(<MultiPortalComponent />, container);
    expect(portalRoot.textContent).toBe('First ContentSecond Content');
  });

  it.skip('handles portal target changes', ({ container }) => {
    let changeTarget: () => void;
    function PortalComponent() {
      let target = portalRoot;

      const newTarget = document.createElement('div');
      document.body.appendChild(newTarget);
      changeTarget = () => {
        target = newTarget;
      };

      return <Portal target={target}>Movable Content</Portal>;
    }

    render(<PortalComponent />, container);
    expect(portalRoot.textContent).toBe('Movable Content');
    changeTarget!();
    expect(portalRoot.textContent).toBe('');
    document.body.removeChild(document.body.lastChild!);
  });

  it('preserves event handling through portal', ({ container }) => {
    const handleClick = vi.fn();

    function PortalComponent() {
      return (
        <Portal target={portalRoot}>
          <button onClick={handleClick}>Click Me</button>
        </Portal>
      );
    }

    render(<PortalComponent />, container);
    const button = portalRoot.querySelector('button');
    button!.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles nested portals correctly', ({ container }) => {
    const nestedTarget = document.createElement('div');
    document.body.appendChild(nestedTarget);

    function NestedPortalComponent() {
      return (
        <Portal target={portalRoot}>
          <div>Outer Content</div>
          <Portal target={nestedTarget}>
            <div>Inner Content</div>
          </Portal>
        </Portal>
      );
    }

    render(<NestedPortalComponent />, container);
    expect(portalRoot.textContent).toBe('Outer Content');
    expect(nestedTarget.textContent).toBe('Inner Content');
    document.body.removeChild(nestedTarget);
  });
});
