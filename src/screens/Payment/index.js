import { View ,SafeAreaView, Image , StyleSheet ,ScrollView, SectionList} from 'react-native'
import React from 'react'
import { Card, Paragraph, RadioButton, Title ,FAB} from 'react-native-paper';
import HeaderApp from '../../shared/Header';
import { useNavigation } from '@react-navigation/native';
import Gtyles from '../../styles/Gstyle';
 
import AppButton from '../../components/auth/Button';
import PlatformTouchable from '../../components/PlatformTouchable';
import { backgroundColorHady, btnColor, btnColorDark, moreHady, textColor } from '../../utils/app';
import { useDispatch , useSelector} from 'react-redux';
import { CLEAR_FAWRY_REF_NUM, CLEAR_PAYMOB } from '../../redux/actions/ActionTypes';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text } from 'react-native';

// new Date().toLocaleString()
export default function PaymentScreen(props) {
     
    const myApp = useSelector( state => state.myApp );
    const wallet = useSelector( state => state.auth.wallet );
   
    const {t,i18n} = useTranslation();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [checked, setChecked] = React.useState('firsst');
  return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView contentContainerStyle={{flex:1}}>
    <HeaderApp navigation={navigation} homeFlag={false} title={t('wallet.title2')} />
    {
      (myApp.payment == 0) ? 
        <View style={{flex:1,backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
          <Image style={{width:100,height:100,marginBottom:15}} source={require('./../../../assets/images/icons/money_bag.png')} />
          <Text style={{fontSize:18}}> Thanks your wallet is {wallet} </Text>
        </View>
        :
        <View style={{paddingHorizontal:10}}>
        <Card style={{backgroundColor:'white'}}>
          <Card.Content>
          <Title style={styles.title}>{t('wallet.bank.title')}</Title>
            <View style={styles.imageWrapper}>
              <Image style={{height:39.1,width:55.1}} source={require('./../../../assets/images/payments/credit-card.png')} />
            </View>
            <View>
            
              <Paragraph style={styles.p}> {t('wallet.bank.slug')} </Paragraph>
              
  
              <TouchableOpacity style={styles.btn2} onPress={() => { 
                  dispatch({type: CLEAR_PAYMOB,payload:null});
                  navigation.navigate('Paywithbankcard');
                }}>
                <Text style={styles.btn2Text}>{t('wallet.pay_now')}</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        <Card style={{backgroundColor:'white',marginTop:15}}>
          <Card.Content>
          <Title style={styles.title}>{t('wallet.fawry.title')}</Title>
            <View style={styles.imageWrapper}>
              <Image style={styles.image} source={require('./../../../assets/images/payments/fawry.jpg')} />
            </View>
            <View>
            
              <Paragraph style={styles.p}>{t('wallet.fawry.slug')}  </Paragraph>
            
  
              <TouchableOpacity style={styles.btn2}  onPress={() => { 
                  dispatch({type: CLEAR_FAWRY_REF_NUM,payload:null});
                    navigation.navigate('ChooseChargingAmountFawry', {
                        provider: 'FAWRY',
                    });
                  }}>
                <Text style={styles.btn2Text}>{t('wallet.pay_now')}</Text>
              </TouchableOpacity>
  
            </View>
          </Card.Content>
        </Card>
        <Card style={{backgroundColor:'white',marginTop:15}}>
          <Card.Content>
          <Title style={styles.title}>{t('wallet.aman_momken.title')}</Title>
            <View style={styles.imageWrapper}>
              <Image style={styles.imagesm} source={require('./../../../assets/images/payments/aman.png')} />
              <Image style={styles.imagesm} source={require('./../../../assets/images/payments/masary.jpg')} />
              <Image style={styles.imagesm} source={require('./../../../assets/images/payments/momkn.png')} />
            
            </View>
            <View>
              
              <Paragraph style={styles.p}> {t('wallet.aman_momken.slug')} </Paragraph>
              <TouchableOpacity style={styles.btn2} onPress={() => { 
                  dispatch({type: CLEAR_PAYMOB,payload:null});
                    navigation.navigate('ChooseChargingAmountPaymob', {
                        provider: 'PAYMOB',
                    });
                  }}>
                <Text style={styles.btn2Text}>{t('wallet.pay_now')}</Text>
              </TouchableOpacity>
              
  
            
            </View>
          </Card.Content>
        </Card>
      </View>
    }
   
</ScrollView>
</SafeAreaView>
    
  )
}


const styles = StyleSheet.create({
  image: {
    width:50,
    height:50,
    marginEnd:5,
  },
  imagesm: {
    width:35,
    height:35,
    marginEnd:5,
  },
  imageWrapper:{
    marginTop:10,
    flexDirection:'row'
  },  
  title:{
    fontSize:18,
    borderBottomColor: btnColorDark,
    borderBottomWidth: 1,
    paddingBottom: 3,
    fontFamily:'Tajawal-Regular'
   
  },
  p: {
    marginTop: 10,
    fontFamily:'Tajawal-Regular',
    color:textColor
  },
  btn:{
    color:textColor,
    marginTop: 13,
    fontFamily:'Tajawal-Regular',
    backgroundColor: btnColorDark
  },
  btn2:{
    
    marginTop: 13,
    
    alignItems:'center',
    backgroundColor: btnColorDark,
    borderRadius:50,
    paddingVertical:12
  },
  btn2Text:{
   color:'white',
   fontFamily:'Tajawal-Regular',
    
  },
})