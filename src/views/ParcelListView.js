import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Text, TextInput, View, Dimensions, FlatList, Image, ScrollView } from 'react-native';
import GlobalStyle from '../constants/GlobalStyle';
import { useDispatch, useSelector } from 'react-redux';
import { HorizontalGap, ImageView, ItemDivider, Loader, VerticalGap } from '../constants/CustomWidget';
import RNFetchBlob from 'rn-fetch-blob';
import { checkConnected, ConvertToCSV, createFolderApi, getData, getUnique, storeData, tokenRefresh } from '../constants/helperFunction';
import { getImageData, getImageLength, pickMultipleFile, getAllImage, updateImage, openCamera } from '../redux/actions/dbAction';
import deviceInfoModule from 'react-native-device-info';
import { ConfirmationAlert } from '../components/ConfirmationAlert';

const screen = Dimensions.get('window')
var totalPendingImage = 0;
const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

function ParcelListView({ route, navigation }) {
    const dispatch = useDispatch()
    const fetchImageList = (itemData, index) => dispatch(pickMultipleFile(itemData, index))
    const captureImageList = (itemData, index) => dispatch(openCamera(itemData, index))
    const getImages = () => dispatch(getAllImage())
    const updateUploadedImage = (item, index, number, uploadStatus) => dispatch(updateImage(item, index, number, uploadStatus))
    // const { csvDataList, status, selectAddress } = useSelector((state) => state.csvData)
    const { csvDataList, status, selectAddress, imageList } = useSelector((state) => state.localDB)
    const [uploading, setUploading] = useState(false);
    const [allUpdated, setAllUploaded] = useState(false);
    const [isTakeImageView, setIsTakeImageView] = useState(route.params.isBack);
    const [fileUploadNumber, setFileUploadNumber] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(route.params.addressItem);
    const [selectedIndex, setSelectedIndex] = useState(route.params.csvIndex);
    const [csvUploading, setCsvUploading] = useState(false);
    const [orientation, setOrientation] = useState(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',);
    const [isTablet, setTable] = useState(deviceInfoModule.isTablet());
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMSG, setAlertMSG] = useState('');
    // const [totalPendingImage, setTotalPendingImage] = useState(0);

    console.log('Parcel route===>', route.params.isBack)

    useEffect(() => {
        const callback = () => setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

        const subscription = Dimensions.addEventListener('change', callback);

        getImages()
        return () => {
            subscription?.remove()
        };
    }, []);

    // const pickMultipleFile = async (pickAddress) => {
    //     setAddress(pickAddress)
    //     // setShowImage(true)
    //     try {
    //         const results = await DocumentPicker.pickMultiple({
    //             type: [DocumentPicker.types.images],
    //             allowMultiSelection: true
    //         });
    //         console.log(
    //             'PickImage===>', JSON.stringify(results)
    //         );
    //         setImageList([])

    //         var pickImage = [];
    //         for (const res of results) {
    //             var track = {
    //                 url: res.uri,
    //                 imageName: res.name,
    //                 imageType: res.type,
    //             };
    //             console.log(
    //                 'PickImage add===>', res.uri
    //             );
    //             pickImage.push(track)
    //             setImageList(prev => ([...prev, track]))
    //             // setImage(res.uri)
    //             // setImageType(res.type)
    //             // setImageName(res.name)
    //         }
    //         // setList(images)
    //         // console.log(
    //         //     'PickImage===>', list[0].url
    //         // );
    //         // setShowImage(false)
    //         images = pickImage
    //         // setImageList(images)
    //         console.log('Image len==>', images.length)
    //         console.log(
    //             'PickImage2===>', images[0].url
    //         );
    //     } catch (err) {
    //         if (DocumentPicker.isCancel(err)) {
    //             // User cancelled the picker, exit any dialogs or menus and move on
    //         } else {
    //             throw err;
    //         }
    //     }
    // }

    const createFolder = async () => {
        var isNetwork = await checkConnected()
        if (!isNetwork) {
            if (isTablet) {
                setAlertMSG("Network connection lost!!")
                setAlertVisible(true)
            } else
                alert('Network connection lost!!')
            return
        }
        const pendingImages = imageList.filter(e => e.status === 'pending');
        // setTotalPendingImage(pendingImages.length)
        // console.log('totalPending==>', pendingImages.length)
        totalPendingImage = pendingImages.length
        console.log('totalPendingHook==>', totalPendingImage)
        if (totalPendingImage > 0) {
            setAllUploaded(false)
            setUploading(true)
            setFileUploadNumber(1)
            var folderCreated = await getData('createdFolder')
            var folderID = await getData('newFolderID')
            if (folderCreated == 'true') {

                // alert(folderID)
                if (folderID != 'No Data' && folderID != '') {
                    upload(folderID)
                }

            } else {
                var fileName = await getData('csv_name')
                var folderName = fileName.split('.')[0]
                var token = await getData('token')
                // console.log('createFile token: ' + token);
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
                        // alert('Token expired!!Please login again!!')
                        // setAllUploaded(false)
                        // setUploading(false)
                        // navigation.popToTop()
                        // alert('Token expired!! refreshing token')
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
        // console.log('Image l==>', imageList.length)
        // console.log('upload token==>', accessToken)

        var photoAppFolderID = '01YP3BE5PDD2QV4TVWOJH2BXNNI5CZKI6V:/';
        var childFolderID = '01YP3BE5P77T47UAXC2FC3CE674TTZ3MKG:/';
        var newFolderId = createdFolerId + ':/'
        // console.log('folderID==>', newFolderId)
        var number = 1;
        var imageName = '';
        var addressStatus = 'Yes';
        var extractIndex = 0;
        var extractImageIndex = 0;
        const uniqueAddress = getUnique(imageList, 'address')

        for (const ads of uniqueAddress) {
            var numberByAddress = 1;
            extractIndex = csvDataList.findIndex(e => e.address === ads.address);

            const imagesByAddress = imageList.filter(e => e.address === ads.address && e.status === 'pending');
            // console.log('imagesByAddress==>', imagesByAddress.length)
            if (imagesByAddress.length > 0) {
                //e.status == deleted and uploaded is both uploaded to onedrive
                const uploadedImages = imageList.filter(e => e.address === ads.address && e.status !== 'pending');
                if (uploadedImages.length > 0) {
                    numberByAddress = uploadedImages[uploadedImages.length - 1].imageNumber
                    numberByAddress = numberByAddress + 1
                }
                for (const res of imagesByAddress) {
                    var isNetwork = await checkConnected()
                    if (!isNetwork) {
                        if (isTablet) {
                            setAlertMSG("Network connection lost!!")
                            setAlertVisible(true)
                        } else
                            alert('Network connection lost!!')
                        return
                    }
                    var extc = res.imageName.substring(res.imageName.lastIndexOf('.'))
                    if (numberByAddress > 1)
                        imageName = res.address + ' ' + numberByAddress + extc
                    else imageName = res.address + extc
                    // console.log('Image name==>', imageName)
                    const path = res.imageUrl;
                    var url = 'https://graph.microsoft.com/v1.0/me/drive/items/' + newFolderId + imageName + ':/content'
                    let response = await RNFetchBlob.fetch(
                        "PUT",
                        url,
                        {
                            Accept: "application/json",
                            'Authorization': 'Bearer ' + accessToken,
                            "Content-Type": "multipart/form-data"
                        },
                        RNFetchBlob.wrap(decodeURIComponent(path))
                    );
                    console.log('response.status==>', response.respInfo.status)
                    console.log('response===>', JSON.stringify(response))
                    extractImageIndex = imageList.findIndex(e => e.id === res.id);
                    var uploadStatus = 'pending';
                    if (response.respInfo.status === 201) {
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
                    updateUploadedImage(res, extractImageIndex, numberByAddress, uploadStatus)
                    if (response.respInfo.status === 201) {
                        numberByAddress++;
                    }

                    number++;
                    setFileUploadNumber(number)
                }
                // console.log('Change index', extractIndex)
                // console.log('Change data', csvDataList[extractIndex])
                var item = {
                    ...csvDataList[extractIndex],
                    photoUploaded: csvDataList[extractIndex].process,
                    status: addressStatus
                }
                // console.log('Change data2==>', item)
                csvDataList[extractIndex] = item

                storeData('csv_address', JSON.stringify(csvDataList))
            } else console.log('no pending image')

        }
        setUploading(false)
        setAllUploaded(true)
        if (isTablet) {
            setAlertMSG("All image successfully uploaded!!")
            setAlertVisible(true)
        }
        else
            alert('All image successfully uploaded!!')
    }

    const uploadCsv = async (csvFile) => {
        var accessToken = await getData('token')
        var folderID = await getData('newFolderID')
        var newFolderId = folderID + ':/'
        console.log('folderID==>', accessToken)

        var isNetwork = await checkConnected()
        if (!isNetwork) {
            if (isTablet) {
                setAlertMSG("Network connection lost!!")
                setAlertVisible(true)
            } else
                alert('Network connection lost!!')
            setCsvUploading(false)
            return
        }
        var fileName = await getData('csv_name')
        var folderName = fileName.split('.')[0]
        let tempDate = new Date()
        let fDate = (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + '-' + tempDate.getFullYear()
        let fTime = tempDate.getHours() + '-' + tempDate.getMinutes() + '-' + tempDate.getSeconds()
        let dateTime = fDate + '_' + fTime
        var amPm = 'AM'
        if (tempDate.getHours() > 11)
            amPm = 'PM'

        var csvFileName = folderName.toLocaleLowerCase() + '_' + dateTime + '_' + amPm + '.csv'
        console.log(csvFileName)
        // console.log('Image name==>', imageName)
        const path = csvFile;
        var url = 'https://graph.microsoft.com/v1.0/me/drive/items/' + newFolderId + csvFileName + ':/content'
        let response = await RNFetchBlob.fetch(
            "PUT",
            url,
            {
                Accept: "application/json",
                'Authorization': 'Bearer ' + accessToken,
                "Content-Type": "multipart/form-data"
            },
            RNFetchBlob.wrap(decodeURIComponent(path))
        );
        console.log('response.status==>', response.respInfo.status)
        // console.log('response===>', JSON.stringify(response))
        setCsvUploading(false)
        if (response.respInfo.status === 201) {
            if (isTablet) {
                setAlertMSG('CSV uploaded as ' + csvFileName)
                setAlertVisible(true)
            } else
                alert('CSV uploaded as ' + csvFileName)
        } else {
            //401 is expired token
            if (response.respInfo.status === 401) {
                // alert('Token expired!! refreshing token')
                // navigation.popToTop()
                var token = await tokenRefresh()
                console.log('get ref token==>', token)
                uploadCsv(path)
            } else if (response.respInfo.status === 404) {
                //404 is folder not found

            }
        }


    }


    const writeCSV = async (csvDataList) => {
        try {
            setCsvUploading(true)
            var HEADER = 'PARCEL_ID,ADDRESS, PRINT_KEY, PROPERTY_CLASS, BUILD_STYLE, SFLA, LAT, LONG, PHOTOS_TAKEN, PHOTOS_UPLOADED,  ALL_PHOTOS_UPLOADED\n';

            const FILE_PATH = `${RNFetchBlob.fs.dirs.DownloadDir}/data.csv`;
            const csvString = `${HEADER}${ConvertToCSV(csvDataList)}`;
            RNFetchBlob.fs
                .writeFile(FILE_PATH, csvString, "utf8")
                .then(() => {
                    console.log(`wrote file ${FILE_PATH}`);
                    uploadCsv(FILE_PATH)

                })
                .catch(error => { alert(error); setCsvUploading(false) });

        } catch (error) {
            // Error retrieving data
            if (isTablet) {
                setAlertMSG(error)
                setAlertVisible(true)
            } else
                alert(error)
        }
    };

    const ChildView = (item, index) => {
        const dim = Dimensions.get('screen');
        return (
            <View style={{ flexDirection: 'row', width: dim.width, marginVertical: isTablet ? 8 : 4, paddingHorizontal: isTablet ? 12 : 6, }}>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>{item.address}</Text>
                </View>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <TouchableOpacity
                        style={{ paddingHorizontal: isTablet ? 8 : 4, paddingVertical: isTablet ? 8 : 4, borderRadius: isTablet ? 8 : 4, borderColor: 'grey', borderWidth: isTablet ? 2 : 1 }}
                        // onPress={() => { fetchImageList(item, index) }} >
                        onPress={() => { setIsTakeImageView(true), setSelectedAddress(item), setSelectedIndex(index) }} >
                        <Text style={{ color: 'grey', alignSelf: 'center', textTransform: 'capitalize', fontSize: isTablet ? 20 : 10 }}>Take New Photo</Text>

                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignSelf: 'center', }}>

                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>{item.process}</Text>
                </View>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>{item.status == 'NO PHOTOS TAKEN' ? '' : item.status}</Text>
                </View>
            </View>
        )

    }

    const ListView = () => {

        return (
            <ScrollView horizontal={true}>
                <FlatList keyExtractor={item => item.id} ItemSeparatorComponent={ItemDivider} data={csvDataList} renderItem={({ item, index }) => ChildView(item, index)} />
            </ScrollView>
        )
    }

    const BuildTable = () => {
        return (
            <View style={{ flexDirection: 'row', height: isTablet ? 48 : 24, }}>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>Address</Text>
                </View>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>Detail</Text>
                </View>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>Processed</Text>
                </View>
                <View style={{ flex: 1, alignSelf: 'center', }}>
                    <Text style={{ textTransform: 'uppercase', alignSelf: 'center', fontSize: isTablet ? 24 : 12 }}>uploaded</Text>
                </View>
            </View>
        )
    }
    const UploadingText = () => {

        return (

            <Text style={{ color: 'white', fontSize: isTablet ? 28 : null }}>Image uploading {fileUploadNumber}/{totalPendingImage} </Text>

        )
    }

    const UploadTopView = () => {
        return (
            <View style={{ flexDirection: 'row', marginTop: 0, justifyContent: orientation === 'PORTRAIT' ? 'space-between' : 'flex-start', paddingHorizontal: isTablet ? 16 : 8 }}>
                <View>
                    <Text style={{ paddingHorizontal: isTablet ? 16 : 8, fontSize: isTablet ? 32 : 16 }}>Current</Text>
                    <Text style={{ paddingHorizontal: isTablet ? 16 : 8, fontSize: isTablet ? 32 : 16 }}>Property List</Text>
                    <Text style={{ paddingHorizontal: isTablet ? 16 : 8, fontSize: isTablet ? 24 : 12 }}>Select Property To Photograph</Text>
                </View>
                <View style={{ flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row', alignItems: 'flex-end', }}>
                    <TouchableOpacity
                        style={{ marginLeft: isTablet ? 16 : 8, backgroundColor: '#5d9cec', paddingHorizontal: isTablet ? 32 : 12, paddingVertical: isTablet ? 16 : 8, borderRadius: isTablet ? 8 : 4 }}
                        onPress={() => createFolder()} >
                        {uploading ? allUpdated ? null : UploadingText() : <Text style={{ color: 'white', fontSize: isTablet ? 32 : null, alignSelf: 'center', textTransform: 'uppercase' }}>Upload Photos</Text>}

                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ marginLeft: isTablet ? 16 : 8, marginTop: isTablet ? 16 : 8, paddingHorizontal: isTablet ? 32 : 12, paddingVertical: isTablet ? 16 : 8, backgroundColor: '#5d9cec', borderRadius: isTablet ? 8 : 4 }}
                        onPress={async () => {
                            // var fileName = await getData('csv_name')
                            // var folderName = fileName.split('.')[0]
                            // alert(folderName)

                            // storeData('createdFolder', JSON.stringify(true))
                            // var folderCreated = await getData('createdFolder')

                            // const csvL = csvDataList[extractIndex]
                            // const newPost = imageList.filter(e => e.address === '168 N Long St');

                            // const uniqueAddress = getUnique(imageList, 'address')
                            // let list = imageList
                            // let unique = []
                            // list.forEach(item => {
                            //     if (!unique.includes(item.address)) {
                            //         unique.push(item.address)
                            //     }
                            // })

                            // alert(uniqueAddress[0].address)
                            // var extractIndex = 0;
                            // for (const ads of uniqueAddress) {
                            //     extractIndex = csvDataList.findIndex(e => e.address === ads.address);
                            //     const imagesByAddress = imageList.filter(e => e.address === ads.address && e.status === 'uploaded');
                            //     var number = imagesByAddress[imagesByAddress.length - 1].imageNumber
                            //     console.log('uniq address==>', ads.address)
                            //     console.log('uniq len==>', uniqueAddress.length)
                            //     // console.log('imagesByAddress==>', JSON.stringify(imagesByAddress))
                            //     for (const res of imagesByAddress) {
                            //         console.log('status==>', res.imageNumber)
                            //     }
                            // }

                            var folderID = await getData('newFolderID')
                            if (folderID != 'No Data')
                                writeCSV(csvDataList)
                            else {
                                setCsvUploading(true)
                                await createFolderApi()
                                writeCSV(csvDataList)
                            }
                            // var token = await tokenRefresh()
                            // console.log('get ref token==>', token)

                        }} >
                        <Text style={{ color: 'white', fontSize: isTablet ? 32 : null, alignSelf: 'center', textTransform: 'uppercase' }}>{csvUploading ? 'Uploading...' : 'Upload CSV'}</Text>

                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const TakeImageView = (addressItem, index) => {
        const dim = Dimensions.get('screen');
        // getCaptureImages(addressItem)
        var imagesByAddress = []
        var captureImages = imageList.filter(e => e.address === addressItem.address && e.status === 'pending' && e.tag === 'camera')
        if (imageList.length > 0) {
            // for (const res of imageList.filter(e => e.address === addressItem.address && e.status === 'pending' && e.tag === 'camera')) {
            //     captureImages.push(res.imageUrl)
            // }

            imagesByAddress = imageList.filter(e => e.address === addressItem.address);
            // imagesByAddress = imageList.filter(e => e.address === addressItem.address && e.status !== 'deleted');
            // console.log('captureImages==>', imagesByAddress[0])
        }
        return (
            <View style={{ flexDirection: orientation === 'PORTRAIT' ? 'column' : 'row', alignItems: orientation === 'PORTRAIT' ? 'center' : 'flex-start', paddingHorizontal: isTablet ? 24 : 12 }}>
                <View style={{ flexDirection: orientation === 'PORTRAIT' ? 'row' : 'column', alignItems: 'flex-start', width: orientation === 'PORTRAIT' ? dim.width : null, justifyContent: orientation === 'PORTRAIT' ? 'space-between' : 'flex-start' }} >
                    <TouchableOpacity
                        style={{ paddingHorizontal: isTablet ? 16 : 8, paddingVertical: isTablet ? 16 : 8, borderRadius: isTablet ? 8 : 4, borderColor: 'grey', borderWidth: isTablet ? 2 : 1 }}
                        // onPress={() => { fetchImageList(item, index) }} >
                        onPress={() => { setIsTakeImageView(false) }} >
                        <Text style={{ color: 'grey', alignSelf: 'center', textTransform: 'capitalize', fontSize: isTablet ? 24 : 12 }}>Return To Parcel List</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ marginTop: orientation === 'PORTRAIT' ? 0 : 16, marginLeft: orientation === 'PORTRAIT' ? 8 : 0, paddingHorizontal: isTablet ? 24 : 6, paddingVertical: isTablet ? 16 : 8, marginRight: isTablet ? 48 : 8, borderRadius: isTablet ? 8 : 4, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                        onPress={() => { fetchImageList(addressItem, index) }} >
                        <Text style={{ color: 'white', alignSelf: 'center', textTransform: 'capitalize', fontSize: isTablet ? 24 : 12 }}>Upload Photo</Text>

                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ marginTop: orientation === 'PORTRAIT' ? 0 : 16, paddingHorizontal: isTablet ? 24 : 6, paddingVertical: isTablet ? 16 : 8, marginRight: isTablet ? 48 : 24, borderRadius: isTablet ? 8 : 4, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                        // onPress={() => { fetchImageList(item, index) }} >
                        onPress={() => { captureImages.length > 0 ? navigation.replace('Gallery', { imageList: captureImages, address: selectedAddress, csvIndex: index }) : navigation.replace('Camera2', { imageList: [], address: selectedAddress, csvIndex: index }) }} >
                        <Text style={{ color: 'white', alignSelf: 'center', textTransform: 'capitalize', fontSize: isTablet ? 24 : 12 }}>Take Photo({captureImages.length})</Text>

                    </TouchableOpacity>
                </View>
                {VerticalGap(isTablet ? 16 : 8)}
                {HorizontalGap(16)}
                {/* <Text>ID: {item.id}</Text> */}
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: isTablet ? 28 : 14 }}>Address: {addressItem.address}</Text>
                    <Text style={{ fontSize: isTablet ? 28 : 14 }}>Property Class: {addressItem.propertyClass}</Text>
                    <Text style={{ fontSize: isTablet ? 28 : 14 }}>Building Class: {addressItem.buildStyle}</Text>
                    <Text style={{ fontSize: isTablet ? 28 : 14 }}>SFLA: {addressItem.SFLA}</Text>
                    <Text style={{ fontSize: isTablet ? 28 : 14 }}>Lat, Long: {addressItem.LAT}, {addressItem.LONG}</Text>
                    {VerticalGap(8)}
                    {/* {BuildImageView(imagesByAddress)} */}
                    {orientation === 'PORTRAIT' ? BuildImageView(imagesByAddress) : isTablet ? BuildImageView(imagesByAddress) : null}
                </View>
                {HorizontalGap(16)}
                {orientation === 'PORTRAIT' ? null : isTablet ? null : BuildImageView(imagesByAddress)}
            </View>
        )
    }

    const BuildImageView = (imagesByAddress) => {
        return (
            <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: isTablet ? 28 : 14 }}>Number Of Images: {imagesByAddress.length}</Text>
                <Text style={{ fontSize: isTablet ? 28 : 14 }}>Last Image Taken:</Text>
                {VerticalGap(isTablet ? 12 : 6)}
                {imagesByAddress.length > 0 ? ImageView(imagesByAddress[imagesByAddress.length - 1].imageUrl, isTablet ? 300 : 150, isTablet ? 400 : 200,) : null}
            </View>
        )
    }

    const AlertView = () => {
        return (
            <ConfirmationAlert
                modalVisible={alertVisible}
                setModalVisible={setAlertVisible}
                title={'Alert'}
                message={alertMSG}
                buttons={[
                    {
                        func: () => {
                            console.log('OK Pressed')
                        },

                    }]}
            />
        )
    }

    const ParcelView = () => {
        return (
            <View >
                <ScrollView nestedScrollEnabled={true}>
                    <AlertView />
                    {UploadTopView()}
                    {VerticalGap(isTablet ? 20 : 12)}
                    {ItemDivider()}
                    {VerticalGap(isTablet ? 16 : 8)}
                    {BuildTable()}
                    {ItemDivider()}
                    {ListView()}
                </ScrollView>
            </View>
        )
    }

    return (
        <View style={GlobalStyle.container}>
            {isTakeImageView ? TakeImageView(selectedAddress, selectedIndex) : ParcelView()}
        </View>
    );
}

export default ParcelListView;