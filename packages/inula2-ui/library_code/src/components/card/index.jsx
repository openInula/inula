import "./index.css";

const Card = ({
  type = "default",
  size = "default", // small, default
  loading = false,
  variant = "outlined", // outlined, borderless
  hoverable = false, //悬停浮空
  gridbox = false, //网格布局, 只有children全为CardGrid时才能传入true
  tabList,
  tabProps,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  title,
  extra,
  cover,
  actions,
  children,
  className,
  style,
  ...rest
}) => {
  let isShowHeader = title || extra || tabList; // 是否显示头部

  const classNames = [
    "inula-card",
    `inula-card-${type}`, // 卡片类型，默认为default
    `inula-card-${size}`, // 卡片大小，默认为default
    `inula-card-${variant}`, // 卡片变体，默认为outlined
    hoverable && "inula-card-hoverable", // 悬停
    gridbox && "inula-card-gridbox", // 网格布局
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClassName = [
    "inula-card-body",
    `inula-card-body-${size}`,
    gridbox && "inula-card-body-gridbox",
  ]
    .filter(Boolean)
    .join(" ");

  const headerClassName = [
    "inula-card-header",
    `inula-card-header-${size}`,
    `inula-card-header-${type}`,
  ]
    .filter(Boolean)
    .join(" ");

  const styles = {
    ...style,
  };

  const CardHeader = () => {
    if (!isShowHeader) return <></>;
    return (
      <div className={headerClassName}>
        <div className="inula-card-header-content">
          {title && <div className="inula-card-header-title">{title}</div>}
          {extra && <div className="inula-card-header-extra">{extra}</div>}
        </div>
      </div>
    );
  };

  const CardLoading = () => {
    return (
      <div className="inula-card-loading">
        {/* 四个加载条容器 */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="loading-bar"
            style={{ width: `${i === 3 ? "70%" : "100%"}` }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className={classNames} style={styles} {...rest}>
      <CardHeader />
      {cover && (
        <div
          className="inula-card-cover"
          style={{
            borderTopLeftRadius: `${isShowHeader ? 0 : 8}px`,
            borderTopRightRadius: `${isShowHeader ? 0 : 8}px`,
          }}
        >
          {cover}
        </div>
      )}
      <div className={bodyClassName}>
        {loading ? <CardLoading /> : children}
      </div>
      {actions && (
        <div className="inula-card-actions">
          {actions.map((action, index) => (
            <div
              key={index}
              style={{ width: `${Math.floor(100 / actions.length)}%` }}
              className="inula-card-actions-item"
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CardMeta = ({
  avatar,
  title,
  description,
  className,
  style,
  ...rest
}) => {
  const classNames = ["inula-card-meta", className].filter(Boolean).join(" ");
  const styles = {
    ...style,
  };
  return (
    <div className={classNames} style={styles} {...rest}>
      {avatar && <div className="inula-card-meta-avatar">{avatar}</div>}
      <div className="inula-card-meta-content">
        {title && <div className="inula-card-meta-title">{title}</div>}
        {description && (
          <div className="inula-card-meta-description">{description}</div>
        )}
      </div>
    </div>
  );
};

const CardGrid = ({
  hoverable = true,
  className,
  style,
  children,
  ...rest
}) => {
  const classNames = [
    "inula-card-grid",
    hoverable && "inula-card-grid-hoverable",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const styles = {
    ...style,
  };
  return (
    <div className={classNames} style={styles} {...rest}>
      {children}
    </div>
  );
};

export { Card, CardMeta, CardGrid };
