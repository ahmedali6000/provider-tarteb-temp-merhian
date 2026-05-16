import { View ,Text ,SafeAreaView , StyleSheet , Image ,ScrollView, Alert} from 'react-native'
import { RadioButton } from 'react-native-paper';
import React from 'react'
import HeaderApp from '../../../shared/Header'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Gtyles from '../../../styles/Gstyle';
import AppButton from '../../../components/auth/Button';
import { btnColorDark } from '../../../utils/app';
import { CHANGE_PAYMOB_KOISK_AMOUNT  } from '../../../redux/actions/ActionTypes';
import LottieView from 'lottie-react-native';
import PlatformTouchable from '../../../components/PlatformTouchable';
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../../utils/HelperFunctions';



export default function ChooseChargingAmountPaymob({ route, navigation },props){
    const {provider} = route.params;
    const dispatch = useDispatch();
    const paymob_kiosk_amount = useSelector(state => state.paymob.kiosk_amount);
    const {t,i18n} = useTranslation();
    const initialArr = [
        100,200,400,600,1000,2000,3000,6000,10000,150000
    ];
     
      const fireNext = () => {
        if(paymob_kiosk_amount == 0){
            return (
                Alert.alert('Amount Required','Please select amount you want to charge you wallet with')
            )
        }else{
            navigation.navigate('ConfirmInfoPaymobScreen',{
                provider: provider,
            })
        }
        
      }
  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView>
    <HeaderApp navigation={navigation} homeFlag={false} title= {t('wallet.amount.title')} />
    
    <View style={{backgroundColor:'white',flex:1}}>
    <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
        <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/aman.png')} />
        <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/masary.jpg')} />
        <Image style={styles.imagesm} source={require('./../../../../assets/images/payments/momkn.png')} />
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
        <PlatformTouchable onPress={() => dispatch({type:CHANGE_PAYMOB_KOISK_AMOUNT,payload:val})}>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:9,paddingVertical:6,borderWidth:2,borderColor:'#ddd'}}>
            <RadioButton
                value={val}
                color={btnColorDark}
                status={ paymob_kiosk_amount === val ? 'checked' : 'unchecked' }
                onPress={() =>  {
                    
                    dispatch({type:CHANGE_PAYMOB_KOISK_AMOUNT,payload:val})
                }}
            />
           
                <Text style={{fontSize:17,marginStart:4,fontFamily:'Tajawal-Regular'}}> 
                { arabic_num(val) } {t('cur')}
                </Text>
            
           
             
        </View>
        </PlatformTouchable>
        </View>
        )
    })}

        
    </View>
</View>
    <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <AppButton disabled={(paymob_kiosk_amount == 0 ? true : false)} title={t('wallet.amount.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,}]} onPressP={fireNext}/> 
    </View>
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    image: {
        width:50,
        height:50,
        marginEnd:5,
      },
      imagesm: {
        width:55,
        height:55,
        marginEnd:5,
      },
      imageWrapper:{
        marginTop:10,
        flexDirection:'row'
      },  
})