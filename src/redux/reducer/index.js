import handleCart from './handleCart'
import { walletReducer, transactionReducer } from './walletReducer'
import { combineReducers } from "redux";

const rootReducers = combineReducers({
    handleCart,
    wallet: walletReducer,
    transaction: transactionReducer,
})

export default rootReducers