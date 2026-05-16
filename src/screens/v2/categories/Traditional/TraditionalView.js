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
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getCategoryChildren} from '../../../../services/categoryService';
import {SvgUri} from 'react-native-svg';
import {isSvg} from '../../../../utils/HelperFunctions';
import {FLUSH_ORDER_DATA} from '../../../../redux/actions/ActionTypes';

const {width} = Dimensions.get('window');
const CARD_GAP = 20;
const H_PADDING = 16;
const CARD_WIDTH = (width - H_PADDING * 2 - CARD_GAP) / 2;

const TraditionalView = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const order = useSelector(state => state.order);
  const selectedServices = order?.order_services || [];

  const category = route?.params?.category || null;
  const categoryId = category?.id;
  const screenTitle =
    category?.name || category?.name_ar || t('categories.title');

  const [items, setItems] = useState([]);
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const fetchChildren = useCallback(
    async ({isRefresh = false} = {}) => {
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
          'TRADITIONAL VIEW ERROR:',
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
    if (categoryId) {
      fetchChildren();
    }
  }, [fetchChildren, categoryId]);

  const onRefresh = () => {
    fetchChildren({isRefresh: true});
  };

  const hasSavedServices = selectedServices.length > 0;

  const savedMainCategoryId =
    order?.main_category_id || order?.order_category_id || null;

  const currentScreenCategoryId = category?.id || categoryId;

  useEffect(() => {
    if (!hasSavedServices) {
      return;
    }

    if (!savedMainCategoryId || !currentScreenCategoryId) {
      return;
    }

    if (String(savedMainCategoryId) !== String(currentScreenCategoryId)) {
      setPendingItem(null);
      setConflictModalVisible(true);
    }
  }, [hasSavedServices, savedMainCategoryId, currentScreenCategoryId]);

  const getTargetMainCategory = item => {
    const hasChildren = Number(item?.category_childs || 0) > 0;

    if (hasChildren) {
      return item;
    }

    return route?.params?.category || category || item;
  };

  const hasCategoryConflict = item => {
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
    const hasChildren = Number(item?.category_childs || 0) > 0;

    if (hasChildren) {
      navigation.navigate('TraditionalView', {
        category: item,
      });
      return;
    }

    navigation.navigate('TraditionalServicesScreen', {
      category: item,
      mainCategory: route?.params?.category || category,
    });
  };

  const handlePressItem = item => {
    if (hasCategoryConflict(item)) {
      setPendingItem(item);
      setConflictModalVisible(true);
      return;
    }

    navigateToItem(item);
  };

  const continueToReview = () => {
    setConflictModalVisible(false);
    setPendingItem(null);

    navigation.navigate('OrderReviewScreen', {
      category: {
        id: order?.order_category_id,
        name: order?.order_category_name,
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

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.card}
        onPress={() => handlePressItem(item)}>
        <View>
          {item.image ? (
            isSvg(item.image) ? (
              <SvgUri uri={item.image} width={72} height={72} />
            ) : (
              <Image source={{uri: item.image}} style={styles.icon} />
            )
          ) : (
            <Image
              source={require('./../../../../../assets/app/images/vectors/about-main.png')}
              style={styles.icon}
            />
          )}
        </View>

        <AppText weight="medium" style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </AppText>
      </TouchableOpacity>
    );
  };

  const listEmpty = useMemo(() => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <AppText style={styles.emptyText}>
          {t('categories.no_subcategories')}
        </AppText>
      </View>
    );
  }, [loading, t]);

  const renderConflictModal = () => {
    return (
      <Modal
        visible={conflictModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <View style={styles.modalIconBox}>
              <Image
                source={require('./../../../../../assets/app/images/vectors/about-main.png')}
                style={styles.modalIcon}
                resizeMode="contain"
              />
            </View>

            <AppText weight="bold" style={styles.modalTitle}>
              {t('services.saved_services_title', {
                defaultValue: 'هناك خدمات مضافة من قسم آخر',
              })}
            </AppText>

            <AppText style={styles.modalMessage}>
              {t('services.saved_services_message', {
                defaultValue:
                  'لديك خدمات محفوظة من قسم مختلف. يمكنك إكمال الطلب الحالي أو تجاهل الخدمات والانتقال للقسم الجديد.',
              })}
            </AppText>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.reviewButton}
                onPress={continueToReview}>
                <AppText weight="bold" style={styles.reviewButtonText}>
                  {t('services.continue_to_review', {
                    defaultValue: 'إكمال للمراجعة',
                  })}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.ignoreButton}
                onPress={ignoreSavedServices}>
                <AppText weight="bold" style={styles.ignoreButtonText}>
                  {t('services.ignore_saved_services', {
                    defaultValue: 'تجاهل الخدمات',
                  })}
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Modal>
    );
  };

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
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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

export default TraditionalView;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
  },

  listContent: {
    paddingTop: 18,
    paddingBottom: 30,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },

  card: {
    width: CARD_WIDTH,
    minHeight: 142,
    borderRadius: 18,
    backgroundColor: '#EAF4FA',
    borderWidth: 1,
    borderColor: '#D5E9F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },

  icon: {
    width: 67,
    height: 67,
  },

  cardTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 15,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 26,
    alignItems: 'center',
  },

  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 20,
    backgroundColor: '#D1D1D1',
    marginBottom: 18,
  },

  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  modalIcon: {
    width: 44,
    height: 44,
  },

  modalTitle: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 10,
  },

  modalMessage: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 22,
  },

  modalButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  reviewButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },

  reviewButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  ignoreButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ignoreButtonText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});