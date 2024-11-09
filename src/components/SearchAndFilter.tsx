// src/components/SearchAndFilter.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicKey } from '@solana/web3.js';

export interface Pool {
    address: string;
    data: {
        authority: PublicKey;
        tokenMint: PublicKey;
        tokenVault: PublicKey;
        treasury: PublicKey;
        totalAllocation: number;
        remainingAllocation: number;
        tokenPrice: number;
        minAllocation: number;
        maxAllocation: number;
        startTime: number;
        endTime: number;
        paused: boolean;
        finalized: boolean;
        userBalance?: number;
    };
}

export interface FilterOptions {
    status: 'all' | 'active' | 'upcoming' | 'ended';
    minPrice: string;
    maxPrice: string;
    sortBy: 'newest' | 'oldest' | 'allocation' | 'progress';
}

interface SearchAndFilterProps {
    pools: Pool[];
    onFilteredPoolsChange: (filteredPools: Pool[]) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ pools, onFilteredPoolsChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest'
    });

    const applyFilters = () => {
        let filtered = [...pools];

        // Apply search
        if (searchQuery) {
            filtered = filtered.filter(pool => 
                pool.data.tokenMint.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.address.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(pool => {
                const now = Date.now() / 1000;
                if (filters.status === 'active') {
                    return !pool.data.finalized && !pool.data.paused && 
                           pool.data.startTime <= now && pool.data.endTime > now;
                }
                if (filters.status === 'ended') {
                    return pool.data.finalized || pool.data.endTime <= now;
                }
                if (filters.status === 'upcoming') {
                    return pool.data.startTime > now;
                }
                return true;
            });
        }

        // Apply price filter
        if (filters.minPrice) {
            filtered = filtered.filter(pool => 
                pool.data.tokenPrice / 1e9 >= Number(filters.minPrice)
            );
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(pool => 
                pool.data.tokenPrice / 1e9 <= Number(filters.maxPrice)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return b.data.startTime - a.data.startTime;
                case 'oldest':
                    return a.data.startTime - b.data.startTime;
                case 'allocation':
                    return b.data.totalAllocation - a.data.totalAllocation;
                case 'progress':
                    const progressA = (a.data.totalAllocation - a.data.remainingAllocation) / a.data.totalAllocation;
                    const progressB = (b.data.totalAllocation - b.data.remainingAllocation) / b.data.totalAllocation;
                    return progressB - progressA;
                default:
                    return 0;
            }
        });

        onFilteredPoolsChange(filtered);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        applyFilters();
    };

    const handleFilterChange = (filterUpdate: Partial<FilterOptions>) => {
        setFilters(prev => {
            const newFilters = { ...prev, ...filterUpdate };
            return newFilters;
        });
        applyFilters();
    };

    return (
        <div className="mb-8 bg-base-200 rounded-lg p-4">
            <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search by token name or address..."
                        className="input input-bordered w-full pr-10"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <span className="absolute right-3 top-3 text-gray-400">🔍</span>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Status</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.status}
                            onChange={(e) => handleFilterChange({ 
                                status: e.target.value as FilterOptions['status'] 
                            })}
                        >
                            <option value="all">All Pools</option>
                            <option value="active">Active</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="ended">Ended</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Price Range (SOL)</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="input input-bordered w-full"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange({ 
                                    minPrice: e.target.value 
                                })}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="input input-bordered w-full"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange({ 
                                    maxPrice: e.target.value 
                                })}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Sort By</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange({ 
                                sortBy: e.target.value as FilterOptions['sortBy'] 
                            })}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="allocation">Total Allocation</option>
                            <option value="progress">Progress</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Reset</span>
                        </label>
                        <button
                            className="btn btn-outline btn-error"
                            onClick={() => {
                                setFilters({
                                    status: 'all',
                                    minPrice: '',
                                    maxPrice: '',
                                    sortBy: 'newest'
                                });
                                setSearchQuery('');
                                applyFilters();
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};