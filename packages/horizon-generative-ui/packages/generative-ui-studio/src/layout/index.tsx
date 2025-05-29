import Header from '@/components/header';
import { Outlet } from 'react-router-dom';
import classNames from '@/utils/classnames';
import HeaderWrapper from '@/components/header/header-wrapper';

const Layout = () => {
  return (
    <>
      <div
        className={classNames(
          'sticky top-0 left-0 right-0 z-30 flex flex-col grow-0 shrink-0 basis-auto min-h-[56px]',
        )}
      >
        <HeaderWrapper>
          <Header />
        </HeaderWrapper>
      </div>
      <div className="relative flex grow flex-col overflow-y-auto overflow-x-hidden bg-background-body">
        <div className="flex h-full flex-col">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
