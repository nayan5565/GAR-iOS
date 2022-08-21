import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, Image, FlatList, Dimensions, Text } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { exp } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import { ConfirmationAlert } from '../components/ConfirmationAlert';
import { deleteImageById, updateCaptureImage } from '../redux/actions/dbAction';

const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
};

function UploadedCaptureImageView(props) {
    const dispatch = useDispatch()
    const updateUploadedImage = (captureImage, number, uploadStatus) => dispatch(updateCaptureImage(captureImage, number, uploadStatus))
    const deleteImage = (id) => dispatch(deleteImageById(id))
    const { csvDataList, status, selectAddress, imageList } = useSelector((state) => state.localDB)
    const [alertDeleteVisible, setAlertDeleteVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [orientation, setOrientation] = useState(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE',);
    const [isTablet, setTable] = useState(deviceInfoModule.isTablet());

    useEffect(() => {
        const callback = () => setOrientation(isPortrait() ? 'PORTRAIT' : 'LANDSCAPE');

        const subscription = Dimensions.addEventListener('change', callback);
        return () => {
            subscription?.remove()
        };
    }, []);

    const deleteFileSdCard = (image) => {
        // let dirs =
        //   Platform.OS === "android"
        //     ? `/storage/emulated/0/Folder_name/${File_name}`
        //     : `${RNFS.DocumentDirectoryPath}/Folder_name/${File_name}`;
        console.log("dir==>", image.imageUrl);
        RNFetchBlob.fs
            .unlink(image.imageUrl)
            .then(() => {
                console.log("file is deleted");
                updateUploadedImage(image, image.imageNumber, 'deleted')
                // deleteImage(image.id)
            })
            .catch(err => {
                console.log("err", err);
                // updateUploadedImage(image, image.imageNumber, 'deleted')
                // deleteImage(image.id)
            });
    }

    const deleteAllImages = () => {
        setUploading(true)
        var uploadedImages = imageList.filter(e => e.status === 'uploaded' && e.tag === 'camera')
        for (const res of uploadedImages) {
            deleteFileSdCard(res)
        }
        setUploading(false)
    }

    const DeleteAlertView = () => {
        return (
            <ConfirmationAlert
                modalVisible={alertDeleteVisible}
                setModalVisible={setAlertDeleteVisible}
                title={'Alert'}
                message={'Do you want to all delete!!'}
                buttons={[
                    {
                        text: 'No',
                        func: () => { console.log('Stay Pressed') },
                    },
                    {
                        text: 'Delete',
                        func: () => {
                            deleteAllImages()
                        },

                    },
                ]}
            />
        )
    }
    const ChildViewGrid = (image, index) => {
        return (
            <View key={index} style={{ width: orientation === 'PORTRAIT' ? '48%' : '32%', height: isTablet ? 280 : 180, margin: 5, flexDirection: 'column' }}>
                <View >
                    <TouchableWithoutFeedback style={{ marginRight: 5, borderRadius: isTablet ? 12 : 8 }} onPress={() => deleteFileSdCard(image.imageUrl)}>
                        <Image style={{ height: isTablet ? 280 : 180, borderRadius: 8 }} source={{ uri: image.imageUrl }} /></TouchableWithoutFeedback>
                </View>

                {/* <View style={{ justifyContent: 'center', }}>
                    <Text onPress={()=>onClickItem( title)} style={{ color: 'white' }}>{title}</Text>
                    <Text>{subTitle}</Text>
                </View> */}

            </View>
        )
    }
    const ListViewGrid = () => {
        var uploadedImages = imageList.filter(e => e.status === 'uploaded' && e.tag === 'camera')
        var numColumns = orientation === 'PORTRAIT' ? 2 : 3
        return (
            <FlatList style={{ height: '90%', margin: 5 }} numColumns={numColumns} data={uploadedImages} renderItem={({ item, index }) => ChildViewGrid(item, index)} />
        )
    }
    const BuildList = () => {
        var uploadedImages = imageList.filter(e => e.status === 'uploaded' && e.tag === 'camera')
        return (
            <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <DeleteAlertView />
                <ListViewGrid />
                <View style={{ justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', }}>
                    {!uploading ? null : Loader('#00ff00', isTablet ? 84 : 48)}
                </View>
                {uploadedImages.length > 0 ? null : <View style={{ justifyContent: 'center', width: '100%', height: '100%', position: 'absolute', }}><Text style={{ color: 'black', textAlign: 'center', fontSize: isTablet ? 36 : 24, }}>No Data Found</Text></View>}
                {uploadedImages.length < 1 ? null : <View style={{ flexDirection: 'row', height: orientation === 'PORTRAIT' ? '10%' : '14%', width: '100%', justifyContent: 'space-evenly', alignItems: 'center', }}>
                    <TouchableOpacity onPress={() => setAlertDeleteVisible(true)}
                        style={{ paddingHorizontal: isTablet ? 12 : 6, paddingVertical: isTablet ? 12 : 6, marginLeft: 0, borderRadius: 8, borderColor: 'green', backgroundColor: 'green', borderWidth: isTablet ? 2 : 1 }}
                    >
                        <Text style={{ color: 'white', fontSize: isTablet ? 24 : 13, alignSelf: 'center', }}>Delete All</Text>
                    </TouchableOpacity>
                </View>}
            </View>
        )
    }

    return (
        <View style={{ flex: 1 }}>
            {BuildList()}
        </View>
    );
}

export default UploadedCaptureImageView;