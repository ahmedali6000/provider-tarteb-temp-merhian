import { SafeAreaView, StyleSheet, Text, View , FlatList } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import styles from './style';
import { domain, successHady } from '../../utils/app';
import axios from 'axios';
import { arabic_num } from '../../utils/HelperFunctions';
import { useTranslation } from 'react-i18next';
import Empty from '../../components/Empty'; 
import HeaderApp from '../../shared/Header';


export default function Incomes() {

  const [pageNum,setPageNum] = React.useState(1);
  const [DATA,appendData] = React.useState([]);
  const tokenK = useSelector(state => state.auth.token);
  const {t,i18n} = useTranslation();

  const GET_DATA = () => {
    var config = {method: 'get',url: domain + `/api/gt-incomes?page=${pageNum}`,headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
    axios(config).then(res => {
      
          appendData(DATA.concat(res.data));
         
     
    }).catch(err=>{
    })
}

  React.useEffect(()=>{
      GET_DATA();
      
  },[pageNum])
 
 
  const renderRecord = ({item}) =>{
    return (
      <View  style={[styles.itemWrapper,{backgroundColor:successHady}]}>
      <Text style={styles.item_text}> {t('wallet.core.'+item.core)}</Text>
      <Text style={styles.item_text}>+ {arabic_num(item.amount) } {t('cur')} </Text>
      {/* <Text style={styles.item_text}> {item.method} </Text> */}
      <Text style={styles.item_text}> {item.date} </Text>
    </View>
    );
  }


  return (
    <SafeAreaView style={{flex:1}}>
      <HeaderApp title={t('wallet.btn1')} />
      <View style={{flex:1,backgroundColor:'white'}}>
      <View  style={styles.itemWrapper2}>
            <Text style={styles.item_text2}> {t('wallet.table.t1')}</Text>
            <Text style={styles.item_text2}> {t('wallet.table.t2')} </Text>
            {/* <Text style={styles.item_text2}> {t('wallet.table.t5')} </Text> */}
            <Text style={styles.item_text2}> {t('wallet.table.t3')} </Text>
          </View>
           

          {
            (DATA && DATA.length == 0) ?
            <Empty /> :

            <FlatList
            data={DATA}
            onEndReached={() => setPageNum(pageNum+1)}
            onEndReachedThreshold={0.5}
            renderItem={renderRecord}
            keyExtractor={(item, index) => index.toString()}
          />
          }
           
      </View> 
    
    </SafeAreaView>
  )
}

 