import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  MyRegistrationsResponse,
  Bookmark,
  EventStatsResponse,
  Event,
  EventsResponse,
  EventResponse,
  EventFormData,
  GoogleCalendarResponse,
  ShareableLinkResponse,
  MessageResponse,
} from "../../types/eventTypes";
import { baseUrl } from "../../config";

export const eventApi = createApi({
  reducerPath: "eventApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
    credentials: "include",
  }),
  tagTypes: ["Event", "EventList", "Registration", "Bookmark", "Stats"],
  endpoints: (builder) => ({
    //  EVENT QUERIES (Fetching Data)
    getAllEvents: builder.query<
      EventsResponse,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/events", params }),
      providesTags: ["EventList"],
    }),
    getUpcomingEvents: builder.query<
      EventsResponse,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/events/upcoming", params }),
      providesTags: ["EventList"],
    }),
    getTrendingEvents: builder.query<
      { success: boolean; events: Event[] },
      void
    >({
      query: () => "/events/trending",
      providesTags: ["EventList"],
    }),
    getEventById: builder.query<EventResponse, string | number>({
      query: (eventId) => `/events/${eventId}`,
      providesTags: (_, __, eventId) => [{ type: "Event", id: eventId }],
    }),
    getEventStats: builder.query<EventStatsResponse, string | number>({
      query: (eventId) => `/events/${eventId}/stats`,
      providesTags: (_, __, eventId) => [{ type: "Stats", id: eventId }],
    }),
    //  USER-SPECIFIC QUERIES
    getMyRegistrations: builder.query<MyRegistrationsResponse, void>({
      query: () => "/users/me/registrations",
      providesTags: ["Registration"],
    }),
    getMyBookmarks: builder.query<
      { success: boolean; bookmarks: Bookmark[] },
      void
    >({
      query: () => "/users/me/bookmarks",
      providesTags: ["Bookmark"],
    }),
    getMyCreatedEvents: builder.query<
      { success: boolean; events: Event[] },
      { sortBy?: "start_time" }
    >({
      query: (params) => ({ url: "/users/me/created-events", params }),
      providesTags: ["EventList"],
    }),
    //  EVENT MUTATIONS (Creating, Updating, Deleting)
    createEvent: builder.mutation<EventResponse, EventFormData>({
      query: (data) => ({
        url: "/events",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EventList"],
    }),
    updateEvent: builder.mutation<
      EventResponse,
      { eventId: string | number; data: Partial<EventFormData> }
    >({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
        "EventList",
      ],
    }),
    deleteEvent: builder.mutation<MessageResponse, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventList"],
    }),
    //  USER INTERACTION MUTATIONS
    registerForEvent: builder.mutation<MessageResponse, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/register`,
        method: "POST",
      }),
      invalidatesTags: ["Registration", "Event"],
    }),
    unregisterFromEvent: builder.mutation<MessageResponse, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/unregister`,
        method: "DELETE",
      }),
      invalidatesTags: ["Registration", "Event"],
    }),
    addBookmark: builder.mutation<MessageResponse, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/bookmark`,
        method: "POST",
      }),
      invalidatesTags: ["Bookmark"],
    }),
    removeBookmark: builder.mutation<MessageResponse, string | number>({
      query: (eventId) => ({
        url: `/events/${eventId}/bookmark`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookmark"],
    }),
    //  UTILITY ENDPOINTS (No Caching Needed)
    getGoogleCalendarLink: builder.query<
      GoogleCalendarResponse,
      string | number
    >({
      query: (eventId) => `/events/${eventId}/google-calendar`,
    }),
    getShareableLink: builder.query<ShareableLinkResponse, string | number>({
      query: (eventId) => `/events/${eventId}/share`,
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useGetUpcomingEventsQuery,
  useGetTrendingEventsQuery,
  useGetEventByIdQuery,
  useGetEventStatsQuery,
  useGetMyRegistrationsQuery,
  useGetMyBookmarksQuery,
  useGetMyCreatedEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useRegisterForEventMutation,
  useUnregisterFromEventMutation,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
  useGetGoogleCalendarLinkQuery,
  useLazyGetGoogleCalendarLinkQuery,
  useGetShareableLinkQuery,
  useLazyGetShareableLinkQuery
} = eventApi;
