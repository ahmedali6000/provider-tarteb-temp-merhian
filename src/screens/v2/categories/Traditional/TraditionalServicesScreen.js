import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  I18nManager,
  Modal,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SvgUri} from 'react-native-svg';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import useAppFont from '../../../../hooks/useAppFont';
import {getTraditionalServices} from '../../../../services/serviceService';
import {isSvg} from '../../../../utils/HelperFunctions';
import {Add_Service_To_Order} from '../../../../redux/actions/authActionCreator';
import ServiceDetailsModal from '../../../../component/ServiceDetailsModal';
import {FLUSH_ORDER_DATA} from '../../../../redux/actions/ActionTypes';

const FALLBACK_IMAGE = require('./../../../../../assets/app/images/vectors/about-main.png');

const TraditionalServicesScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const isRTL = I18nManager.isRTL;

  const dispatch = useDispatch();
  const order = useSelector(state => state.order);
  const requestIdRef = useRef(0);

  const category = route?.params?.category;
  const categoryId = category?.id;

  const mainCategory = route?.params?.mainCategory || category;
  const mainCategoryId = mainCategory?.id;
  const mainCategoryName = mainCategory?.name || mainCategory?.name_ar;

  const [apiCategory, setApiCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState('all');

  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [quantitySheet, setQuantitySheet] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [tempQty, setTempQty] = useState(null);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsService, setDetailsService] = useState(null);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);

  const title =
    apiCategory?.name ||
    category?.name ||
    category?.name_ar ||
    t('services.title');

  const currentCategory = apiCategory || category;

  const categoryImage =
    apiCategory?.image || category?.image || category?.background || null;

  const selectedServices = useMemo(() => {
    return order?.order_services || [];
  }, [order?.order_services]);

  const hasSavedServices = selectedServices.length > 0;

  const savedMainCategoryId =
    order?.main_category_id || order?.order_category_id || null;

  const currentMainCategoryId = mainCategoryId || categoryId || null;

  const hasCategoryConflict = useMemo(() => {
    if (!hasSavedServices) {
      return false;
    }

    if (!savedMainCategoryId || !currentMainCategoryId) {
      return false;
    }

    return String(savedMainCategoryId) !== String(currentMainCategoryId);
  }, [hasSavedServices, savedMainCategoryId, currentMainCategoryId]);

  useEffect(() => {
    if (hasCategoryConflict) {
      setConflictModalVisible(true);
    } else {
      setConflictModalVisible(false);
    }
  }, [hasCategoryConflict]);

  const subCategoryData = useMemo(() => {
    return [
      {
        id: 'all',
        name: t('services.all'),
      },
      ...subCategories,
    ];
  }, [subCategories, t]);

  const getServiceCount = useCallback(
    serviceId => {
      const found = selectedServices.find(
        item => String(item.service_id) === String(serviceId),
      );

      return Number(found?.count || 0);
    },
    [selectedServices],
  );

  const totalServicesCount = useMemo(() => {
    return selectedServices.reduce(
      (total, item) => total + Number(item.count || 0),
      0,
    );
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.count || 0),
      0,
    );
  }, [selectedServices]);

  const getOrderServiceId = (service, option = null) => {
    if (service?.service_type === 'options' && option) {
      return `${service.id}_${option.id}`;
    }

    return service?.id;
  };

  const getOrderServiceName = (service, option = null) => {
    if (service?.service_type === 'options' && option) {
      return `${service.name} - ${option.name}`;
    }

    return service?.name;
  };

  const getOrderServicePrice = (service, option = null) => {
    if (service?.service_type === 'options' && option) {
      return option?.price_value || option?.price || 0;
    }

    return service?.price_value || service?.price || 0;
  };

  const closeConflictAndGoBack = () => {
    setConflictModalVisible(false);
    navigation.goBack();
  };

  const continueToReviewFromConflict = () => {
    setConflictModalVisible(false);

    navigation.navigate('OrderReviewScreen', {
      category: {
        id: order?.order_category_id,
        name: order?.order_category_name,
      },
    });
  };

  const ignoreSavedServices = () => {
    dispatch({
      type: FLUSH_ORDER_DATA,
    });

    setConflictModalVisible(false);
  };

  const openDetailsModal = service => {
    setDetailsService(service);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setDetailsService(null);
  };

  const addServiceFromDetails = ({service, option, price}) => {
    const orderServiceId = getOrderServiceId(service, option);
    const orderServiceName = getOrderServiceName(service, option);
    const orderPrice = price || getOrderServicePrice(service, option);
    const currentCount = getServiceCount(orderServiceId);

    dispatch(
      Add_Service_To_Order(
        categoryId,
        title,
        orderServiceId,
        orderServiceName,
        orderPrice,
        currentCount + 1,
        selectedServices,
        'positive',
        mainCategoryId,
        mainCategoryName,
      ),
    );

    closeDetailsModal();
  };

  const renderIcon = useCallback(imageUrl => {
    if (!imageUrl) {
      return (
        <Image
          source={FALLBACK_IMAGE}
          style={styles.serviceIcon}
          resizeMode="contain"
        />
      );
    }

    if (isSvg(imageUrl)) {
      return <SvgUri uri={imageUrl} width={29} height={29} />;
    }

    return (
      <Image
        source={{uri: imageUrl}}
        style={styles.serviceIcon}
        resizeMode="contain"
      />
    );
  }, []);

  const fetchServices = useCallback(
    async ({
      pageNumber = 1,
      isRefresh = false,
      isSearch = false,
      append = false,
    } = {}) => {
      if (!categoryId) {
        return;
      }

      const currentRequestId = ++requestIdRef.current;

      try {
        if (pageNumber === 1) {
          setHasMorePages(false);

          if (!isRefresh && !isSearch) {
            setLoading(true);
          }

          if (isSearch) {
            setSearchLoading(true);
          }

          if (!isRefresh && !isSearch) {
            setServices([]);
          }
        } else {
          setLoadingMore(true);
        }

        if (isRefresh) {
          setRefreshing(true);
        }

        const response = await getTraditionalServices({
          categoryId,
          page: pageNumber,
          perPage: 10,
          search: search.trim(),
          sort: activeFilter,
          subCategoryId: activeSubCategory,
        });

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const newData = response?.data || [];
        const meta = response?.meta || {};

        if (pageNumber === 1) {
          setApiCategory(response?.category || null);
          setSubCategories(response?.sub_categories || []);
          setServices(newData);
        } else if (append) {
          setServices(prev => [...prev, ...newData]);
        }

        setPage(meta?.current_page || pageNumber);
        setHasMorePages(!!meta?.has_more_pages);
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.log('SERVICES ERROR:', error?.response?.data || error?.message);

        if (pageNumber === 1) {
          setServices([]);
          setHasMorePages(false);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setSearchLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [categoryId, search, activeFilter, activeSubCategory],
  );

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchServices({
          pageNumber: 1,
          isSearch: search.trim().length > 0,
        });
      },
      search.trim().length > 0 ? 450 : 0,
    );

    return () => clearTimeout(timer);
  }, [categoryId, activeFilter, activeSubCategory, search, fetchServices]);

  const addService = service => {
    const currentCount = getServiceCount(service.id);

    dispatch(
      Add_Service_To_Order(
        categoryId,
        title,
        service.id,
        service.name,
        service.price_value || service.price,
        currentCount + 1,
        selectedServices,
        'positive',
        mainCategoryId,
        mainCategoryName,
      ),
    );
  };

  const openQuantitySheet = service => {
    const currentCount = getServiceCount(service.id);

    setSelectedService(service);
    setTempQty(currentCount || 1);
    setQuantitySheet(true);
  };

  const closeQuantitySheet = () => {
    setQuantitySheet(false);
    setSelectedService(null);
    setTempQty(null);
  };

  const setServiceQuantity = qty => {
    if (!selectedService || !qty) {
      return;
    }

    dispatch(
      Add_Service_To_Order(
        categoryId,
        title,
        selectedService.id,
        selectedService.name,
        selectedService.price_value || selectedService.price,
        qty,
        selectedServices,
        qty > getServiceCount(selectedService.id) ? 'positive' : 'negative',
        mainCategoryId,
        mainCategoryName,
      ),
    );

    closeQuantitySheet();
  };

  const cancelService = () => {
    if (!selectedService) {
      return;
    }

    dispatch(
      Add_Service_To_Order(
        categoryId,
        title,
        selectedService.id,
        selectedService.name,
        selectedService.price_value || selectedService.price,
        0,
        selectedServices,
        'negative',
        mainCategoryId,
        mainCategoryName,
      ),
    );

    closeQuantitySheet();
  };

  const onChangeSubCategory = itemId => {
    if (String(activeSubCategory) === String(itemId)) {
      return;
    }

    setServices([]);
    setPage(1);
    setHasMorePages(false);
    setActiveSubCategory(itemId);
  };

  const onChangeFilter = filter => {
    if (activeFilter === filter) {
      return;
    }

    setServices([]);
    setPage(1);
    setHasMorePages(false);
    setActiveFilter(filter);
  };

  const onRefresh = () => {
    fetchServices({
      pageNumber: 1,
      isRefresh: true,
    });
  };

  const onEndReached = () => {
    if (
      loading ||
      loadingMore ||
      refreshing ||
      !hasMorePages ||
      services.length === 0
    ) {
      return;
    }

    fetchServices({
      pageNumber: page + 1,
      append: true,
    });
  };

  const goToReview = () => {
    navigation.navigate('OrderReviewScreen', {
      category: currentCategory,
    });
  };

  const renderSubCategory = ({item}) => {
    const active = String(activeSubCategory) === String(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.subCategoryChip, active && styles.activeSubCategoryChip]}
        onPress={() => onChangeSubCategory(item.id)}>
        <AppText
          weight={active ? 'bold' : 'regular'}
          style={[
            styles.subCategoryText,
            active && styles.activeSubCategoryText,
          ]}>
          {item.name}
        </AppText>
      </TouchableOpacity>
    );
  };

  const renderService = ({item}) => {
    const iconUrl = item?.category_image || categoryImage;
    const isOptions = item?.service_type === 'options';
    const count = getServiceCount(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.serviceCard}
        onPress={() => openDetailsModal(item)}>
        <View style={styles.serviceContent}>
          <View style={styles.serviceIconBox}>{renderIcon(iconUrl)}</View>

          <View style={styles.serviceInfo}>
            <AppText weight="bold" style={styles.serviceName} numberOfLines={2}>
              {item.name}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.detailsRow}
              onPress={() => openDetailsModal(item)}>
              <Ionicons
                name={isRTL ? 'chevron-back-outline' : 'chevron-forward-outline'}
                size={13}
                color="#2598D8"
              />

              <AppText style={styles.detailsText}>
                {t('services.show_details')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.priceBlock}>
          {!isOptions ? (
            <View style={styles.priceRow}>
              <AppText weight="bold" style={styles.priceText}>
                {item.price}
              </AppText>

              <AppText style={styles.currencyText}>
                {t('services.currency')}
              </AppText>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.requestButtonWrapper}
            onPress={() => {
              if (isOptions) {
                openDetailsModal(item);
                return;
              }

              if (count > 0) {
                openQuantitySheet(item);
              } else {
                addService(item);
              }
            }}>
            <View style={styles.requestButton}>
              <Ionicons name="add-outline" size={14} color="#2598D8" />

              <AppText weight="medium" style={styles.requestButtonText}>
                {isOptions ? 'عرض الخدمات' : t('services.request_service')}
              </AppText>
            </View>

            {!isOptions && count > 0 ? (
              <View style={styles.selectedCountBadge}>
                <AppText weight="bold" style={styles.selectedCountText}>
                  {count}
                </AppText>
              </View>
            ) : null}
          </TouchableOpacity>
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
        <Pressable style={styles.conflictOverlay} onPress={closeConflictAndGoBack}>
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
                onPress={continueToReviewFromConflict}>
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

  const EmptyComponent = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={FALLBACK_IMAGE}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('services.no_services')}
        </AppText>

        <AppText style={styles.emptySubtitle}>
          {t('services.no_services_subtitle')}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />

        <View style={styles.topTextRow}>
          <AppText style={styles.helperText}>
            {t('services.helper_start')}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.previewLink}
            onPress={() =>
              navigation.navigate('CreatePreviewOrderScreen', {
                category: currentCategory,
                mainCategory: mainCategory || currentCategory,
              })
            }>
            <Ionicons name="alert-circle-outline" size={14} color="#F28A1A" />

            <AppText weight="medium" style={styles.previewText}>
              {t('services.preview_request')}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={23} color="#1F1F1F" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('services.search_placeholder')}
            placeholderTextColor="#777777"
            style={[
              styles.searchInput,
              {
                fontFamily,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />

          {searchLoading ? (
            <ActivityIndicator size="small" color="#3296D9" />
          ) : null}
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tabItem}
            onPress={() => onChangeFilter('all')}>
            <AppText
              weight={activeFilter === 'all' ? 'bold' : 'regular'}
              style={[
                styles.tabText,
                activeFilter === 'all' && styles.activeTabText,
              ]}>
              {t('services.all_services')}
            </AppText>

            {activeFilter === 'all' ? <View style={styles.activeLine} /> : null}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tabItem}
            onPress={() => onChangeFilter('popular')}>
            <AppText
              weight={activeFilter === 'popular' ? 'bold' : 'regular'}
              style={[
                styles.tabText,
                activeFilter === 'popular' && styles.activeTabText,
              ]}>
              {t('services.most_requested')}
            </AppText>

            {activeFilter === 'popular' ? (
              <View style={styles.activeLine} />
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.subCategoriesWrap}>
          <FlatList
            horizontal
            inverted={false}
            data={subCategoryData}
            keyExtractor={item => String(item.id)}
            renderItem={renderSubCategory}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCategoriesContent}
            extraData={activeSubCategory}
          />
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3296D9" />
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={item => String(item.id)}
            renderItem={renderService}
            showsVerticalScrollIndicator={false}
            extraData={`${activeFilter}-${activeSubCategory}-${totalServicesCount}`}
            contentContainerStyle={[
              styles.listContent,
              services.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.35}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<EmptyComponent />}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#3296D9" />
                </View>
              ) : null
            }
          />
        )}

        {totalServicesCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bottomBar}
            onPress={goToReview}>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.bottomCountCircle}>
                <AppText weight="bold" style={styles.bottomCountText}>
                  {totalServicesCount}
                </AppText>
              </View>

              <View style={styles.bottomPriceRow}>
                <AppText weight="bold" style={styles.bottomPriceText}>
                  {totalPrice}
                </AppText>

                <AppText style={styles.bottomCurrencyText}>
                  {t('services.currency')}
                </AppText>
              </View>
            </View>

            <View style={styles.bottomReviewRow}>
              <AppText weight="medium" style={styles.bottomReviewText}>
                {t('services.review_services')}
              </AppText>

              <Ionicons
                name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
                size={18}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        ) : null}

        <Modal
          visible={quantitySheet}
          transparent
          animationType="slide"
          onRequestClose={closeQuantitySheet}>
          <Pressable style={styles.sheetOverlay} onPress={closeQuantitySheet}>
            <Pressable style={styles.sheetContainer} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              <AppText weight="bold" style={styles.sheetTitle}>
                {t('services.choose_quantity')}
              </AppText>

              {selectedService ? (
                <AppText style={styles.sheetServiceName} numberOfLines={2}>
                  {selectedService.name}
                </AppText>
              ) : null}

              <View style={styles.quantityGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(qty => {
                  const active = tempQty === qty;

                  return (
                    <TouchableOpacity
                      key={qty}
                      activeOpacity={0.85}
                      style={[
                        styles.quantityItem,
                        active && styles.activeQuantityItem,
                      ]}
                      onPress={() => setTempQty(qty)}>
                      <AppText
                        weight="medium"
                        style={[
                          styles.quantityText,
                          active && styles.activeQuantityText,
                        ]}>
                        {qty}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.confirmButton}
                onPress={() => setServiceQuantity(tempQty)}>
                <AppText weight="bold" style={styles.confirmButtonText}>
                  {t('services.confirm_quantity')}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.cancelServiceButton}
                onPress={cancelService}>
                <AppText weight="bold" style={styles.cancelServiceText}>
                  {t('services.cancel_service')}
                </AppText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {renderConflictModal()}

        <ServiceDetailsModal
          visible={detailsModalVisible}
          service={detailsService}
          category={currentCategory}
          currencyText={t('services.currency')}
          onClose={closeDetailsModal}
          onRequestService={addServiceFromDetails}
        />
      </View>
    </SafeAreaView>
  );
};

export default TraditionalServicesScreen;

const styles = StyleSheet.create({
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
  topTextRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  helperText: {
    fontSize: 12,
    color: '#8B8B8B',
    lineHeight: 20,
    textAlign: 'auto',
  },
  previewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  previewText: {
    fontSize: 12,
    color: '#F28A1A',
    marginStart: 3,
  },
  searchBox: {
    marginTop: 10,
    height: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F1F1F',
    paddingVertical: 0,
    marginHorizontal: 8,
  },
  tabsRow: {
    marginTop: 12,
    height: 39,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tabText: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 8,
  },
  activeTabText: {
    color: '#1F1F1F',
  },
  activeLine: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#3296D9',
    borderRadius: 8,
  },
  subCategoriesWrap: {
    marginTop: 10,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  subCategoriesContent: {
    paddingVertical: 4,
  },
  subCategoryChip: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
  },
  activeSubCategoryChip: {
    borderColor: '#F28A1A',
    backgroundColor: '#FFF4E8',
  },
  subCategoryText: {
    fontSize: 12,
    color: '#505050',
  },
  activeSubCategoryText: {
    color: '#F28A1A',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 95,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  serviceCard: {
    minHeight: 92,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    alignItems: 'center',
  },
  priceBlock: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 82,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    color: '#1F1F1F',
    lineHeight: 25,
  },
  currencyText: {
    fontSize: 12,
    color: '#8A8A8A',
    marginEnd: 4,
    marginBottom: 3,
  },
  requestButtonWrapper: {
    marginTop: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  requestButton: {
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F9BDD',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    fontSize: 11.5,
    color: '#2598D8',
    marginStart: 2,
  },
  selectedCountBadge: {
    position: 'absolute',
    top: -8,
    start: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F28A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCountText: {
    fontSize: 10,
    color: '#F28A1A',
  },
  serviceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingEnd: 8,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#DFF1FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 10,
  },
  serviceIcon: {
    width: 29,
    height: 29,
  },
  serviceInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingStart: 2,
  },
  serviceName: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 20,
    textAlign: 'auto',
  },
  detailsRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 11.5,
    color: '#2598D8',
    marginStart: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E2E2',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 70,
  },
  emptyImage: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#1F1F1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    end: 16,
    start: 16,
    bottom: 12,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  bottomReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomReviewText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginHorizontal: 6,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPriceText: {
    fontSize: 22,
    color: '#FFFFFF',
    marginStart: 10,
    marginEnd: 4,
  },
  bottomCurrencyText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginEnd: 4,
  },
  bottomCountCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCountText: {
    fontSize: 13,
    color: '#3296D9',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopStartRadius: 24,
    paddingHorizontal: 13,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D1D1',
    alignSelf: 'center',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetServiceName: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  quantityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quantityItem: {
    width: '18%',
    height: 35,
    borderRadius: 10,
    backgroundColor: '#F6F7F8',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  activeQuantityItem: {
    backgroundColor: '#EAF6FE',
    borderColor: '#3296D9',
  },
  quantityText: {
    fontSize: 13,
    color: '#1F1F1F',
  },
  activeQuantityText: {
    color: '#3296D9',
  },
  confirmButton: {
    height: 49,
    borderRadius: 9,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  cancelServiceButton: {
    height: 45,
    borderRadius: 9,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelServiceText: {
    fontSize: 14,
    color: '#D93636',
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