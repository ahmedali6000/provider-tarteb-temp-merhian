import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import {
  BUNDLE_DAYS_SET,
  BUNDLE_HOUR_SET,
  BUNDLE_ID_SET,
} from '../../../redux/actions/ActionTypes';

const DAYS = [
  {ar: 'السبت', en: 'Sat'},
  {ar: 'الأحد', en: 'Sun'},
  {ar: 'الإثنين', en: 'Mon'},
  {ar: 'الثلاثاء', en: 'Tue'},
  {ar: 'الأربعاء', en: 'Wed'},
  {ar: 'الخميس', en: 'Thu'},
  {ar: 'الجمعة', en: 'Fri'},
];

const HOURS = [
  {value: 9, label: '09:00', periodAr: 'صباحاً'},
  {value: 10, label: '10:00', periodAr: 'صباحاً'},
  {value: 11, label: '11:00', periodAr: 'صباحاً'},
  {value: 12, label: '12:00', periodAr: 'ظهراً'},
  {value: 13, label: '01:00', periodAr: 'ظهراً'},
  {value: 14, label: '02:00', periodAr: 'ظهراً'},
  {value: 15, label: '03:00', periodAr: 'عصراً'},
  {value: 16, label: '04:00', periodAr: 'عصراً'},
  {value: 17, label: '05:00', periodAr: 'مساءً'},
  {value: 18, label: '06:00', periodAr: 'مساءً'},
  {value: 19, label: '07:00', periodAr: 'مساءً'},
  {value: 20, label: '08:00', periodAr: 'مساءً'},
];

const DaySelectionScreen = ({route, navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const bundle = route?.params?.bundle || {};

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalLoader, setModalLoader] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setModalVisible(false);
      setModalSuccess(false);
      setModalMessage('');
      setModalLoader(false);

      return () => {};
    }, []),
  );

  const requiredDaysCount = useMemo(() => {
    const count = Number(bundle?.num_per_week || 1);
    return Number.isNaN(count) || count <= 0 ? 1 : count;
  }, [bundle?.num_per_week]);

  const features = useMemo(() => {
    const list = [];

    if (bundle?.num_per_week) {
      list.push(
        `${bundle.num_per_week} ${tr(
          'bundles.week_times',
          'مرة أسبوعياً',
        )}`,
      );
    }

    if (bundle?.num_per_month) {
      list.push(
        `${bundle.num_per_month} ${tr(
          'bundles.month_times',
          'مرة شهرياً',
        )}`,
      );
    }

    if (bundle?.description) {
      list.push(bundle.description);
    }

    return list;
  }, [bundle?.num_per_week, bundle?.num_per_month, bundle?.description, t]);

  const canContinue =
    selectedDays.length === requiredDaysCount && selectedHour !== null;

  const toggleDay = dayEn => {
    const isSelected = selectedDays.includes(dayEn);

    if (isSelected) {
      setSelectedDays(prev => prev.filter(day => day !== dayEn));
      return;
    }

    if (selectedDays.length >= requiredDaysCount) {
      setModalSuccess(false);
      setModalMessage(
        `${tr(
          'bundle.modal.error.enough_days',
          'لا يمكنك اختيار أكثر من',
        )} ${requiredDaysCount} ${tr('bundle.modal.error.days', 'أيام')}`,
      );
      setModalVisible(true);
      return;
    }

    setSelectedDays(prev => [...prev, dayEn]);
  };

  const handleContinue = () => {
    if (selectedDays.length < requiredDaysCount) {
      setModalSuccess(false);
      setModalMessage(
        `${tr(
          'bundle.modal.error.you_have_to',
          'يجب اختيار',
        )} ${requiredDaysCount} ${tr('bundle.modal.error.days', 'أيام')}`,
      );
      setModalVisible(true);
      return;
    }

    if (selectedDays.length > requiredDaysCount) {
      setModalSuccess(false);
      setModalMessage(
        `${tr(
          'bundle.modal.error.enough_days',
          'لا يمكنك اختيار أكثر من',
        )} ${requiredDaysCount} ${tr('bundle.modal.error.days', 'أيام')}`,
      );
      setModalVisible(true);
      return;
    }

    if (selectedHour === null) {
      setModalSuccess(false);
      setModalMessage(
        tr('bundle.modal.error.errorhour', 'اختر الساعة المناسبة'),
      );
      setModalVisible(true);
      return;
    }

    setModalSuccess(true);
    setModalMessage(
      tr(
        'bundle.modal.success.body',
        'تم اختيار بيانات الباقة بنجاح، يمكنك المتابعة للدفع الآن',
      ),
    );
    setModalVisible(true);
  };

 const goPay = () => {
  dispatch({
    type: BUNDLE_DAYS_SET,
    payload: selectedDays,
  });

  dispatch({
    type: BUNDLE_ID_SET,
    payload: bundle.id,
  });

  dispatch({
    type: BUNDLE_HOUR_SET,
    payload: selectedHour,
  });

  setModalVisible(false);

  navigation.navigate('OrderPaymentChannelsScreen', {
    bundle_id: bundle.id,
    amount: Number(bundle.price || 0),
    payment_for: 'bundle',

    selected_days: selectedDays,
    selected_hour: selectedHour,
    bundle,
  });
};

  const renderFeature = (text, index) => {
    return (
      <View key={`${text}-${index}`} style={styles.featureRow}>
        <View style={styles.featureIconBox}>
          <Ionicons name="checkmark-done" size={15} color="#FFFFFF" />
        </View>
        <AppText style={styles.featureText}>{text}</AppText>
      </View>
    );
  };

  const renderDay = day => {
    const isSelected = selectedDays.includes(day.en);

    return (
      <TouchableOpacity
        key={day.en}
        activeOpacity={0.86}
        style={[styles.dayChip, isSelected && styles.dayChipActive]}
        onPress={() => toggleDay(day.en)}>
        <AppText
          weight="bold"
          style={[styles.dayChipText, isSelected && styles.dayChipTextActive]}>
          {day.ar}
        </AppText>

        {isSelected ? (
          <View style={styles.smallCheck}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderHour = hour => {
    const isSelected = selectedHour === hour.value;

    return (
      <TouchableOpacity
        key={hour.value}
        activeOpacity={0.86}
        style={[styles.hourChip, isSelected && styles.hourChipActive]}
        onPress={() => setSelectedHour(hour.value)}>
        <AppText
          weight="bold"
          style={[styles.hourText, isSelected && styles.hourTextActive]}>
          {hour.label}
        </AppText>

        <AppText
          style={[styles.hourPeriod, isSelected && styles.hourPeriodActive]}>
          {hour.periodAr}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#72C8DE', '#AEE4EF', '#F3FBFD', '#FFFFFF']}
        locations={[0, 0.34, 0.68, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.topGradient}
      />

      <View style={styles.screen}>
        <AppHeader
          title={bundle?.name || tr('bundles.package_details', 'تفاصيل الباقة')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroCircleOne} />
            <View style={styles.heroCircleTwo} />

            <View style={styles.heroTopRow}>
              <View style={styles.crownBox}>
                <AppText style={styles.crown}>👑</AppText>
              </View>

              <View style={styles.heroTitleWrap}>
                <AppText weight="bold" style={styles.packageTitle}>
                  {bundle?.name || tr('bundles.package', 'الباقة')}
                </AppText>

                <AppText style={styles.packageSubtitle}>
                  {tr('bundles.package_details', 'تفاصيل الباقة')}
                </AppText>
              </View>
            </View>

            <View style={styles.featuresBox}>
              {features.map(renderFeature)}
            </View>

            {!!bundle?.price && (
              <View style={styles.priceCard}>
                <View>
                  <AppText style={styles.priceLabel}>
                    {tr('bundles.package_price', 'سعر الباقة')}
                  </AppText>

                  <View style={styles.priceValueRow}>
                    <AppText style={styles.currencyText}>
                      {tr('orders.currency', 'ج.م')}
                    </AppText>

                    <AppText weight="bold" style={styles.priceValue}>
                      {formatPrice(bundle.price)}
                    </AppText>
                  </View>
                </View>

                {!!bundle?.real_price &&
                Number(bundle.real_price) > Number(bundle.price) ? (
                  <View style={styles.oldPriceWrap}>
                    <AppText style={styles.oldPriceLabel}>
                      {tr('bundles.before_discount', 'قبل الخصم')}
                    </AppText>

                    <View style={styles.oldPriceRow}>
                      <AppText style={styles.oldCurrencyText}>
                        {tr('orders.currency', 'ج.م')}
                      </AppText>

                      <AppText weight="bold" style={styles.oldPriceValue}>
                        {formatPrice(bundle.real_price)}
                      </AppText>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <AppText weight="bold" style={styles.sectionTitle}>
                  {tr('bundles.days_count', 'عدد الأيام')}
                </AppText>

                <AppText style={styles.sectionSubtitle}>
                  {tr('bundles.choose_exact_days', 'اختر')} {requiredDaysCount}{' '}
                  {tr('bundle.modal.error.days', 'أيام')}
                </AppText>
              </View>

              <View style={styles.counterBadge}>
                <AppText weight="bold" style={styles.counterBadgeText}>
                  {selectedDays.length}/{requiredDaysCount}
                </AppText>
              </View>
            </View>

            <View style={styles.daysGrid}>{DAYS.map(renderDay)}</View>
          </View>

          <View style={styles.cardSection}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <AppText weight="bold" style={styles.sectionTitle}>
                  {tr('bundles.select_hour', 'حدد الساعة')}
                </AppText>

                <AppText style={styles.sectionSubtitle}>
                  {tr('bundles.choose_visit_time', 'اختر وقت الزيارة المناسب')}
                </AppText>
              </View>

              <View style={styles.timeIconBox}>
                <Ionicons name="time-outline" size={19} color="#3296D9" />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hoursContent}>
              {HOURS.map(renderHour)}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}>
            <AppText weight="bold" style={styles.continueButtonText}>
              {tr('bundles.continue_payment', 'متابعة للدفع')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {modalLoader ? (
              <>
                <ActivityIndicator size="large" color="#3296D9" />
                <AppText style={styles.modalLoadingText}>
                  {tr('common.sending_data', 'جاري إرسال البيانات...')}
                </AppText>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.modalIconCircle,
                    {backgroundColor: modalSuccess ? '#22A06B' : '#EF4444'},
                  ]}>
                  <Ionicons
                    name={modalSuccess ? 'checkmark' : 'close'}
                    size={30}
                    color="#FFFFFF"
                  />
                </View>

                <AppText weight="bold" style={styles.modalTitle}>
                  {modalSuccess
                    ? tr('bundle.modal.success.title', 'تم بنجاح')
                    : tr('bundle.modal.error.title', 'تنبيه')}
                </AppText>

                <AppText style={styles.modalText}>{modalMessage}</AppText>

                {modalSuccess ? (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.modalPrimaryButton}
                      onPress={goPay}>
                      <AppText
                        weight="bold"
                        style={styles.modalPrimaryButtonText}>
                        {tr('bundles.pay_and_subscribe', 'ادفع واشترك')}
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.modalSecondaryButton}
                      onPress={() => setModalVisible(false)}>
                      <AppText
                        weight="bold"
                        style={styles.modalSecondaryButtonText}>
                        {tr('common.cancel', 'إلغاء')}
                      </AppText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={[
                      styles.modalPrimaryButton,
                      {backgroundColor: '#EF4444'},
                    ]}
                    onPress={() => setModalVisible(false)}>
                    <AppText
                      weight="bold"
                      style={styles.modalPrimaryButtonText}>
                      {tr('common.close', 'إغلاق')}
                    </AppText>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default DaySelectionScreen;

const formatPrice = value => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue % 1 === 0 ? String(numberValue) : numberValue.toFixed(2);
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 410,
  },

  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 132,
  },

  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.28)',
    top: -70,
    start: -55,
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(50,150,217,0.10)',
    bottom: -36,
    end: 18,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  crownBox: {
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  crown: {
    fontSize: 22,
  },

  heroTitleWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },

  packageTitle: {
    fontSize: 22,
    color: '#111111',
    textAlign: 'auto',
    lineHeight: 30,
  },

  packageSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: '#61727C',
    textAlign: 'auto',
  },

  featuresBox: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  featureIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 7,
  },

  featureText: {
    flex: 1,
    fontSize: 13.5,
    color: '#53636C',
    textAlign: 'auto',
    lineHeight: 20,
  },

  priceCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E7F0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 12,
    color: '#7B8790',
    marginBottom: 3,
    textAlign: 'auto',
  },

  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  currencyText: {
    fontSize: 11,
    color: '#60717B',
    marginEnd: 4,
    marginBottom: 4,
  },

  priceValue: {
    fontSize: 24,
    color: '#101010',
    lineHeight: 30,
  },

  oldPriceWrap: {
    alignItems: 'flex-end',
  },

  oldPriceLabel: {
    fontSize: 11,
    color: '#9AA3A8',
    marginBottom: 3,
  },

  oldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  oldCurrencyText: {
    fontSize: 10,
    color: '#A3A3A3',
    marginEnd: 3,
    textDecorationLine: 'line-through',
  },

  oldPriceValue: {
    fontSize: 15,
    color: '#A3A3A3',
    textDecorationLine: 'line-through',
  },

  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF1F3',
    shadowColor: '#000',
    shadowOpacity: 0.045,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 15,
    color: '#151515',
    textAlign: 'auto',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#87939A',
    textAlign: 'auto',
  },

  counterBadge: {
    minWidth: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF6FF',
    borderWidth: 1,
    borderColor: '#C7E8FC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  counterBadgeText: {
    fontSize: 12,
    color: '#3296D9',
  },

  timeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  dayChip: {
    width: '31%',
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EA',
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  dayChipActive: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FF',
  },

  dayChipText: {
    fontSize: 13,
    color: '#1F1F1F',
  },

  dayChipTextActive: {
    color: '#1F1F1F',
  },

  smallCheck: {
    position: 'absolute',
    top: -5,
    end: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  hoursContent: {
    paddingEnd: 18,
    paddingVertical: 2,
  },

  hourChip: {
    width: 72,
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EA',
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
    paddingVertical: 8,
  },

  hourChipActive: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FF',
  },

  hourText: {
    fontSize: 16,
    color: '#171717',
    marginBottom: 5,
  },

  hourTextActive: {
    color: '#111111',
  },

  hourPeriod: {
    fontSize: 11,
    color: '#8A8A8A',
  },

  hourPeriodActive: {
    color: '#61727C',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },

  continueButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3296D9',
    shadowOpacity: 0.22,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 12,
    elevation: 3,
  },

  continueButtonDisabled: {
    backgroundColor: '#C8DEEA',
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },

  modalIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalText: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 20,
  },

  modalLoadingText: {
    fontSize: 14,
    color: '#777777',
    marginTop: 18,
  },

  modalPrimaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  modalSecondaryButton: {
    width: '100%',
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  modalSecondaryButtonText: {
    color: '#777777',
    fontSize: 14,
  },
});