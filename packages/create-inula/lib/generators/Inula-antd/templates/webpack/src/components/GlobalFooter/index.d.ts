import Inula from 'inulajs';
import type { InulaNode, CSSProperties, Component } from 'inulajs';
export interface GlobalFooterProps {
  links?: Array<{
    key?: string;
    title: InulaNode;
    href: string;
    blankTarget?: boolean;
  }>;
  copyright?: InulaNode;
  style?: CSSProperties;
  className?: string;
}

export default class GlobalFooter extends Component<GlobalFooterProps, any> {}
