import 'react-native-gesture-handler';
import React, { useReducer } from "react";
import {SafeAreaView,ScrollView,View,Text, Image ,RefreshControl , FlatList, Alert, TouchableOpacity} from 'react-native';
import HeaderApp from "../../shared/Header";
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import styles from './style';
import Gtyles from '../../styles/Gstyle';
import { Card, Title, Paragraph , FAB , Switch , ProgressBar, Colors} from 'react-native-paper';
import { btnColor, btnColorDark, domain, LOADER_TIME_DELAY_PLUS, textColor } from '../../utils/app';
// import Swiper from 'react-native-swiper'
import SearchInput from '../../components/Search';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Loader from '../../components/Loader';
import axios from 'axios';
import PlatformTouchable from '../../components/PlatformTouchable';
import CategoryCard from '../../components/Category/CategoryCard';
import { CategoryBox } from '../../components/SquaredBox/Category';
import { ServiceBox } from '../../components/SquaredBox/Service';
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import { arabic_num, cutLongText } from '../../utils/HelperFunctions';
import Stars from '../../components/starts';
import { Add_Service_To_Order } from '../../redux/actions/authActionCreator'
import { useTranslation } from 'react-i18next';
import FavHeart from '../../components/favHeart/FavHeart';

 


export default function ServiceScreen({ route, navigation },props){
    const {service} = route.params;
    const tokenK = useSelector(state => state.auth.token);
    const [DATA,appendData] = React.useState(null);

    const GET_DATA = () => {
        var config = {method: 'get',url: domain + '/api/servicedata?service_id='+service.id,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
            axios(config).then(res => {
                
                
                appendData(res.data);
            }).catch(err=>{
        }) 
    }
    const {t,i18n} = useTranslation();
    const dispatch = useDispatch();
    const order = useSelector( state => state.order);
    const [x,setX] = React.useState(0);
    const [count,setCount] = React.useState(0);
    const NAVIGATE_TO_LOCATION_SCREEN_HANDLER = () => {
    
        if(order.order_category_id != null && DATA?.category_id == order.order_category_id){
          navigation.navigate('LocationSelectScreen')
        }else{
          return (
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: t('category.warn.title'),
              textBody: t('category.warn.des'),
              button: t('understood'),
          })
          )
        }
        
      }

    const increase = () => {
        dispatch(Add_Service_To_Order(DATA.category_id,DATA.category_name,DATA.id,DATA.name,service.price,count+1,order.order_services,'positive'));
        setX(Math.random(0,444444))
    }
    const decrease = () => {
    if(count >= 0) 
    {
        dispatch(Add_Service_To_Order(DATA.category_id,DATA.category_name,DATA.id,DATA.name,service.price,(count > 0) ?count-1 : 0,order.order_services,'negative'));
       
    }
    setX(Math.random(0,444444))
    if(count == 0){
        setCount(0)
    }
    }
   
    React.useEffect(()=>{
       
        if(DATA == null){
            GET_DATA()
        }
        const arr = order.order_services;
        if(arr.length == 0){
            setCount(0);
        }
        arr.filter(function(obj) {
            if(obj['service_id'] == service.id){
                setCount(obj['count'])
            }else{
                setCount(0);
            }
        });
    },[x])
    return (

        <SafeAreaView style={{flex:1}}>
            {
                DATA ? 
                    
                    <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <HeaderApp navigation={navigation} homeFlag={false} title={cutLongText(service.name,23)} />
                    <View style={styles.screenWrapper}>
                        <View style={styles.bannerWrapper}>
                            <Image source={{uri:DATA.image}} style={styles.banner} />
                            {/* <View style={{position:'absolute',zIndex:99999,top:7,end:7}}>
                                <FavHeart id={DATA.id} wished={DATA.wished} />
                            </View> */}
                        </View> 
                        <View style={styles.otherPage}>

                            <View style={[styles.screenWrapperSon,{marginTop:-35}]}>
                                <Title style={{textAlign:"center",fontSize:16.5,lineHeight:24, color:textColor,fontFamily:'Tajawal-Regular'}}>{DATA.name} </Title>
                               
                                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                                    <Title style={{color:btnColorDark,fontFamily:'Tajawal-Bold',fontSize:16}}>{arabic_num(DATA.price)} {t('cur')} </Title>
                                    <Text style={{color:'#106ca1',fontFamily:'Tajawal-Bold',fontSize:15}}>
                                        {DATA.category_name}
                                    </Text>
                                    <Stars rate={DATA.rate}  />
                                    
                                </View>
                            </View>
                            {/* <View style={{justifyContent:'center',alignItems:'flex-end',marginBottom:10,marginTop:-10}}>
                                <View style={{backgroundColor:'#bcd8e8',padding:8,borderRadius:30,borderWidth:1,borderColor:'#106ca1',marginEnd:10}}>
                                    <Text style={{color:'#106ca1',fontWeight:'600'}}>
                                        {DATA.category_name}
                                    </Text>
                                </View>
                            </View> */}
                            

                            <View style={[styles.screenWrapperSon]}>
                                {
                                    (order?.order_category_id == null || order?.order_category_id == DATA.category_id) ?
                                     
                                        (order.preview == true) ? 
                                        <TouchableOpacity onPress={() => navigation.navigate('PreOrderRevsion')}>
                                        <Text style={{fontSize:15,marginVertical:8,color:'red',fontFamily:'Tajawal-Regular',lineHeight:23,textAlign:'center'}}> 
                                            {t('service.requested_preview')}
                                        </Text>
                                        </TouchableOpacity>
        
                                    
                                                                    :
                                    <View>
                                        <Text style={{fontSize:18, color:textColor,fontFamily:'Tajawal-Regular',marginBottom:15,borderBottomWidth:2,borderColor:'#ddd',alignSelf:'center',paddingBottom:8}}>
                                            {t('service.time_to_do') }
                                            {/* + ' ' + order?.order_category_id  + ' '+ DATA.category_id */}
                                        </Text>
                                        <View style={[Gtyles.counterWrapper,Gtyles.shadow,{alignSelf:'center'}]}>
                                            <PlatformTouchable onPress={decrease}>
                                                <Ionicons style={Gtyles.counterIcon} name="remove"   />  
                                                </PlatformTouchable> 
                                                <Text style={Gtyles.counterTxt}> { arabic_num(count) }</Text>                 
                                                <PlatformTouchable onPress={increase}>
                                                <Ionicons style={Gtyles.counterIcon}  name="add"  />  
                                            </PlatformTouchable>  
                                        </View>
                                    </View>
                                             
                                    :
                                    <TouchableOpacity onPress={() => navigation.navigate('PreOrderRevsion')}>
                                        <Text style={{fontSize:15,marginVertical:8,color:'red',fontFamily:'Tajawal-Regular',lineHeight:23,textAlign:'center'}}> 
                                        {t('service.requested_another_category')}
                                        </Text>
                                    </TouchableOpacity>
                                
                                }
                               
                           
                                 
                            </View>
                            <View style={styles.screenWrapperSon}>
                                <Text style={{fontSize:17, color:textColor,fontFamily:'Tajawal-Medium',textAlign:'center'}}>{t('service.des')}</Text>
                                {
                                    (DATA.des) ?
                                    <Text style={{fontSize:16,lineHeight:22,color:textColor,fontFamily:'Tajawal-Regular'}}> {DATA.des}</Text>
                                    :
                                    <Text style={{marginVertical:50,alignSelf:'center', color:textColor,fontFamily:'Tajawal-Regular'}}>
                                        {t('service.no_des')}
                                    </Text>

                                }
                                 
                            </View>
                        </View>   
                    </View>  
                    
                </ScrollView>
               :
               <Loader isLoading={true} />
            }
              {
              ( count > 0 ) && (order?.order_category_id != null || order?.order_category_id == DATA.category_id) &&
             <View style={{backgroundColor:'orange',position:'absolute',bottom:10,backgroundColor:btnColorDark,
                borderRadius:3,
                width:'95%',
                alignSelf:'center',
                paddingVertical:15,
                paddingHorizontal:20,
                flexDirection:'row',
                justifyContent:'space-between'
                }}>
                    <Text style={{fontSize:14,color:'white',fontFamily:'Tajawal-Regular'}}>{t('category.select_bot')}</Text>
                    <PlatformTouchable onPress={()=>{NAVIGATE_TO_LOCATION_SCREEN_HANDLER()}}>
                        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                        <Text style={{fontSize:15,color:'white',fontFamily:'Tajawal-Regular',}}> {t('next')} </Text>
                        <Ionicons style={[(i18n.language == 'ar') && {transform: [{rotateY: '180deg'}]},{color:'white',fontSize:20}]} name="navigate-next" />
                        </View>
                    </PlatformTouchable>
                </View>
            
            }  
           
        </SafeAreaView>
        
    );
}