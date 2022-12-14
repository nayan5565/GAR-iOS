import { readFile } from "react-native-fs";
import { getData, imageResize, storeData } from "../../constants/helperFunction";
import XLSX from 'xlsx'
import { openDatabase } from 'react-native-sqlite-storage';
import { GET_IMAGE_DB, SAVE_CAPTURE_IMAGE_DB, SAVE_CSV_DB, SAVE_IMAGE_DB, UPDATE_CSV_LIST, UPDATE_IMAGE_DB } from '../../constants/types';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';

const tblAddress = 'address_list';
const tblImage = 'ImageList';

export const db = openDatabase({
    name: 'GA_DB',
    location: 'default',
},
    () => { },
    error => { console.log(error) }
);

export const createTable = () => {
    db.transaction((tx) => {
        tx.executeSql("CREATE TABLE IF NOT EXISTS "
            + tblImage
            + "(id INTEGER PRIMARY KEY AUTOINCREMENT, imageUrl TEXT, imageName TEXT, imageType TEXT, address TEXT, imageNumber INTEGER, status TEXT, tag TEXT);"
        )
    })
}

export const createAddressTable = () => {
    db.transaction((tx) => {
        tx.executeSql("CREATE TABLE IF NOT EXISTS "
            + "address_list "
            + "(id INTEGER PRIMARY KEY, address TEXT, propertyClass TEXT, buildStyle TEXT, process TEXT, status TEXT);"
        )
    })
}


export const readCsvData = (csvFile) => {
    createAddressTable()
    try {
        return async dispatch => {
            readFile(csvFile, 'ascii')
                .then(res => {
                    const wb = XLSX.read(res, { type: 'binary' })
                    const wsname = wb.SheetNames[0]
                    const ws = wb.Sheets[wsname]
                    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
                    var temp = []
                    storeData('csv_address', '')
                    for (let i = 1; i < data.length; ++i) {
                        temp.push({
                            id: data[i][0],
                            address: data[i][1],
                            printKey: data[i][2],
                            propertyClass: data[i][3],
                            buildStyle: data[i][4],
                            SFLA: data[i][5],
                            LAT: data[i][6],
                            LONG: data[i][7],
                            process: '0',
                            photoUploaded: '0',
                            status: 'NO PHOTOS TAKEN'
                        })
                        // saveCsvAddress(data[i][0], data[i][1], data[i][3], data[i][4], '0', '')

                    }

                    // saveTodoItems(temp)

                    dispatch({
                        type: SAVE_CSV_DB,
                        payload: temp,
                        status: 'success'
                    })

                    console.log('action csv===>', JSON.stringify(temp))
                    console.log('action csv address size===>', temp.length)
                    storeData('csv_address', JSON.stringify(temp))

                })
        }
    } catch (error) {
        console.log(error);
        return async dispatch => {
            dispatch({
                type: SAVE_CSV_DB,
                status: 'error'
            })
        }
    }
}

const saveCsvAddress = async (id, address, propertyClass, buildStyle, process, status) => {
    await db.transaction(async (tx) => {

        await tx.executeSql("INSERT INTO address_list (id, address, propertyClass,buildStyle, process, status ) VALUES (?,?,?,?,?,?)",
            [id, address, propertyClass, buildStyle, process, status],
            (tx, results) => {

                console.log('Save DB')
            },
            error => {
                dispatch({
                    type: SAVE_IMAGE_DB,
                    imageStatus: 'error'
                }), console.log('getting error: ' + error.message); console.log('Save error: ' + error.message)
            }
        );

    })
}

export const updateSCV = (address, csvIndex) => {
    try {
        return async dispatch => {
            console.log('Update CSV==>', address)
            dispatch({
                type: UPDATE_CSV_LIST,
                item: address,
                index: csvIndex,
                status: 'succes'
            })
        }
    } catch (error) {
        console.log(error);
        return async dispatch => {
            dispatch({
                type: UPDATE_CSV_LIST,
                status: 'error'
            })
        }
    }
}

export const saveTodoItems = (todoItems) => {
    const insertQuery =
        `INSERT OR REPLACE INTO ${tblAddress}(id, address, propertyClass,buildStyle, process, status) values` +
        todoItems.map(i => `(${i.id}, '${i.address}, '${i.propertyClass}, '${i.buildStyle}, '${i.process}, '${i.status}')`).join(',');

    return db.executeSql(insertQuery);
};

export const getAddressFromSP = () => {
    try {
        return async dispatch => {
            var adressList = []
            var adress = await getData('csv_address')
            if (adress != 'No Data') {
                adressList = JSON.parse(adress, [])
                // console.log('csvAdd===>', adressList)
                console.log('csvAddL===>', adressList)
                // saveTodoItems(adressList)
                dispatch({
                    type: SAVE_CSV_DB,
                    payload: adressList,
                    status: 'success'
                })
            } else {
                dispatch({
                    type: SAVE_CSV_DB,
                    payload: [],
                    status: 'error'
                })
            }


        }
    } catch (error) {
        console.log(error);
        return async dispatch => {
            dispatch({
                type: SAVE_CSV_DB,
                status: 'error'
            })
        }
    }
}

export const getAddressFromDB = () => {
    try {
        return async dispatch => {
            db.transaction((tx) => {
                tx.executeSql('SELECT * FROM address_list', [],

                    (tx, results) => {
                        var len = results.rows.length;
                        // console.log("len: " + JSON.stringify(results.rows.item(0)))
                        var addressData = [];
                        if (len > 0) {

                            for (var i = 0; i < len; i++) {
                                var item = results.rows.item(i);
                                addressData.push({ id: item.id, address: item.address, propertyClass: item.propertyClass, buildStyle: item.buildStyle, process: item.process, status: item.status, tag: item.tag })
                            }

                        }
                        console.log('db addressData===>', addressData.length)
                        dispatch({
                            type: SAVE_CSV_DB,
                            payload: addressData,
                            status: 'success'
                        })
                    },
                    error => {
                        dispatch({
                            type: SAVE_CSV_DB,
                            status: 'error'
                        });
                        console.log('getting error: ' + error.message)
                    }
                );

            })
        }
    } catch (error) {
        console.log(error);
        return async dispatch => {
            dispatch({
                type: SAVE_CSV_DB,
                status: 'error'
            })
        }
    }
}

export const getImageData = (address) => {
    return async dispatch => {
        console.log('db address===>', address)
        db.transaction((tx) => {
            console.log('db address2===>', address)
            tx.executeSql('SELECT * FROM ImageList WHERE address = ?', [address],

                (tx, results) => {
                    var len = results.rows.length;
                    // console.log("len: " + JSON.stringify(results.rows.item(0)))
                    var images = [];
                    if (len > 0) {

                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                        }

                    }
                    console.log('db Image===>', images.length)
                    dispatch({
                        type: GET_IMAGE_DB,
                        payload: images,
                        status: 'success'
                    })
                },
                error => {
                    dispatch({
                        type: GET_IMAGE_DB,
                        status: 'error'
                    });
                    console.log('getting error: ' + error.message)
                }
            );

        })


    }

}

export const getImageLength = (address) => {

    let imageCount = 0
    db.transaction((tx) => {
        // console.log('db address2===>', address)
        tx.executeSql('SELECT * FROM ImageList WHERE address = ?', [address],

            (tx, results) => {
                var len = results.rows.length;

                imageCount = len
            },
            error => {
                imageCount = 0
                console.log('getting error: ' + error.message)
                // return imageCount
            }
        );

    })

    // console.log('db imageCount2===>', imageCount)
    return imageCount

}

export const pickMultipleFileSave = (res, addressItemData, index) => {
    createTable()

    return async dispatch => {
        console.log(
            'PickImage add===>', res.fileCopyUri
        );
        await db.transaction(async (tx) => {

            await tx.executeSql("INSERT INTO ImageList (imageUrl, imageName, imageType, address, imageNumber, status,tag ) VALUES (?,?,?,?,?,?,?)",
                [res.fileCopyUri, res.imageName, res.imageType, addressItemData.address, 0, 'pending', 'gallery'],
                (tx, results) => {

                    console.log('Save DB')
                    //fetch images of address
                    var imagesAddress = [];
                    db.transaction((tx) => {
                        console.log('db address2===>', addressItemData.address)
                        tx.executeSql('SELECT * FROM ImageList WHERE address = ?', [addressItemData.address],

                            (tx, results) => {
                                var len = results.rows.length;
                                // console.log("len: " + JSON.stringify(results.rows.item(0)))

                                if (len > 0) {

                                    for (var i = 0; i < len; i++) {
                                        var item = results.rows.item(i);
                                        imagesAddress.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                                    }

                                }

                            },
                            error => {
                                dispatch({
                                    type: SAVE_IMAGE_DB,
                                    status: 'error'
                                });
                                console.log('getting error: ' + error.message)
                            }
                        );

                    })
                    //fetch all images
                    db.transaction((tx) => {

                        tx.executeSql('SELECT * FROM ImageList', [],

                            (tx, results) => {
                                var len = results.rows.length;
                                // console.log("len: " + JSON.stringify(results.rows.item(0)))
                                var images = [];
                                if (len > 0) {

                                    for (var i = 0; i < len; i++) {
                                        var item = results.rows.item(i);
                                        images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                                    }

                                }
                                console.log('db all Image===>', images.length)

                                console.log('db Image===>', imagesAddress.length)
                                var item2 = {
                                    ...addressItemData,
                                    process: imagesAddress.length,
                                    status: 'No'
                                }
                                dispatch({
                                    type: SAVE_IMAGE_DB,
                                    payload: images,
                                    selectAddress: item2.address,
                                    item: item2,
                                    index: index,
                                    imageStatus: 'success'
                                });
                            },
                            error => {
                                dispatch({
                                    type: SAVE_IMAGE_DB,
                                    status: 'error'
                                });
                                console.log('getting error: ' + error.message)
                            }
                        );

                    })
                },
                error => {
                    dispatch({
                        type: SAVE_IMAGE_DB,
                        imageStatus: 'error'
                    }), console.log('getting error: ' + error.message); console.log('Save error: ' + error.message)
                }
            );

        })




    }

}

export const pickMultipleFile = (addressItemData, index) => {
    createTable()
    try {
        return async dispatch => {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images],
                // mode: 'open',
                copyTo: 'documentDirectory',
                allowMultiSelection: true
            });
            console.log(
                'PickImage===>', JSON.stringify(results)
            );


            var pickImage = [];
            for (const res of results) {
                var track = {
                    url: res.fileCopyUri,
                    imageName: res.name,
                    imageType: res.type,
                };
                console.log(
                    'PickImage add===>', res.fileCopyUri
                );
                imageResize(res.fileCopyUri)
                pickImage.push(track)
                await db.transaction(async (tx) => {

                    await tx.executeSql("INSERT INTO ImageList (imageUrl, imageName, imageType, address, imageNumber, status,tag ) VALUES (?,?,?,?,?,?,?)",
                        [res.fileCopyUri, res.name, res.type, addressItemData.address, 0, 'pending', 'gallery'],
                        (tx, results) => {

                            console.log('Save DB')
                        },
                        error => {
                            dispatch({
                                type: SAVE_IMAGE_DB,
                                imageStatus: 'error'
                            }), console.log('getting error: ' + error.message); console.log('Save error: ' + error.message)
                        }
                    );

                })

            }
            //fetch images of address
            var imagesAddress = [];
            db.transaction((tx) => {
                console.log('db address2===>', addressItemData.address)
                tx.executeSql('SELECT * FROM ImageList WHERE address = ?', [addressItemData.address],

                    (tx, results) => {
                        var len = results.rows.length;
                        // console.log("len: " + JSON.stringify(results.rows.item(0)))

                        if (len > 0) {

                            for (var i = 0; i < len; i++) {
                                var item = results.rows.item(i);
                                imagesAddress.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                            }

                        }

                    },
                    error => {
                        dispatch({
                            type: SAVE_IMAGE_DB,
                            status: 'error'
                        });
                        console.log('getting error: ' + error.message)
                    }
                );

            })
            //fetch all images
            db.transaction((tx) => {

                tx.executeSql('SELECT * FROM ImageList', [],

                    (tx, results) => {
                        var len = results.rows.length;
                        // console.log("len: " + JSON.stringify(results.rows.item(0)))
                        var images = [];
                        if (len > 0) {

                            for (var i = 0; i < len; i++) {
                                var item = results.rows.item(i);
                                images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                            }

                        }
                        console.log('db all Image===>', images.length)

                        console.log('db Image===>', imagesAddress.length)
                        var item2 = {
                            ...addressItemData,
                            process: imagesAddress.length,
                            status: 'No'
                        }
                        dispatch({
                            type: SAVE_IMAGE_DB,
                            payload: images,
                            selectAddress: item2.address,
                            item: item2,
                            index: index,
                            imageStatus: 'success'
                        });
                    },
                    error => {
                        dispatch({
                            type: SAVE_IMAGE_DB,
                            status: 'error'
                        });
                        console.log('getting error: ' + error.message)
                    }
                );

            })

        }
    } catch (err) {
        if (DocumentPicker.isCancel(err)) {
            dispatch({
                type: SAVE_IMAGE_DB,
                imageStatus: 'User Cancel'
            })
        } else {
            dispatch({
                type: SAVE_IMAGE_DB,
                imageStatus: err
            })
            throw err;
        }
    }
}

export const saveCaptureImage = (captureImage, addressItemData, number, uploadStatus) => {
    createTable()
    return async dispatch => {
        var extc = captureImage.substring(captureImage.lastIndexOf('.') + 1)
        var type = 'type/' + extc
        var imageName = captureImage.substring(captureImage.lastIndexOf('/') + 1)

        await db.transaction(async (tx) => {

            await tx.executeSql("INSERT INTO ImageList (imageUrl, imageName, imageType, address, imageNumber, status,tag ) VALUES (?,?,?,?,?,?,?)",
                [captureImage, imageName, type, addressItemData.address, number, uploadStatus, 'camera'],
                (tx, results) => {

                    console.log('Save DB')
                },
                error => {
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        imageStatus: 'error'
                    }), console.log('getting error: ' + error.message); console.log('Save error: ' + error.message)
                }
            );

        })


        //fetch images of address
        var imagesAddress = [];
        db.transaction((tx) => {
            // console.log('db address2===>', addressItemData.address)
            tx.executeSql('SELECT * FROM ImageList WHERE address = ?', [addressItemData.address],

                (tx, results) => {
                    var len = results.rows.length;
                    // console.log("len: " + JSON.stringify(results.rows.item(0)))

                    if (len > 0) {

                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            imagesAddress.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                        }

                    }

                },
                error => {
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        status: 'error'
                    });
                    console.log('getting error: ' + error.message)
                }
            );

        })
        //fetch all images
        db.transaction((tx) => {

            tx.executeSql('SELECT * FROM ImageList', [],

                (tx, results) => {
                    var len = results.rows.length;
                    // console.log("len: " + JSON.stringify(results.rows.item(0)))
                    var images = [];
                    if (len > 0) {

                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                        }

                    }
                    // console.log('db all Image===>', images.length)
                    // console.log('db lastID==>', images[images.length - 1].id)
                    // console.log('db Image===>', imagesAddress.length)
                    // var item2 = {
                    //     ...addressItemData,
                    //     process: imagesAddress.length,
                    //     status: 'No'
                    // }
                    // console.log('db save addressItemData===>', JSON.stringify(item2))
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        payload: images,
                        // selectAddress: item2.address,
                        // item: item2,
                        // index: index,
                        imageStatus: 'success'
                    });
                },
                error => {
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        status: 'error'
                    });
                    console.log('getting error: ' + error.message)
                }
            );

        })

    }

}

export const updateCaptureImage = (item, number, uploadStatus) => {
    return async dispatch => {
        await db.transaction(async (tx) => {
            'ImageList (imageUrl, imageName, imageType, address, imageNumber, status,tag ) VALUES (?,?,?,?,?,?,?)'
            await tx.executeSql("UPDATE ImageList SET imageUrl = ? , imageName = ? , imageType = ? , address = ? , imageNumber = ? , status = ?, tag = ? WHERE id = ?",
                [item.imageUrl, item.imageName, item.imageType, item.address, number, uploadStatus, item.tag, item.id],
                (tx, results) => {
                    console.log('Successfully Update==>', uploadStatus);
                    // var item2 = {
                    //     ...address,
                    //     imageNumber: number,
                    //     status: uploadStatus
                    // }
                    // console.log('db update addressItemData===>', JSON.stringify(item2))

                    db.transaction((tx) => {

                        tx.executeSql('SELECT * FROM ImageList', [],

                            (tx, results) => {
                                var len = results.rows.length;
                                // console.log("len: " + JSON.stringify(results.rows.item(0)))
                                var images = [];
                                if (len > 0) {

                                    for (var i = 0; i < len; i++) {
                                        var item = results.rows.item(i);
                                        images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                                    }

                                }
                                console.log('db all Image===>', images.length)


                                dispatch({
                                    type: SAVE_CAPTURE_IMAGE_DB,
                                    payload: images,
                                    imageStatus: 'success'
                                });
                            },
                            error => {
                                dispatch({
                                    type: SAVE_CAPTURE_IMAGE_DB,
                                    imageStatus: 'error'
                                });
                                console.log('getting error: ' + error.message)
                            }
                        );

                    })
                },
                error => {
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        imageStatus: 'error'
                    }), console.log('Update error: no column ' + error.message)
                }
            );

        })
    }
}

export const openCamera = () => {
    return async dispatch => {
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: false,
            multiple: true,
            smartAlbums: true,
            showsSelectedCount: true,
        }).then(image => {
            console.log(image);
        });
    }
}

export const saveImage = (imageUri, imageName, imageType, address) => {
    return async dispatch => {
        createTable()
        await db.transaction(async (tx) => {

            await tx.executeSql("INSERT INTO ImageList (imageUri, imageName, imageType, address, imageNumber, status ,tag) VALUES (?,?,?,?,?,?,?)",
                [imageUri, imageName, imageType, address, 0, 'pending', 'gallery'],
                (tx, results) => {
                    var images = [];
                    dispatch({
                        type: SAVE_IMAGE_DB,
                        status: 'success'
                    }), console.log('Save DB')
                },
                error => {
                    dispatch({
                        type: SAVE_IMAGE_DB,
                        status: 'error'
                    }), console.log('getting error: ' + error.message); console.log('Save error: ' + error.message)
                }
            );

        })

    }

}

export const updateImage = (item, index, number, uploadStatus) => {

    return async dispatch => {
        createTable()
        await db.transaction(async (tx) => {
            'ImageList (imageUrl, imageName, imageType, address, imageNumber, status,tag ) VALUES (?,?,?,?,?,?,?)'
            await tx.executeSql("UPDATE ImageList SET imageUrl = ? , imageName = ? , imageType = ? , address = ? , imageNumber = ? , status = ?, tag = ? WHERE id = ?",
                [item.imageUrl, item.imageName, item.imageType, item.address, number, uploadStatus, item.tag, item.id],
                (tx, results) => {
                    console.log('Successfully Update==>', uploadStatus);
                    var item2 = {
                        ...item,
                        imageNumber: number,
                        status: uploadStatus
                    }
                    dispatch({
                        type: UPDATE_IMAGE_DB,
                        item: item2,
                        index: index,
                        imageStatus: 'success'
                    });
                },
                error => {
                    dispatch({
                        type: UPDATE_IMAGE_DB,
                        imageStatus: 'error'
                    }), console.log('Update error: db table ' + error.message)
                }
            );

        })
    }
}

export const getAllImage = () => {
    return async dispatch => {
        createTable()
        db.transaction((tx) => {

            tx.executeSql('SELECT * FROM ImageList', [],

                (tx, results) => {
                    var len = results.rows.length;
                    // console.log("len: " + JSON.stringify(results.rows.item(0)))
                    var images = [];
                    if (len > 0) {

                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                        }

                    }
                    console.log('db all Image===>', images.length)

                    dispatch({
                        type: GET_IMAGE_DB,
                        payload: images,
                        imageStatus: 'success'
                    });
                },
                error => {
                    dispatch({
                        type: GET_IMAGE_DB,
                        status: 'error'
                    });
                    console.log('getting error: ' + error.message)
                }
            );

        })
    }
}

export const deleteAllImage = () => {
    return async dispatch => {
        createTable()
        await db.transaction(async (tx) => {

            await tx.executeSql("DELETE FROM ImageList",
                [],
                (tx, results) => {
                    console.log('Successfully Deleted');
                    var images = [];
                    dispatch({
                        type: GET_IMAGE_DB,
                        payload: images,
                        imageStatus: 'success'
                    });
                },
                error => {
                    dispatch({
                        type: GET_IMAGE_DB,
                        status: 'error'
                    }); console.log('Deleted error: ' + error.message)
                }
            );

        })
    }
}

export const deleteImageById = (ID) => {
    return async dispatch => {
        await db.transaction(async (tx) => {

            await tx.executeSql("DELETE FROM ImageList WHERE id = ?",
                [ID],
                (tx, results) => {
                    console.log('Successfully Deleted');
                    db.transaction((tx) => {

                        tx.executeSql('SELECT * FROM ImageList', [],

                            (tx, results) => {
                                var len = results.rows.length;
                                // console.log("len: " + JSON.stringify(results.rows.item(0)))
                                var images = [];
                                if (len > 0) {

                                    for (var i = 0; i < len; i++) {
                                        var item = results.rows.item(i);
                                        images.push({ id: item.id, imageUrl: item.imageUrl, imageName: item.imageName, imageType: item.imageType, address: item.address, imageNumber: item.imageNumber, status: item.status, tag: item.tag })
                                    }

                                }
                                console.log('db all Image===>', images.length)


                                dispatch({
                                    type: SAVE_CAPTURE_IMAGE_DB,
                                    payload: images,
                                    imageStatus: 'success'
                                });
                            },
                            error => {
                                dispatch({
                                    type: SAVE_CAPTURE_IMAGE_DB,
                                    imageStatus: 'error'
                                });
                                console.log('getting error: ' + error.message)
                            }
                        );

                    })
                },
                error => {
                    dispatch({
                        type: SAVE_CAPTURE_IMAGE_DB,
                        imageStatus: 'error'
                    });
                    console.log('Deleted error: ' + error.message)
                }
            );

        })
    }
}

