import { Dimensions, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import PlatformTouchable from '../../components/PlatformTouchable'
import HeaderApp from '../../shared/Header'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import styles from './style'
import { SCHEDULING_END_HOUR, SCHEDULING_START_HOUR, backgroundColorHadytop, btnColor, btnColorDark } from '../../utils/app'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ScrollPicker from "react-native-wheel-scrollview-picker";
import DynamicallySelectedPicker from 'react-native-dynamically-selected-picker';
import moment from 'moment-with-locales-es6';
import { Image } from 'react-native'
import Gtyles from '../../styles/Gstyle'
import AppButton from "../../components/auth/Button";
import { useSelector , useDispatch } from 'react-redux'
import { SET_ORDER_SCHEDULING_TYPE } from '../../redux/actions/ActionTypes'

export default function Scheduling() {
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    let sched_days = [];
    const [hours,setHours] = React.useState([]);
    const [hourSTRstate,setHourSTR] = React.useState(null);
    const [from,setFrom] = React.useState(0);
    
    let daysRequired = 7;
    
    /* to check the remaining hours in today 
    */

    

    for (let i = 0; i <= daysRequired; i++) {

        const todayFlagX = moment().isSame(moment().add(i, 'days').locale('en').format('Y-MM-D'), 'day');
        if(todayFlagX == true){
            if(Number(moment().format('H')) <= SCHEDULING_END_HOUR){
                sched_days.push( {
                    name_en:moment().locale('en').add(i, 'days').format('dddd'),
                    name_ar:moment().locale('ar').add(i, 'days').format('dddd'),
                    date:moment().add(i, 'days').locale('en').format('Y-MM-D')
                } )
            }
        }else{
            sched_days.push( {
                name_en:moment().locale('en').add(i, 'days').format('dddd'),
                name_ar:moment().locale('ar').add(i, 'days').format('dddd'),
                date:moment().add(i, 'days').locale('en').format('Y-MM-D')
            } )
        }

        
      }

      
      React.useEffect(() => {
        
      },[hours]);


const myorder = useSelector( state => state.order );
const setDayFun = (day) => {
   
    let arr= [];
    setValueDay(day);
    const todayFlag = moment().isSame(day, 'day');
   
    if(todayFlag == true && Number(moment().format('HH')) >= SCHEDULING_START_HOUR){
        for(let x =  Number(moment().format('HH')); x <= SCHEDULING_END_HOUR ; x++){
            arr.push(x);
           
        }
    } else{
        for(let x =  SCHEDULING_START_HOUR; x <= SCHEDULING_END_HOUR ; x++){
            arr.push(x);
           
        }
    }

   
    setFrom((arr.length >= 4) ? arr[4] : arr[0]);
    setHourSTR(MakeNumToTimeFormat((arr.length >= 4) ? arr[4] : arr[0]))

    setHours(arr);
    
    
}

const Converter = (num) =>{
    let pmam =''
    if (num > 12) {
          num = num -12;
        return ("0" + num).slice(-2) + ':00'; 
    } else {
          num = num;
        return ("0" + num).slice(-2) + ':00'; 
    }


}


const SubmitHandler = () => {
    if(value_day != null){
        // if(from == 0 || hourSTRstate == null){
        //     alert('Stoop')
        //     console.log(hours)
        //     setFrom((hours.length >= 4) ? hours[4] : hours[0]);
        //     setHourSTR(hours[4])
        // }

        dispatch({
            type: SET_ORDER_SCHEDULING_TYPE,
            payload: {
                date: value_day,
                hourstart : from,
                hourStr: hourSTRstate,
                 
            }
        })
        
        setTimeout(() => {
            navigation.navigate('RequestView');
        }, 100);
    }
}


const dispatch = useDispatch();

    const [value_day, setValueDay] = React.useState(null);
    const MakeNumToTimeFormat = (data) => {
       let m = Converter(data) + ' - ' + Converter(data+1);
       let n = (data >= 12 ) ? ' pm' : ' am';
       
       return m + n;
    }
   
  return (

    <SafeAreaView style={{flex:1}}>
        {/* <ScrollView contentContainerStyle={{flex:1}}> */}
    <HeaderApp navigation={navigation} homeFlag={false} title={t('schedu.title')} />
   <View style={[styles.wrapper]}>
    {/* Gtyles.shadowFullCard, */}
       

       <View>
       {/* <Text style={[styles.title1,{marginBottom:0}]}>  <Ionicons style={{fontSize:18}} name='home-outline' /> {myorder.order_category_name} </Text> */}
       
       <Text style={styles.title}>- {t('schedu.ch_day')} </Text>
        <View style={{flexDirection:"row",flexWrap:'wrap',alignSelf:'center',alignItems:'center'}}> 

    
                        {sched_days.map((item,index) => { 
                            return ( 
                                    <View key={index}  style={[styles.graphical_icon,{position:'relative'}]}   > 
                                        <PlatformTouchable key={index} onPress={() => {
                                            if (item.date == value_day) {
                                                setDayFun(null)
                                            } else {
                                                setDayFun(item.date)
                                                    }
                                                } } >
                                                    <ImageBackground source={require('./../../../assets/images/calendar1.png')} resizeMode="contain" style={{height:'99%',width:'99%',}}>
                                                    <View style={{justifyContent:'flex-end',alignItems:'center',flex:1,paddingVertical:10}}>
                                                    {
                                                        (value_day == item.date) &&
                                                        <Ionicons style={{color:btnColor,fontSize:27,fontWeight:'bold',position:'absolute',top:'40%',end:-10,backgroundColor:'white',borderRadius:50}} name="checkmark-circle" />
                                                    }
                                                    
                                                    {/* <View style={{alignItems:'center',justifyContent:'center'}}> */}
                                                    <Text style={{fontFamily:'Tajawal-Bold',color:'black',fontSize:12.5,marginBottom:0}}> {(i18n.language == 'ar') ? item.name_ar : item.name_en}</Text>
                                                    <Text style={[{fontFamily:'Tajawal-Bold',color:'black',fontSize:16,marginBottom:5}]}>{item.date}</Text>
                                                    {/* </View> */}
                                                </View>
                                                    </ImageBackground>
                                        </PlatformTouchable>
                                    </View>
                            
                            );
                        })
                    }  
            </View>
       </View>
    

            {/* </View>


<View style={[Gtyles.shadowFullCard,styles.wrapper]}> */}
       


<View>
<Text style={styles.title}>- {t('schedu.ch_hour')} </Text>
       
       {
           (value_day != null) ?
       
               <View style={{ height:200,overflow:'hidden',borderWidth:1,borderColor:'#ddd',marginHorizontal:20,paddingBottom:20}}>
               <ScrollPicker
               
               dataSource={hours}
               selectedIndex={(hours.length >= 4) ? 4 : 0}
               renderItem={(data, index) => {
                  return <Text style={{fontSize:16,color:btnColorDark,fontFamily:'Tajawal-Bold'}}>{ MakeNumToTimeFormat(data) } </Text>;
               }}
               onValueChange={(data, selectedIndex) => {
                 setFrom(data);
                 setHourSTR(MakeNumToTimeFormat(data))
               }}
               wrapperHeight={180}
               style={{}}
               itemHeight={50}
               highlightColor={btnColor}
               highlightBorderWidth={1}
               wrapperBackground='transparent'
              
               itemTextStyle={{color:'red'}}
             />
       
        
       
       
       
               </View> 
       
               : 
       
               <View style={{justifyContent:'center',alignItems:'center',paddingTop:0}}>
                   <Image source={require('./../../../assets/images/alarm1.png')} style={{width:140,height:140}} />
               </View>
               }
</View>

            <View>
            <AppButton disabled={(value_day != null) ? false : true} title={t('schedu.btn')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:'85%',maxWidth:300,alignSelf:'center'}]} onPressP={() => {SubmitHandler();}}/> 
            </View>
         </View>

         {/* </ScrollView> */}
    </SafeAreaView>
  )
}

 