import { StyleSheet, Text, View , SafeAreaView , ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform , } from 'react-native'
import React from 'react'
import AuthHeader from '../../shared/AuthHeader';
import styles from './style';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppButton from '../../components/auth/Button';
import AppInput from '../../components/auth/Input';
import Gtyles from '../../styles/Gstyle';
import { btnColor, btnColorDark, countryCodeSize, domain, phonedirection, phoneLayout, textColor } from '../../utils/app';
import { validate } from '../../utils/Validate';
import axios from 'axios';
 import PhoneInput from "react-native-phone-number-input";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import i18next from 'i18next';
import { Checkbox } from 'react-native-paper';

export default function MissingSocialInfoScreen({ route, navigation },props) {

    
    const {userInfo,type} = route.params;
    const [isLoading,changeisLoading] = React.useState(false);
    const [name,changeName] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [phone,changePhone] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [appletoken,setAppleToken] = React.useState(null);
    const [email,changeEmail] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
    const [imageState,changeImage] = React.useState(null);
    const [countryCode, setCountryCode] = React.useState("EG");

    React.useEffect(() => {
        console.warn(userInfo?.email);
        setAppleToken(userInfo.identityToken);
        changeName({value:userInfo?.name,isValid:(userInfo.name) ? true : false })
        changePhone({value:userInfo?.phone,isValid:(userInfo.phone) ? true : false })
        changeEmail({value:(userInfo?.email == '' || userInfo?.email == null) ? 'apple@apple.apple' :userInfo?.email ,isValid:(userInfo.email) ? true : false })
        changeImage(userInfo?.photo)
    },[])

    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});


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

    const updateEmail = emailVal => { 
        
        // changephoneAlert({valueA:'Enter 11 digits',color:'red'});
    }

    const continueHandler = () => {
        if ((name.value == undefined || name.value == '') || (phone.value == undefined || phone.value == '')  || (email.value == undefined || email.value == '') || (!phone.isValid)) {
            // alert('no')
        } else {
            var config = {method: 'post',url: domain + '/api/validate-data',data:{phone: phone.value}};
            axios(config).then(res => {
                // console.warn(type + ' ' + appletoken);
                
                changeDone({status:true,isloading:false});
                navigation.navigate('EnterOTP',{
                    name:name.value,
                    phone:formattedValue,
                    email:email.value,
                    imageURL:imageState,
                    type:type,
                    appletoken:appletoken,
                    trigger_type:'sociallogin',
                    countrycode: countryCode,
                    invcode:invCode,
                });
    
            }).catch(err=>{
                changeDone({status:true,isloading:false});
                changePhone({incomeError: t('auth.errors.phone.used'),...phone}); 
            })
           
            
        }
    }
    const {t,i18n} = useTranslation();

     const [invCode,setInvCode] = React.useState('');
        const [invitationState, setInvitationState] = React.useState('no');

    const [value, setValue] = React.useState("");
    const [formattedValue, setFormattedValue] = React.useState("");
    const phoneInput = React.useRef(null);

      

    const handleFormattedValue = (text) => {
        // إزالة أي صفر في بداية الرقم المحلي بعد رمز الدولة
      const correctedNumber = text.replace(/(\+\d{1,3})0/, "$1");
      setFormattedValue(correctedNumber);
  };
  return (
    <SafeAreaView style={[styles.Wrapper]}>
        
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
    <ScrollView contentContainerStyle={{flexGrow: 1}} >

<AuthHeader text={t('auth.titles.main_info')} bar={0.5} />
     
     
    <View style={[styles.secondSection,{justifyContent:'space-between',paddingTop:30,alignItems:'center'}]}>
                 
                 <View style={{width:'100%'}}>
                 <View style={[Gtyles.shadowFullCard,{margin:0,paddingVertical:12,flexDirection:'row',overflow:'hidden',justifyContent:'center',alignItems:'center',paddingHorizontal:20}]}>
                    <Image source={require('./../../../assets/images/done.png')} style={{width:30,height:30,marginEnd:10}} />
                     <Text style={{fontSize:13,fontFamily:'Tajawal-Bold',lineHeight:18,color:textColor}}>
                     {t('missingInfo.sen')}
                     </Text>
                 </View>


{
    
    <Image style={{width:100,height:100,alignSelf:'center',borderWidth:2,borderColor:btnColor,borderRadius:50,marginTop:25,marginBottom:10}} source={(imageState != null) ? {uri:imageState} : require('../../../assets/images/placeholder.jpg')} />

}
                
               <View style={styles.missWrapper}>
               { (name.value != '' &&name.value != undefined) &&
                    <Image source={require('./../../../assets/images/done.png')} style={styles.doneFlagIMG} />
                    }
               <AppInput err={(name.value == '' || name.value == undefined)} traditionalInput={true} icon="person-outline" value={name.value}  onChangeText={updateName} touchUser={phone.touched} isValid={name.isValid} span={t('auth.name')}  placeholder= {t('auth.name_ex_placeholder')} secureTextEntry={false} />
                 { (name.value == '' || name.value == undefined) &&
                 <Text style={styles.error}> {t('missingInfo.err')} </Text>
                 }
               </View>
               <View style={styles.missWrapper}>
               
                    {/* <AppInput err={(phone.value == '' || phone.value == undefined)} isphoneKeyStyle={true}  value={phone.value}  onChangeText={updatePhone} showVlidationfeedback touchUser={phone.touched} isValid={phone.isValid} span={t('auth.phone')}  placeholder="01#########" secureTextEntry={false} keyboardType="numeric" /> */}
                    
                    <View style={Gtyles.newPhoneWrapper}>
                    <View style={{flexDirection:'row'}}>
                        <PhoneInput
                            ref={phoneInput}
                            defaultValue={value}
                            defaultCode="EG"
                            onChangeCountry={(country) => {
                                console.warn("Country Code:", country?.cca2); // يحصل على كود الدولة مثل "EG"
                                setCountryCode(country?.cca2); // حفظ كود الدولة في state
                              }}
                            layout={phoneLayout}
                            placeholder={t('auth.phone')}
                            direction={phonedirection}
                            containerStyle={{backgroundColor:'#f2f0f0',height:80,}}
                            textContainerStyle={{backgroundColor:'#f2f0f0'}}
                            codeTextStyle={{fontSize:countryCodeSize}}
                            textInputStyle={[Gtyles.newPhoneInputTextStyle,(i18next.language == 'ar') && {textAlign:'right'}]}
                            onChangeText={(text) => {
                                const checkValid = phoneInput.current?.isValidNumber(text);
                                
                                changePhone({value:text,isValid:(checkValid) ? checkValid : false});
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
                    { (phone.value == '' || phone.value == undefined) &&
                    <Text style={styles.error2}> {t('missingInfo.err')} </Text>
                    }

                    { (phone.incomeError != '') &&
                    <Text style={styles.error2}> {phone.incomeError} </Text>
                    }
                 </View>



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

                <View style={styles.missWrapper}>
                { (email.value != '' &&email.value != undefined) &&
                    <Image source={require('./../../../assets/images/done.png')} style={styles.doneFlagIMG} />
                    }
                    <AppInput disabled={true} err={(email.value == '' || email.value == undefined)} isphoneKeyStyle={true} value={email.value} onChangeText={updateEmail} showVlidationfeedback touchUser={email.touched} isValid={email.isValid} span={t('auth.email')}  placeholder="user@gmail.com" secureTextEntry={false} keyboardType='email-address' />
                    { (email.value == '' || email.value == undefined) &&
                    <Text style={styles.error}> {t('missingInfo.err')} </Text>
                    }
                </View>
                 

                      
                 </View>
             
                
                <AppButton isLoading={donebtn.isloading} disabled={ (name.value == undefined || name.value == '') || (phone.value == undefined || phone.value == '')  || (email.value == undefined || email.value == '') || (!phone.isValid) } title={t('next')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:200,alignSelf:'center'}]} onPressP={() => continueHandler()}/> 
                 
          </View>

    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

 