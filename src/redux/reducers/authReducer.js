import * as Actions  from './../actions/ActionTypes';

const initState = {
    token : '',
    user:null,
    addresses:[],
    my_selected_address:null,
    wallet:null,
    points: 0,

    user_image:null,
   
    isLoginingIn: false,
    loginSuccess : null,
    loginFailure: null,
    support_msgs_counter_flag: 0, 
    temp_user_model:null
}

function authReducer(state = initState,action){
    switch (action.type) {
        case Actions.SET_TOKEN:
            return {
                ...state,
                token: action.payload.token,
            };
            break;
        case Actions.SET_USER:
            return {
                ...state,
                user: action.payload.user,
            };
            break;
        case Actions.UPLOAD_IMAGE_REG:
            return {
                ...state,
                user_image: action.payload,
            };
        case Actions.LOGIN_START:
            return {
                ...state,
                isLoginingIn: true, 
            };
            break;
        case Actions.LOGIN_SUCCESS:
            return {
                ...state,
                isLoginingIn: false, 
                loginSuccess: {},
            };
            break;
        case Actions.LOGIN_FAILURE:
            return {
                ...state,
                isLoginingIn: false,
                loginFailure: {},
            };
            break;
        
        case Actions.SELECT_COUNTRY:
            return {
                ...state,
                selected_coutntry: action.payload.selected_coutntry,
            };
            break;
        case Actions.SHOW_COUNTRY_MODAL:
            return {
                ...state,
                country_modal_state: action.payload.country_modal_state,
            };
            break;
        case Actions.SET_COUNTRIES_ARR:
            return {
                ...state,
                countries_arr: action.payload.arr,
            };
            break;
        case Actions.SET_TEMP_USER_MODEL:
            return {
                ...state,
                temp_user_model: action.payload.temp_user_model,
            };
            break;
        case Actions.UPDATE_ADRESSES_ARR:
            return {
                ...state,
                addresses: action.payload,
            };
            break;
        case Actions.SELECT_MY_ADDRESS:
            return {
                ...state,
                my_selected_address: action.payload,
            };
            break;
        case Actions.UPDATE_POINTS:
                return {
                    ...state,
                    points: action.payload,
                };
            break;
        case Actions.UPDATE_CREDIT:
            return {
                ...state,
                wallet: action.payload,
            };
            break;
       
        default:
            return state;
    }
}


export default authReducer;
