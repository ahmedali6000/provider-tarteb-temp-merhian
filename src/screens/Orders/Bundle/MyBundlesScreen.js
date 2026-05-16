import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import HeaderApp from '../../../shared/Header';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { btnColorDark, domain } from '../../../utils/app';
import { useSelector } from 'react-redux';

 
const MyBundlesScreen = () => {
  const { t ,i18n} = useTranslation();
  const navigation = useNavigation();

  const [bundles, setBundles] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tokenK = useSelector(state => state.auth.token);

  const fetchBundles = async (page = 1, refresh = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`${domain}/api/my-bundles?page=${page}`, {
        headers: {
          Authorization: `Bearer ${tokenK}`,
          Accept: 'application/json',
        },
      });

      const newData = response.data.data || [];

      if (refresh) {
        setBundles(newData);
      } else {
        setBundles(prev => [...prev, ...newData]);
      }

      setHasMore(newData.length === 10);
    } catch (error) {
      console.error('Error fetching bundles:', error.message);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPageNum(1);
    fetchBundles(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    fetchBundles(nextPage);
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return <ActivityIndicator style={{ marginVertical: 16 }} color="#2783C4" />;
  };

  const renderEmpty = () => {
    if (loading || refreshing) return null;

    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center',flexDirection:'column'}}>
        <View style={{backgroundColor:'transparent',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            <Image style={{width:230 ,height:230 }} source={require("../../../../assets/images/empty.png")} />
            <Text style={{fontSize:16, fontFamily:'Tajawal-Bold',color:btnColorDark,textAlign:'center',marginTop:5}}>
            {t('empty')}
            </Text>
        </View>
    </View>
    );
  };

  const renderBundle = ({ item }) => (
    <Pressable android_ripple={{ color: '#fff', borderless: false }} onPress={() =>  navigation.navigate('MyBundleDetailsScreen', {
        bundleRoute: item
        })}> 
    <View style={styles.card}>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{item.type}</Text>
      </View>

      <View style={styles.topSection}>
        <Image
          source={{ uri: item.icon }}
          style={styles.icon}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={[styles.title,(i18n.language == 'ar') && {textAlign:'left'}]}>{item.title}</Text>
          <Text style={[styles.subText, { marginVertical: 5 ,textAlign:'left'}]}>
            من {item.start_at} إلى {item.end_at}
          </Text>
          <Text style={[styles.subText,(i18n.language == 'ar') && {textAlign:'left'}]}>الساعة: {item.hour}</Text>
        </View>
      </View>

      <View style={styles.usageContainer}>
        <Text style={[styles.usageLabel,(i18n.language == 'ar') && {textAlign:'left'}]}>
          تم استخدام {item.days_used} من {item.all_days} يوم
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.usage}%` }]} />
        </View>
      </View>
    </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderApp navigation={navigation} title={t('bundle.title')} />
      <View style={styles.container}>
        <FlatList
          data={bundles}
          renderItem={renderBundle}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyBundlesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#00000010',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  labelContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F0FB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 12,
    fontFamily: 'Tajawal-Bold',
    color: '#2783C4',
  },
  topSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginEnd: 25,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14.5,
    fontFamily: 'Tajawal-Bold',
    color: '#2783C4',
    marginBottom: 6,
  },
  subText: {
    fontSize: 13,
    fontFamily: 'Tajawal-Regular',
    color: '#555',
  },
  usageContainer: {
    marginTop: 14,
  },
  usageLabel: {
    fontSize: 12.5,
    fontFamily: 'Tajawal-Regular',
    color: '#444',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#2783C4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Tajawal-Medium',
  },
});
