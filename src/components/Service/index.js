import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import PlatformTouchable from '../PlatformTouchable'
import ImageLoad from 'react-native-image-placeholder'
import styles from './style'
import { useNavigation } from '@react-navigation/native'
import { backgroundColorHadytop, btnColorDark, moreHady, textColor } from '../../utils/app'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Gtyles from '../../styles/Gstyle'
import {useDispatch,useSelector} from 'react-redux';
import { UPDATE_ORDER_DATA } from '../../redux/actions/ActionTypes'
import { Add_Service_To_Order } from '../../redux/actions/authActionCreator'
import { useTranslation } from 'react-i18next'
import { arabic_num } from '../../utils/HelperFunctions'

export default function ServiceCard(props) {
  const dispatch = useDispatch();
  const order = useSelector( state => state.order);
  const [x,setX] = React.useState(0);
  const navigation = useNavigation();
  const [count,setCount] = React.useState(0);
  const {service , category,...rest} = props;
  const {t,i18n} = useTranslation();
  const increase = () => {
    dispatch(Add_Service_To_Order(category.id,category.name,service.id,service.name,service.price,count+1,order.order_services,'positive'));
    setX(Math.random(0,444444))
  }
  const decrease = () => {
    if(count >= 0) 
    {
        dispatch(Add_Service_To_Order(category.id,category.name,service.id,service.name,service.price,(count > 0) ?count-1 : 0,order.order_services,'negative'));
       
    }
    setX(Math.random(0,444444))
    if(count == 0){
        setCount(0)
    }
  }
  const show_modal = () => {
    console.log('Modal');
  }
  
 React.useEffect(()=>{
    
    const arr = order.order_services;
    if(arr != undefined ){
      if(arr == undefined || arr.length == 0 ){
        setCount(0);
    }
    arr.filter(function(obj) {
        if(obj['service_id'] == service.id){
            setCount(obj['count'])
        }else{
            setCount(0);
        }
    });
    }else{
      setCount(0);
    }

 },[x])

  return (
     
        // <View style={styles.note} >
        //     <View style={{flexDirection:'row',flex:1}}>
        //       {/* <Image source={{ uri: service.image ,cache: 'only-if-cached' }} style={{height:50,width:40,borderRadius:10,alignSelf:'center',marginEnd:10}} /> */}
            
        //         <View style={{flex:1,justifyContent:'center',paddingHorizontal:5}}>
        //         <Text style={[styles.noteT1,(i18n.language == 'ar') &&  {alignSelf:'flex-start'}]}> {service.name} </Text>
        //         <View style={styles.note2_3Wrapper}>
                
        //           <View style={[styles.countersW,{width:'50%'}]}>
        //               <Text style={[styles.noteT2,]}> { arabic_num(service.price) } {t('cur')} </Text>
                       
        //               {
        //                 (order?.order_category_id == null || order?.order_category_id == category.id) ?
        //                 <View style={[Gtyles.counterWrapper]}>
                         
        //                   <PlatformTouchable onPress={decrease}>
        //                     <Ionicons style={Gtyles.counterIcon} name="remove"   />  
        //                   </PlatformTouchable> 
        //                   <Text style={Gtyles.counterTxt}> {arabic_num(count)}</Text>                 
        //                   <PlatformTouchable onPress={increase}>
        //                     <Ionicons style={Gtyles.counterIcon}  name="add"  />  
        //                   </PlatformTouchable>  
        //                 </View>
        //                 :
        //               <PlatformTouchable onPress={() => navigation.navigate('PreOrderRevsion')}>
        //               <Text style={{ fontFamily:'Tajawal-Medium'  ,color:'red'}}>
        //               {t('category.cant')}
        //               </Text>
        //               </PlatformTouchable> 
        //               }
                       
                      
        //           </View>
        //         </View>
                
        //         {
        //           (count > 0) &&
        //             <Text style={{backgroundColor:'#ddd',textAlign:'center',borderRadius:3,marginTop:15, fontFamily:'Tajawal-Medium' , color: textColor ,paddingVertical:3}}>
        //               {t('service.total_cost')}: {arabic_num(service.price * count)} {t('cur')}
        //             </Text>
        //         }
                  
                
                
        //         </View>
        //     </View>
        // </View>




        <View style={styles.card}>
            <Image source={{ uri: service.image }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.name}>{service.name}</Text>
              <Text style={styles.type}>⭐{service.rating} - {service.type}</Text>
              <View style={[styles.priceAndRating,{backgroundColor:'transparent',flex:1,width:'100%'}]}>
                <Text style={styles.price}>{ arabic_num(service.price) } {t('cur')}</Text>
                
                      {(order?.order_category_id == null || order?.order_category_id == category.id) ?
                <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                  <TouchableOpacity onPress={increase}>
                     <View style={styles.iconContainer}>
                     <Ionicons style={styles.addRemoveIcon} name='add' />
                     </View>
                  </TouchableOpacity>
                  <Text style={{marginHorizontal:15,color:textColor,fontSize:15,fontWeight:'bold'}}>{count}</Text>
                  <TouchableOpacity onPress={decrease}>
                    <View style={styles.iconContainer}>
                    <Ionicons style={styles.addRemoveIcon} name='remove' />
                    </View>
                  </TouchableOpacity>
                </View>
                  :
                  <PlatformTouchable onPress={() => navigation.navigate('PreOrderRevsion')}>
                  <Text style={{ fontFamily:'Tajawal-Bold',color:'red',fontSize:12}}>
                  {t('category.cant')}
                  </Text>
                  </PlatformTouchable> 
                  }
              </View>
            </View>
            <View style={[styles.bookmarkButtonRatContainer]}>
                  {/* <Text style={styles.rating}>⭐ {service.rating}</Text> */}
                  {/* <TouchableOpacity style={styles.bookmarkButton}>
                    <Ionicons name='bookmark' style={styles.bookmarkText} color={textColor} />
                  </TouchableOpacity> */}
                  {/* <Text style={styles.reviews}> • {item.reviews} reviews</Text> */}
                 
                </View>
          </View>
         
  )
}