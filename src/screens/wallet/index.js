import { SafeAreaView, StyleSheet, Text, View , Image, TouchableOpacity ,RefreshControl ,TextInput  } from 'react-native'
import React from 'react'
import HeaderApp from '../../shared/Header'
import { useTranslation } from 'react-i18next';
import {  useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PlatformTouchable from '../../components/PlatformTouchable';
import { arabic_num } from '../../utils/HelperFunctions';
import AppButton from '../../components/auth/Button';
import Gtyles from '../../styles/Gstyle';
import { btnColor, btnColorDark, dangerHady, domain, successHady, textColor } from '../../utils/app';
import { Provider , Portal , Modal} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import styles from './style';
import PaymentOptionsBTNs from '../../components/PaymentOptions/PaymentOptionsBTNs';
import { CHANGE_FAWRY_KOISK_AMOUNT, CHANGE_PAYMOB_KOISK_AMOUNT, UPDATE_CREDIT, UPDATE_POINTS } from '../../redux/actions/ActionTypes';
// import { Fumi, Kaede, Kohana, Makiko } from 'react-native-textinput-effects';
 
 
import { ScrollView } from 'react-native';
import { validate } from '../../utils/Validate';

export default function Wallet({ route }) {
  const {t,i18n} = useTranslation();
  const navigation = useNavigation();
  const [paymentTempVar, setPaymentTempVar] = React.useState('bank');
  const [visible, setVisible] = React.useState(false);
  const [new_amount_state,change_new_amount_visiabilty] = React.useState({status:'',message:'',new_amount:0});
  const [loaderBTN, setLoader] = React.useState(false); 
  const[recentRecords,setRecentRecords] = React.useState([])
  const dispatch = useDispatch();
  const myAppPayment = useSelector( state => state.myApp.payment );
 const [BTvisible,setBTVisible]= React.useState(false) 
  const [amount,setAmount] = React.useState(null)
  const tokenK = useSelector( state => state.auth.token);
  const wallet = useSelector( state => state.auth.wallet);
  const points = useSelector( state => state.auth.points);
  const user = useSelector( state => state.auth.user);
  const [tphone,setTBPhone] = React.useState(null)
  const [tamount,setTBAmount] = React.useState(null)
  const [BTresponse,setBTresponse] = React.useState({color:'green',sent:'',complete:false})
  
  const containerStyle = {backgroundColor: 'white', padding: 20,alignItems:'center',paddingVertical:30};
 

  const fetchPaymentIntentClientSecret = () => {
    setLoader(false)
    if(paymentTempVar == 'bank'){
      // var config = {method: 'post',url: domain + '/api/create-payment-intent',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{amount}};
      // axios(config).then(res => {
      //   // setVisible(false)
      //   // alert(amount)
       
      //     // alert(res.data.PaymentIntentClientSecretRes)
      // }).catch((err) => {
      //   alert('Check your connection')
      // }).finally(() =>{
      //   setLoader(false)
      // });
      navigation.navigate('PayWithCard',{
        amount:Number(amount),
        // PaymentIntentClientSecret:res.data.PaymentIntentClientSecretRes
      })
    }
    else if(paymentTempVar == 'fawry'){
      dispatch({type:CHANGE_FAWRY_KOISK_AMOUNT,payload:Number(amount)})
      if(amount == 0){
        return (
            Alert.alert('Amount Required','Please enter amount you want to charge you wallet with')
        )
        }else{
          navigation.navigate('ConfirmInfoFawryScreen',{ //ConfirmInfoFawryScreen //PayWithAltPayment
            provider: 'FAWRY',
        })
      }
    }
    else {
      dispatch({type:CHANGE_PAYMOB_KOISK_AMOUNT,payload:Number(amount)});
      if(amount == 0){
        return (
            Alert.alert('Amount Required','Please enter amount you want to charge you wallet with')
        )
        }else{
          navigation.navigate('ConfirmInfoPaymobScreen',{
            provider: 'PAYMOB',
        })
      }
    }
  
  }


  const TransferBalanceHandler = () => {
    if(!validate(tphone,[{key:'isPhone'},{key:'minChars',num:11}])){
      setBTresponse({color:'red',sent:t('wallet.balance_transfer.phone.notValid'),complete:false});
      return;
    }else if(user.phone == tphone){
      setBTresponse({color:'red',sent:t('wallet.balance_transfer.phone.yourselfnot'),complete:false});
      return;
    }else{
      if(tamount < 50){
        setBTresponse({color:'red',sent:t('wallet.balance_transfer.amount.min'),complete:false});
        return;
      }else if(tamount > wallet){
        setBTresponse({color:'red',sent:t('wallet.balance_transfer.amount.not_suf'),complete:false});
        return;
      }else{
        setLoader(true);
        setBTresponse({color:'green',sent:'',complete:false})

        var config = {method: 'post',url: domain + '/api/transfer-balanc',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{tphone,tamount}};
        axios(config).then(res => {
            if(res.data == 'done'){
              dispatch({
                type:UPDATE_CREDIT,
                payload:Number(wallet)-Number(tamount)
              })
              setBTVisible(false);
              getRecentRecods();
            }else if(res.data == 'phonenot'){
              setBTresponse({color:'red',sent:t('wallet.balance_transfer.phone.notfound'),complete:false});
            }else if(res.data == 'walletnot'){
              setBTresponse({color:'red',sent:t('wallet.balance_transfer.amount.not_suf'),complete:false});
            }
        }).catch((err) => {
          alert('Check your connection')
        }).finally(() =>{
          setLoader(false)
        });
      }
    }
    
  }

  const getRecentRecods = () => {
    setRecentRecords([])
    var config = {method: 'get',url: domain + '/api/init-fnan-logs',headers: { 'Authorization': 'Bearer ' + tokenK , 'Content-Type': 'application/json','Accept': 'application/json'}};
    axios(config).then(res => {
       setRecentRecords(res.data.transactions)
       dispatch({
        type:UPDATE_CREDIT,
        payload:Number(res.data.wallet)
      });
      dispatch({
        type:UPDATE_POINTS,
        payload:Number(res.data.points)
      })
      //  setTotal(res.data.total)
    });
}
 
const [refreshing, setRefreshing] = React.useState(false);
    const wait = (timeout) => {
        return new Promise(resolve => setTimeout(resolve, timeout));
      }
    const onRefresh = React.useCallback(() => {
      getRecentRecods();
    }, []);
React.useEffect(()=>{
   getRecentRecods();
   if(route.params && route.params.new_amount){
    change_new_amount_visiabilty({status:route.params.status,message:route.params.message,new_amount:route.params.new_amount})
     
  }
},[])//focus
  return (
<Provider style={{flex:1}}>


<SafeAreaView style={{flex:1}}>  
      {(user.paymentAva == 0) ?
        <View style={{flex:1,backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
          <Image style={{width:100,height:100,marginBottom:15}} source={require('./../../../assets/images/icons/money_bag.png')} />
          <Text style={{fontSize:18}}> Thanks your wallet is {wallet} </Text>
        </View>
        :     
                    
<ScrollView style={{flex:1}} refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />
    } >

       
     
       
     <HeaderApp title={t('wallet.title')} />
        <View> 
            <View > 
              <View style={{alignItems:'center'}}>
                  <Text style={styles.title}>{t('wallet.sen')}</Text>
              </View>
             
             
            </View>

            <View style={{flexDirection:'row',paddingVertical:20,paddingHorizontal:5}}>
                <View style={[styles.green,Gtyles.btn_shadow]}>
                    <Text style={styles.current}>{t('wallet.current')}</Text>
                    <Text style={styles.current2}>{arabic_num(wallet) + ' ' + t('cur')}</Text>
                </View>
                <View style={[styles.green,Gtyles.btn_shadow,{backgroundColor:'white',}]}>
                    <Text style={[styles.current,{color:textColor}]}>{t('wallet.pointsCurrent')}</Text>
                    <Text style={[styles.current2,{color:textColor}]}>{arabic_num(points) + ' ' + t('point')}</Text>
                </View>
                
            </View>
            <View style={{paddingHorizontal:15,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',flexDirection:'row'}}>
            {/* {
              (myAppPayment != 0) ?
                  <AppButton title={t('wallet.btn00')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 7,backgroundColor:'white',color:'black',width:165,fontSize:13,paddingVertical:12}]}  onPressP={() => setVisible(true)}/> 
 
                  :
                  <Text style={{fontFamily:'Tajawal-Bold',color:'red',fontSize:14.6,alignSelf:'center',marginVertical:13,textAlign:'center',lineHeight:21}}>
                    {t('cashOff')}
                  </Text>
             } */}
               
                <AppButton title={t('wallet.btn0')} primary={false} style={[Gtyles.secondaryButton,styles.scondBTN]} onPressP={() =>setBTVisible(true)}/> 
                <AppButton title={t('wallet.btn1')} primary={false} style={[Gtyles.secondaryButton,styles.scondBTN]} onPressP={() =>navigation.navigate('Incomes')}/> 
                <AppButton title={t('wallet.btn2')} primary={false} style={[Gtyles.secondaryButton,styles.scondBTN]} onPressP={() => navigation.navigate('Outcomes')}/> 

                </View>
            <View style={styles.courtsWrapper}>
                <View style={{flex:1}}>
                      <View  style={styles.itemWrapper2}>
                        <Text style={styles.item_text2}> {t('wallet.table.t4')}</Text>
                        <Text style={styles.item_text2}> {t('wallet.table.t2')} </Text>
                        {/* <Text style={styles.item_text2}> {t('wallet.table.t5')} </Text> */}
                        <Text style={styles.item_text2}> {t('wallet.table.t3')} </Text>
                       
                      </View>
                      
                      { (recentRecords && recentRecords.length > 0) &&recentRecords.map(item => {
                        return (
                          <View  key={item.id}  style={[styles.itemWrapper,(item.io == 'i') ?{backgroundColor:successHady}: {backgroundColor:dangerHady}]}>
                          <Text style={styles.item_text}> {t('wallet.core.'+item.core)}</Text>
                          <Text style={styles.item_text}> {(item.io == 'i') ? '+ ': '- '} { arabic_num(item.amount) } {t('cur')} </Text>
                          {/* <Text style={styles.item_text}> {item.method} </Text> */}
                          <Text style={styles.item_text}> {item.date} </Text>
                        </View>
                        )  
                      })}
                      
                     
                </View>
                    <AppButton  title={t('backHome')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginTop: 30,alignSelf:'center',width:200}]}  onPressP={()=>navigation.navigate('HomeScreen')}  /> 
    
            </View>

            <Portal>
              <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={{backgroundColor: 'white', padding: 20, justifyContent:'flex-start',paddingTop:20,paddingBottom:50,top:0,position:'absolute',alignSelf:'center'}}>
              <PlatformTouchable onPress={() => setVisible(false)}>
              <Ionicons name="close" style={{color:'black',fontSize:25,fontWeight:"bold",alignSelf:'flex-start'}} />
              </PlatformTouchable>
                {/* you can choose payment type here  */}
                <View horizontal={true} style={{backgroundColor:'white',padding:10,justifyContent:'flex-start',alignItems:'flex-start',flexDirection:'row',display:'flex',flexWrap:'wrap'}}>
                  {/* Bank method */}
                  <PlatformTouchable onPress={() => setPaymentTempVar('bank')}>
                  <View style={stylesTemp.wrapper}>
                    {
                      (paymentTempVar == 'bank') &&
                      <Ionicons name='checkmark-circle' style={stylesTemp.checkIcon} />
                    }
                      <Image source={require('./../../../assets/images/payments/credit-card.png')} style={stylesTemp.bimg}/>
                      <Text style={stylesTemp.text}>{t('wallet.bank.title')}</Text>
                  </View>
                  </PlatformTouchable>

                  {/* Fawry method */}
                  {
                    (myAppPayment == 2) &&
                    <PlatformTouchable onPress={() => setPaymentTempVar('fawry')}>
                    <View style={stylesTemp.wrapper}>
                      {
                        (paymentTempVar == 'fawry') &&
                        <Ionicons name='checkmark-circle' style={stylesTemp.checkIcon} />
                      }
                        <Image source={require('./../../../assets/images/payments/fawry.jpg')} style={stylesTemp.img}/>
                        <Text style={stylesTemp.text}>{t('wallet.fawry.title')}</Text>
                    </View>
                    </PlatformTouchable>
                  }
                

                

              </View>
                    {/* end payment section */}
                <Text style={styles.inputHeader}>{t('wallet.chargetext')}</Text>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginVertical:10}}>
                <TextInput onChangeText={setAmount}  keyboardType="numeric"   placeholderTextColor={'grey'} placeholder={'_ _ _'} style={[styles.input,(i18n.language == 'ar') && {textAlign:'right'}]} />
                <Text style={styles.inputBesideTxt}>{t('cur')}</Text>
                </View>
                {
                  (amount && amount >= 30) ?
                  <AppButton isLoading={loaderBTN} disabled={!(!!amount)} title={t('wallet.chargeBTN')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginTop: 15,alignSelf:'center',width:150,fontSize:14 }]} onPressP={fetchPaymentIntentClientSecret}/>  
                  :
                  <Text style={styles.inputHeader2}>* {t('wallet.chargetext2')}</Text>

                }
                

              </Modal>

              <Modal visible={new_amount_state.status != ''} onDismiss={() => change_new_amount_visiabilty({status:'',message:'',new_amount:0})} contentContainerStyle={{backgroundColor: 'white', padding: 20,justifyContent:'space-around',paddingVertical:30,margin:10}}>
                <View>
                    <Image style={{height:80,width:80,alignSelf:'center'}} source={ (new_amount_state.status == 'A') ? require('./../../../assets/images/icons/sucesscard.png') : require('./../../../assets/images/icons/wrongcard.png')} />
                    <Text style={{textAlign:'center',paddingTop:10,fontSize:14,fontFamily:'Tajawal-Bold'}}>{   new_amount_state.message  }</Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:30,marginBottom:10}}>
                  
                </View>
              </Modal>

              <Modal visible={BTvisible} dismissable={false}  contentContainerStyle={{height:'90%',backgroundColor: 'white', padding: 20 ,justifyContent:'flex-start' }}>
              <PlatformTouchable onPress={() => setBTVisible(false)}>
              <Ionicons name="close" style={{color:'black',fontSize:25,fontWeight:"bold",alignSelf:'flex-start'}} />
              </PlatformTouchable>
              <Text style={{fontFamily:'Tajawal-Bold',color:textColor,fontSize:20,marginBottom:30,textAlign:'center'}}>{t('wallet.balance_transfer.title0')}</Text>
              
              <View style={{flexDirection:'row', marginBottom:10 }}>
                
                {
                  (BTresponse.sent != '') && 
                  <Text style={[stylesTemp.noteSen,{ color: BTresponse.color},{textAlign: (i18n.language == 'ar') ? 'right' :'left' }]}> * {BTresponse.sent} </Text>
                }
                
              </View>

              <Text style={{fontFamily:'Tajawal-Bold',color:textColor,fontSize:19,marginBottom:10,}}>{t('wallet.balance_transfer.title')}</Text>
                <View>
                <Text style={{fontFamily:'Tajawal-Bold',color:textColor,lineHeight:22,fontSize:15}}>{t('wallet.balance_transfer.des') + ' ' + arabic_num(wallet) + ' '+ t('cur')}</Text>
                </View>
                <View>
                
              <View style={{marginVertical:10}}>
              <Fumi
                  onChangeText={(text) => setTBPhone(text) }
                  label={t('wallet.balance_transfer.phone.label')}
                  iconClass={FontAwesomeIcon}
                  iconName={'mobile'}
                  iconColor={btnColor}
                  iconSize={25}
                  passiveIconColor={btnColor}
                  iconWidth={40}
                  keyboardType="numeric"
                  labelStyle={{fontFamily:'Tajawal-Bold',color:btnColorDark,fontWeight:null,fontSize:14}}
                  inputPadding={20}
                  inputStyle={{fontFamily:'Tajawal-Bold',color:btnColorDark,fontWeight:null,fontSize:14.5}}
                  
                />
                <Fumi
                label={t('wallet.balance_transfer.amount.label')}
                onChangeText={(text) => setTBAmount(text) }
                passiveIconColor={btnColor}
                  labelStyle={{fontFamily:'Tajawal-Bold',color:btnColorDark,fontWeight:null,fontSize:12.5}}
                  iconClass={FontAwesomeIcon}
                  iconName={'money'}
                  iconColor={btnColor}
                  iconSize={20}
                  iconWidth={40}
                  keyboardType="numeric"
                
                  inputStyle={{fontFamily:'Tajawal-Bold',color:btnColorDark,fontWeight:null,fontSize:14.5,textAlign:'left'}}
                  inputPadding={15}
                />
              </View>

  
                <AppButton isLoading={loaderBTN} title={t('wallet.balance_transfer.title')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 30,alignSelf:'center',width:'100%'}]} onPressP={() => TransferBalanceHandler()}    /> 

                </View>
                </Modal>
            </Portal>
          </View>
         
          </ScrollView>
             }
    </SafeAreaView>
    
    </Provider>
  )
}

const stylesTemp = StyleSheet.create({

  noteSen:{
    fontSize:14,
    fontFamily:'Tajawal-Bold',
   
  },
  img:{
      height:25,
      width:25,
  },
  bimg:{
    height:25,
    width:35,
  },
  wrapper:{
    backgroundColor:'white',
    borderColor:'#ddd',
    borderWidth:1,
    width:100,
    alignItems:'center',
    paddingVertical:10,
    borderRadius:2,
    marginHorizontal:8,
    marginTop:20,

  },
  text:{
    fontFamily:'Tajawal-Bold',
    color:textColor,
    fontSize:11,
    marginTop:8
  },
  checkIcon:{
    color:'green',
    fontSize:25,
    position:'absolute',
    zIndex:999,
    backgroundColor:'white',
    end:-10,
    
  }
})

 