export interface EventCardProps {
  event: Event;
}

export interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  description: string;
  is_public: boolean;
  image_url: string | null;
  organizer_id: number;
  organizer_name?: string;
  is_registered?: boolean;
  available_seats?: number;
}

export interface EventFormData {
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  description: string;
  is_public: boolean;
  image_url?: string;
}

export interface EventsResponse {
  success: boolean;
  events: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
  };
}

export interface EventResponse {
  success: boolean;
  event: Event;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
}

export interface Bookmark {
  id: number;
  title: string;
  start_time: string;
  location: string;
  image_url: string | null;
}


export interface Registration {
  id: number;
  title: string;
  start_time: string;
  location: string;
  image_url: string | null;
  status: "registered" | "waitlisted" | "checked_in" | "cancelled";
}

export interface MyRegistrationsResponse {
  success: boolean;
  registrations: {
    upcoming: Registration[];
    past: Registration[];
  };
}

export interface GoogleCalendarResponse {
  success: boolean;
  googleCalendarUrl: string;
}
export interface EventStats {
  event_id: number;
  event_title: string;
  max_capacity: number;
  days_until_event: number;
  registration_breakdown: {
    total_confirmed: number;
    waitlisted: number;
  };
  capacity_info: {
    remaining_spots: number;
    percentage_used: number;
  };
  engagement: {
    bookmarks: number;
    registrations_last_24h: number;
  };
}

export interface EventStatsResponse {
  success: boolean;
  stats: EventStats;
}
export interface ShareableLinkResponse {
  success: boolean;
  shareUrl: string;
  qrCode: string;
}
