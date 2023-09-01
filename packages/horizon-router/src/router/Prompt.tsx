import * as React from 'react';
import { useContext } from 'react';
import { LifeCycle, LifeCycleProps } from './lifeCycleHook';
import { Location } from './index';
import { Action } from '../history/types';
import RouterContext from './context';

type PromptProps = {
  message?: string | ((location: Partial<Location>, action: Action) => void);
  when?: boolean | ((location: Partial<Location>) => boolean);
};

function Prompt<P extends PromptProps>(props: P) {
  const context = useContext(RouterContext);

  const { message, when = true } = props;

  if ((typeof when === 'function' && when(context.location) === false) || !when) {
    return null;
  }

  const navigate = context.history.block;

  let release: (() => void) | null = null;

  const onMountFunc = () => {
    release = message ? navigate(message) : null;
  };

  const onUpdateFunc = (prevProps?: LifeCycleProps) => {
    if (prevProps && prevProps.data !== message) {
      if (release) {
        release();
      }
      release = message ? navigate(message) : null;
    }
  };

  const onUnmountFunc = () => {
    if (release) {
      release();
    }
    release = null;
  };

  return <LifeCycle onMount={onMountFunc} onUpdate={onUpdateFunc} onUnmount={onUnmountFunc} data={message} />;
}

export default Prompt;
