import { useIsFocused, useNavigation  } from "@react-navigation/native";
import React from "react";
import {View,Text,SafeAreaView,ScrollView , Image , Alert} from 'react-native';
import { Card, Paragraph, RadioButton, Title , Button } from "react-native-paper";
import { useDispatch , useSelector} from "react-redux";

import LottieView from 'lottie-react-native';

 

import axios from "axios";
import { useTranslation } from "react-i18next";
import Gtyles from "../../../styles/Gstyle";
import HeaderApp from "../../../shared/Header";
import { Done } from "../../../components/Done";
import { setUser } from "../../../redux/actions";
import { validate } from "../../../utils/Validate";
import AppInput from "../../../components/auth/Input";
import { domain, textColor } from "../../../utils/app";
import AppButton from "../../../components/auth/Button";

export default function EnterNewPhone({ route, navigation }){
     
    const {phone} = route.params;
    const dispatch = useDispatch();
    const focus = useIsFocused();
    const [response,changeResponse] = React.useState(null);
    React.useEffect(() => {
         
        if(focus == true){
            updateINFO(phone)
            }
       
    },[response,focus])


    const user = useSelector( state => state.auth.user);
    const tokenK = useSelector(state => state.auth.token); 
    const user_image = useSelector( state => state.auth.user_image);
     
    const {t,i18n} = useTranslation();
 
  
 
  
  const updateINFO = async(phone) => {
       
        var config = {method: 'put',url: domain + '/api/update-info',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{phone: phone}};
        axios(config).then(res => {
            if(res.data.text == 'updated'){
                dispatch(setUser(res.data.userData))
               
                changeResponse(true);
                 
            }
        });
    }


    

     
    const go_back = () => {
        
        navigation.goBack();
        // navigation.goBack(); 
      
    }
   

    return (
        <SafeAreaView style={{flex:1}}>
        
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
       
        <HeaderApp navigation={navigation} title={t('auth.updateAccount')} />
        

        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
             
        
          
            
            {
                (response == true) && 
                <View style={[Gtyles.shadowFullCard,{flex:1,justifyContent:'center',alignItems:'center',width:'100%'}]}>
            
                <LottieView style={{height:150}} source={require('../../../../assets/loader/done.json')} autoPlay />
                <Text style={{fontSize:18,fontFamily:'Tajawal-Bold',color:textColor,marginBottom:20}}>{t('changePhone.done')}</Text>
                <AppButton  title={t('confirm_location.done.btnBack')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 30,alignSelf:'center'}]} onPressP={go_back}  /> 
            </View>
            }
          {
                (response == false) && 
                <View style={[Gtyles.shadowFullCard,{flex:1,justifyContent:'center',alignItems:'center',width:'100%'}]}>
            
                {/* <LottieView style={{height:150}} source={require('./../../../../assets/loader/done.json')} autoPlay /> */}
                <Text style={{fontSize:18,fontFamily:'Tajawal-Bold',color:textColor,marginBottom:20}}>Not valid phone .. try later</Text>
                <AppButton  title={t('confirm_location.done.btnBack')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 30,alignSelf:'center'}]} onPressP={go_back}  /> 
            </View>
            }
            


        </View>
        
        </ScrollView>
        
        </SafeAreaView>
    );
}