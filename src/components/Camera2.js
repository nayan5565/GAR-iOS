import React, { useEffect, useState } from 'react';
import { AppRegistry, BackHandler, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RNCamera } from 'react-native-camera';
import deviceInfoModule, { isTablet } from 'react-native-device-info';
import { ImageView } from '../constants/CustomWidget';

import { ConfirmationAlert } from './ConfirmationAlert';
import RNFetchBlob from 'rn-fetch-blob';
import { imageResize, storeData } from '../constants/helperFunction';
import { getAllImage, saveCaptureImage, updateSCV } from '../redux/actions/dbAction';
import ImageResizer from 'react-native-image-resizer';

function Camera2({ route, navigation }) {

    // state = { takingPic: false, imgUri: '', imageList: [] };
    const dispatch = useDispatch()
    const getImages = () => dispatch(getAllImage())
    const csvUpdate = (address, index) => dispatch(updateSCV(address, index,))
    const captureImageSave = (captureImage, addressItem, number, uploadStatus) => dispatch(saveCaptureImage(captureImage, addressItem, number, uploadStatus))
    const { csvDataList, status, selectAddress, imageList } = useSelector((state) => state.localDB)
    const [takingPic, setTakinPic] = useState(false);
    const [imgUri, setImgUri] = useState('');
    const [captureCurrentImageList, setImageList] = useState(route.params.imageList);
    const [address, setAddress] = useState(route.params.address);
    const [csvIndex, setCsvIndex] = useState(route.params.csvIndex);
    const [isTablet, setTable] = useState(deviceInfoModule.isTablet());
    const [alertVisible, setAlertVisible] = useState(false);

    function handleBackButtonClick() {
        navigation.replace('Home', { initialRoute: 'Parcel', addressItem: address, csvIndex: csvIndex })
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        getImages()
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, []);

    const PendingView = () => (
        <View
            style={{
                flex: 1,
                backgroundColor: 'lightgreen',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text>Waiting</Text>
        </View>
    );

    const bytesToSize = (bytes) => {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    //this method is perfect match
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    const imageResize = (path, width, height, quality) => {
        ImageResizer.createResizedImage(path, width, height, 'PNG', quality, 0, undefined, false,)
            .then(response => {
                // response.uri is the URI of the new image that can now be displayed, uploaded...
                // response.path is the path of the new image
                // response.name is the name of the new image with the extension
                // response.size is the size of the new image
                var maxSize = 3983900;
                // var maxSize = 1983900;
                // console.log('imageResize==>', formatBytes(response.size))
                // console.log('imageResize maxMB ==>', formatBytes(maxSize))
                if (response.size > maxSize) {
                    console.log('imageResize need reduce==>', width - 100)
                    imageResize(response.uri, width - 100, height - 100, 100)
                } else {
                    console.log('imageResize no need reduce')
                    captureImageSave(response.uri, address, 0, 'pending')
                    saveImage(response.uri)
                    csvInfo()
                }

                // setTakinPic(true)
                // setImgUri(response.uri)

            })
            .catch(err => {
                console.log('imageResize err==>', JSON.stringify(err))
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
            });

    }
    const takePicture = async (camera) => {
        const options = { quality: 0.5, base64: true };
        console.log('capture pressed');
        const data = await camera.takePictureAsync(options);
        //  eslint-disable-next-line
        console.log(JSON.stringify(data));
        var extc = data.uri.substring(data.uri.lastIndexOf('.') + 1)
        var imageName = data.uri.substring(data.uri.lastIndexOf('/') + 1)
        var maxSize = 3983900;
        // var maxSize = 1983900;
        console.log('uri',data.uri);
        const filePath = data.uri.split('///').pop()  // removes leading file:///
        RNFetchBlob.fs.stat(filePath)
            .then((stats) => {
                // console.log('image size===>', stats.size)
                // console.log('max size===>', formatBytes(maxSize))
                // console.log('formatBytes size===>', formatBytes(stats.size))
                console.log('image size===>', formatBytes(stats.size));
                if (stats.size > maxSize) {
                    console.log('takePicture need reduce')
                    imageResize(data.uri, 1024, 1024, 100)
                } else {
                    console.log('takePicture no need reduce')
                    captureImageSave(data.uri, address, 0, 'pending')
                    csvInfo()
                    saveImage(data.uri)
                }

            })
            .catch((err) => {
                console.log('err==>', err);

            })


        // setTakinPic(true)
        // setImgUri(data.uri)


    }

    const csvInfo = () => {
        getImages()
        //e.status == deleted and uploaded is both or except pending is uploaded to onedrive
        const uploadedImages = imageList.filter(e => e.address === address.address && e.status !== 'pending');
        const pendingImages = imageList.filter(e => e.address === address.address && e.status === 'pending');
        var process = uploadedImages.length + pendingImages.length + 1
        // console.log('process size===>', process)
        // console.log('pending size===>', pendingImages.length)
        // console.log('uploadedImages size===>', uploadedImages.length)
        var item = {
            ...csvDataList[csvIndex],
            process: process,
            status: 'No'
        }

        csvDataList[csvIndex] = item
        csvUpdate(item, csvIndex)
        storeData('csv_address', JSON.stringify(csvDataList))
    }

    const checkPermission = async (imagePath) => {

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                title: 'Storage Permission Required',
                message: 'App need access to your storage to download photos'
            }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('storage granted')

            } else { alert('Storage permission not granted') }
        } catch (error) {
            console.warn(error)
        }

    }


    const saveImage = (image) => {
        getImages()
        // captureCurrentImageList.push(image)
        // captureCurrentImageList = imageList.filter(e => e.address === address.address && e.status === 'pending' && e.tag === 'camera')
        var extc = image.substring(image.lastIndexOf('.') + 1)
        var type = 'type/' + extc
        var imageName = image.substring(image.lastIndexOf('/') + 1)
        var insertID = 1
        if (imageList.length > 0) {
            insertID = imageList[imageList.length - 1].id + 1
            // console.log('Img==>', imageList.length)
            // console.log('lastID==>', imageList[imageList.length - 1].id)

        }
        // console.log('insertID==>', insertID)
        captureCurrentImageList.push({
            id: insertID,
            imageUrl: image,
            imageName: imageName,
            imageType: type,
            address: address.address,
            imageNumber: 0,
            status: 'pending',
            tag: 'camera'
        })
        // setImageList(imageList.filter(e => e.address === address.address && e.status === 'pending' && e.tag === 'camera'))

        // storeData(address.address, JSON.stringify(captureCurrentImageList))

    }

    const AlertView = () => {
        return (
            <ConfirmationAlert
                modalVisible={alertVisible}
                setModalVisible={setAlertVisible}
                title={'Alert'}
                message={'Please capture at least one!!'}
                buttons={[
                    {
                        text: 'Stay',
                        func: () => { console.log('Stay Pressed') },
                    },
                    {
                        text: 'Leave',
                        func: () => {
                            console.log('Leave Pressed')
                            handleBackButtonClick()
                        },

                    },
                ]}
            />
        )
    }

    return (
        <View style={styles.container}>
            <AlertView />
            <RNCamera
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                captureAudio={false}
                flashMode={RNCamera.Constants.FlashMode.off}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                    title: 'Permission to use audio recording',
                    message: 'We need your permission to use your audio',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            >
                {({ camera, status, recordAudioPermissionStatus }) => {
                    if (status !== 'READY') return <PendingView />;
                    return (
                        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => takePicture(camera)} style={styles.capture}>
                                <Text style={{ fontSize: isTablet ? 28 : 14 }}> Capture({captureCurrentImageList.length}) </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => captureCurrentImageList.length < 1 ? setAlertVisible(true) : navigation.replace('Gallery', { imageList: captureCurrentImageList, address: address, csvIndex: csvIndex })} style={styles.capture}>
                                <Text style={{ fontSize: isTablet ? 28 : 14 }}> Done </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            </RNCamera>
            {takingPic && imgUri !== '' ? ImageView(imgUri, 150, 200,) : null}
        </View>
    );
}

export default Camera2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});
