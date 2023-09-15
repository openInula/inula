import Inula from '@cloudsop/horizon';
export interface GlobalFooterProps {
  links?: Array<{
    key?: string;
    title: Inula.ReactNode;
    href: string;
    blankTarget?: boolean;
  }>;
  copyright?: Inula.ReactNode;
  style?: Inula.CSSProperties;
  className?: string;
}

export default class GlobalFooter extends Inula.Component<GlobalFooterProps, any> {}
