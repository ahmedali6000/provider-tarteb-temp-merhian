import React from "react"
import {View, Text ,SafeAreaView , ScrollView , Image, Dimensions, KeyboardAvoidingView, Platform} from 'react-native'
import { moreHady, btnColor, backgroundColorHady, domain, textColor, phoneLayout, phonedirection, countryCodeSize } from "../../utils/app";
import styles from "./style";
import {Paragraph, Title} from 'react-native-paper'
import AppInput from "../../components/auth/Input";
import AppButton from "../../components/auth/Button";
import Gtyles from "../../styles/Gstyle";
import { ALERT_TYPE, Dialog, Root, Toast } from 'react-native-alert-notification';
import { useDispatch , useSelector} from 'react-redux';
import { LOAD_OFF } from '../../redux/actions/ActionTypes';
import axios from 'axios';
import {validate} from './../../../src/utils/Validate';
import { useTranslation } from "react-i18next";
import AuthHeader from "../../shared/AuthHeader";
import PhoneInput from "react-native-phone-number-input";
import i18next from "i18next";
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function EnterPhone(props){
    React.useEffect(() => {
        dispatch({type: LOAD_OFF});
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
            var config = {method: 'post',url: domain + '/api/check-phone',data:{phone: formattedValue}};
            axios(config).then(res => {
              
              navigation.navigate('EnterOTP',{
                    name:null,
                    phone:formattedValue,
                    password:null,
                    trigger_type:'phoneValidation'
            });
                
            }).catch(err=>{
                changeDone({status:true,isloading:false});
                Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: t('auth.phoneNotFoundAlertTitle'),
                    textBody: t('auth.phoneNotFoundAlertTXT'),
                    button: t('auth.tryagain'),
                })
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
    const [value, setValue] = React.useState("");
    const [formattedValue, setFormattedValue] = React.useState("");
    const phoneInput = React.useRef(null);
    const [inputKey, setInputKey] = React.useState(0); // ← لإعادة إنشاء الكمبوننت
    const [countryCode, setCountryCode] = React.useState("EG");

    const handleFormattedValue = (text) => {
        let corrected = text;

        if (text.startsWith('+20')) {
            let national = text.replace('+20', '');
            national = national.replace(/^0+/, ''); // remove leading 0s
            national = '0' + national; // ensure only one 0
            corrected = '+2' + national;
        }

        setFormattedValue(corrected);
        console.warn('🚀 رقم الهاتف المصحح:', corrected);
    };

    return (
        <Root>
        <SafeAreaView style={[styles.Wrapper,{}]}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
            <ScrollView contentContainerStyle={{flexGrow: 1}} style={{backgroundColor:'white'}}>
            <AuthHeader text={t('auth.forget_pass')} bar={0} />
            <View style={{ alignItems:"center"}}>
                <Image style={styles.lock} source={require('../../../assets/images/phone.png')} />
            </View>
            <View style={{flex:7,backgroundColor:'transparent',justifyContent:'space-around',alignItems:"center",paddingHorizontal:20}}>
                <View  style={{ alignItems:"center"}}>
                    <Title style={{fontSize:20,color:textColor,fontFamily:'Tajawal-Medium'}}>
                        {t('auth.forget_pass')}
                    </Title>
                    <Paragraph style={{fontSize:17,textAlign:'center',lineHeight:28,marginTop:10,color:textColor,fontFamily:'Tajawal-Regular'}}>
                    {t('auth.forget_pass_des')}
                    </Paragraph>
                </View>
             
                {/* <AppInput isphoneKeyStyle={true} onChangeText={updatePhone} showVlidationfeedback touchUser={phone.touched} isValid={phone.isValid} span={t('auth.phone')}  placeholder="01#########" secureTextEntry={false} keyboardType="numeric" /> */}
                <View style={Gtyles.newPhoneWrapper}>
                    <View style={{flexDirection:'row'}}>
                         <PhoneInput
                                key={inputKey} // ← هذا يجبر إعادة الرسم لما inputKey يتغير
                                ref={phoneInput}
                                defaultValue={value}
                                value={value}
                                defaultCode={countryCode}
                                onChangeCountry={(country) => {
                                    setCountryCode(country?.cca2);
                                }}
                                layout={phoneLayout}
                                placeholder={t('auth.phone')}
                                direction={phonedirection}
                                containerStyle={{ backgroundColor: '#f2f0f0', height: 80 }}
                                textContainerStyle={{ backgroundColor: '#f2f0f0' }}
                                codeTextStyle={{ fontSize: countryCodeSize }}
                                textInputStyle={[
                                    Gtyles.newPhoneInputTextStyle,
                                    (i18next.language === 'ar') && { textAlign: 'right' }
                                ]}
                                onChangeText={(text) => {
                                let raw = text.replace(/\D/g, ''); // حذف الرموز غير الرقمية
                                let validateRaw = raw;

                                if (countryCode !== 'EG' && raw.startsWith('0')) {
                                    // حذف الصفر لو الدولة غير مصر
                                    raw = raw.substring(1);
                                    setTimeout(() => {
                                        alert('لا تبدأ الرقم بصفر .. ')
                                    setValue(raw);
                                    setInputKey(prev => prev + 1);
                                    }, 0);
                                } else {
                                    setValue(raw);
                                }

                                // ===== التحقق من الصحة =====
                                let isValid = false;
                                if (countryCode === 'EG') {
                                    // نضيف صفر للتحقق فقط إذا لم يبدأ بصفر
                                    if (!raw.startsWith('0') && raw.length === 10) {
                                    validateRaw = '0' + raw;
                                    }
                                    isValid = /^01[0-2,5]\d{8}$/.test(validateRaw);
                                } else if (countryCode === 'AE') {
                                    isValid = /^5[0-9]{8}$/.test(raw);
                                } else {
                                    isValid = phoneInput.current?.isValidNumber(text) ?? false;
                                }

                                changePhone({
                                    value: raw,
                                    isValid,
                                    touched: true,
                                    incomeError: isValid ? '' : 'رقم الهاتف غير صحيح',
                                });

                                // ===== تحويل الرقم لدولي =====
                                let international = '';
                                if (countryCode === 'EG' && validateRaw.length === 11) {
                                    international = '+20' + validateRaw.slice(1);
                                } else if (countryCode === 'AE' && raw.length === 9) {
                                    international = '+971' + raw;
                                } else {
                                    const formatted = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
                                    international = formatted?.formattedNumber || '';
                                }

                                setFormattedValue(international);
                                }}

                                onChangeFormattedText={handleFormattedValue}
                                />

                            {(phone.value != '')  &&  (
                            <View style={{padding:6,flexDirection:'column',justifyContent:'center',position:'absolute',zIndex:555555,end:'4%',alignSelf:'center'}}>
                                <Ionicons name={phone.isValid ? 'checkmark-circle-outline' : 'alert-circle-outline'} style={[{fontSize:20,fontWeight:'bold',color:btnColor},{color: phone.isValid ? 'green' : 'red'}]} />
                            </View>
                        )} 
                    </View>
                </View>
                

                <AppButton disabled={!donebtn.status} isLoading={isLoading} title={t('auth.sendCode')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:Dimensions.get('window').width * 0.7}]} onPressP={phoneFoundOrSendCodeHandler}/> 


            </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        </Root>
    );
}