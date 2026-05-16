import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  FlatList,
  I18nManager,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import WalletActionButton from '../../../../component/wallet/WalletActionButton';
import WalletTabButton from '../../../../component/wallet/WalletTabButton';
import {getLatestTransactions} from '../../../../services/walletService';

const WalletScreen = ({navigation}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  
  const balance = useSelector(state => state.auth.wallet);
const user = useSelector(state => state.auth.user);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatestTransactions = async ({isRefresh = false} = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getLatestTransactions();
      setTransactions(response?.data || []);
    } catch (error) {
      console.log(
        'LATEST TRANSACTIONS ERROR:',
        error?.response?.data || error?.message,
      );
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatestTransactions();
  }, []);

  const onRefresh = () => {
    fetchLatestTransactions({isRefresh: true});
  };

  const isEmpty = transactions.length === 0;

  const renderTransaction = ({item}) => {
    const amountColor = item?.io === 'i' ? '#2FBF71' : '#333333';

    return (
      <View style={styles.tableRow}>
        <AppText style={[styles.tableCell, styles.operationCell]}>
          {item.core}
        </AppText>

        <AppText
          style={[
            styles.tableCell,
            styles.amountCell,
            {color: amountColor},
          ]}>
          {item.amount}
        </AppText>

        <AppText style={[styles.tableCell, styles.dateCell]}>
          {item.date}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <AppHeader
            titleKey="wallet.title"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.balanceCard}>
            <View style={styles.balanceTopRow}>
              <View style={styles.balanceInfoWrap}>
                <AppText style={styles.balanceLabel}>
                  {t('wallet.current_balance')}
                </AppText>

                <View style={styles.balanceValueRow}>
                  <AppText weight="bold" style={styles.balanceValue}>
                    {balance}
                  </AppText>
                  <AppText style={styles.currencyText}>
                    {t('wallet.currency')}
                  </AppText>
                </View>
              </View>

                {
                  (user.paymentAva != 0) &&
                  <WalletActionButton
                title={t('wallet.charge_balance')}
                onPress={() =>   navigation.navigate('OrderPaymentChannelsScreen', {
                  order_id: "#sad",
                  amount: 500,
                  payment_for: 'wallet_charge',
                })}
              />
                }
             
             
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.transferRow}
            onPress={() => navigation.navigate('TransferBalanceScreen')}>
            <AppText weight="medium" style={styles.transferText}>
              {t('wallet.transfer_balance')}
            </AppText>

            <Ionicons
              name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
              size={17}
              color="#4BA2D8"
              style={styles.transferIcon}
            />
          </TouchableOpacity>

          <View style={styles.tabsRow}>
            <WalletTabButton
              title={t('wallet.payment_history')}
              iconName="remove-circle-outline"
              iconColor="#4BA2D8"
              backgroundColor="#EAF3FA"
              onPress={() =>
                navigation.navigate('TransactionsScreen', {
                  title: t('wallet.payment_history'),
                  type: 'payments',
                  emptyImage: require('./../../../../../assets/app/images/account/wallet/outcome-empty.png'),
                })
              }
              style={styles.tabButton}
            />

            <WalletTabButton
              title={t('wallet.charge_history')}
              iconName="add-circle-outline"
              iconColor="#F7941D"
              backgroundColor="#F7EEE5"
              onPress={() =>
                navigation.navigate('TransactionsScreen', {
                  title: t('wallet.charge_history'),
                  type: 'charges',
                  emptyImage: require('./../../../../../assets/app/images/account/wallet/income-empty.png'),
                })
              }
              style={styles.tabButton}
            />
          </View>

          <AppText weight="bold" style={styles.sectionTitle}>
            {t('wallet.latest_operations')}
          </AppText>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#4BA2D8" />
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyStateWrap}>
              <View style={styles.emptyIconBox}>
                <Image
                  source={require('./../../../../../assets/app/images/account/wallet/empty.png')}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
              </View>

              <AppText weight="bold" style={styles.emptyTitle}>
                {t('wallet.no_operations_title')}
              </AppText>

              <AppText style={styles.emptySubtitle}>
                {t('wallet.no_operations_subtitle')}
              </AppText>
            </View>
          ) : (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <AppText
                  weight="medium"
                  style={[styles.headerCell, styles.operationCell, {}]}>
                  {t('wallet.operation_col')}
                </AppText>

                <AppText
                  weight="medium"
                  style={[styles.headerCell, styles.amountCell]}>
                  {t('wallet.amount')}
                </AppText>

                <AppText
                  weight="medium"
                  style={[styles.headerCell, styles.dateCell]}>
                  {t('wallet.date')}
                </AppText>
              </View>

              <FlatList
                data={transactions}
                keyExtractor={item => String(item.id)}
                renderItem={renderTransaction}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                  <View style={styles.rowSeparator} />
                )}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  balanceCard: {
    marginTop: 18,
    backgroundColor: '#ECECEC',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.025,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 2},
      },
      android: {
        elevation: 1,
      },
    }),
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfoWrap: {
    flex: 1,
    alignItems: 'flex-start',
    marginStart: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9A9A9A',

    marginBottom: 2,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  balanceValue: {
    fontSize: 32,
    color: '#1F1F1F',
    // lineHeight: 32,
  },
  currencyText: {
    fontSize: 16,
    color: '#8B8B8B',
    marginStart: 7,
    marginBottom: 2,
  },

  transferRow: {
    marginTop: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
  },
  transferText: {
    fontSize: 15.5,
    color: '#1F1F1F',
  },
  transferIcon: {
    marginStart: 4,
  },

  tabsRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tabButton: {
    flex: 1,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 14,
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginHorizontal: 9,
    // alignSelf:'flex-start'
  },

  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tableHeader: {
    backgroundColor: '#EFEFEF',
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  headerCell: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'auto',
  },

  tableRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  tableCell: {
    fontSize: 15,
    color: '#333',
    textAlign: 'auto',
  },
  rowSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  operationCell: {
    flex: 1.2,
    textAlign: 'auto',
  },
  amountCell: {
    flex: 1,
    textAlign: 'auto',
  },
  dateCell: {
    flex: 1,
    textAlign: 'auto',
  },

  loaderWrap: {
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },

  emptyStateWrap: {
    marginTop: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  emptyIconBox: {
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 118,
    height: 118,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    textAlign: 'center',
    lineHeight: 22,
  },
});