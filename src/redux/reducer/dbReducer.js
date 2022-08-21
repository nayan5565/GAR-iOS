import { storeData } from '../../constants/helperFunction';
import { GET_IMAGE_DB, SAVE_CAPTURE_IMAGE_DB, SAVE_CSV_DB, SAVE_IMAGE_DB, UPDATE_CSV_LIST, UPDATE_IMAGE_DB } from '../../constants/types';

const INITIAL_STATE = {
    csvDataList: [],
    imageList: [],
    status: '',
    selectAddress: '',
    imageStatus: ''

};

const dbReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SAVE_CSV_DB:
            return { ...state, csvDataList: action.payload, status: action.status }
        case SAVE_IMAGE_DB:
            let newList = [...state.csvDataList]
            newList[action.index] = action.item
            storeData('csv_address', JSON.stringify(newList))
            return { ...state, imageList: action.payload, imageStatus: action.imageStatus, selectAddress: action.selectAddress, csvDataList: newList }

        case SAVE_CAPTURE_IMAGE_DB:
            // let newList2 = [...state.csvDataList]
            // newList[action.index] = action.item
            // console.log('from camera==>', action.camera)
            // if (action.camera) {
            //     storeData('csv_address', JSON.stringify(newList))
            // }

            return { ...state, imageList: action.payload, imageStatus: action.imageStatus }
        case UPDATE_CSV_LIST:
            let newCsvList = [...state.csvDataList]
            newCsvList[action.index] = action.item
            return { ...state, csvDataList: newCsvList }
        case GET_IMAGE_DB:

            return { ...state, imageList: action.payload, imageStatus: action.imageStatus }
        case UPDATE_IMAGE_DB:
            let newImages = [...state.imageList]
            newImages[action.index] = action.item
            return { ...state, imageList: newImages, imageStatus: action.imageStatus }

        default:
            return state
    }
};
export default dbReducer