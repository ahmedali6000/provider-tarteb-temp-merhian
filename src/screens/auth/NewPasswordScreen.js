import React from 'react';
import {ScrollView,Text, View,SafeAreaView,Image, Platform, KeyboardAvoidingView} from "react-native";
import AppButton from "../../components/auth/Button";
import styles from './style';
import AppInput from '../../components/auth/Input';
 
import {validate} from './../../../src/utils/Validate';
import Gtyles from '../../styles/Gstyle';
import { ALERT_TYPE, Dialog, Root, Toast } from 'react-native-alert-notification';
import { useDispatch , useSelector} from 'react-redux';
import {set_new_password} from '../../redux/actions/authActionCreator';
import { LOAD_OFF } from '../../redux/actions/ActionTypes';
 import { btnColor, textColor } from '../../utils/app';
import { useTranslation } from 'react-i18next';
 import AuthHeader from '../../shared/AuthHeader';
 

export default function NewPasswordScreen({ route, navigation },props){
    const {phone} = route.params;
    const {t,i18n} = useTranslation();
    React.useEffect(() => {
        dispatch({type: LOAD_OFF});
    },[]);
    const dispatch = useDispatch();
    const isLoading = useSelector( state => state.auth.isLoginingIn);
    const error = useSelector( state => state.auth.loginFailure);
    //not request to handle success because its happen auto .. but we we need errot effects
     
     
    
    const [newPassword,changenewPassword] = React.useState({value:'',isValid:false,touched:false});
    const [newConPassword,changenewConPassword] = React.useState({value:'',isValid:false,touched:false});
    const [phoneAlert,changephoneAlert] = React.useState({valueA:'##',color:'green'});
    
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    
    const [showalert,changeshowalert] = React.useState({ status:false,title:'',text:'',cancelText:'',confirmText:'',oncancel:null,onconfirm:null });
     
    
     
    const updateNewPassword = NewPasswordVal => {
        changenewPassword({
            value: NewPasswordVal,
            isValid: validate(NewPasswordVal,[{key:'minChars',num:3}]),
            touched:true
        });
    }
    
    const updateConPassword = ConNewPasswordVal => {
        changenewConPassword({
            value: ConNewPasswordVal,
            isValid: validate(ConNewPasswordVal,[{key:'minChars',num:3}]),
            touched:true
        });
    }
    const SubmitHandler = () => {
        
        if(phone && newPassword.value != '' && newPassword.value == newConPassword.value){
            // changeDone({status:false,isloading:true});
            dispatch(set_new_password(phone,newPassword.value));
        }else{
            changeDone({status:true,isloading:false});
            //User input is Empty .
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: t('auth.newPassword.alertTitle'),
                textBody: t('auth.newPassword.alertTXT'),
                button: t('auth.understood'),
            })
           
            return;  
        }
    }

    return (
        <Root>
        <SafeAreaView style={[styles.Wrapper]}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
             <AuthHeader text={t('auth.newPassword.title')} bar={0} />
           
                
             <View style={{ alignItems:"center"}}>
                <Image style={{ width:200,height:200,marginTop:80,}} source={require('../../../assets/images/newpass.png')} />
                <View  style={{ alignItems:"center"}}>
                    <Text style={{fontSize:20,color:textColor,fontFamily:'Tajawal-Medium'}}>
                        {t('auth.newPassword.title')}
                    </Text>
                    <Text style={{fontSize:17,textAlign:'center',lineHeight:28,marginTop:10,color:textColor,fontFamily:'Tajawal-Regular'}}>
                    {t('auth.newPassword.des')}
                    </Text>
                </View>
            </View>
            <View style={{flex:1,backgroundColor:'white',justifyContent:'space-around',alignItems:"center",paddingHorizontal:20}}>
                <View style={{width:'100%'}}>
                    <AppInput isphoneKeyStyle={false} onChangeText={updateNewPassword}   touchUser={newPassword.touched} isValid={newPassword.isValid} placeholder={t('auth.newPassword.newPassword')}  isPassword={true}  />
                    <AppInput isphoneKeyStyle={false} onChangeText={updateConPassword}   touchUser={newConPassword.touched} isValid={newConPassword.isValid} placeholder={t('auth.newPassword.conNewPassword')}   isPassword={true}  />
                </View>
                <AppButton disabled={!donebtn.status} isLoading={isLoading} title={t('auth.newPassword.btn')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:200 }]} onPressP={SubmitHandler}/> 
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
        </Root>
    );
} 