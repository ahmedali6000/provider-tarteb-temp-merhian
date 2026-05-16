import React from 'react';
import {View,Text,Image,Linking , SafeAreaView , ScrollView , Platform ,  } from 'react-native';
import HeaderApp from '../../shared/Header';
import {useNavigation} from '@react-navigation/native';
 
import {googlePlayLink,AppStoreLink, btnColor, textColor, onelink} from '../../utils/app';
import { Avatar, Button, Card, Title, Paragraph, Snackbar } from 'react-native-paper';
import {useDispatch , useSelector} from 'react-redux';
import { logout } from '../../redux/actions';
import PlatformTouchable from '../../components/PlatformTouchable';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { arabic_num } from '../../utils/HelperFunctions';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import  Share  from 'react-native-share';
import { shareImage } from '../../utils/base64';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function AccountMainScreen(props){
    const show_alert = useSelector( state => state.myApp.urgentPopUp);

    const user = useSelector( state => state.auth.user );
    const wallet = useSelector( state => state.auth.wallet );
        const navigation = useNavigation();
        const dispatch = useDispatch();
        const Logout = () => { 
            dispatch(logout());
        };
       
        // const onShare = async () => {
        //     try {
        //         const inviteCode = user.id; // كود الدعوة
        //         // const message = `مرحبا! 🚀\nحمل التطبيق من هنا: ${onelink}\nكود الدعوة: ${inviteCode}`;
        //         const message = `✅ شارك تطبيق “ترتيب TARTEB” مع 10 أشخاص واحصل على 50 جنيه! \n ✅ اطلب خدمات السباكة، التنظيف، النجارة، التكييف والمزيد بسهولة! \n📲 حمّل التطبيق من هنا \n ${onelink} \n 💬 كود الدعوة : ${inviteCode}`;

        //       const result = await Share.share({
        //         message:
        //         message
        //       });
        //       if (result.action === Share.sharedAction) {
        //         if (result.activityType) {
        //           // shared with activity type of result.activityType
        //         } else {
        //           // shared
        //         }
        //       } else if (result.action === Share.dismissedAction) {
        //         // dismissed
        //       }
        //     } catch (error) {
        //       Alert.alert('');
        //     }

            
        //   };     
   
        const onShare = async () => {
            try {
                const inviteCode = user.id;
                const message = `✅ شارك تطبيق “ترتيب TARTEB” مع 10 أشخاص واحصل على 50 جنيه! \n ✅ اطلب خدمات السباكة، التنظيف، النجارة، التكييف والمزيد بسهولة! \n📲 حمّل التطبيق من هنا \n ${onelink} \n 💬 كود الدعوة : ${inviteCode}`;
        
                // جلب المسار الفعلي للصورة داخل assets
                 
              
        
                // تحديد مسار تخزين مؤقت لنسخ الصورة إليه
               
        
                // نسخ الصورة إلى التخزين المؤقت
               
        
                
        
                // إنشاء رابط Base64 لمشاركة الصورة
                const shareOptions = {
                    title: 'شارك تطبيق ترتيب',
                    message: message,
                    url: 'data:image/jpeg;base64,' + shareImage,
                    subject: 'تطبيق ترتيب',
                };
        
                // مشاركة المحتوى ومعالجة الأخطاء
                try {
                    const result = await Share.open(shareOptions);
                    if (result.action === Share.sharedAction) {
                        console.log('تمت المشاركة بنجاح');
                    } else if (result.action === Share.dismissedAction) {
                        console.log('تم إلغاء المشاركة');
                    }
                } catch (shareError) {
                    console.log('خطأ أثناء المشاركة:', shareError);
                    alert('حدث خطأ أثناء محاولة مشاركة الصورة.');
                }
                
            } catch (error) {
                console.log('خطأ عام في المشاركة:', error);
                alert('تعذر مشاركة الصورة، يرجى المحاولة مرة أخرى.');
            }
        };
        const {t,i18n} = useTranslation();
    return (
        <SafeAreaView style={{flex:1,}}>
            <ScrollView contentContainerStyle={styles.scrollView}>
            <HeaderApp title={t('myaccount.title')} profileView={false} drawer={true} iconName="person-outline" />
            <View style={{flex:1,backgroundColor:'white',flexDirection:'column',paddingVertical:30}}>
            
                <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={ () => {navigation.navigate('AccountScreen')} }> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/boy.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p1.h')} </Text>
                                <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('myaccount.parts.p1.des')} </Text>
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={()=>{navigation.navigate('OrdersScreen')}}> 
                        <View style={styles.newContainer}> 
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/orders.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p7.h')} </Text>
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={()=>{navigation.navigate('MyBundlesScreen')}}> 
                        <View style={styles.newContainer}> 
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/bundle.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p8.h')} </Text>
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                {/* <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={() => navigation.navigate('UserLocationScreen')}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/placeholder-2.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('location.title')} </Text>
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View> */}
                
                {
                    (user.paymentAva == 1) &&
                    <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={() => navigation.navigate('Wallet')}> 
                            <View style={styles.newContainer}>
                                <View>
                                    <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/wallet.png')} />
                                </View>
                                <View style={styles.newTextWrapper}>
                                    <Text style={styles.title} >{t('wallet.title')} ( {arabic_num(wallet)} {t('cur')} ) </Text>
                                    {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                                </View> 
                                <View>
                                    <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                                </View>
                            </View>
                        </PlatformTouchable>
                    </View>
                 }
                 <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={()=>{navigation.navigate('SupportStack')}}> 
                        <View style={styles.newContainer}> 
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/chat.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('support.title')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={() => navigation.navigate('NotificationScreen')}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/notification-bell.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('drawer.notifications')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={()=> onShare() }> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/share.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p5.h')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                
                <View style={styles.cardWrapper}>
                    <PlatformTouchable onPress={() => Linking.openURL(`tel:01068879281`)}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/call.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p6.h')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={()=>{Linking.openURL((Platform.OS == 'ios') ? AppStoreLink : googlePlayLink);}}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/star.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p2.h')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                <View style={styles.cardWrapper}>
                <PlatformTouchable onPress={Logout}> 
                        <View style={styles.newContainer}>
                            <View>
                                <Image style={styles.new_img_icon} source={require('./../../../assets/images/icons/shutd.png')} />
                            </View>
                            <View style={styles.newTextWrapper}>
                                <Text style={styles.title} >{t('myaccount.parts.p3.h')} </Text>
                                {/* <Text style={[styles.des,(i18n.language == 'ar') ? {textAlign:'left'} : {textAlign:'right'}]}>{t('location.addresses.slug')} </Text> */}
                            </View> 
                            <View>
                                <Ionicons style={styles.newIcon} name="chevron-back-outline" />
                            </View>
                        </View>
                    </PlatformTouchable>
                </View>
                  
   



            </View>
            </ScrollView>
        </SafeAreaView>
    );
}


 const styles = StyleSheet.create({
    newContainer:{
        backgroundColor:'white',
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:15,
        paddingVertical:15,
        alignItems:'center',
        marginHorizontal:15,
        borderBottomWidth:1,
        borderColor:'#ddd'
    },
    newIcon:{
        fontSize:20
    },
    newTextWrapper:{
        flex:1,
        // backgroundColor:'#ddd',
        paddingHorizontal:10,
        flexDirection:'column',
        alignItems:'flex-start',
        justifyContent:'space-between'
    },
    title:{
        color:textColor,
        fontFamily:'Tajawal-Bold',
        fontSize:13.2,
    //    backgroundColor:'red'
    },
    des:{
        color:'#696868',
        fontFamily:'Tajawal-Bold',
        fontSize:13,
        lineHeight:18,
        marginTop:10
    },
    new_img_icon:{
        width:40,
        height:40
     },
    container:{
        flex: 1,
        justifyContent: 'center',
        borderRadius: 40,
        paddingHorizontal: '28@vs',
        // paddingVertical:'10@s',
        backgroundColor: '#F3F3F3',
        
    },
  
    header:{
        fontSize:30,
        color:'black',
        fontWeight: 'bold',
        textAlign: 'center',
        // backgroundColor:'red',
        marginVertical: '15@vs',
    },
 
     
    btnWrapper:{
        flexDirection: 'row',
        marginVertical: 23,
        // backgroundColor: 'red',
        justifyContent: 'center'    
    },
    uploadBtn:{

    },
    avatarWrapper :{
        flexDirection: 'row',
       justifyContent:'center'
    },
    avatarImg :{
        width:90,
        height:90,
        borderRadius:50,
        borderWidth:2,
        borderColor:'#ddd',
        marginBottom:8
    },
    accountImput:{
        
    },
    dropdownWrapper : {
        marginVertical:10,
        flexDirection:'row',
        justifyContent:'center',
    },
    dropdown : {
        flex:1,
        borderRadius:8,
        borderColor:'#9F9F9F',
        borderWidth:1,
        backgroundColor:'white',
    },
    buttonTextStyle:{
        color:btnColor,
        fontWeight:'700',
    },
    phoneStyle:{
        borderWidth:1,
        borderColor:'#9F9F9F',
        paddingHorizontal:10,
        marginHorizontal:6,
        borderRadius:10,
        backgroundColor:'white',
        fontSize:17,
    },
    phoneIcon:{
        marginHorizontal:10,
        padding:10 ,
        fontSize:20,
        borderColor:'black',
        borderWidth:1,
        borderRadius:50
    },
    flagWrapper:{
       marginHorizontal:5,
        flexDirection:'column',
        justifyContent:'center',
    },
    flag:{
        width:47,
        height:35
    },
    //lets do it with main screen 
    
    cardWrapper:{
        marginVertical:0,
    },
    iconWrapper:{
        justifyContent:'center',
        alignItems:'center',
        paddingVertical:7,
        paddingHorizontal:10,
        // backgroundColor:'red',
        marginEnd:11
    },
 
}); 

 