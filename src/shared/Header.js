import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    StyleSheet,
    View,
    Image,
    Text,
   
  } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
   
import PlatformTouchable from '../components/PlatformTouchable';
import { backgroundColorHadytop, btnColorDark, domain } from '../utils/app';
import { text } from '../utils/HelperFunctions';
import { useSelector } from 'react-redux';
import i18next from 'i18next';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


function HeaderApp(props){
  const {homeFlag , title , drawer , profileView , iconName} = props;
  const myorder = useSelector( state => state.order );
    const getGreeting = () => {
      const currentHour = new Date().getHours(); // الحصول على الساعة الحالية (0-23)
      if (currentHour >= 5 && currentHour < 12) {
        return t('extra.goodmorning'); // صباحاً
      } else if (currentHour >= 12 && currentHour < 17) {
        return t('extra.goodevening'); // فترة الظهيرة
      } else {
        return t('extra.goodevening'); // مساءً
      }
    };

  const {t,i18n} = useTranslation();
  const [displayedText, setDisplayedText] = React.useState(''); // النص الذي سيظهر تدريجياً
   // النص الكامل
  React.useEffect(() => {
    let currentIndex = 0;
    const fullText = (user) ? user?.name : '###';
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText((prevText) => prevText + fullText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval); // عند الانتهاء من النص، أوقف المؤقت
      }
    }, 200); // إضافة حرف كل 200 مللي ثانية
    
    return () => clearInterval(interval); // تنظيف المؤقت عند تدمير المكون
  }, [drawer]);

   
    // const [isSwitchOn, setIsSwitchOn] = React.useState(working_status);
      const user = useSelector( state => state.auth.user);
    const navigation = useNavigation();
    return (
      <View style={[styles.headerContainer,(i18next.language == 'ar') ? {flexDirection:'row-reverse'} : {flexDirection:'row',}]}> 
        {
              (drawer == true) ?
              <View style={styles.headerStart}> 
                 <View style={{flexDirection:'row'}}>
                  <View style={{position:'relative'}}>
                      { (myorder.order_category_id != null) && 
                      <View style={{position:'absolute',top:-10,start:-20,backgroundColor:'red',padding:5,zIndex:99999,width:25,height:25,justifyContent:'center',alignItems:'center',borderRadius:50}}>
                        <Text style={{fontSize:12,fontWeight:'bold',color:'white'}}>1</Text>
                        </View>
                      }
                      <PlatformTouchable onPress={() => { navigation.navigate('PreOrderRevsion'); }}  >
                          <Ionicons size={25} name="newspaper-outline" style={{color:btnColorDark,marginEnd:10}}  />
                      </PlatformTouchable>
                    </View>
                
                  <PlatformTouchable onPress={() => { navigation.openDrawer(); }}  >
                      <Ionicons size={25} name="ellipsis-horizontal-circle-outline" style={{color:btnColorDark}}  />
                  </PlatformTouchable>
                  </View>
              </View>
                :
              <View style={{}}> 
                 
              </View>
          }
         
         {/* <View style={{flex:1}}> */}
          {
            (profileView) ? 
              <View style={{justifyContent:'flex-start',alignItems:'center',flex:1,flexDirection:'row'}} > 
                <Image source={{uri: user?.image}} style={{width:60,height:60,borderRadius:50,marginEnd:10}} />
                <View>
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:'white',marginBottom:5}}>
                        <Text style={{fontSize:15,fontFamily:'Tajawal-Medium',color:btnColorDark,marginTop:5,marginHorizontal:7}}> { getGreeting() } </Text> 
                        <Image source={require('./../../assets/images/icons/hand.png')} style={{width:20,height:20,borderRadius:50}} />
                    </View>
                    <Text style={{fontSize:15.5,fontFamily:'Tajawal-Bold',color:btnColorDark,alignSelf:'flex-start'}}> {displayedText} </Text> 
                </View>
            </View>
            :
          <View style={{justifyContent:'flex-start',alignItems:'center',flex:1,flexDirection:'row',}} > 
               {
                (iconName) ? 
                <Ionicons size={18} name={iconName} style={{color:btnColorDark,marginEnd:7,backgroundColor:backgroundColorHadytop,padding:6,borderRadius:5}}  />
                :
                  <View style={styles.headerStart}> 
                    <PlatformTouchable onPress={() => { navigation.goBack(); }}  >
                    <Ionicons name={(i18n.language == 'ar') ? "arrow-forward" : "arrow-back" } style={{fontSize:25,color:btnColorDark}}  />
                  </PlatformTouchable>
                  </View>
               }
             
                <Text style={{fontSize:17,fontFamily:'Tajawal-Bold',color:btnColorDark,alignSelf:'center'}}> {title} </Text> 
        </View>


          }
         {/* </View> */}
          
         
         
        
          {/* <Text style={{position:'absolute',bottom:-10,zIndex:99999999999999}}>تجريب</Text> */}
         
      </View>
  );
}
const styles = StyleSheet.create({
  headerContainer: {
   
      backgroundColor: 'white',
       elevation: 10, // لأندرويد
zIndex: 9999,
      borderColor:'black',
      paddingVertical:15,
      paddingTop:30,
      // height:60,
      paddingHorizontal:30,
      alignItems:'center',
      justifyContent:'space-between',
      // shadowColor: "#000",
      // shadowOffset: {
      //     width: 0,
      //     height: 2,
      // },
      // shadowOpacity: 0.25,
      // shadowRadius: 3.84,

      // elevation: 5,  
  },
  headerStart: {
      // position:'absolute',
      zIndex:1000,
      // top:-13,
     
      
  },
//   headerEnd: {
//     position:'absolute',
//     zIndex:1000,
//     top:13,
// },
  
});
export default HeaderApp;