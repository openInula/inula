import { useLocation } from 'react-router-dom';
import classNames from '@/utils/classnames';

type HeaderWrapperProps = {
  children: React.ReactNode;
};

const HeaderWrapper = ({ children }: HeaderWrapperProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  const isBordered = ['/apps', '/datasets', '/datasets/create', '/tools'].includes(pathname);

  return (
    <div
      className={classNames(
        'sticky top-0 left-0 right-0 z-30 flex flex-col grow-0 shrink-0 basis-auto min-h-[56px]',
        isBordered ? 'border-b border-divider-regular' : '',
      )}
    >
      {children}
    </div>
  );
};
export default HeaderWrapper;
