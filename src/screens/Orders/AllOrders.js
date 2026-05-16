import React from 'react'
import { FlatList , View , ScrollView , SafeAreaView , Text , Image , ActivityIndicator,TouchableOpacity} from 'react-native'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import HeaderApp from '../../shared/Header';
import styles from './style';
import { OrdersContainer } from './OrdersContainer';
import { btnColor, btnColorDark, domain, LOADER_TIME_DELAY_PLUS, textColor } from '../../utils/app';
import PlatformTouchable from '../../components/PlatformTouchable';
import axios from 'axios';

 
import { useTranslation } from 'react-i18next';

import OrderComponent from '../../components/Order/OrderComponent';

export default function AllOrders({ route, navigation },props) {
    const show_alert = useSelector( state => state.myApp.urgentPopUp);

    const {ordersTypeParam} = route.params;
    const [DATA,appendData] = React.useState([]);
    const [ordersType,changeOrdersType] = React.useState(null);
    const [load,changeLoaded] = React.useState(true);
    const tokenK = useSelector(state => state.auth.token);
    const [pageNum,setPageNum] = React.useState(1);
    const {t,i18n} = useTranslation();
    

    const rederOrder = ({item}) =>{
        return (
           <OrderComponent item={item} />
        )
    }

    // const wait = (timeout) => { // Defined the timeout function for testing purpose
    //     return new Promise(resolve => setTimeout(resolve, timeout));
    // }
    
    // const [isRefreshing, setIsRefreshing] = React.useState(false);
    
    // const onRefresh = React.useCallback(() => {
    //         setIsRefreshing(true);
    //         wait(500).then(() => setIsRefreshing(false));
    //         GET_DATA()
    // }, []);
    
    const renderOrdersList = (orders) => {
        return (
            <FlatList
                data={orders}
                onEndReached={() => (DATA.length > 5) ? setPageNum(pageNum+1) : null}
                onEndReachedThreshold={0.5}
                renderItem={rederOrder}
                keyExtractor={(item, index) => index.toString()}
                // showsVerticalScrollIndicator={false}
                // refreshing={isRefreshing} // Added pull to refesh state
                // onRefresh={onRefresh} // Added pull to refresh control
                />
            );
    }
    const focus = useIsFocused();
    const GET_DATA = () => {
        var config = {method: 'get',url: domain + `/api/allorders?type=${ordersType}&page=${pageNum}`,headers: {'Authorization': `Bearer ${tokenK}`,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            if(res.data.length > 0){
                appendData(DATA.concat(res.data))
            }
            
                changeLoaded(false)
           
        }).catch(err=>{
            
            if(err.response.status == 401){
                dispatch(logout());
            }
        })
    }
    React.useEffect(() => {
        changeOrdersType(ordersTypeParam)
        if(ordersType && focus == true){
             
        GET_DATA();
        
    }
        
    },[ordersType,pageNum,focus]);
  return (
    <SafeAreaView style={{flex:1,flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start',}}>
        {/* <ScrollView contentContainerStyle={{flexGrow: 1}} > */}
        <HeaderApp navigation={navigation} homeFlag={true} title={t('order.title')} />
       
        <View style={[styles.secondSection,{flex:1,width:'100%'}]} >
                
                 
               
                        {/* <Card style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'red',flexDirection:'column'}}> */}
                    {
                        !load ?
                            
                            (DATA.length == 0) ? 
                            <View style={{flex:1,justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
                                <View style={{backgroundColor:'transparent',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                                    <Image style={{width:100,height:100}} source={require("../../../assets/images/empty.png")} />
                                    <Text style={{fontSize:15, fontFamily:'Tajawal-Medium',color:textColor,textAlign:'center',marginTop:10}}>
                                    {t('empty')}
                                    </Text>
                                </View>
                            </View>
                            :
                            <View style={{flex:1,}}>
                                {renderOrdersList(DATA)}
                            </View>
                        :
                            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                <ActivityIndicator size="large" />
                            </View>
                        
                    }
                        
                        
                        {/* </Card> */}
                  
                </View>
             
      {/* </ScrollView> */}
      </SafeAreaView>
  )
}

