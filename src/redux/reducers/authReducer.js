import { domain } from '../../utils/app';
import * as Actions  from './../actions/ActionTypes';

const initState = {
    token : '',
    user: null, 
    user_image:null,
    front_id:null,
    back_id:null,
    area_id:null,
    category_id:null,
    story:null,
    user_latitude: 0,
    user_longitude: 0,
    working_status: 'OFF',
    isLoginingIn: false,
    loginSuccess : null,
    loginFailure: null,
    support_msgs_counter_flag: 0,
    temp_user_model:null,
    showOrderAlert:false,
    blocked:null,

    rate: 0,
    orders_count: 0,
    review_count: 0,
    credit: 0,
    points: 0,

    backgroundState:false,
    backgroundLastTime:null,
    
    failed_orders_count: null,
    failed_orders:[],

    compeletd_orders_count: null,
    compeletd_orders:[], //or object
    
    pending_orders_count: null,
    pending_orders:[],
}

function authReducer(state = initState,action){
    switch (action.type) {
        case Actions.STORY_CHANGE:
            return {
                ...state,
                story: action.payload,
            };
        case Actions.SET_CATEGORY_ID:
            return {
                ...state,
                category_id: action.payload,
            };
        case Actions.UPLOAD_IMAGE_REG:
            return {
                ...state,
                user_image: action.payload,
            };
        case Actions.UPLOAD_FRONT_ID:
            return {
                ...state,
                front_id: action.payload,
            };
        case Actions.UPLOAD_BACK_ID:
            return {
                ...state,
                back_id: action.payload,
            };
        case Actions.SET_AREA_ID:
            return {
                ...state,
                area_id: action.payload,
            };
        case Actions.SET_TOKEN:
            return {
                ...state,
                token: action.payload.token,
            };
        case Actions.UPDATE_ORDERS_COUNT:
            return {
                ...state,
                orders_count: action.payload,
            };
        case Actions.UPDATE_RATE:
            return {
                ...state,
                rate: action.payload,
            };
        case Actions.UPDATE_REVIEW_COUNT:
            return {
                ...state,
                review_count: action.payload,
            };
        case Actions.UPDATE_CREDIT:
            return {
                ...state,
                credit: action.payload,
            };
        case Actions.SET_BACKGROUND_STATE:
            return {
                ...state,
                backgroundState: action.payload,
            };
        case Actions.BACKGROUND_LAST_TIME:
            return {
                ...state,
                backgroundLastTime: action.payload,
            };
            case Actions.UPDATE_POINTS:
                return {
                    ...state,
                    points: action.payload,
                };
        case Actions.CHANGE_WORKING_STATUS:
            return {
                ...state,
                working_status: action.payload.working_status,
            };
        case Actions.CHANGE_ORDER_ALERT_STATE:
            return {
                ...state,
                showOrderAlert: action.payload.order_alert_state,
            };
        case Actions.CHANGE_LONG_LAT:
            return {
                ...state,
                user_latitude: action.payload.lat,
                user_longitude: action.payload.long,
            };
        case Actions.SET_USER:
            return {
                ...state,
                user: action.payload.user,
            };
        case Actions.LOGIN_START:
            return {
                ...state,
                isLoginingIn: true, 
            };
        case Actions.LOGIN_SUCCESS:
            return {
                ...state,
                isLoginingIn: false, 
                loginSuccess: {},
            };
        case Actions.LOGIN_FAILURE:
            return {
                ...state,
                isLoginingIn: false,
                loginFailure: {},
            };
        case Actions.INCREAS_SUPPORTSFLAG:
            return {
                ...state,
                support_msgs_counter_flag: Math.floor((Math.random() * 1000) + 1),
            };
        case Actions.SHOW_COUNTRY_MODAL:
            return {
                ...state,
                country_modal_state: action.payload.country_modal_state,
            };
        case Actions.SET_COUNTRIES_ARR:
            return {
                ...state,
                countries_arr: action.payload.arr,
            };
        case Actions.SET_TEMP_USER_MODEL:
            return {
                ...state,
                temp_user_model: action.payload.temp_user_model,
            };
            
        default:
            return state;
    }
}


export default authReducer;
