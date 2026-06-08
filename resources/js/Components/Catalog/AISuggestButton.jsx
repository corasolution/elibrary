import { Sparkles, Loader2 } from 'lucide-react';

export default function AISuggestButton({
    onClick,
    loading = false,
    label = "AI Suggest",
    disabled = false,
    size = "md"
}) {
    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className={`
                inline-flex items-center gap-1.5 font-medium rounded-md
                bg-purple-50 text-purple-700 border border-purple-200
                hover:bg-purple-100 hover:border-purple-300
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${sizes[size]}
            `}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {label}
        </button>
    );
}
