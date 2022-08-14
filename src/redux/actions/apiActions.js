import { readFile } from "react-native-fs";
import { storeData } from "../../constants/helperFunction";
import { GET_DATA, PICK_MULTIPLE_IMAGE } from "../../constants/types";
import XLSX from 'xlsx'
import DocumentPicker from 'react-native-document-picker';


export const readCsvData = (csvFile) => {
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
                            propertyClass: data[i][3],
                            buildStyle: data[i][4],
                            details: 'Take New Photo',
                            process: '0',
                            status: ''
                        })
                    }



                    dispatch({
                        type: GET_DATA,
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
                type: GET_DATA,
                status: 'error'
            })
        }
    }
}

export const pickMultipleFile = (itemData, index) => {

    try {
        return async dispatch => {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.images],
                allowMultiSelection: true
            });
            console.log(
                'PickImage===>', JSON.stringify(results)
            );


            var pickImage = [];
            for (const res of results) {
                var track = {
                    url: res.uri,
                    imageName: res.name,
                    imageType: res.type,
                };
                console.log(
                    'PickImage add===>', res.uri
                );
                pickImage.push(track)

            }
            var item = {
                ...itemData,
                process: pickImage.length,
                status: 'No'
            }
            dispatch({
                type: PICK_MULTIPLE_IMAGE,
                payload: pickImage,
                selectAddress: item.address,
                index: index,
                item: item,
                imageStatus: 'success'
            })

        }
    } catch (err) {
        if (DocumentPicker.isCancel(err)) {
            dispatch({
                type: PICK_MULTIPLE_IMAGE,
                imageStatus: 'User Cancel'
            })
        } else {
            dispatch({
                type: PICK_MULTIPLE_IMAGE,
                imageStatus: err
            })
            throw err;
        }
    }
}