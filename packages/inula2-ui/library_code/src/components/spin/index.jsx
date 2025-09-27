import "./index.css";

// 防抖函数
const debounce = (delay, fn) => {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

function shouldDelay(spinning, delay) {
  return !!spinning && !!delay && !Number.isNaN(Number(delay));
}

const Spin = ({
  delay,
  fullscreen = false,
  indicator,
  percent, //number | "auto"
  size = "default",
  spinning = true,
  tip,
  wrapperClassName,
  className,
  children,
  style,
  maxProgressWidth = 44,
  ...rest
}) => {
  let isNestedPattern = typeof children !== "undefined" && !fullscreen;
  let customSpinning = spinning && !shouldDelay(spinning, delay);

  let infiniteProgress = percent === "auto" ? 0 : null;

  if (size === "large") {
    maxProgressWidth = 64;
  } else if (size === "small") {
    maxProgressWidth = 32;
  }

  // let rightTransform =
  //   percent * 3.6 >= 0
  //     ? `rotate(${-135 + Math.min(percent * 3.6, 180)}deg)`
  //     : "rotate(-135deg)";
  // let leftTransform =
  //   percent * 3.6 >= 180 + 150
  //     ? `rotate(${-135 + Math.min(percent * 3.6 - 180, 180)}deg)`
  //     : "rotate(-135deg)";

  watch(() => {
    if (percent === "auto") {
      const interval = setInterval(() => {
        infiniteProgress = (infiniteProgress + 1) % 100;
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }

    if (spinning && delay) {
      const showSpinning = debounce(delay, () => {
        customSpinning = true;
      });

      showSpinning();

      return () => {
        showSpinning?.cancel();
        customSpinning = false;
      };
    }
  });

  const classNames = [
    "inula-spin-wrapper",
    wrapperClassName,
    fullscreen && "inula-spin-fullscreen",
    fullscreen && customSpinning && "inula-spin-fullscreen-show",
  ]
    .filter(Boolean)
    .join(" ");
  const styles = { ...style };

  const SpinIndicator = () => {
    if (indicator) {
      return indicator;
    }
    if (percent >= 0 || percent === "auto") {
      return (
        <div className={`inula-spin-progress inula-spin-progress-${size}`}>
          <div
            className={`inula-spin-progress-track inula-spin-progress-track-${size}`}
            style={{
              width: `${
                maxProgressWidth *
                0.01 *
                (percent !== "auto" ? percent : infiniteProgress)
              }px`,
            }}
          ></div>
        </div>
        // <div className="outer">
        //   <div className="left">
        //     <div
        //       className="leftcircle"
        //       style={{ transform: leftTransform }}
        //     ></div>
        //   </div>
        //   <div className="right">
        //     <div
        //       className="rightcircle"
        //       style={{ transform: rightTransform }}
        //     ></div>
        //   </div>
        // </div>
      );
    }

    const itemClassNames = (index) => {
      return ["inula-spin-indicator-dot", `inula-spin-indicator-dot${index}`]
        .filter(Boolean)
        .join(" ");
    };

    const rotateContainerClassNames = [
      "inula-spin-indicator-rotate",
      `inula-spin-indicator-rotate-${size}`,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="inula-spin-indicator">
        <div className={rotateContainerClassNames}>
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className={itemClassNames(index)}></div>
            ))}
        </div>
        {tip && (isNestedPattern || fullscreen) ? (
          <div className="inula-spin-tip">{tip}</div>
        ) : null}
      </div>
    );
  };

  if (isNestedPattern) {
    return (
      <div className={classNames} style={styles}>
        {customSpinning && (
          <div className="loading-container">
            <SpinIndicator />
          </div>
        )}
        {children}
      </div>
    );
  }

  if (fullscreen) {
    return (
      <div className={classNames} style={styles}>
        {customSpinning && <SpinIndicator />}
      </div>
    );
  }

  return (
    <div className={classNames} style={styles} {...rest}>
      {customSpinning && <SpinIndicator />}
    </div>
  );
};

export default Spin;
