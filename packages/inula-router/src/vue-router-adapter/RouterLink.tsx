/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { InulaNode, useContext } from '@cloudsop/horizon';
import { RouterContext } from './RouterContext';
import { useLink } from './hooks';

const getLinkClass = (propClass: string | undefined, globalClass: string | undefined, defaultClass: string): string => {
  return [propClass, globalClass, defaultClass].reduce((prev, curr) => {
    return prev != null ? prev : curr;
  }) as string;
};

export interface RouterLinkProps {
  to: string;
  replace?: boolean;
  activeClass?: string;
  exactActiveClass?: string;
  children?: InulaNode;

  [key: string]: any;
}

function RouterLink(props: RouterLinkProps) {
  const router = useContext(RouterContext);
  const { to, replace, children } = props;
  const link = useLink({ to, replace });
  const { activeClass, exactActiveClass } = props;
  const { linkActiveClass, linkExactActiveClass } = router.option;

  const classes: string[] = [];
  if (link.isActive) {
    classes.push(getLinkClass(activeClass, linkActiveClass, 'router-link-active'));
  }
  if (link.isExactActive) {
    classes.push(getLinkClass(exactActiveClass, linkExactActiveClass, 'router-link-exact-active'));
  }

  const className: string | undefined = classes.length > 0 ? classes.join(' ') : undefined;

  return (
    <a onClick={link.navigate} href={link.route.fullPath} className={className}>
      {children}
    </a>
  );
}

export default RouterLink;
