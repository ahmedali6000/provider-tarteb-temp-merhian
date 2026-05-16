
import { combineReducers, createStore ,applyMiddleware} from "redux";
import authReducer from "./authReducer";
import rnReducer from './rnReducer';
import orderReducer  from './orderReducer';
import DocReducer  from './DocReducer';
import TurnModalReducer  from './TurnModalReducer';
import {CLEAR_REDUX_DATA} from './../actions/ActionTypes';
import PaymobReducer from "./PaymobReducer";
import FawryReducer from "./FawryReducer";

// ,myApp: rnReducer

const rootReducer = combineReducers({auth: authReducer,myApp: rnReducer,order: orderReducer,doc: DocReducer,paymob: PaymobReducer,fawry:FawryReducer})

//logout with smart way.
const appReducer = (state , action) => {
    if (action.type === CLEAR_REDUX_DATA) {
        return rootReducer(undefined , action)
    }
    return rootReducer(state,action);
}

export default appReducer;