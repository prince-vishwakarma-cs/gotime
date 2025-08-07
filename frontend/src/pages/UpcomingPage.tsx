import { MapPin, Search } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useGetUpcomingEventsQuery } from '../redux/api/eventAPI';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    start_time: string;
    location: string;
    image_url: string | null;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  // Create separate date parts for the new design
  const date = new Date(event.start_time);
  const day = date.toLocaleDateString("en-IN", { day: "numeric" });
  const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();

  return (
    <Link
      to={`/events/${event.id}`}
      className="
        block group w-full overflow-hidden"
    >
      {/* --- Image Section --- */}
      <div className="relative overflow-hidden">
        <img
          src={event.image_url || "https://placehold.co/600x600/030303/f1f1f1?text=Event"}
          alt={event.title}
          className="
            w-full aspect-square object-cover rounded-lg /* MODIFIED: Now responsive & square */
            transition-transform duration-300 ease-in-out
            group-hover:scale-105
          "
        />
        <div 
          className="
            absolute bottom-12 right-4 translate-y-1/2 
            bg-card-background/70 backdrop-blur-md 
            border border-button-border 
            rounded-lg text-center shadow-lg w-16 h-16
          "
        >
          <div className="bg-primary-button-background text-primary-button-text text-xs font-bold uppercase py-1 rounded-t-lg">
            {month}
          </div>
          <div className="text-primary-text text-2xl font-bold py-1">
            {day}
          </div>
        </div>
      </div>
      
      {/* --- Content Section (UI Unchanged) --- */}
      <div className="py-4 px-2"> {/* Adjusted horizontal padding slightly for better spacing */}
        <h3 className="text-lg font-bold text-primary-text truncate mt-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-secondary-text mt-2">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
    </Link>
  );
};

const UpcomingEventsPage = () => {
  // 2. Local state for search and pagination remains the same.
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 3. Call the hook with all parameters. It will refetch automatically
  //    whenever `debouncedSearchTerm` or `currentPage` changes.
  const { 
    data: eventsData, 
    isLoading, 
    isError
  } = useGetUpcomingEventsQuery({ 
    search: debouncedSearchTerm, 
    page: currentPage, 
    limit: 8 
  });

  // 4. The useEffect is no longer needed!

  const events = eventsData?.events;
  const pagination = eventsData?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on a new search
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
        setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mx-auto pt-14 sm:pt-24 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold  mb-4">Upcoming Events</h1>
        <div className="relative text-text-primary bg-button-bg p-2 rounded-xl max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
          <input
            type="text"
            placeholder="Search an event"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-64 bg-transparent pl-10 outline-none "
          />
        </div>
      </header>

      {isLoading && <div className="text-center py-20">Loading events...</div>}
      {isError && <div className="text-center py-20 text-red-500">Error: { 'Failed to load events.'}</div>}
      
      {!isLoading && !isError && (
        <>
          {events && events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-12 space-x-4">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {pagination?.currentPage} of {pagination?.totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination || currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-secondary-text">No Events Found</h3>
              <p className="text-secondary-text">Try adjusting your search or check back later.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpcomingEventsPage;