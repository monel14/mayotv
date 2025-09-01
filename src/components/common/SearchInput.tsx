import React from 'react';

interface SearchInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    variant?: 'default' | 'header';
    placeholder?: string;
    autoFocus?: boolean;
}

export const SearchInput = ({
    value,
    onChange,
    variant = 'default',
    placeholder = 'Search channels...',
    autoFocus = false
}: SearchInputProps) => {
    const baseClasses = "w-full pl-11 pr-4 py-3 rounded-full focus:outline-none transition-colors";
    
    const variantStyles = {
        default: {
            input: "bg-white text-text border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent",
            icon: "text-gray-400"
        },
        header: {
            input: "bg-white/20 text-white border border-transparent placeholder-gray-300 focus:bg-white/30 focus:ring-2 focus:ring-white",
            icon: "text-gray-300"
        }
    };
    
    const styles = variantStyles[variant];

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${styles.icon}`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`${baseClasses} ${styles.input}`}
                aria-label={placeholder}
                autoFocus={autoFocus}
            />
        </div>
    );
};
