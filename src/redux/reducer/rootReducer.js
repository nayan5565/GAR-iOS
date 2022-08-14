import { combineReducers } from 'redux'
import apiReducer from './apiReduce'
import dbReducer from './dbReducer'
const rootReducer = combineReducers({
    csvData: apiReducer,
    localDB: dbReducer

})
export default rootReducer