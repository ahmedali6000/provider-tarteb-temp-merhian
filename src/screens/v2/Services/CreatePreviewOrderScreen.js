import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SvgUri} from 'react-native-svg';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import useAppFont from '../../../hooks/useAppFont';
import {isSvg} from '../../../utils/HelperFunctions';
import {changePreview} from '../../../redux/actions/authActionCreator';
import {
  FLUSH_ORDER_DATA,
  UPDATE_ORDER_DATA,
  UPDATE_ORDER_NOTES,
} from '../../../redux/actions/ActionTypes';

const FALLBACK_IMAGE = require('./../../../../assets/app/images/vectors/about-main.png');

const CreatePreviewOrderScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();

  const dispatch = useDispatch();
  const orderNotes = useSelector(state => state.order?.order_notes || '');

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const category = route?.params?.category || null;

  const title =
    category?.name ||
    category?.name_ar ||
    tr('services_v2.preview_service', 'خدمة المعاينة');

  const price = category?.previewCost || 200;
  const image = category?.image || category?.background || null;

  const [notes, setNotes] = useState(orderNotes || '');
const mainCategory = route?.params?.mainCategory || category;
  const updateNotes = text => {
    setNotes(text);

    dispatch({
      type: UPDATE_ORDER_NOTES,
      payload: text,
    });
  };

  const renderImage = () => {
    if (!image) {
      return (
        <Image
          source={FALLBACK_IMAGE}
          style={styles.heroImage}
          resizeMode="contain"
        />
      );
    }

    if (isSvg(image)) {
      return <SvgUri uri={image} width={135} height={135} />;
    }

    return (
      <Image
        source={{uri: image}}
        style={styles.heroImage}
        resizeMode="contain"
      />
    );
  };

  const submitOrder = () => {
  if (!category?.id) {
    return;
  }

  const categoryName =
    category?.name ||
    category?.name_ar ||
    title;

  const mainCategoryName =
    mainCategory?.name ||
    mainCategory?.name_ar ||
    categoryName;

  dispatch({
    type: FLUSH_ORDER_DATA,
  });

  dispatch({
    type: UPDATE_ORDER_DATA,
    payload: {
      main_category_id: mainCategory?.id || category?.id,
      main_category_name: mainCategoryName,

      order_category_id: category.id,
      order_category_name: categoryName,

      order_services: [],
    },
  });

  dispatch(changePreview(category.id, categoryName, true, price));

  dispatch({
    type: UPDATE_ORDER_NOTES,
    payload: notes,
  });

  navigation.navigate('OrderReviewScreen', {
    category,
    mainCategory,
  });
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <AppHeader
            title={
              tr('services_v2.preview_service', 'خدمة المعاينة') +
              ' ( ' +
              title +
              ' )'
            }
            onBack={() => navigation.goBack()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <AppText style={styles.helperText}>
              {tr(
                'preview_order.helper_text',
                'يقوم الفني بزيارة موقعك لتحديد المشكلة واقتراح الحل المناسب.',
              )}
            </AppText>

            <View style={styles.imageBox}>{renderImage()}</View>

            <View style={styles.priceRow}>
              <AppText weight="bold" style={styles.priceText}>
                {price}
              </AppText>

              <AppText style={styles.currencyText}>
                {tr('orders.currency', 'ج.م')}
              </AppText>
            </View>

            <AppText weight="bold" style={styles.serviceTitle}>
              {tr('preview_order.details', 'تفاصيل المعاينة')}
            </AppText>

            <View style={styles.featuresBox}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-outline" size={17} color="#2598D8" />
                <AppText style={styles.featureText}>
                  {tr(
                    'preview_order.feature_problem_detection',
                    'تحديد دقيق للمشكلة',
                  )}
                </AppText>
              </View>

              <View style={styles.featureRow}>
                <Ionicons name="checkmark-outline" size={17} color="#2598D8" />
                <AppText style={styles.featureText}>
                  {tr(
                    'preview_order.feature_cost_duration',
                    'ترشيح تكلفة ومدة أفضل تنفيذ',
                  )}
                </AppText>
              </View>
            </View>

            <View style={styles.inputBlock}>
              <AppText weight="bold" style={styles.inputLabel}>
                {tr(
                  'preview_order.problem_description_label',
                  'صف المشكلة التي تواجهها',
                )}
              </AppText>

              <TextInput
                value={notes}
                onChangeText={updateNotes}
                multiline
                placeholder={tr(
                  'preview_order.problem_description_placeholder',
                  'مثال: المكيف لا يعمل أو يصدر صوتًا...',
                )}
                placeholderTextColor="#9A9A9A"
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  {
                    fontFamily,
                    textAlign: 'auto',
                  },
                ]}
              />
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.noteRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#2598D8"
              />

              <AppText weight="bold" style={styles.noteText}>
                {tr(
                  'preview_order.bottom_note',
                  'يمكن استكمال الطلب مع فني الخدمة بعد المعاينة.',
                )}
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.submitButton}
              onPress={submitOrder}>
              <AppText weight="bold" style={styles.submitText}>
                {tr('preview_order.submit_button', 'طلب معاينة الآن')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePreviewOrderScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  helperText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777777',
    lineHeight: 21,
    textAlign: 'auto',
  },
  imageBox: {
    marginTop: 12,
    height: 165,
    borderRadius: 14,
    backgroundColor: '#E2F2FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 135,
    height: 135,
  },
  priceRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  priceText: {
    fontSize: 32,
    color: '#1F1F1F',
    lineHeight: 30,
    marginEnd: 4,
  },
  currencyText: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 4,
  },
  serviceTitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#1F1F1F',
    textAlign: 'auto',
    lineHeight: 23,
  },
  featuresBox: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  featureText: {
    fontSize: 16,
    color: '#777777',
    marginStart: 5,
  },
  inputBlock: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'auto',
  },
  textArea: {
    minHeight: 104,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 13,
    color: '#1F1F1F',
    lineHeight: 21,
  },
  bottomBar: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
    backgroundColor: '#F5F5F5',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#272727',
    marginStart: 5,
    textAlign: 'auto',
  },
  submitButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});