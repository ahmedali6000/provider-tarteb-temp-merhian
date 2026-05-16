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
  Modal,
  Pressable,
} from 'react-native';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {
  getSupportMessages,
  getSupportMessageDetails,
} from '../../../../services/supportService';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';

const SupportMessagesScreen = ({navigation}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
const {t} = useTranslation();
const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
const [detailsModal, setDetailsModal] = useState(false);


const openMessageDetails = async item => {
  try {
    setSelectedMessage(item);
    setDetailsModal(true);
    setDetailsLoading(true);

    const response = await getSupportMessageDetails(item.id);

    if (response?.status && response?.data) {
      setSelectedMessage({
        ...item,
        ...response.data,
      });
    }
  } catch (error) {
    console.log(
      'SUPPORT MESSAGE DETAILS ERROR:',
      error?.response?.data || error?.message,
    );
  } finally {
    setDetailsLoading(false);
  }
};

  const fetchMessages = useCallback(async ({pageNumber = 1, refresh = false} = {}) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

    const response = await getSupportMessages(pageNumber);

const newMessages = Array.isArray(response?.data) ? response.data : [];
const pagination = response?.pagination;

setPage(pagination?.current_page || pageNumber);
setLastPage(pagination?.last_page || 1);

if (pageNumber === 1) {
  setMessages(newMessages);
} else {
  setMessages(prev => [...prev, ...newMessages]);
}
    } catch (error) {
      console.log('SUPPORT MESSAGES ERROR:', error?.response?.data || error?.message);

      if (pageNumber === 1) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages({pageNumber: 1});
  }, [fetchMessages]);

  const onRefresh = () => {
    fetchMessages({pageNumber: 1, refresh: true});
  };

  const loadMore = () => {
    if (!loadingMore && page < lastPage) {
      fetchMessages({pageNumber: page + 1});
    }
  };

  const getStatusData = item => {
  if (String(item.contacted) === '1') {
    return {
      text: t('contact_support.status.contacted'),
      boxStyle: styles.statusGreenBox,
      textStyle: styles.statusGreenText,
    };
  }

  if (String(item.read) === '1') {
    return {
      text: t('contact_support.status.review'),
      boxStyle: styles.statusOrangeBox,
      textStyle: styles.statusOrangeText,
    };
  }

  return {
    text: t('contact_support.status.review'),
    boxStyle: styles.statusOrangeBox,
    textStyle: styles.statusOrangeText,
  };
};

  const formatDate = date => {
    if (!date) return '';

    const d = new Date(date);

    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

const renderMessage = ({item}) => {
  const status = getStatusData(item);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
     onPress={() => openMessageDetails(item)}>
      <View style={styles.cardHeader}>
         <AppText style={styles.dateText}>
          {formatDate(item.created_at)}
        </AppText>
        <View style={[styles.statusBox, status.boxStyle]}>
          <AppText weight="bold" style={[styles.statusText, status.textStyle]}>
            {status.text}
          </AppText>
        </View>

       
      </View>

      <AppText style={styles.messageText} numberOfLines={2}>
        {item.msg_short}
      </AppText>
    </TouchableOpacity>
  );
};

  const EmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={require('../../../../../assets/app/images/vectors/no-messages.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('contact_support.empty_title')}
        </AppText>

        <AppText style={styles.emptySubtitle}>
          {t('contact_support.empty_subtitle')}
        </AppText>
      </View>
    );
  };

  const FooterLoader = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3296D9" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
         titleKey="contact_support.title"
          onBack={() => navigation.goBack()}
        />

        <AppText weight="bold" style={styles.listTitle}>
           {t('contact_support.list_title')}
        </AppText>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3296D9" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3296D9"
                colors={['#3296D9']}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.35}
            ListFooterComponent={<FooterLoader />}
            ListEmptyComponent={<EmptyComponent />}
          />
        )}

        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.sendButton}
            onPress={() => navigation.navigate('ContactSupportScreen')}>
            <AppText weight="bold" style={styles.sendButtonText}>
             {t('contact_support.send1')}
            </AppText>
          </TouchableOpacity>
        </View>


            <Modal
  visible={detailsModal}
  transparent
  animationType="slide"
  onRequestClose={() => setDetailsModal(false)}>
  <Pressable
    style={styles.modalOverlay}
    onPress={() => setDetailsModal(false)}>
    <Pressable style={styles.detailsSheet} onPress={() => {}}>
      <View style={styles.sheetHandle} />

      {selectedMessage ? (
        <>
          <View style={styles.detailsHeader}>
             <AppText style={styles.dateText}>
              {formatDate(selectedMessage.created_at)}
            </AppText>
            <View
              style={[
                styles.statusBox,
                getStatusData(selectedMessage).boxStyle,
              ]}>
              <AppText
                weight="bold"
                style={[
                  styles.statusText,
                  getStatusData(selectedMessage).textStyle,
                ]}>
                {getStatusData(selectedMessage).text}
              </AppText>
            </View>

           
          </View>

         {detailsLoading ? (
  <View style={styles.detailsLoader}>
    <ActivityIndicator size="small" color="#3296D9" />
  </View>
) : (
  <AppText style={styles.detailsMessage}>
    {selectedMessage?.msg}
  </AppText>
)}
        </>
      ) : null}
    </Pressable>
  </Pressable>
</Modal>


      </View>
  
    </SafeAreaView>
  );
};

export default SupportMessagesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 17,
    paddingTop: 8,
  },
  listTitle: {
    fontSize: 13,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginTop: 10,
    marginBottom: 12,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 110,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    minHeight: 101,
    borderRadius: 14,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusBox: {
    minHeight: 27,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOrangeBox: {
    backgroundColor: '#FFF1DC',
  },
  statusOrangeText: {
    color: '#F28A1A',
  },
  statusGreenBox: {
    backgroundColor: '#E8FFF1',
  },
  statusGreenText: {
    color: '#21C466',
  },
  statusText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  messageText: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 21,
    textAlign: 'auto',
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90,
  },
  emptyImage: {
    width: 125,
    height: 125,
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 19,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    width: '82%',
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 26,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    height: 50,
    borderRadius: 13,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.78)',
  justifyContent: 'flex-end',
},

detailsSheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingHorizontal: 20,
  paddingTop: 8,
  paddingBottom: 28,
},

sheetHandle: {
  width: 42,
  height: 5,
  borderRadius: 10,
  backgroundColor: '#D2D2D2',
  alignSelf: 'center',
  marginBottom: 24,
},

detailsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 14,
},

detailsMessage: {
  fontSize: 14,
  color: '#111111',
  lineHeight: 24,
  textAlign: 'auto',
},
detailsLoader: {
  minHeight: 90,
  alignItems: 'center',
  justifyContent: 'center',
},
});