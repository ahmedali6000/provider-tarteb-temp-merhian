import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import AppText from '../../shared/AppText';
import useAppFont from '../../hooks/useAppFont';
import {searchServices} from '../../services/searchService';
import ServiceDetailsModal from '../../component/ServiceDetailsModal';
import {Add_Service_To_Order} from '../../redux/actions/authActionCreator';

const mockRecentSearches = [];

const SearchScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const isRTL = I18nManager.isRTL;

  const dispatch = useDispatch();
  const order = useSelector(state => state.order);

  const selectedServices = useMemo(() => {
    return order?.order_services || [];
  }, [order?.order_services]);

  const [search, setSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState(mockRecentSearches);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsService, setDetailsService] = useState(null);

  const currency = t('homev2.currency', {defaultValue: 'ج.م'});

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

  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchServices(trimmed);
        setResults(Array.isArray(response) ? response : []);
      } catch (error) {
        console.log('SEARCH ERROR:', error?.response?.data || error?.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const getServiceCount = serviceId => {
    const found = selectedServices.find(
      item => String(item.service_id) === String(serviceId),
    );

    return Number(found?.count || 0);
  };

  const getServicePrice = service => {
    return Number(service?.price_value || service?.price || 0);
  };

  const removeRecentItem = itemToRemove => {
    setRecentSearches(prev => prev.filter(item => item !== itemToRemove));
  };

  const clearSearch = () => {
    setSearch('');
    setResults([]);
  };

  const openDetailsModal = item => {
    setDetailsService(item);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setDetailsService(null);
  };

  const handleSelectResult = item => {
    openDetailsModal(item);
  };

  const addServiceToOrder = service => {
    const categoryId = service?.category_id;
    const categoryName = service?.category_name || '';
    const serviceId = service?.id;
    const serviceName = service?.name;
    const price = getServicePrice(service);
    const currentCount = getServiceCount(serviceId);

    if (!categoryId || !serviceId) {
      closeDetailsModal();
      return;
    }

    dispatch(
      Add_Service_To_Order(
        categoryId,
        categoryName,
        serviceId,
        serviceName,
        price,
        currentCount + 1,
        selectedServices,
        'positive',
        categoryId,
        categoryName,
      ),
    );

    closeDetailsModal();
  };

  const addServiceFromDetails = payload => {
    const service = payload?.service || detailsService;
    const option = payload?.option || null;
    const price = payload?.price || getServicePrice(service);

    if (!service) {
      closeDetailsModal();
      return;
    }

    const categoryId = service?.category_id;
    const categoryName = service?.category_name || '';
    const serviceId =
      service?.service_type === 'options' && option
        ? `${service.id}_${option.id}`
        : service.id;

    const serviceName =
      service?.service_type === 'options' && option
        ? `${service.name} - ${option.name}`
        : service.name;

    const currentCount = getServiceCount(serviceId);

    dispatch(
      Add_Service_To_Order(
        categoryId,
        categoryName,
        serviceId,
        serviceName,
        price,
        currentCount + 1,
        selectedServices,
        'positive',
        categoryId,
        categoryName,
      ),
    );

    closeDetailsModal();
  };

  const goToReview = () => {
    navigation.navigate('OrderReviewScreen', {
      category: {
        id: order?.order_category_id,
        name: order?.order_category_name,
      },
    });
  };

  const renderRecentItem = ({item}) => (
    <View style={styles.recentItem}>
      <TouchableOpacity onPress={() => removeRecentItem(item)}>
        <Ionicons name="close-outline" size={20} color="#777" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.recentTextWrap}
        onPress={() => setSearch(item)}>
        <AppText style={styles.recentText}>{item}</AppText>
      </TouchableOpacity>

      <Ionicons name="time-outline" size={18} color="#5DA9E9" />
    </View>
  );

  const renderResultItem = ({item}) => {
    const count = getServiceCount(item.id);

    return (
      <TouchableOpacity
        style={styles.resultItem}
        activeOpacity={0.88}
        onPress={() => handleSelectResult(item)}>
        <View style={styles.resultIconWrap}>
          <Image
            source={
              item?.image
                ? {uri: item.image}
                : require('../../../assets/app/images/placeholder-category.png')
            }
            style={styles.resultIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.resultCenter}>
          <AppText style={styles.resultName} numberOfLines={2}>
            {item.name}
          </AppText>

          {!!item?.category_name && (
            <AppText style={styles.resultCategory} numberOfLines={1}>
              {item.category_name}
            </AppText>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectResult(item)}>
            <AppText style={styles.viewDetails}>
              {t('homev2.view_details', {defaultValue: 'عرض التفاصيل'})}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.resultPriceWrap}>
          <AppText weight="bold" style={styles.resultPrice}>
            {item?.price ? `${item.price} ${currency}` : ''}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.addButton}
            onPress={() => addServiceToOrder(item)}>
            <Ionicons name="add-outline" size={14} color="#2598D8" />

            <AppText weight="medium" style={styles.addButtonText}>
              {t('services.request_service', {defaultValue: 'طلب الخدمة'})}
            </AppText>

            {count > 0 ? (
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

  const showRecent = !search.trim();
  const showResults = !!search.trim() && results.length > 0;
  const showEmpty = !!search.trim() && !loading && results.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-forward-outline" size={22} color="#1F1F1F" />
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={20} color="#4B4B4B" />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('homev2.search_placeholder')}
              placeholderTextColor="#9B9B9B"
              style={[styles.searchInput, {fontFamily}]}
              textAlign="right"
              autoFocus
            />

            {search.length > 0 ? (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-outline" size={22} color="#4B4B4B" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {showRecent && (
          <View style={styles.sectionWrap}>
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('homev2.recent_searches')}
            </AppText>

            <FlatList
              data={recentSearches}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderRecentItem}
              contentContainerStyle={styles.listContent}
            />
          </View>
        )}

        {loading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color="#4CA7E8" />
          </View>
        )}

        {showResults && (
          <View style={styles.sectionWrap}>
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('homev2.search_results')}
            </AppText>

            <FlatList
              data={results}
              keyExtractor={item => String(item.id)}
              renderItem={renderResultItem}
              contentContainerStyle={[
                styles.listContent,
                totalServicesCount > 0 && styles.listWithBottomBar,
              ]}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {showEmpty && (
          <View style={styles.emptyWrap}>
            <AppText style={styles.emptyText}>
              {t('homev2.no_search_results')}
            </AppText>
          </View>
        )}

        {totalServicesCount > 0 ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bottomBar}
            onPress={goToReview}>
            <View style={styles.bottomLeft}>
              <View style={styles.bottomCountCircle}>
                <AppText weight="bold" style={styles.bottomCountText}>
                  {totalServicesCount}
                </AppText>
              </View>

              <View style={styles.bottomPriceRow}>
                <AppText weight="bold" style={styles.bottomPriceText}>
                  {totalPrice}
                </AppText>

                <AppText style={styles.bottomCurrencyText}>{currency}</AppText>
              </View>
            </View>

            <View style={styles.bottomReviewRow}>
              <AppText weight="medium" style={styles.bottomReviewText}>
                {t('services.review_services', {defaultValue: 'مراجعة الطلب'})}
              </AppText>

              <Ionicons
                name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
                size={18}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>
        ) : null}

        <ServiceDetailsModal
          visible={detailsModalVisible}
          service={detailsService}
          category={
            detailsService
              ? {
                  id: detailsService.category_id,
                  name: detailsService.category_name,
                  image: detailsService.category_image,
                }
              : null
          }
          currencyText={currency}
          onClose={closeDetailsModal}
          onRequestService={addServiceFromDetails}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingTop: 6,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    height: 48,
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#70B7E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F1F1F',
    marginHorizontal: 8,
  },
  sectionWrap: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#2C2C2C',
    textAlign: 'justify',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  listWithBottomBar: {
    paddingBottom: 100,
  },
  recentItem: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentTextWrap: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'flex-end',
  },
  recentText: {
    fontSize: 15,
    color: '#222',
    textAlign: 'justify',
  },
  resultItem: {
    minHeight: 94,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  resultPriceWrap: {
    minWidth: 86,
    alignItems: 'flex-start',
  },
  resultPrice: {
    fontSize: 16,
    color: '#2A2A2A',
  },
  resultCenter: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  resultName: {
    fontSize: 14,
    color: '#222',
    textAlign: 'justify',
    lineHeight: 20,
  },
  resultCategory: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'auto',
  },
  viewDetails: {
    fontSize: 13,
    color: '#4CA7E8',
    marginTop: 4,
  },
  resultIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultIcon: {
    width: 40,
    height: 40,
  },
  addButton: {
    minHeight: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2F9BDD',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    position: 'relative',
  },
  addButtonText: {
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
  emptyWrap: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
  },
  loaderWrap: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
});