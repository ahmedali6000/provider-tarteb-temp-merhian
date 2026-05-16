import React from "react"
import {View, Text ,SafeAreaView , ScrollView , Image} from 'react-native'
import { moreHady, btnColor, backgroundColorHady, domain, textColor } from "../../../utils/app";
 
import {Paragraph, Title} from 'react-native-paper'
 
import { ALERT_TYPE, Dialog, Root, Toast } from 'react-native-alert-notification';
import { useDispatch , useSelector} from 'react-redux';
import axios from 'axios';
 
import { useTranslation } from "react-i18next";

import Gtyles from "../../../styles/Gstyle";
import AppButton from "../../../components/auth/Button";
import AppInput from "../../../components/auth/Input";
import styles from "../style";
import BackArraw from "../../../components/BackArraw";
import { validate } from "../../../utils/Validate";
import HeaderApp from "../../../shared/Header";
 
export default function ChangePhone(props){
    React.useEffect(() => {
        
    },[]);
    const dispatch = useDispatch();
    const isLoading = useSelector( state => state.auth.isLoginingIn);
    const {t,i18n} = useTranslation();
    const error = useSelector( state => state.auth.loginFailure);
    const {navigation} =  props;
    //not request to handle success because its happen auto .. but we we need errot effects
    const [phoneAlert,changephoneAlert] = React.useState({valueA:'##',color:'green'});
    
    const [phone,changePhone] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    
      
    
    const updatePhone = phoneVal => { 
        changePhone({
            value: phoneVal,
            isValid: validate(phoneVal,[{key:'isPhone'},{key:'minChars',num:11}]),
            touched:true
        });
        changephoneAlert({valueA:'Enter 11 digits',color:'red'});
    }
    
    
    const phoneFoundOrSendCodeHandler = () => {
       
        if(phone.isValid){
            changeDone({status:false,isloading:true});
            var config = {method: 'post',url: domain + '/api/check-phone',data:{phone: phone.value}};
            axios(config).then(res => {
              
                changeDone({status:true,isloading:false});
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: t('changePhone.err.title'),
                    textBody: t('changePhone.err.des'),
                    button: t('ok'),
                })
                
            }).catch(err=>{
                changeDone({status:true,isloading:false});
                    if(err.response.status == 422 ){
                        navigation.navigate('EnterOTP',{
                            name:null,
                            phone:phone.value,
                            password:null,
                            trigger_type:'phoneChange'
                    });
                }else{
                    alert('Network error')
                }
                
                // changePhone({value:'',incomeError: 'This phone is not found before'});
            })
        }else{
            
            changeDone({status:true,isloading:false});
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: t('auth.emptyAlertTitle'),
                textBody: t('auth.emptyAlertTXT'),
                button: t('auth.understood'),
            })
            
            return;  
        }
    }

    return (
        <Root>
        <SafeAreaView style={[styles.Wrapper,{flex:1}]}>
            <ScrollView contentContainerStyle={{flexGrow: 1}} style={{backgroundColor:backgroundColorHady}}>
            <HeaderApp title={t('myaccount.title')}  />
            {/* <View style={{flex:1,justifyContent:'center',alignItems:'center'}}> */}
                
                <View style={{flex:1,backgroundColor:'white',justifyContent:'space-evenly',alignItems:"center",paddingHorizontal:25}}>
                <View style={{ alignItems:"center",}}>
                    <Image style={styles.lock} source={require('../../../../assets/images/icons/smartphone.png')} />
                </View>
                    <View  style={{ alignItems:"center",paddingHorizontal:20}}>
                        <Title style={{fontSize:23,fontWeight:'600',fontFamily:'Tajawal-Medium',color: textColor}}>
                            {t('changePhone.title')}
                        </Title>
                        <Paragraph style={{fontSize:17,textAlign:'center',lineHeight:28,marginTop:10,fontFamily:'Tajawal-Medium',color: textColor}}>
                        {t('changePhone.des')}
                        </Paragraph>
                    </View>
                    {/* { (phone.incomeError != '') &&
                    <Paragraph style={{fontSize:15,textAlign:'center',fontWeight:'bold',color:'red'}}> 
                        {phone.incomeError} 
                    </Paragraph>
                    } */}
                    <AppInput isphoneKeyStyle={true} onChangeText={updatePhone} showVlidationfeedback touchUser={phone.touched} isValid={phone.isValid} span={t('auth.phone')}  placeholder="01#########" secureTextEntry={false} keyboardType="numeric" />

                    

                    <AppButton disabled={!donebtn.status} isLoading={isLoading} title={t('auth.sendCode')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,}]} onPressP={phoneFoundOrSendCodeHandler}/> 


                </View>
            {/* </View> */}
            </ScrollView>
        </SafeAreaView>
        </Root>
    );
}