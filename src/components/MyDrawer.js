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


const screen = Dimensions.get('window')
const Drawer = createDrawerNavigator();
const isTablet = deviceInfoModule.isTablet()

function MyDrawer() {

    return (

        <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />} initialRouteName="CSV" useLegacyImplementation='false'>
            <Drawer.Screen name="CSV" component={CsvDownloadView} options={{
                headerShown: true, title: 'CSV Download', drawerStyle: { width: screen.width * 0.8 }, headerTitleStyle: { fontSize: isTablet ? 28 : 16 },
                drawerIcon: config => <Icon
                    size={23}
                    name={Platform.OS === 'android' ? 'md-list' : 'ios-list'}></Icon>
            }} />
            <Drawer.Screen name="Parcel" component={ParcelListView} options={{ headerShown: true, title: 'Parcel List', drawerStyle: { width: screen.width * 0.8 }, headerTitleStyle: { fontSize: isTablet ? 28 : 16 } }} />
        </Drawer.Navigator>


    );
}

export default MyDrawer;