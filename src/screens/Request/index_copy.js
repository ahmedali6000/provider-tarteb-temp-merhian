import { View, Text ,SafeAreaView, Image , ScrollView, ImageBackground ,TextInput } from 'react-native'
import React from 'react'


import { Checkbox , RadioButton ,Badge, FAB , List, Title, Card , Paragraph,  } from 'react-native-paper';
import HeaderApp from '../../shared/Header';
import { useNavigation , useIsFocused } from '@react-navigation/native';
import Gtyles from '../../styles/Gstyle';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AppButton from '../../components/auth/Button';
import PlatformTouchable from '../../components/PlatformTouchable';
import { backgroundColorHady, btnColor, btnColorDark, danger, domain, minCost, moreHady, textColor } from '../../utils/app';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import LottieView from 'lottie-react-native';
import styles from './style';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Modal, Portal, Provider } from 'react-native-paper';

import { FATHER_ATTENDACE, FLUSH_ORDER_DATA, UPDATE_CADOO } from '../../redux/actions/ActionTypes';
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../utils/HelperFunctions';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native';
import AppInput from '../../components/auth/Input';
import { validate } from '../../utils/Validate';
// new Date().toLocaleString()
export default function RequestView(props) {
  // const [checked, setChecked] = React.useState('father');
    const myorder = useSelector( state => state.order );
    const dispatch = useDispatch();
    const [searching_provider,change_searching_provider] = React.useState(false)
    // const [cadoo , setCadoo] = React.useState(null);
    const [total_price , changeTotalPrice] = React.useState(0);
    const [Realtotal_price , changeRealtotal_price] = React.useState(0);
    const [isLoading , changeIsLoading] = React.useState(false);
    const [requestState , setRequestState] = React.useState(false);
    const cadoo = useSelector( state => state.order.cadoo);
    const fatherHere = useSelector( state => state.order.fatherHere);
    const user = useSelector( state => state.auth.user );
    const tokenK = useSelector(state => state.auth.token);
    const myaddress = useSelector( state => state.auth.my_selected_address );
    const wallet = useSelector( state => state.auth.wallet );
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    const focus = useIsFocused();
    const data = {
      // tableHead: [ 'Head1', 'Head2', 'Head3'],
      tableTitle: [t('request.date'), t('request.cate'), t('request.address')],
      tableData: [
        (myorder.type == 'sch') ? [myorder.sch_data.date + ' ( ' + myorder.sch_data.hourStr + ' )'] : [new Date().toLocaleString(),],
        [myorder.order_category_name],
        [myaddress.address],
        
      ]
    }

    const CadooTrigger = (cadoo_arg) => {
      
      if(cadoo == cadoo_arg){
        dispatch({
          type:UPDATE_CADOO,
          payload: 0
        })
        return;
      }else{
        dispatch({
          type:UPDATE_CADOO,
          payload: cadoo_arg
        })
      }
    }
    const [visibleDiscountModal, setDiscountVisibleModal] = React.useState(false);
    const [DisSen, setDisSen] = React.useState('');
    const [Dis, setDis] = React.useState(null);

    const store_order = () => {
      
      setRequestState(true)
      changeIsLoading(true)
      const app_data = {
          "address_id" : myaddress.id,
          "discount_id" :   Dis?.id,
          "coupon":UsedCode,
          "coupon_id":promoCodeID,
          "price": total_price,
          "withOutDisPrice":Realtotal_price,
          "cadoo": cadoo,
          "father": fatherHere,
          "type": myorder.type,
          "sch_data": (myorder.type == 'sch') ? myorder.sch_data : null ,
          "preview": myorder.preview,
          "preview_cost": myorder.preview_cost,
          "category_id": myorder.order_category_id,
          "services_arr": (myorder.preview == true) ? [] : myorder.order_services // array
      };
      
      var config = {method: 'post',url: domain + '/api/post_order',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},
      data:app_data
    };

     
      axios(config).then(res => {
       
        change_searching_provider(true);
        dispatch({type:FLUSH_ORDER_DATA,payload:null});
        setTimeout(() => {
         
          change_searching_provider(false);
          navigation.navigate('ViewOrder',{
            order_id:res.data
          })
        }, 3000);
      }).catch(err => {
          alert('Sorry','Something went wrong')
      }).finally(res => {
        setRequestState(false)
          
      });
    }
 
    const GET_Discounts = () => {
        var config = {method: 'post',url: domain + '/api/dicount-finder',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{category_id:myorder.order_category_id,price: Realtotal_price}};
        axios(config).then(res => {
            if(res.data.status == 'yes'){
              setDiscountVisibleModal(true);
              setDis(res.data.data);
              setDisSen(res.data.sent);
              // changeRealtotal_price(total_price)
               
              if(res.data.data.type == 'per'){
                changeTotalPrice(res.data.new_price)

              }else{
                changeTotalPrice(total_price - res.data.data.discount)
              }
             
              
            }
        }).catch(err=>{
            
        }).finally(()=> { 
            
        });
    }
  
    React.useEffect(() =>{
      if(focus == true){
        
        setRequestState(false);
        setTimeout(() => {
          GET_Discounts()
        }, 500);
    }
      
      
      let total = myorder.order_services.reduce((n, {price,count}) => n + (price * count), 0)  + myorder.preview_cost;
      if(total < minCost){
        changeTotalPrice(minCost)
        changeRealtotal_price(minCost)
      }else{
        changeTotalPrice(total)
        changeRealtotal_price(total)
      }

      changeIsLoading(false)
      
    },[focus]);

    const [promoCode,changePromoCode] = React.useState({value:''});
    const [promoCodeID,changePromoCodeID] = React.useState(null);
    const [promoCodeError,changepromoCodeError] = React.useState('');
    const [UsedCode,changeUsedCode] = React.useState(null);
    const [UsedCodeStatus,changeUsedCodeStatus] = React.useState(null);

    const updatePromoCode = promoVal => { 
      changePromoCode({incomeError:''})
      changePromoCode({
          value: promoVal,
          
      });
      // changephoneAlert({valueA:'Enter 11 digits',color:'red'});
    }

    const checkPromoCode = () => {
     
      // changePromoCode({...promoCode,incomeError:''})
      if(promoCode.value == ''){
        changepromoCodeError(t('request.coupon.errors.empty')) 
      }else{
        if(UsedCode == promoCode.value){
         
          changepromoCodeError(t('request.coupon.errors.repeated')) 
        }
        else{
            var config = {method: 'post',url: domain + '/api/check-coupon',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{code:promoCode.value,category_id:myorder.order_category_id,price: Realtotal_price}};
            axios(config).then(res => {
                if(res.data.status == 'yes'){
                  setDiscountVisibleModal(true);
                  setDis(res.data.data);
                  setDisSen(res.data.sent);
                  changeUsedCodeStatus(true) //to write in green color.
                  changePromoCodeID(res.data.data.id)
                  changeUsedCode(res.data.data.code)
                  if(res.data.data.type == 'per'){
                    changeTotalPrice(res.data.new_price)

                  }else{
                    changeTotalPrice(total_price - res.data.data.discount)
                  }
                  changepromoCodeError(res.data.sent)
                  
                }else  if(res.data.status == 'no'){
                  changepromoCodeError(res.data.sent)
                }
            }).catch(err=>{
                
            }).finally(()=> { 
                
            });
        }
          
      }
    }
  return (
    <SafeAreaView style={{flex:1}}>
      {
         (requestState == false ) ?

      
    <ScrollView>
      <Provider>
      
       
   
    <HeaderApp navigation={navigation} homeFlag={false} title={t('request.title')} />
      
     
        <View style={[styles.container]}>
            <Text style={[Gtyles.h,{fontSize:16,marginBottom:10,textAlign:'center'}]}> {t('request.sen')} </Text>
            <Table borderStyle={{borderWidth: 2,borderColor:'#ddd'}}>
            {/* <Row data={data.tableHead} flexArr={[1, 1, 1]} style={styles.head} textStyle={styles.text}/> */}
            <TableWrapper style={styles.wrapper}>
                <Col data={data.tableTitle} style={styles.title} heightArr={[28,28]} textStyle={styles.text}/>
                <Rows data={data.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
            </TableWrapper>
            </Table>
        </View>
        <View>
        <View style={[Gtyles.shadowFullCard,{flexDirection:'row',paddingVertical:15,marginBottom:0,justifyContent:'space-around'}]}>
          <View style={styles.familyState}>
              <Image style={styles.familyStateImage} source={require('./../../../assets/images/family.png')} />
              <Text style={styles.familyText}>
                {t('women.father')}
              </Text>
              <View style={styles.family_checkboxContainer}>
                    <Checkbox.IOS
                        color={btnColorDark}
                        status={(fatherHere == true) ? 'checked' : 'unchecked'}
                        onPress={() => {
                          dispatch({
                            type: FATHER_ATTENDACE,
                            payload: true,
                          })
                        }}
                    />
                </View>
          </View>
         
          <View style={[styles.familyState]}>
          
            <Image style={styles.familyStateImage} source={require('./../../../assets/images/mother.png')} />
            <Text style={styles.familyText}>
              {t('women.only')}
            </Text>
            <View style={styles.family_checkboxContainer}>
                    <Checkbox.IOS
                        color={btnColorDark}
                        status={(fatherHere == false) ? 'checked' : 'unchecked'}
                        onPress={() => {
                            dispatch({
                              type: FATHER_ATTENDACE,
                              payload: false,
                            })
                        }}
                    />
              </View>
          </View>

         

        </View> 
        
        <View style={[Gtyles.shadowFullCard]}>
       
          <View style={[Gtyles.MROW,{marginVertical:7}]}>
              <Ionicons style={Gtyles.h_icon} name="payment" />
              <Text style={[Gtyles.h,{marginHorizontal:0}]}>
              {myorder.order_category_name} -</Text>
              {
                (Realtotal_price != total_price) &&
                <Text  style={[Gtyles.h,{marginHorizontal:0,textDecorationLine: 'line-through', textDecorationStyle: 'solid'}]}>({arabic_num((Realtotal_price)  + cadoo)} {t('cur')})</Text>

                }
              <Text  style={[Gtyles.h,{marginHorizontal:0}]}>({arabic_num((total_price)  + cadoo)} {t('cur')})</Text>
          </View>
          <View style={Gtyles.warnContainer}>
                <Text style={Gtyles.warnTxt}>{t('request.minCost',{min:user.mincharge})} </Text>
          </View>
        <View style={{ paddingTop:10}}>
            
            { (myorder.order_services.length > 0) &&
            <View style={{flex:1,}}>
              
                <View style={{ paddingTop:10}}>
                    
                    {myorder.order_services.map((service ,index) => {
                        
                        return <List.Item
                        key={Math.random(1,5555)}
                        right={props => <Text style={{fontFamily:'Tajawal-Regular' , color:textColor}}> {arabic_num(service.price) + ' x ' + arabic_num(service.count)} </Text>}
                        title={t('service_num') + ' ' + arabic_num((index + 1))}
                        titleStyle={{  fontFamily:'Tajawal-Medium' , color:textColor,fontSize:14}}
                        description={service.service_name}
                        descriptionStyle={{  fontFamily:'Tajawal-Regular' , color:textColor, fontSize:14,lineHeight:18,marginTop:6}}
                        left={props => <List.Icon {...props} icon="plus-circle-outline"/>}
                        />
                    })}
                </View>
                 
            </View>

            }{
              (myorder.preview == true) ?
              <View>
               
                <Text style={{fontSize:14, color:textColor,fontFamily:'Tajawal-Bold',alignSelf:'center',marginVertical:15}}>{t('order.screen.order_preview')}</Text>
              </View> :
            <View style={{flex:1}} >
              {/* <View style={[Gtyles.shadowFullCard,{flex:1,alignItems:'center',justifyContent:'center'}]}> */}
                {/* <Image source={require('./../../../assets/images/icons/page.png')} style={{width:100,height:100,alignSelf:'center'}}  />
                <Text style={{fontSize:16, color:textColor,fontFamily:'Tajawal-Regular',alignSelf:'center',marginBottom:15}}>
                {t('empty')}
                </Text> */}
              {/* </View> */}
            </View>
            }

            <View style={{borderTopWidth:1,borderTopColor:textColor}}>
              <Text style={{ color:btnColorDark,fontFamily:'Tajawal-Bold',fontSize:15,marginVertical:10}}> {t('request.coupon.title')} </Text>
              <View style={{flexDirection:'row',alignItems:'center',}}>
                
                
                <View style={{flex:1,backgroundColor:'white',}}>
                  <View  style={{borderWidth:1,borderColor:'grey',marginEnd:10}}>
                  
                  {/* style={[styles.card,Gtyles.shadow,{flex:1,backgroundColor:'white'}]} */}
                        
                      <TextInput onChangeText={updatePromoCode} placeholder={t('request.coupon.placeholder')} maxLength={11} style={[{paddingHorizontal:13,fontSize:14,color:textColor,fontFamily:'Tajawal-Bold',minHeight:35 },(i18n.language == 'ar') && {textAlign:'right'}]} />
                    
                      {/* <Text style={styles.error}> {t('missingInfo.err')} </Text> */}
                    
                  </View>
                  
                </View>
                
                <TouchableOpacity style={[styles.btnwallet,{backgroundColor:'black',marginBottom:12}]} onPress={() => checkPromoCode()}>
                        <Text style={styles.btn2Text}>{t('request.coupon.btn')}</Text>
                  </TouchableOpacity>
              </View>
              { (promoCodeError != '') &&
                    <Text style={[styles.error,(UsedCodeStatus == true) ? {color:'green'} : {color: 'red'}]}> {promoCodeError} </Text>
                  }
            </View>
        </View>
        {/* <AppButton  title="ADD NOTES" btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'white',color:btnColor,borderWidth:1,borderColor:btnColor,alignSelf:'center'}]} onPressP={() => console.log('')}/>  */}

        </View>
        {/* <View style={[Gtyles.shadowFullCard]}>
        <View style={[Gtyles.MROW,{marginVertical:7}]}>
            <Ionicons style={Gtyles.h_icon} name="face" />
            <Text style={[Gtyles.h,{marginHorizontal:10}]}>
             {t('cadoo.title')}
            </Text> 
        </View>

        <View style={styles.cadooWrapper}>
              <TouchableOpacity style={[styles.cadooItem,(cadoo == 5) && styles.cadooWrapperSelected]} onPress={() => CadooTrigger(5)}>
                <Image source={require('./../../../assets/images/icons/cadoo1.png')} style={styles.cadoo_image} />
                <Text style={[styles.cadooText,(cadoo == 5) && {color:'white'}]}>
                    {arabic_num(5) + ' ' + t('cur')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.cadooItem,(cadoo == 20) && styles.cadooWrapperSelected]} onPress={() => CadooTrigger(20)}>
                <Image source={require('./../../../assets/images/icons/cadoo2.png')} style={styles.cadoo_image} />
                <Text style={[styles.cadooText,(cadoo == 20) && {color:'white'}]}>
                    {arabic_num(20) + ' ' + t('cur')}
                </Text>
              </TouchableOpacity>


              <TouchableOpacity   style={[styles.cadooItem,(cadoo == 50) && styles.cadooWrapperSelected]} onPress={() => CadooTrigger(50)}>
               <Image source={require('./../../../assets/images/icons/cadoo3.png')} style={styles.cadoo_image} />
              <Text style={[styles.cadooText,(cadoo == 50) && {color:'white'}]}>
                  {arabic_num(50) + ' ' + t('cur')}
              </Text>
              </TouchableOpacity>
        </View>
       
        </View> */}
        </View>

{
  (myorder.order_category_id) &&

        <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        
        {
          (parseInt(wallet) >= (total_price  + cadoo) )  &&
          (myorder.order_category_id != null && requestState ==false) && 
          <Card style={{flex:1,width:'95%'}}> 
          <Card.Content style={{backgroundColor:'white'}}>
            {/* <AppButton isLoading={isLoading} disabled={isLoading} title= {t('request.btn')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,alignSelf:'center'}]} onPressP={store_order}/> */}
            <TouchableOpacity disabled={isLoading}  style={[styles.btnwallet,{backgroundColor:(isLoading) ? 'black': btnColorDark}]} onPress={store_order}>
                  {
                      (isLoading) ? 
                      <ActivityIndicator   size={'small'} color={'white'} />
                    :
                      <Text style={styles.btn2Text}>{t('request.continueorder')}</Text>
                    }
                </TouchableOpacity>
          </Card.Content>
          </Card> 
          }
         {
          ( parseInt(wallet) < (total_price  + cadoo) )  &&
          <Card> 
            <Card.Content style={{backgroundColor:'white'}}>
              {/* <View style={{flexDirection:'row',alignItems:'center'}}>
                <Image style={{width:27,height:27,marginEnd:8}} source={require('./../../../assets/images/icons/warning.png')} />
                <Title style={{color:textColor,fontFamily:'Tajawal-Bold',fontSize:14}}> {t('request.wallet_issue.title')} ({arabic_num(wallet)} {t('cur')} )</Title>
              </View> */}
              
              <Text style={[{color:textColor,fontFamily:'Tajawal-Bold',fontSize:12.1,backgroundColor:'#e7f09c',paddingVertical:15,lineHeight:22,marginVertical:15,paddingHorizontal:15},(i18n.language == 'ar') &&  {textAlign:'left'}]}> {t('request.wallet_issue.des22')} </Text>   
              {/* <Text style={[{color:textColor,fontFamily:'Tajawal-Regular',fontSize:14,lineHeight:20,paddingHorizontal:8},(i18n.language == 'ar') &&  {textAlign:'left'}]}> {t('request.wallet_issue.des')} </Text>    */}
              <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                <TouchableOpacity disabled={isLoading}  style={[styles.btnwallet,{backgroundColor:(isLoading) ? 'black': btnColorDark}]} onPress={store_order}>
                  {
                      (isLoading) ? 
                      <ActivityIndicator   size={'small'} color={'white'} />
                    :
                      <Text style={styles.btn2Text}>{t('request.continueorder')}</Text>
                    }
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnwallet} onPress={() => { navigation.navigate('Wallet') }}>
                      <Text style={styles.btn2Text}>{t('request.wallet_issue.btn')}</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
      }
           
        
       

        </View>
      }

      <Portal>
      <Modal visible={visibleDiscountModal} onDismiss={() => {setDiscountVisibleModal(false)}} contentContainerStyle={[{backgroundColor: 'white', padding: 10,paddingBottom:40,marginHorizontal:10,borderRadius:10,alignItems:'center'}]}>
        <View style={{marginTop:-60,backgroundColor:'white',borderRadius:100,padding:5}}>
        <ImageBackground  source={require('./../../../assets/images/icons/offerx.png')} style={{width: 120,height:120,alignItems:'center',justifyContent:'center'}}   resizeMode="cover" > 
            <Text style={{fontFamily:'Tajawal-Bold',color:'white',fontSize:25,}}>{Dis?.discount}{(Dis?.type == 'per') ? '%': t('cur')}</Text>
        </ImageBackground>
        
        </View>
       
          <Text style={{fontFamily:'Tajawal-Bold',color:textColor,fontSize:14.5,marginTop:10}}>{DisSen}</Text>

         
          <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center',width:'100%',marginTop:20}}>
                  <AppButton title={t('ok')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{alignSelf:'center',marginTop:10,fontSize:14,backgroundColor:'green',width:'auto',minWidth:100}]} onPressP={() => setDiscountVisibleModal(false)}/> 
                  {/* <AppButton title={t('order.screen.cancel_order')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{alignSelf:'center',marginTop:10,fontSize:14,backgroundColor:danger,width:'auto',minWidth:100}]} onPressP={() => {}}/>  */}
              </View>
           
        </Modal>
      </Portal>
        {/* <LottieView style={{height:300}}  autoPlay loop /> */}
 </Provider>
     </ScrollView>
     :
     <View style={{flex:1,backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
       <ActivityIndicator color={btnColor} size={'large'} />
     </View>
    
    }
</SafeAreaView>
    
  )
}
