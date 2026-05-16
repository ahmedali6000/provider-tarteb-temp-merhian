import * as Actions  from './../actions/ActionTypes';

const initState = {
    view: false,
    modalData: null,
    
};

function TurnModalReducer(state = initState,action){
    switch (action.type) {
       
        case Actions.HIDE_MODAL:
            return {
                ...state,
                view: false,
            };
            break
        default:
            return state;
    }
}


export default TurnModalReducer;