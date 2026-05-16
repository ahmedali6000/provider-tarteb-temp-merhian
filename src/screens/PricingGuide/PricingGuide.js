import { View, Text,Image, ScrollView ,SafeAreaView , FlatList, TextInput} from 'react-native'
import React from 'react'
import HeaderApp from '../../shared/Header';
import {useSelector} from 'react-redux';
import { backgroundColorHady, btnColor, btnColorDark, domain, LOADER_TIME_DELAY_PLUS, moreHady } from '../../utils/app';
import axios from 'axios';
import styles from './style';
import Loader from '../../components/Loader';
import Gtyles from '../../styles/Gstyle';
import PlatformTouchable from '../../components/PlatformTouchable';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../utils/HelperFunctions';




export default function PricingGuide({ route, navigation },props) {
  const show_alert = useSelector( state => state.myApp.urgentPopUp);
  const {t,i18n} = useTranslation();
  const renderPrice = ({item}) =>{
    return (
    <View style={styles.item_wrapper}>
        <Text style={styles.top_text}>{item.name}</Text>
        <Text style={styles.down_text}>{arabic_num(item.price)} {t('cur')}</Text>
    </View>
    );
  }
  const [load,changeLoaded] = React.useState(true);
  const tokenK = useSelector(state => state.auth.token);
   
  const [pageNum,setPageNum] = React.useState(1);
  const [DATA,appendData] = React.useState([]);
  const [input,setInput] = React.useState('');
  const [vs,setVisableSearch] = React.useState(false);
  

 
  const updateInput = value => {
    setInput(value);
  }

  const GET_DATA = () => {
      var config = {method: 'get',url: domain + `/api/provider/pricing_guide?page=${pageNum}&key=${input}`,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
      axios(config).then(res => {
        if(input == '' || input == null){
            appendData(DATA.concat(res.data));
            changeLoaded(false);
        }else{
            appendData(res.data)
        }
      }).catch(err=>{
      })
  }
   
  React.useEffect(()=>{
        GET_DATA();
  },[pageNum,input])

  return (
    <SafeAreaView style={{flex:1}}>
    {/* <View contentContainerStyle={{flexGrow: 1}} > */}
     
     <HeaderApp navigation={navigation} homeFlag={false} title={t('pricing_guide.title')} />
     <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'white',justifyContent:'space-between',paddingHorizontal:5}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
          <Image source={require('../../../assets/images/logo.png')} style={{width:50,height:50}} />
          <Text style={{fontSize:18,fontFamily:'Tajawal-Medium',color:btnColorDark}}> {t('pricing_guide.title')} </Text>
          </View>
          <PlatformTouchable onPress={() => {setVisableSearch(!vs);setInput('');setPageNum(1)}}>
          <Ionicons style={{fontSize:23,fontWeight:'bold',marginEnd:10}} name={(vs) ? 'clear' : 'search'} />
          </PlatformTouchable>
      </View>
      {vs && 
      <View style={{paddingHorizontal:5}}>
      <View style={[styles.card,Gtyles.shadow,{marginTop:5,marginHorizental:50,backgroundColor:'white'}]}>
          <View style={{ flexDirection:'column'}}>
              <View style={{flexDirection:'row',paddingHorizontal:10}}>
                  
                  <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                      <Ionicons style={{fontSize:17,marginEnd:5}} name='search' />
                  </View>
                  <TextInput  placeholder={t('pricing_guide.search_placeholder')} onChangeText={updateInput} style={[styles.input,(i18n.language=='ar')&& {textAlign:'right'}]}  /> 
              </View>
          </View>
      </View>
    </View>
      }
      
    { DATA && 

    <View style={{flex:1}}>
      <FlatList
      
      data={DATA}
      onEndReached={() => setPageNum(pageNum+1)}
      onEndReachedThreshold={0.5}
      renderItem={renderPrice}
      keyExtractor={(item, index) => index.toString()}
      />
      
    </View> 
    }
     
 
    {/* </View> */}
    
    <Loader isLoading={load} />
    
    </SafeAreaView>
  )
}
