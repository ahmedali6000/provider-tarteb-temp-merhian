import { View, Text ,SafeAreaView, Image , ScrollView, TouchableOpacity} from 'react-native'
import React from 'react'
import { RadioButton ,Badge, FAB , List, Title, Card , Paragraph } from 'react-native-paper';
import HeaderApp from '../../shared/Header';
import { useNavigation } from '@react-navigation/native';
import Gtyles from '../../styles/Gstyle';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AppButton from '../../components/auth/Button';
import { btnColor, btnColorDark, textColor } from '../../utils/app';
import { useDispatch, useSelector } from 'react-redux';
import { FLUSH_ORDER_DATA } from '../../redux/actions/ActionTypes';
import { arabic_num } from '../../utils/HelperFunctions';
import { useTranslation } from 'react-i18next';



export default function PreOrderRevsion(props) {
     
  const sum = (key) => {
    return this.reduce((a, b) => a + (b[key] || 0), 0);
}
    const dispatch = useDispatch();
    const user = useSelector( state => state.auth.user );
    const myorder = useSelector( state => state.order );
    const navigation = useNavigation();
     const {t,i18n} = useTranslation();
    const [total_price , changeTotalPrice] = React.useState(0);
    React.useEffect(() => { 
      
      changeTotalPrice(myorder.order_services.reduce((n, {price,count}) => n + (price * count), 0))
      
   
     
    },[])
    return (
    <SafeAreaView style={{flex:1}}>
    <ScrollView contentContainerStyle={{flexGrow: 1}} >
    <HeaderApp navigation={navigation} homeFlag={false} title={t('order.content.title_rev')} />
     
      
        { (myorder.order_category_id != null) ?
        <View style={{flex:1,}}>
          <View style={{flex:1,backgroundColor:'white',paddingHorizontal:30,paddingVertical:20}}>
          <View style={{flex:1}}>
              <View style={[Gtyles.MROW,{marginVertical:7}]}>
                    <Ionicons style={Gtyles.h_icon} name="payment" />
                    <Text style={Gtyles.h}>
                    {myorder.order_category_name} ( {arabic_num(total_price)} {t('cur')} )
                    </Text>
                </View>
                {
                  myorder.preview ?
                      <List.Item
                      key={Math.random(1,5555)}
                          right={props => <Text style={{color:textColor,fontFamily:'Tajawal-Regular'}}> {arabic_num(myorder.preview_cost)} </Text>}
                          title={t('service_num') + ' ' + arabic_num((1))}
                          titleStyle={{fontSize:14,color:textColor,fontFamily:'Tajawal-Medium'}}
                          description={t('order.preview.btn')}
                          descriptionStyle={{color:btnColor,fontFamily:'Tajawal-Bold',fontSize:12,lineHeight:18,marginTop:10}}
                          left={props => <List.Icon {...props} icon="plus-circle-outline" />}
                      />
                  :

                  <View style={{ paddingTop:10}}>
                  {myorder.order_services.map((service ,index) => {
                      return <List.Item
                      key={Math.random(1,5555)}
                          right={props => <Text style={{color:textColor,fontFamily:'Tajawal-Regular'}}> {arabic_num(service.price) + ' x ' + arabic_num(service.count)} </Text>}
                          title={t('service_num') + ' ' + arabic_num((index + 1))}
                          titleStyle={{fontSize:14,color:textColor,fontFamily:'Tajawal-Medium'}}
                          description={service.service_name}
                          descriptionStyle={{color:btnColor,fontFamily:'Tajawal-Bold',fontSize:12,lineHeight:18,marginTop:10}}
                          left={props => <List.Icon {...props} icon="plus-circle-outline" />}
                      />
                  })}
                  </View>
                }
          </View>
           
           <View style={{flexDirection:'row',justifyContent:'space-around'}}>
              <AppButton  title={t('order.content.next_step')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:150}]} onPressP={() => navigation.navigate('LocationSelectScreen')}/> 
              <AppButton  title={t('order.content.remove_all')} primary={false} style={[Gtyles.button,Gtyles.secondaryButton,{marginVertical: 15,width:150}]} onPressP={() => dispatch({type:FLUSH_ORDER_DATA,payload:null})}/> 
           </View>

          </View>
        </View>

        :

        <View style={{flex:1}} >
          <View style={[Gtyles.shadowFullCard,{flex:1,alignItems:'center',justifyContent:'center'}]}>
            <Image source={require('./../../../assets/images/noorders.png')} style={{width:414/4.5,height:603/4.5,alignSelf:'center'}}  />
            <Text style={{fontSize:15.5,color:textColor,marginTop:20,fontFamily:'Tajawal-Bold',}}>
             {t('order.content.empty')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllCategories')}>
            <Text style={{fontSize:13,fontFamily:'Tajawal-Medium',color:btnColorDark,marginTop:8}}>
             {t('order.content.you_can_show')}
            </Text>
            </TouchableOpacity>
             
          </View>
        </View>
        }


     </ScrollView>
</SafeAreaView>
    
  )
}
