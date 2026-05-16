import React from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import useAppFont from '../../hooks/useAppFont';

const HomeSearchBar = ({
  value,
  onChangeText,
  onPress,
  editable = false,
}) => {
  const {t} = useTranslation();
 const {fontFamily} = useAppFont();
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.container}>
        <Ionicons name="search-outline" size={20} color="#9B9B9B" />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={t('homev2.search_placeholder')}
          placeholderTextColor="#9B9B9B"
          style={[styles.input, {fontFamily}]}
          textAlign="right"
          editable={editable}
          pointerEvents="none"
        />
      </TouchableOpacity>
    </View>
  );
};

export default HomeSearchBar;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  container: {
    height: 48,
    backgroundColor: '#F7F7F7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    marginHorizontal: 8,
  },
});