import React from 'react';
import {ScrollView,Text, View,SafeAreaView,Image ,FlatList} from "react-native";
import AppButton from "../../../components/auth/Button";
import AppInput from '../../../components/auth/Input';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {validate} from '../../../utils/Validate';
import Gtyles from '../../../styles/Gstyle';
import { btnColor, btnColorDark, domain } from '../../../utils/app';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Card, Paragraph, RadioButton, Title } from "react-native-paper";
import PlatformTouchable from '../../../components/PlatformTouchable';
import { StyleSheet } from 'react-native';
import AuthHeader from '../../../shared/AuthHeader';
import { useDispatch, useSelector } from 'react-redux';
import { SET_CATEGORY_ID, UPLOAD_IMAGE_REG } from '../../../redux/actions/ActionTypes';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { register } from '../../../redux/actions';
import { TouchableOpacity } from 'react-native';


export default function SelectImageScreen(){

    const navigation = useNavigation();
    const [val , changeVal] = React.useState(null);
    const [isLoading,changeisLoading] = React.useState(false);
    const user_image = useSelector( state => state.auth.user_image);
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    const {t,i18n} = useTranslation();
     
    const dispatch = useDispatch();
 
   
    React.useEffect(()=>{
         
    },[])

    
    const updateImage = (image_base) => {
        
          dispatch({type:UPLOAD_IMAGE_REG,payload:'data:image/png;base64,' +image_base})
           
        
    }

    const uploadImage = () => {
      
        let options = {
          mediaType: 'photo',
          quality: 0,
          includeBase64: true,
        };
        launchImageLibrary(options, response => {
            if (response.didCancel) {
              // alert('Cancelled image selection');
            } else if (response.errorCode == 'permission') {
              // alert('Permission not satisfied');
            } else if (response.errorCode == 'others') {
              // alert(response.errorMessage);
            } else if (response.assets[0].fileSize > 2097152) {
              Alert.alert(
                'Maximum image size exceeded',
                'Please choose a file under 2 MB',
              );
            } else {
               
              // SetPic(response.assets[0].base64);
              updateImage(response.assets[0].base64)
            }
        });
    };

    const Handler = () => {
       dispatch(register())
    }

    return (
         
        <SafeAreaView style={[styles.Wrapper]}>
        <AuthHeader text={t('auth.titles.upload_profile_picture')} bar={0.6} />
      
            <View style={{flex:1,justifyContent:'space-around'}}>
           
                <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
                <View style={[Gtyles.shadowFullCard,{marginBottom:20,paddingVertical:12}]}>
                <Text style={{fontSize:13,fontWeight:'600',lineHeight:18}}>
                {t('auth.upload_image_sen')}
                </Text>
            </View>
                <TouchableOpacity onPress={() => uploadImage()}>
                    <View>
                    <Image style={{width:150,height:150,borderRadius:20}} source={(!user_image) ? require('./../../../../assets/images/placeholde2.jpg') : {uri: user_image}} />
                     <View style={{color:'black',position:'absolute',bottom:1,zIndex:999999999,backgroundColor:'#ddd',borderRadius:100}}>
                        
                        <Ionicons name="camera" style={{fontSize:25,}} />
                        
                    </View>
                    </View>
                    </TouchableOpacity>
                    
                    {/* <AppButton title={t('welcome.btn2')} btn_style={[Gtyles.authBtnStyle2,Gtyles.btn_shadow,{borderWidth:1,marginVertical: 13}]} onPressP={() => uploadImage()} />  */}

                </View>
            </View>
             <AppButton isLoading={isLoading} title={t('next')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,alignSelf:'center'}]} onPressP={() => Handler()}    /> 
         
        </SafeAreaView>
      
        
    );
} 

 

const styles = StyleSheet.create({
    lang_text:{
        fontSize:16,
        color:'black',
        fontWeight:'600'
    },
    Wrapper:{
        flex:1
    },
})