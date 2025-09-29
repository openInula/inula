import './index.css';
import { didMount, willUnmount } from '@openinula/next';

const defaultPlacement = 'topRight';
const placementClassMap = {
  topLeft: 'inula-notification-wrapper-topLeft',
  topRight: 'inula-notification-wrapper-topRight',
  bottomLeft: 'inula-notification-wrapper-bottomLeft',
  bottomRight: 'inula-notification-wrapper-bottomRight',
  top: 'inula-notification-wrapper-top',
  bottom: 'inula-notification-wrapper-bottom',
};

function getRoot(placement = defaultPlacement) {
  const rootId = `__inula_notification_root_${placement}__`;
  let root = document.getElementById(rootId);
  if (!root) {
    root = document.createElement('div');
    root.id = rootId;
    root.className = placementClassMap[placement] || placementClassMap[defaultPlacement];
    document.body.appendChild(root);
  }
  return root;
}

let notifications = [];
let notificationId = 0;

function renderNotifications() {
  // 按 placement 分类渲染
  const placements = {};
  notifications.forEach(item => {
    const placement = item.placement || defaultPlacement;
    if (!placements[placement]) placements[placement] = [];
    placements[placement].push(item);
  });
  Object.keys(placementClassMap).forEach(placement => {
    const root = getRoot(placement);
    root.innerHTML = '';
    const items = placements[placement] || [];
    items.slice().reverse().forEach(item => {
      const el = document.createElement('div');
      root.appendChild(el);
      window.render(
        <Notification
          key={item.key}
          {...item}
          onClose={() => remove(item.key)}
        />, el
      );
    });
  });
}

function add(notification) {
  notification.key = 'notice_' + (++notificationId);
  notifications.push(notification);
  renderNotifications();
  if (notification.duration !== 0) {
    setTimeout(() => remove(notification.key), notification.duration || 3000);
  }
}

function remove(key) {
  notifications = notifications.filter(n => n.key !== key);
  renderNotifications();
}

export function open(opts) {
  add({ ...opts });
}

export function info(opts) { open({ ...opts, type: 'info' }); }
export function success(opts) { open({ ...opts, type: 'success' }); }
export function warning(opts) { open({ ...opts, type: 'warning' }); }
export function error(opts) { open({ ...opts, type: 'error' }); }
export function text(opts) { open({ ...opts, type: 'text' }); }

function Notification({ key, type = 'info', message, description, onClose, closeText, closeClassName, actions, bgColor }) {
  let icon;
  if (type === 'success') icon = <span className="inula-notification-icon inula-notification-icon-success">✔</span>;
  else if (type === 'error') icon = <span className="inula-notification-icon inula-notification-icon-error">✖</span>;
  else if (type === 'warning') icon = <span className="inula-notification-icon inula-notification-icon-warning">!</span>;
  else if (type === 'info') icon = <span className="inula-notification-icon inula-notification-icon-info">i</span>;
  else icon = null; // type === 'text' 时无 icon

  let notificationClass = 'inula-notification';
  if (type === 'text') {
    notificationClass += ' inula-notification-text';
  } else if (type) {
    if (bgColor) {
        notificationClass += ' inula-notification-' + type;
    }else {
        notificationClass = 'inula-notification';
    }
  }

  return (
    <div className={notificationClass}>
      {icon}
      <div className="inula-notification-content">
        <div className="inula-notification-message">{message}</div>
        {description && <div className="inula-notification-description">{description}</div>}
        {actions && (
          <div className="inula-notification-actions">
            {typeof actions === 'function'
              ? actions({ notification: { key }, remove: onClose, onClose })
              : actions}
          </div>
        )}
      </div>
      <span
        className={closeClassName || 'inula-notification-close'}
        onClick={onClose}
      >
        {closeText || '×'}
      </span>
    </div>
  );
}

export default Notification; 