import axios from "axios";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

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
export interface UserResponse {
  success: boolean;
  message?: string;
  user: User;
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

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});
export interface UpdateProfileData {
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

export const loginUser = (credentials: LoginCredentials) =>
  apiClient.post<AuthResponse>("/auth/login", credentials);

export const logoutUser = () => apiClient.post("/auth/logout");

export const registerUser = (data: RegisterData) =>
  apiClient.post<AuthResponse>("/users", data);

export const getMyProfile = () =>
  apiClient.get<{ success: boolean; user: User }>("/users/me");
export const updateUserProfile = (data: UpdateProfileData) =>
  apiClient.put<UserResponse>("/users/me", data);

export const changePassword = (data: ChangePasswordData) =>
  apiClient.put<MessageResponse>("/users/me/password", data);

export const deleteAccount = (data: DeleteAccountData) =>
  apiClient.delete<MessageResponse>("/users/me", { data });

export const getMyRegistrations = () =>
  apiClient.get<MyRegistrationsResponse>("/users/me/registrations");

export const getMyBookmarks = () =>
  apiClient.get<{ success: boolean; bookmarks: Bookmark[] }>(
    "/users/me/bookmarks"
  );
export const getEventStats = (eventId: number | string) =>
  apiClient.get<EventStatsResponse>(`/events/${eventId}/stats`);

export const getMyCreatedEvents = (sortBy?: "start_time") =>
  apiClient.get<{ success: boolean; events: Event[] }>(
    "/users/me/created-events",
    { params: { sortBy } }
  );

export const getAllEvents = (params: {
  search?: string;
  page?: number;
  limit?: number;
}) => apiClient.get<EventsResponse>("/events", { params });

export const getUpcomingEvents = (params: {
  search?: string;
  page?: number;
  limit?: number;
}) => apiClient.get<EventsResponse>("/events/upcoming", { params });

export const getTrendingEvents = () =>
  apiClient.get<{ success: boolean; events: Event[] }>("/events/trending");

export const getEventById = (eventId: number | string) =>
  apiClient.get<EventResponse>(`/events/${eventId}`);

export const createEvent = (data: EventFormData) =>
  apiClient.post<EventResponse>("/events", data);

export const updateEvent = (
  eventId: number | string,
  data: Partial<EventFormData>
) => apiClient.put<EventResponse>(`/events/${eventId}`, data);

export const deleteEvent = (eventId: number | string) =>
  apiClient.delete(`/events/${eventId}`);

export const getGoogleCalendarLink = (eventId: number | string) =>
  apiClient.get<GoogleCalendarResponse>(`/events/${eventId}/google-calendar`);

export const getShareableLink = (eventId: number | string) =>
  apiClient.get<ShareableLinkResponse>(`/events/${eventId}/share`);

export const registerForEvent = (eventId: number | string) =>
  apiClient.post(`/events/${eventId}/register`);

export const unregisterFromEvent = (eventId: number | string) =>
  apiClient.delete(`/events/${eventId}/unregister`);

export const addBookmark = (eventId: number | string) =>
  apiClient.post(`/events/${eventId}/bookmark`, { eventId });

export const removeBookmark = (eventId: number | string) =>
  apiClient.delete(`/events/${eventId}/bookmark`);
