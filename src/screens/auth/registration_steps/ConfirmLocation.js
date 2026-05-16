import React from 'react';
import {View, Text , StyleSheet , Platform, PermissionsAndroid , SafeAreaView} from 'react-native';
import MapView, { PROVIDER_GOOGLE , Marker }  from "react-native-maps"; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from 'react-native-geolocation-service';
import { backgroundColorHady, domain, SHOW_SELECT_LOCATION_FIRST_TIME_FLAG } from '../../../utils/app';
import AppButton from "../../../components/auth/Button";
import Gtyles from '../../../styles/Gstyle';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
 
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthHeader from '../../../shared/AuthHeader';
import { useTranslation } from 'react-i18next';
import { CHANGE_LONG_LAT } from '../../../redux/actions/ActionTypes';
// import Geolocation from 'react-native-geolocation-service';
const styles = StyleSheet.create({
    upperSection: {
    //   ...StyleSheet.absoluteFillObject,
      flex:6,
      justifyContent: "flex-end",
      alignItems: "center"
    },
    map: {
      ...StyleSheet.absoluteFillObject
    },
    belowSection:{
        flex:2,
        alignItems:'center',
        justifyContent:'center'
    }
  });



function ConfirmLocation({ route, navigation },props){
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    const [isLoading,changeisLoading] = React.useState(false);
    // const {stack} = route.params;
    const dispatch = useDispatch();
    const {t,i18n} = useTranslation();
    const [userLatitude,changeuserLatitude] = React.useState(0);
    const [userLogitude,changeuserLogitude] = React.useState(0);
    const [hasMapPermission,changehasMapPermission] = React.useState(false);
    const [sec_1,prepareMap] = React.useState(0);

    
    const tokenK = useSelector(state => state.auth.token);
    const CONFIRM_LOCATION = () => {
        // var config = {method: 'post',url: domain + '/api/update-use-location',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{'user_latitude':userLatitude,'user_longitude':userLogitude}};
        // axios(config).then(response => {
            
            AsyncStorage.setItem(SHOW_SELECT_LOCATION_FIRST_TIME_FLAG,'yes_selected').then(()=>{
                // navigation.navigate('HomeStack')
                dispatch({
                    type: CHANGE_LONG_LAT,
                    payload:{
                        lat:userLatitude,
                        long:userLogitude
                    }
                });
                navigation.navigate('SelectImageScreen');
              });
        // }).catch(err => {
        //      alert(err)
        // });
    }

    const requestFineLocation = async () => {
        try {
            if(Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if(granted === PermissionsAndroid.RESULTS.GRANTED) {
                    changehasMapPermission(true);
                    console.log(`hasMapPermission`, hasMapPermission);
                }else{
                    requestFineLocation();
                }
            }
        } catch (error) {
            alert(error);
        }
    };

   

    React.useEffect(() => {
        setTimeout(() => {
            requestFineLocation();
            prepareMap(2)
        }, 3000);
        
        if(hasMapPermission){
            Geolocation.watchPosition(
                (position) => {
                    console.log(position);
                    changeuserLatitude(position.coords.latitude)
                    changeuserLogitude(position.coords.longitude)
                },
                (error) => {
                    // See error code charts below.
                    alert(error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    },[hasMapPermission, userLatitude,userLogitude]);
    return (
        <SafeAreaView style={{flex:1}}>
            
        <AuthHeader text={t('auth.titles.confirm_location')} bar={0.5} />
            
        {/* <ScrollView contentContainerStyle={{flexGrow: 1}} > */}
            <View style={{flex:1,backgroundColor:backgroundColorHady}}>
            { (sec_1 == 2) ?
                <View style={{flex:1,backgroundColor:backgroundColorHady}}>
                    <View style={styles.upperSection}>
                        <MapView
                        showsUserLocation
                        followsUserLocation
                        //provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                        style={styles.map}
                        region={{
                            latitude: userLatitude,
                            longitude: userLogitude,
                            latitudeDelta: 0.015, 
                            longitudeDelta: 0.0121
                        }}
                        />
                    </View>
                        <View style={styles.belowSection}>
                            
                            <Text style={{fontSize:16,fontWeight:'bold'}}>
                            
                                {t('location.sen1')}
                                 {/* <Ionicons style={{fontSize:17,marginHorizontal:5}} name='place' /> */}
                            </Text>
                        <AppButton disabled={!donebtn.status} isLoading={donebtn.isloading} title= {t('location.sen2')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,}]} onPressP={CONFIRM_LOCATION}/> 

                        </View>
                    </View>
                :
                <View>
                    
                </View>
                }
            </View>
            </SafeAreaView>
    );
}

export default ConfirmLocation;