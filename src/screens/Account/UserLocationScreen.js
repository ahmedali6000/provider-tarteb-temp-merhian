import { useNavigation  } from "@react-navigation/native";
import React from "react";
import {View,Text,SafeAreaView,ScrollView , Image} from 'react-native';
import ImageLoad from "react-native-image-placeholder";
import { Button, Card, Paragraph, Title } from "react-native-paper";
import { useDispatch , useSelector} from "react-redux";
import HeaderApp from '../../shared/Header'
import Gtyles from "../../styles/Gstyle";
import styles from "./style"; 
import { cutLongText } from "../../utils/HelperFunctions";
import AppButton from "../../components/auth/Button";
import PlatformTouchable from "../../components/PlatformTouchable";
import { logout } from "../../redux/actions";
import LottieView from 'lottie-react-native';
import { Linking } from "react-native";
import { domain, textColor } from "../../utils/app";
import axios from "axios";
import { UPDATE_ADRESSES_ARR } from "../../redux/actions/ActionTypes";
import { useTranslation } from "react-i18next";

export default function UserLocationScreen(){
    const navigation = useNavigation();
    const user = useSelector( state => state.auth.user );
    const tokenK = useSelector( state => state.auth.token );
    const dispatch = useDispatch();
    const addresses = useSelector( state => state.auth.addresses );
    const [x,changeX] = React.useState(0);
    const {t,i18n} = useTranslation();

    const remove_address = (id) => {
        let objIndex = addresses.findIndex((obj => obj.id == id));
        if(objIndex > -1){
        var config = {method: 'delete',url: domain + '/api/remove_address',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{address_id:id}};
        axios(config).then(res => {
            addresses.splice(objIndex, 1);
        }).finally(() => {
            dispatch({type:  UPDATE_ADRESSES_ARR,payload:addresses})
            changeX(Math.random(0,11000000))
        })
        }
    };

    React.useEffect(() => {

    },[addresses,x])
    return (
        <SafeAreaView>
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
        <HeaderApp navigation={navigation} title={t('location.addresses.title')} />
        <View style={{flex:1}}>
             
        <AppButton onPressP={() => navigation.navigate('AddLocation')} title={t('location.create.add')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginBottom: 10,marginTop:20,alignSelf:'center',fontSize:15,fontWeight:'500'}]}  /> 

    
        { (addresses.length > 0) ?
      
          
            <View style={{flex:1,paddingHorizontal:6, paddingTop:10,justifyContent:'center',width:'100%'}}>
            {addresses.map((address ,index) => {
                    return (
                        <View key={address.id} style={[Gtyles.shadowFullCard,{flex:1, flexDirection:'column',paddingVertical:15}]}>
                        <View  >
                            
                            {/* <View style={{flexDirection:'column',flex:1}}>
                                <Text style={styles.label}>Latitude: {address.latitude} , Longitude: {address.longitude} </Text>
                                <Text style={styles.label}> </Text>
                                <Text style={styles.label}>{address.area} - {address.gov}</Text>
                                <Text style={styles.label}>
                                    {t('location.create.building_num')} : {address.flat_num} 
                                </Text>
                                <Text style={styles.label}>
                                    {t('location.create.flat_num')} : {address.building_num} 
                                </Text>
                                <Text style={[styles.text_under_label,{marginStart:0}]}>
                                    {address.address} 
                                </Text>
                            </View> */}
                            <View style={{flexDirection:'row'}}>
                                <View style={{justifyContent:'center',}}>
                                <Image style={{width:50,height:50,alignSelf:'center'}} source={require('./../../../assets/images/icons/google-maps.png')} />

                                    </View>
                                <View style={{marginStart:10,flex:1,paddingHorizontal:10}}> 
                                    <Text style={[styles.label,]}>Latitude: {address.latitude} </Text>
                                    <Text style={[styles.label,]}>Longitude: {address.longitude} </Text>
                                    <Text style={[styles.label,(i18n.language == 'ar') && {textAlign:'left'}]}>{address.area} - {address.gov}</Text>
                                    <Text style={[styles.label,(i18n.language == 'ar') && {textAlign:'left'}]}>
                                    {t('location.create.building_num')} : {address.flat_num} 
                                    </Text>
                                    <Text style={[styles.label,(i18n.language == 'ar') && {textAlign:'left'}]}>
                                        {t('location.create.flat_num')} : {address.building_num} 
                                    </Text>
                                    <Text style={[styles.text_under_label,(i18n.language == 'ar') && {textAlign:'left'},{marginStart:0,lineHeight:20}]}>
                                        {address.address} 
                                    </Text>

                                    <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end',marginTop:20}}>
                                        <Button onPress={() => Linking.openURL(`http://maps.google.com/?q=${address.latitude},${address.longitude}`)} style={{marginEnd:20}}  labelStyle={{fontFamily:'Tajawal-Regular'}} color="green" mode="contained">{t('view')}</Button>
                                        <Button onPress={() => remove_address(address.id)} color="red"  mode="contained" labelStyle={{fontFamily:'Tajawal-Regular'}}>{t('remove')}</Button>
                                    </View>
                                </View>
                            </View>
                           
                            
                        </View>
                            
                        </View>
                    )
                })}
            </View>
            
            
          

        :

        <View style={{flex:1}} >
          <View style={[Gtyles.shadowFullCard,{flex:1,alignItems:'center',justifyContent:'center',paddingBottom:40}]}>
            {/* <Image source={require('./../../../assets/images/icons/page.png')} style={{width:100,height:100,alignSelf:'center'}}  /> */}
            <LottieView style={{height:150,width:150}} source={require('./../../../assets/loader/95366-location.json')} autoPlay loop />
            <View style={{backgroundColor:'#ffe2cf',padding:17,borderRadius:20}}>
            <Text style={{fontSize:13,lineHeight:22,textAlign:'center' ,color:textColor,fontFamily:'Tajawal-Medium',}}>
                 {t('location.no')}
            </Text>
            </View>
            
          </View>
        </View>
        }


        </View>
        </ScrollView>
        </SafeAreaView>
    );
}