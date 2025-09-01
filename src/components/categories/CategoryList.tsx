import React from 'react';

interface ListItem {
    id: string;
    name: string;
    flag?: string;
    count?: number; // Count is now optional
}

interface ListProps {
    items: ListItem[];
    onSelectItem: (id: string) => void;
    isSyncing: boolean;
}

const ItemCard = ({ item, onSelect }: { item: ListItem, onSelect: (id: string) => void }) => (
    <button
        onClick={() => onSelect(item.id)}
        className="bg-white border border-gray-200 rounded-lg p-4 text-left flex items-center justify-between gap-4 transition-all duration-200 ease-in-out hover:border-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
        <div className="flex items-center gap-4 min-w-0">
            {item.flag && (
                <div className="text-4xl flex-shrink-0 w-12 text-center" aria-hidden="true">
                    {item.flag}
                </div>
            )}
            <div className="min-w-0">
                <h3 className="font-bold text-text truncate" title={item.name}>{item.name}</h3>
            </div>
        </div>
        {/* Conditionally render the count only when it's a valid number */}
        {typeof item.count === 'number' && (
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                {item.count} channels
            </span>
        )}
    </button>
);


export const CategoryList = React.memo(({ items, onSelectItem, isSyncing }: ListProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {items.map(item => (
                <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={onSelectItem}
                />
            ))}
        </div>
    );
});