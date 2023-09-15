import Inula, { Fragment } from 'inulajs';
import { Breadcrumb } from 'antd';
import { Link } from 'inula-router';
import { t } from 'utils/intl';
import iconMap from 'utils/iconMap';

const { pathToRegexp } = require('path-to-regexp');
import { queryAncestors } from 'utils';
import styles from './Bread.less';
import { withRouter } from 'inula-router';

function Bread({ routeList, history }) {
  const generateBreadcrumbs = paths => {
    return paths.map((item, key) => {
      const content = item && (
        <Fragment>
          {item.icon && <span style={{ marginRight: 4 }}>{iconMap[item.icon]}</span>}
          {item.name}
        </Fragment>
      );

      return (
        item && (
          <Breadcrumb.Item key={key}>
            {paths.length - 1 !== key ? <Link to={item.route || '#'}>{content}</Link> : content}
          </Breadcrumb.Item>
        )
      );
    });
  };

  // Find a route that matches the pathname.
  const currentRoute = routeList.find(_ => _.route && pathToRegexp(_.route).exec(history.location.pathname));

  // Find the breadcrumb navigation of the current route match and all its ancestors.
  const paths =
    history.location.pathname === '/'
      ? [routeList[0]]
      : currentRoute
      ? queryAncestors(routeList, currentRoute, 'breadcrumbParentId').reverse()
      : [
          {
            id: 404,
            name: t`Not Found`,
          },
        ];

  return <Breadcrumb className={styles.bread}>{generateBreadcrumbs(paths)}</Breadcrumb>;
}

export default withRouter(Bread);
