import { AuthContext, AuthContextType } from "app/auth/auth-context";
import axios from "axios";
import { useContext, useState } from "react";
import Config from "react-native-config";

type AuthorizedHttpRequestStates = {
  isLoading: boolean; // api call in progress
  isError: boolean;
  isSuccess: boolean; // api call finished with ok status code
};

type AuthorizedHttpRequestResult = {
  statusCode: number | undefined;
  response: unknown | undefined;
};

type SendRequestParams<TResponseType> = {
  body?: object | null;
  headers?: Record<string, string>;
  onSuccess?: (response: TResponseType) => void;
};

type UseMakeAuthorizedHttpRequestReturnType<TResponseType> = {
  sendRequest: (params: SendRequestParams<TResponseType>) => void;
  states: AuthorizedHttpRequestStates;
  result?: AuthorizedHttpRequestResult;
};

const useMakeAuthorizedHttpRequest = <TResponseType = unknown> (
  url: string,
  method: "get" | "post" | "put" | "delete",
) : UseMakeAuthorizedHttpRequestReturnType<TResponseType> => {
  const [requestStates, setRequestStates] = useState<AuthorizedHttpRequestStates>({
    isLoading: false,
    isError: false,
    isSuccess: false,
  });
  const [response, setResponse] = useState<TResponseType | undefined>(undefined);
  const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

  const { getAccessToken } = useContext(AuthContext) as AuthContextType;
  const sendRequest = async (params?: SendRequestParams<TResponseType>) => {
    setRequestStates({
      isLoading: true,
      isError: false,
      isSuccess: false,
    });

    const accessToken = await getAccessToken();
    const baseUrl = Config.BASE_API_URL;

    axios({
      url,
      baseURL: baseUrl ?? "",
      method: method ?? "get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...params?.headers,
      },
      data: params?.body,
    }).then((result) => {
      setRequestStates({
        isLoading: false,
        isError: false,
        isSuccess: true,
      });
      setResponse(result.data);
      setStatusCode(result.status);
      if (params?.onSuccess) {
        params.onSuccess(result.data);
      }
    }).catch((error) => {
      setRequestStates({
        isLoading: false,
        isError: true,
        isSuccess: false,
      });
      if (error.response) {
        // The request was made and the server responded with a status code
        setStatusCode(error.response.status);
        setResponse(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setStatusCode(undefined);
      } else {
        // Something happened in setting up the request that triggered an Error
        setStatusCode(undefined);
      }
    });
  };

  return {
    sendRequest,
    states: requestStates,
    result: {
      statusCode,
      response,
    },
  };
};

export default useMakeAuthorizedHttpRequest;
