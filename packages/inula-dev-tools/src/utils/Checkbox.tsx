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

export function Checkbox({ value }) {
  return (
    <div
    style={{
      border: "1px solid black",
      borderRadius: "2px",
      width: "0.75rem",
      height: "0.75rem",
      padding: "1px",
      backgroundColor: "white",
      display: "inline-block",
      position: "relative",
      cursor: "pointer",
      verticalAlign: "sub",
      marginBottom: "0.1rem"
    }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: value? "black" : "white",
          position: "relative"
        }}
      ></div>
    </div>
  );
}
