// See: https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react
export const msalConfig = {
    auth: {
        // // GAR Active Directory
        // clientId: "b1f3a65b-e1c9-41d1-9949-62db8b91d91f",
        // authority: "https://login.microsoftonline.com/00f8bec1-91f8-4493-81fb-a21966e45444",
        // // redirectUri: "http://localhost:3000"
        // redirectUri: "https://garreactphotoapp.azurewebsites.net"

        // CPI Graph Test APP
        clientId: "72eec892-1959-4939-974b-6e2f4554556c",
        authority: "https://login.microsoftonline.com/0fa9b75b-3586-4e91-8848-aea0b7e62d16",
        // redirectUri: "http://localhost:3000"
        redirectUri: "https://garreactphotoapp.azurewebsites.net"

        // CPI - ReactPhotoApp
        // clientId: "aa8c92c9-9f6f-4c5f-a374-9f4a5ff12529",
        // authority: "https://login.microsoftonline.com/0fa9b75b-3586-4e91-8848-aea0b7e62d16",
        // redirectUri: "http://localhost:3000" 

    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false,
    }
};

// Add scopes here for ID token to be used at Microsoft Identify platform endpoints
export const loginRequest = {
    scopes: ["User.Read", "Files.ReadWrite"]
};

// Add the endpoints here for Microsoft Graph API services you'd like to see 
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    graphMeItemUploadEndpoint: "https://graph.microsoft.com/v1.0/me/drive/items/01YP3BE5PDD2QV4TVWOJH2BXNNI5CZKI6V:/FILE_NAME:/content",
    graphMeItemDownloadEndpoint: "https://graph.microsoft.com/v1.0/me/drive/root:/photoapp/FILE_NAME?$select=content.downloadUrl,id",
    graphMePhotoAppIDEndpoint: "https://graph.microsoft.com/v1.0/me/drive/root:/photoapp?$select=id",
    graphMeFolderCreateEndpoint: "https://graph.microsoft.com/v1.0/me/drive/items/PARENT_ID/children?select=id"
}
