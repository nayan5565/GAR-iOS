import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import DrawerContent from './DrawerContent';
import CsvDownloadView from '../views/CsvDownloadView';
import ParcelListView from '../views/ParcelListView';
import { Dimensions, TouchableOpacity } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import UploadedCaptureImageView from '../views/UploadedCaptureImageView';


const screen = Dimensions.get('window')
const Drawer = createDrawerNavigator();
const isTablet = deviceInfoModule.isTablet()

function MyDrawer({ route }) {
    const { initialRoute, addressItem, csvIndex } = route.params;
    return (

        <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} initialRouteName={initialRoute} useLegacyImplementation='false'>
            <Drawer.Screen name="CSV" component={CsvDownloadView} options={{
                headerShown: true, title: 'CSV Download', drawerStyle: { width: screen.width * 0.8 }, headerTitleStyle: { fontSize: isTablet ? 28 : 16 },
                drawerIcon: config => <Icon
                    size={23}
                    name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}></Icon>
            }} />
            <Drawer.Screen name="Parcel" initialParams={{ isBack: initialRoute === 'CSV' ? false : true, addressItem: initialRoute === 'CSV' ? null : addressItem, csvIndex: initialRoute === 'CSV' ? null : csvIndex }} component={ParcelListView} options={{ headerShown: true, title: 'Parcel List', drawerStyle: { width: screen.width * 0.8 }, headerTitleStyle: { fontSize: isTablet ? 28 : 16 } }} />
            <Drawer.Screen name="Uploaded" component={UploadedCaptureImageView} options={{ headerShown: true, title: 'Uploaded List', drawerStyle: { width: screen.width * 0.8 }, headerTitleStyle: { fontSize: isTablet ? 28 : 16 } }} />
        </Drawer.Navigator>


    );
}

export default MyDrawer;