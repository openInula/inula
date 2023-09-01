/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import * as Horizon from '@cloudsop/horizon';
import App from './App'

function render() {
    Horizon.render(
    <>
      <App/>
    </>,
    document.querySelector('#root') as any
  )
}
render();