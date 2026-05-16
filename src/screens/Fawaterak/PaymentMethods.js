import { ActivityIndicator, Alert, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import HeaderApp from '../../shared/Header';
import axios from 'axios';
import { backgroundColorHady, btnColor, btnColorDark, domain, FAWATERK_Prefix, FAWATERK_TOKEN, FAWATERK_URK_TESTING, secondColor, senColor } from '../../utils/app';
import { Modal, Portal, Button, PaperProvider, Provider } from 'react-native-paper';
import AppInput from '../../components/auth/Input';
import AppButton from '../../components/auth/Button';
import Gtyles from '../../styles/Gstyle';
import { validate } from '../../utils/Validate';
import PlatformTouchable from '../../components/PlatformTouchable';
import { cutLongText } from '../../utils/HelperFunctions';
import { useSelector } from 'react-redux';

export default function PaymentMethods({ route, navigation },props) {

  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20,};
  const [phone,changePhone] = React.useState({value:'',isValid:false,touched:false,incomeError:''});
  const tokenK = useSelector(state => state.auth.token); 

  const updatePhone = phoneVal => { 
    changePhone({
        value: phoneVal,
        isValid: validate(phoneVal,[{key:'isPhone'},{key:'minChars',num:11}]),
        touched:true
    });
    // changephoneAlert({valueA:'Enter 11 digits',color:'red'});
}

    const {item_name,item_price,item_id,pay_type} = route.params;
    
    const {t,i18n} = useTranslation();
    const [methods,appendMethods] = React.useState(null)
   
    React.useEffect(()=>{
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${FAWATERK_TOKEN}`);
        
        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
        
        fetch(`https://${FAWATERK_Prefix}.fawaterk.com/api/v2/getPaymentmethods`, requestOptions)
        .then((response) => {
          // تحقق من حالة الاستجابة أولاً
          if (!response.ok) {
            // إذا كانت الاستجابة غير ناجحة، رمي خطأ
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // تحويل الاستجابة إلى JSON
          return response.json();
        })
        .then((data) => {
          // التعامل مع البيانات
          appendMethods(data.data); // هنا يمكنك التعامل مع البيانات المستلمة من الـ API
        })
        .catch((error) => {
          // التعامل مع الأخطاء
          r.error('Error:', error);
        });
           
            
      
          
       
    },[])

    const HandlePress = (method) => {
        if(method.paymentId  != 4){
            navigation.navigate('PayRedirectScreen', {
                logo: method.logo,
                paymentId: method.paymentId,
                paymentName: method.name_ar,
                item_id: item_id,
                item_price: item_price,
                item_name: item_name,
                pay_type:pay_type
            });
        }else{
          showModal();
        }

        
    }
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
      <ScrollView contentContainerStyle={{flexGrow:1,backgroundColor:'#f2f2f2'}}>
      <Provider>
      
        <HeaderApp navigation={navigation} homeFlag={false}  title={t('payment.methods_title')}  />

{
    methods ? 
    <View style={{flex:1,flexDirection:'column',paddingHorizontal:20}}>
        {methods.map((method, index) => (
           <TouchableOpacity key={method.paymentId} style={styles.subscribeButton}  onPress={() => HandlePress(method)}>
            <View key={method.paymentId} style={styles.methodWrapper}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                  <Image source={{uri: method.logo}} style={{width:90,height:45,resizeMode:'contain',marginEnd:15}} />
                  {/* maxWidth:Dimensions.get('window').width/1.7 */}
                  <Text style={{fontFamily:'Tajawal-Bold',fontSize:15,color:'black',marginTop:0,}} key={index}>
                      {cutLongText(method.name_ar,30)}
                  </Text>
                </View>
            </View>
            </TouchableOpacity>
        ))}
        
    </View>
     :
     <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator color={btnColor} size={'large'} />
     </View>
}

      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={[containerStyle,{marginHorizontal:20,borderRadius:10}]}>
        <AppInput isphoneKeyStyle={true} onChangeText={updatePhone} icon='phone-portrait' showVlidationfeedback touchUser={phone.touched} isValid={phone.isValid} placeholder={t('auth.wallet_placeholder')} secureTextEntry={false} keyboardType="numeric" />
            
          {/* <Text>Example Modal.  Click outside this area to dismiss.</Text> */}
          <View style={{  flexDirection:'row',alignItems:'center',justifyContent:'center', }}>
          <AppButton primary={true} title={t('payment.send_to_pay')} style={[Gtyles.button, Gtyles.primaryButton,{alignSelf:'center',marginTop:15}]} onPressP={() => {
              
              if(phone.isValid){
                var config = {method: 'post',url: domain + '/api/generateRef',headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},data:{order_id: item_id,ref_num:phone.value,method:'phone_wallet'}};
                  axios(config).then(res => {
                    setCodeOTP(data.data.payment_data[codeStr[paymentId]]);
                  }).finally(() => {
                    
                })
                navigation.navigate('PhoneWalletScreen', {
                  phoneWallet: phone.value,
                  item_id: item_id,
                  item_price: item_price,
                  item_name: '#'+ item_id,
                  pay_type:pay_type
              });
              }else{
                Alert.alert('خطأ','رقم الهاتف غير صحيح')
              }
             
          }}/> 
          </View>
        </Modal>
      </Portal>
     
    </Provider>
    </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
methodWrapper:{
  paddingVertical:15,
  paddingHorizontal:10,
  borderRadius:10,
  flexDirection:'row',
  flex:1,
  justifyContent:'space-between',
  alignItems:'center',
  marginVertical:6,
  backgroundColor:'white',
  flexWrap:'wrap'
}
})


// .then((response) => response.text())
// .then((result) => console.log(result))
// .catch((error) => console.error(error));