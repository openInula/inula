import { useState } from "react";
import type {LoadMoreSectionProps} from "../../../index";

export default function LoadMoreSection<T>({
	title,
	items,
	renderItem,
	initialCount = 4,
	step = 6,
}: LoadMoreSectionProps<T>) {
	const [visibleCount, setVisibleCount] = useState<number>(initialCount);

	const canPaginate = items.length > initialCount;
	const isCollapsed = visibleCount < items.length;

	return (
		<section>
			<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
			<div className="flex flex-col gap-6">
				{items.slice(0, visibleCount).map(renderItem)}
			</div>
			{canPaginate && (
				<div className="mt-6 flex justify-center">
					{isCollapsed ? (
						<button
							onClick={() => setVisibleCount(c => Math.min(c + step, items.length))}
							className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
						>
							查看更多
						</button>
					) : (
						<button
							onClick={() => setVisibleCount(initialCount)}
							className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
						>
							收起
						</button>
					)}
				</div>
			)}
		</section>
	);
}


