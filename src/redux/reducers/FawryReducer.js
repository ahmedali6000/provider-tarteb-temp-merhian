import * as Actions  from '../actions/ActionTypes';

const initState = {
    processing : false, //useless till now.
    ref_num: null,
    kiosk_amount:0
};

function FawryReducer(state = initState,action){
    switch (action.type) {
        case 'CHANGE_FAWRY_PROCESSING':
            return {
                ...state,
                processing: action.payload,
               
            };
        break
        case 'SET_FAWRY_REF_NUM':
            return {
                ...state,
                ref_num: action.payload,
            };
        case 'CHANGE_FAWRY_KOISK_AMOUNT':
            return {
                ...state,
                kiosk_amount: action.payload,
            };
        break
        case 'CLEAR_FAWRY_REF_NUM':
            return initState;
        break
        default:
            return state;
    }
}


export default FawryReducer;
