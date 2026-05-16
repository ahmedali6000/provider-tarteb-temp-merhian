import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, RefreshControl } from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import HeaderApp from "../../shared/Header";
 
import { useSelector } from "react-redux";
import { domain } from "../../utils/app";
import axios from "axios";
import i18next, { t } from 'i18next';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const tokenK = useSelector((state) => state.auth.token);

  // جلب البيانات من API
  const GET_DATA = useCallback(async (isRefresh = false) => {
    if (loading) return;
  
    setLoading(true);
    try {
      const res = await axios.get(`${domain}/api/notifications?page=${isRefresh ? 1 : pageNum}`, {
        headers: {
          Authorization: `Bearer ${tokenK}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
  
      const newData = res.data;
  
      setNotifications((prev) => {
        // دمج البيانات مع التأكد من أن كل عنصر جديد له ID غير مكرر
        const uniqueNotifications = [...prev, ...newData].reduce((acc, item) => {
          if (!acc.find((n) => n.id === item.id)) {
            acc.push(item);
          }
          return acc;
        }, []);
  
        return isRefresh ? newData : uniqueNotifications;
      });
  
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageNum, tokenK, loading]);

  // تحديث عند السحب للأسفل
  const onRefresh = () => {
    setRefreshing(true);
    setPageNum(1);
    GET_DATA(true);
  };

  // تحميل البيانات عند فتح الشاشة أو تغيير الصفحة
  useEffect(() => {
    GET_DATA();
  }, [pageNum]);

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.body}</Text>
        <Text style={{color:'black',fontSize:11,backgroundColor:'#cfc9f2',alignSelf:'flex-end',padding:5,borderRadius:5}}><Ionicons name="time-outline"  /> {item.created_at}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <HeaderApp title={t("drawer.notifications")} />
        <View style={{ flex: 1, marginTop: 5 }}>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onEndReached={() => !loading && setPageNum((prev) => prev + 1)}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3498db"]} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1.3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Tajawal-Bold',
    color: '#000',
    textAlign: (i18next.language == 'ar') ? 'left' : 'right',
  },
  description: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    fontFamily: 'Tajawal-Medium',
    lineHeight:20,
    textAlign: (i18next.language == 'ar') ? 'left' : 'right',
  },
});

export default NotificationScreen;
