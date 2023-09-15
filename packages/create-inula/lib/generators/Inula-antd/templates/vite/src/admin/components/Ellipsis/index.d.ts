import Inula from 'inulajs';
import { TooltipProps } from 'antd/lib/tooltip';

export interface EllipsisTooltipProps extends TooltipProps {
  title?: undefined;
  overlayStyle?: undefined;
}

export interface EllipsisProps {
  tooltip?: boolean | EllipsisTooltipProps;
  length?: number;
  lines?: number;
  style?: Inula.CSSProperties;
  className?: string;
  fullWidthRecognition?: boolean;
}

export function getStrFullLength(str: string): number;
export function cutStrByFullLength(str: string, maxLength: number): string;

export default class Ellipsis extends Inula.Component<EllipsisProps, any> {}
