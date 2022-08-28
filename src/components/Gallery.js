import React, { useEffect, useState } from 'react';
import { FlatList, Image, View, TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet, Dimensions, BackHandler, Platform, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { useDispatch, useSelector } from 'react-redux';
import deviceInfoModule from 'react-native-device-info';
import { ConfirmationAlert } from '../components/ConfirmationAlert';
import { checkConnected, formatBytes, getData, storeData, tokenRefresh } from '../constants/helperFunction';
import { deleteImageById, getAllImage, updateCaptureImage, updateSCV } from '../redux/actions/dbAction';
import { Loader } from '../constants/CustomWidget';

var totalPendingImage = 0;
const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

function Gallery({ route, navigation }) {
    const dispatch = useDispatch()
    const getImages = () => dispatch(getAllImage())
    const [selectedImage, setSelectedImage] = useState('');
    const [captureCurrentImageList, setImageList] = useState(route.params.imageList);
    const { csvDataList, status, selectAddress, imageList } = useSelector((state) => state.localDB)
    const updateUploadedImage = (captureImage, number, uploadStatus) => dispatch(updateCaptureImage(captureImage, number, uploadStatus))
    const deleteImage = (id) => dispatch(deleteImageById(id))
    const csvUpdate = (address, index) => dispatch(updateSCV(address, index,))
    const [uploading, setUploading] = useState(false);
    const [allUpdated, setAllUploaded] = useState(false);
    const [fileUploadNumber, setFileUploadNumber] = useState(1);
    const [orientation, setOrientation] = useState(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',);
    const [isTablet, setTable] = useState(deviceInfoModule.isTablet());
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertDeleteVisible, setAlertDeleteVisible] = useState(false);
    const [alertMSG, setAlertMSG] = useState('');
    const [alertTitle, setAlertTitle] = useState('Alert');
    const [percentage, setPercantage] = useState('0%');
    const { address, csvIndex } = route.params;
    console.log('Address===>', address.address)

    function handleBackButtonClick() {
        navigation.replace('Home', { initialRoute: 'Parcel', addressItem: address, csvIndex: csvIndex })
        return true;
    }

    useEffect(() => {
        const callback = () => setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

        const subscription = Dimensions.addEventListener('change', callback);
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
            subscription?.remove()
        };
    }, []);

    const createFolder = async () => {
        var isNetwork = await checkConnected()
        if (!isNetwork) {
            // if (isTablet) {
            setAlertTitle("Please try upload again later.")
            setAlertMSG("Internet connection is not available right now.")
            setAlertVisible(true)
            // } else
            //     alert('Please try upload again letter.Internet connection is not available right now.')
            return
        }

        console.log('start create folder');
        if (!uploading && captureCurrentImageList.length > 0) {
            setAllUploaded(false)
            setUploading(true)
            setFileUploadNumber(1)
            var folderCreated = await getData('createdFolder')
            var folderID = await getData('newFolderID')
            if (folderCreated == 'true') {

                // alert(folderID)
                if (folderID != 'No Data' && folderID != '') {
                    console.log('start upload image');
                    upload(folderID)
                }

            } else {
                var fileName = await getData('csv_name')
                var folderName = fileName.split('.')[0]
                var token = await getData('token')
                console.log('createFile token: ' + token);
                var rootUrl = 'https://graph.microsoft.com/v1.0/me/drive/root/children'
                var photoappUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:/photoapp:/children'

                var raw = JSON.stringify({
                    "name": folderName.toLocaleLowerCase(),
                    "folder": {},
                    "@microsoft.graph.conflictBehavior": "rename"

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
                    console.log('createFile res: ' + response.status);
                    if (response.status == 201) {
                        console.log('createFile: ' + JSON.stringify(result));
                        // alert(createdFolerId)
                        storeData('newFolderID', result.id)
                        storeData('createdFolder', JSON.stringify(true))
                        upload(result.id)
                    } else if (response.status == 401) {
                        var token = await tokenRefresh()
                        createFolder()
                        return
                    } else {
                        var folderID = await getData('newFolderID')
                        if (folderID == 'No Data') {
                            setAllUploaded(false)
                            setUploading(false)
                            alert(JSON.stringify(result))
                        } else {
                            upload(folderID)
                        }

                    }
                } catch (error) {
                    var folderID = await getData('newFolderID')
                    if (folderID == 'No Data') {
                        setAllUploaded(false)
                        setUploading(false)
                        console.log('createFile err: ' + JSON.stringify(error));
                        alert(error)
                    } else {
                        upload(folderID)
                    }
                }
            }
        }

    }

    const upload = async (createdFolerId) => {
        var accessToken = await getData('token')
        var newFolderId = createdFolerId + ':/'
        var number = 1;
        var imageName = '';
        var addressStatus = 'Yes';
        var numberByAddress = 1;
        var extractImageIndex = 0;
        if (captureCurrentImageList.length > 0) {
            //e.status == deleted and uploaded is both uploaded to onedrive
            // const uploadedImages = imageList.filter(e => e.address === address.address && e.status === 'uploaded');
            const uploadedImages = imageList.filter(e => e.address === address.address && e.status !== 'pending');
            if (uploadedImages.length > 0) {
                numberByAddress = uploadedImages[uploadedImages.length - 1].imageNumber
                numberByAddress = numberByAddress + 1
            }
            for (const res of captureCurrentImageList) {
                var isNetwork = await checkConnected()
                if (!isNetwork) {
                    // if (isTablet) {
                    //     setAlertMSG("Network connection lost!!")
                    //     setAlertVisible(true)
                    // } else
                    //     alert('Network connection lost!!')
                    setAlertTitle("Please try upload again letter.")
                    setAlertMSG("Internet connection is not available right now.")
                    setAlertVisible(true)
                    return
                }
                var extc = res.imageUrl.substring(res.imageUrl.lastIndexOf('.'))
                if (numberByAddress > 1)
                    imageName = address.address + ' ' + numberByAddress + extc
                else imageName = address.address + extc
                // console.log('Image name==>', imageName)
                const path = res.imageUrl;
                var url = 'https://graph.microsoft.com/v1.0/me/drive/items/' + newFolderId + imageName + ':/content'
                console.log('url==>', encodeURI(url));
                let response = await RNFetchBlob.fetch(
                    "PUT",
                    encodeURI(url),
                    {
                        Accept: "application/json",
                        'Authorization': 'Bearer ' + accessToken,
                        "Content-Type": "multipart/form-data"
                    },
                    RNFetchBlob.wrap(decodeURIComponent(path))
                    // listen to upload progress event
                ).uploadProgress({ interval: 0 }, (written, total) => {
                    console.log('uploaded size===>', formatBytes(written))

                    var round = Math.round(written / total * 100)
                    var percentage = round + '%'
                    setPercantage(percentage)
                    console.log('uploaded==>', percentage)
                })
                    // listen to download progress event
                    .progress((received, total) => {
                        console.log('progress', received / total)
                    }).catch(e => {
                        console.log('error', e);
                    });
                console.log('response.status==>', response.respInfo.status)
                console.log('response===>', JSON.stringify(response))
                extractImageIndex = imageList.findIndex(e => e.id === res.id);
                var uploadStatus = 'pending';
                if (response.respInfo.status === 200 || response.respInfo.status === 201) {
                    setPercantage('0%')
                    uploadStatus = 'uploaded'
                } else {

                    //401 is expired token
                    // alert('Token expired!!Please login again!!')

                    if (response.respInfo.status === 401) {
                        // alert('Token expired!! refreshing token')
                        var token = await tokenRefresh()
                        console.log('get ref token==>', token)
                        var folderID = await getData('newFolderID')
                        upload(folderID)
                        // navigation.popToTop()
                    } else if (response.respInfo.status === 404) {
                        //404 is folder not found
                        storeData('newFolderID', '')
                        storeData('createdFolder', JSON.stringify(false))
                        createFolder()
                    } else {
                        addressStatus = 'No'
                        setAllUploaded(false)
                        setUploading(false)
                    }

                    return
                }
                // updateUploadedImage(res, address, csvIndex, numberByAddress, uploadStatus)
                updateUploadedImage(res, numberByAddress, uploadStatus)
                if (response.respInfo.status === 200 || response.respInfo.status === 201) {
                    numberByAddress++;
                }

                number++;
                setFileUploadNumber(number)
            }

            const pendingImages = imageList.filter(e => e.address === address.address && e.status === 'pending' && e.tag === 'gallery');
            if (pendingImages.length > 0) {
                console.log('have pending==>', pendingImages.length)
                addressStatus = 'No'
            }
            getImages()
            //e.status == deleted and uploaded is both uploaded to onedrive
            var uploadedImages2 = imageList.filter(e => e.address === address.address && e.status !== 'pending');
            console.log('pendingImages.length==>', uploadedImages2.length)
            //minus 1 because advance increase numberByAddress for needed
            var photoUploaded = numberByAddress - 1
            // var photoUploaded = uploadedImages2.length + numberByAddress
            var process = uploadedImages2.length + pendingImages.length + captureCurrentImageList.length
            var item = {
                ...csvDataList[csvIndex],
                photoUploaded: photoUploaded,
                status: addressStatus
            }

            csvDataList[csvIndex] = item
            csvUpdate(item, csvIndex)
            storeData('csv_address', JSON.stringify(csvDataList))

            // var photoUploaded = uploadedImages.length + numberByAddress
            // var process = uploadedImages.length + pendingImages.length + captureCurrentImageList.length
            // var item = {
            //     ...csvDataList[csvIndex],
            //     process: process,
            //     photoUploaded: photoUploaded,
            //     status: addressStatus
            // }

            // csvDataList[csvIndex] = item

            // storeData('csv_address', JSON.stringify(csvDataList))
        } else console.log('no pending image')

        setImageList([])
        setUploading(false)
        setAllUploaded(true)
        setAlertMSG("All image successfully uploaded!!")
        setAlertVisible(true)
        // if (isTablet) {
        //     setAlertMSG("All image successfully uploaded!!")
        //     setAlertVisible(true)
        // }
        // else
        //     alert('All image successfully uploaded!!')
    }
    const deleteFileSdCard = (dirs) => {
        // let dirs =
        //   Platform.OS === "android"
        //     ? `/storage/emulated/0/Folder_name/${File_name}`
        //     : `${RNFS.DocumentDirectoryPath}/Folder_name/${File_name}`;
        console.log("dir==>", dirs);
        RNFetchBlob.fs
            .unlink(dirs)
            .then(() => {
                console.log("file is deleted");
                deleteItem()
            })
            .catch(err => {
                console.log("err", err);
            });
    }

    const deleteItem = () => {
        // const newArray = imageList.slice(0, -1)
        // updateUploadedImage(image, image.imageNumber, 'deleted')
        deleteImage(selectedImage.id)
        const filteredData = captureCurrentImageList.filter(item => item.imageUrl !== selectedImage.imageUrl);

        setImageList(filteredData)
        setSelectedImage('')
        var process = csvDataList[csvIndex].process - 1;
        var item = {
            ...csvDataList[csvIndex],
            process: process,
            status: process > 0 ? 'No' : ''
        }
        csvDataList[csvIndex] = item
        csvUpdate(item, csvIndex)
        storeData('csv_address', JSON.stringify(csvDataList))
    }

    const ChildViewGrid = (image, index) => {
        return (
            <View key={index} style={{ width: orientation === 'PORTRAIT' ? '48%' : '32%', height: isTablet ? 280 : 180, margin: 5, flexDirection: 'column' }}>
                <View >
                    <TouchableWithoutFeedback style={{ marginRight: 5, borderRadius: isTablet ? 12 : 8 }} onPress={() => setSelectedImage(image)}>
                        <Image style={{ height: isTablet ? 280 : 180, borderRadius: 8 }} source={{ uri: image.imageUrl }} /></TouchableWithoutFeedback>
                </View>

                {/* <View style={{ justifyContent: 'center', }}>
                    <Text onPress={()=>onClickItem( title)} style={{ color: 'white' }}>{title}</Text>
                    <Text>{subTitle}</Text>
                </View> */}

            </View>
        )
    }

    const SingleImage = () => {
        return (
            <View style={{ flex: 1, width: '100%', height: '100%', }}>
                <DeleteAlertView />
                <Image style={{ width: '100%', height: orientation === 'PORTRAIT' ? '90%' : '85%', resizeMode: 'contain' }} source={{ uri: selectedImage.imageUrl }} />


                <View style={{ flexDirection: 'row', height: orientation === 'PORTRAIT' ? '10%' : '14%', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setSelectedImage('')}
                        style={{ marginTop: 0, paddingHorizontal: isTablet ? 24 : 12, paddingVertical: 8, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        <Text style={{ fontSize: isTablet ? 28 : 14, color: 'white' }}> OK </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAlertDeleteVisible(true)}
                        style={{ marginLeft: isTablet ? 32 : 16, paddingHorizontal: isTablet ? 24 : 12, paddingVertical: isTablet ? 16 : 8, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        <Text style={{ fontSize: isTablet ? 24 : 14, color: 'white' }}> Discard </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }


    const UploadingText = () => {

        return (

            <Text style={{ color: 'white', fontSize: isTablet ? 28 : 14 }}>Uploading {fileUploadNumber}({percentage})/{captureCurrentImageList.length} </Text>

        )
    }
    const ListViewGrid = () => {
        // console.log('orientation==>', orientation)
        var numColumns = orientation === 'PORTRAIT' ? 2 : 3
        // console.log('numColumns==>', numColumns)
        return (
            <FlatList style={{ height: '90%', margin: 5 }} numColumns={numColumns} data={captureCurrentImageList} renderItem={({ item, index }) => ChildViewGrid(item, index)} />
        )
    }
    const BuildList = () => {
        return (
            <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <AlertView />
                <ListViewGrid />
                <View style={{ justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', }}>
                    {!uploading ? null : Loader('#00ff00', isTablet ? 84 : 48)}
                </View>
                <View style={{ flexDirection: 'row', height: orientation === 'PORTRAIT' ? '10%' : '14%', width: '100%', justifyContent: 'space-evenly', alignItems: 'center', }}>
                    <TouchableOpacity onPress={() => handleBackButtonClick()}
                        style={{ paddingHorizontal: isTablet ? 12 : 6, paddingVertical: isTablet ? 12 : 6, marginLeft: 0, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        <Text style={{ color: 'white', fontSize: isTablet ? 24 : 13, alignSelf: 'center', }}>Back To List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => createFolder()}
                        style={{ paddingHorizontal: isTablet ? 12 : 6, paddingVertical: isTablet ? 12 : 6, marginLeft: 0, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        {uploading ? allUpdated ? null : UploadingText() : <Text style={{ color: 'white', fontSize: isTablet ? 24 : 13, alignSelf: 'center', }}>Upload Photos</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.replace('Camera2', { imageList: captureCurrentImageList, address: address, csvIndex: csvIndex })}
                        style={{ paddingHorizontal: isTablet ? 12 : 6, paddingVertical: isTablet ? 12 : 6, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        <Text style={{ fontSize: isTablet ? 24 : 13, color: 'white' }}> Take More Photo </Text>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }

    const AlertView = () => {
        return (
            <ConfirmationAlert
                modalVisible={alertVisible}
                setModalVisible={setAlertVisible}
                title={alertTitle}
                message={alertMSG}
                buttons={[
                    {
                        func: () => {
                            allUpdated ? handleBackButtonClick() : null
                            console.log('OK Pressed', allUpdated)
                        },

                    }]}
            />
        )
    }

    const DeleteAlertView = () => {
        return (
            <ConfirmationAlert
                modalVisible={alertDeleteVisible}
                setModalVisible={setAlertDeleteVisible}
                title={'Alert'}
                message={'Do you want to delete!!'}
                buttons={[
                    {
                        text: 'No',
                        func: () => { console.log('Stay Pressed') },
                    },
                    {
                        text: 'Delete',
                        func: () => {
                            deleteFileSdCard(selectedImage.imageUrl)
                        },

                    },
                ]}
            />
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {selectedImage === '' ? BuildList() : SingleImage()}
        </View>
    );
}

export default Gallery;

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
    loader: {
        justifyContent: 'center',
        alignItems: 'center'
    },
});
