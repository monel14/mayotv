import React, { useState, useEffect, useRef, useMemo } from 'react';
import { debounce } from '../../services/performanceOptimizer';
import type { Channel } from '../../domain/models';

interface SearchSuggestion {
    type: 'channel' | 'country' | 'category';
    value: string;
    label: string;
    count?: number;
    flag?: string;
}

interface SearchWithSuggestionsProps {
    channels: Channel[];
    onSearch: (query: string) => void;
    onSelectSuggestion?: (suggestion: SearchSuggestion) => void;
    placeholder?: string;
    className?: string;
}

export const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
    channels,
    onSearch,
    onSelectSuggestion,
    placeholder = "Rechercher des chaînes...",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((searchQuery: string) => {
            onSearch(searchQuery);
        }, 300),
        [onSearch]
    );

    // Generate suggestions based on channels
    const generateSuggestions = useMemo(() => {
        return (searchQuery: string): SearchSuggestion[] => {
            if (!searchQuery.trim()) return [];

            const query = searchQuery.toLowerCase();
            const suggestions: SearchSuggestion[] = [];

            // Channel suggestions
            const channelMatches = channels
                .filter(channel => channel.name.toLowerCase().includes(query))
                .slice(0, 5)
                .map(channel => ({
                    type: 'channel' as const,
                    value: channel.name,
                    label: channel.name,
                    flag: channel.countryFlag
                }));

            suggestions.push(...channelMatches);

            // Country suggestions
            const countries = new Map<string, { count: number; flag?: string }>();
            channels.forEach(channel => {
                if (channel.countryName?.toLowerCase().includes(query)) {
                    const existing = countries.get(channel.countryName) || { count: 0 };
                    countries.set(channel.countryName, {
                        count: existing.count + 1,
                        flag: channel.countryFlag || existing.flag
                    });
                }
            });

            const countryMatches = Array.from(countries.entries())
                .slice(0, 3)
                .map(([country, data]) => ({
                    type: 'country' as const,
                    value: country,
                    label: country,
                    count: data.count,
                    flag: data.flag
                }));

            suggestions.push(...countryMatches);

            // Category suggestions (based on group)
            const categories = new Map<string, number>();
            channels.forEach(channel => {
                if (channel.group?.toLowerCase().includes(query)) {
                    categories.set(channel.group, (categories.get(channel.group) || 0) + 1);
                }
            });

            const categoryMatches = Array.from(categories.entries())
                .slice(0, 3)
                .map(([category, count]) => ({
                    type: 'category' as const,
                    value: category,
                    label: category,
                    count
                }));

            suggestions.push(...categoryMatches);

            return suggestions.slice(0, 10);
        };
    }, [channels]);

    useEffect(() => {
        if (query.trim()) {
            const newSuggestions = generateSuggestions(query);
            setSuggestions(newSuggestions);
            setShowSuggestions(true);
            debouncedSearch(query);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            onSearch('');
        }
        setSelectedIndex(-1);
    }, [query, generateSuggestions, debouncedSearch, onSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.label);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        onSelectSuggestion?.(suggestion);
        onSearch(suggestion.value);
    };

    const handleClear = () => {
        setQuery('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
        onSearch('');
        inputRef.current?.focus();
    };

    const getSuggestionIcon = (type: SearchSuggestion['type']) => {
        switch (type) {
            case 'channel':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                );
            case 'country':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                    </svg>
                );
            case 'category':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a2 2 0 012-2z" />
                    </svg>
                );
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                />

                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={`${suggestion.type}-${suggestion.value}`}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-primary/10 border-primary/20' : ''
                                }`}
                        >
                            <div className="text-gray-400">
                                {suggestion.flag || getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                    {suggestion.label}
                                </div>
                                <div className="text-sm text-gray-500 capitalize">
                                    {suggestion.type}
                                    {suggestion.count && ` • ${suggestion.count} chaînes`}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};