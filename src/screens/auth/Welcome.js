import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import Lottie from 'lottie-react-native';
import { btnColor, btnColorDark } from '../../utils/app';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native'
import Gtyles from '../../styles/Gstyle';
import AppButton from '../../components/auth/Button';
import NotificationWarning from '../../components/NotificationPermissionError';
import AppText from '../../shared/AppText';

export default function Welcome() {
  const { width } = Dimensions.get('window');
  const {t,i18n} = useTranslation();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 16,
    },
    title: {
      fontSize: 16,
      
      color: btnColorDark,
      textAlign: 'center',
      marginBottom: 20,
      // borderWidth:1.5,
      // borderColor:btnColorDark,
      // paddingVertical:12,
      // paddingHorizontal:22,
      // borderRadius:8,
      
    },
    lottie: {
      width: width * 0.95,
      height: width * 0.6,
      marginVertical:50,
    },
    buttonsContainer: {
    //  height:50,
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
     
      marginTop: 20,
      
    },
 
  });

  
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
     
        
      <View style={styles.container}>

       
      {/* العنوان */}
        <Image source={require('./../../../assets/images/logo_t.png')} style={{width:76,height:80,marginBottom:6}} />
      <AppText style={styles.title}>{t('welcome.title')}</AppText>
      {/* <View style={{marginTop:20}}> */}
        <NotificationWarning />
      {/* </View> */}
      {/* Lottie Animation */}
      <Lottie
       source={require('./../../../assets/loader/home_assets.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />

      {/* الأزرار */}
      <View style={styles.buttonsContainer}>
      <AppButton title={t('welcome.btn1')} primary={true} style={[Gtyles.button, Gtyles.primaryButton,{width:Dimensions.get('window').width * 0.4,}]} onPressP={() => {navigation.navigate('LoginScreen')}} /> 
      <AppButton title={t('welcome.btn2')} primary={false} style={[Gtyles.button, Gtyles.secondaryButton,{flexGrow: 1,width:Dimensions.get('window').width * 0.4,}]} onPressP={() => {navigation.navigate('RegisterScreen')}} /> 

        {/* <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <AppText style={styles.primaryButtonText}>{t('welcome.btn1')}</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <AppText style={styles.secondaryButtonText}>{t('welcome.btn2')}</AppText>
        </TouchableOpacity> */}
      </View>
    </View>
    </SafeAreaView>
    
  );
};

 

