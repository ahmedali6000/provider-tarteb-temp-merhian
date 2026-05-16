import * as Actions  from './../actions/ActionTypes';



const initState = {
      main_category_id: null,
  main_category_name: null,
     order_category_id:null,
     order_category_name:null,
     preview:false,
     preview_cost:0,
     cadoo:0,
     order_notes: '',
     fatherHere:true,
     type: null,
     sch_data:null,
     order_services:[],
     bundle_days:null,
     bundle_id:null,
     bundle_hour:null,
     bundle_or_order:'order',
};

function orderReducer(state= initState , action) {
    switch (action.type) {
        case Actions.UPDATE_ORDER_DATA:
                return {
                    ...state,
                    main_category_id: action.payload.main_category_id,
                    main_category_name: action.payload.main_category_name,
                    order_category_id: action.payload.category_id,
                    order_category_name: action.payload.category_name,
                    order_services: action.payload.services_arr,
                };
            break
            case Actions.UPDATE_ONLY_PREVIEW:
            return {
                ...state,
                preview: action.payload.preview,
                preview_cost: action.payload.preview_cost,
                order_category_id:action.payload.category_id,
                order_category_name:action.payload.category_name,
            };
            case Actions.UPDATE_ORDER_NOTES:
            return {
                ...state,
                order_notes: action.payload,
            };
            case Actions.SET_ORDER_TYPE:
                return {
                    ...state,
                    type: action.payload,
                };
                case Actions.SET_ORDER_SCHEDULING_TYPE:
                    return {
                        ...state,
                        sch_data: action.payload,
                    };

            case Actions.UPDATE_CADOO:
            return {
                ...state,
                cadoo: action.payload,
            };
            case Actions.FATHER_ATTENDACE:
                return {
                    ...state,
                    fatherHere: action.payload,
                };
            case Actions.BUNDLE_ID_SET:
                return {
                    ...state,
                    bundle_id: action.payload,
                };
            case Actions.BUNDLE_DAYS_SET:
                return {
                    ...state,
                    bundle_days: action.payload,
                };
            case Actions.BUNDLE_HOUR_SET:
                return {
                    ...state,
                    bundle_hour: action.payload,
                };
            case Actions.BUNDLE_OR_ORDER:
                return {
                    ...state,
                    bundle_or_order: action.payload,
                };
           case Actions.FLUSH_ORDER_DATA:
            return {
                ...state,
                main_category_id: null,
                main_category_name: null,
                order_category_id: null,
                order_category_name: null,
                preview: false,
                preview_cost: 0,
                order_services: [],
            };
            break 
            case Actions.REMOVE_SERVICE_FORM_ARR:
                for(i=0;i <= initState.order_services.length;i++){
                    if(initState.order_services[i].service_id == action.payload.service_id){
                        console.log('Removed Sir');
                    } 
                }
                 
        
            
        default:
        return state;
             
    }
     
}
export default orderReducer;