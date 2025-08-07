import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  DeleteAccountData,
  AuthResponse,
  UserResponse,
  MessageResponse,
} from "../../types/types";
import { baseUrl } from "../../config";

export const authAPI = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
    logoutUser: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
    registerUser: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
    getMyProfile: builder.query<UserResponse, void>({
      query: () => "/users/me",
      providesTags: [{ type: "User", id: "PROFILE" }],
    }),
    updateUserProfile: builder.mutation<UserResponse, UpdateProfileData>({
      query: (data) => ({
        url: "/users/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
    changePassword: builder.mutation<MessageResponse, ChangePasswordData>({
      query: (data) => ({
        url: "/users/me/password",
        method: "PUT",
        body: data,
      }),
    }),
    deleteAccount: builder.mutation<MessageResponse, DeleteAccountData>({
      query: (data) => ({
        url: "/users/me",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useRegisterUserMutation,
  useGetMyProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = authAPI;
