/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * PUBLIC ISSUE EXPLORER PAGE
 * 
 * Architectural Purpose:
 * Searchable, filterable civic complaint registry for the general public.
 * Enforces strict citizen privacy (no PII), supports query parameters, 
 * category/status/ward filtering, and endorsement upvoting.
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  ArrowUpDown, 
  RotateCcw, 
  Eye, 
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { 
  MOCK_COMPLAINTS, 
  MOCK_CATEGORIES, 
  MOCK_WARDS 
} from '../../../data/mockData';
import { ComplaintStatus, PriorityLevel, CivicComplaint } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { PriorityBadge } from '../../../components/ui/PriorityBadge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const PublicExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [selectedWard, setSelectedWard] = useState(searchParams.get('ward') || 'ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'support' | 'priority'>('newest');

  // Support/Upvote state simulation
  const [supportedIds, setSupportedIds] = useState<Record<string, boolean>>({});

  const handleSupportClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSupportedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter complaints based on user criteria
  const filteredComplaints = useMemo(() => {
    return MOCK_COMPLAINTS.filter((c) => {
      // Keyword matching
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesRef = c.referenceNumber.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesAddress = c.address.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRef && !matchesDesc && !matchesAddress) {
          return false;
        }
      }

      // Category matching
      if (selectedCategory !== 'ALL' && c.category.code !== selectedCategory) {
        return false;
      }

      // Status matching
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }

      // Ward matching
      if (selectedWard !== 'ALL' && c.ward !== selectedWard) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'support') {
        const aCount = a.supportCount + (supportedIds[a.id] ? 1 : 0);
        const bCount = b.supportCount + (supportedIds[b.id] ? 1 : 0);
        return bCount - aCount;
      }
      if (sortBy === 'priority') {
        const pOrder: Record<PriorityLevel, number> = {
          [PriorityLevel.CRITICAL]: 4,
          [PriorityLevel.HIGH]: 3,
          [PriorityLevel.MEDIUM]: 2,
          [PriorityLevel.LOW]: 1,
        };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedWard, sortBy, supportedIds]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedWard('ALL');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Public Civic Issue Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and track all publicly verified municipal complaints across city wards.
          </p>
        </div>
        <Link to="/citizen/complaints/new">
          <Button variant="secondary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <Card className="p-5 space-y-4">
        {/* Search row */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by issue title, reference number (e.g. CMP-2026-0891), or street address..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="ALL">All Categories</option>
              {MOCK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ComplaintStatus).map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Ward / Zone
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="ALL">All City Wards</option>
              {MOCK_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="newest">Most Recent</option>
              <option value="support">Most Endorsed / Supported</option>
              <option value="priority">Highest Priority Severity</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span>
            Displaying <strong>{filteredComplaints.length}</strong> matching verified civic records
          </span>
          {(searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedWard !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </Card>

      {/* Complaint List Display */}
      {filteredComplaints.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Complaints Match Your Filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try modifying your search terms, changing selected categories, or resetting the ward filter.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => {
            const isSupported = !!supportedIds[complaint.id];
            const currentSupportCount = complaint.supportCount + (isSupported ? 1 : 0);

            return (
              <Card key={complaint.id} variant="interactive" className="p-5 flex flex-col justify-between">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <StatusBadge status={complaint.status} size="sm" />
                    <PriorityBadge priority={complaint.priority} size="sm" />
                  </div>

                  {/* Reference & Category */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 font-semibold">
                    <span>{complaint.referenceNumber}</span>
                    <span className="text-slate-500 font-sans font-medium">{complaint.category.name}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-2">
                    {complaint.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Location & Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{complaint.address}, {complaint.ward}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Endorsement button */}
                    <button
                      type="button"
                      onClick={(e) => handleSupportClick(complaint.id, e)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                        isSupported 
                          ? 'bg-teal-100 text-teal-800 border border-teal-300' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title="Support this civic complaint"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isSupported ? 'fill-teal-700' : ''}`} />
                      <span>{currentSupportCount}</span>
                    </button>

                    <Link to={`/complaints/${complaint.referenceNumber}`}>
                      <Button variant="outline" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
