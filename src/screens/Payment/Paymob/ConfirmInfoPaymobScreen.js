import { View ,Text ,SafeAreaView , Image, StyleSheet ,ScrollView, Alert} from 'react-native'
import React from 'react'
import HeaderApp from '../../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Gtyles from '../../../styles/Gstyle';
import AppButton from '../../../components/auth/Button';
import { btnColorDark, FEES, PAYMOP_INTEGATION_ID_FOR_REF_NUMBER } from '../../../utils/app';
import { CHANGE_PAYMOB_KOISK_AMOUNT, CHANGE_PAYMOB_PROCESSING, CLEAR_PAYMOB,  } from '../../../redux/actions/ActionTypes';
import LottieView from 'lottie-react-native';
import { Modal, Portal, Button, Provider, FAB , Card, Title, Paragraph} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../../utils/HelperFunctions';

export default function ConfirmInfoPaymobScreen({ route, navigation },props){

  const {provider} = route.params;
  const user = useSelector(state => state.auth.user);
  const processing = useSelector(state => state.paymob.processing);
  const ref_num = useSelector(state => state.paymob.ref_num);
  const {t,i18n} = useTranslation();
  const dispatch = useDispatch();
  const paymob_kiosk_amount = useSelector(state => state.paymob.kiosk_amount);
    

  return (
    <SafeAreaView style={{flex:1}}>
    {/* <ScrollView> */}
    <HeaderApp navigation={navigation} homeFlag={false} title={t('wallet.amount.details')} />
    
     
        <View style={{backgroundColor:'white',flex:1}}>
    
        <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/aman.png')} />
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/masary.jpg')} />
            <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/momkn.png')} />
        </View>
        
        <View style={[Gtyles.shadowFullCard,{paddingVertical:20}]}>
          <View style={styles.header_wrapper}> 
            <Text style={styles.header_text}>
            {t('wallet.amount.details')}
            </Text>
          </View>
          <View style={styles.info_wrapper}> 
            <Text style={styles.info_text}>{t('auth.name')} :  {user?.name}</Text>
          </View>
          <View style={styles.info_wrapper}> 
            <Text style={styles.info_text}>{t('auth.phone')} : +2{user?.phone}</Text>
          </View>
          <View style={styles.info_wrapper}> 
            <Text style={styles.info_text}>{t('wallet.amount.extra.service_fees')} : {arabic_num(FEES)} {t('cur')} </Text>
          </View>
          <View style={styles.info_wrapper}> 
            <Text style={styles.info_text}>{t('wallet.amount.extra.total')} : {arabic_num(paymob_kiosk_amount + FEES)} {t('cur')} </Text>
          </View>
        </View>

        <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            <AppButton  title={t('wallet.amount.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'green'}]} onPressP={()=> navigation.navigate('CodePaymobScreen')}/> 
        </View>
    </View>
    
    
     
     
    
      
        

        

  
       
       
    {/* </ScrollView> */}
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
    fontFamily:'Tajawal-Regular'
    }
})