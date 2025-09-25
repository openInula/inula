"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 主容器 */}
      <div className="relative flex flex-col items-center space-y-8">
        {/* SpinKit 折叠立方体动画 */}
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube"></div>
          <div className="sk-cube2 sk-cube"></div>
          <div className="sk-cube4 sk-cube"></div>
          <div className="sk-cube3 sk-cube"></div>
        </div>

        {/* 加载文字 */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
            加载中...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 animate-fade-in-slow">
            正在为您准备最佳体验
          </p>
        </div>
      </div>

      <style jsx>{`
        .sk-folding-cube {
          margin: 20px auto;
          width: 40px;
          height: 40px;
          position: relative;
          transform: rotateZ(45deg);
        }

        .sk-folding-cube .sk-cube {
          float: left;
          width: 50%;
          height: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .sk-folding-cube .sk-cube:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          animation: sk-foldCubeAngle 2.4s infinite linear both;
          transform-origin: 100% 100%;
        }

        .sk-folding-cube .sk-cube2 {
          transform: scale(1.1) rotateZ(90deg);
        }

        .sk-folding-cube .sk-cube3 {
          transform: scale(1.1) rotateZ(180deg);
        }

        .sk-folding-cube .sk-cube4 {
          transform: scale(1.1) rotateZ(270deg);
        }

        .sk-folding-cube .sk-cube2:before {
          animation-delay: 0.3s;
        }

        .sk-folding-cube .sk-cube3:before {
          animation-delay: 0.6s;
        }

        .sk-folding-cube .sk-cube4:before {
          animation-delay: 0.9s;
        }

        @keyframes sk-foldCubeAngle {
          0%, 10% {
            transform: perspective(140px) rotateX(-180deg);
            opacity: 0;
          }
          25%, 75% {
            transform: perspective(140px) rotateX(0deg);
            opacity: 1;
          }
          90%, 100% {
            transform: perspective(140px) rotateY(180deg);
            opacity: 0;
          }
        }

        /* 深色模式适配 */
        .dark .sk-folding-cube .sk-cube:before {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
        }
      `}</style>
    </div>
  );
} 