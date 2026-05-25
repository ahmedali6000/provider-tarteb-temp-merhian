
import { combineReducers, createStore ,applyMiddleware} from "redux";
import authReducer from "./authReducer";
import rnReducer from './rnReducer';
import orderReducer  from './orderReducer';
 import TurnModalReducer  from './TurnModalReducer';
import {CLEAR_REDUX_DATA} from './../actions/ActionTypes';
 
import FawryReducer from "./FawryReducer";

// ,myApp: rnReducer

const rootReducer = combineReducers({auth: authReducer,myApp: rnReducer,order: orderReducer,fawry:FawryReducer})

//logout with smart way.
const appReducer = (state , action) => {
    if (action.type === CLEAR_REDUX_DATA) {
        return rootReducer(undefined , action)
    }
    return rootReducer(state,action);
}

export default appReducer;