import React from 'react';
import {View, Text , StyleSheet , Platform , Image, SafeAreaView , ScrollView, Linking, AppState} from 'react-native';
import MapView, { PROVIDER_GOOGLE , Marker }  from "react-native-maps"; // remove PROVIDER_GOOGLE import if not using Google Maps
// import Geolocation from 'react-native-geolocation-service';
import { backgroundColorHady, btnColorDark, danger, domain, textColor } from '../../utils/app';
import AppButton from "../../components/auth/Button";
import Gtyles from '../../styles/Gstyle';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux' ;
import axios from 'axios';
 
import AppInput from '../../components/auth/Input';
// import DropDownPicker from 'react-native-dropdown-picker';
import { UPDATE_ADRESSES_ARR } from '../../redux/actions/ActionTypes';
import { useTranslation } from 'react-i18next';
import HeaderApp from '../../shared/Header';
import {request, PERMISSIONS, RESULTS ,check, openSettings} from 'react-native-permissions';
import { TouchableOpacity } from 'react-native';
import GetLocation from 'react-native-get-location';
import { KeyboardAvoidingView } from 'react-native';

import Geolocation, { stopObserving } from 'react-native-geolocation-service';
import { ActivityIndicator } from 'react-native-paper';
const styles = StyleSheet.create({
    upperSection: {
    //   ...StyleSheet.absoluteFillObject,
      flex:1,
      height:110,
      justifyContent: "flex-end",
      alignItems: "center"
    },
    map: {
      ...StyleSheet.absoluteFillObject
    },
    belowSection:{
        flex:2.3,
        
    },
    iconStyle:{
        width:30,
        height:25
    },
    DBcontainerStyle:{
            width:'70%',
            alignSelf:'center',
            marginBottom:10,
            fontFamily:'Tajawal-Regular'
    }
  });



function AddLocation(props){

    const navigation = useNavigation();
    const tokenK = useSelector(state => state.auth.token);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
  

    const [open_g, setOpeng] = React.useState(false);
    const [value_g, setValueg] = React.useState(null);
    const [govs,append_govs] = React.useState([]);

    const [open_a, setOpena] = React.useState(false);
    const [value_a, setValuea] = React.useState(null);
    const [areas,append_areas] = React.useState([]);
    const [mapErrorCode,setMaoErrorCode] = React.useState(null)
    const [mapErrorName,setMaoErrorName] = React.useState('')
    
    const get_govs = () => {
        if(govs.length == 0 && test == 0 && userLatitude != 0 && focus == true){
            setTest(1)
        
        var config = {method: 'get',url: domain + `/api/get_govs?country_id=${user.country_id}`,headers: { 'Content-Type': 'application/json','Accept': 'application/json'}};
            axios(config).then(res => {
                append_govs(res.data)
            }).catch(err => {
                alert('error','something went wrong ')
            })
        }
    }
    const get_areas = () => {
        var config = {method: 'get',url: domain + `/api/get_areas?gov_id=${value_g}`,headers: { 'Content-Type': 'application/json','Accept': 'application/json'}};
            axios(config).then(res => {
                append_areas(res.data)
            }).catch(err => {
                alert('error','something went wrong ')
            })
    }

     


    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    const [isLoading,changeisLoading] = React.useState(false);

    
    const [test,setTest] = React.useState(0);
    const [userLatitude,changeuserLatitude] = React.useState(0);
    const [userLogitude,changeuserLogitude] = React.useState(0);
    const [hasMapPermission,changehasMapPermission] = React.useState(false);
    const [sec_1,prepareMap] = React.useState(0);
    const [notCompleteSen,setNotCompleteSen] = React.useState(null);
    const addresses = useSelector( state => state.auth.addresses );
    const {t,i18n} = useTranslation();
    
   
    const detect = () => {
       
      if(1 == 2){
 GetLocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 2000,
                rationale:true
            })
            .then(location => {
                // console.warn(location);
                changeuserLatitude(location.latitude)
                        changeuserLogitude(location.longitude)
                        
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
      }else{
        Geolocation.getCurrentPosition(
            (position) => {
              console.warn(position.coords.latitude);
              changeuserLatitude(position.coords.latitude)
              changeuserLogitude(position.coords.longitude)

              setMaoErrorCode(null)
              setMaoErrorName('')
            },
            (error) => {
              // See error code charts below.
              setMaoErrorCode(error.code)
              setMaoErrorName(error.name)
             
              console.warn(error.code, error.message);
            },
            { enableHighAccuracy: false, timeout: 30000, forceLocationManager:true, forceRequestLocation:true}
        )
      }
       
    }

    const CONFIRM_LOCATION = () => {
        
        const app_data = {
            "latitude" : userLatitude,
            "longitude" : userLogitude,
            "address": address,
            "flat_num":flat_num,
            "building_num":building_num,
            "area_id":value_a,
            "gov_id":value_g
        };
        if ( flat_num == '' || building_num =='' || address == '') {
            setNotCompleteSen('complete please')
        } else {
            setNotCompleteSen(null)
            changeDone({status:false,isloading:true})
            setUpdateDone(true);
            var config = {method: 'post',url: domain + '/api/add_address',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:app_data};
            axios(config).then(res => {
                dispatch({
                    type: UPDATE_ADRESSES_ARR,
                    payload: [...addresses,res.data.data],
                })
            }).catch(err => {
                alert('Sorry','Something went wrong')
            }).finally(res => {
                
                navigation.navigate('UserLocationScreen')
                changeDone({status:true,isloading:false})
            });
        }
    }

    const requestFineLocation = async () => {
        changehasMapPermission(true);
        const granted = await request(
            Platform.select({
              android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
              ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
            }),
            {
              title: 'Tarteb',
              message: 'Tarteb would like access to your location ',
            },
          );
          return granted;
    };

    const focus = useIsFocused();
    const [flat_num,changeFLAT] = React.useState('');
    const [building_num,changeBUILDING] = React.useState('');
    const [address,changeADDRESS] = React.useState('');
    const [updateDone,setUpdateDone] = React.useState(false);
    const [isMounted,setIsMounted] = React.useState(false);
    const [fl,setFl] = React.useState(0);
    const appState = React.useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

    React.useEffect( () => {
        if(focus){
            detect()
        }
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
              appState.current.match(/inactive|background/) &&
              nextAppState === 'active'
            ) {
            //   console.log('App has come to the foreground!');
              setFl(fl+1);
              Geolocation.stopObserving()
            }
       
            appState.current = nextAppState;
            
            setAppStateVisible(appState.current);
            console.log('AppState', appState.current);
          
            if(focus){
                detect()
            }
        });
      
        // if(isMounted){
           
            setTimeout(() => {
               
                requestFineLocation();
                prepareMap(2)
            }, 1000);
            
           
            // setTimeout(() => {
            //     detect()
            // }, 1000);
         
            if(govs.length == 0){
                if(focus == true){
                   
                    get_govs();
                }
               
            }
    //         }
    return () => {
        subscription.remove();
        
      
    }

    },[userLatitude,userLogitude,focus,]);
    return (
        <SafeAreaView style={{flex:1,overflow:'scroll'}} contentContainerStyle={{flex:1}} keyboardShouldPersistTaps='handled'>
            <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex:1}}>
            <ScrollView contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps='handled'>
            <HeaderApp navigation={navigation} homeFlag={false} title={t('location.create.add')} />
            <View style={{flex:1,backgroundColor:backgroundColorHady}}>
                
            { (sec_1 == 2) ?
                <View style={{flex:1,backgroundColor:backgroundColorHady}}>
                    <View style={styles.upperSection}>
                        { (userLatitude > 0) ?
                        
                        
                        <MapView
                        showsUserLocation
                        followsUserLocation
                        //provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={styles.map}
                        initialRegion ={{
                            latitude: userLatitude,
                            longitude: userLogitude,
                            latitudeDelta: 0.015, 
                            longitudeDelta: 0.0121
                        }}
                        /> 
                        :
                        <View>
                            <ActivityIndicator size={'large'} color={btnColorDark} style={{marginBottom:30}} />
                            <Text style={{ color:textColor,fontFamily:'Tajawal-Medium',fontSize:14,}}>{t('map.lodingMapInfo')}</Text>
                        </View>
                     }
                    </View>

                    <Text style={{fontSize:16,fontSize:15,alignSelf:'center',marginTop:10,marginBottom:20,fontFamily:'Tajawal-Bold',color:textColor}}>
                                    ( {userLatitude + ' - ' + userLogitude} )
                    </Text>
                    {
                        (hasMapPermission == false) ?? 
                        <Text style={{alignSelf:'center',color:'red',marginTop:15,fontSize:16,fontFamily:'Tajawal-Regular',color:textColor}}> You have to allow app to detect your location </Text>
                    }
                   
                            <View style={styles.belowSection}>
                                <Text style={{fontSize:16,fontSize:15,alignSelf:'center',marginTop:10,marginBottom:20,fontFamily:'Tajawal-Bold',color:textColor}}>
                                    {t('location.create.title')}
                                </Text>
                                {
                                    (notCompleteSen != null) &&
                                     <Text style={{fontSize:16,fontSize:15,alignSelf:'center',marginTop:10,marginBottom:20,fontFamily:'Tajawal-Bold',color:'red'}}>
                                    {t('location.pleaseComplete')}
                                </Text>
                                }

                                {
                                    (mapErrorCode == null) ? 
                                        <View style={{flex:1}}>
                                        <View>
                                            <View zIndex={99999999999999}>
                                                <DropDownPicker
                                                    containerStyle={styles.DBcontainerStyle}
                                                    
                                                    zIndex={555555555}
                                                    open={open_g}
                                                    value={value_g}
                                                    items={govs}
                                                    listMode="MODAL"
                                                
                                                    setOpen={setOpeng}
                                                    setValue={setValueg}
                                                    onChangeValue={get_areas}
                                                    searchPlaceholder={t('auth.select_gov')}
                                                    placeholder={t('auth.select_gov')}
                                                    
                                                    textStyle={{fontFamily:'Tajawal-Regular'}}
                                                    style={{borderColor:'#ddd',backgroundColor:'white',fontFamily:'Tajawal-Regular'}}
                                                    searchTextInputStyle={(i18n.language == 'ar') && {textAlign:'right',fontFamily:'Tajawal-Regular'}}
                                                    searchable={true}
                                                    
                                                />
        
                                                <DropDownPicker
                                                    style={{borderColor:'#ddd',backgroundColor:'white',}}
                                                    zIndex={55}
                                                    containerStyle={styles.DBcontainerStyle}
                                                    listMode="MODAL"
                                                    textStyle={{fontFamily:'Tajawal-Regular'}}
                                                    open={open_a}
                                                    value={value_a}
                                                    items={areas}
                                                    setOpen={setOpena}
                                                    setValue={setValuea}
                                                    searchPlaceholder={t('auth.select_area')}
                                                    placeholder={t('auth.select_area')}
                                                    searchTextInputStyle={(i18n.language == 'ar') && {textAlign:'right'}}
                                                    searchable={true}
                                                />
                                            </View> 
                                            <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                                                <View style={{width:'45%'}}>
                                                    <AppInput  isphoneKeyStyle={false} onChangeText={changeFLAT}    span={t('location.create.flat_num')}  placeholder="##" secureTextEntry={false} keyboardType="numeric" />
                                                </View>
                                                <View style={{width:'45%'}}>
                                                    <AppInput isphoneKeyStyle={false} onChangeText={changeBUILDING}    span={t('location.create.building_num')}  placeholder="##" secureTextEntry={false} keyboardType="numeric" />
                                                </View>
                                            
                                            </View>
                                            <View style={{width:'95%',alignSelf:'center',marginBottom:20}}>
                                                <AppInput isphoneKeyStyle={false} onChangeText={changeADDRESS} span={t('location.create.des')}  placeholder={t('location.create.ex')} secureTextEntry={false}/>
                                            </View>
        
                                        </View>
                                        <AppButton disabled={!hasMapPermission || flat_num == '' || building_num =='' || address == '' || donebtn.isloading} isLoading={donebtn.isloading} title={t('location.create.add')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{alignSelf:'center'}]} onPressP={CONFIRM_LOCATION}/> 
                                        </View> 

                                    :

                                    <View style={{backgroundColor:'#ddd',padding:30,justifyContent:'center',alignItems:'center'}}>
                                        <Text style={{ color:danger,fontFamily:'Tajawal-Bold',fontSize:15,}}>
                                            {t('map.errors.' + mapErrorCode)}
                                        </Text>
                                        <AppButton title={t('map.settings')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginTop: 20,}]} onPressP={() => { (Platform.OS == 'android') ? openSettings() : Linking.openURL('app-settings://notification/myapp') }} />
                                    </View>

                                }
                            
                        </View>
                    </View>
                :
                <View>
                </View>
                }
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default AddLocation;