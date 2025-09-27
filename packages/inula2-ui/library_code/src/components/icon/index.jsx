import "./index.css";

const Icon = ({
  value,
  // theme = "outline", // outline, filled, twoTone
  theme = "filled", // filled, brand
  size,    //number
  color,   //string
  rotate,  //number
  spin = false,
  style,
  onClick,
  ...rest
}) => {
  // const iconTheme = (theme) => {
  //   switch (theme) {
  //     case "filled":
  //       return "fas";
  //     case "twoTone":
  //       return "fad";
  //     default:
  //       return "fal";
  //   }
  // };
  const iconTheme = (theme) => {
    switch (theme) {
      case "filled":
        return "fas";
      case "brand": 
        return "fab";
      default:
        alert(`Invalid theme: ${theme}`);
        return "";
    }
  };

  const classNames = [
    "inula-icon",
    iconTheme(theme),
    value ? `fa-${value}` : "",
    spin ? "inula-icon-spin" : ""  // 新增动画类
  ]
    .filter(Boolean)
    .join(" ");

  const styles = {
    ...style,
    ...(rotate && { transform: `rotate(${rotate}deg)` }),
    fontSize: `${size}px`,
    color: `${color}`,
  }

  // console.log("Icon props:", rest);

  return (
    <i
      className={classNames}
      style={styles}
      onClick={onClick}
      {...rest}
    ></i>
  );
};

export default Icon;
