import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { Avatar, Caption, Drawer, Paragraph, Switch, Title, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { storeData } from '../constants/helperFunction';
import imagePath from '../constants/imagePath';

const screen = Dimensions.get('screen')
const isTablet = deviceInfoModule.isTablet()


function DrawerContent({ props, navigation }) {
    const [isDarkTheme, setDarkTheme] = useState(false)
    const [selectedItem, setSelectedItem] = useState(0)
    const toggleTheme = () => {
        setDarkTheme(!isDarkTheme)
    }
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={styles.userInfoSection}>
                        <Image resizeMode='contain' style={{ width: screen.width * 0.8, alignSelf: 'center' }} source={imagePath.appLogo} />
                    </View>

                    <Drawer.Section style={styles.drawerSection}>
                        <Drawer.Section style={styles.bottomDrawerSection}>
                            <DrawerItem icon={({ color, size }) => (
                                <Icon
                                    name='exit-to-app'
                                    color={color}
                                    size={isTablet ? 48 : 24} />)}
                                labelStyle={{ fontSize: isTablet ? 32 : 14 }}
                                label='Sign out'
                                onPress={async () => { await storeData('isLogin', JSON.stringify(false)); navigation.replace('Landing') }}
                            />
                        </Drawer.Section>
                        <DrawerItem
                            activeTintColor='teal'
                            activeBackgroundColor='white'
                            focused={selectedItem === 0}
                            icon={({ color, size }) => (
                                <Icon
                                    name='download-outline'
                                    color={color}
                                    size={isTablet ? 48 : 24} />)}
                            labelStyle={{ fontSize: isTablet ? 32 : 14 }}
                            label='CSV Download'
                            onPress={() => { setSelectedItem(0), navigation.navigate('CSV') }}
                        />
                        <DrawerItem
                            focused={selectedItem === 1}
                            activeTintColor='teal'
                            activeBackgroundColor='white'
                            icon={({ color, size }) => (
                                <Icon
                                    name='transfer'
                                    color={color}
                                    size={isTablet ? 48 : 24} />)}
                            labelStyle={{ fontSize: isTablet ? 32 : 14 }}
                            label='Parcel List'
                            onPress={() => { setSelectedItem(1), navigation.navigate('Parcel', { isBack: false, addressItem: null, csvIndex: 0 }) }}
                        />
                        <DrawerItem
                            focused={selectedItem === 2}
                            activeTintColor='teal'
                            activeBackgroundColor='white'
                            icon={({ color, size }) => (
                                <Icon
                                    name='transfer'
                                    color={color}
                                    size={isTablet ? 48 : 24} />)}
                            labelStyle={{ fontSize: isTablet ? 32 : 14 }}
                            label='Uploaded List'
                            onPress={() => { setSelectedItem(2), navigation.navigate('Uploaded') }}
                        />
                    </Drawer.Section>

                </View>
            </DrawerContentScrollView>
            {/* <Drawer.Section style={styles.bottomDrawerSection}>
                <DrawerItem icon={({ color, size }) => (
                    <Icon
                        name='exit-to-app'
                        color={color}
                        size={size} />)}
                    label='Sign out'
                    onPress={() => { }}
                />
            </Drawer.Section> */}
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1
    },
    userInfoSection: {
        paddingLeft: isTablet ? 40 : 20
    },
    title: {
        fontSize: isTablet ? 32 : 16,
        marginTop: 3,
        fontWeight: 'bold'
    },
    caption: {
        fontSize: isTablet ? 28 : 14,
        lineHeight: isTablet ? 28 : 14
    },
    row: {
        marginTop: isTablet ? 40 : 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    section: {
        marginRight: isTablet ? 32 : 16,
        flexDirection: 'row',
        alignItems: 'center'
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: isTablet ? 6 : 3
    },
    drawerSection: {
        width: screen.width,
        marginTop: isTablet ? 32 : 16,
    },
    bottomDrawerSection: {
        marginBottom: isTablet ? 32 : 16,
        borderTopColor: '#f4f4f4',
        borderTopWidth: isTablet ? 2 : 1
    },
    preference: {
        paddingHorizontal: isTablet ? 32 : 16,
        paddingVertical: isTablet ? 24 : 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

})

export default DrawerContent;