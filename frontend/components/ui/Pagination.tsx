
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, hasNext, hasPrev }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center space-x-4 mt-8 py-4 border-t border-gray-100">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrev}
                className={`
                    flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${!hasPrev
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 border border-gray-200'
                    }
                `}
            >
                <ChevronLeft size={16} />
                Previous
            </button>
            <div className="text-sm font-medium text-gray-600">
                Page <span className="text-indigo-600 font-bold">{currentPage}</span> of {totalPages}
            </div>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext}
                className={`
                    flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${!hasNext
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600 border border-gray-200'
                    }
                `}
            >
                Next
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
