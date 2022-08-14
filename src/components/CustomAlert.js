import React, { useState } from "react";
import { Alert, Modal, StyleSheet, Text, Pressable, View, Platform } from "react-native";
import deviceInfoModule from "react-native-device-info";
const isTablet = deviceInfoModule.isTablet()
export const CustomAlert = (props) => {

    const [androidDefaults, setAndroidDefaults] = useState({
        container: {
            backgroundColor: (props.android && props.android.container && props.android.container.backgroundColor) || '#FAFAFA',
        },
        title: {
            color: (props.android && props.android.title && props.android.title.color) || '#000000',
            fontFamily: (props.android && props.android.title && props.android.title.fontFamily) || 'initial',
            fontSize: (props.android && props.android.title && props.android.title.fontSize) || 22,
            fontWeight: (props.android && props.android.title && props.android.title.fontWeight) || 'bold',
        },
        message: {
            color: (props.android && props.android.message && props.android.message.color) || '#000000',
            fontFamily: (props.android && props.android.message && props.android.message.fontFamily) || 'initial',
            fontSize: (props.android && props.android.message && props.android.message.fontSize) || 15,
            fontWeight: (props.android && props.android.message && props.android.message.fontWeight) || 'normal',
        },
        button: {
            color: '#387ef5',
            fontFamily: 'initial',
            fontSize: isTablet ? 30 : 16,
            fontWeight: '500',
            textTransform: 'uppercase',
            backgroundColor: 'transparent',
        },
    });
    const [iOSDefaults, setIOSDefaults] = useState({
        container: {
            backgroundColor: (props.ios && props.ios.iosContainer && props.ios.iosContainer.backgroundColor) || '#F8F8F8',
        },
        title: {
            color: (props.ios && props.ios.title && props.ios.title.color) || '#000000',
            fontFamily: (props.ios && props.ios.title && props.ios.title.fontFamily) || 'initial',
            fontSize: (props.ios && props.ios.title && props.ios.title.fontSize) || 17,
            fontWeight: (props.ios && props.ios.title && props.ios.title.fontWeight) || '600',
        },
        message: {
            color: (props.ios && props.ios.message && props.ios.message.color) || '#000000',
            fontFamily: (props.ios && props.ios.message && props.ios.message.fontFamily) || 'initial',
            fontSize: (props.ios && props.ios.message && props.ios.message.fontSize) || 13,
            fontWeight: (props.ios && props.ios.message && props.ios.message.fontWeight) || 'normal',
        },
        button: {
            color: '#387ef5',
            fontFamily: 'initial',
            fontSize: isTablet ? 34 : 17,
            fontWeight: '500',
            textTransform: 'none',
            backgroundColor: 'transparent',
        },
    });
    const AndroidButtonBox = () => {
        const [buttonLayoutHorizontal, setButtonLayoutHorizontal] = useState(1);
        const buttonProps = props.buttons && props.buttons.length > 0 ? props.buttons : [{}]

        return (
            <View style={[styles.androidButtonGroup, {
                flexDirection: buttonLayoutHorizontal === 1 ? "row" : "row",
                justifyContent: 'flex-end'
            }]} onLayout={(e) => {
                if (e.nativeEvent.layout.height > 60)
                    setButtonLayoutHorizontal(0);
            }}>
                {
                    buttonProps.map((item, index) => {
                        if (index > 2) return null;
                        const alignSelfProperty = buttonProps.length > 2 && index === 0 && buttonLayoutHorizontal === 1 ? 'flex-start' : 'flex-end';
                        let defaultButtonText = 'OK'
                        if (buttonProps.length > 2) {
                            if (index === 0)
                                defaultButtonText = 'ASK ME LATER'
                            else if (index === 1)
                                defaultButtonText = 'CANCEL';
                        } else if (buttonProps.length === 2 && index === 0)
                            defaultButtonText = 'CANCEL';
                        return (
                            <View key={index} style={[styles.androidButton, index === 0 && buttonLayoutHorizontal === 1 ? { flex: 1 } : {}]}>
                                <Pressable onPress={() => {
                                    props.setModalVisible(false)
                                    if (item.func && typeof (item.func) === 'function')
                                        item.func();
                                }} style={[{
                                    alignSelf: alignSelfProperty,

                                }]}>
                                    <View style={[styles.androidButtonInner, { backgroundColor: (item.styles && item.styles.backgroundColor) || androidDefaults.button.backgroundColor }]}>
                                        <Text
                                            style={{
                                                color: (item.styles && item.styles.color) || androidDefaults.button.color,
                                                fontFamily: (item.styles && item.styles.fontFamily) || androidDefaults.button.fontFamily,
                                                fontSize: (item.styles && item.styles.fontSize) || androidDefaults.button.fontSize,
                                                fontWeight: (item.styles && item.styles.fontWeight) || androidDefaults.button.fontWeight,
                                                textTransform: (item.styles && item.styles.textTransform) || androidDefaults.button.textTransform,
                                            }}
                                        >{item.text || defaultButtonText}</Text>
                                    </View>
                                </Pressable>
                            </View>
                        )
                    })

                }
            </View>
        );
    }
    const IOSButtonBox = () => {
        const buttonProps = props.iosButtons && props.iosButtons.length > 0 ? props.iosButtons : [{}]
        const [buttonLayoutHorizontal, setButtonLayoutHorizontal] = useState(buttonProps.length === 2 ? 1 : 0);


        return (
            <View style={[styles.iOSButtonGroup, {
                flexDirection: buttonLayoutHorizontal === 1 ? "row" : "column",
                justifyContent: 'flex-end'
            }]} onLayout={(e) => {
                if (e.nativeEvent.layout.height > 60)
                    setButtonLayoutHorizontal(0);
            }}>
                {
                    buttonProps.map((item, index) => {
                        let defaultButtonText = 'OK'
                        if (buttonProps.length > 2) {
                            if (index === 0)
                                defaultButtonText = 'ASK ME LATER'
                            else if (index === 1)
                                defaultButtonText = 'CANCEL';
                        } else if (buttonProps.length === 2 && index === 0)
                            defaultButtonText = 'CANCEL';
                        const singleButtonWrapperStyle = {}
                        let singleButtonWeight = iOSDefaults.button.fontWeight;
                        if (index === buttonProps.length - 1) {
                            singleButtonWeight = '700';
                        }
                        if (buttonLayoutHorizontal === 1) {
                            singleButtonWrapperStyle.minWidth = '40%';
                            if (index === 0) {
                                singleButtonWrapperStyle.borderStyle = 'solid';
                                singleButtonWrapperStyle.borderRightWidth = 0.55;
                                singleButtonWrapperStyle.borderRightColor = '#dbdbdf';
                            }

                        }
                        return (
                            <View key={index} style={[styles.iOSButton, singleButtonWrapperStyle]}>
                                <Pressable onPress={() => {
                                    props.setModalVisible(false)
                                    if (item.func && typeof (item.func) === 'function')
                                        item.func();
                                }}>
                                    <View style={[styles.iOSButtonInner, { backgroundColor: (item.styles && item.styles.backgroundColor) || iOSDefaults.button.backgroundColor }]}>
                                        <Text
                                            style={{
                                                color: (item.styles && item.styles.color) || iOSDefaults.button.color,
                                                fontFamily: (item.styles && item.styles.fontFamily) || iOSDefaults.button.fontFamily,
                                                fontSize: (item.styles && item.styles.fontSize) || iOSDefaults.button.fontSize,
                                                fontWeight: (item.styles && item.styles.fontWeight) || singleButtonWeight,
                                                textTransform: (item.styles && item.styles.textTransform) || iOSDefaults.button.textTransform,
                                                textAlign: 'center'
                                            }}
                                        >{item.text || defaultButtonText}</Text>
                                    </View>
                                </Pressable>
                            </View>
                        )
                    })

                }
            </View>
        );
    }
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={() => {
                props.setModalVisible(false);
            }}
        >
            <Pressable style={[Platform.OS === "ios" ? styles.iOSBackdrop : styles.androidBackdrop, styles.backdrop]} onPress={() => props.setModalVisible(false)} />
            <View style={styles.alertBox}>
                {
                    Platform.OS === "ios" ?
                        <View style={[styles.iOSAlertBox, iOSDefaults.container]}>
                            <Text style={[styles.iOSTitle, iOSDefaults.title]}>{props.iosTitle || 'Message'}</Text>
                            <Text style={[styles.iOSMessage, iOSDefaults.message]}>{props.iosMessage || ''}</Text>
                            <IOSButtonBox />
                        </View>
                        :
                        <View style={[styles.androidAlertBox, androidDefaults.container]}>
                            {props.title === '' ? <View style={{ marginTop: 10 }} /> : <Text style={[styles.androidTitle, androidDefaults.title]}>{props.title || ''}</Text>}
                            <Text style={[styles.androidMessage, androidDefaults.message]}>{props.message || ''}</Text>
                            <AndroidButtonBox />
                        </View>
                }
            </View>


        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: isTablet ? 44 : 22
    },

    button: {
        borderRadius: isTablet ? 40 : 20,
        padding: isTablet ? 20 : 10,
        elevation: isTablet ? 4 : 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },

    iOSBackdrop: {
        backgroundColor: "#000000",
        opacity: 0.3
    },
    androidBackdrop: {
        backgroundColor: "#232f34",
        opacity: 0.4
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    alertBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    androidAlertBox: {
        maxWidth: isTablet ? 480 : 280,
        width: '100%',
        margin: isTablet ? 70 : 48,
        elevation: isTablet ? 48 : 24,
        borderRadius: isTablet ? 4 : 2,
    },
    androidTitle: {
        margin: isTablet ? 48 : 24,
    },
    androidMessage: {
        marginLeft: isTablet ? 48 : 24,
        marginRight: isTablet ? 48 : 24,
        marginBottom: isTablet ? 48 : 24,
    },
    androidButtonGroup: {
        marginTop: 0,
        marginRight: 0,
        marginBottom: isTablet ? 16 : 8,
        marginLeft: isTablet ? 32 : 24,
    },
    androidButton: {
        marginTop: isTablet ? 24 : 12,
        marginRight: isTablet ? 16 : 8,
    },
    androidButtonInner: {
        padding: isTablet ? 16 : 10,

    },

    iOSAlertBox: {
        maxWidth: isTablet ? 480 : 280,
        width: '100%',
        zIndex: 10,
        borderRadius: 13,
    },
    iOSTitle: {
        paddingTop: isTablet ? 24 : 12,
        paddingRight: isTablet ? 32 : 16,
        paddingBottom: isTablet ? 14 : 7,
        paddingLeft: isTablet ? 32 : 16,
        marginTop: isTablet ? 16 : 8,
        textAlign: "center",
    },
    iOSMessage: {
        paddingTop: 0,
        paddingRight: isTablet ? 32 : 16,
        paddingBottom: isTablet ? 42 : 21,
        paddingLeft: isTablet ? 32 : 16,
        textAlign: "center"
    },
    iOSButtonGroup: {
        marginRight: -0.55
    },
    iOSButton: {

        borderTopColor: '#dbdbdf',
        borderTopWidth: 0.55,
        borderStyle: 'solid',
    },
    iOSButtonInner: {
        minHeight: 44,
        justifyContent: 'center'
    }
});