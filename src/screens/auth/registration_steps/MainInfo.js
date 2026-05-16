import React from 'react';
import {ScrollView,Text, View,SafeAreaView,Image,Linking , KeyboardAvoidingView,Platform, Keyboard  ,TouchableWithoutFeedback, TouchableOpacity, Dimensions} from "react-native";
import AppButton from "../../../components/auth/Button";
import styles from '../style';
import AppInput from '../../../components/auth/Input';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {validate} from '../../../utils/Validate';
import Gtyles from '../../../styles/Gstyle';
import { btnColor, btnColorDark, countryCodeSize, domain, phonedirection, phoneLayout, textColor } from '../../../utils/app';
import { useTranslation } from 'react-i18next';
import { Card, Title, Paragraph, Checkbox } from 'react-native-paper';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
// import DropDownPicker from 'react-native-dropdown-picker';
import AuthHeader from '../../../shared/AuthHeader';
import i18next from 'i18next';
import PhoneInput from 'react-native-phone-number-input';
 

export default function RegisterScreen(){

    const navigation = useNavigation();

    const [isLoading,changeisLoading] = React.useState(false);
    const [name,changeName] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [phone,changePhone] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [password,changePassword] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [conpassword,changeconPassword] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [countryCode, setCountryCode] = React.useState("EG");
    const [invCode,setInvCode] = React.useState('');
    const [invitationState, setInvitationState] = React.useState('no');

    React.useEffect(() => {
        
    },[])
  

    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    


        const phoneFoundOrSendCodeHandler = () => {

            // alert((phone.isValid) ? formattedValue : 'not formated');
            // alert(value)
            // return 1;
            changeDone({status:false,isloading:true});
            if(name.value != '' && phone.isValid && password.value != '' && conpassword.isValid && conpassword.isValid){
                // console.warn(formattedValue)
                var config = {method: 'post',url: domain + '/api/validate-data',data:{phone: formattedValue}};
                axios(config).then(res => {
                    changeDone({status:true,isloading:false});
                navigation.navigate('EnterOTP',{
                        name:name.value,
                        phone:formattedValue,
                        password:password.value,
                        trigger_type:'register',
                        countrycode:countryCode,
                        invcode:invCode,
                });
        
                }).catch(err=>{
                    console.warn('error')
                    //  changePhone({incomeError: t('auth.errors.phone.used'),...phone}); 
                   changePhone({
                                value: formattedValue,
                               
                                touched: true,
                                incomeError:   t('auth.errors.phone.used'),
                            }); 
                })
            }else{
                
                changeDone({status:true,isloading:false});
                //User input is Empty .
                if(name.value == ''){
                    changeName({incomeError: t('auth.errors.name_req'),}); 
                    // return
                }
        
                if(phone.value == '' || !phone.isValid){
                    changePhone({incomeError: t('auth.errors.phone.req'),}); 
                    // return
                }

                if(password.value == ''){
                    changePassword({incomeError: t('auth.errors.password_req'),}); 
                    // return
                }
                 
                if(conpassword.value == '' || !conpassword.isValid ){
                    changeconPassword({incomeError: t('auth.errors.not_match'),}); 
                    return
                }

                return;  
            }
           
        }
    
    const updateName = NameVal => {
        changeName({
            value: NameVal,
            isValid: validate(NameVal,[{key:'minChars',num:11}]),
            touched:true,
            incomeError:''
        });
    }

    const updatePhone = phoneVal => { 
        changePhone({
            value: phoneVal,
            isValid: validate(phoneVal,[{key:'isPhone'},{key:'minChars',num:11}]),
            touched:true
        });
        // changephoneAlert({valueA:'Enter 11 digits',color:'red'});
    }
    const updatePassword = PasswordVal => {
        changePassword({
            value: PasswordVal,
            isValid: validate(PasswordVal,[{key:'minChars',num:11}]),
            touched:true
        });
    }


    const updateConPassword = con_PasswordVal => {
        changeconPassword({
            value: con_PasswordVal,
            isValid: (con_PasswordVal == password.value) ? true : false,
            touched:true,
            incomeError:''
        });
    }

    // دالة تنظيف الرقم لغير مصر
   const cleanPhoneForNonEgypt = (number) => {
  if (number.length > 1 && number.startsWith('0')) {
    return number.substring(1); // حذف الصفر الأول فقط
  }
  return number;
};

   const [value, setValue] = React.useState("");
const [formattedValue, setFormattedValue] = React.useState("");
const [inputKey, setInputKey] = React.useState(0); // ← لإعادة إنشاء الكمبوننت
    const phoneInput = React.useRef(null);
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


    const {t,i18n} = useTranslation();
    return (
    
    
        <SafeAreaView style={[styles.Wrapper]}>
             <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
            
          
            <AuthHeader text={t('auth.titles.main_info')} bar={0.1} />
             <View style={[styles.secondSection,{justifyContent:'space-between',paddingTop:30}]}>
                 
                    <View style={{width:'100%',flex:1}}>
                    <View style={[Gtyles.shadowFullCard,{margin:0,paddingVertical:12,marginBottom:10}]}>
                        <Text style={{fontSize:12,fontFamily:'Tajawal-Regular',lineHeight:18,color:textColor,textAlign:(i18next.language == 'ar') ? 'left' : 'right'}}>
                        {t('auth.registration_sen')}
                        </Text>
                    </View>
                    <AppInput traditionalInput={true} icon="person-outline" onChangeText={updateName} touchUser={phone.touched} isValid={name.isValid} span={t('auth.name')}  placeholder= {t('auth.name_ex_placeholder')} secureTextEntry={false} />
                    { (name.incomeError != '') &&
                    <Text style={styles.error}> {name.incomeError} </Text>
                    }
                    
                    {/* <AppInput isphoneKeyStyle={true} onChangeText={updatePhone} showVlidationfeedback touchUser={phone.touched} isValid={phone.isValid} span={t('auth.phone')}  placeholder={t('auth.phone')} secureTextEntry={false} keyboardType="numeric" /> */}
                    <View style={Gtyles.newPhoneWrapper}>
                    <View style={{flexDirection:'row'}}>
                        {/* <Text>{countryCode}</Text>  */}
                        {/* //good */}
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
                   
                    { (phone.incomeError != '') &&
                    <Text style={styles.error}> {phone.incomeError} </Text>
                    }


               
                    
                    <AppInput isphoneKeyStyle={false} onChangeText={updatePassword}   touchUser={password.touched} isValid={password.isValid} span={t('auth.password')}  placeholder={t('auth.password')} isPassword={true}  />
                    { (password.incomeError != '') &&
                    <Text style={styles.error}> {password.incomeError} </Text>
                    }

                    <AppInput isPassword={true} onChangeText={updateConPassword} touchUser={password.touched} isValid={password.isValid} span={t('auth.con_password')}  placeholder={t('auth.con_password')}  />
                    {
                    (conpassword.value != '' && conpassword.value != password.value) && 
                    <Text style={styles.error}> {conpassword.incomeError} </Text>
                    }
 


  <View style={{borderWidth:0.5,borderRadius:10,borderColor:btnColor,paddingVertical:12,marginBottom:10,}}>
                       <Text style={[styles.label,{marginHorizontal:15,fontSize:13,marginBottom:15,textAlign:'center'}]}>{t('invitation.ask')}</Text>
                        <View style={[{flexDirection:'row',justifyContent:'space-around'}]}>
                                <View style={styles.yesnocontainer}>
                                    <View style={styles.family_checkboxContainer}>
                                            <Checkbox.IOS
                                                color={btnColorDark}
                                                status={(invitationState == 'yes') ? 'checked' : 'unchecked'}
                                                onPress={() => {
                                                    setInvitationState('yes')
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.inviteyesno}>
                                        {t('invitation.yes')}
                                        </Text>
                                </View>
                                <View style={styles.yesnocontainer}>
                                    <View style={styles.family_checkboxContainer}>
                                            <Checkbox.IOS
                                                color={btnColorDark}
                                                status={(invitationState == 'no') ? 'checked' : 'unchecked'}
                                                onPress={() => {
                                                    setInvitationState('no')
                                                }}
                                            />
                                        </View>
                                        <Text style={styles.inviteyesno}>
                                        {t('invitation.no')}
                                        </Text>
                                </View>
                            </View> 

                            {
                                (invitationState == 'yes') &&
                                <View style={{paddingHorizontal:13,marginTop:10,backgroundColor:'white',borderRadius:5}}>
                                    <AppInput gift={true} traditionalInput={true} onChangeText={setInvCode} icon='gift-outline'   placeholder={t('invitation.enter') + ' ..'} secureTextEntry={false} keyboardType="numeric" />
                                    <Text style={[styles.error,{color: btnColor,fontFamily:'Tajawal-Bold',fontSize:12}]}> {t('invitation.des')} </Text>
                                     
                                </View>
                            }
                           
                       </View>

                        <View style={{alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                            <Text style={{fontFamily:'Tajawal-Medium',fontSize:14,textAlign:'center',color:textColor}}> {t('auth.accept_terms.p1')}  </Text>
                            <TouchableOpacity><Text onPress={() => navigation.navigate('TermsScreen')} style={{color:btnColor,fontFamily:'Tajawal-Medium',}}>{t('auth.accept_terms.p2')}</Text></TouchableOpacity>
                        </View>


                    </View>
                
                    <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',paddingHorizontal:0,backgroundColor:'transparent',width:'100%',marginTop:20}}>
                    <AppButton isLoading={donebtn.isloading} disabled={donebtn.isloading} title={t('next')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginBottom: 30,width:Dimensions.get('window').width * 0.7,maxWidth:300,alignSelf:'center'}]} onPressP={phoneFoundOrSendCodeHandler}/> 
                    </View>
             </View>
            
        </ScrollView>
         </KeyboardAvoidingView>
        </SafeAreaView>
        // </TouchableWithoutFeedback>
        // </KeyboardAvoidingView>
        
    );
} 