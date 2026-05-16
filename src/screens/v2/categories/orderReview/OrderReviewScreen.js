import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  I18nManager,
  TextInput,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {Add_Service_To_Order} from '../../../../redux/actions/authActionCreator';
import {UPDATE_ORDER_NOTES} from '../../../../redux/actions/ActionTypes';

const OrderReviewScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;
  const dispatch = useDispatch();

  const order = useSelector(state => state.order);
  const services = order?.order_services || [];
  const orderNotes = order?.order_notes || '';

  const category = route?.params?.category || null;

  const isPreviewOrder = order?.preview === true;
  const reviewItemsCount = isPreviewOrder ? 1 : services.length;

  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);
  const [qtySheetVisible, setQtySheetVisible] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState(null);
  const [selectedQtyItem, setSelectedQtyItem] = useState(null);

  const currency = t('services.currency', {defaultValue: 'ج.م'});

  const updateOrderNotes = text => {
    dispatch({
      type: UPDATE_ORDER_NOTES,
      payload: text,
    });
  };

  const totalPrice = useMemo(() => {
    if (isPreviewOrder) {
      return Number(order?.preview_cost || 0);
    }

    return services.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.count || 1);
    }, 0);
  }, [services, isPreviewOrder, order?.preview_cost]);

  const openDeleteSheet = payload => {
    setSelectedDeleteItem(payload);
    setDeleteSheetVisible(true);
  };

  const closeDeleteSheet = () => {
    setSelectedDeleteItem(null);
    setDeleteSheetVisible(false);
  };

  const openQtySheet = item => {
    setSelectedQtyItem(item);
    setQtySheetVisible(true);
  };

  const closeQtySheet = () => {
    setSelectedQtyItem(null);
    setQtySheetVisible(false);
  };

  const updateWholeService = (item, newPrice, newDetails) => {
    dispatch(
      Add_Service_To_Order(
        order?.order_category_id,
        order?.order_category_name,
        item.service_id,
        item.service_name,
        newPrice,
        1,
        services,
        'positive',
        order?.main_category_id,
        order?.main_category_name,
        newDetails,
      ),
    );
  };

  const removeWholeService = item => {
    dispatch(
      Add_Service_To_Order(
        order?.order_category_id,
        order?.order_category_name,
        item.service_id,
        item.service_name,
        item.price,
        0,
        services,
        'negative',
        order?.main_category_id,
        order?.main_category_name,
        item.details || null,
      ),
    );
  };

  const deleteCleaningFurnitureItem = (parentService, furnitureItem) => {
    const oldDetails = parentService?.details || {};
    const oldItems = oldDetails?.furniture_items || [];

    const nextItems = oldItems.filter(
      item => String(item.service_id) !== String(furnitureItem.service_id),
    );

    const removedPrice = Number(furnitureItem.total || 0);
    const nextPrice = Math.max(
      0,
      Number(parentService.price || 0) - removedPrice,
    );

    const nextDetails = {
      ...oldDetails,
      furniture_items: nextItems,
      total_price: nextPrice,
    };

    updateWholeService(parentService, nextPrice, nextDetails);
  };

  const deleteCleaningAppliance = (
    parentService,
    applianceKey,
    appliancePrice,
  ) => {
    const oldDetails = parentService?.details || {};
    const oldAppliances = oldDetails?.appliances || {};

    const nextAppliances = {
      ...oldAppliances,
      [applianceKey]: 0,
    };

    const nextPrice = Math.max(
      0,
      Number(parentService.price || 0) - Number(appliancePrice || 0),
    );

    const nextDetails = {
      ...oldDetails,
      appliances: nextAppliances,
      total_price: nextPrice,
    };

    updateWholeService(parentService, nextPrice, nextDetails);
  };

  const confirmDelete = () => {
    if (!selectedDeleteItem) {
      return;
    }

    if (selectedDeleteItem.type === 'whole_service') {
      removeWholeService(selectedDeleteItem.service);
    }

    if (selectedDeleteItem.type === 'cleaning_furniture') {
      deleteCleaningFurnitureItem(
        selectedDeleteItem.parentService,
        selectedDeleteItem.furnitureItem,
      );
    }

    if (selectedDeleteItem.type === 'cleaning_appliance') {
      deleteCleaningAppliance(
        selectedDeleteItem.parentService,
        selectedDeleteItem.applianceKey,
        selectedDeleteItem.appliancePrice,
      );
    }

    closeDeleteSheet();
  };

  const updateNormalServiceQty = qty => {
    if (!selectedQtyItem) {
      return;
    }

    dispatch(
      Add_Service_To_Order(
        order?.order_category_id,
        order?.order_category_name,
        selectedQtyItem.service_id,
        selectedQtyItem.service_name,
        selectedQtyItem.price,
        qty,
        services,
        qty <= 0 ? 'negative' : 'positive',
        order?.main_category_id,
        order?.main_category_name,
        selectedQtyItem.details || null,
      ),
    );

    closeQtySheet();
  };

  const completeOrder = () => {
    navigation.navigate('SelectOrderAddressScreen', {
      category,
    });
  };

  const getValueLabel = value => {
    if (value === true) {
      return t('common.yes', {defaultValue: 'نعم'});
    }

    if (
      value === false ||
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return t('common.no', {defaultValue: 'لا'});
    }

    return String(value);
  };

  const cleanValueText = value => {
    const map = {
      normal: 'عادي',
      deep: 'عميق',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير',
      very_large: 'كبير جدًا',

      fabric: 'قماش',
      leather: 'جلد',

      spring: 'سوست',
      foam: 'فوم',
      medical: 'طبية',
      king: 'كينج',
      queen: 'كوين',
      single: 'فردية',
      one_half: 'نفر ونصف',

      chiffon: 'شيفون',
      heavy: 'ثقيل',
      blackout: 'بلاك أوت',

      normal_carpet: 'عادي',
      wool: 'صوف',
      velvet: 'قطيفة',
      silk: 'حرير',
    };

    return map[value] || getValueLabel(value);
  };

  const renderMiniInfo = ({icon, label, value}) => {
    return (
      <View style={styles.miniInfoItem}>
        <View style={styles.miniIconBox}>
          <Ionicons name={icon} size={18} color="#3296D9" />
        </View>

        <View style={styles.miniTextWrap}>
          <AppText style={styles.miniLabel}>{label}</AppText>

          <AppText weight="bold" style={styles.miniValue}>
            {value}
          </AppText>
        </View>
      </View>
    );
  };

  const renderBooleanLine = (label, value) => {
    return (
      <View style={styles.booleanLine}>
        <AppText style={styles.booleanLabel}>{label}</AppText>

        <AppText style={styles.booleanValue}>{getValueLabel(value)}</AppText>
      </View>
    );
  };

  const renderCategoryHeader = item => {
    const image = category?.image || category?.background || null;

    return (
      <View style={styles.cleaningTopHeader}>
        {image ? (
          <Image source={{uri: image}} style={styles.cleaningHeaderImage} />
        ) : (
          <View style={styles.cleaningHeaderImagePlaceholder}>
            <Ionicons name="home-outline" size={24} color="#3296D9" />
          </View>
        )}

        <View style={styles.cleaningHeaderText}>
          <AppText style={styles.cleaningParentText}>
            {order?.main_category_name || category?.name || ''}
          </AppText>

          <AppText weight="bold" style={styles.cleaningHeaderTitle}>
            {item.service_name}
          </AppText>
        </View>
      </View>
    );
  };

  const renderFullHomeDetails = details => {
    const values = details?.form_values || {};

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {t('cleaning.home_details', {defaultValue: 'تفاصيل المنزل'})}
        </AppText>

        <View style={styles.detailsGridCard}>
          {renderMiniInfo({
            icon: 'sparkles-outline',
            label: t('cleaning.cleaning_type', {defaultValue: 'نوع التنظيف'}),
            value: cleanValueText(values.cleaning_type),
          })}

          {renderMiniInfo({
            icon: 'resize-outline',
            label: t('cleaning.home_area', {defaultValue: 'مساحة المنزل'}),
            value: `${values.area || 0}م`,
          })}

          {renderMiniInfo({
            icon: 'bed-outline',
            label: t('cleaning.rooms_count', {defaultValue: 'عدد الغرف'}),
            value: values.rooms || 0,
          })}

          {renderMiniInfo({
            icon: 'water-outline',
            label: t('cleaning.bathrooms_count', {
              defaultValue: 'عدد الحمامات',
            }),
            value: values.bathrooms || 0,
          })}

          {renderMiniInfo({
            icon: 'people-outline',
            label: t('cleaning.workers_count', {
              defaultValue: 'عدد العاملات',
            }),
            value: values.workers_count || 1,
          })}
        </View>

        <View style={styles.summaryCard}>
          {renderBooleanLine(
            t('cleaning.deep_kitchen', {defaultValue: 'تنظيف عميق للمطبخ'}),
            values.deep_kitchen,
          )}

          {renderBooleanLine(
            t('cleaning.sanitizing', {defaultValue: 'تعقيم'}),
            values.sanitizing,
          )}

          <View style={styles.priceLine}>
            <AppText weight="bold" style={styles.priceLineLabel}>
              {t('services.price', {defaultValue: 'السعر'})}
            </AppText>

            <AppText weight="bold" style={styles.priceLineValue}>
              {details.total_price} {currency}
            </AppText>
          </View>
        </View>
      </>
    );
  };

  const renderKitchenDetails = details => {
    const values = details?.form_values || {};

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {t('cleaning.kitchen_details', {defaultValue: 'تفاصيل المطبخ'})}
        </AppText>

        <View style={styles.detailsGridCard}>
          {renderMiniInfo({
            icon: 'sparkles-outline',
            label: t('cleaning.cleaning_type', {defaultValue: 'نوع التنظيف'}),
            value: cleanValueText(values.cleaning_type),
          })}

          {renderMiniInfo({
            icon: 'restaurant-outline',
            label: t('cleaning.kitchen_size', {defaultValue: 'حجم المطبخ'}),
            value: cleanValueText(values.kitchen_size),
          })}

          {renderMiniInfo({
            icon: 'people-outline',
            label: t('cleaning.workers_count', {
              defaultValue: 'عدد العاملات',
            }),
            value: values.workers_count || 1,
          })}
        </View>

        <View style={styles.summaryCard}>
          {renderBooleanLine(
            t('cleaning.inside_cabinets', {
              defaultValue: 'تنظيف داخل الخزائن',
            }),
            values.inside_cabinets,
          )}

          {renderBooleanLine(
            t('cleaning.walls_ceiling', {
              defaultValue: 'تنظيف السقف والحوائط',
            }),
            values.walls_ceiling,
          )}

          {renderBooleanLine(
            t('cleaning.sanitizing', {defaultValue: 'تعقيم'}),
            values.sanitizing,
          )}

          <View style={styles.priceLine}>
            <AppText weight="bold" style={styles.priceLineLabel}>
              {t('services.price', {defaultValue: 'السعر'})}
            </AppText>

            <AppText weight="bold" style={styles.priceLineValue}>
              {details.total_price} {currency}
            </AppText>
          </View>
        </View>
      </>
    );
  };

  const renderBathroomDetails = details => {
    const values = details?.form_values || {};

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {t('cleaning.bathroom_cleaning', {defaultValue: 'تنظيف الحمام'})}
        </AppText>

        <View style={styles.summaryCard}>
          {renderBooleanLine(
            t('cleaning.cleaning_type', {defaultValue: 'نوع التنظيف'}),
            cleanValueText(values.bathroom_cleaning_type),
          )}

          {renderBooleanLine(
            t('cleaning.bathroom_size', {defaultValue: 'حجم الحمام'}),
            cleanValueText(values.bathroom_size),
          )}

          {renderBooleanLine(
            t('cleaning.bathroom_sanitizing', {
              defaultValue: 'تعقيم الحمام',
            }),
            values.bathroom_sanitizing,
          )}
        </View>
      </>
    );
  };

  const getApplianceName = key => {
    const names = {
      fridge: 'الثلاجة',
      dishwasher: 'غسالة الأطباق',
      oven: 'الفرن',
      electric_oven: 'الفرن الكهربائي',
      microwave: 'الميكروويف',
      hood: 'الشفاط',
    };

    return names[key] || key;
  };

  const renderAppliances = parentService => {
    const details = parentService?.details || {};
    const appliances = details?.appliances || {};
    const entries = Object.entries(appliances).filter(
      ([, qty]) => Number(qty) > 0,
    );

    if (!entries.length) {
      return null;
    }

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {t('cleaning.appliances', {defaultValue: 'الأجهزة الكهربائية'})}
        </AppText>

        {entries.map(([key, qty]) => {
          const itemPrice = Number(qty) * 100;

          return (
            <View key={key} style={styles.addonCard}>
              <View style={styles.addonIcon}>
                <Ionicons name="cube-outline" size={20} color="#3296D9" />
              </View>

              <View style={styles.addonInfo}>
                <AppText weight="bold" style={styles.addonTitle}>
                  {getApplianceName(key)}
                </AppText>

                <AppText style={styles.addonMeta}>
                  {t('services.quantity', {defaultValue: 'العدد'})}: {qty}
                </AppText>

                <AppText style={styles.addonMeta}>
                  {t('services.price', {defaultValue: 'السعر'})}: {itemPrice}{' '}
                  {currency}
                </AppText>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.deleteIconButton}
                onPress={() =>
                  openDeleteSheet({
                    type: 'cleaning_appliance',
                    parentService,
                    applianceKey: key,
                    appliancePrice: itemPrice,
                    title: getApplianceName(key),
                  })
                }>
                <Ionicons name="trash-outline" size={20} color="#FF2D2D" />
              </TouchableOpacity>
            </View>
          );
        })}
      </>
    );
  };

  const renderFurnitureItems = parentService => {
    const details = parentService?.details || {};
    const items = details?.furniture_items || [];

    if (!items.length) {
      return null;
    }

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {t('cleaning.furniture_cleaning', {
            defaultValue: 'تنظيف المفروشات',
          })}
        </AppText>

        {items.map(item => (
          <View key={String(item.service_id)} style={styles.addonCard}>
            <View style={styles.addonIcon}>
              <Ionicons name="bed-outline" size={20} color="#3296D9" />
            </View>

            <View style={styles.addonInfo}>
              <AppText weight="bold" style={styles.addonTitle}>
                {item.service_title}
              </AppText>

              {(item.summary || []).slice(0, 4).map(row => (
                <AppText
                  key={`${item.service_id}_${row.label}`}
                  style={styles.addonMeta}>
                  {row.label}: {row.value}
                </AppText>
              ))}

              <AppText weight="bold" style={styles.addonPrice}>
                {item.total} {currency}
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.deleteIconButton}
              onPress={() =>
                openDeleteSheet({
                  type: 'cleaning_furniture',
                  parentService,
                  furnitureItem: item,
                  title: item.service_title,
                })
              }>
              <Ionicons name="trash-outline" size={20} color="#FF2D2D" />
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  };

  const renderCleaningService = item => {
    const details = item.details || {};
    const type = details.type;

    return (
      <View style={styles.cleaningBlock}>
        {renderCategoryHeader(item)}

        {type === 'full_home' ? renderFullHomeDetails(details) : null}

        {type === 'kitchen_only' || type === 'kitchen_bathroom'
          ? renderKitchenDetails(details)
          : null}

        {type === 'kitchen_bathroom' ? renderBathroomDetails(details) : null}

        {renderAppliances(item)}
        {renderFurnitureItems(item)}
      </View>
    );
  };

  const renderNormalService = item => {
    const qty = Number(item.count || 1);

    return (
      <View style={styles.normalCard}>
        <View style={styles.normalIconBox}>
          <Ionicons name="construct-outline" size={22} color="#3296D9" />
        </View>

        <View style={styles.normalInfo}>
          <AppText weight="bold" style={styles.normalTitle}>
            {item.service_name}
          </AppText>

          <AppText style={styles.normalCategory}>
            {order?.order_category_name || ''}
          </AppText>

          <AppText weight="bold" style={styles.normalPrice}>
            {Number(item.price || 0)} {currency}
          </AppText>
        </View>

        <View style={styles.normalActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.qtyBox}
            onPress={() => openQtySheet(item)}>
            <AppText weight="bold" style={styles.qtyText}>
              {qty}
            </AppText>

            <Ionicons name="chevron-down-outline" size={13} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.deleteIconButton}
            onPress={() =>
              openDeleteSheet({
                type: 'whole_service',
                service: item,
                title: item.service_name,
              })
            }>
            <Ionicons name="trash-outline" size={20} color="#FF2D2D" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPreviewService = () => {
    const previewTitle = t('preview_order.preview_order', {
      defaultValue: 'طلب معاينة',
    });

    const categoryName =
      order?.order_category_name ||
      category?.name ||
      category?.name_ar ||
      '';

    return (
      <View style={styles.serviceWrap}>
        <View style={styles.previewCard}>
          <View style={styles.previewPatternOne} />
          <View style={styles.previewPatternTwo} />

          <View style={styles.previewIconBox}>
            <Ionicons name="eye-outline" size={26} color="#3296D9" />
          </View>

          <View style={styles.previewInfo}>
            <AppText weight="bold" style={styles.previewTitle}>
              {previewTitle}
            </AppText>

            <AppText style={styles.previewCategory}>{categoryName}</AppText>

            <View style={styles.previewFeatureRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#3296D9"
              />

              <AppText style={styles.previewFeatureText}>
                {t('preview_order.feature_problem_detection', {
                  defaultValue: 'تحديد دقيق للمشكلة',
                })}
              </AppText>
            </View>

            <View style={styles.previewFeatureRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#3296D9"
              />

              <AppText style={styles.previewFeatureText}>
                {t('preview_order.feature_cost_duration', {
                  defaultValue: 'ترشيح تكلفة ومدة أفضل تنفيذ',
                })}
              </AppText>
            </View>
          </View>

          <View style={styles.previewPriceBox}>
            <AppText style={styles.previewPriceLabel}>
              {t('services.price', {defaultValue: 'السعر'})}
            </AppText>

            <View style={styles.previewPriceRow}>
              <AppText weight="bold" style={styles.previewPriceValue}>
                {Number(order?.preview_cost || 0)}
              </AppText>

              <AppText style={styles.previewCurrency}>{currency}</AppText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderService = item => {
    if (item.details) {
      return (
        <View key={String(item.service_id)} style={styles.serviceWrap}>
          {renderCleaningService(item)}
        </View>
      );
    }

    return (
      <View key={String(item.service_id)} style={styles.serviceWrap}>
        {renderNormalService(item)}
      </View>
    );
  };

  const renderDeleteSheet = () => {
    return (
      <Modal
        visible={deleteSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDeleteSheet}>
        <Pressable style={styles.sheetOverlay} onPress={closeDeleteSheet}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.sheetTitle}>
              {t('services.delete_service', {defaultValue: 'حذف الخدمة'})}
            </AppText>

            <AppText style={styles.sheetMessage}>
              {t('services.delete_service_confirm', {
                defaultValue: `هل أنت متأكد من حذف ${
                  selectedDeleteItem?.title || 'هذه الخدمة'
                }؟`,
              })}
            </AppText>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sheetDeleteButton}
                onPress={confirmDelete}>
                <AppText weight="bold" style={styles.sheetDeleteText}>
                  {t('common.delete', {defaultValue: 'حذف'})}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sheetCancelButton}
                onPress={closeDeleteSheet}>
                <AppText weight="bold" style={styles.sheetCancelText}>
                  {t('common.cancel', {defaultValue: 'إلغاء'})}
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderQtySheet = () => {
    const currentQty = Number(selectedQtyItem?.count || 1);

    return (
      <Modal
        visible={qtySheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeQtySheet}>
        <Pressable style={styles.sheetOverlay} onPress={closeQtySheet}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.sheetTitle}>
              {t('services.choose_quantity', {
                defaultValue: 'اختر العدد',
              })}
            </AppText>

            <View style={styles.qtyGrid}>
              {Array.from({length: 10}, (_, index) => index + 1).map(num => {
                const active = currentQty === num;

                return (
                  <TouchableOpacity
                    key={String(num)}
                    activeOpacity={0.85}
                    style={[styles.qtyChip, active && styles.qtyChipActive]}
                    onPress={() => updateNormalServiceQty(num)}>
                    <AppText
                      weight={active ? 'bold' : 'regular'}
                      style={[
                        styles.qtyChipText,
                        active && styles.qtyChipTextActive,
                      ]}>
                      {num}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.removeFromQtyButton}
              onPress={() => updateNormalServiceQty(0)}>
              <Ionicons name="trash-outline" size={18} color="#FF2D2D" />

              <AppText weight="bold" style={styles.removeFromQtyText}>
                {t('services.cancel_service', {
                  defaultValue: 'إلغاء الخدمة',
                })}
              </AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderNotesSection = () => {
    if (reviewItemsCount <= 0) {
      return null;
    }

    return (
     <View style={styles.notesSection}>
  <AppText weight="bold" style={styles.notesTitle}>
    {t('serviorder_view_detailsces.tell_technician_details', {
      defaultValue: 'Would you like to tell the technician any details?',
    })}
  </AppText>

  <TextInput
    value={orderNotes}
    onChangeText={updateOrderNotes}
    placeholder={t('order_view_details.your_notes', {
      defaultValue: 'Your notes',
    })}
    placeholderTextColor="#9A9A9A"
    multiline
    textAlignVertical="top"
    style={[
      styles.notesInput,
      {
        textAlign: isRTL ? 'right' : 'left',
      },
    ]}
  />
</View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={t('services.review_services', {
            defaultValue: 'مراجعة الطلب',
          })}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {isPreviewOrder ? (
            renderPreviewService()
          ) : services.length > 0 ? (
            services.map(renderService)
          ) : (
            <View style={styles.emptyWrap}>
              <AppText style={styles.emptyText}>
                {t('services.no_services_selected', {
                  defaultValue: 'لم تقم باختيار أي خدمات بعد',
                })}
              </AppText>
            </View>
          )}

          {renderNotesSection()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <AppText weight="bold" style={styles.totalLabel}>
              {t('order_view_details.total', {defaultValue: 'الإجمالي'})}
            </AppText>

            <AppText weight="bold" style={styles.totalValue}>
              {totalPrice}
            </AppText>

            <AppText style={styles.totalCurrency}>{currency}</AppText>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.completeButton,
              reviewItemsCount <= 0 && styles.completeButtonDisabled,
            ]}
            disabled={reviewItemsCount <= 0}
            onPress={completeOrder}>
            <AppText weight="bold" style={styles.completeText}>
              {t('order_view_details.finish_order', {defaultValue: 'إكمال الطلب'})}
            </AppText>
          </TouchableOpacity>
        </View>

        {!isPreviewOrder ? renderDeleteSheet() : null}
        {!isPreviewOrder ? renderQtySheet() : null}
      </View>
    </SafeAreaView>
  );
};

export default OrderReviewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  serviceWrap: {
    marginTop: 12,
  },

  normalCard: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F8F8F8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  normalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DFF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  normalTitle: {
    fontSize: 14,
    color: '#111',
    textAlign: 'auto',
  },
  normalCategory: {
    marginTop: 5,
    fontSize: 11,
    color: '#8A8A8A',
    textAlign: 'auto',
  },
  normalPrice: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
  },
  normalActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBox: {
    minWidth: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qtyText: {
    fontSize: 13,
    color: '#111',
    marginEnd: 3,
  },

  previewCard: {
    minHeight: 132,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7EAF5',
    backgroundColor: '#EAF6FE',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewPatternOne: {
    position: 'absolute',
    width: 130,
    height: 80,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.42)',
    top: -24,
    start: -36,
    transform: [{rotate: '25deg'}],
  },
  previewPatternTwo: {
    position: 'absolute',
    width: 160,
    height: 80,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
    bottom: -32,
    end: 20,
    transform: [{rotate: '-18deg'}],
  },
  previewIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 11,
    zIndex: 2,
  },
  previewInfo: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 2,
  },
  previewTitle: {
    fontSize: 15,
    color: '#111',
    textAlign: 'auto',
  },
  previewCategory: {
    marginTop: 3,
    fontSize: 12,
    color: '#60707A',
    textAlign: 'auto',
  },
  previewFeatureRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewFeatureText: {
    flex: 1,
    fontSize: 11.5,
    color: '#60707A',
    marginStart: 4,
    textAlign: 'auto',
  },
  previewPriceBox: {
    minWidth: 72,
    alignItems: 'flex-end',
    zIndex: 2,
  },
  previewPriceLabel: {
    fontSize: 11,
    color: '#60707A',
    marginBottom: 3,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  previewPriceValue: {
    fontSize: 22,
    color: '#111',
    lineHeight: 27,
  },
  previewCurrency: {
    fontSize: 11,
    color: '#60707A',
    marginStart: 3,
    marginBottom: 3,
  },

  cleaningBlock: {},
  cleaningTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  cleaningHeaderImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    resizeMode: 'cover',
  },
  cleaningHeaderImagePlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#EAF6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleaningHeaderText: {
    flex: 1,
    marginStart: 10,
    alignItems: 'flex-start',
  },
  cleaningParentText: {
    fontSize: 11,
    color: '#9A9A9A',
    textAlign: 'auto',
  },
  cleaningHeaderTitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
  },

  sectionTitle: {
    fontSize: 14,
    color: '#111',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'auto',
  },
  detailsGridCard: {
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniInfoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTextWrap: {
    flex: 1,
    marginStart: 8,
    alignItems: 'flex-start',
  },
  miniLabel: {
    fontSize: 11,
    color: '#8A8A8A',
    textAlign: 'auto',
  },
  miniValue: {
    marginTop: 3,
    fontSize: 13,
    color: '#111',
    textAlign: 'auto',
  },

  summaryCard: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
  },
  booleanLine: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  booleanLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#777',
    textAlign: 'auto',
  },
  booleanValue: {
    fontSize: 12.5,
    color: '#111',
    marginStart: 10,
  },
  priceLine: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLineLabel: {
    fontSize: 13,
    color: '#111',
  },
  priceLineValue: {
    fontSize: 13,
    color: '#111',
  },

  addonCard: {
    minHeight: 92,
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addonIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DFF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonInfo: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'flex-start',
  },
  addonTitle: {
    fontSize: 13.5,
    color: '#111',
    textAlign: 'auto',
  },
  addonMeta: {
    marginTop: 4,
    fontSize: 11.5,
    color: '#777',
    textAlign: 'auto',
  },
  addonPrice: {
    marginTop: 5,
    fontSize: 12,
    color: '#111',
  },
  deleteIconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
  },

  footer: {
    position: 'absolute',
    start: 16,
    end: 16,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  totalRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  totalCurrency: {
    fontSize: 12,
    color: '#555',
    marginEnd: 3,
  },
  totalValue: {
    fontSize: 21,
    color: '#111',
  },
  totalLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    textAlign: 'auto',
  },
  completeButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#C8DEEA',
  },
  completeText: {
    fontSize: 15,
    color: '#FFFFFF',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopStartRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#CFCFCF',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  sheetMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetDeleteButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F71919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDeleteText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  sheetCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    color: '#3296D9',
  },

  qtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  qtyChip: {
    width: 52,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyChipActive: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FE',
  },
  qtyChipText: {
    fontSize: 14,
    color: '#111',
  },
  qtyChipTextActive: {
    color: '#157FC2',
  },
  removeFromQtyButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#FFF1F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFromQtyText: {
    fontSize: 14,
    color: '#FF2D2D',
    marginStart: 6,
  },
  notesSection: {
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 106,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 13,
    color: '#111111',
    lineHeight: 21,
  },
});