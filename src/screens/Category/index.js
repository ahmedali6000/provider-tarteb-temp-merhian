import { View, Text,Image, ScrollView ,SafeAreaView , FlatList, TextInput, TouchableOpacity} from 'react-native'
import React from 'react'
import HeaderApp from '../../shared/Header';
import {useDispatch, useSelector} from 'react-redux';
import { backgroundColorHady, btnColor, btnColorDark, domain, LOADER_TIME_DELAY_PLUS, minCost, moreHady, textColor } from '../../utils/app';
import axios from 'axios';
import styles from './style';
import ServiceCard from '../../components/Service';
import { Provider , Portal , Modal} from 'react-native-paper';
import Gtyles from '../../styles/Gstyle';
import PlatformTouchable from '../../components/PlatformTouchable';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import { arabic_num } from '../../utils/HelperFunctions';
import { useTranslation } from 'react-i18next';
import AppButton from "../../components/auth/Button";
import { Add_Service_To_Order, changePreview } from '../../redux/actions/authActionCreator';
import { Checkbox } from 'react-native-paper';

import { useIsFocused, useNavigation } from '@react-navigation/native';


export default function CategoryScreen({ route, navigation },props) {
  const {t,i18n} = useTranslation();
  const {category} = route.params;
  const rederService = ({item}) =>{
    return <ServiceCard service={item} category={category} />
   
    
  }
  const [load,changeLoaded] = React.useState(true);
  const tokenK = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const myorder = useSelector( state => state.order );
  
  const preview =  useSelector(state => state.order.preview);
  const [pageNum,setPageNum] = React.useState(1);
  const [DATA,appendData] = React.useState([]);
  const [input,setInput] = React.useState('');
  const [vs,setVisableSearch] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const dispatch = useDispatch();
  const [total_price , changeTotalPrice] = React.useState(0);
  const [canload , changeCanload] = React.useState(true);

 
  const submitBTN = () => {
    if(total_price < user?.mincharge){
      setVisible(true);
    }else{
      NAVIGATE_TO_LOCATION_SCREEN_HANDLER();
    }
  }
  const NAVIGATE_TO_LOCATION_SCREEN_HANDLER = () => {
    
   
    // if(myorder.order_category_id != null && category.id == myorder.order_category_id){
      navigation.navigate('LocationSelectScreen')
    // }else{
    //   return (
    //     Dialog.show({
    //       type: ALERT_TYPE.WARNING,
    //       title: t('category.warn.title'),
    //       textBody: t('category.warn.des'),
    //       button: t('understood'),
    //   })
    //   )
    // }
    
  }


  const GET_SERVICES = () => {
     if(canload){
      var config = {method: 'get',url: domain + `/api/services?category_id=${category.id}&page=${pageNum}&key=${input}`,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
      axios(config).then(res => {
       
        if(input != ''){
           
          appendData(res.data)
         
        }else{
          
          appendData(DATA.concat(res.data))
        }
        changeCanload(false)
      }).catch(err=>{
       
      })
     }
     
     
  }
  const updateInput = value => {
    setInput(value);
  }

  const focus = useIsFocused();

  const previewHandler = () => {
    dispatch(changePreview(category.id,category.name,!myorder.preview,category.previewCost));
  }
  
  React.useEffect(()=>{
    if(focus == true){
     
      
  
    changeTotalPrice(myorder.order_services.reduce((n, {price,count}) => n + (price * count), 0)  + myorder.preview_cost)
      // if(input != '')
      // {
      //   appendData([])
      // setTimeout(() => {
      //   GET_SERVICES(category.id);
      // }, 50);
      // }else{
        GET_SERVICES(category.id);
      // }
      
        
     }
   
  },[pageNum,myorder, input])

  return (
    <Root>
    <Provider>
    <SafeAreaView style={{flex:1,backgroundColor:'#f5f5f5',position:'relative'}}>
    <HeaderApp navigation={navigation} drawer={false} profileView={false} title={category.name +' ( '+  arabic_num(category.services_count) + ' ' + t('order.screen.service') + ' )' }  />
    
    
     <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingHorizontal:5}}>
          {/* <View style={{flexDirection:'row',alignItems:'center'}}>
          <Image source={require('../../../assets/images/logo.png')} style={{width:50,height:50}} />
          <Text style={{fontSize:19,fontFamily:'Tajawal-Regular',color:btnColorDark}}> {category.name} ( { arabic_num(category.services_count) + ' ' + t('order.screen.service') } ) </Text>
          </View> */}
          {
            // !(myorder.preview && myorder.order_category_id == category.id) &&
            <PlatformTouchable onPress={() => setVisableSearch(!vs)}>
              <Ionicons style={{fontSize:23,fontWeight:'bold',marginEnd:10,position:'absolute',top:20,zIndex:99999999,backgroundColor:'red'}} name="search" />
            </PlatformTouchable>
          }
         
      </View>
      
      {vs ?
      <View style={{paddingHorizontal:1}}>
        <View style={[{marginTop:1,marginHorizental:1,backgroundColor:'white',borderWidth:2,borderColor:'#ddd'}]}>
            <View style={{ flexDirection:'column'}}>
                <View style={{flexDirection:'row',paddingHorizontal:10}}>
                    
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <Ionicons style={{fontSize:17,marginEnd:5}} name='search' />
                    </View>
                    <TextInput  placeholder={t('pricing_guide.search_placeholder')} onChangeText={updateInput} style={styles.input}  /> 
                </View>
            </View>
        </View>
      </View>
     
      :

      <View style={{backgroundColor:'#d9f4ff',marginVertical:3}}>
        <View style={{paddingHorizontal:15,paddingTop:10}}>
          <Text style={styles.previewTxt}>
            {t('order.preview.des')}
          </Text>
           
          {/* <AppButton title={t('order.preview.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,fontSize:14,alignSelf:'center'}]} onPressP={previewHandler}/>  */}
          <View style={{flexDirection:'row',alignItems:'center',marginVertical:10,paddingVertical:8,backgroundColor:'white',paddingHorizontal:20}}>
                <View style={{borderColor:'black',borderWidth:1,borderRadius:50}}>
                    <Checkbox.IOS
                        color={btnColorDark}
                        status={(myorder.preview && myorder.order_category_id == category.id) ? 'checked' : 'unchecked'}
                        onPress={() => {
                            previewHandler();
                        }}
                    />
                </View>
                <Text style={{fontSize:14,marginStart:8, color:textColor,fontFamily:'Tajawal-Medium',}}> {t('order.preview.btn') + ' ( ' +category.previewCost + t('cur') + ' ) '} </Text>
            </View>
        </View>
        
      </View>
  }
    { DATA && 

    <View style={[{flex:1},(total_price > 0) && {marginBottom:70}]}>
      {
        (myorder.preview && myorder.order_category_id == category.id) ?
        <View style={{justifyContent:'center',alignItems:'center',padding:30}}>
        <Image source={require('./../../../assets/images/prev1.png')} style={{width:200,height:200}} />
        <Text style={{fontFamily:'Tajawal-Medium',color:textColor,fontSize:13,marginTop:20,marginBottom:20}}> {t('preview.category.title')} </Text>
        </View>
        :
          <FlatList
          data={DATA}
          onEndReached={() =>  {if((input == '')) {setPageNum(pageNum+1);changeCanload(true)}else { } } }
          onEndReachedThreshold={0.5}
          renderItem={rederService}
          keyExtractor={(item, index) => index.toString()}
          />
          
      }
    
      
    </View> 
}
     
     {
      (total_price > 0 && myorder.order_category_id != null) &&
      <PlatformTouchable onPress={()=>{submitBTN()}}>
      <View style={{position:'absolute',bottom:10,backgroundColor:btnColorDark,
      borderRadius:7,
      width:'95%',
      alignSelf:'center',
      paddingVertical:15,
      paddingHorizontal:20,
      flexDirection:'row',
      justifyContent:'space-between'
      }}>
        <Text style={{fontSize:14,color:'white',fontFamily:'Tajawal-Regular'}}>{t('category.select_bot')} ( {arabic_num(total_price) + ' ' + t('cur')} )</Text>
      
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:15,color:'white',fontFamily:'Tajawal-Regular',}}> {t('next')} </Text>
        {/* <Ionicons style={[(i18n.language == 'ar') && {transform: [{rotateY: '180deg'}]},{color:'white',fontSize:20}]} name="navigate-next" /> */}
        </View>
       
    </View>
    </PlatformTouchable>

     }
     
     
   

    <Portal>
            <Modal visible={visible} onDismiss={() => setVisible(false)} dismissable={false} contentContainerStyle={{backgroundColor: 'white',marginHorizontal:10}}>
            
           
              <View horizontal={true} style={{backgroundColor:'white',padding:10,justifyContent:'flex-start',alignItems:'flex-start',flexDirection:'row', padding: 20,paddingVertical:30}}>
                  <TouchableOpacity style={{position:'absolute',top:12,start:12}} onPress={() => setVisible(false)}> 
                    <Ionicons name="close" style={{fontSize:22,fontWeight:'bold',color:'black',}} />
                  </TouchableOpacity>
                <View style={{justifyContent:'center',alignItems:'center'}}>
                    <Image style={{width:100,height:100}} source={require('./../../../assets/images/minCost.png')} />
                    <Text style={{ color:'black',fontFamily:'Tajawal-Bold',fontSize:14,lineHeight:22,textAlign:'center',marginVertical:15}}> {t('category.minCharge.text',{ min: arabic_num(user.mincharge) })} </Text>
                    <AppButton title={t('category.minCharge.continueAnyWay')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'green',width:'auto',fontSize:13.2}]} onPressP={() => {NAVIGATE_TO_LOCATION_SCREEN_HANDLER()}}/> 
                </View>

              </View>
              
             
              
            
            </Modal>
          </Portal>
    </SafeAreaView>
    </Provider>
    </Root>
  )
}
