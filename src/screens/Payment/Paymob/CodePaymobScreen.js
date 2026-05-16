import { View ,Text ,SafeAreaView , Image, StyleSheet ,ScrollView, Alert} from 'react-native'
import React from 'react'
import HeaderApp from '../../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Gtyles from '../../../styles/Gstyle';
import AppButton from '../../../components/auth/Button';
import { btnColorDark, FEES, PAYMOP_INTEGATION_ID_FOR_CARD, PAYMOP_INTEGATION_ID_FOR_REF_NUMBER } from '../../../utils/app';
import { CHANGE_PAYMOB_KOISK_AMOUNT, CHANGE_PAYMOB_PROCESSING, CLEAR_PAYMOB,  } from '../../../redux/actions/ActionTypes';
import LottieView from 'lottie-react-native';
import { Modal, Portal, Button, Provider, FAB , Card, Title, Paragraph} from 'react-native-paper';
import { useEffect } from 'react';
import { get_auth_token, get_last_big_token_to_do_action, get_order_id, get_ref_num } from '../../../redux/actions/payMobActionCreator';
import { arabic_num } from '../../../utils/HelperFunctions';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

export default function CodePaymobScreen({ route, navigation },props){

  

    const dispatch = useDispatch();
    const paymob_kiosk_amount = useSelector(state => state.paymob.kiosk_amount);
    const {t,i18n} = useTranslation();
    const token = useSelector(state => state.paymob.token);
    const token_state = useSelector(state => state.paymob.token_state);
    const amount_cents = useSelector(state => state.paymob.amount_cents);
    const order_id = useSelector(state => state.paymob.order_id);
    const order_id_state = useSelector(state => state.paymob.order_id_state);
    const paymentToken = useSelector(state => state.paymob.paymentToken);
    const paymentToken_state = useSelector(state => state.paymob.paymentToken_state);
    const ref_num = useSelector(state => state.paymob.ref_num);

    
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
            dispatch( get_ref_num());
        }
        

       

    }, [token_state,order_id_state,paymentToken_state])

  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView>
    <HeaderApp navigation={navigation} homeFlag={false} title="Add Credits" />
    
     
        <View style={{backgroundColor:'white',flex:1}}>
    
        <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/aman.png')} />
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/masary.jpg')} />
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/momkn.png')} />
        </View>
        
        <View style={[Gtyles.shadowFullCard,{paddingVertical:20}]}>
          <View style={styles.header_wrapper}> 
            <Text style={styles.header_text}>
            {t('wallet.code.res')}
            </Text>
          </View>
          <View style={{justifyContent:'center',alignItems:'center'}}>
              <LottieView style={{height:100,alignSelf:'center'}} source={require('./../../../../assets/loader/done.json')} autoPlay loop={true} />
              {/* <Text style={{fontSize:17,color:'black'}}>   </Text> */}
              <View style={{padding:10,backgroundColor:'#c5ffc4',borderRadius:5,marginVertical:15,borderWidth:2,borderColor:'#40a83e'}}>
                <Text style={{fontSize:21,color:'black',fontWeight:'bold'}}> {(ref_num) ? arabic_num(ref_num) : ''} </Text>
              </View>
              <View style={{marginBottom:10}}>

                <Text style={styles.infor_text}> {arabic_num(1)}  {t('wallet.code.steps.11')} </Text>
                <Text style={styles.infor_text}> {arabic_num(2)} . {t('wallet.code.steps.2')}  </Text>
                <Text style={styles.infor_text}> {arabic_num(3)} . {t('wallet.code.steps.3')}  </Text>
              </View>
              {/* <FAB style={{backgroundColor:btnColorDark,fontSize:25}} onPress={() => { navigation.goBack();navigation.goBack();navigation.goBack(); }} animated={true} label={t('wallet.code.steps.btn')} /> */}
              <TouchableOpacity style={styles.btn2} onPress={() => { navigation.goBack();navigation.goBack();navigation.goBack(); }}>
                <Text style={styles.btn2Text}>{t('wallet.pay_now')}</Text>
              </TouchableOpacity>
              </View>
           
        </View>

        
    </View>
    {
        !ref_num &&
        <View style={{flex:1,justifyContent:'center',alignItems:'center',position:'absolute',zIndex:999999,height:'100%',width:'100%'}}>
            <View style={{flex:1,backgroundColor:'white',position:'absolute',height:'100%',width:'100%',opacity:0.80}}>
            </View>
            <LottieView style={{height:350}} source={require('./../../../../assets/loader/koisk_pos.json')} autoPlay loop />
        </View>
    }
    
    
     
     
    
      
        

        
  
       
       
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
imagesm: {
    width:55,
    height:55,
    marginEnd:5,
    },
    imageWrapper:{
    marginTop:10,
    flexDirection:'row'
    },
    info_wrapper:{
        flexDirection:'row',
        marginVertical:5
    },
    info_text:{
      fontFamily:'Tajawal-Bold',
        fontSize:18,
        color:'black'
    },
    header_wrapper:{
    borderBottomColor:'#ddd',
    borderBottomWidth:2,
    paddingBottom:10,
    justifyContent:'center',
    // alignItems:'center',
    marginBottom:10
    },
    header_text:{
      fontFamily:'Tajawal-Bold',
    fontSize:18.6,
    color:'black'
    },
    infor_text:{
    fontSize:16,
    color:'black',
    marginBottom:5,
    fontFamily:'Tajawal-Bold',
    },
    btn2:{
    
      marginTop: 13,
      width:150,
      alignItems:'center',
      backgroundColor: btnColorDark,
      borderRadius:50,
      paddingVertical:12
    },
    btn2Text:{
     color:'white',
     fontFamily:'Tajawal-Regular',
      
    },
})