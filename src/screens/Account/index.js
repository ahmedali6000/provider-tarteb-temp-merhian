import { useNavigation  } from "@react-navigation/native";
import React from "react";
import {View,SafeAreaView,ScrollView , Image} from 'react-native';
import ImageLoad from "react-native-image-placeholder";
import { useDispatch , useSelector} from "react-redux";
import HeaderApp from '../../shared/Header'
import Gtyles from "../../styles/Gstyle";
import styles from "./style";
 
import { cutLongText } from "../../utils/HelperFunctions";
import AppButton from "../../components/auth/Button";
import PlatformTouchable from "../../components/PlatformTouchable";
import { logout } from "../../redux/actions";
import { useTranslation } from "react-i18next";
import { Modal, Text ,Portal, Button, Provider , ActivityIndicator} from 'react-native-paper';
import { domain } from "../../utils/app";
import axios from "axios";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function AccountScreen(){
    const containerStyle = {backgroundColor: 'white', padding: 20};
    const navigation = useNavigation();
    const user = useSelector( state => state.auth.user );
    const user_image = useSelector( state => state.auth.user_image);
    const tokenK = useSelector(state => state.auth.token);
    const dispatch = useDispatch();
    const [visible, setVisible] = React.useState(false);
    const [REMOVE_ACCOUNT_HANDLER_LOADER, CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER] = React.useState(false);
    const Logout = () => { 
        dispatch(logout());
    };
    const REMOVE_ACCOUNT_HANDLER = () => {
        
        var config = {method: 'delete',url: domain + `/api/remove-my-account`,headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER(true)
            setTimeout(() => {
                CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER(false)
                setVisible(false)
            }, 800);
            Logout()
        }).catch(err=>{
            Alert.alert('Ooops','something went wrong with our servers');
            console.warn(err)
        }).finally(() => {
            
        })
      }


    const {t,i18n} = useTranslation();

    return (
        <Provider>
        <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
        <HeaderApp navigation={navigation} homeFlag={false} title={t('myaccount.title')} />
        <View style={{flex:1,backgroundColor:'white',justifyContent:'space-between',paddingBottom:30}}>
             
        

             

        <View>
                <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={ () => {navigation.navigate('EditAccountDataScreen')} }> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/boy.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p1.h')} </Text>
                                <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('myaccount.parts.p1.des')} </Text>
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
           
                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={() => navigation.navigate('ChangeLanguage')}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={{width:40,height:40,resizeMode:'cover',borderRadius:50}} source={(i18n.language == 'ar') ? require('./../../../assets/images/eg.png') : require('./../../../assets/images/en.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('drawer.language')} {(i18n.language == 'en') ? '( English )' : '( عربي )'}</Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>

                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={() => navigation.navigate('ChangePassScreen')}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/padlock.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('auth.newPassword.btn')}</Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
            </View>
           <View>
           <AppButton onPressP={Logout} title={t('drawer.logout')} style={[Gtyles.button,Gtyles.primaryButton,{marginBottom: 10,marginTop:10,alignSelf:'center',width:180}]} primary={true}  /> 
           <AppButton onPressP={() => {setVisible(true);CHANGE_REMOVE_ACCOUNT_HANDLER_LOADER(false)}} title={t('auth.remove_account')}style={[Gtyles.button,Gtyles.secondaryButton,{marginVertical: 8,alignSelf:'center',backgroundColor:'red',borderColor:'white',width:180}]} textStyle={{color:'white'}} /> 
           </View>

        </View>
        <Portal>
        <Modal visible={visible} dismissable={false}  contentContainerStyle={[containerStyle,{height:200}]}>
            {
                REMOVE_ACCOUNT_HANDLER_LOADER ? 
                <View>
                    <ActivityIndicator size="large" animating={true} color="green" />
                </View>
                :
                <View>
                    <Text style={{textAlign:'center',paddingTop:10,fontSize:16,fontFamily:'Tajawal-Regular'}}>{t('remove_account.sen')}</Text>

                    <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:30,marginBottom:10}}>
                    <Button uppercase={false} backgroundColor="green" color="green" labelStyle={{fontFamily:'Tajawal-Regular'}} icon="check" mode="contained" onPress={REMOVE_ACCOUNT_HANDLER}>
                        {t('remove_account.btn1')}
                    </Button>
                    <Button backgroundColor="red" labelStyle={{fontFamily:'Tajawal-Regular'}} color="red" icon="close" mode="contained" onPress={() => setVisible(false)}>
                        {t('remove_account.btn2')}
                    </Button>
                    </View>
                </View> 
            }
        </Modal>
        </Portal>
        </ScrollView>
        </SafeAreaView>
        </Provider>
    );
}