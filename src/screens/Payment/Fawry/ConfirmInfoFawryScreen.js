import { View ,Text ,SafeAreaView , Image, StyleSheet ,ScrollView, Alert, TouchableOpacity} from 'react-native'
import React from 'react'
import HeaderApp from '../../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Gtyles from '../../../styles/Gstyle';
import AppButton from '../../../components/auth/Button';
import { btnColor, btnColorDark, FEES, textColor } from '../../../utils/app';
import { CHANGE_FAWRY_KOISK_AMOUNT, CHANGE_FAWRY_PROCESSING, CHANGE_PAYMOB_KOISK_AMOUNT, CLEAR_FAWRY_REF_NUM, SET_FAWRY_REF_NUM,  } from '../../../redux/actions/ActionTypes';
import LottieView from 'lottie-react-native';
import { Connect_fawry } from '../../../redux/actions/FawryActionCreator';
import { Modal, Portal, Button, Provider, FAB , Card, Title, Paragraph} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../../utils/HelperFunctions';

export default function ConfirmInfoFawryScreen({ route, navigation },props){
  const {t,i18n} = useTranslation();
  
  const user = useSelector(state => state.auth.user);
  const processing = useSelector(state => state.fawry.processing);
  const ref_num = useSelector(state => state.fawry.ref_num);;

  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};
  
    const dispatch = useDispatch();
    const fawry_koisk_amount = useSelector(state => state.fawry.kiosk_amount);
    const start_connectFawryNOW = () => {
      dispatch({type:CHANGE_FAWRY_PROCESSING,payload:true})
      dispatch(Connect_fawry());
      
    }

  return (
    <SafeAreaView style={{flex:1}}>
    {/* <ScrollView> */}
    <HeaderApp navigation={navigation} homeFlag={false} title={t('wallet.amount.details')} />
    
    {
      (fawry_koisk_amount > 0) ? 
      <View style={{backgroundColor:'white',flex:1}}>
 
        <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
            <Image style={{width:150,height:75,alignSelf:'center',resizeMode:'contain'}} source={require('./../../../../assets/images/payments/fawry-pay-english-logo-1.png')} />
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
            <Text style={styles.info_text}>{t('wallet.amount.extra.total')} : {fawry_koisk_amount} {t('cur')} </Text>
          </View>
        </View>

        <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            <AppButton  title={t('wallet.amount.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'green'}]} onPressP={start_connectFawryNOW}/> 
        </View>
    </View>
    :
    
    <View>
       
    </View>
    }
    
      
        

        <Provider  >
          <Portal>
            <Modal visible={(ref_num != null) ? true : false} onDismiss={hideModal} contentContainerStyle={containerStyle}>
              <View style={{justifyContent:'center',alignItems:'center'}}>
              <LottieView style={{height:100,width:100,alignSelf:'center'}} source={require('./../../../../assets/loader/done.json')} autoPlay   />
              <Text style={{fontSize:17,color:'black',fontFamily:'Tajawal-Regular'}}> {t('wallet.code.res')}  </Text>
              <View style={{padding:10,backgroundColor:'#c5ffc4',borderRadius:5,marginVertical:15,borderWidth:2,borderColor:'#40a83e'}}>
                <Text style={{fontSize:21,color:'black',fontFamily:'Tajawal-Regular'}}> {(ref_num) ? ref_num : ''} </Text>
              </View>
              <View style={{marginBottom:10}}>

                <Text style={styles.infor_text}> {arabic_num(1)} . {t('wallet.code.steps.1')}  </Text>
                <Text style={styles.infor_text}> {arabic_num(2)} . {t('wallet.code.steps.2')}  </Text>
                <Text style={styles.infor_text}> {arabic_num(3)} . {t('wallet.code.steps.3')}  </Text>
              </View>
              
              <TouchableOpacity style={styles.btn2} onPress={() => { dispatch({type:SET_FAWRY_REF_NUM,payload:null}) }}>
                <Text style={styles.btn2Text}>{t('wallet.pay_now')}</Text>
              </TouchableOpacity>
              </View>
            </Modal>
          </Portal>
            
        </Provider>

 
        {
          processing &&
          <View style={{flex:1,justifyContent:'center',alignItems:'center',position:'absolute',zIndex:999999,height:'100%',width:'100%'}}>
          <View style={{flex:1,backgroundColor:'white',position:'absolute',height:'100%',width:'100%',opacity:0.80}}>
          </View>
          <LottieView style={{height:350,width:350}} source={require('./../../../../assets/loader/koisk_pos.json')} autoPlay loop />
         
          </View>
        }
       
       
    {/* </ScrollView> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  info_wrapper:{
    flexDirection:'row',
    marginVertical:5
},
info_text:{
  fontFamily:'Tajawal-Bold',
    fontSize:16,
    color:textColor
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
  color: btnColor
},
infor_text:{
  fontSize:16,
  color:'black',
  marginBottom:5,
  fontFamily:'Tajawal-Regular'
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