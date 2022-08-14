import { GET_DATA, PICK_MULTIPLE_IMAGE } from '../../constants/types';

const INITIAL_STATE = {
    csvDataList: [],
    imageList: [],
    status: '',
    selectAddress: '',
    imageStatus: ''

};

const apiReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_DATA:
            return { ...state, csvDataList: action.payload, status: action.status }
        case PICK_MULTIPLE_IMAGE:
            let newList = [...state.csvDataList]
            newList[action.index] = action.item
            return { ...state, imageList: action.payload, imageStatus: action.imageStatus, selectAddress: action.selectAddress, csvDataList: newList }

        default:
            return state
    }
};
export default apiReducer