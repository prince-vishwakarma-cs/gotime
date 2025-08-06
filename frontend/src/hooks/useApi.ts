import { AxiosError } from "axios";
import { useState } from "react";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

type ApiFunc<T, P extends any[]> = (...args: P) => Promise<{ data: T }>;

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  request: (...args: P) => Promise<T | undefined>;
}

export const useApi = <T, P extends any[]>(
  apiFunc: ApiFunc<T, P>
): UseApiReturn<T, P> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const request = async (...args: P): Promise<T | undefined> => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await apiFunc(...args);
      setState({ data: result.data, error: null, isLoading: false });
      return result.data;
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      const errorMessage =
        error.response?.data?.error || "An unexpected error occurred.";
      setState({ data: null, error: errorMessage, isLoading: false });

      throw new Error(errorMessage);
    }
  };

  return { ...state, request };
};
