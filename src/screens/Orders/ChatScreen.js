import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { backgroundColorHadytop, btnColor, btnColorDark } from '../../utils/app';
import HeaderApp from '../../shared/Header';
import { useSelector } from 'react-redux';
import i18next, { t } from 'i18next';

const ChatScreen = ({ route, navigation }, props) => {
  const { provider } = route.params;

  const [messages, setMessages] = useState([
    { id: '1', text: 'مرحبًا، كيف يمكنني مساعدتك؟ 😊', time: '09:41', sender: 'technician' },
    { id: '2', text: 'مرحبًا، لدي مشكلة في الكهرباء في منزلي.', time: '09:42', sender: 'user' },
    { id: '3', text: 'ما نوع المشكلة؟', time: '09:43', sender: 'technician' },
  ]);

  const user = useSelector(state => state.auth.user);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: (messages.length + 1).toString(),
        text: input,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'user',
      };
      setMessages([newMessage, ...messages]);
      setInput('');
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.technicianMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* <HeaderApp navigation={navigation} title={t('drawer.home')} profileView={true} drawer={true} /> */}
          <View style={{backgroundColor: 'white',justifyContent:'space-between' ,flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8 }}>
          <View style={{backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',  }}>
            <Image source={{ uri: provider.image }} style={{ width: 60, height: 60, borderRadius: 10, marginEnd: 15 }} />
            <View>
              <Text style={{ fontFamily: 'Tajawal-Bold', fontSize: 16, color: btnColorDark }}>{provider.name}</Text>
              <Text style={{ fontFamily: 'Tajawal-Medium', fontSize: 13, color: btnColorDark }}>فني من ترتيب</Text>
            </View>
            
          </View>
          <TouchableOpacity onPress={() => { navigation.goBack(); }}>
          <Ionicons size={25} name={(i18next.language == 'ar') ? "arrow-back" : "arrow-forward" } color={'black'} />
           </TouchableOpacity>

          </View>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
            inverted
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="اكتب رسالتك..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={18} style={{ transform: [{ rotate: '180deg' }], marginEnd: -5 }} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e8f5ff',
  },
  technicianMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
  },
  messageText: {
    fontSize: 15,
    color: 'black',
    fontFamily: 'Tajawal-Medium',
  },
  messageTime: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: 'Tajawal-Medium',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    textAlign: (i18next.language === 'ar') ? 'right' : 'left',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: btnColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;
