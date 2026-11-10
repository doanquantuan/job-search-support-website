import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Building, Briefcase } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';
import jobApi from '../services/jobApi';

export const JobSearchBar = () => {
  const { keyword, location, setKeyword, setLocation, fetchJobs } = useJobStore();

  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localLocation, setLocalLocation] = useState(location);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  // Debounce gọi autocomplete API khi gõ từ khóa
  useEffect(() => {
    const trimmed = localKeyword.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const data = await jobApi.getAutocompleteSuggestions(trimmed, 6);
        setSuggestions(data || []);
        setShowSuggestions((data || []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [localKeyword]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setKeyword(localKeyword);
    setLocation(localLocation);
    fetchJobs();
  };

  const handleSelectSuggestion = (item) => {
    setLocalKeyword(item.text);
    setKeyword(item.text);
    setShowSuggestions(false);
    fetchJobs();
  };

  return (
    <section className="bg-gradient-to-b from-primary/5 via-base-100 to-base-100 border-b border-base-200/80 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-6">
          Tìm việc làm phù hợp với bạn
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* Ô tìm kiếm từ khóa kèm Dropdown Autocomplete */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Chức danh, kỹ năng, công ty..."
              className="w-full bg-base-100 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-base-content placeholder:text-base-content/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-xs"
            />

            {/* Dropdown gợi ý Autocomplete */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-base-100 border border-base-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-base-200">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-base-200/60 flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="text-base-content/40 group-hover:text-primary transition-colors">
                      {item.type === 'company' ? (
                        <Building className="w-4 h-4" />
                      ) : (
                        <Briefcase className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base-content truncate group-hover:text-primary">
                        {item.text}
                      </div>
                      {item.companyName && (
                        <div className="text-xs text-base-content/50 truncate">
                          {item.companyName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ô tìm kiếm địa điểm */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              placeholder="Địa điểm (Hà Nội, TP. HCM...)"
              className="w-full bg-base-100 border border-base-300 rounded-xl pl-10 pr-4 py-2.5 text-base-content placeholder:text-base-content/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition shadow-xs"
            />
          </div>

          {/* Nút bấm Tìm kiếm */}
          <button
            type="submit"
            className="btn btn-primary px-7 h-11 min-h-11 rounded-xl font-semibold text-sm text-white shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </button>
        </form>
      </div>
    </section>
  );
};
