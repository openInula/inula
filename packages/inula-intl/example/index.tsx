/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import * as Inula from 'inulajs';
import App from './App'

function render() {
    Inula.render(
    <>
      <App/>
    </>,
    document.querySelector('#root') as any
  )
}
render();
