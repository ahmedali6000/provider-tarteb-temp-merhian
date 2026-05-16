import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import axios from 'axios';
import HeaderApp from '../../../shared/Header';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSelector } from 'react-redux';
import { domain, succesColor } from '../../../utils/app';
import AppButton from '../../../components/auth/Button';
import Gtyles from '../../../styles/Gstyle';

const { width } = Dimensions.get('window');

const MyBundleDetailsScreen = ({ route }) => {
  const { id, title, bundleRoute } = route.params;
  const { t , i18n } = useTranslation();
  const tokenK = useSelector(state => state.auth.token);

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBundle = async () => {
    try {
      const res = await axios.get(`${domain}/api/my-bundle-details/${bundleRoute.id}`, {
        headers: {
          Authorization: `Bearer ${tokenK}`,
          Accept: 'application/json',
        },
      });
      setBundle(res.data);
    } catch (error) {
      console.error('Error fetching bundle:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markTodayAsDone = async () => {
    setModalLoading(true);
    try {
      await axios.post(`${domain}/api/mark-bundle-day-done`, {
        bundle_user_id: bundleRoute.id,
      }, {
        headers: {
          Authorization: `Bearer ${tokenK}`,
          Accept: 'application/json',
        },
      });

      // Toast.show({
      //   type: 'success',
      //   text1: 'تم تأكيد إتمام اليوم بنجاح',
      // });

      setModalVisible(false);
      fetchBundle(); // لتحديث علامة ✅
    } catch (error) {
      // Toast.show({
      //   type: 'error',
      //   text1: 'فشل في تأكيد اليوم',
      //   text2: error.response?.data?.message || 'حدث خطأ ما',
      // });
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchBundle();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBundle();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0284C7" />
      </SafeAreaView>
    );
  }

  if (!bundle) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>حدث خطأ في تحميل البيانات.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 ,}}>
      <HeaderApp title={title || 'تفاصيل الباقة'} />
      <ScrollView
        
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        <View style={styles.container}>

        
        <View style={{ flexDirection: 'row', paddingHorizontal: 5 ,paddingVertical:10}}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{bundle.bundle_name}</Text>

            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.subInfo}> الساعة: {bundle.hour}</Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="calendar" size={18} color="#666" />
              <Text style={styles.subInfo}>
                من {bundle.start_date} إلى {bundle.end_date}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="folder" size={18} color="#666" />
              <Text style={styles.subInfo}> الفئة: {bundle.category}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="bar-chart" size={18} color="#666" />
              <Text style={styles.subInfo}>
                {bundle.visits_num_per_week} زيارات أسبوعيًا - {bundle.visits_num_per_month} شهريًا
              </Text>
            </View>
          </View>
          <View>
            <Image source={require('./../../../../assets/images/bundle-details.png')} style={{ width: 100, height: 150 }} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.sectionTitle,(i18n.language == 'ar') && {textAlign:'left'}]}>وصف الباقة</Text>
          <Text style={[styles.description,(i18n.language == 'ar') && {textAlign:'left'}]}>{bundle.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.sectionTitle,(i18n.language == 'ar') && {textAlign:'left'}]}>أيام الحجز</Text>
          <View style={styles.daysWrapper}>
            {bundle.bundle_booked_days.map((item) => {
              const dayStyles = [
                styles.dayBox,
                item.passed ? styles.passedDay : styles.futureDay,
              ];

              return (
                <View key={item.id} style={dayStyles}>
                  <Text style={styles.dayText}>{item.day}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                  {item.done && (
                    <Ionicons
                      name="checkmark-circle"
                      size={25}
                      color="#16A34A"
                      style={{ position: 'absolute', top: -7, start: -7 }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {bundle.isToday && (
          <AppButton
            title={'تأكيد إتمام اليوم'}
            primary={true}
            style={[Gtyles.button, Gtyles.primaryButton, {
              marginTop: 30,
              alignSelf: 'center',
              width: '70%',
              marginBottom: 50,
              backgroundColor: succesColor
            }]}
            onPressP={() => setModalVisible(true)}
          />
        )}

        {/* ✅ Modal التأكيد */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={Gtyles.modalOverlay}>
            <View style={Gtyles.modalContainer}>
              {modalLoading ? (
                <>
                  <ActivityIndicator size="large" color="#0284C7" />
                  <Text style={[Gtyles.modalTitle, { marginTop: 20 }]}>يتم تأكيد اليوم...</Text>
                </>
              ) : (
                <>
                  <Text style={Gtyles.modalTitle}>هل أنت متأكد من إتمام هذا اليوم؟</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 , justifyContent:'center',alignItems:'center'}}>
                    <TouchableOpacity
                      onPress={markTodayAsDone}
                      style={[Gtyles.ModalprimaryButton, { flex: 1, marginRight: 8 , marginBottom:0 }]}
                    >
                      <Text style={Gtyles.ModalprimaryButtonText}>نعم</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={[Gtyles.ModalsecondaryButton, { flex: 1, marginLeft: 8 }]}
                    >
                      <Text style={Gtyles.ModalsecondaryButtonText}>إلغاء</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
</View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyBundleDetailsScreen;


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
    paddingHorizontal: 20,
    
  },
  title: {
    fontSize: 18,
    fontFamily: 'Tajawal-Bold',
    color: '#1E293B',
    marginBottom: 16,
    //marginTop:0
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subInfo: {
    fontSize: 12.5,
    color: '#4B5563',
    marginLeft: 8,
     fontFamily: 'Tajawal-Bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
     fontFamily: 'Tajawal-Bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
     fontFamily: 'Tajawal-Regular',
  },
  daysWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayBox: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    width: (width - 100) / 3, // العرض مع padding و spacing مناسب
    alignItems: 'center',
    marginBottom: 12,
  },
  futureDay: {
    opacity: 0.7,
    // backgroundColor:'#ddd'
  },
  passedDay: {
    opacity: 1,
  },
  dayText: {
    fontSize: 13,
     fontFamily: 'Tajawal-Bold',
    color: '#0284C7',
  },
  dateText: {
    fontSize: 14,
     fontFamily: 'Tajawal-Regular',
    color: '#0369A1',
  },
 
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
