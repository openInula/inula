import React, { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import gsap from "gsap";

// 框架性能数据，单位越小越快
const performanceData = [
  { name: "Solid", value: 1.02, color: "bg-gray-200 dark:bg-[#1f2937]" },
  /*{ name: "Svelte", value: 1.03, color: "bg-gray-200" },*/
  { name: "Inula", value: 1.14, color: "bg-blue-500" },
  { name: "Vue", value: 1.23, color: "bg-gray-200 dark:bg-[#1f2937]" },
  { name: "Angular", value: 1.43, color: "bg-gray-200 dark:bg-[#1f2937]" },
  { name: "React", value: 1.47, color: "bg-gray-200 dark:bg-[#1f2937]" },
];

const maxValue = Math.max(...performanceData.map((d) => d.value));

export default function PerformanceComparison() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  // 数字透明度state
  const [opacities, setOpacities] = useState(performanceData.map(() => 0));

  useEffect(() => {
    if (inView) {
      performanceData.forEach((data, i) => {
        // 进度条动画
        gsap.to(barsRef.current[i], {
          width: `${(data.value / maxValue) * 100}%`,
          duration: 1.5,
          delay: i * 0.08 + 0.1,
          ease: "elastic.out(1,0.5)",
        });
        // 数字淡入动画
        gsap.to(
          {},
          {
            duration: 1.5,
            delay: i * 0.08 + 0.1,
            ease: "elastic.out(1,0.5)",
            onStart: () =>
              setOpacities((prev) => {
                const next = [...prev];
                next[i] = 0;
                return next;
              }),
            onUpdate: function () {
              setOpacities((prev) => {
                const next = [...prev];
                // 进度条宽度百分比 = 当前动画进度
                // 这里用gsap的progress()，但由于没有目标对象，直接用1
                next[i] = 1; // 直接到1即可
                return next;
              });
            },
            onComplete: () =>
              setOpacities((prev) => {
                const next = [...prev];
                next[i] = 1;
                return next;
              }),
          }
        );
      });
    } else {
      // 离开视口时重置宽度和透明度
      performanceData.forEach((_, i) => {
        if (barsRef.current[i]) barsRef.current[i]!.style.width = "0%";
      });
      setOpacities(performanceData.map(() => 0));
    }
  }, [inView]);

  if (typeof window !== "undefined") {
    const style = document.createElement("style");
    style.innerHTML = `
      .bar-item { cursor: pointer; }
      .bar-item.bar-hover {
        box-shadow: 0 4px 24px 0 rgba(59,130,246,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10);
        z-index: 2;
        transform: scale(1.07);
      }
    `;
    if (!document.getElementById("bar-style")) {
      style.id = "bar-style";
      document.head.appendChild(style);
    }
  }

  return (
    <section ref={ref} className="w-full py-20 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4 md:px-0">
        {/* 左侧性能条 */}
        <div className="flex-1 w-full min-w-[320px] max-w-[420px]">
          <div className="space-y-5">
            {performanceData.map((data, i) => (
              <div key={data.name} className="flex items-center gap-4">
                <span
                  className={`w-24 text-right text-base font-bold ${
                    data.name === "Inula"
                      ? "text-blue-600 dark:text-blue-300"
                      : "text-gray-800 dark:text-gray-200"
                  } shrink-0`}
                >
                  {data.name}
                </span>
                <div className="flex-1 relative">
                  <div
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    className={`h-6 rounded-full ${data.color} transition-all flex items-center pl-4 bar-item`}
                    style={{
                      width: "0%",
                      transition: "transform 0.25s cubic-bezier(.4,2,.6,1)",
                    }}
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("bar-hover")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("bar-hover")
                    }
                  >
                    <span
                      className={`ml-auto pr-4 drop-shadow text-gray-600 ${
                        data.name === "Inula" ? "text-yellow-200" : ""
                      }`}
                      style={{
                        opacity: opacities[i],
                        transition: "opacity 0.3s",
                      }}
                    >
                      {data.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 右侧文案 */}
        <div className="flex-1 flex flex-col items-start md:items-start gap-6">
          <h2 className="text-4xl md:text-[2.5rem] font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span role="img" aria-label="rocket">
              🚀
            </span>
            <span>性能优异的前端框架</span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
            Inula 在{" "}
            <a
              href="https://hoikanchan.github.io/js-framework-benchmark/"
              target="_blank"
              className="underline text-blue-500 hover:text-blue-400"
            >
              基准测试
            </a>{" "}
            中表现优异，性能媲美甚至超越主流框架。
            <br />
            采用细粒度响应式，极大减少重渲染，体验极致流畅。
          </p>
        </div>
      </div>
    </section>
  );
}
