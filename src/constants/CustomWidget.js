import React from "react";
import { ActivityIndicator, Image, PermissionsAndroid, Platform, View } from "react-native";
import { exp } from "react-native-reanimated";

export const ItemDivider = () => {
    return (
        <View
            style={{
                height: 1,
                width: "100%",
                backgroundColor: "#eaeaea",
            }}
        />
    );
}
export const VerticalGap = (gap) => {
    return (
        <View
            style={{
                marginVertical: gap
            }}
        />
    );
}

export const HorizontalGap = (gap) => {
    return (
        <View
            style={{
                marginHorizontal: gap
            }}
        />
    );
}
export const Loader = (color, size) => {
    return (
        <ActivityIndicator color={color} size={size} />
    )
}

export const ImageView = (url, width, height) => {
    return (
        <Image
            style={{ width: width, height: height }}
            source={{
                uri: url,
            }}
        />
    )
}