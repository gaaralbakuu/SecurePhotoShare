// The AuthContext is used to manage authentication state,
// share authentication information across the app
// and provide methods for logging in, logging out, and refreshing access tokens.

import React, { createContext, useState, useEffect, ReactNode, useRef } from "react";

import { getGenericPassword, resetGenericPassword, setGenericPassword } from "react-native-keychain";
import { authorize, refresh } from "react-native-app-auth";
import EntraIdConfig from "./entra-id-config";

export type AuthStates = {
  isAuthLoading: boolean;
  isAuthError: boolean;
  isRefreshing: boolean;
  isRefreshingError: boolean;
  isLoggingOut: boolean;
  isLogoutError: boolean;
};

export type AuthInformation = {
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
  idToken: string;
  scopes: string[];
};

export type AuthContextType = {
  isSignedIn: () => boolean;
  isSignedOut: () => boolean;
  login: () => void;
  logout: () => void;
  authInformation: AuthInformation | null;
  getAccessToken: () => Promise<string | null>;
  authStates: AuthStates;
  authenticationError: string | null;
  // dev helper: force a fake signed-in state when non-null
  setFakeSignedIn?: (value: boolean | null) => void;
};

const initialAuthStates: AuthStates = {
  isAuthLoading: false,
  isAuthError: false,
  isRefreshing: false,
  isRefreshingError: false,
  isLoggingOut: false,
  isLogoutError: false,
};

export const AuthContext = createContext<null | AuthContextType>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authStates, setAuthStates] = useState(initialAuthStates);
  const [authInformation, setAuthInformation] = useState<AuthInformation | null>(null);
  const [authenticationError, setAuthenticationError] = useState<string | null>(null);
  // dev override: when not null, forces isSignedIn to return this value
  const [fakeSignedInFlag, setFakeSignedInFlag] = useState<boolean | null>(null);
  // keep a backup of the real authInformation so we can restore it after faking
  const previousRealAuthInformationRef = useRef<AuthInformation | null>(null);

  // developer helper: setFakeSignedIn will both set the flag and fake (or restore) authInformation
  const setFakeSignedIn = (value: boolean | null) => {
    setFakeSignedInFlag(value);
    if (value === true) {
      // backup real auth info only once
      if (previousRealAuthInformationRef.current === null) {
        previousRealAuthInformationRef.current = authInformation;
      }
      const fakeInfo: AuthInformation = {
        accessToken: 'fake-access-token',
        accessTokenExpirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour in future
        refreshToken: 'fake-refresh-token',
        idToken: 'fake-id-token',
        scopes: ['openid', 'offline_access'],
      };
      setAuthInformation(fakeInfo);
      return;
    }

    // value is false or null -> restore backed up real auth info if available, otherwise clear
    if (previousRealAuthInformationRef.current !== null) {
      setAuthInformation(previousRealAuthInformationRef.current);
      previousRealAuthInformationRef.current = null;
    } else {
      setAuthInformation(null);
    }
  };
  const isAccessTokenExpired = () => {
    if (authInformation === null) {
      return true;
    }
    if (authInformation.accessTokenExpirationDate === null || authInformation.accessTokenExpirationDate === undefined) {
      return true;
    }
    if (new Date(authInformation.accessTokenExpirationDate) < new Date()) {
      return true;
    }
    return false;
  };

  const isSignedIn = () => {
  // dev override: if a fake flag is set, use it
  if (fakeSignedInFlag !== null) return fakeSignedInFlag;
    if (authInformation === null) {
      return false;
    }
    if (authInformation.accessToken === null || authInformation.accessToken === undefined) {
      return false;
    }
    if (authInformation.accessTokenExpirationDate === null || authInformation.accessTokenExpirationDate === undefined) {
      return false;
    }
    // We don't check if the access token is expired here. We will refresh it when needed.
    return true;
  };

  // returns true if successful, else false.
  const saveAuthInformation = async (info: AuthInformation) : Promise<boolean> => {
    try {
      const stringifiedAuthInformation = JSON.stringify(info);
      const saveAuthInfoResult = await setGenericPassword("authInfo", stringifiedAuthInformation); // 1. Saves the auth information in the encrypted keychain.
      if (saveAuthInfoResult === false) {
        return false;
      }
      setAuthInformation(info); // 2. setState almost never fails. So let's setState after saving the keychain.
      return true;
    } catch {
      return false;
    }
  };

  // returns true if successful, else false.
  const clearAuthInformationFromStateAndKeychain = async () : Promise<boolean> => {
    try {
      const resetAuthInfoFromKeychainResult = await resetGenericPassword(); // 1. Clears the auth information in the encrypted keychain.
      if (!resetAuthInfoFromKeychainResult) {
        return false;
      }
      setAuthInformation(null); // 2. setState almost never fails. So let's setState after clearing the keychain.
      return true;
    } catch {
      return false;
    }
  };

  const login = async () => {
    setAuthStates({ ...authStates, isAuthLoading: true, isAuthError: false });
    setAuthenticationError(null);

    try {
      const result = await authorize(EntraIdConfig);
      const saveAuthInformationResult = await saveAuthInformation({
        accessToken: result.accessToken,
        accessTokenExpirationDate: result.accessTokenExpirationDate,
        refreshToken: result.refreshToken,
        idToken: result.idToken,
        scopes: result.scopes,
      });
      if (!saveAuthInformationResult) {
        setAuthStates(prevState => ({ ...prevState, isAuthError: true }));
      }
    } catch (e) {
      setAuthStates(prevState => ({ ...prevState, isAuthError: true }));
      setAuthenticationError((e as Error).message);
    } finally {
      setAuthStates(prevState => ({ ...prevState, isAuthLoading: false }));
    }
  };

  const logout = async () => {
    setAuthStates({ ...authStates, isLoggingOut: true, isLogoutError: false });

    // Entra ID does not support revoking access tokens, so we don't need to call revoke.
    // We just need to clear the auth information on our end.
    const clearAuthInformationResult = await clearAuthInformationFromStateAndKeychain();
    if (!clearAuthInformationResult) {
      setAuthStates(prevState => ({ ...prevState, isLogoutError: true }));
    }
    setAuthStates(prevState => ({ ...prevState, isLoggingOut: false }));
  };

  // In the case that refreshing the token fails, we need to clear the auth information from the state and keychain.
  // In the rare case that refreshing fails and clearing the auth information also fails, there nothing much we can do.
  // If isRefreshingError is true, but authInformation is not null, it indicates the rare case occurred. TODO: handle this case.
  // returns false if fails, otherwise the refreshed auth information.
  // if you want to access to refreshed auth info immediately after calling this function, you need to use the return value
  // if you read the state immediately after setting the state, you may get out dated info from previous state.
  const refreshAccessToken = async (): Promise<AuthInformation | false> => {
    let refreshingResult: AuthInformation | false = false;
    setAuthenticationError(null);

    setAuthStates({ ...authStates, isRefreshing: true, isRefreshingError: false });
    if (authInformation === null) {
      await clearAuthInformationFromStateAndKeychain();
      setAuthStates(prevState => ({ ...prevState, isRefreshingError: true, isRefreshing: false }));
      setAuthenticationError("Auth information is null");
      return refreshingResult;
    }
    if (authInformation.refreshToken === null || authInformation.refreshToken === undefined) {
      await clearAuthInformationFromStateAndKeychain();
      setAuthStates(prevState => ({ ...prevState, isRefreshingError: true, isRefreshing: false }));
      setAuthenticationError("no refresh token was found");
      return refreshingResult;
    }
    try {
      const result = await refresh(EntraIdConfig, {
        refreshToken: authInformation.refreshToken,
      });
      refreshingResult = {
        accessToken: result.accessToken,
        accessTokenExpirationDate: result.accessTokenExpirationDate,
        refreshToken: result.refreshToken ?? authInformation.refreshToken,
        idToken: result.idToken,
        scopes: authInformation.scopes,
      };
      const saveAuthInformationResult = await saveAuthInformation(refreshingResult);
      if (!saveAuthInformationResult) {
        refreshingResult = false;
        await clearAuthInformationFromStateAndKeychain();
        setAuthStates(prevState => ({ ...prevState, isRefreshingError: true }));
        setAuthenticationError("Unable to save auth information");
      }
    } catch (e) {
      refreshingResult = false;
      await clearAuthInformationFromStateAndKeychain();
      setAuthStates(prevState => ({ ...prevState, isRefreshingError: true }));
      setAuthenticationError((e as Error).message);
    }
    setAuthStates(prevState => ({ ...prevState, isRefreshing: false }));
    return refreshingResult;
  };

  const getAccessToken = async () => {
    if (isAccessTokenExpired()) {
      const refreshResult = await refreshAccessToken();
      if (!refreshResult) {
        return null;
      }
      return refreshResult.accessToken;
    }
    return authInformation?.accessToken ?? null;
  };

  const isSignedOut = () => !isSignedIn();

  useEffect(() => {
    // When the app starts, check the keychain for auth information.
    // If it exists, set the auth information in the state.
    const getAuthState = async () => {
      const result = await getGenericPassword();
      if (!result) {
        setAuthInformation(null);
        return;
      }
      setAuthInformation(JSON.parse(result.password));
    };
    getAuthState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
    isSignedIn, isSignedOut, login, logout, authInformation, authStates, getAccessToken, authenticationError,
  setFakeSignedIn: setFakeSignedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
