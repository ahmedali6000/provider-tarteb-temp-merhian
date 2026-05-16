import { StyleSheet, Text, View , SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'
import HeaderApp from '../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { PAYMOP_API_KEY, PAYMOP_IFRAME_ID, PAYMOP_INTEGATION_ID_FOR_CARD } from '../../utils/app';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SET_HTML_CODE, SET_ORDER_ID, SET_PAYMENT_TOKEN_LAST, SET_TOKEN_PAYMOB_FIRST , CHANGE_TOKEN_STATE } from '../../redux/actions/ActionTypes';
import { get_auth_token, get_html_code, get_last_big_token_to_do_action, get_order_id } from '../../redux/actions/payMobActionCreator';
import { WebView } from 'react-native-webview';
import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import LottieView from 'lottie-react-native';

export default function Paywithbankcard() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const token = useSelector(state => state.paymob.token);
    const token_state = useSelector(state => state.paymob.token_state);
    const amount_cents = useSelector(state => state.paymob.amount_cents);
    const order_id = useSelector(state => state.paymob.order_id);
    const order_id_state = useSelector(state => state.paymob.order_id_state);
    const paymentToken = useSelector(state => state.paymob.paymentToken);
    const paymentToken_state = useSelector(state => state.paymob.paymentToken_state);
    const html_code = useSelector(state => state.paymob.html_code);
    const html_code_state = useSelector(state => state.paymob.html_code_state);
    
    
    useEffect(() => {
        if(token_state == false){
           
            dispatch(get_auth_token());
        }
        if(token_state == true){
           
            dispatch(get_order_id());
        }
        if(order_id_state == true){
            dispatch(get_last_big_token_to_do_action(PAYMOP_INTEGATION_ID_FOR_CARD));
        }
        if(paymentToken_state == true){
            dispatch(get_html_code());
        }
        

       

    }, [token_state,order_id_state,paymentToken_state,html_code_state])
    

    return (
        <SafeAreaView style={{flex:1}}>
        <HeaderApp navigation={navigation} homeFlag={false} title="PAY & FINISH" />
        <View style={{flex:1,backgroundColor:'yellow'}}>
        
         {
             html_code_state ? 
            <WebView
                originWhitelist={['*']}
                source={{ html: html_code }}
            />
            :
            <View style={{flex:1,backgroundColor:'white',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                <LottieView style={{height:350}} source={require('./../../../assets/loader/86253-visa-card.json')} autoPlay loop />
            </View>
         }
        
        </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({

})