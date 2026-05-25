import { useNavigation  } from "@react-navigation/native";
import React from "react";
import {View,Text,SafeAreaView,ScrollView , Image , Alert} from 'react-native';
import ImageLoad from "react-native-image-placeholder";
import { Card, Paragraph, RadioButton, Title , Button } from "react-native-paper";
import { useDispatch , useSelector} from "react-redux";
import HeaderApp from '../../shared/Header'
import Gtyles from "../../styles/Gstyle";
import styles from "./style";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { cutLongText } from "../../utils/HelperFunctions";
import AppButton from "../../components/auth/Button";
import { backgroundColorHadytop, btnColor, btnColorDark, domain, secondColor } from "../../utils/app";
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import AppInput from "../../components/auth/Input";
import { validate } from "../../utils/Validate";
import { setUser, updateInfo } from "../../redux/actions";
import { Done } from "../../components/Done";
import axios from "axios";
import PlatformTouchable from "../../components/PlatformTouchable";
import { UPLOAD_IMAGE_REG } from "../../redux/actions/ActionTypes";
import { useTranslation } from "react-i18next";
import ImagePicker from 'react-native-image-crop-picker';

export default function EditAccountDataScreen(){
    const navigation = useNavigation();

    const dispatch = useDispatch();
    
    const [T,changeDoneLottie] = React.useState(false);
    React.useEffect(() => {
    },[T])
    const Xdone = () => <Done done={T} />


    const [donebtn,changeDone] = React.useState({status:true,isloading:false});
    const user = useSelector( state => state.auth.user);
    const tokenK = useSelector(state => state.auth.token); 
    const user_image = useSelector( state => state.auth.user_image);
    const [name,changeName] = React.useState({value:user?.name,isValid:true,touched:false,incomeError:''});
    const [phone,changePhone] = React.useState({value:user?.phone,isValid:true,touched:true,incomeError:''});
    const [email,changeEmail] = React.useState({value:user?.email,isValid:true,touched:true,incomeError:''});
     
    const {t,i18n} = useTranslation();

    const updateName = NameVal => {
      changeName({
          value: NameVal,
          isValid: validate(NameVal,[{key:'minChars',num:11}]),
          touched:true
      });
  }
  const updatePhone = phoneVal => { 
      changePhone({
          value: phoneVal,
          isValid: validate(phoneVal,[{key:'isPhone'},{key:'minChars',num:11}]),
          touched:true
      });
    }
      const updateEmail = emailVal => { 
        changeEmail({
            value: emailVal,
            isValid: true,
            touched:true
        });
  } 
  
  const updateINFO = async() => {
        if(name.value == '' || name.value == null){
            changeName({value:name.value,status:false,incomeError:'Please write your name'});
            return
        }
        
        if(phone.value == '' || phone.value == null){
            changePhone({value:phone.value,status:false,incomeError:'Please write your phone here'});
            return
        }

      //   if(email.value == '' || email.value == null){
      //     changeEmail({incomeError:'Please write your email here'});
      //     return
      // }
        changeDone({status:false,isloading:true});
        
        var config = {method: 'put',url: domain + '/api/update-info',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{name: name.value,phone: phone.value,email: email.value}};
        axios(config).then(res => {
         
            if(res.data.text == 'updated'){
                dispatch(setUser(res.data.userData))
                changeDone({status:true,isloading:false})
                changeDoneLottie(true);
                setTimeout(() => {
                    changeDoneLottie(false);
                    navigation.goBack();
                }, 2000);
            }
            if(res.data.text == 'found_phone_before'){
                changeDone({status:true,isloading:false})
                updatePhone({IncomeError:'This phone is taken'})
            }
            if(res.data.text == 'found_email_before'){
              changeDone({status:true,isloading:false})
              updatePhone({IncomeError:'This email is taken'})
          }
        });
    }


    const updateImage = (image_base) => {
      var config = {method: 'put',url: domain + '/api/update-profile-image',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{image_base_64: 'data:image/png;base64,' + image_base}};
      axios(config).then(res => {
        
        dispatch({type:UPLOAD_IMAGE_REG,payload:'data:image/png;base64,' +image_base})
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: t('auth.image.done.title'),
          textBody: t('auth.image.done.des'),
          button: t('ok'),
      })
      }).catch(() => {
        Alert.alert('Not valid image','something went wrong.')
      });
  }

    const uploadImage = () => {
      ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality:0.9,
        mediaType: 'photo',
         includeBase64: true 
      }).then(image => {
        updateImage(image.data)
      });

      
        
    };

    const removeImage = () => {
      var config = {method: 'put',url: domain + '/api/remove_profile_picture',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
          
          dispatch({type:UPLOAD_IMAGE_REG,payload:null})
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Removed',
            textBody: 'your image has been removed successfully. please upload another as soon as possible',
            button: 'Try again',
        })
        }).catch(() => {
          Alert.alert('sorry','something went wrong.')
        });
      
    };

    return (
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
        
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
        <Root>
        <HeaderApp navigation={navigation} homeFlag={false} title={t('auth.updateAccount')} />
        {Xdone()}

        <View style={{flex:1,paddingHorizontal:20,justifyContent:'space-between'}}>
             
        <View style={[{justifyContent:'center',margin:0,marginTop:10,marginBottom:10,paddingVertical:20, justifyContent:'center',alignItems:'center'}]}>
          <View style={{marginBottom:50}}>
            <View style={{borderWidth:2,borderColor:'black',borderRadius:100,overflow:'hidden'}}>
              <Image 
              // source={{uri: 'data:image/png;base64,' + Pic}}
              source={(user_image) ? {  uri:user_image}: require('../../../assets/images/placeholde2.jpg')}
              style={{alignSelf:'center',height:150,width:150,}}
                />
            </View>
            <View style={{color:'black',position:'absolute',bottom:1,zIndex:999999999,backgroundColor:backgroundColorHadytop,borderRadius:5,padding:3,borderWidth:1,borderColor:'#ddd'}}>
                <PlatformTouchable onPress={() => uploadImage()}>
                <Ionicons name="camera" style={{fontSize:22,color:'black'}} /> 
                </PlatformTouchable>
            </View>
          </View> 

          <AppInput value={name.value} traditionalInput={true} onChangeText={updateName} icon="person" placeholderInput="#### #### ####" touchUser={name.touched} span={t('auth.name')} />
            { (name.incomeError != '') &&
            <Text style={styles.error}> {name.incomeError} </Text>
            }

          <View style={{width:'100%'}}>
            <View style={{position:'absolute',end:15,top:15,zIndex:999999,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:'green',fontSize:13}}>Verified</Text>
            <Ionicons name="checkmark-circle" size={15} color={'green'} />
            </View>
               
                <AppInput value={user?.phone} disabled={true} traditionalInput={true} icon="phone-portrait"  />
                      
          </View>
      
          
            <AppInput value={email.value} traditionalInput={true} onChangeText={updateEmail} icon="mail" placeholderInput="example@example.example" touchUser={email.touched} span={t('auth.email')} />
            { (email.incomeError != '') &&
            <Text style={styles.error}> {email.incomeError}</Text>
            }
          </View> 
    
            
         

            <AppButton onPressP={updateINFO} title={t('auth.updateAccount')}   primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:'85%',maxWidth:300,alignSelf:'center'}]}  /> 

        </View>
        </Root>
        </ScrollView>
        
        </SafeAreaView>
    );
}