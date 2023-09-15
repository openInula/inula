/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import Inula, { Children, Fragment } from '@cloudsop/horizon';
import { FormattedMessageProps } from '../../types/interfaces';
import useI18n from '../hook/useI18n';

/**
 * FormattedMessage组件,接收一个消息键作为属性，并根据当前选择的语言环境，从对应的翻译资源中获取相应的消息文本，并可选地对文本进行格式化。
 * @param props
 * @constructor
 */
function FormattedMessage(props: FormattedMessageProps) {
  const { i18n } = useI18n();
  const { id, values, messages, formatOptions, context, tagName: TagName = Fragment, children, comment, useMemorize }: any = props;

  const formatMessageOptions = {
    comment,
    messages,
    context,
    useMemorize,
    formatOptions,
  };

  let formattedMessage = i18n.formatMessage(id, values, formatMessageOptions);

  if (typeof children === 'function') {
    const childNodes = Array.isArray(formattedMessage) ? formattedMessage : [formattedMessage];
    return children(childNodes);
  }

  if (TagName) {
    return (
        <TagName>{Children.toArray(formattedMessage)}</TagName>
    );
  }

  return (
      <>{formattedMessage}</>
  );
}

export default FormattedMessage;
