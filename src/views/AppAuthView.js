import React, { useEffect, useState } from 'react';
import { View, Button, Text, ScrollView, SafeAreaView, Image, FlatList, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { authorize } from 'react-native-app-auth';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { CLIENT_ID, TENANT_ID, REDIRECT_URL, REACT_SINGLE_APP_TENANT_ID, REACT_SINGLE_APP_CLIENT_ID, REACT_SINGLE_APP_REDIRECT_URL, MOBILE_REDIRECT_URL, MOBILE_REDIRECT_URL2, MOBILE_REDIRECT_URL3, MOBILE_REDIRECT_URL4 } from '../constants/one_drive_credential';
import { graphConfig } from '../constants/authConfig';
import RNFetchBlob from 'rn-fetch-blob'
import { getData } from '../constants/helperFunction';

// const { config } = RNFetchBlob

const images = [];
function AppAuthView(props) {
    const [image, setImage] = useState();
    const [imageLength, setImageLength] = useState();
    const [login, setLogin] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const [allUploaded, setAllUploaded] = useState(false);
    const [imageType, setImageType] = useState();
    const [imageName, setImageName] = useState();
    const [base64, setBase64] = useState();
    const [fileUploadNumber, setFileUploadNumber] = useState(1);
    const [accessToken, setAccessToken] = useState();
    const [list, setList] = useState([]);


    useEffect(() => {
        getAccessToken()
    }, []);

    const getAccessToken = async () => {
        var token = await getData('token')
        console.log('AccessToken==>', token)
        setAccessToken(token)
    }

    const pickMultipleFile = async () => {
        setShowImage(true)
        try {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images],
                allowMultiSelection: true
            });
            console.log(
                'PickImage===>', JSON.stringify(results)
            );
            setList([])
            for (const res of results) {
                var track = {
                    url: res.uri,
                    imageName: res.name,
                    imageType: res.type,
                };
                console.log(
                    'PickImage add===>', res.uri
                );
                images.push(track)
                setList(prev => ([...prev, track]))
                setImage(res.uri)
                setImageType(res.type)
                setImageName(res.name)
            }
            // setList(images)
            // console.log(
            //     'PickImage===>', list[0].url
            // );
            setShowImage(false)
            console.log(
                'PickImage2===>', images[0].url
            );
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    }

    const cameraLaunch = () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        launchCamera(options, (res) => {
            console.log('Response = ', res);
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                setImage(res.assets[0].uri)
                var track = {
                    url: res.assets[0].uri,
                    imageName: res.assets[0].fileName,
                    imageType: res.assets[0].type,
                };
                images.push(track)
                setList(images)
            }
        });
    }

    const imageGalleryLaunch = () => {
        let options = {
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            includeBase64: true,
        };
        launchImageLibrary(options, (res) => {
            console.log('Response = ', res);
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                console.log('response', res.assets[0].uri);
                setBase64(res.assets[0].base64)
                setImageType(res.assets[0].type)
                setImage(res.assets[0].uri)
                setImageName(res.assets[0].fileName)
            }
        });
    }

    const signIn = async () => {

        const config = {
            clientId: CLIENT_ID,
            redirectUrl: MOBILE_REDIRECT_URL3,
            scopes: ["User.Read", "Files.ReadWrite"],
            additionalParameters: { prompt: 'select_account' },
            serviceConfiguration: {
                authorizationEndpoint:
                    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            },
        };

        // Log in to get an authentication token

        try {
            const authState = await authorize(config);
            setLogin(true)
            console.log('Login res==>', JSON.stringify(authState))
            setAccessToken(authState.accessToken)

        } catch (error) {
            console.log(error);
        }

    }

    const userDetails = async (token) => {
        console.log('Login token: ' + token);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            const result = await response.json();
            console.log('ondriveUser res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                console.log('ondriveUser: ' + JSON.stringify(result));
                // ondriveUserByID(token, result.value[0].id)
                getSpecificFolderFiles(token, '1e93e66f-a605-4a5a-8b86-4dd273dc64cd')
                // alert(JSON.stringify(result))
            } else {
                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('ondriveUser err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            // setLoading(false);
        }

    }

    const getFiles = async (token, userId) => {
        console.log('getFiles userId: ' + token);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
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
                alert(JSON.stringify(result))
            } else {
                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('getFiles err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            // setLoading(false);
        }
    }

    const createFile = async (token) => {
        console.log('createFile token: ' + token);
        var rootUrl = 'https://graph.microsoft.com/v1.0/me/drive/root/children'
        var photoappUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/photoapp:/children'

        var raw = JSON.stringify({
            "name": "TEST",
            "folder": {},

        });
        try {
            const response = await fetch(photoappUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: raw,
            });
            const result = await response.json();
            console.log('createFile res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                console.log('createFile: ' + JSON.stringify(result));
                alert(JSON.stringify(result))
            } else {
                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('createFile err: ' + JSON.stringify(error));
            alert(error)

        }
    }

    const upload = async () => {
        console.log('Image l==>', list.length)
        console.log('upload token==>', accessToken)
        setUploading(true)
        var photoAppFolderID = '01YP3BE5PDD2QV4TVWOJH2BXNNI5CZKI6V:/';
        var childFolderID = '01YP3BE5P77T47UAXC2FC3CE674TTZ3MKG:/';
        var number = 1;
        for (const res of list) {

            const path = res.url.replace("file://", "");
            var url = 'https://graph.microsoft.com/v1.0/me/drive/items/' + childFolderID + res.imageName + ':/content'
            let response = await RNFetchBlob.fetch(
                "PUT",
                url,
                {
                    Accept: "application/json",
                    'Authorization': 'Bearer ' + accessToken,
                    "Content-Type": "multipart/form-data"
                },
                RNFetchBlob.wrap(path)
            );
            console.log('Image==>', res.url)
            console.log('response===>', JSON.stringify(response))
            number++;
            setFileUploadNumber(number)
        }

        setUploading(false)
        setAllUploaded(true)

    }
    const getSpecificFolderFiles = async (token, userId) => {
        console.log('getSpecificFolderFiles token: ' + token);
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/photoapp:/children', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
            });
            const result = await response.json();
            console.log('getSpecificFolderFiles res: ' + JSON.stringify(result));
            if (response.status == 200) {
                // alert(result.token_type)
                console.log('getSpecificFolderFiles: ' + JSON.stringify(result));
                alert(JSON.stringify(result))
            } else {
                alert(JSON.stringify(result))
            }
        } catch (error) {
            console.log('getSpecificFolderFiles err: ' + JSON.stringify(error));
            alert(error)

        } finally {
            // setLoading(false);
        }
    }

    const ChildViewGrid = (image) => {
        return (
            <View style={{ backgroundColor: 'white', width: 180, height: 180, padding: 10, margin: 5, flexDirection: 'column' }}>
                <View >
                    <Image style={{ height: 180, width: '100%' }} source={{ uri: image }} />
                </View>


            </View>
        )
    }

    const ListViewGrid = () => {
        return (
            <FlatList numColumns={2} data={images} renderItem={({ item }) => ChildViewGrid(item.url)} />
        )
    }

    const LoginView = () => {
        return (
            <View style={{ flex: 1, width: '100%', padding: 12 }}>
                <Button title={login ? 'Logged' : 'Sign In'} onPress={() => signIn()} />
            </View>
        )
    }

    const UploadingText = () => {
        return (
            <View style={{ alignSelf: 'center' }}>
                <Text>Image uploading {fileUploadNumber}/{images.length} </Text>
            </View>
        )
    }

    const UploadView = () => {
        return (
            <View style={{ flex: 1, width: '100%' }}>
                <View style={{ flexDirection: 'row', marginBottom: 10, alignSelf: 'center' }}>
                    {/* <Button title='Capture Image' onPress={() => cameraLaunch()} /> */}
                    <View style={{ marginHorizontal: 12 }} />
                    <Button title='Pick Image' onPress={() => pickMultipleFile()} />

                    {/* <Image style={{ width: 200, height: 200, alignSelf: 'center' }} source={{ uri: image }} /> */}
                </View>
                {showImage ? <ActivityIndicator color='teal' size={40} /> : null}
                {uploading ? UploadingText() : allUploaded ? <View style={{ alignSelf: 'center' }}>
                    <Text>All Image Uploaded </Text>
                </View> : null}

                {ListViewGrid()}
                <View style={{ margin: 12 }} />
                <Button title={uploading ? 'Uploading...(' + list.length + ' image selected)' : 'Upload (' + list.length + ' image selected)'} onPress={() => upload()} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1, width: '100%', padding: 12 }}>

            {UploadView()}

            {/* {login ? UploadView() : LoginView()} */}
        </View>
    );
}

export default AppAuthView;