import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
    View,
    Text, 
  } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useDispatch, useSelector } from 'react-redux';
import PlatformTouchable from '../components/PlatformTouchable';
import { btnColor, Language_KEY } from '../utils/app';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from 'react-native-paper';

export default function AuthHeader(props){
   
    const {t,i18n} = useTranslation();
    const tokenK = useSelector(state => state.auth.token);
    const working_status = useSelector( state => state.auth.working_status);
    const dispatch = useDispatch();
    const {bar , text} = props;
    const changeLang = (lang) => {
        AsyncStorage.setItem(Language_KEY,lang);
        i18n.changeLanguage(lang)
        setTimeout(() => {
            RNRestart.Restart();
        }, 500);
        
      }
       
      const navigation = useNavigation();
      return (
        <View style={styles.wrapper}> 
          <View style={styles.wrapperSon}>
            <PlatformTouchable onPress={() => { navigation.goBack(); }}>
                <Ionicons style={styles.back_icon} name={(i18n.language == 'ar') ? "arrow-forward-outline" : "arrow-back-outline" } />
                </PlatformTouchable>

                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Ionicons name="shield-checkmark" style={styles.center_icon} />
                    <Text style={styles.text_center}>
                        {text}
                    </Text>
                </View>

            
                <PlatformTouchable onPress={() => changeLang((i18n.language == 'en') ? 'ar' : 'en')}>
                    <Text style={styles.lang}>
                        {(i18n.language == 'en') ? 'عربي' : 'English'}
                    </Text>
                </PlatformTouchable>
          </View>
          
            {/* <ProgressBar style={{width:'50%',height:6,alignSelf:'center',marginVertical:10,}} progress={bar} color={btnColor} /> */}
            
        
        </View>
        
    );
  }
  
  const styles = StyleSheet.create({
    wrapper:{
        backgroundColor:'white',
        borderColor:btnColor,
        paddingVertical:15,
        paddingHorizontal:15,
        borderWidth:0.2,
        // borderRadius:5
    },
    wrapperSon:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
       
    },
    wrapperSon2:{
        flexDirection:'row',
    },
    center_icon:{
        fontSize:22,
        color:btnColor,
        color:btnColor,
        borderRadius:20,
        marginEnd:8
    },
    text_center:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        paddingTop:5,
        fontSize:14.5,
        color:btnColor,
        fontFamily:'Tajawal-Medium',
    },
    back_icon:{
        color:btnColor,
        fontSize:25,
    },
    lang:{
        color:btnColor,
        fontFamily:'Tajawal-Medium',
        fontSize:15
    }
  })