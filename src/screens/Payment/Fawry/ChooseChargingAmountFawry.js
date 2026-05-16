import { View ,Text ,SafeAreaView , StyleSheet , Image ,ScrollView, Alert} from 'react-native'
import { RadioButton } from 'react-native-paper';
import React from 'react'
import HeaderApp from '../../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Gtyles from '../../../styles/Gstyle';
import AppButton from '../../../components/auth/Button';
import { btnColorDark, textColor } from '../../../utils/app';
import { CHANGE_FAWRY_KOISK_AMOUNT, CHANGE_PAYMOB_KOISK_AMOUNT,  } from '../../../redux/actions/ActionTypes';
import LottieView from 'lottie-react-native';
import PlatformTouchable from '../../../components/PlatformTouchable';
import { arabic_num } from '../../../utils/HelperFunctions';
import { useTranslation } from 'react-i18next';



export default function ChooseChargingAmountFawry({ route, navigation },props){
    const {provider} = route.params;
    const dispatch = useDispatch();
    const fawry_koisk_amount = useSelector(state => state.fawry.kiosk_amount);
    const {t,i18n} = useTranslation();
    const initialArr = [
        100,200,400,600,1000,2000,3000,6000,10000,150000
      ];
     
      const fireNext = () => {
        if(fawry_koisk_amount == 0){
            return (
                Alert.alert('Amount Required','Please select amount you want to charge you wallet with')
            )
        }else{
            navigation.navigate('ConfirmInfoFawryScreen',{
                provider: provider,
            })
        }
        
      }
  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView>
    <HeaderApp navigation={navigation} homeFlag={false} title={t('wallet.amount.title')} />
    
    <View style={{backgroundColor:'white',flex:1}}>
    <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
         <Image style={{width:180,height:85,alignSelf:'center'}} source={require('./../../../../assets/images/payments/fawry-pay-english-logo-1.png')} />
    </View>
    <View style={[Gtyles.shadowFullCard]}>
        <View style={[Gtyles.MROW,{marginVertical:7}]}>
            
            <Text style={[Gtyles.h]}>
            {t('wallet.amount.des')}
            </Text>
        </View>
    {
      initialArr.map((val, key) => {
        return (
        <View key={key}>
        <PlatformTouchable onPress={() =>  dispatch({type:CHANGE_FAWRY_KOISK_AMOUNT,payload:val})}>   
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:9,paddingVertical:6,borderWidth:2,borderColor:'#ddd'}}>
            <RadioButton
                value={val}
                color={btnColorDark}
                status={ fawry_koisk_amount === val ? 'checked' : 'unchecked' }
                onPress={() =>  {
                    
                    dispatch({type:CHANGE_FAWRY_KOISK_AMOUNT,payload:val})
                }}
            />
            <Text style={{fontSize:17,marginStart:4,fontFamily:'Tajawal-Regular',color:textColor}}> 
                { arabic_num(val) } {t('cur')}
            </Text>
            <View style={{flexDirection:'row'}}>
                {
                    // kk(val)
                }
            </View>
        </View>
        </PlatformTouchable>
        {/* <View style={Gtyles.hr}/> */}
        </View>
        )
    })}

        
    </View>
</View>
<View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        {/* <AppButton  title="ADD NOTES" btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'white',color:btnColor,borderWidth:1,borderColor:btnColor}]} onPressP={() => console.log('')}/>  */}
        <AppButton disabled={(fawry_koisk_amount == 0 ? true : false)} title={t('wallet.amount.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,}]} onPressP={fireNext}/> 

        </View>
        {/* <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white',position:'absolute',zIndex:999999,height:'100%',width:'100%'}}>
        <LottieView style={{height:350}} source={require('./../../../../assets/loader/koisk_pos.json')} autoPlay loop />
        </View> */}
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})