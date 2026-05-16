import React from 'react'
import {View ,Text ,SafeAreaView ,ScrollView,Image , FlatList, TouchableOpacity} from 'react-native'

import HeaderApp from '../../shared/Header'

import styles from './style'

import { Root } from 'react-native-alert-notification'
import { useSelector } from 'react-redux'
import { btnColor, danger, domain, textColor } from '../../utils/app'
import axios from 'axios'
import Gtyles from '../../styles/Gstyle'
import { useTranslation } from 'react-i18next'
import AppButton from '../../components/auth/Button'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { Modal ,Portal, Button, Provider , ActivityIndicator} from 'react-native-paper';
import PlatformTouchable from '../../components/PlatformTouchable'

const SupportPage = ({ route, navigation }) =>  {
    const {t,i18n} = useTranslation();
    const user = useSelector( state => state.auth.user);
    const tokenK = useSelector( state => state.auth.token);
    const [DATA,appendData] = React.useState(null);
    const [remoedMsgID,addRemoedMsgID] = React.useState(0);
    const [remoednow,addremoednow] = React.useState([]);
    const removeMessageHandler = () => {

        var config = {method: 'delete',url: domain + '/api/delete-support',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{mm_id:remoedMsgID}};
        axios(config).then(res => {
            remoednow.push(remoedMsgID)
            addRemoedMsgID(0);
        }).catch(err => {
            
        })
        
        
    }
    const containerStyle = {backgroundColor: 'white', padding: 20,};
    const getMessages = () => {
        var config = {method: 'get',url: domain + '/api/mysupports',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            appendData(res.data)
        })
    } 
    const focus = useIsFocused();
    React.useEffect(() =>{ 
        if(focus == true){
            getMessages();
    }
    },[focus,remoednow]) 

    const rederMsg = ({item}) =>{
        if(1==1) {
            return (
                (remoednow.includes(item.id)) ? <View></View> :
                <PlatformTouchable onLongPress={() => addRemoedMsgID(item.id)}>
                <View style={{paddingHorizontal:30,paddingVertical:15,backgroundColor:'white',marginVertical:10}}>
                <View style={[styles.nextIMGViewWrapper]}>
                <Image style={styles.img} source={{uri: user.image}} />
                 <View>
                     <Text style={styles.name}> {user.name} </Text>
                     <Text style={styles.date}> {item.created_at} </Text>
                     <Text style={styles.info}> {(item.read == 1) ? t('support.page.seen') : t('support.page.notseen')} - {(item.contacted == 1) ? t('support.page.contacted') : t('support.page.notcontacted')} </Text>
                 </View>
                 </View>
                 <Text style={styles.msg}>
                        {item.msg} 
                 </Text>
    
             </View>
             </PlatformTouchable> 
            )
        }else{
            return (
                <View></View>  
            );
        }
        
    }
    const renderMsgsList = (orders) => {
        return (
            <FlatList
                data={orders}
                onEndReached={() => (DATA.length > 10) ? setPageNum(pageNum+1) : null}
                onEndReachedThreshold={0.5}
                renderItem={rederMsg}
                keyExtractor={(item, index) => index.toString()}
                // showsVerticalScrollIndicator={false}
                // refreshing={isRefreshing} // Added pull to refesh state
                // onRefresh={onRefresh} // Added pull to refresh control
                />
            );
    }
    return (
        <Provider>
            <SafeAreaView style={{flex:1}}>
            {/* <ScrollView contentContainerStyle={{flexGrow: 1}} > */}
            <HeaderApp navigation={navigation}  title={t('support.title')} />
                <View style={{flex:1,backgroundColor:'transparent',flex:1}}>
                    <View style={{paddingHorizontal:30,paddingVertical:15,backgroundColor:'white',marginVertical:10}}>
                        <Text  style={styles.des}> {t('support.des')} </Text>
                        <AppButton title={t('support.addbtn')} primary={false} style={[Gtyles.button,Gtyles.secondaryButton,{marginVertical: 15,width:'85%',maxWidth:300,alignSelf:'center'}]} onPressP={() => navigation.navigate('SupportSendScreen')}/> 

                     </View>
                     
                    {(DATA != null) ?
                    
                    <View style={{flex:1}}>
                    {renderMsgsList(DATA)}
                    </View> 
                    :
                    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
                        <ActivityIndicator size={'large'} color={btnColor} />
                        </View>
                    }
                    
                </View>
               
        {/* </ScrollView> */}

        <Modal visible={(remoedMsgID > 0) ? true : false} dismissable={true} onDismiss={() => addRemoedMsgID(0)} contentContainerStyle={[containerStyle,{marginHorizontal:20,paddingVertical:30}]}>
                {
                    <View style={{ }}>
                        <Text style={{ fontFamily:'Tajawal-Bold',color:textColor,fontSize:14,lineHeight:22,marginVertical:15,textAlign:'center'}}>
                            {t('support.remove.title')}
                        </Text>
                        <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                            <AppButton title={t('support.remove.yes')}  primary={false} style={[Gtyles.button,Gtyles.secondaryButton,{marginVertical: 15,width:100,alignSelf:'center'}]}  onPressP={() => {removeMessageHandler()}}/> 
                            <AppButton title={t('support.remove.no')}  primary={false} style={[Gtyles.button,Gtyles.secondaryButton,{marginVertical: 15,width:100,alignSelf:'center'}]} onPressP={() => {addRemoedMsgID(0)}}/> 
                        </View>
                    </View>
                }
            </Modal>
        </SafeAreaView>
         
        </Provider>
        );

}

export default SupportPage;
