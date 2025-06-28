/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import Inula, { isValidElement, Children, FC } from 'openinula';

interface ConditionalProps {
  children?: any;
  condition: boolean;
}

export const If: FC<ConditionalProps> = ({ children, condition }) => {
  return condition ? <>{children}</> : null;
};

export const ElseIf: FC<ConditionalProps> = If;

export const Else: FC<Omit<ConditionalProps, 'condition'>> = ({ children }) => {
  return <>{children}</>;
};

interface ConditionalRendererProps {
  children?: any;
}

export const ConditionalRenderer: FC<ConditionalRendererProps> = ({ children }) => {
  const childrenArray = Children.toArray(children);
  const renderedChild = childrenArray.find(child => {
    if (isValidElement(child)) {
      if (child.type === If || child.type === ElseIf) {
        return child.props.condition;
      }
      if (child.type === Else) {
        return true;
      }
    }
    return false;
  });

  return renderedChild ? <>{renderedChild}</> : null;
};
