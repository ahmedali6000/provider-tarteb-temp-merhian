import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getAddresses} from '../../../../services/addressService';
import {UPDATE_ADRESSES_ARR} from '../../../../redux/actions/ActionTypes';

const AddressesScreen = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getAddresses();
        const nextAddresses = response?.data || [];

        setAddresses(nextAddresses);

        dispatch({
          type: UPDATE_ADRESSES_ARR,
          payload: nextAddresses,
        });
      } catch (error) {
        console.log('ADDRESSES ERROR:', error?.response?.data || error?.message);
        setAddresses([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const onRefresh = () => {
    fetchAddresses({isRefresh: true});
  };

  const getAddressTypeIcon = type => {
    if (type === 'home') {
      return 'home';
    }

    if (type === 'work') {
      return 'business';
    }

    return 'location';
  };

  const openAddAddress = () => {
    navigation.navigate('PickAddressMapScreen', {
      mode: 'create',
      from: 'account',
      returnScreen: 'AddressesScreen',
    });
  };

  const openEditAddress = item => {
    navigation.navigate('PickAddressMapScreen', {
      mode: 'edit',
      from: 'account',
      returnScreen: 'AddressesScreen',
      address: item,
      initialLocation: {
        latitude: item?.latitude,
        longitude: item?.longitude,
        address: item?.address || item?.street || '',
        street: item?.street || item?.address || '',
      },
    });
  };

  const renderAddress = ({item}) => {
    return (
      <View style={styles.addressCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.typeBadge}>
            <Ionicons
              name={getAddressTypeIcon(item.type)}
              size={13}
              color="#3296D9"
            />

            <AppText weight="medium" style={styles.typeText}>
              {item.type_label || t(`addresses.${item.type}`)}
            </AppText>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editBtn}
            onPress={() => openEditAddress(item)}>
            <AppText weight="bold" style={styles.editText}>
              {t('addresses.edit')}
            </AppText>
          </TouchableOpacity>
        </View>

        <AppText weight="medium" style={styles.addressText} numberOfLines={2}>
          {item.address || item.street || t('addresses.no_address')}
        </AppText>
      </View>
    );
  };

  const EmptyComponent = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={require('../../../../../assets/app/images/vectors/no-address.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('addresses.empty_title')}
        </AppText>

        <AppText style={styles.emptySubtitle}>
          {t('addresses.empty_subtitle')}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="addresses.title"
          onBack={() => navigation.goBack()}
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3296D9" />
          </View>
        ) : (
          <FlatList
            data={addresses}
            keyExtractor={item => String(item.id)}
            renderItem={renderAddress}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              addresses.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3296D9"
                colors={['#3296D9']}
              />
            }
            ListEmptyComponent={<EmptyComponent />}
          />
        )}

        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.addButton}
            onPress={openAddAddress}>
            <AppText weight="bold" style={styles.addButtonText}>
              {t('addresses.add_new')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddressesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 18,
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  addressCard: {
    minHeight: 78,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E3E5E8',
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 13,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editBtn: {
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editText: {
    fontSize: 13,
    color: '#FF7A00',
    textAlign: 'left',
  },
  typeBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 13,
    color: '#1F1F1F',
    marginStart: 5,
  },
  addressText: {
    fontSize: 13,
    color: '#1F1F1F',
    textAlign: 'auto',
    lineHeight: 21,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },
  emptyImage: {
    width: 140,
    height: 140,
    marginBottom: 22,
  },
  emptyTitle: {
    fontSize: 21,
    color: '#1F1F1F',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 27,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});