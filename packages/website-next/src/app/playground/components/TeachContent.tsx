import { useParams, useRouter } from "next/navigation";
import { useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { playgroundData } from "../data/playgroundData";

const Basic = dynamic(() => import("./tutorials/Basic"));
const Component = dynamic(() => import("./tutorials/Component"));
const State = dynamic(() => import("./tutorials/State"));
const Computed = dynamic(() => import("./tutorials/Computed"));
const Watch = dynamic(() => import("./tutorials/Watch"));
const Conditional = dynamic(() => import("./tutorials/Conditional"));
const Lists = dynamic(() => import("./tutorials/Lists"));
const EventHandling = dynamic(() => import("./tutorials/eventHandling"));
const Lifecycle = dynamic(() => import("./tutorials/Lifecycle"));

const tutorialMap: Record<string, React.ComponentType<{ data?: string }>> = {
  basic: Basic,
  component: Component,
  state: State,
  computed: Computed,
  watch: Watch,
  conditional: Conditional,
  lists: Lists,
  "event-handling": EventHandling,
  lifecycle: Lifecycle,
};

export default function TeachContent({ data = "" }: { data?: string }) {
  const params = useParams();
  const router = useRouter();
  const currentSlug = (params?.slug as string) || "";

  const TutorialComponent = useMemo(
    () => tutorialMap[currentSlug],
    [currentSlug]
  );

  const navigationData = useMemo(() => {
    const index = playgroundData.findIndex((i) => i.slug === currentSlug);
    const prev = index > 0 ? playgroundData[index - 1] : null;
    const next =
      index >= 0 && index < playgroundData.length - 1
        ? playgroundData[index + 1]
        : null;
    return { index, prev, next };
  }, [currentSlug]);

  const goto = useCallback(
    (slug?: string) => {
      if (slug) {
        router.push(`/playground/${slug}`);
      }
    },
    [router]
  );

  if (!TutorialComponent) return <div>教程未找到</div>;

  return (
    <div className="w-1/2 h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#141418]">
      <div className="flex-1 overflow-auto pr-4 bg-inherit">
        <TutorialComponent data={data} />
      </div>
      <div className="sticky bottom-0 bg-inherit border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-end gap-2">
          {/*<div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm opacity-60 cursor-not-allowed"
            title="即将推出"
          >
            重置
          </button>
          <button
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm opacity-60 cursor-not-allowed"
            title="即将推出"
          >
            答案
          </button>
        </div>*/}
        <div className="flex items-center gap-5">
          <button
            className={`${
              navigationData.prev
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed"
            } cursor-pointer hover:scale-150 duration-300`}
            onClick={() => goto(navigationData.prev?.slug)}
            disabled={!navigationData.prev}
            aria-label="上一节"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            className={`${
              navigationData.next
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed"
            } cursor-pointer hover:scale-150 duration-300`}
            onClick={() => goto(navigationData.next?.slug)}
            disabled={!navigationData.next}
            aria-label="下一节"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
