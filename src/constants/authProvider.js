import { MsalAuthProvider, LoginType } from 'react-aad-msal';
import { CLIENT_ID, FILE_UPLOAD_APP_CLIENT_ID, FILE_UPLOAD_APP_REDIRECT_URL, TENANT_ID } from '../constants/one_drive_credential';

// Msal Configurations
const config = {
    auth: {
        authority: 'https://login.microsoftonline.com/common',
        clientId: CLIENT_ID,
        redirectUri: FILE_UPLOAD_APP_REDIRECT_URL
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};

// Authentication Parameters
const authenticationParameters = {
    scopes: ["User.Read", "Files.ReadWrite"]
}

// Options
const options = {
    loginType: LoginType.Popup,
    tokenRefreshUri: window.location.origin + '/auth.html'
}

export const authProvider = new MsalAuthProvider(config, authenticationParameters, options)