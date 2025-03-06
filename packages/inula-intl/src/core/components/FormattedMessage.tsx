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
import { Children, Fragment } from '@cloudsop/horizon';
import { FormattedMessageProps } from '../../types/interfaces';
import { useIntl } from '../../../index';

/**
 * FormattedMessage组件,接收一个消息键作为属性，并根据当前选择的语言环境，从对应的翻译资源中获取相应的消息文本，并可选地对文本进行格式化。
 * @param props
 * @constructor
 */
function FormattedMessage(props: FormattedMessageProps) {
  const { formatMessage } = useIntl();
  const { id, values, messages, formatOptions, context, tagName: TagName = Fragment, children, comment }: any = props;

  const formatMessageOptions = {
    comment,
    messages,
    context,
    formatOptions,
  };

  const formattedMessage = formatMessage(id, values, formatMessageOptions);

  if (typeof children === 'function') {
    const childNodes = Array.isArray(formattedMessage) ? formattedMessage : [formattedMessage];
    return children(childNodes);
  }

  if (TagName) {
    return <TagName>{Children.toArray(formattedMessage)}</TagName>;
  }

  return <>{formattedMessage}</>;
}

export default FormattedMessage;
