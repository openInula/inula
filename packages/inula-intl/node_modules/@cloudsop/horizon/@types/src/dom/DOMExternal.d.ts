import { asyncUpdates } from '../renderer/Renderer';
import { createPortal } from '../renderer/components/CreatePortal';
import type { Container } from './DOMOperator';
import { Callback } from '../renderer/UpdateHandler';
declare function executeRender(children: any, container: Container, callback?: Callback): Element | Text;
declare function findDOMNode(domOrEle?: Element): null | Element | Text;
declare function destroy(container: Container): boolean;
export { createPortal, asyncUpdates as unstable_batchedUpdates, findDOMNode, executeRender as render, destroy as unmountComponentAtNode, };
