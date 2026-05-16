import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SvgUri} from 'react-native-svg';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import {getCategoryChildren} from '../../../services/categoryService';
import {isSvg} from '../../../utils/HelperFunctions';
import {FLUSH_ORDER_DATA} from '../../../redux/actions/ActionTypes';

const FALLBACK_IMAGE = require('./../../../../assets/app/images/vectors/about-main.png');

const CleaningCategoriesView = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const order = useSelector(state => state.order);
  const selectedServices = order?.order_services || [];

  const category = route?.params?.category || null;
  const categoryId = category?.id;

  const mainCategory = route?.params?.mainCategory || category;
  const mainCategoryId = mainCategory?.id || categoryId;

  const screenTitle =
    category?.name ||
    category?.name_ar ||
    t('categories.cleaning') ||
    'تنظيف المنزل';

  const [items, setItems] = useState([]);
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const hasSavedServices = selectedServices.length > 0;
  const savedMainCategoryId =
    order?.main_category_id || order?.order_category_id || null;

  const currentMainCategoryId = mainCategoryId || categoryId || null;

  const hasCurrentScreenConflict = useMemo(() => {
    if (!hasSavedServices) {
      return false;
    }

    if (!savedMainCategoryId || !currentMainCategoryId) {
      return false;
    }

    return String(savedMainCategoryId) !== String(currentMainCategoryId);
  }, [hasSavedServices, savedMainCategoryId, currentMainCategoryId]);

  useEffect(() => {
    if (hasCurrentScreenConflict) {
      setPendingItem(null);
      setConflictModalVisible(true);
    }
  }, [hasCurrentScreenConflict]);

  const fetchChildren = useCallback(
    async ({isRefresh = false} = {}) => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getCategoryChildren(categoryId);

        setItems(response?.data || []);
        setParentData(response?.parent || null);
      } catch (error) {
        console.log(
          'CLEANING CATEGORIES ERROR:',
          error?.response?.data || error?.message,
        );
        setItems([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [categoryId],
  );

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const onRefresh = () => {
    fetchChildren({isRefresh: true});
  };

  const getTargetMainCategory = item => {
    if (item?.view_type === 'cleaning') {
      return route?.params?.mainCategory || category || item;
    }

    if (Number(item?.category_childs || 0) > 0) {
      return route?.params?.mainCategory || category || item;
    }

    return route?.params?.mainCategory || category || item;
  };

  const hasItemConflict = item => {
    if (!hasSavedServices || !savedMainCategoryId) {
      return false;
    }

    const targetMainCategory = getTargetMainCategory(item);
    const targetMainCategoryId = targetMainCategory?.id;

    if (!targetMainCategoryId) {
      return false;
    }

    return String(savedMainCategoryId) !== String(targetMainCategoryId);
  };

  const navigateToItem = item => {
    if (item?.view_type === 'cleaning') {
      navigation.navigate('CleaningScreen', {
        category: item,
        mainCategory: route?.params?.mainCategory || category,
      });
      return;
    }

    if (Number(item?.category_childs || 0) > 0) {
      navigation.navigate('CleaningCategoriesView', {
        category: item,
        mainCategory: route?.params?.mainCategory || category,
      });
      return;
    }

    navigation.navigate('TraditionalServicesScreen', {
      category: item,
      mainCategory: route?.params?.mainCategory || category,
    });
  };

  const handlePressItem = item => {
    if (hasItemConflict(item)) {
      setPendingItem(item);
      setConflictModalVisible(true);
      return;
    }

    navigateToItem(item);
  };

  const closeConflictAndGoBack = () => {
    setConflictModalVisible(false);
    setPendingItem(null);
    navigation.goBack();
  };

  const continueToReview = () => {
    setConflictModalVisible(false);
    setPendingItem(null);

    navigation.navigate('OrderReviewScreen', {
      category: {
        id: order?.order_category_id,
        name: order?.order_category_name,
        name_ar: order?.order_category_name,
        image: null,
        background: null,
      },
    });
  };

  const ignoreSavedServices = () => {
    const item = pendingItem;

    dispatch({
      type: FLUSH_ORDER_DATA,
    });

    setConflictModalVisible(false);
    setPendingItem(null);

    if (item) {
      setTimeout(() => {
        navigateToItem(item);
      }, 80);
    }
  };

  const renderImage = imageUrl => {
    if (!imageUrl) {
      return (
        <Image
          source={FALLBACK_IMAGE}
          style={styles.cardImage}
          resizeMode="cover"
        />
      );
    }

    if (isSvg(imageUrl)) {
      return (
        <View style={styles.svgBox}>
          <SvgUri uri={imageUrl} width="100%" height="100%" />
        </View>
      );
    }

    return (
      <Image
        source={{uri: imageUrl}}
        style={styles.cardImage}
        resizeMode="cover"
      />
    );
  };

  const renderItem = ({item}) => {
    const imageUrl = item?.image || item?.background || null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cleaningCard}
        onPress={() => handlePressItem(item)}>
        {renderImage(imageUrl)}

        <View style={styles.overlay} />

        <View style={styles.titleBox}>
          <AppText weight="bold" style={styles.cardTitle} numberOfLines={2}>
            {item.name || item.name_ar}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderConflictModal = () => {
    return (
      <Modal
        visible={conflictModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeConflictAndGoBack}>
        <Pressable
          style={styles.conflictOverlay}
          onPress={closeConflictAndGoBack}>
          <Pressable style={styles.conflictCard} onPress={() => {}}>
            <View style={styles.conflictHandle} />

            <View style={styles.conflictIconBox}>
              <Ionicons name="alert-circle-outline" size={42} color="#FF3B30" />
            </View>

            <AppText weight="bold" style={styles.conflictTitle}>
              {t('services.saved_services_title', {
                defaultValue: 'هناك خدمات مضافة من قسم آخر',
              })}
            </AppText>

            <AppText style={styles.conflictMessage}>
              {t('services.saved_services_message', {
                defaultValue:
                  'لديك خدمات محفوظة من قسم مختلف. يمكنك إكمال الطلب الحالي أو تجاهل الخدمات والانتقال للقسم الجديد.',
              })}
            </AppText>

            <View style={styles.conflictButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.conflictReviewButton}
                onPress={continueToReview}>
                <AppText weight="bold" style={styles.conflictReviewText}>
                  {t('services.continue_to_review', {
                    defaultValue: 'إكمال للمراجعة',
                  })}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.conflictIgnoreButton}
                onPress={ignoreSavedServices}>
                <AppText weight="bold" style={styles.conflictIgnoreText}>
                  {t('services.ignore_saved_services', {
                    defaultValue: 'تجاهل الخدمات',
                  })}
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.conflictBackButton}
              onPress={closeConflictAndGoBack}>
              <AppText weight="bold" style={styles.conflictBackText}>
                {t('common.back', {defaultValue: 'رجوع'})}
              </AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const listEmpty = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <AppText style={styles.emptyText}>
          {t('categories.no_subcategories') || 'لا توجد أقسام متاحة'}
        </AppText>
      </View>
    );
  }, [loading, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={parentData?.name || screenTitle}
          onBack={() => navigation.goBack()}
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              items.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={listEmpty}
          />
        )}

        {renderConflictModal()}
      </View>
    </SafeAreaView>
  );
};

export default CleaningCategoriesView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  listContent: {
    paddingTop: 12,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  cleaningCard: {
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#EAF4FA',
    marginBottom: 14,
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  svgBox: {
    width: '100%',
    height: '100%',
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4FA',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },

  titleBox: {
    position: 'absolute',
    start: 14,
    bottom: 14,
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.36)',
  },

  cardTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'auto',
    lineHeight: 25,
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },

  emptyText: {
    fontSize: 15,
    color: '#8A8A8A',
    textAlign: 'center',
  },

  conflictOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  conflictCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 26,
    alignItems: 'center',
  },

  conflictHandle: {
    width: 44,
    height: 4,
    borderRadius: 20,
    backgroundColor: '#D1D1D1',
    marginBottom: 18,
  },

  conflictIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  conflictTitle: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },

  conflictMessage: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 22,
  },

  conflictButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  conflictReviewButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },

  conflictReviewText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  conflictIgnoreButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  conflictIgnoreText: {
    fontSize: 14,
    color: '#FF3B30',
  },

  conflictBackButton: {
    height: 44,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  conflictBackText: {
    fontSize: 14,
    color: '#777777',
  },
});