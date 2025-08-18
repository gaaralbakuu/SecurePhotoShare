import { BaseAppId } from "app/consts/app-consts";
import { AuthConfiguration } from "react-native-app-auth";
import Config from "react-native-config";

const tenantId = Config.ENTRA_ID_TENANT_ID;
const clientId = Config.ENTRA_ID_CLIENT_ID;
const apiAccessScope = Config.API_ACCESS_SCOPE ?? "";

const EntraIdConfig : AuthConfiguration = {
  // the clientID matches the one registered in the Entra ID app registration. It identifies the app to the Microsoft Entra ID.
  clientId: clientId ?? "",
  // The redirect URL must match the one registered in the Azure portal.
  // It makes sure when authentication is successful, it redirects back to the app.
  // Based on tests, we don't need to include the suffix like '.dev' in the redirect URL.
  // Note the trailing slash is required for ios to function, and has no impact on Android
  redirectUrl: `${BaseAppId}://auth/`,
  // Scopes:
  // 1. openid: Required for OpenID Connect authentication. Essential for user authentication.
  // 2. offline_access: Required for refresh token flow. Allows the app to obtain a new access token without user interaction.
  // 3. apiAccessScope: Related to permissions. In Azure, we created an access level (scope) for Secure Photo Share API. Now we are requesting that scope.
  // The scope system enables more granular control over permissions. For example, a possible scope can be "api_access_read",
  // so that users granted with this scope can only read data, but not write it.
  // Currently we only have one scope for Secure Photo Share API, which is "api_access". It grants general access to the API.
  // This scope is necessary for the app to access the API.
  scopes: ["openid", "offline_access", apiAccessScope],
  // prompt login: forces the user to enter their credentials every time they log in, even if their logging state is cached.
  additionalParameters: { prompt: "login" },
  // Microsoft Entra ID endpoints
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`, // the endpoint for user authentication.
    tokenEndpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, // the endpoint to refresh the access token.
    // endSessionEndpoint not needed, as Entra ID does not support logout through an endpoint.
  },
};

export default EntraIdConfig;
