import { useNavigation  } from "@react-navigation/native";
import React from "react";
import {View,Text,SafeAreaView,ScrollView , Image} from 'react-native';
import ImageLoad from "react-native-image-placeholder";
import { Card, Paragraph, RadioButton, Title } from "react-native-paper";
import { useDispatch , useSelector} from "react-redux";
import HeaderApp from '../../shared/Header'
import Gtyles from "../../styles/Gstyle";
import styles from "./style";
import { btnColorDark, Language_KEY } from "../../utils/app";
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

export default function ChangeLanguage(){
   
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    const [val , changeVal] = React.useState('en')
    
    const changeLang = (lang) => {
        AsyncStorage.setItem(Language_KEY,lang);
        i18n.changeLanguage(lang)
        setTimeout(() => {
            RNRestart.Restart();
        }, 500);
        
      }
    return (
        <SafeAreaView style={{backgroundColor:'white',flex:1}}>
        
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
        <Root>
        <HeaderApp navigation={navigation} homeFlag={false} title={t('drawer.language')} />
        <View style={{flex:1}}>
             
              
              <Image style={{alignSelf:'center',marginVertical:20,height:120,width:120}} source={require('./../../../assets/images/icons/language.png')} />
    
            <View style={styles.laguageWrapper}>
                <Text style={styles.label}>Change app to :</Text>
                <View style={styles.text_container}>
                <Image style={{alignSelf:'center',height:30,width:30}} source={require('./../../../assets/images/icons/united-kingdom.png')} />
                 <Text style={styles.text_under_label}>
                    English
                 </Text>
                 <View style={{position:'absolute',end:0}}>
                 <RadioButton
                        value={val}
                        color={btnColorDark}
                        status={ i18n.language === 'en' ? 'checked' : 'unchecked' }
                        onPress={() =>  {
                            changeLang('en')
                    }}
                    />
                 </View>
                
                </View>
            </View>
            <View style={styles.laguageWrapper}>
                <Text style={styles.label}>Change app to :</Text>
                <View style={styles.text_container}>
                <Image style={{alignSelf:'center',height:30,width:30}} source={require('./../../../assets/images/icons/egypt.png')} />
                 <Text style={styles.text_under_label}>
                    العربية
                 </Text>
                 <View style={{position:'absolute',end:0}}>
                 <RadioButton
                        value={val}
                        color={btnColorDark}
                        status={ i18n.language === 'ar' ? 'checked' : 'unchecked' }
                        onPress={() =>  {
                            changeLang('ar')

                    }}
                    />
                 </View>
                
                </View>
            </View>

            {/* <AppButton title="Sign Out" btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginBottom: 25,marginTop:10,alignSelf:'center'}]}  />  */}

        </View>
        </Root>
        </ScrollView>
        </SafeAreaView>
    );
}