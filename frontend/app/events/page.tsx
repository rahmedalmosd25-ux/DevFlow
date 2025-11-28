'use client';

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/header";
import EventCard from "@/components/event-card";
import { eventApi, Event } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventApi.getPublishedEvents();
        if (response.success && response.data?.events) {
          setEvents(response.data.events);
        } else {
          setError('Failed to load events');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      } else if (sortBy === "date-desc") {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [events, searchQuery, categoryFilter, sortBy]);

  const categories = ["all", "Party", "Games", "Traveling", "Hiking", "Conference", "Festival"];

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Events</h1>
            <p className="text-gray-600">Discover and explore all published events</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Search events by title, description, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Category Filter */}
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Earliest First)</SelectItem>
                  <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500 ml-auto">
                {filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery || categoryFilter !== "all"
                  ? "No events match your search criteria."
                  : "No events available at the moment."}
              </p>
              {(searchQuery || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

