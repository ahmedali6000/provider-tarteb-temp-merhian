import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  I18nManager,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';

import {
  SET_ORDER_TYPE,
  SET_ORDER_SCHEDULING_TYPE,
} from '../../../../redux/actions/ActionTypes';

import {getScheduleSettings} from '../../../../services/scheduleService';

const COLORS = {
  primary: '#3296D9',
  primarySoft: '#EAF6FE',
  bg: '#FFFFFF',
  softBg: '#F8F8F8',
  border: '#E5E7EB',
  text: '#111111',
  subText: '#9A9A9A',
  line: '#EEEEEE',
  orange: '#F59E0B',
  noticeText: '#222222',
};

const SCHEDULE_IMAGE = require('../../../../../assets/app/images/vectors/clendar.png');

const DEFAULT_SETTINGS = {
  days_count: 5,
  start_time: '10:00',
  end_time: '14:00',
  slot_minutes: 60,
  disabled_dates: [],
  disabled_slots: {},
  booking_note_enabled: false,
  booking_note_start_day_index: 4,
  booking_note_ar: '',
  booking_note_en: '',
};

const DAY_CARD_WIDTH = 72;
const TIME_CARD_WIDTH = 72;

const OrderScheduleScreen = ({navigation, route}) => {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();

  const order = useSelector(state => state.order);
  const savedSchedule = order?.sch_data || null;

  const selectedAddress = route?.params?.selectedAddress || null;
  const category = route?.params?.category || null;

  const isArabic = i18n.language === 'ar' || I18nManager.isRTL;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const hydratedFromReduxRef = useRef(false);

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  useEffect(() => {
    dayjs.locale(isArabic ? 'ar' : 'en');
  }, [isArabic]);

  useEffect(() => {
    fetchSettings(false);
  }, []);

  const fetchSettings = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const response = await getScheduleSettings();
      const apiSettings = response?.data || {};

      setSettings({
        ...DEFAULT_SETTINGS,
        ...apiSettings,
        disabled_dates: apiSettings?.disabled_dates || [],
        disabled_slots: apiSettings?.disabled_slots || {},
      });
    } catch (error) {
      console.log(
        'SCHEDULE SETTINGS ERROR:',
        error?.response?.data || error?.message,
      );

      setSettings(DEFAULT_SETTINGS);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchSettings(true);
    } finally {
      setRefreshing(false);
    }
  };

  const getDayName = (date, index) => {
    if (index === 0) {
      return tr('schedule.today', 'اليوم');
    }

    return isArabic
      ? date.locale('ar').format('dddd')
      : date.locale('en').format('dddd');
  };

  const getMonthName = date => {
    return isArabic
      ? date.locale('ar').format('MMMM')
      : date.locale('en').format('MMMM');
  };

  const dates = useMemo(() => {
    const count = Number(settings?.days_count || 5);
    const disabledDates = settings?.disabled_dates || [];

    return Array.from({length: count}, (_, index) => {
      const date = dayjs().add(index, 'day');
      const dateKey = date.format('YYYY-MM-DD');

      return {
        id: dateKey,
        index,
        raw: date,
        dayName: getDayName(date, index),
        dayNumber: date.format('D'),
        monthName: getMonthName(date),
        year: date.format('YYYY'),
        disabled: disabledDates.includes(dateKey),
      };
    });
  }, [settings, isArabic, i18n.language]);

  useEffect(() => {
    if (!dates.length || selectedDate) {
      return;
    }

    if (!hydratedFromReduxRef.current && savedSchedule?.date) {
      const savedDateExists = dates.find(
        item => item.id === savedSchedule.date && !item.disabled,
      );

      if (savedDateExists) {
        hydratedFromReduxRef.current = true;
        setSelectedDate(savedSchedule.date);
        return;
      }
    }

    const firstAvailableDate = dates.find(item => !item.disabled);

    if (firstAvailableDate) {
      hydratedFromReduxRef.current = true;
      setSelectedDate(firstAvailableDate.id);
    }
  }, [dates, selectedDate, savedSchedule?.date]);

  const generateTimeSlots = () => {
    const startTime = settings?.start_time || '10:00';
    const endTime = settings?.end_time || '14:00';
    const slotMinutes = Number(settings?.slot_minutes || 60);

    const [startHour, startMinute] = String(startTime).split(':').map(Number);
    const [endHour, endMinute] = String(endTime).split(':').map(Number);

    if (
      !Number.isFinite(startHour) ||
      !Number.isFinite(startMinute) ||
      !Number.isFinite(endHour) ||
      !Number.isFinite(endMinute)
    ) {
      return [];
    }

    let cursor = dayjs()
      .hour(startHour)
      .minute(startMinute)
      .second(0)
      .millisecond(0);

    const end = dayjs()
      .hour(endHour)
      .minute(endMinute)
      .second(0)
      .millisecond(0);

    const slots = [];

    while (cursor.isBefore(end) || cursor.isSame(end)) {
      slots.push({
        id: cursor.format('HH:mm'),
        display: cursor.format('HH:mm'),
        hour: Number(cursor.format('H')),
      });

      cursor = cursor.add(slotMinutes, 'minute');
    }

    return slots;
  };

  const getPeriod = hour => {
    if (hour < 12) {
      return tr('schedule.am', 'صباحاً');
    }

    return tr('schedule.pm', 'ظهراً');
  };

  const timeSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const disabledForDate = settings?.disabled_slots?.[selectedDate] || [];

    return generateTimeSlots().map(slot => ({
      id: slot.id,
      time: slot.display,
      period: getPeriod(slot.hour),
      disabled: disabledForDate.includes(slot.id),
    }));
  }, [selectedDate, settings, i18n.language]);

  useEffect(() => {
    if (!selectedDate || !timeSlots.length) {
      return;
    }

    if (
      savedSchedule?.date === selectedDate &&
      savedSchedule?.hour &&
      !selectedSlot
    ) {
      const savedSlotExists = timeSlots.find(
        item => item.id === savedSchedule.hour && !item.disabled,
      );

      if (savedSlotExists) {
        setSelectedSlot(savedSchedule.hour);
      }
    }
  }, [selectedDate, timeSlots, savedSchedule?.date, savedSchedule?.hour]);

  const selectedDateItem = useMemo(() => {
    return dates.find(item => item.id === selectedDate) || null;
  }, [dates, selectedDate]);

  const selectedMonthData = useMemo(() => {
    return {
      monthName: selectedDateItem?.monthName || getMonthName(dayjs()),
      year: selectedDateItem?.year || dayjs().format('YYYY'),
    };
  }, [selectedDateItem, isArabic]);

  const shouldShowBookingNote = useMemo(() => {
    if (!settings?.booking_note_enabled || !selectedDateItem) {
      return false;
    }

    return (
      Number(selectedDateItem.index) >=
      Number(settings?.booking_note_start_day_index || 0)
    );
  }, [settings, selectedDateItem]);

/*
|--------------------------------------------------------------------------
| بيانات ملاحظة الحجز
|--------------------------------------------------------------------------
|
| الـ backend يرجع:
|
| booking_note = {
|   before: '',
|   highlight: '',
|   after: '',
| }
|
| حتى نستطيع تلوين الجزء المهم داخل النص.
|
*/
const bookingNote = settings?.booking_note;

  const chooseDate = item => {
    if (item.disabled) {
      return;
    }

    setSelectedDate(item.id);
    setSelectedSlot(null);
  };

  const chooseSlot = item => {
    if (item.disabled) {
      return;
    }

    setSelectedSlot(item.id);
  };

  const confirmSchedule = () => {
    if (!selectedDate || !selectedSlot) {
      return;
    }

    const selectedSlotItem = timeSlots.find(item => item.id === selectedSlot);

    const schData = {
      date: selectedDate,
      dayName: selectedDateItem?.dayName,
      dayNumber: selectedDateItem?.dayNumber,
      monthName: selectedDateItem?.monthName,
      year: selectedDateItem?.year,
      hour: selectedSlot,
      hourStr: `${selectedSlotItem?.time} ${selectedSlotItem?.period}`,
    };

    dispatch({
      type: SET_ORDER_TYPE,
      payload: 'sch',
    });

    dispatch({
      type: SET_ORDER_SCHEDULING_TYPE,
      payload: schData,
    });

    navigation.navigate('OrderDetailsScreen', {
      selectedAddress,
      category,
    });
  };

  const renderDateCard = item => {
    const active = selectedDate === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.9}
        disabled={item.disabled}
        onPress={() => chooseDate(item)}
        style={[
          styles.dayCard,
          active && styles.dayCardActive,
          item.disabled && styles.disabledCard,
        ]}>
        <View style={styles.dayCardTop}>
          <AppText
            numberOfLines={1}
            weight={active ? 'bold' : 'regular'}
            style={[styles.dayNameText, active && styles.activeText]}>
            {item.dayName}
          </AppText>
        </View>

        <View style={styles.dayCardBottom}>
          <AppText
            weight="bold"
            style={[styles.dayNumberText, active && styles.activeText]}>
            {item.dayNumber}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTimeCard = item => {
    const active = selectedSlot === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.9}
        disabled={item.disabled}
        onPress={() => chooseSlot(item)}
        style={[
          styles.timeCard,
          active && styles.timeCardActive,
          item.disabled && styles.disabledCard,
        ]}>
        <AppText
          weight="bold"
          style={[styles.timeValueText, active && styles.activeText]}>
          {item.time}
        </AppText>

        <AppText style={[styles.timePeriodText, active && styles.activeText]}>
          {item.period}
        </AppText>
      </TouchableOpacity>
    );
  };

  const canConfirm = !!selectedDate && !!selectedSlot;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={tr('schedule.book_title', 'حجز موعد')}
          onBack={() => navigation.goBack()}
        />

        <AppText style={styles.subtitle}>
          {tr('schedule.subtitle', 'حدد موعداً يناسب جدولك.')}
        </AppText>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                  colors={[COLORS.primary]}
                />
              }>
              <View style={styles.heroCard}>
                <Image source={SCHEDULE_IMAGE} style={styles.heroImage} />
              </View>

              <View style={styles.sectionHeaderRow}>
                <AppText weight="bold" style={styles.sectionTitle}>
                  {tr('schedule.choose_day', 'اختر اليوم')}
                </AppText>

                <View style={styles.monthWrap}>
                  <Ionicons
                    name={isArabic ? 'chevron-forward' : 'chevron-back'}
                    size={13}
                    color="#A0A0A0"
                  />

                  <AppText style={styles.monthText}>
                    {selectedMonthData.monthName} {selectedMonthData.year}
                  </AppText>

                  <Ionicons
                    name={isArabic ? 'chevron-back' : 'chevron-forward'}
                    size={13}
                    color="#A0A0A0"
                  />
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={[
                  styles.horizontalListContent,
                  {flexDirection: isArabic ? 'row' : 'row-reverse'},
                ]}>
                {dates.map(renderDateCard)}
              </ScrollView>

                {shouldShowBookingNote ? (
                    <View style={styles.noticeBox}>
                        
                        <Ionicons
                        name="information-circle-outline"
                        size={16}
                        color={COLORS.noticeText}
                        style={styles.noticeIcon}
                        />

                        <AppText style={styles.noticeText}>

                        {bookingNote?.before}{' '}

                        <AppText style={styles.noticeAccent}>
                            {bookingNote?.highlight}
                        </AppText>{' '}

                        {bookingNote?.after}

                        </AppText>

                    </View>
                    ) : null}


              <AppText weight="bold" style={styles.timeSectionTitle}>
                {tr('schedule.choose_time', 'اختر الوقت')}
              </AppText>

              <ScrollView
                horizontal
                // inverted={isArabic}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={[
                  styles.horizontalListContent,
                  {flexDirection: isArabic ? 'row' : 'row-reverse'},
                ]}>
                {timeSlots.map(renderTimeCard)}
              </ScrollView>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!canConfirm}
                onPress={confirmSchedule}
                style={[
                  styles.confirmButton,
                  !canConfirm && styles.confirmButtonDisabled,
                ]}>
                <AppText weight="bold" style={styles.confirmButtonText}>
                  {tr('schedule.confirm', 'تأكيد الموعد')}
                </AppText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OrderScheduleScreen;
 const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.subText,
    textAlign: 'center',
    lineHeight: 20,
  },

  heroCard: {
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#EEF6FC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 16,
  },

  heroImage: {
    height: 141,
    // aspectRatio: 2.5,
    resizeMode: 'contain',
  },

  sectionHeaderRow: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'auto',
  },

  monthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  monthText: {
    fontSize: 12,
    color: COLORS.subText,
    marginHorizontal: 6,
  },

  horizontalListContent: {
    paddingHorizontal: 0,
  },

  dayCard: {
    width: DAY_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.softBg,
    overflow: 'hidden',
    marginEnd: 8,
  },

  dayCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  dayCardTop: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
  },

  dayCardBottom: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },

  dayNameText: {
    fontSize: 12,
    color: '#8D8D8D',
    textAlign: 'center',
  },

  dayNumberText: {
    fontSize: 16,
    color: COLORS.text,
  },

  activeText: {
    color: COLORS.text,
  },

  disabledCard: {
    opacity: 0.35,
  },

  noticeBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  noticeIcon: {
    marginTop: 3,
    marginEnd: 6,
  },

  noticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 22,
    color: COLORS.noticeText,
    textAlign: 'auto',
  },

  noticeAccent: {
    color: COLORS.orange,
    fontSize: 11.5,
    lineHeight: 22,
  },

  timeSectionTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'auto',
  },

  timeCard: {
    width: TIME_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.softBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },

  timeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  timeValueText: {
    fontSize: 17,
    color: COLORS.text,
  },

  timePeriodText: {
    marginTop: 7,
    fontSize: 12.5,
    color: '#8D8D8D',
  },

  footer: {
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.bg,
  },

  confirmButton: {
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  confirmButtonDisabled: {
    opacity: 0.45,
  },

  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});