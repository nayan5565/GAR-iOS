import React, { Component, useEffect, useState } from 'react';
import { View, SafeAreaView, Image, TouchableOpacity, Dimensions, Text, ActivityIndicator } from 'react-native';
import GlobalStyle from '../constants/GlobalStyle';
import imagePath from '../constants/imagePath';
import { authorize } from 'react-native-app-auth';
import { CLIENT_ID, MOBILE_REDIRECT_URL3 } from '../constants/one_drive_credential';
import { storeData } from '../constants/helperFunction';
import deviceInfoModule from 'react-native-device-info';
import { Loader } from '../constants/CustomWidget';

const screen = Dimensions.get('window')
const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

function LoginView({ navigation }) {
    const [orientation, setOrientation] = useState(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',);
    const [isTablet, setTable] = useState(deviceInfoModule.isTablet());
    const [isLogin, setLogin] = useState(false);


    useEffect(() => {

        const callback = () => setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

        const subscription = Dimensions.addEventListener('change', callback);


        return () => {
            subscription?.remove()
        };
    }, []);

    const login = async () => {

        const config = {
            clientId: CLIENT_ID,
            redirectUrl: MOBILE_REDIRECT_URL3,
            scopes: ["User.Read", "Files.ReadWrite", "offline_access"],
            additionalParameters: { prompt: 'select_account' },
            serviceConfiguration: {
                authorizationEndpoint:
                    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            },
        };


        // Log in to get an authentication token
        setLogin(true)
        try {
            const authState = await authorize(config);
            setLogin(false)
            await storeData('token', authState.accessToken)
            await storeData('isLogin', JSON.stringify(true))
            await storeData('refreshToken', authState.refreshToken)
            console.log('Login res==>', JSON.stringify(authState))
            navigation.replace('Home')
        } catch (error) {
            setLogin(false)
            console.log(error);
        }

    }


    return (
        <SafeAreaView style={{ padding: 12 }}>

            <View style={{ alignItems: 'center', marginTop: isTablet ? 48 : 32 }}>
                <Image resizeMode='contain' style={{ width: isTablet ? screen.width * 0.9 : screen.width * 0.8, alignSelf: 'center' }} source={imagePath.appLogo} />

                <Text style={{ color: '#656565', marginTop: isTablet ? 24 : 10, fontSize: isTablet ? 40 : 20, alignSelf: 'center' }}>GAR Photo App</Text>

                <TouchableOpacity
                    style={GlobalStyle.signinStyle}
                    onPress={() => login()} >
                    {isLogin ? Loader('teal', isTablet ? 48 : 24) : <Text style={{ fontSize: isTablet ? 32 : null }}>Sign In {isLogin}</Text>}

                </TouchableOpacity>

                <View style={{ margin: isTablet ? 24 : 12 }}></View>
                <Text style={{ color: '#656565', fontSize: isTablet ? 32 : 16, alignSelf: 'center' }}>Log In Required For Access</Text>

            </View>


        </SafeAreaView>



    );
}

export default LoginView;