type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => {
        const active = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={
              "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors " +
              (active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200")
            }
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
