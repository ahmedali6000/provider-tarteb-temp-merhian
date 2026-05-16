import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getTransactions} from '../../../../services/walletService';

const TransactionsScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const title = route?.params?.title || t('transactions.title');
  const type = route?.params?.type || 'payments';

  const emptyImage = useMemo(() => {
    if (route?.params?.emptyImage) {
      return route.params.emptyImage;
    }

    return type === 'charges'
      ? require('./../../../../../assets/app/images/account/wallet/income-empty.png')
      : require('./../../../../../assets/app/images/account/wallet/outcome-empty.png');
  }, [route?.params?.emptyImage, type]);

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(
    async ({pageNumber = 1, isRefresh = false} = {}) => {
      try {
        if (pageNumber === 1 && !isRefresh) {
          setLoading(true);
        } else if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingMore(true);
        }

        const response = await getTransactions({
          type,
          page: pageNumber,
        //   perPage: 10,
        });

        const newData = response?.data || [];
        const meta = response?.meta || {};

        if (pageNumber === 1) {
          setTransactions(newData);
        } else {
          setTransactions(prev => [...prev, ...newData]);
        }

        setPage(meta?.current_page || pageNumber);
        setHasMorePages(!!meta?.has_more_pages);
      } catch (error) {
        console.log(
          'TRANSACTIONS ERROR:',
          error?.response?.data || error?.message,
        );

        if (pageNumber === 1) {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [type],
  );

  useEffect(() => {
    fetchTransactions({pageNumber: 1});
  }, [fetchTransactions]);

  const onRefresh = () => {
    fetchTransactions({pageNumber: 1, isRefresh: true});
  };

  const onEndReached = () => {
    if (!loadingMore && hasMorePages && transactions.length > 0) {
      fetchTransactions({pageNumber: page + 1});
    }
  };

  const isEmpty = !loading && transactions.length === 0;

  const renderTransaction = ({item}) => {
    const amountColor = item?.io === 'i' ? '#2FBF71' : '#333333';

    return (
      <View style={styles.tableRow}>
         <AppText style={[styles.tableCell, styles.operationCell]}>
          {item.id}#
        </AppText>
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

  const emptyTitle =
    type === 'charges'
      ? t('transactions.no_charge_title')
      : t('transactions.no_payment_title');

  const emptySubtitle =
    type === 'charges'
      ? t('transactions.no_charge_subtitle')
      : t('transactions.no_payment_subtitle');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <AppHeader title={title} onBack={() => navigation.goBack()} />

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#4BA2D8" />
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyStateWrap}>
              <Image
                source={emptyImage}
                style={styles.emptyImage}
                resizeMode="contain"
              />

              <AppText weight="bold" style={styles.emptyTitle}>
                {emptyTitle}
              </AppText>

              <AppText style={styles.emptySubtitle}>
                {emptySubtitle}
              </AppText>
            </View>
          ) : (
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                 <AppText
                  weight="medium"
                  style={[styles.headerCell, styles.operationCell]}>
                  # 
                </AppText>
                <AppText
                  weight="medium"
                  style={[styles.headerCell, styles.operationCell]}>
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
                ItemSeparatorComponent={() => (
                  <View style={styles.rowSeparator} />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListFooterComponent={
                  loadingMore ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color="#4BA2D8" />
                    </View>
                  ) : null
                }
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  tableCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7E7E7',
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
    minHeight: 42,
    backgroundColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  headerCell: {
    fontSize: 14,
    color: '#4A4A4A',
  },

  listContent: {
    paddingBottom: 12,
  },

  tableRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  tableCell: {
    fontSize: 14,
    color: '#333333',
  },
  rowSeparator: {
    height: 1,
    backgroundColor: '#F1F1F1',
  },

  operationCell: {
    flex: 1.2,
    textAlign: 'auto',
  },
  amountCell: {
    flex: 0.9,
    textAlign: 'center',
  },
  dateCell: {
    flex: 1,
    textAlign: 'auto',
  },

  emptyStateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -30,
  },
  emptyImage: {
    width: 115,
    height: 115,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#A8A8A8',
    textAlign: 'center',
    lineHeight: 22,
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});