import { Dimensions, ImageBackground, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import PlatformTouchable from '../../components/PlatformTouchable'
import HeaderApp from '../../shared/Header'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import styles from './style'
import { btnColor, btnColorDark } from '../../utils/app'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import DynamicallySelectedPicker from 'react-native-dynamically-selected-picker';
import moment from 'moment-with-locales-es6';
import { Image } from 'react-native'
import Gtyles from '../../styles/Gstyle'
import AppButton from "../../components/auth/Button";
import { useSelector ,useDispatch } from 'react-redux'
import { SET_ORDER_SCHEDULING_TYPE, SET_ORDER_TYPE } from '../../redux/actions/ActionTypes'

export default function SchedChoosing() {
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
  
    

 

    const myorder = useSelector( state => state.order );
 
   const dispatch = useDispatch();
   
  return (

    <SafeAreaView style={{flex:1}}>
    <HeaderApp navigation={navigation} homeFlag={false} title={t('schedu.title')} />
   <View style={[styles.wrapper]}>
    {/* Gtyles.shadowFullCard, */}
       

       <View style={{flex:1}}>
        
       {/* <Ionicons style={{fontSize:18}} name='home' /> */}
     
  
       
       
        
       <Text style={styles.title}>- {t('schedu.t')} </Text>
        

     <PlatformTouchable onPress={() =>{
      dispatch({
        type: SET_ORDER_TYPE,
        payload: 'sch'
      })
      setTimeout(() => {
        navigation.navigate('Scheduling')
      }, 100);
     
     }}>
     <View style={[Gtyles.shadowFullCard,styles.clickableWrapperWhite]}>
            
            <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
               <Ionicons name='time-outline' style={styles.icon1} />
               <View style={{flex:1}}>
                 <Text style={[styles.t1,(i18n.language == 'ar') ? {textAlign:'left'}: {textAlign: 'right'}]}>{t('schedu.choose.sch.t1')}</Text>
                 <Text style={[styles.t1help,(i18n.language == 'ar') ? {textAlign:'left'}: {textAlign: 'right'}]}>{t('schedu.choose.sch.t1help')}</Text>
               </View>
            </View>
            
              {
                (myorder.type == 'sch') && 
                <Ionicons name='checkmark-done-outline' style={styles.check} />
              }
            
         </View>
     </PlatformTouchable>

     <PlatformTouchable onPress={() =>{
          dispatch({
              type: SET_ORDER_TYPE,
              payload: 'now'
            });
            dispatch({
              type: SET_ORDER_SCHEDULING_TYPE,
              payload:  null
          })   
            setTimeout(() => {
              navigation.navigate('RequestView')
            }, 100);
          }}>
          <View style={[Gtyles.shadowFullCard,styles.clickableWrapperWhite]}>
              
              <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                <Ionicons name='hand-right-outline' style={styles.icon1} />
                <View style={{flex:1}}>
                  <Text style={[styles.t1,(i18n.language == 'ar') ? {textAlign:'left'}: {textAlign: 'right'}]}>{t('schedu.choose.now.t1')}</Text>
                  <Text style={[styles.t1help,(i18n.language == 'ar') ? {textAlign:'left'}: {textAlign: 'right'}]}>{t('schedu.choose.now.t1help')}</Text>
                </View>
              </View>
                {
                  (myorder.type == 'now') && 
                  <Ionicons name='checkmark-done-outline' style={styles.check} />
                }                
          </View>
         </PlatformTouchable>

       </View>
    

            {/* </View>


<View style={[Gtyles.shadowFullCard,styles.wrapper]}> */}
       


 
         </View>


    </SafeAreaView>
  )
}

 