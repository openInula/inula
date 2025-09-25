interface DropdownItem {
  name: string;
  href: string;
}

interface DropdownMenuProps {
  name: string;
  href: string;
  dropdown: DropdownItem[];
  isActive: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function DropdownMenu({
  name,
  dropdown,
  isActive,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: Readonly<DropdownMenuProps>) {
  return (
    <>
      <button
        className={`no-underline px-1 py-1 rounded-md transition-colors duration-200 bg-transparent border-none cursor-pointer text-left flex items-center gap-1 truncate whitespace-nowrap ${
          isActive
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        }`}
        onClick={(e) => e.preventDefault()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {name}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            isHovered ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <button
        className={`absolute top-full left-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 transition-all duration-300 ease-in-out ${
          isHovered
            ? "opacity-100 visible transform translate-y-0"
            : "opacity-0 invisible transform -translate-y-2"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="py-2">
          {dropdown.map((dropdownItem) => (
            <a
              key={dropdownItem.href}
              href={dropdownItem.href}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 text-left"
            >
              {dropdownItem.name}
            </a>
          ))}
        </div>
      </button>
    </>
  );
}
