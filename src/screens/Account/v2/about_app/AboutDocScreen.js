import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getDocData} from '../../../../services/docService';

const AboutDocScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const title = route?.params?.title || t('about_main.title');
  const doc = route?.params?.doc || 'about';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [docData, setDocData] = useState(null);

  const fetchDoc = useCallback(async ({isRefresh = false} = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getDocData(doc);

      // حسب شكل الـ resource عندك
      setDocData(response?.data || response || null);
    } catch (error) {
      console.log('DOC ERROR:', error?.response?.data || error?.message);
      setDocData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doc]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const onRefresh = () => {
    fetchDoc({isRefresh: true});
  };

  const content =
    docData?.des || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <AppText style={styles.contentText}>
              {content || t('about_doc.no_content')}
            </AppText>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AboutDocScreen;

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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 30,
  },
  contentText: {
    fontSize: 16,
    color: '#5F5F5F',
    lineHeight: 30,
    textAlign: 'auto',
  },
});