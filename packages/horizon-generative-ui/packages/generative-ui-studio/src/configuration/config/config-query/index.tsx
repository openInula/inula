import { FC, memo } from 'react';
import Panel from '../base/feature-panel';
import Tooltip from '@/components/base/tooltip';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import cn from '@/utils/classnames';
import FileUpload from './file-upload';

export type IConfigQueryProps = {
  promptQueries: string;
  onPromptQueriesChange: (yml: string) => void;
  readonly?: boolean;
};

const ConfigQuery: FC<IConfigQueryProps> = ({ readonly, promptQueries, onPromptQueriesChange }) => {
  return (
    <Panel
      className="mt-2"
      title={
        <div className="flex items-center">
          <div className="mr-1">请求</div>
          {!readonly && <Tooltip popupContent={<div className="w-[180px]"></div>} />}
        </div>
      }
      headerRight={<FileUpload onFileContent={onPromptQueriesChange} />}
      noBodySpacing
    >
      <div className="mt-1 px-3 pb-3">
        {promptQueries ? (
          <div
            className={cn(
              'group relative mb-1 flex flex-col w-full rounded-lg border-[0.5px] border-components-panel-border-subtle bg-components-panel-on-panel-item-bg pl-2.5 pr-3 shadow-xs last-of-type:mb-0 hover:bg-components-panel-on-panel-item-bg-hover hover:shadow-sm',
              readonly && 'cursor-not-allowed opacity-30',
            )}
          >
            <div className="ml-6 my-4 text-text-secondary">请求列表</div>
            <SwaggerUI spec={promptQueries} tryItOutEnabled={false} />
          </div>
        ) : (
          <div className="text-xs text-text-tertiary">
            导入API Swagger yaml，赋予Agent理解请求数据的含义
          </div>
        )}
      </div>
    </Panel>
  );
};

export default memo(ConfigQuery);
