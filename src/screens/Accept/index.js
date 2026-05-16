import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {View, Text, SafeAreaView, Alert , ScrollView} from 'react-native'
import { Checkbox } from 'react-native-paper';
import HeaderApp from '../../shared/Header'
import Gtyles from '../../styles/Gstyle';
import { backgroundColorHady, btnColor, btnColorDark, moreHady, textColor } from '../../utils/app';
import { cutLongText } from '../../utils/HelperFunctions';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import AppButton from '../../components/auth/Button';
import PlatformTouchable from '../../components/PlatformTouchable';
import styles from './style';
import { ALERT_TYPE, Dialog, Root } from "react-native-alert-notification";
import { useTranslation } from 'react-i18next';

export default function AcceptConditionsScreen(){
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    const CONFIRMATION_HANDLER= () => {
        if(checked == true){
            // navigation.navigate('RequestView')
            navigation.navigate('SchedChoosing')
        }else{
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: t('accept.warn.title'),
                textBody: t('accept.warn.des'),
                button: t('understood'),
            })
        }
    }
    const [checked, setChecked] = React.useState(false);
    return (
        <Root>
        <SafeAreaView style={{flex:1}}>
        <HeaderApp navigation={navigation} homeFlag={false} title={t('accept.title')} />
         
    <ScrollView style={{backgroundColor:'white',flex:1,marginBottom:60}}>
    {
        (i18n.language == 'en')
        ?
        <View style={[Gtyles.shadowFullCard]}>
            <View style={{flexDirection:'row',alignItems:'center',marginVertical:15,paddingVertical:15}}>
                <View style={{borderColor:'black',borderWidth:1,borderRadius:50}}>
                    <Checkbox.IOS
                        color={btnColorDark}
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setChecked(!checked);
                        }}
                    />
                </View>
                <Text style={{fontSize:17,marginStart:8, color:textColor,fontFamily:'Tajawal-Medium',}}> {t('accept.confirm_all')} </Text>
            </View>

            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> Service Warranty  </Text>
                <Text style={styles.text}>
                * We provide a 15 days service quality guarantee upon the completion of the work. Accredited Service Provider 
                </Text>
            </View>
            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> Accredited Service Provider   </Text>
                <Text style={styles.text}>
                * All providers that are provided through "Tartep app" go through a detailed screening process to validate their information and have to undergo skills and competency tests before joining the platform 
                </Text>
            </View>

            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> Pricing  </Text>
                <Text style={styles.text}>
                * The prices set for the services in the platform/ application don't include the prices of spare parts or materials m as well as the works of breaking, demolition, scaffolding for high ceilings, and others as such additional services require additional amounts that are set by the provider upon the visit.  
                </Text>
            </View>

            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> Important Notes  </Text>
                <Text style={styles.text}>
                * Do not forget to evaluate the service provider after the completion of the work. Any service prodder with a rating of less than 3 out of 5 will be removed from the platform immediately. Your evaluation is very important for us to improve the level of service quality.  
                </Text>
                <Text style={styles.text}>
                * Do not forget to review the details of your request with the service provided before the execution or implementation of the work. 
                </Text>
                <Text style={styles.text}>
                * Make sure that all your request process (such as agreeing on a new service, adding other services, or other details of the request) is done through the application, as the company can protect the client's rights and intervene in the event of any dispute.
                </Text>
               
                
            </View>

            
        </View>
        :
        <View style={[Gtyles.shadowFullCard]}>
             <View style={{flexDirection:'row',alignItems:'center',marginVertical:15,paddingVertical:15,borderWidth:1,borderColor:'black',borderRadius:10,justifyContent:'center'}}>
                <View style={{borderColor:'black',borderWidth:1,borderRadius:50}}>
                    <Checkbox.IOS
                        color={btnColorDark}
                        status={checked ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setChecked(!checked);
                        }}
                    />
                </View>
                
                <Text style={{fontSize:15,marginStart:8,color:textColor,fontFamily:'Tajawal-Medium',}}> {t('accept.confirm_all')}  </Text>
            </View>
            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}>ضمان الخدمة</Text>
                <Text style={styles.text}>
                * نقدم ضمان جودة الخدمة لمدة 15 يومًا عند الانتهاء من العمل. مزود خدمة معتمد
                </Text>
            </View>
            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> مزود خدمة معتمد   </Text>
                <Text style={styles.text}>
                * يخضع جميع مقدمي الخدمة الذين يتم توفيرهم من خلال التطبيق لعملية فحص مفصلة للتحقق من صحة معلوماتهم ويجب أن يخضعوا لاختبارات المهارات والكفاءات قبل الانضمام إلى التطبيق         
                </Text>
            </View>

            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> الاسعار  </Text>
                <Text style={styles.text}>
                * الأسعار المحددة للخدمات في المنصة / التطبيق لا تشمل أسعار قطع الغيار أو المواد م وكذلك أعمال التكسير والهدم والسقالات للأسقف العالية وغيرها حيث تتطلب الخدمات الإضافية مبالغ إضافية تكون التي حددها المزود عند الزيارة.
                </Text>
            </View>
{/* (i18n.language == 'ar') ? 'red' : textColor */}
            <View style={[{marginVertical:7}]}>
                <Text style={styles.title}> ملاحظات هامة  </Text>
                <Text style={styles.text}>
                * لا تنسى تقييم مزود الخدمة بعد الانتهاء من العمل. ستتم إزالة أي منتج خدمة بتقييم أقل من 3 من 5 من النظام الأساسي على الفور. تقييمك مهم جدًا بالنسبة لنا لتحسين مستوى جودة الخدمة.
                </Text>
                <Text style={styles.text}>
                * لا تنسى مراجعة تفاصيل طلبك مع الخدمة المقدمة قبل تنفيذ أو تنفيذ العمل.
                </Text>
                <Text style={styles.text}>
                * تأكد من أن جميع عمليات طلبك (مثل الموافقة على خدمة جديدة أو إضافة خدمات أخرى أو تفاصيل أخرى للطلب) تتم من خلال التطبيق ، حيث يمكن للشركة حماية حقوق العميل والتدخل في حالة حدوث أي نزاع .
                </Text>
                
                
            </View>

           
        </View>
    }
    
    </ScrollView>
        
        <View style={{backgroundColor:'orange',position:'absolute',bottom:10,backgroundColor:btnColorDark,
        borderRadius:3,
        width:'95%',
        alignSelf:'center',
        paddingVertical:15,
        paddingHorizontal:20,
        flexDirection:'row',
        justifyContent:'space-between'
        }}>
          <Text style={{fontSize:14,color:'white',fontFamily:'Tajawal-Regular'}}>{t('accept.footer')}</Text>
          <PlatformTouchable onPress={()=>{CONFIRMATION_HANDLER()}}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:15,color:'white',fontFamily:'Tajawal-Regular',}}>{t('next')} </Text>
          <Ionicons style={[(i18n.language == 'ar') && {transform: [{rotateY: '180deg'}]},{color:'white',fontSize:20}]} name="navigate-next" />
          </View>
          </PlatformTouchable>
        </View>
    </SafeAreaView>
    </Root>
    )
}



