/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import Inula , { createContext, forwardRef } from 'inulajs';
import { isVariantI18n } from '../../utils/utils';
import copyStaticProps from '../../utils/copyStaticProps';
import { InjectOptions } from '../../types/interfaces';
import I18n from "../I18n";

// 创建国际化组件对象上下文
export const I18nContext : any = createContext<I18n>(null as any);
const { Consumer, Provider } = I18nContext;
export const InjectProvider = Provider;

/**
 * 用于实现国际化的高阶组件，将国际化功能注入到组件中，使组件能够使用国际化的本文格式化功能
 * @param Component
 * @param options
 */
function injectI18n(Component, options?: InjectOptions): any {
  const {
    isUsingForwardRef = false, // 默认不使用
  } = options || {};

  // 定义一个名为 WrappedI18n 的函数组件，接收传入组件的 props 和 forwardedRef，返回传入组件并注入 i18n
  const WrappedI18n = props => (
    <Consumer>
      {context => {
        isVariantI18n(context);

        const i18nProps = {
          intl: context,
          formatMessage: context.formatMessage,
          formatDate: context.DateTimeFormat,
          formatNumber: context.NumberFormat,
        };
        return <Component {...props} {...i18nProps} ref={isUsingForwardRef ? props.forwardedRef : null} />;
      }}
    </Consumer>
  );

  WrappedI18n.WrappedComponent = Component;

  // 通过copyStatics方法，复制组件中的静态属性
  return copyStaticProps(
    isUsingForwardRef ?
        forwardRef((props, ref) => <WrappedI18n {...props} forwardedRef={ref} />) :
        WrappedI18n,
    Component
  );
}

export default injectI18n;
