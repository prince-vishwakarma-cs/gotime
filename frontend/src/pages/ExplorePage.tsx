import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { useGetAllEventsQuery } from "../redux/api/eventAPI";
import type { EventCardProps } from "../types/eventTypes";

const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = new Date(event.start_time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      to={`/events/${event.id}`}
      className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      <div className="relative">
        <img
          src={
            event.image_url ||
            "https://placehold.co/600x400/e2e8f0/475569?text=Event"
          }
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">{formattedDate}</p>
        <h3 className="text-lg font-bold text-gray-800 truncate">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 truncate">{event.location}</p>
      </div>
    </Link>
  );
};

const ExploreEventsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: allEventsData,
    isLoading,
    isError
  } = useGetAllEventsQuery({
    page: 1, 
    limit: 8,
    search: debouncedSearchTerm,
  });

  const allEvents = allEventsData?.events;

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Events
        </h1>

        <div className="relative text-text-primary bg-button-bg p-2 rounded-xl max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 " />
          <input
            type="text"
            placeholder="Search an event"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-transparent pl-10 outline-none "
          />
        </div>
      </header>

      {isLoading && <div className="text-center py-20">Loading events...</div>}
      
      {isError && (
        <div className="text-center py-20 text-red-500">
          <p>{"Failed to load events."}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <section>
          {allEvents && allEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allEvents.map((event) => (
                <EventCard key={`all-${event.id}`} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-700">
                No Events Found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or check back later.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ExploreEventsPage;