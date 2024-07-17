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

import styles from './Search.less';

interface SearchProps {
  onKeyUp: () => void;
  onChange: (event: any) => void;
  value: string;
}

export default function Search(props: SearchProps) {
  const { onChange, value, onKeyUp } = props;
  const handleChange = event => {
    onChange(event.target.value);
  };
  const handleKeyUp = event => {
    if (event.key === 'Enter') {
      onKeyUp();
    }
  };

  return (
    <input
      onkeyup={handleKeyUp}
      onchange={handleChange}
      className={styles.search}
      value={value}
      placeholder="Search Component"
    />
  );
}
