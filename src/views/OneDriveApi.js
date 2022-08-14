import React, { useEffect, useState } from 'react';
import { View, Button, Text, ScrollView, SafeAreaView } from 'react-native';
import { REACT_SINGLE_APP_CLIENT_ID, REACT_SINGLE_APP_CLIENT_SECRET_VALUE, REACT_SINGLE_APP_TENANT_ID } from '../constants/one_drive_credential';

function OneDriveApi(props) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const getAccessToken = async () => {
        var data = new URLSearchParams();
        data.append('resource', 'https://graph.microsoft.com');
        data.append('client_secret', REACT_SINGLE_APP_CLIENT_SECRET_VALUE);
        data.append('client_id', REACT_SINGLE_APP_CLIENT_ID);
        data.append('grant_type', 'client_credentials');
        try {
            const response = await fetch('https://login.microsoft.com/' + REACT_SINGLE_APP_TENANT_ID + '/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data.toString(),
                json: true,
            });
            const result = await response.json();

            if (response.status == 200) {
                // alert(result.token_type)
                ondriveUser(result.access_token)
                console.log('Login res: ' + JSON.stringify(result));

            } else {
                console.error('Login res: ' + JSON.stringify(result));

                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('Login err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            setLoading(false);
        }

    }
    const ondriveUser = async (token) => {
        console.log('Login token: ' + token);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/users', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            const result = await response.json();
            console.log('ondriveUser res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                // console.log('ondriveUser: ' + JSON.stringify(result));
                ondriveUserByID(token, result.value[0].id)

            } else {
                alert(result.message)
            }
        } catch (error) {
            console.log('ondriveUser err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            setLoading(false);
        }

    }

    const ondriveUserByID = async (token, userId) => {
        console.log('Login userId: ' + userId);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/users/' + userId, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            const result = await response.json();
            console.log('ondriveUserByID res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                console.log('ondriveUserByID success');
                getFiles(token, userId)

            } else {
                alert(result.message)
            }
        } catch (error) {
            console.log('ondriveUserByID err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            setLoading(false);
        }
    }
    const url = 'https://graph.microsoft.com/v1.0/users/f4b5464f-0fe4-4a8f-b8a6-5095978e749e/drive/root/children';

    const getFiles = async (token, userId) => {
        console.log('getFiles userId: ' + userId);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/users/' + userId + '/drive/root/children', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            const result = await response.json();
            console.log('getFiles res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                console.log('getFiles: ' + JSON.stringify(result));

            } else {
                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('getFiles err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getAccessToken();
    }, []);
    return (
        <View>

        </View>
    );
}

export default OneDriveApi;