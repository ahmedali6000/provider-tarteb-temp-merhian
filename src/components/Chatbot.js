import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  I18nManager,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { Ionicons } from '@react-native-vector-icons/ionicons';import { btnColor, btnColorDark } from "../utils/app";
import { useSelector } from "react-redux";

export default function ChatBot() {
  const [visible, setVisible] = useState(false);
    var user = useSelector(state => state.auth.user);
  
  const [messages, setMessages] = useState([
    { id: "1", from: "bot", text: "مرحباً 👋، انا عم ترتيب مساعدك الرقمي اقدر اساعدك ازاي النهاردة ؟  " },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef(null);

  // إغلاق عند الضغط على رجوع
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        setVisible(false);
        return true;
      }
      return false;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => handler.remove();
  }, [visible]);

  // إرسال رسالة
  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), from: "bot", text: `اهلا بيك يا ${user?.name} تم تسجيل رسالتك ✅ .. لكن انا قيد التطوير ` },
      ]);
    }, 800);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.msgBubble,
        item.from === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={[styles.msgText,{color:item.from === "user" ? 'white' : '#000'}]}>{item.text}</Text>
    </View>
  );

  return (
    <>
      {/* زر عائم */}
      {
        (user?.chatbot == 'yes') && 
         <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        {/* <Ionicons name="chatbubble-ellipses" size={28} color="#fff" /> */}
        <Image source={require('./../../assets/images/icons/robot.png')} style={styles.boyImage} />
      </TouchableOpacity>
      }
     

      {/* واجهة المحادثة */}
      <Modal visible={visible}
        
        onRequestClose={() => setVisible(false)} // ⬅️ مهم جداً عشان الأندرويد
        animationType="slide">
        <KeyboardAvoidingView
          style={styles.chatContainer}
           
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* رأس الشات */}
          <View style={styles.header}>
            <Text style={styles.headerText}>مساعدك في تطبيق ترتيب 🤖</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* قائمة الرسائل */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 12 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          {/* إدخال الرسالة */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="اكتب رسالتك..."
              value={input}
              onChangeText={setInput}
              textAlign={I18nManager.isRTL ? "right" : "left"}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: '30%',
    right: 10,
    backgroundColor: btnColorDark,
    borderRadius: 100,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  boyImage:{
    width:40,
    height:40,
    marginTop:-5
  },
  chatContainer: {
    flex: 1,
    margin:5,
    backgroundColor: "#f9f9f9",
  },
  header: {
    backgroundColor: btnColorDark,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  msgBubble: {
    maxWidth: "75%",
    padding: 12,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: btnColorDark,
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#eaeaea",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  msgText: {
    color: "#000",
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0aa351",
    borderRadius: 25,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
