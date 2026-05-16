import * as Actions  from '../actions/ActionTypes';

const initState = {
    processing : false,
    
    ref_num: null,
    // ref_num_state: false,
    kiosk_amount:0,

    token : null,
    token_state : false,
    
    amount_cents : 30,

    order_id : null,
    order_id_state : false,

    paymentToken : null,
    paymentToken_state : false,

    html_code : null,
    html_code_state : false,
    
};

function PaymobReducer(state = initState,action){
    switch (action.type) {
        case 'CHANGE_PAYMOB_PROCESSING':
            return {
                ...state,
                processing: action.payload,
               
            };
        break
        case 'SET_TOKEN_PAYMOB_FIRST':
            return {
                ...state,
                token: action.payload,
            };
        break
        case 'CHANGE_TOKEN_STATE':
            return {
                ...state,
                token_state: action.payload,
            };
        break
         case 'CHANGE_PAYMOB_KOISK_AMOUNT':
            return {
                ...state,
                kiosk_amount: action.payload,
            };
        break
        case 'SET_AMOUNT_CENTENT':
            return {
                ...state,
                amount_cents: action.payload,
            };
        break
        case 'SET_ORDER_ID':
            return {
                ...state,
                order_id: action.payload,
            };
        break 
        case 'CHANGE_ORDER_ID_STATE':
            return {
                ...state,
                order_id_state: action.payload,
            };
        break 
        case 'SET_PAYMENT_TOKEN_LAST':
            return {
                ...state,
                paymentToken: action.payload,
            };
        break  
        case 'CHANGE_PAYMENT_TOKEN_LAST_STATE':
            return {
                ...state,
                paymentToken_state: action.payload,
            };
        break  
        case 'SET_HTML_CODE':
            return {
                ...state,
                html_code: action.payload,
            };
        break 
        case 'CHANGE_HTML_CODE_STATE':
            return {
                ...state,
                html_code_state: action.payload,
            };
        break 
        case 'SET_PAYMOB_REF_NUM':
            return {
                ...state,
                ref_num: action.payload,
            };
        break 
        case 'CLEAR_PAYMOB':
            return initState;
        break 
        default:
            return state;
    }
}


export default PaymobReducer;
