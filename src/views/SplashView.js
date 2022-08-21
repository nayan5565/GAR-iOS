import React, { useEffect } from 'react';
import { View } from 'react-native';
import customStyle from '../../customStyle'
import { Loader } from '../constants/CustomWidget';
import { getData } from '../constants/helperFunction';

const SplashView = ({ navigation }) => {
    const changeScreen = async () => {
        try {
            const login = await getData('isLogin')
            console.log('Sp: ' + login)
            if (login === 'No Data') {
                console.log('No data')
                navigation.replace('Landing');
            }
            else if (login === 'true') {
                console.log('home')
                navigation.replace('Home', { initialRoute: 'CSV' });
            } else { console.log('Login'); navigation.replace('Landing'); }

        } catch (e) {
            console.log('Sp: ' + JSON.stringify(e))
            navigation.replace('Landing');
        }
    }
    useEffect(() => {
        setTimeout(() => {
            changeScreen()
        }, 1000);

    }, []);
    return (
        <View style={customStyle.splashContainer}>
            {Loader('white', 'large')}

        </View>
    );
}

export default SplashView;