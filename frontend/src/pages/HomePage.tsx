import { Calendar, ChevronDown, MapPin, PartyPopper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetTrendingEventsQuery } from "../redux/api/eventAPI";
import type { EventCardProps } from "../types/eventTypes";

const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = new Date(event.start_time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Link to={`/events/${event.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-80">
            <img
              src={
                event.image_url ||
                "https://placehold.co/600x400/e2e8f0/475569?text=Event"
              }
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent border-card-border border hover:border-card-border-hover"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-card-primary-text">
              <h3 className="text-lg font-bold mb-2 truncate">{event.title}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-white/90 text-sm">
                <span className="flex items-center text-card-secondary-text">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center text-card-secondary-text">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};
const review = [
  {
    review:
      "A fantastic platform for discovering and managing events. The UI is clean and intuitive. Highly recommended!",
    id: "alex",
    url: "https://i.pravatar.cc/48?u=g",
  },
  {
    review:
      "I love how easy it is to create an event and invite my friends. The whole process is seamless from start to finish.",
    id: "jessica",
    url: "https://i.pravatar.cc/48?u=f",
  },
  {
    review:
      "The trending events section is my favorite. I've discovered so many cool concerts and workshops through it.",
    id: "michael",
    url: "https://i.pravatar.cc/48?u=p",
  },
];

export default function Component() {
  const navigate = useNavigate();
  const { data: trendingEventsData, isLoading } = useGetTrendingEventsQuery();

  const trendingEvents = trendingEventsData?.events;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-secondary-text">
        <div className="text-center py-20">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="h-full px-4 sm:px-6 lg:px-8">
      <section className="relative pt-24 pb-12 sm:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-center text-4xl leading-tight sm:text-5xl sm:leading-snug lg:text-[3.375rem] lg:leading-[3.92644rem] font-semibold tracking-tight text-white ">
            Create events, invite friends
            <br />
            Host a memorable event
            <br />
            today
          </h1>

          <p className="mt-4 text-center text-base sm:text-lg font-normal leading-normal tracking-[-0.05rem] text-secondary-text">
            Manage and Attend Events Easily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 mt-6">
            <Link
              to="/explore"
              className="bg-primary-button-background rounded-full text-primary-button-text hover:bg-primary-button-hover-background px-6 py-3 flex justify-center items-center"
            >
              <PartyPopper className="w-4 h-4 mr-2" />
              Explore events
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 ">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl pb-12 font-semibold tracking-tight text-white">
            Trending Events
          </h2>
          <section className="mb-16">
            {trendingEvents && trendingEvents.length > 0 ? (
              <div className="flex justify-center gap-4">
                {trendingEvents.map((event) => (
                  <EventCard key={`trending-${event.id}`} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-secondary-text">
                No trending events right now.
              </p>
            )}
          </section>

          <div className="text-center flex justify-center">
            <button
              onClick={() => navigate("/explore")}
              className="text-secondary-text flex hover:text-primary-text items-center transition-colors"
            >
              Show more <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>
      <section className="py-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <div className="flex -space-x-3 mr-4">
              <div className="border-white">
                <img
                  src="https://i.pravatar.cc/40?u=a"
                  alt="Reviewer 1"
                  className="rounded-full border border-button-border"
                />
              </div>
              <div>
                <img
                  src="https://i.pravatar.cc/40?u=b"
                  alt="Reviewer 2"
                  className="rounded-full border border-button-border"
                />
              </div>
              <div>
                <img
                  src="https://i.pravatar.cc/40?u=c"
                  alt="Reviewer 3"
                  className="rounded-full border border-button-border"
                />
              </div>
              <div>
                <img
                  src="https://i.pravatar.cc/40?u=d"
                  alt="Reviewer 4"
                  className="rounded-full border border-button-border"
                />
              </div>
            </div>
            <span className="text-secondary-text">+ Testimonials</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {review.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-card-bg border border-card-border hover:border-card-border-hover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div>
                    <img
                      src={rev.url}
                      alt={rev.id}
                      className="rounded-full w-12 h-12"
                    />
                  </div>
                  <div className="flex-1">
                    <blockquote className="font-semibold text-card-primary-text mb-2">
                      "{rev.review}"
                    </blockquote>
                    <p className="text-sm text-card-secondary-text">
                      @{rev.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card-bg text-card-tertiary-text py-16  mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold mb-2 text-card-primary-text">
                GoTime
              </h3>
              <p className="text-sm text-card-secondary-text">
                support@eventmanager.com
              </p>
            </div>
            <div>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Terms and conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#b3b3b3] mb-4">
                Social links
              </h4>
              <ul className="space-y-3 text-[#b3b3b3]">
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    X
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-card-secondary-text transition-colors"
                  >
                    Threads
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
