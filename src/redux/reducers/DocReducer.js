import * as Actions  from './../actions/ActionTypes';

const initState = {
    about : null,
    terms : null,
    privacy : null,
    faqs : null,
};

function DocReducer(state = initState,action){
    switch (action.type) {
        case 'ABOUT':
            return {
                ...state,
                about: action.payload.data,
            };
            break
        case 'TERMS':
            return {
                ...state,
                terms: action.payload.data,
            };
            break
        case 'PRIVACY':
            return {
                ...state,
                privacy: action.payload.data,
            };
            break
        case Actions.FAQ_GET:
            return {
                ...state,
                faqs: action.payload.faqs,
            };
            break
        default:
            return state;
    }
}


export default DocReducer;
