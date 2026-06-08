import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Loader2, Lightbulb, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function AISearchBar({
    initialQuery = '',
    placeholder = "Search books, authors, subjects...",
    onSearch,
    showAISuggestions = true,
    librarySlug
}) {
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState([]);
    const [expandedTerms, setExpandedTerms] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showExpanded, setShowExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiParsing, setAiParsing] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceTimer = useRef(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch AI autocomplete suggestions
    const fetchSuggestions = async (searchQuery) => {
        if (!showAISuggestions || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/${librarySlug}/ai/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ query: searchQuery }),
            });

            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Failed to fetch AI suggestions:', error);
        }
    };

    // Debounced suggestion fetching
    const handleQueryChange = (value) => {
        setQuery(value);
        setShowSuggestions(true);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce AI suggestions
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    // Expand query with AI
    const handleExpandQuery = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/${librarySlug}/ai/expand-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ query: query.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                setExpandedTerms(data.expanded_terms || []);
                setShowExpanded(true);
            }
        } catch (error) {
            console.error('Failed to expand query:', error);
        } finally {
            setLoading(false);
        }
    };

    // Parse natural language and submit search
    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!query.trim()) return;

        setAiParsing(true);
        setShowSuggestions(false);

        try {
            // Try AI parsing first
            const res = await fetch(`/${librarySlug}/ai/parse-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ query: query.trim() }),
            });

            let parsedQuery = query.trim();
            let filters = {};

            if (res.ok) {
                const data = await res.json();
                parsedQuery = data.query || query.trim();
                filters = data.filters || {};
            }

            // Call parent's onSearch or navigate to search page
            if (onSearch) {
                onSearch({ query: parsedQuery, filters });
            } else {
                // Build query string
                const params = new URLSearchParams({ q: parsedQuery });
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });

                router.get(`/${librarySlug}/catalog?${params.toString()}`);
            }
        } catch (error) {
            console.error('Search failed:', error);

            // Fallback to simple search
            if (onSearch) {
                onSearch({ query: query.trim(), filters: {} });
            } else {
                router.get(`/${librarySlug}/catalog?q=${encodeURIComponent(query.trim())}`);
            }
        } finally {
            setAiParsing(false);
        }
    };

    // Select a suggestion
    const selectSuggestion = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    // Add expanded term to query
    const addExpandedTerm = (term) => {
        setQuery(prev => `${prev} ${term}`.trim());
        setShowExpanded(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Main Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />

                    {/* Search Icon */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {aiParsing ? (
                            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        ) : (
                            <Search className="w-6 h-6 text-gray-400" />
                        )}
                    </div>

                    {/* AI Expand Button */}
                    {showAISuggestions && query.length > 2 && (
                        <button
                            type="button"
                            onClick={handleExpandQuery}
                            disabled={loading}
                            className="absolute right-24 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={!query.trim() || aiParsing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Search
                    </button>
                </div>

                {/* AI Badge */}
                {showAISuggestions && (
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI-Powered
                    </div>
                )}
            </form>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Suggestions
                    </div>
                    <ul className="max-h-64 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onClick={() => selectSuggestion(suggestion)}
                                className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors border-b last:border-b-0"
                            >
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    {suggestion}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Expanded Terms */}
            {showExpanded && expandedTerms.length > 0 && (
                <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                            <Lightbulb className="w-4 h-4" />
                            Try searching for related terms:
                        </div>
                        <button
                            onClick={() => setShowExpanded(false)}
                            className="text-purple-600 hover:text-purple-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {expandedTerms.map((term, index) => (
                            <button
                                key={index}
                                onClick={() => addExpandedTerm(term)}
                                className="px-3 py-1 text-sm bg-white text-purple-700 border border-purple-300 rounded-full hover:bg-purple-100 transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
