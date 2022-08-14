import { storeData } from '../../constants/helperFunction';
import { GET_IMAGE_DB, SAVE_CSV_DB, SAVE_IMAGE_DB, UPDATE_IMAGE_DB } from '../../constants/types';

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