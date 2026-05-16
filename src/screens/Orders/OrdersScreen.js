import React from 'react'
import { FlatList , View , RefreshControl, ScrollView , SafeAreaView , Text , Image , ActivityIndicator,TouchableOpacity} from 'react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import HeaderApp from '../../shared/Header';
import styles from './style';
import { OrdersContainer } from './OrdersContainer';
import { btnColor, btnColorDark, domain, LOADER_TIME_DELAY_PLUS, textColor } from '../../utils/app';
import PlatformTouchable from '../../components/PlatformTouchable';
import axios from 'axios';
 
import { useTranslation } from 'react-i18next';

import OrderComponent from '../../components/Order/OrderComponent';
import AppButton from '../../components/auth/Button';
import Gtyles from '../../styles/Gstyle';
import { logout } from '../../redux/actions';
import { Root } from 'react-native-alert-notification';


export function renderMap(DATA){
   return (<View style={{flex:1,}}>
    {DATA.map((item ,index) => {

        return (
            <OrderComponent key={item.id} item={item} />
            )
    })}
</View>);
}
export default function OrdersScreen({ route, navigation },props){
    const show_alert = useSelector( state => state.myApp.urgentPopUp);

     
    const [DATA,appendData] = React.useState(null);
    const [ordersType,changeOrdersType] = React.useState('pending');
    const [load,changeLoaded] = React.useState(true);
    const tokenK = useSelector(state => state.auth.token);
    const [pageNum,setPageNum] = React.useState(1);
    const {t,i18n} = useTranslation();
    const dispatch = useDispatch()

  
 
    
     
    const focus = useIsFocused();
    const GET_DATA = () => {
        var config = {method: 'get',url: domain + `/api/orders?type=${ordersType}&page=${pageNum}`,headers: {'Authorization': `Bearer ${tokenK}`,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            if(res.data.length > 0){
                appendData(res.data)
            }else{
                appendData(null)
            }
            changeLoaded(false)
        }).catch(err=>{
            if(err.response.status == 401){
                dispatch(logout());
            }
        })
    }

    
  

    const [refreshing, setRefreshing] = React.useState(false);
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
      }
    const onRefresh = React.useCallback(() => {
      setRefreshing(true); 
      wait(100).then(() => setRefreshing(false));
      
     
      GET_DATA();
    }, [focus,ordersType]);


    React.useEffect(() => {
        if(route && route.params && route.params.orType){
            changeOrdersType(route.params.orType)
            navigation.setParams({orType: undefined})
        }
        if (focus == true) {
            GET_DATA();
        }
       
    },[ordersType,focus]);
  return (
    
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
      
        <ScrollView contentContainerStyle={{flexGrow: 1,}} 
         
          refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        }
        >
        <HeaderApp navigation={navigation}  title={t('order.title')} />
       
        <View style={[styles.secondSection,{width:'100%',}]} >
                <ScrollView style={{maxHeight:72,alignSelf:'center'}} contentContainerStyle={{alignItems:'center'}} horizontal={true} >
                    <TouchableOpacity  onPress={() => {changeLoaded(true);setPageNum(1);changeOrdersType('pending')}}>
                        <View  style={[styles.fab,(ordersType == 'pending' && {})]}>
                            <Text style={[styles.fabTxt,(ordersType == 'pending'  && styles.fabTxtSeleted)]}>
                                {t('order.types.Waiting')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                     
                    <TouchableOpacity  onPress={() => {changeLoaded(true);setPageNum(1);changeOrdersType('accepted')}}>
                        <View  style={[styles.fab,(ordersType == 'accepted' && {})]}>
                            <Text style={[styles.fabTxt,(ordersType == 'accepted'  && styles.fabTxtSeleted)]}>
                            {t('order.types.Accepted')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => {changeLoaded(true);setPageNum(1);changeOrdersType('complete')}}>
                        <View  style={[styles.fab,(ordersType == 'complete' && {})]}>
                            <Text style={[styles.fabTxt,(ordersType == 'complete'  && styles.fabTxtSeleted)]}>
                            {t('order.types.Completed')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={() => {changeLoaded(true);setPageNum(1);changeOrdersType('canceled')}}>
                        <View  style={[styles.fab,(ordersType == 'canceled' && {})]}>
                            <Text style={[styles.fabTxt,(ordersType == 'canceled'  && styles.fabTxtSeleted)]}>
                            {t('order.types.Cancelled')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                 
                </ScrollView>
                 
               
                    {
                        !load ?
                            
                            (!DATA) ? 
                            <View style={{flex:1,justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                                <View style={{backgroundColor:'transparent',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                    <Image style={{width:300 ,height:300 }} source={require("../../../assets/images/empty.png")} />
                                    <Text style={{fontSize:16, fontFamily:'Tajawal-Bold',color:btnColorDark,textAlign:'center',marginTop:5}}>
                                    {t('empty')}
                                    </Text>
                                </View>
                            </View>
                            :
                            <View style={{flex:1}}>
                                <View style={{flex:1}}>
                                    {renderMap(DATA)}
                                </View>
                               
                                <AppButton title={t('viewall')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,alignSelf:'center',width:'70%'}]} onPressP={() => navigation.navigate('AllOrders',{ordersTypeParam:ordersType})}/> 

                               

                            </View> 
                            :
                            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                <ActivityIndicator size="large" />
                            </View>
                        
                        }
                        

                        {/* </Card> */}
                  
                </View>
             
      </ScrollView>
       
      </SafeAreaView>
      
  )
}

