import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useDispatch} from 'react-redux';

import AppText from '../../../../shared/AppText';
import {createOrder} from '../../../../services/orderService';
import {FLUSH_ORDER_DATA} from '../../../../redux/actions/ActionTypes';
import {CommonActions} from '@react-navigation/native';

const MAIN_COLOR = '#3296D9';

const CreateOrderProgressScreen = ({navigation, route}) => {
  const dispatch = useDispatch();

  const [progress, setProgress] = useState(8);
  const [statusText, setStatusText] = useState('جاري تجهيز الطلب...');
  const [errorMessage, setErrorMessage] = useState('');

  const barAnim = useRef(new Animated.Value(0.08)).current;
  const mountedRef = useRef(true);

  const animateTo = value => {
    Animated.timing(barAnim, {
      toValue: value / 100,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    setProgress(value);
  };

  useEffect(() => {
    mountedRef.current = true;

    const submit = async () => {
      try {
        const payload = route?.params?.orderPayload;

        if (!payload) {
          throw new Error('بيانات الطلب غير موجودة');
        }

        setStatusText('جاري مراجعة بيانات الطلب...');
        animateTo(20);

        if (!payload.address_id) {
          throw new Error('من فضلك اختر العنوان أولًا');
        }

        if (!payload.category_id) {
          throw new Error('بيانات القسم غير مكتملة');
        }

        if (!payload.preview && (!payload.services || payload.services.length === 0)) {
          throw new Error('من فضلك اختر خدمة واحدة على الأقل');
        }

        setStatusText('جاري إرسال الطلب...');
        animateTo(45);

        const response = await createOrder(payload, percent => {
          if (!mountedRef.current) {
            return;
          }

          animateTo(Math.max(45, Math.min(percent, 88)));
        });

        if (!response?.status) {
          throw new Error(response?.message || 'فشل تسجيل الطلب');
        }

        setStatusText('تم تسجيل الطلب بنجاح');
        animateTo(100);

        setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }

        dispatch({type: FLUSH_ORDER_DATA});

navigation.dispatch(
  CommonActions.reset({
    index: 1,
    routes: [
      {
        name: 'Home',
      },
      {
        name: 'OrderSummaryScreen',
        params: {
          order_id: response?.data?.order_id,
          from_create_order: true,
        },
      },
    ],
  }),
);
        }, 700);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'حدث خطأ أثناء تسجيل الطلب';

        setErrorMessage(message);
        setStatusText('لم يتم تسجيل الطلب');
        animateTo(100);
      }
    };

    submit();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const widthInterpolated = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const hasError = !!errorMessage;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, hasError && styles.errorCircle]}>
          <Ionicons
            name={hasError ? 'alert-outline' : 'checkmark-done-outline'}
            size={40}
            color="#FFFFFF"
          />
        </View>

        <AppText weight="bold" style={styles.title}>
          {hasError ? 'تعذر تسجيل الطلب' : 'تسجيل الطلب'}
        </AppText>

        <AppText style={styles.subtitle}>
          {hasError
            ? errorMessage
            : 'من فضلك انتظر لحظات حتى يتم حفظ بيانات الطلب.'}
        </AppText>

        <View style={styles.progressBox}>
          <AppText weight="bold" style={[styles.percentText, hasError && styles.errorText]}>
            {progress}%
          </AppText>

          <AppText style={styles.statusText}>
            {statusText}
          </AppText>

          <View style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                hasError && styles.errorFill,
                {width: widthInterpolated},
              ]}
            />
          </View>
        </View>

        {hasError ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <AppText weight="bold" style={styles.backButtonText}>
              رجوع للمراجعة
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default CreateOrderProgressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  errorCircle: {
    backgroundColor: '#E53935',
  },
  title: {
    fontSize: 22,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 34,
  },
  progressBox: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    padding: 18,
  },
  percentText: {
    fontSize: 28,
    color: MAIN_COLOR,
    textAlign: 'center',
    marginBottom: 6,
  },
  errorText: {
    color: '#E53935',
  },
  statusText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 14,
  },
  track: {
    height: 10,
    borderRadius: 20,
    backgroundColor: '#E3EAF0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: MAIN_COLOR,
  },
  errorFill: {
    backgroundColor: '#E53935',
  },
  backButton: {
    marginTop: 24,
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: MAIN_COLOR,
  },
});