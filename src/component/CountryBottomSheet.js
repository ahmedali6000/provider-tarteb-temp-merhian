import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image, 
  Dimensions ,
} from 'react-native';
import AppText from '../shared/AppText';

import { countries } from '../utils/DATA';

const { height } = Dimensions.get('window');

const CountryBottomSheet = ({ visible, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  
  const filteredCountries = countries.filter(c => 
    c.name.includes(search) || c.code.includes(search)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheet}>
          {/* مقبض السحب العلوي */}
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <AppText weight="bold" style={styles.title}>اختر الدولة</AppText>
          </View>

          {/* حقل البحث */}
          {/* <View style={styles.searchContainer}>
            <Image source={require('./../../assets/app/images/icons/search.png')} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="بحث باسم الدولة"
              placeholderTextColor="#999"
              textAlign="right"
              value={search}
              onChangeText={setSearch}
            />
          </View> */}

          {/* قائمة الدول */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.countryItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <AppText style={styles.countryCode}>{item.code}</AppText>
                <View style={styles.countryInfo}>
                  <AppText style={styles.countryName}>{item.name}</AppText>
                  <Image source={item.flag} style={styles.flagIcon} />
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.7,
    paddingTop: 15,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchIcon: {
    width: 18,
    height: 18,
    tintColor: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingRight: 10,
  },
  listContent: {
    paddingBottom: 30,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryName: {
    fontSize: 16,
    color: '#333',
    marginRight: 15,
  },
  countryCode: {
    fontSize: 16,
    color: '#999',
  },
  flagIcon: {
    width: 28,
    height: 18,
    borderRadius: 3,
  },
});

export default CountryBottomSheet;
