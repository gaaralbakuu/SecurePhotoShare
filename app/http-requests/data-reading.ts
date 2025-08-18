import useMakeAuthorizedHttpRequest from "app/http-requests/use-make-authorized-http-request";

type PostDataReadingResponse = {
  success: boolean;
  errorMessage?: string;
};

// will add more endpoints later.
export const usePostDataReading = () => useMakeAuthorizedHttpRequest<PostDataReadingResponse>(
  "/Data/dataReading",
  "post",
);
