import { View, Text ,SafeAreaView, Image} from 'react-native'
import React from 'react'
import HeaderApp from '../../shared/Header';
import { useNavigation } from '@react-navigation/native';
import Gtyles from '../../styles/Gstyle';
 
import AppButton from '../../components/auth/Button';
import PlatformTouchable from '../../components/PlatformTouchable';
import { backgroundColorHady, btnColor, btnColorDark, moreHady } from '../../utils/app';
import styles from './style';
 import LottieView from 'lottie-react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

export default function OrderQRScreen({ route, navigation },props) {
     
    const {order_id} = route.params;
    const {t,i18n} = useTranslation();
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
    <HeaderApp navigation={navigation} homeFlag={false} title={t('order.screen.correct_order')} />

        
 <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
 <Card style={{marginHorizontal:0,marginTop:10,width:280,height:280,alignItems:'center',justifyContent:'center'}}>
     <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
     <QRCode
        value={(order_id+2049)+''}
         size={200}
         style={{backgroundColor:'white'}}
         
        //  logo={{uri: 'https://tarteb.app/assets/images/favicon.png'}}
        // logoSize={50}
        // logoBackgroundColor='white'
      />
     </View>
  
     
  </Card>
  </View>    
 
    <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            
            
            <AppButton  title={t('order.screen.go_back')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'white',color:btnColor,borderWidth:1,borderColor:btnColor}]} onPressP={() => navigation.goBack()}/> 
    </View>
</SafeAreaView>
    
  )
}
