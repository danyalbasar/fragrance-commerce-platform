import axios from "axios";

const isDocker =
  process.env.NEXT_PUBLIC_DOCKER === "true";

const baseURL = isDocker
  ? "http://backend:8080/api"
  : process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getApiResponse(
  err: unknown
): { data?: unknown; status?: number } | undefined {
  if (
    typeof err === "object" &&
    err !== null &&
    typeof (err as { response?: unknown }).response === "object" &&
    (err as { response?: unknown }).response !== null
  ) {
    return (err as { response: { data?: unknown; status?: number } }).response;
  }

  return undefined;
}