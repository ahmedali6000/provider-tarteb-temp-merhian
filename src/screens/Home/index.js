import React, {useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  I18nManager,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from '@react-native-vector-icons/ionicons';

import HomeHeader from '../../component/home/HomeHeader';
import HomeSearchBar from '../../component/home/HomeSearchBar';
import HomeBanner from '../../component/home/HomeBanner';
import CategorySection from '../../component/home/CategorySection';
import {getHomeCategories} from '../../services/homeService';
import AppText from '../../shared/AppText';
import {navigateByCategory} from '../../utils/navigation';
import { SELECT_MY_ADDRESS } from '../../redux/actions/ActionTypes';
 
const HomeScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const isRTL = I18nManager.isRTL;

  const addresses = useSelector(state => state.auth.addresses);
  const selectedAddress = useSelector(state => state.auth.my_selected_address);

  const [search, setSearch] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [addressSheet, setAddressSheet] = useState(false);
  const [tempAddress, setTempAddress] = useState(selectedAddress || null);

  const user = route?.params?.user || null;

  useEffect(() => {
    if (!selectedAddress && addresses?.length > 0) {
      dispatch({
        type: SELECT_MY_ADDRESS,
        payload: addresses[0],
      });
      setTempAddress(addresses[0]);
    }
  }, [addresses, selectedAddress, dispatch]);


  
const fetchHomeData = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const response = await getHomeCategories();
    setSections(response?.data || []);
  } catch (error) {
    console.log('HOME ERROR:', error?.response?.data || error?.message);
  } finally {
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
    }
  }
};


const onRefresh = () => {
  fetchHomeData(true);
};

  useEffect(() => {
    fetchHomeData();
  }, []);

  const filteredSections = useMemo(() => {
    if (!search.trim()) {
      return sections;
    }

    return sections
      .map(section => ({
        ...section,
        categories: section.categories.filter(category =>
          String(category?.name || '')
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        ),
      }))
      .filter(section => section.categories.length > 0);
  }, [search, sections]);

  const currentLocationText =
    selectedAddress?.address ||
    selectedAddress?.street ||
    t('homev2.default_location');

  const handlePressCategory = category => {
    navigateByCategory(navigation, category);
  };

  const handleQuickOrder = () => {
    navigation.navigate('QuickOrder');
  };

  const openSearchScreen = () => {
    navigation.navigate('SearchScreen', {
      sections,
    });
  };

  const openAddressSheet = () => {
    setTempAddress(selectedAddress || addresses?.[0] || null);
    setAddressSheet(true);
  };

  const confirmSelectedAddress = () => {
    if (tempAddress) {
      dispatch({
        type: SELECT_MY_ADDRESS,
        payload: tempAddress,
      });
    }

    setAddressSheet(false);
  };

  const getAddressIcon = type => {
    if (type === 'home') return 'home';
    if (type === 'work') return 'business';
    return 'location';
  };

  const renderAddressItem = item => {
    const active =
      tempAddress?.id === item.id || selectedAddress?.id === item.id;

    return (
      <TouchableOpacity
        key={String(item.id)}
        activeOpacity={0.85}
        onPress={() => setTempAddress(item)}
        style={[styles.sheetAddressCard, active && styles.sheetAddressCardActive]}>
        <View style={styles.sheetAddressTop}>
          <AppText weight="bold" style={styles.sheetEditText}>
            {t('addresses.edit')}
          </AppText>

          <View style={styles.sheetTypeBadge}>
            <Ionicons
              name={getAddressIcon(item.type)}
              size={13}
              color="#3296D9"
            />

            <AppText weight="medium" style={styles.sheetTypeText}>
              {item.type_label || t(`addresses.${item.type}`)}
            </AppText>
          </View>
        </View>

        <AppText
          weight="medium"
          numberOfLines={1}
          style={styles.sheetAddressText}>
          {item.address || item.street || t('addresses.no_address')}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HomeHeader
          userName={
            user
              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
              : t('homev2.default_name')
          }
          location={currentLocationText}
          userImage={user?.image}
          onPressNotification={() => navigation.navigate('NotificationScreen')}
          onPressLocation={openAddressSheet}
        />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F7931E']}
            tintColor="#F7931E"
          />
        }>
          <HomeSearchBar
            value={search}
            onChangeText={setSearch}
            onPress={openSearchScreen}
            editable={false}
          />

          <HomeBanner onPress={handleQuickOrder} />

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#F7931E" />
            </View>
          ) : filteredSections.length > 0 ? (
            filteredSections.map(section => (
              <CategorySection
                key={section.id}
                title={section.name}
                data={section.categories}
                onPressCategory={handlePressCategory}
              />
            ))
          ) : (
            <View style={styles.centerBox}>
              <AppText style={styles.emptyText}>
                {t('homev2.no_results')}
              </AppText>
            </View>
          )}
        </ScrollView>

        <Modal
          visible={addressSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setAddressSheet(false)}>
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setAddressSheet(false)}>
            <Pressable style={styles.sheetContainer} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              <AppText weight="bold" style={styles.sheetTitle}>
                {t('addresses.title')}
              </AppText>

              <View style={styles.sheetList}>
                {addresses?.length > 0 ? (
                  addresses.map(renderAddressItem)
                ) : (
                  <View style={styles.noAddressBox}>
                    <AppText style={styles.noAddressText}>
                      {t('addresses.empty_title')}
                    </AppText>
                  </View>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.confirmButton,
                  !tempAddress && styles.confirmButtonDisabled,
                ]}
                disabled={!tempAddress}
                onPress={confirmSelectedAddress}>
                <AppText weight="bold" style={styles.confirmButtonText}>
                  {t('addresses.confirm_location') || 'تأكيد'}
                </AppText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  centerBox: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#777',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 24,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetList: {
    maxHeight: 280,
  },

  sheetAddressCard: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E2E3E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 7,
    paddingBottom: 7,
    marginBottom: 12  ,
  },
  sheetAddressCardActive: {
    borderColor: '#3296D9',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  sheetAddressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sheetEditText: {
    fontSize: 14,
    color: '#FF7A00',
  },
  sheetTypeBadge: {
    minHeight: 22,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  sheetTypeText: {
    fontSize: 14,
    color: '#111111',
    marginRight: 4,
  },
  sheetAddressText: {
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'right',
  },

  confirmButton: {
    height: 49, 
    borderRadius: 9,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  confirmButtonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  noAddressBox: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
});