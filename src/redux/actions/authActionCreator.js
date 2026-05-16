import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Actions  from './ActionTypes';
import  {USER_KEY , TOKEN_KEY, OnBoarding_KEY, versionCodeAndroid, versionCodeIOS, versionNameAndroid, versionNameIOS} from './../../../src/utils/app';
import {domain} from '../../utils/app';
import messaging from '@react-native-firebase/messaging';
import {useSelector} from 'react-redux';
import RNRestart from 'react-native-restart';
import { Alert, Platform } from 'react-native';

export const setToken = token => ({
    type : Actions.SET_TOKEN,
    payload : {token},
}); 

export const setUser = user => ({
    type : Actions.SET_USER,
    payload : {user},
}); 

// const load = () => ({type: Actions.LOAD});
 


const loginStart = () => ({type: Actions.LOGIN_START});
const loginSuccess = () => ({type: Actions.LOGIN_SUCCESS});
const loginFailure = () => ({type: Actions.LOGIN_FAILURE});
const clearReduxData = () => ({type: Actions.CLEAR_REDUX_DATA});


export const checkTokenValidity = () => {
    return (dispatch , getState) => {
        AsyncStorage.getItem(TOKEN_KEY).then( tokenK => {
            var config = {method: 'get',url: domain + '/api/checkTokenValidity',headers: { 'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
            axios(config).then(res => {
               
            })
        });
    }
}

export const getUserData = () => {
    return (dispatch , getState) => {
         const tok = getState().auth.token;
       
         var config = {method: 'get',url: domain + '/api/user',headers: { 'Authorization': 'Bearer ' + tok,'Content-Type': 'application/json','Accept': 'application/json',
         versionCode: (Platform.OS == ('android')) ? versionCodeAndroid : versionCodeIOS,os:Platform.OS
        }};    
            axios(config).then(res => {
                dispatch({type:Actions.UPGRADE,payload:res.data.upgrade})
                if(res.data.userData.payment != 0){
                    dispatch({type: Actions.CHAHNGE_PAYMENT_FEATURE_STATUS,payload:res.data.userData.payment});
                    dispatch({type: Actions.CHAHNGE_FIXING_MODE_STATUS,payload:res.data.userData.fixing_mode});
                }
                dispatch(setUser(res.data.userData));
                dispatch({type: Actions.UPLOAD_IMAGE_REG,payload:res.data.userData.image});
                
                dispatch({
                    type: Actions.UPDATE_CREDIT,
                    payload: res.data.wallet
                });
                dispatch({
                    type: Actions.UPDATE_ADRESSES_ARR,
                    payload: res.data.addresses
                });
            }).catch(err => {
                
                if(err.response.status == 401 && tok){
                    dispatch(logout());
                }
            
            })
         
    }
}

export const updateInfo = (name,phone,email) => {
    return (dispatch , getState) => {
        AsyncStorage.getItem(TOKEN_KEY).then( tokenK => {
            var config = {method: 'put',url: domain + '/api/update-info',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{name,phone,email}};
            axios(config).then(res => {
                AsyncStorage.setItem(USER_KEY,JSON.stringify(res.data.userData));
                AsyncStorage.getItem(USER_KEY).then( user => {
                   
                    dispatch(setUser(res.data.userData)); 
                    dispatch({type: Actions.UPLOAD_IMAGE_REG,payload:res.data.userData.image});
                });
            })
        });
    }
}


//v2 applied
export const Add_Service_To_Order = (
  category_id,
  category_name,
  service_id,
  service_name,
  price,
  count,
  mArray,
  btn_pressed_type,
  main_category_id = null,
  main_category_name = null,
  details = null,
) => {
  return dispatch => {
    let servicesArr = Array.isArray(mArray)
      ? mArray.map(item => ({...item}))
      : [];

    const serviceIndex = servicesArr.findIndex(
      item => String(item.service_id) === String(service_id),
    );

    if (serviceIndex > -1) {
      if (Number(count) <= 0) {
        servicesArr = servicesArr.filter(
          item => String(item.service_id) !== String(service_id),
        );
      } else {
        servicesArr = servicesArr.map(item =>
          String(item.service_id) === String(service_id)
            ? {
                ...item,
                service_name,
                price,
                count: Number(count),
                ...(details ? {details} : {}),
              }
            : item,
        );
      }
    } else if (Number(count) > 0) {
      servicesArr = [
        ...servicesArr,
        {
          service_id,
          service_name,
          price,
          count: Number(count),
          ...(details ? {details} : {}),
        },
      ];
    }

    const isOrderEmpty = servicesArr.length === 0;

    dispatch({
      type: Actions.UPDATE_ORDER_DATA,
      payload: {
        main_category_id: isOrderEmpty ? null : main_category_id,
        main_category_name: isOrderEmpty ? null : main_category_name,
        category_id: isOrderEmpty ? null : category_id,
        category_name: isOrderEmpty ? null : category_name,
        services_arr: servicesArr,
      },
    });
  };
};



export const changePreview = (category_id,category_name,preview,preview_cost) => {
    
    return (dispatch , getState) => {
        const services = getState().order.order_services;
        if(preview == false && services.length == 0){
            dispatch({
                type: Actions.UPDATE_ONLY_PREVIEW,
                payload:{
                    category_id:null,
                    category_name:null,
                    preview:preview,
                    preview_cost:0,
                }
              })

        }else{
            dispatch({
                type: Actions.UPDATE_ONLY_PREVIEW,
                payload:{
                    category_id:category_id,
                    category_name:category_name,
                    preview:preview,
                    preview_cost:(preview) ? preview_cost : 0,
                }
              })
        }
           
    }
}
export const login = (phone , password) => {
    
    // checkToken();
    // setTimeout(() => {
    //     Alert.alert('Error','check your network and try again later.')
    // }, 4000);
    return async(dispatch , getState) => {
        
        await messaging().requestPermission();
        const fcmToken = await messaging().getToken();
        alert(fcmToken)
        //api request here.
        dispatch(loginStart()); //loading
        //axios
        var config = {method: 'post',url: domain + '/api/login',data:{phone,password,fcmToken:fcmToken,roles_to_avalible:[3]}};
        axios(config).then(res => {
            dispatch({type: Actions.UPLOAD_IMAGE_REG,payload:res.data.userData.image});
            dispatch(loginSuccess());
            dispatch(setToken(res.data.token))
            dispatch(setUser(res.data.userData));
            dispatch({
                type: Actions.UPDATE_CREDIT,
                payload: res.data.wallet
            });
            dispatch({
                type: Actions.UPDATE_ADRESSES_ARR,
                payload: res.data.addresses
            });
            AsyncStorage.setItem(TOKEN_KEY,res.data.token);
            AsyncStorage.setItem(USER_KEY,JSON.stringify(res.data.userData));
           ;
        })
        .catch(err=>{
            
            if(err.response.status == 401 ){
                dispatch(loginFailure());
            }
        })
        .finally(() => {
            
        })
    }
}
export const set_new_password = (phone , new_password) => {
    // checkToken();
    return async(dispatch , getState) => {
        const fcmToken = await messaging().getToken();
        //api request here.
        dispatch(loginStart()); //loading
        //axios
        var config = {method: 'post',url: domain + '/api/new-password',data:{phone,new_password,fcmToken}};
        axios(config).then(res => {
            dispatch(loginSuccess());
            dispatch({type: Actions.UPLOAD_IMAGE_REG,payload:res.data.userData.image});
            dispatch(setToken(res.data.token))
            dispatch(setUser(res.data.userData));
            if(res.data.userData.payment != 0){
                dispatch({type: Actions.CHAHNGE_PAYMENT_FEATURE_STATUS,payload:res.data.userData.payment});
                dispatch({type: Actions.CHAHNGE_FIXING_MODE_STATUS,payload:res.data.userData.fixing_mode});
            }

            dispatch({
                type: Actions.UPDATE_CREDIT,
                payload: res.data.wallet
            });
            dispatch({
                type: Actions.UPDATE_ADRESSES_ARR,
                payload: res.data.addresses
            });

            
            AsyncStorage.setItem(TOKEN_KEY,res.data.token);
            AsyncStorage.setItem(USER_KEY,JSON.stringify(res.data.userData));
        })
        .catch(err=>{
            if(err.response.status == 401 ){
                dispatch(loginFailure());
            }
        })
        .finally(() => {
            
        })
    }
}

export const register = (trigger_type,name , phone , email , password,imageURL,type,appletoken,countrycode,invcode) => {
    // checkToken();
    return async(dispatch , getState) => {
        const fcmToken = await messaging().getToken();
        // if (fcmToken) you can log it.
        if(trigger_type == 'sociallogin'){
            password = null;

        }else{
            password = password;
        }

        // console.warn(phone);
        // return;
        //api request here.
        dispatch(loginStart()); //loading
        //axios
        var config = {method: 'post',url: domain + '/api/register',data:{name,phone,email,password,fcmToken,role_id:3,imageURL,type,appletoken,countrycode,invcode}};
        axios(config).then(res => {
            dispatch(loginSuccess());
            if(res.data.userData.payment != 0){
                dispatch({type: Actions.CHAHNGE_PAYMENT_FEATURE_STATUS,payload:res.data.userData.payment});
                dispatch({type: Actions.CHAHNGE_FIXING_MODE_STATUS,payload:res.data.userData.fixing_mode});
            }
            dispatch(setToken(res.data.token))
            dispatch(setUser(res.data.userData));
            dispatch({type: Actions.UPLOAD_IMAGE_REG,payload:res.data.userData.image});
            dispatch({
                type: Actions.UPDATE_CREDIT,
                payload: res.data.wallet
            });
            dispatch({
                type: Actions.UPDATE_ADRESSES_ARR,
                payload: res.data.addresses
            });
            AsyncStorage.setItem(TOKEN_KEY,res.data.token);
            AsyncStorage.setItem(USER_KEY,JSON.stringify(res.data.userData));
           ;
        })
        .catch(err=>{
            console.error(err.response.data);
            
            if(err.response.status == 401 ){
                dispatch(loginFailure());
            }
        })
        .finally(() => {
            
        })
    }
}



export const logout = () => {
    return async(dispatch , getState) => {
        axios.defaults.headers.Auhtorization = undefined;
        dispatch(clearReduxData());
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
        RNRestart.Restart();
    }
};


