// import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Actions  from './ActionTypes';
import  {FAWRY_MERCHANT_KEY , FAWRY_SECURITY_KEY, domain } from './../../../src/utils/app';
// import sjcl from 'sjcl';
// import { sha256 } from 'react-native-sha256';

const calc_signature = (FAWRY_MERCHANT_KEY,merchantRefNum,User_id,PAYMENTMETHOD,amount_in_decemal,FAWRY_SECURITY_KEY) => { 
    

   return 'increptor';

}
export const Connect_fawry = () => {
    return async(dispatch , getState) => {
       
        const amount = getState().fawry.kiosk_amount;
        const merchantRefNum = Date.now();
        const amount_in_decemal = amount.toFixed(2);
        const user = getState().auth.user;
        
       
        const signature = await  calc_signature(FAWRY_MERCHANT_KEY,merchantRefNum,user.id,"PAYATFAWRY",amount_in_decemal,FAWRY_SECURITY_KEY);
       
        const dataU = {
            "merchantCode": FAWRY_MERCHANT_KEY,
            "customerName": user.name,
            "customerMobile": user.phone,
            "customerEmail": "example@gmail.com",
            "customerProfileId": user.id,
            "merchantRefNum": merchantRefNum,
            "amount": amount_in_decemal,
             
            "currencyCode": "EGP",
            "language" : "ar-eg",
            "chargeItems": [
              {
                "itemId": merchantRefNum * 2,
                "description": "Item Descriptoin",
                "price": amount,
                "quantity": "1"
              }
            ],
            "signature": signature,
            "paymentMethod": "PAYATFAWRY",
            "description": "Example Description"
    };
    console.warn(dataU)
        var config = {method: 'post',url: 'https://atfawry.com/ECommerceWeb/Fawry/payments/charge',data:dataU};
        axios(config).then(res => {
            
            
            const  ref_num = res.data.referenceNumber;
            var config = {method: 'post',url: domain + '/api/generateRef',headers: { 'Authorization': 'Bearer ' + getState().auth.token, 'Content-Type': 'application/json','Accept': 'application/json'},data:{ref_num:ref_num}};
            axios(config).then(res => {
                dispatch({type:Actions.CHANGE_FAWRY_PROCESSING,payload:false})
                dispatch({type:Actions.SET_FAWRY_REF_NUM,payload:ref_num})
            }).finally(() => {
             
            })

          
            
        }).catch(error=>{
        }).finally(() => {
             
        })
    }
}
 

 
 

 
 
