import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import type { EventCardProps } from '../types/eventTypes';
import { useGetUpcomingEventsQuery } from '../redux/api/eventAPI';


const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = new Date(event.start_time).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link to={`/events/${event.id}`} className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={event.image_url || 'https://placehold.co/600x400/e2e8f0/475569?text=Event'} 
          alt={event.title} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.is_registered && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Registered
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{formattedDate}</p>
        <h3 className="text-lg font-bold text-gray-800 truncate">{event.title}</h3>
        <p className="text-sm text-gray-600 truncate">{event.location}</p>
        {event.available_seats !== undefined && (
          <p className="text-xs text-gray-500 mt-2">{event.available_seats} seats available</p>
        )}
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
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
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
              <h3 className="text-xl font-semibold text-gray-700">No Events Found</h3>
              <p className="text-gray-500">Try adjusting your search or check back later.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpcomingEventsPage;