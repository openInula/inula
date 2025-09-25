import React from "react";

type Variant =
  | "blue"
  | "amber"
  | "purple"
  | "green"
  | "yellow"
  | "red"
  | "gray";

interface CodeSectionProps {
  title: string;
  description?: string;
  code: string;
  variant?: Variant;
}

const variantClasses: Record<
  Variant,
  {
    wrapperBg: string;
    titleText: string;
    descText: string;
    innerBorder: string;
  }
> = {
  blue: {
    wrapperBg: "bg-blue-50 dark:bg-blue-900/20",
    titleText: "text-blue-900 dark:text-blue-100",
    descText: "text-blue-800 dark:text-blue-200",
    innerBorder: "border-blue-200 dark:border-blue-700",
  },
  amber: {
    wrapperBg: "bg-amber-50 dark:bg-amber-900/20",
    titleText: "text-amber-900 dark:text-amber-100",
    descText: "text-amber-800 dark:text-amber-200",
    innerBorder: "border-amber-200 dark:border-amber-700",
  },
  purple: {
    wrapperBg: "bg-purple-50 dark:bg-purple-900/20",
    titleText: "text-purple-900 dark:text-purple-100",
    descText: "text-purple-800 dark:text-purple-200",
    innerBorder: "border-purple-200 dark:border-purple-700",
  },
  green: {
    wrapperBg: "bg-green-50 dark:bg-green-900/20",
    titleText: "text-green-900 dark:text-green-100",
    descText: "text-green-800 dark:text-green-200",
    innerBorder: "border-green-200 dark:border-green-700",
  },
  yellow: {
    wrapperBg: "bg-yellow-50 dark:bg-yellow-900/20",
    titleText: "text-yellow-900 dark:text-yellow-100",
    descText: "text-yellow-800 dark:text-yellow-200",
    innerBorder: "border-yellow-200 dark:border-yellow-700",
  },
  red: {
    wrapperBg: "bg-red-50 dark:bg-red-900/20",
    titleText: "text-red-900 dark:text-red-100",
    descText: "text-red-800 dark:text-red-200",
    innerBorder: "border-red-200 dark:border-red-700",
  },
  gray: {
    wrapperBg: "bg-gray-50 dark:bg-gray-900/20",
    titleText: "text-gray-900 dark:text-gray-100",
    descText: "text-gray-800 dark:text-gray-200",
    innerBorder: "border-gray-200 dark:border-gray-700",
  },
};

export default function CodeSection({
  title,
  description,
  code,
  variant = "blue",
}: CodeSectionProps) {
  const v = variantClasses[variant];
  return (
    <div className={`${v.wrapperBg} p-4 rounded-lg`}>
      <h3 className={`font-semibold ${v.titleText} mb-2`}>{title}</h3>
      {description ? (
        <p className={`mb-2 ${v.descText}`}>{description}</p>
      ) : null}
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${v.innerBorder}`}
      >
        <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
