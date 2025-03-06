/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula, { useRef } from '@cloudsop/horizon';
import { useContext } from '@cloudsop/horizon';
import { LifeCycle, LifeCycleProps } from './lifeCycleHook';
import { Location } from './index';
import { Action } from '../history/types';
import RouterContext from './context';

type PromptProps = {
  message?: string | ((location: Partial<Location>, action: Action) => string | boolean);
  when?: boolean | ((location: Partial<Location>) => boolean);
};

function Prompt<P extends PromptProps>(props: P) {
  const context = useContext(RouterContext);

  const { message, when = true } = props;

  if ((typeof when === 'function' && when(context.location) === false) || !when) {
    return null;
  }

  const navigate = context.history.block;

  const release = useRef<(() => void) | null>(null);

  const onMountFunc = () => {
    release.current = message ? navigate(message) : null;
  };

  const onUpdateFunc = (prevProps?: LifeCycleProps) => {
    if (prevProps && prevProps.data !== message) {
      if (release.current) {
        release.current();
      }
      release.current = message ? navigate(message) : null;
    }
  };

  const onUnmountFunc = () => {
    if (release.current) {
      release.current();
    }
    release.current = null;
  };

  return <LifeCycle onMount={onMountFunc} onUpdate={onUpdateFunc} onUnmount={onUnmountFunc} data={message} />;
}

export default Prompt;
