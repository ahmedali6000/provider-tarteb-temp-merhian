import React, { useState  , useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import HeaderApp from '../../shared/Header';
import AppButton from '../../components/auth/Button';
import Gtyles from '../../styles/Gstyle';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/ar';
import { btnColor, domain } from '../../utils/app';
import axios from 'axios';
import { useSelector , useDispatch} from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';
 import { useFocusEffect } from '@react-navigation/native';
import { BUNDLE_DAYS_SET, BUNDLE_HOUR_SET, BUNDLE_ID_SET, BUNDLE_OR_ORDER } from '../../redux/actions/ActionTypes';
 const days = [
  { ar: 'الأحد', en: 'Sun' },
  { ar: 'الاثنين', en: 'Mon' },
  { ar: 'الثلاثاء', en: 'Tue' },
  { ar: 'الأربعاء', en: 'Wed' },
  { ar: 'الخميس', en: 'Thu' },
  { ar: 'الجمعة', en: 'Fri' },
  { ar: 'السبت', en: 'Sat' },
];

const hours = Array.from({ length: 14 }, (_, i) => i + 9); // من 9 صباحًا حتى 22 مساءً

export default function DaySelectionScreen({ route, navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
const [modalSuccess, setModalSuccess] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [modalLoader, setmodalLoader] = useState(false);
const dispatch = useDispatch();
 const tokenK = useSelector(state => state.auth.token);
const { bundle } = route.params;
useFocusEffect(
  useCallback(() => {
    // Reset any modal or state here
    setModalVisible(false);
    setModalSuccess(false);
    setModalMessage('');
    // Reset selections if needed
    // setSelectedDays([]);
    // setSelectedHour(null);

    return () => {
      // cleanup if needed
    };
  }, [])
);
 const GoPay = () =>{
//  dispatch({
//       type: BUNDLE_OR_ORDER,
//       payload: 'bundle'
//   });
  dispatch({
      type: BUNDLE_DAYS_SET,
      payload: selectedDays
  });
   dispatch({
      type: BUNDLE_ID_SET,
      payload: bundle.id
  });
    dispatch({
      type: BUNDLE_HOUR_SET,
      payload: selectedHour
  });
setModalVisible(false)
    navigation.navigate('PaymentMethods',{
        item_name:'#'+bundle.id,
        item_id: bundle.id,
       
        item_price: Number (bundle.price),
    });
 }

const handleSubmit = () => {
  if (selectedDays.length < Number(bundle.num_per_week)) {
     
    setModalMessage(`${t('bundle.modal.error.you_have_to')} ${bundle.num_per_week} ${t('bundle.modal.error.days')}`);
    setModalSuccess(false);
    setModalVisible(true);
    return;
  }

  if (!selectedHour) {
     
    setModalMessage(t('bundle.modal.error.errorhour'));
    setModalSuccess(false);
    setModalVisible(true);
    return;
  }

  // تم التحقق
  const payload = {
    days: selectedDays,        // ['Mon', 'Wed', ...]
    hour: selectedHour,        // 14
    bundle_id: bundle.id       // assuming bundle has an id
  };

    
   
      setModalMessage(t('bundle.modal.success.body'));
      setModalSuccess(true);
      setModalVisible(true);

  // simulate API
// axios.post(
//     `${domain}/api/book-bundle`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${tokenK}`, // تأكد من توفر التوكن
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         }
//       }
//     ).then(() => {
//       setModalMessage('تم الحجز بنجاح');
//       setModalSuccess(true);
//       setModalVisible(true);
//     })
//     .catch(() => {
//       setModalMessage('حدث خطأ أثناء الإرسال');
//       setModalSuccess(false);
//       setModalVisible(true);
//     }) 
};

  
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const { t, i18n } = useTranslation();

  const toggleDay = (dayEn) => {
    const isSelected = selectedDays.includes(dayEn);
    if (isSelected) {
      setSelectedDays(selectedDays.filter(d => d !== dayEn));
    } else {
      if (selectedDays.length < Number(bundle.num_per_week)) {
        setSelectedDays([...selectedDays, dayEn]);
      } else {
        // Alert.alert(`لا يمكنك اختيار أكثر من ${bundle.num_per_week} أيام`);
         setModalMessage(`${t('bundle.modal.error.enough_days')} ${bundle.num_per_week} ${t('bundle.modal.error.days')}`);
      setModalSuccess(false);
      setModalVisible(true);
      }
    }
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hour + 11) % 12 + 1).toString().padStart(2, '0');
    return `${formattedHour}:00 ${period}`;
  };

  const formattedEndDate = () => {
    const duration = parseInt(bundle.countAvaliableDays || '30');
    const date = moment().add(duration, 'days');
    return i18n.language === 'ar' ? date.locale('ar').format('D MMMM YYYY') : date.format('D MMM, YYYY');
  };

  return (
    <SafeAreaView style={{ flex: 1 ,}}>
      <ScrollView  contentContainerStyle={{ flexGrow: 1 }}
  style={{ flex: 1 }} >
        <HeaderApp title={t('bundles.selectDayTitle')} />
        <View style={styles.container}>
          {/* بيانات الباقة */}
          <View style={styles.packageInfo}>
            <Image source={require('./../../../assets/images/calendar.png')} style={{ width: 110, height: 110 }} />
            <Text style={styles.packageTitle}>  {bundle.name}</Text>
             <Text style={styles.packageSonTitle}>  {bundle.category}</Text>
            <Text style={styles.packageDescription}>
              {t('bundles.choose_days', { count: bundle.num_per_week })}
            </Text>
          </View>

          {/* قائمة الأيام */}
          <View style={styles.daysContainer}>
            {days.map((day, index) => {
              const isSelected = selectedDays.includes(day.en);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleDay(day.en)}
                  style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.ar}
                  </Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* اختيار الوقت */}
        <View style={styles.hourContainer}>
         <View>
           <Text style={styles.sectionTitle}>اختر الساعة المناسبة</Text>
          <View style={{ }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}   
            >
            {hours.map((hour, index) => {
              const isSelected = selectedHour === hour;
              const displayHour = formatHour(hour);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedHour(hour)}
                  style={[styles.hourItem, isSelected && styles.hourItemSelected]}
                >
                  <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>
                    {displayHour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          </View>
         </View>

          {/* عرض مختصر للبيانات */}
          {(selectedDays.length > 0 || selectedHour !== null) && (
           <View style={styles.infoBox}>
              <Text style={styles.sectionTitle}>البيانات المختارة:</Text>
             <View style={styles.badgesContainer}>
              {selectedDays.map((d, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{days.find(day => day.en === d)?.ar}</Text>
                </View>
              ))}

              {/* فاصل مرئي */}
              {selectedDays.length > 0 && selectedHour !== null && (
                <View style={styles.separator} />
              )}

              {selectedHour !== null && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatHour(selectedHour)}</Text>
                </View>
              )}
            </View>
              <View style={{ }}>
                <Text style={styles.infoText}>سعر الباقة: <Text style={{fontFamily:'Tajawal-Bold',color:'green'}}>{bundle.price} {t('cur')}</Text></Text>
                {bundle.type === 'monthly' && (
                  <Text style={styles.infoText}>صالحة حتى: <Text style={{fontFamily:'Tajawal-Bold',color:'#d930ff'}}> {formattedEndDate()} </Text></Text>
                )}
              </View>
            </View>
          )}

          <AppButton
            title='اشتراك في الباقة'
            primary={true}
            style={[Gtyles.button, Gtyles.primaryButton, { marginTop: 25, width: '85%', maxWidth: 300, alignSelf: 'center' }]}
            onPressP={handleSubmit}
          />
        </View>
      
        <Modal
            transparent={true}
            visible={modalVisible} //modalVisible
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
        >
          <View style={Gtyles.modalOverlay}>
            {
          (modalLoader == true) ?
              <View style={[Gtyles.modalContainer,{paddingVertical:50}]}>
                  <ActivityIndicator color={btnColor} size={'large'} />
                  <Text style={[Gtyles.modalTitle,{marginTop:30,fontSize:15}]}> sending data to the server ... </Text>
              </View>
              :
              <View style={Gtyles.modalContainer}>
                <View style={Gtyles.modalIconWrapper}>
                  <View style={[Gtyles.modalIconCircle, { backgroundColor: modalSuccess ? 'green' : '#ef4444' }]}>
                    <Ionicons name={modalSuccess ? 'checkmark' : 'close'} size={30} color="#fff" />
                  </View>
                </View>

                <Text style={Gtyles.modalTitle}>
                  {modalSuccess ? t('bundle.modal.success.title') : t('bundle.modal.error.title')}
                </Text>
                <Text style={Gtyles.modalText}>{modalMessage}</Text>

                {modalSuccess ? (
                  <>
                    <TouchableOpacity onPress={GoPay} style={Gtyles.ModalprimaryButton}>
                      <Text style={Gtyles.ModalprimaryButtonText}>ادفع واشترك</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Gtyles.ModalsecondaryButton}>
                      <Text onPress={() => setModalVisible(false)} style={Gtyles.ModalsecondaryButtonText}>الغاء</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[Gtyles.ModalprimaryButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={Gtyles.ModalprimaryButtonText}>إغلاق</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            
          </View>
        </Modal>

      
      </ScrollView>


      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 10,
  },
  packageInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  packageTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#000',
  },
    packageSonTitle: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
    color: '#ff6f61',
  },
  packageDescription: {
    fontSize: 13.5,
    fontFamily: 'Tajawal-Regular',
    color: '#444',
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center'
  },
  daysContainer: {
    width: '45%',
    marginLeft: 16,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  dayItemSelected: {
    backgroundColor: '#0e5f99',
    borderColor: '#0e5f99',
  },
  dayText: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
  },
  dayTextSelected: {
    color: '#fff',
  },
  hourContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingBottom:30,
    paddingHorizontal: 13,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Tajawal-Bold',
    marginBottom: 20,
    marginHorizontal: 7,
    color: '#000',
  },
  hourItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0e5f99',
    marginEnd: 10,
    maxHeight:50,
  },
  hourItemSelected: {
    backgroundColor: '#0e5f99',
  },
  hourText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: 14,
    color: '#0e5f99',
  },
  hourTextSelected: {
    color: '#fff',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  badge: {
    backgroundColor: '#e0f0ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginEnd: 6,
  },
  badgeText: {
    color: '#0e5f99',
    fontSize: 13,
    fontFamily: 'Tajawal-Bold',
  },
  infoBox: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Tajawal-Regular',
    marginBottom: 4,
  },
  separator: {
  width: 1,
  backgroundColor: '#ccc',
  marginHorizontal: 6,
  alignSelf: 'stretch',
},

});
