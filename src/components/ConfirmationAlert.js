import React, { useState } from "react";
import { Alert, Dimensions, Modal, StyleSheet, Text, Pressable, View, Platform } from "react-native";
import deviceInfoModule from "react-native-device-info";

const isTablet = deviceInfoModule.isTablet()
const screen = Dimensions.get('window')
export const ConfirmationAlert = (props) => {

    const [androidDefaults, setAndroidDefaults] = useState({
        container: {
            backgroundColor: (props.android && props.android.container && props.android.container.backgroundColor) || '#FAFAFA',
        },
        title: {
            color: (props.android && props.android.title && props.android.title.color) || '#000000',
            // fontFamily: (props.android && props.android.title && props.android.title.fontFamily) || 'initial',
            fontSize: (props.android && props.android.title && props.android.title.fontSize) || isTablet ? 40 : 16,
            fontWeight: (props.android && props.android.title && props.android.title.fontWeight) || 'bold',
        },
        message: {
            color: (props.android && props.android.message && props.android.message.color) || 'grey',
            // fontFamily: (props.android && props.android.message && props.android.message.fontFamily) || 'initial',
            fontSize: (props.android && props.android.message && props.android.message.fontSize) || isTablet ? 28 : 16,
            fontWeight: (props.android && props.android.message && props.android.message.fontWeight) || 'normal',
        },
        button: {
            color: '#387ef5',
            // fontFamily: 'initial',
            fontSize: isTablet ? 30 : 16,
            fontWeight: '500',
            textTransform: 'uppercase',
            backgroundColor: 'transparent',
        },
    });

    const AndroidButtonBox = () => {
        const [buttonLayoutHorizontal, setButtonLayoutHorizontal] = useState(1);
        const buttonProps = props.buttons && props.buttons.length > 0 ? props.buttons : [{}]
        return (
            <View style={[styles.androidButtonGroup, {
                flexDirection: "row",
                justifyContent: 'flex-end'
            }]}>
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

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.modalVisible}
            presentationStyle={"overFullScreen"}
            onRequestClose={() => {
                props.setModalVisible(false);
            }}
        >
            <Pressable style={[Platform.OS === "ios" ? styles.iOSBackdrop : styles.androidBackdrop, styles.backdrop]} onPress={() => props.setModalVisible(true)} />
            <View style={styles.alertBox}>
                {

                    <View style={[styles.androidAlertBox, androidDefaults.container]}>
                        {props.title === '' ? <View style={{ marginTop: 24 }} /> : <Text style={[styles.androidTitle, androidDefaults.title]}>{props.title || ''}</Text>}
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
        maxWidth: isTablet ? screen.width * 0.8 : 280,
        width: '100%',
        margin: isTablet ? 70 : 48,
        elevation: isTablet ? 48 : 24,
        borderRadius: isTablet ? 4 : 2,
    },
    androidTitle: {
        margin: isTablet ? 24 : 10,
    },
    androidMessage: {
        marginLeft: isTablet ? 32 : 24,
        marginRight: isTablet ? 32 : 24,
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
