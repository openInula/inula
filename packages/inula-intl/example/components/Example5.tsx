/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */

import Inula, { Component } from '@cloudsop/horizon';
import { injectIntl } from '../../index';

class Example5 extends Component<any, any, any> {
  public constructor(props: any, context) {
    super(props, context);
  }

  render() {
    const { intl } = this.props as any;
    return (
      <div className="card">
        <h2>injectIntl方式测试Demo</h2>
        <pre>{intl.formatMessage({ id: 'text4' })}</pre>
      </div>
    );
  }
}

export default injectIntl(Example5);
