import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';
import { btnColor, domain, FAWATERK_Prefix, FAWATERK_TOKEN, FAWATERK_URK_TESTING, succesColor } from '../../utils/app';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import RNRestart from 'react-native-restart';
import HeaderApp from '../../shared/Header';

export default function PhoneWalletScreen({ route, navigation },props) {
 const tokenK = useSelector(state => state.auth.token); 

   const {t,i18n} = useTranslation();
const [codeOTP,setCodeOTP] = React.useState(null);
    const {item_name,item_price,item_id,paymentId,paymentName,logo,phoneWallet} = route.params;
    const [showWebView, setShowWebView] = React.useState(false);
 
const user = useSelector(state => state.auth.user);
     
  const [paymentUrl, setPaymentUrl] = React.useState('');
  const [sentAlready, setSentAlreadyl] = React.useState(false);

    // Configuration values
const API_URL = FAWATERK_URK_TESTING;
const API_TOKEN = FAWATERK_TOKEN;
const PAYMENT_id = 4; // 2=Visa-MasterCard 3=Fawry 4=Meeza

 
const handleCancel = () => {
  // يمكن إضافة التنقل أو أي منطق آخر هنا
  RNRestart.Restart()
};
const requestData = {
    payment_method_id: PAYMENT_id,
    cartTotal: item_price,
    currency: 'EGP',
    customer: {
        first_name: (user) ? user.name : 'test',
        last_name: 'tarteb',
        email: 'test@test.test',
        phone: phoneWallet,
        address: (user) ? user.address : 'test address',
    },
    redirectionUrls: {
      successUrl: 'https://dev.fawaterk.com/success',  //you should change this to the Url you want to redirect
      failUrl: 'https://dev.fawaterk.com/fail',
      pendingUrl: 'https://dev.fawaterk.com/pending',
    },
    cartItems: [
      {
        name: item_name,
        price: item_price,
        quantity: '1',
      },
    ],
  };

  const handlePayment = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    };

    if(sentAlready == false){
      fetch(`https://${FAWATERK_Prefix}.fawaterk.com/api/v2/invoiceInitPay`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setSentAlreadyl(true)
          console.warn(data)
            var config = {method: 'post',url: domain + '/api/generateRef',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{order_id: item_id,phone_wallet:phoneWallet,meezaReference:data.data.payment_data.meezaReference,invoice_id:data.data.invoice_id,method:'mobileWallet',amount:item_price}};
            axios(config).then(res => {
              console.warn(res.data)
            //   setCodeOTP(data.data.payment_data[codeStr[paymentId]]);
            }).catch(err => {
              console.error(err.response.data)
            }).finally(() => {
              
            })
           
           
            
         
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
    
  };

  React.useEffect(()=>{
    if(!showWebView){
        handlePayment()
    }
    
},[paymentUrl])



  return (
   
      <SafeAreaView style={{flex:1}}>
        <HeaderApp />
      <View style={{flex:1}}>
         <View style={styles.container}>
      {/* Close Button */}
      {/* <TouchableOpacity onPress={() => { navigation.goBack(); }} style={styles.closeButton}  >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity> */}

      {/* Icon */}
      <View style={styles.iconContainer}>
          <Image source={require('./../../../assets/images/wallet.png')} style={{width:200,height:200,resizeMode:'contain'}} />
      </View>


      {/* Description */}
      <Text style={styles.description}>
          {t('payment.wallet_des')}
      </Text>

      {/* Cancel Button */}
      <TouchableOpacity style={[styles.cancelButton,{backgroundColor:succesColor}]}  >
        <Text style={styles.cancelButtonText}>{t('payment.finish')}</Text>
      </TouchableOpacity>
    </View>
      </View>
       
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
  },
  iconContainer: {
    // width: 100,
    // height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 70,
   
  },
  title: {
    fontFamily:'Tajawal-Bold',
    fontSize: 20,
     
    marginBottom: 10,
  },
  description: {
    fontFamily:'Tajawal-Medium',
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
    lineHeight: 26,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily:'Tajawal-Bold',
  },
})