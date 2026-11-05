import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { COMPANY_LOCATIONS as LOCATIONS } from '@/constants/jobFilters';

export const CompanySearchBar = ({ onSearch, initialSearch = '', initialLocation = 'all' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search: searchTerm, location: selectedLocation });
  };

  return (
    <div className="card bg-base-100 p-3 sm:p-4 border border-base-200 shadow-sm rounded-box">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-3">
        {/* Input Tìm tên công ty */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập tên công ty..."
            className="input input-bordered w-full pl-10 h-11 text-sm focus:input-primary rounded-btn"
          />
        </div>

        {/* Dropdown Địa điểm */}
        <div className="relative w-full md:w-56">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="select select-bordered w-full pl-10 h-11 min-h-11 text-sm focus:select-primary rounded-btn font-normal text-base-content"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nút Tìm kiếm */}
        <button
          type="submit"
          className="btn btn-primary h-11 min-h-11 px-8 text-white text-sm font-semibold rounded-btn w-full md:w-auto shadow-xs gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Tìm kiếm</span>
        </button>
      </form>
    </div>
  );
};

export default CompanySearchBar;

