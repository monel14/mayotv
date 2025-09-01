import React from 'react';
import { SearchInput } from '../common/SearchInput';

interface FilterItem {
    code: string;
    name: string;
    flag?: string;
}

interface ChannelFiltersProps {
    searchTerm: string;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    filterItems: FilterItem[];
    selectedItem: string;
    onItemChange: (code: string) => void;
    filterLabel: string;
}

export const ChannelFilters = ({
    searchTerm,
    onSearchChange,
    filterItems,
    selectedItem,
    onItemChange,
    filterLabel,
}: ChannelFiltersProps) => {
    const showFilterDropdown = filterItems && filterItems.length > 0;

    return (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            {showFilterDropdown && (
                <div className="w-full sm:w-1/2 md:w-1/3 relative">
                    <select
                        value={selectedItem}
                        onChange={(e) => onItemChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-full bg-white text-text border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none"
                        aria-label={filterLabel}
                    >
                        {filterItems.map(item => (
                            <option key={item.code} value={item.code}>
                                {item.flag} {item.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}
            <div className="w-full sm:flex-1">
                <SearchInput value={searchTerm} onChange={onSearchChange} autoFocus />
            </div>
        </div>
    );
};
