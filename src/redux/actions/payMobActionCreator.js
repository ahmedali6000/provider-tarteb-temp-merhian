import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Actions  from './ActionTypes';
import  {USER_KEY , TOKEN_KEY, PAYMOP_INTEGATION_ID_FOR_CARD, PAYMOP_API_KEY, PAYMOP_IFRAME_ID} from './../../../src/utils/app';
import {domain} from '../../utils/app';
import {useSelector} from 'react-redux'


export const setUser = user => ({
    type : Actions.SET_USER,
    payload : {user},
}); 

const loginSuccess = () => ({type: Actions.LOGIN_SUCCESS});
 



export const get_auth_token = () => {
    // checkToken();
    
    return (dispatch , getState) => {
       
        
        //api request here.
        dispatch({type: Actions.CHANGE_PAYMOB_PROCESSING,payload:true}); //loading
        //axios
        var config = {method: 'post',url: 'https://accept.paymobsolutions.com/api/auth/tokens',data:{api_key:PAYMOP_API_KEY}};
        axios(config).then(res => {
            dispatch({
                type: Actions.SET_TOKEN_PAYMOB_FIRST,
                payload: res.data.token
            })
            dispatch({
                type: Actions.CHANGE_TOKEN_STATE,
                payload: true,
            })
        }).catch(err=>{
        }).finally(() => {
            setTimeout(() => {
                 get_order_id() 
            }, 300); 
        })
    }
}
 
export const get_order_id = () => {
    
    return async(dispatch , getState) => { 
        const token = await getState().paymob.token;
        var config = {method: 'post',url: 'https://accept.paymobsolutions.com/api/ecommerce/orders',data:{
            "auth_token":token,
            "delivery_needed": false,
            "amount_cents": 20,
            "currency": "EGP"
        }};
        axios(config).then(res => {
            dispatch({
                type: Actions.SET_ORDER_ID,
                payload: res.data.id
            })
            dispatch({
                type: Actions.CHANGE_ORDER_ID_STATE,
                payload: true,
            })
        })
        .catch(err=>{
          
        })
        .finally(() => {
            
        })
    }
}
 
export const get_last_big_token_to_do_action = (integration_id_argu) => {
    return async(dispatch , getState) => {
        const user = await getState().auth.user;;
        const token = await getState().paymob.token;;
        const order_id = await getState().paymob.order_id;
        const amount_cents = await getState().paymob.amount_cents;
        
         
        var config = {method: 'post',url: 'https://accept.paymobsolutions.com/api/acceptance/payment_keys',data:{
            "auth_token": token,
            "amount_cents": amount_cents, 
            "expiration": 36000, 
            "order_id": order_id,
            "billing_data": {
                "apartment": "803", 
                "email": "claudette09@exa.com", 
                "floor": "42", 
                "first_name": user.name, 
                "street": "Ethan Land", 
                "building": "8028", 
                "phone_number": user.phone, 
                "shipping_method": "PKG", 
                "postal_code": "01898", 
                "city": "Jaskolskiburgh", 
                "country": "CR", 
                "last_name": "Nicolas", 
                "state": "Utah"
            }, 
            "currency": "EGP", 
            "integration_id": integration_id_argu,
            "lock_order_when_paid": false
            }};
        axios(config).then(res => {
            dispatch({
                type: Actions.SET_PAYMENT_TOKEN_LAST,
                payload: res.data.token
            });
            dispatch({
                type: Actions.CHANGE_PAYMENT_TOKEN_LAST_STATE,
                payload: true,
            })
        })
        .catch(err=>{
           
        })
        .finally(() => {
            
        }) 
    }
}


export const get_html_code = () => {
    
    return async(dispatch , getState) => { 
        const payment_token = await getState().paymob.paymentToken;
        var config = {method: 'get',url: 'https://accept.paymobsolutions.com/api/acceptance/iframes/'+PAYMOP_IFRAME_ID+'?payment_token=' + payment_token};
        axios(config).then(res => {
            
            dispatch({
                type: Actions.SET_HTML_CODE,
                payload: res.data
            });
            dispatch({
                type: Actions.CHANGE_HTML_CODE_STATE,
                payload: true,
            })
        })
        .catch(err=>{
           
        })
    }
}


export const get_ref_num = () => {
    
    return async(dispatch , getState) => { 
        const last_token = await getState().paymob.paymentToken;
      
        var config = {method: 'post',url: 'https://accept.paymobsolutions.com/api/acceptance/payments/pay',data:{
            "source": {
              "identifier": "AGGREGATOR", 
              "subtype": "AGGREGATOR"
            },
            "payment_token": last_token
        }};
        axios(config).then(res => {
           
            dispatch({
                type: Actions.SET_PAYMOB_REF_NUM,
                payload: res.data.id
            })
        })
        .catch(err=>{
            
        })
        .finally(() => {
            
        })
    }
}
 
