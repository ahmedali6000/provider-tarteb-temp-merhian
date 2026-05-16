import * as Actions  from './../actions/ActionTypes';

const initState = {
    loader_status: false,
    snake_status: false,
    snake_msg: '',
    lang:'ar',
    app_visited: 'no_visited',
    view: false,
    modalData: {
        'title':null,
        'body':null,
    },
    upgrade: 0,
    payment: 0,
    fixing_mode:false,
    MyQShowState:false,
    MyQShowData: {
        'id':'--',
        'label':'--',
        'your_turn':'--',
        'persons_in_q':'--',
        'serving_now':'--',
    },

};

function rnReducer(state = initState,action){
    switch (action.type) {
        case Actions.CHANEG_NOTIFICATION_MESSAGE:
            return {
                ...state,
                NotificationMessage: action.payload ,
            };
        case Actions.UPGRADE:
            return {
                ...state,
                upgrade: action.payload,
        };
        case Actions.LOAD_ON:
            return {
                ...state,
                loader_status: true,
            };
        case Actions.APP_VISITED_CHANGE:
            return {
                ...state,
                app_visited: action.payload, 
            };
        case Actions.LOAD_OFF:
            return {
                ...state,
                loader_status: false,
            };
        case Actions.CHAHNGE_FIXING_MODE_STATUS:
            return {
                ...state,
                fixing_mode: action.payload,
            };
        case Actions.CHAHNGE_PAYMENT_FEATURE_STATUS:
            return {
                ...state,
                payment: action.payload,
            };
        case Actions.CHANGE_SNAKE_STATUS:
            return {
                ...state,
                snake_status: action.payload.status,
                snake_msg: action.payload.msg,
            }
            case Actions.CHANGE_MODAL: // to inform him
            return {
                ...state,
                view: action.payload.modalState,
                modalData: {
                    'title':action.payload.modalData.title,
                    'body':action.payload.modalData.body,
                    
                },
            };
            case Actions.SHOW_MY_POS: // to inform him
            return {
                ...state,
                MyQShowState: action.payload.modalState,
                MyQShowData: {
                    'id':action.payload.modalData.id,
                    'label':action.payload.modalData.label,
                    'your_turn':action.payload.modalData.your_turn,
                    'persons_in_q':action.payload.modalData.persons_in_q,
                    'serving_now':action.payload.modalData.serving_now,
                },
            };
        default:
            return state;
    }
}


export default rnReducer;
