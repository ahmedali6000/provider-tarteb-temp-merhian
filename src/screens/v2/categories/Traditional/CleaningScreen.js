import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  I18nManager,
  TextInput,
  Switch,
  Modal,
  Pressable,
  BackHandler,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import useAppFont from '../../../../hooks/useAppFont';
import {getCleaningConfig} from '../../../../services/cleaningService';
import {Add_Service_To_Order} from '../../../../redux/actions/authActionCreator';

const CleaningScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();
  const isRTL = I18nManager.isRTL;
  const dispatch = useDispatch();

  const order = useSelector(state => state.order);
  const selectedServices = order?.order_services || [];
  const selectedServicesRef = useRef(selectedServices);

  const category = route?.params?.category;
  const mainCategory = route?.params?.mainCategory || category;
  const categoryId = category?.id;


  const getCleaningServiceIdFromType = useCallback(
  type => `cleaning_${type || categoryId}_${categoryId}`,
  [categoryId],
);

const savedCleaningService = useMemo(() => {
  if (!categoryId || !cleaning?.type) {
    return null;
  }

  const serviceId = getCleaningServiceIdFromType(cleaning.type);

  return selectedServices.find(
    item => String(item.service_id) === String(serviceId),
  );
}, [categoryId, cleaning?.type, selectedServices, getCleaningServiceIdFromType]);


  const [loading, setLoading] = useState(true);
  const [apiCategory, setApiCategory] = useState(null);
  const [cleaning, setCleaning] = useState(null);
  const [config, setConfig] = useState(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [appliancesValues, setAppliancesValues] = useState({});
  const [furnitureItems, setFurnitureItems] = useState([]);

  const [selectedFurnitureService, setSelectedFurnitureService] = useState(null);
  const [furnitureModalVisible, setFurnitureModalVisible] = useState(false);
  const [furnitureFieldValues, setFurnitureFieldValues] = useState({});

  const [hasCleaningInteraction, setHasCleaningInteraction] = useState(false);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    selectedServicesRef.current = selectedServices;
  }, [selectedServices]);

  const tr = useCallback(
    (key, fallback) => t(key, {defaultValue: fallback}),
    [t],
  );

  const title =
    cleaning?.name ||
    apiCategory?.name ||
    category?.name ||
    category?.name_ar ||
    tr('cleaning.title', 'تنظيف');

  const steps = config?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const isLastStep = currentStepIndex >= steps.length - 1;

  const currency = config?.currency || tr('services.currency', 'ج.م');

  const getLabel = useCallback(item => {
    if (!item) {
      return '';
    }

    return I18nManager.isRTL
      ? item.label_ar ||
          item.title_ar ||
          item.name_ar ||
          item.label_en ||
          item.title_en ||
          ''
      : item.label_en ||
          item.title_en ||
          item.name_en ||
          item.label_ar ||
          item.title_ar ||
          '';
  }, []);

  const getTitle = useCallback(item => {
    if (!item) {
      return '';
    }

    return I18nManager.isRTL
      ? item.title_ar ||
          item.label_ar ||
          item.name_ar ||
          item.title_en ||
          item.label_en ||
          ''
      : item.title_en ||
          item.label_en ||
          item.name_en ||
          item.title_ar ||
          item.label_ar ||
          '';
  }, []);

  const getUnit = useCallback(
    item => {
      if (!item) {
        return '';
      }

      return isRTL
        ? item.unit_ar || item.unit_en || ''
        : item.unit_en || item.unit_ar || '';
    },
    [isRTL],
  );

  const getCleaningServiceId = useCallback(() => {
    return `cleaning_${cleaning?.type || categoryId}_${categoryId}`;
  }, [cleaning?.type, categoryId]);

  const markCleaningInteraction = useCallback(() => {
    setHasCleaningInteraction(true);
  }, []);

  const getDefaultFormValues = useCallback(cleaningConfig => {
    const nextValues = {};
    const nextAppliances = {};

    (cleaningConfig?.steps || []).forEach(step => {
      (step?.fields || []).forEach(field => {
        if (field.type === 'segmented') {
          nextValues[field.key] = field.default || field.options?.[0]?.value;
        } else if (field.type === 'counter') {
          nextValues[field.key] = Number(field.default || field.min || 0);
        } else if (field.type === 'slider') {
          nextValues[field.key] = Number(field.default || field.min || 0);
        } else if (field.type === 'switch') {
          nextValues[field.key] = Boolean(field.default);
        } else if (field.type === 'textarea') {
          nextValues[field.key] = field.default || '';
        }
      });
    });

    (cleaningConfig?.appliances || []).forEach(item => {
      nextAppliances[item.id] = Number(item.default_quantity || 0);
    });

    return {
      values: nextValues,
      appliances: nextAppliances,
    };
  }, []);

  const fetchConfig = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getCleaningConfig(categoryId);
      const cleaningData = response?.cleaning || null;
      const cleaningConfig = cleaningData?.config || null;

      const defaults = getDefaultFormValues(cleaningConfig);

      setApiCategory(response?.category || null);
      setCleaning(cleaningData);
      setConfig(cleaningConfig);
     
      
      const serviceId = `cleaning_${cleaningData?.type || categoryId}_${categoryId}`;

        const savedService = selectedServicesRef.current.find(
        item => String(item.service_id) === String(serviceId),
        );

        const savedDetails = savedService?.details || null;

        setFormValues(savedDetails?.form_values || defaults.values);
        setAppliancesValues(savedDetails?.appliances || defaults.appliances);
        setFurnitureItems(savedDetails?.furniture_items || []);


      setCurrentStepIndex(0);
      setHasCleaningInteraction(false);
      hasHydratedRef.current = true;
    } catch (error) {
      console.log(
        'CLEANING CONFIG ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId, getDefaultFormValues]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateValue = (key, value) => {
    markCleaningInteraction();

    setFormValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateApplianceQty = (id, qty) => {
    markCleaningInteraction();

    setAppliancesValues(prev => ({
      ...prev,
      [id]: Math.max(0, qty),
    }));
  };

  const selectedOptionPrice = field => {
    const value = formValues[field.key];
    const option = field?.options?.find(
      item => String(item.value) === String(value),
    );

    return Number(option?.price || 0);
  };

  const calculateFieldPrice = useCallback(
    field => {
      if (!field) {
        return 0;
      }

      if (field.type === 'segmented') {
        return selectedOptionPrice(field);
      }

      if (field.type === 'switch') {
        return formValues[field.key] ? Number(field.price || 0) : 0;
      }

      if (field.type === 'counter' || field.type === 'slider') {
        const value = Number(formValues[field.key] || 0);
        const included = Number(field.included || 0);
        const extraUnitPrice = Number(field.extra_unit_price || 0);

        if (extraUnitPrice <= 0 || value <= included) {
          return 0;
        }

        return (value - included) * extraUnitPrice;
      }

      return 0;
    },
    [formValues],
  );

  const appliancesTotal = useMemo(() => {
    return (config?.appliances || []).reduce((total, item) => {
      const qty = Number(appliancesValues[item.id] || 0);
      return total + qty * Number(item.price_per_unit || 0);
    }, 0);
  }, [config?.appliances, appliancesValues]);

  const furnitureTotal = useMemo(() => {
    return furnitureItems.reduce((total, item) => {
      return total + Number(item.total || 0);
    }, 0);
  }, [furnitureItems]);

  const totalPrice = useMemo(() => {
    let total = Number(config?.base_price || 0);

    (config?.steps || []).forEach(step => {
      (step?.fields || []).forEach(field => {
        total += calculateFieldPrice(field);
      });
    });

    total += appliancesTotal;
    total += furnitureTotal;

    return total;
  }, [config, calculateFieldPrice, appliancesTotal, furnitureTotal]);

  const cleaningDetails = useMemo(() => {
    return {
      type: cleaning?.type,
      category_id: categoryId,
      category_name: title,
      form_values: formValues,
      appliances: appliancesValues,
      furniture_items: furnitureItems,
      total_price: totalPrice,
    };
  }, [
    cleaning?.type,
    categoryId,
    title,
    formValues,
    appliancesValues,
    furnitureItems,
    totalPrice,
  ]);

  const syncCleaningWithRedux = useCallback(() => {
    if (!cleaning || !config || !categoryId) {
      return;
    }

    const serviceId = getCleaningServiceId();
    const serviceName = title;

    dispatch(
      Add_Service_To_Order(
        categoryId,
        title,
        serviceId,
        serviceName,
        totalPrice,
        1,
        selectedServicesRef.current,
        'positive',
        mainCategory?.id,
        mainCategory?.name || mainCategory?.name_ar,
        cleaningDetails,
      ),
    );
  }, [
    cleaning,
    config,
    categoryId,
    title,
    totalPrice,
    dispatch,
    mainCategory,
    cleaningDetails,
    getCleaningServiceId,
  ]);

  useEffect(() => {
    if (
      !hasHydratedRef.current ||
      !hasCleaningInteraction ||
      loading ||
      !cleaning ||
      !config
    ) {
      return;
    }

    const timer = setTimeout(() => {
      syncCleaningWithRedux();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    hasCleaningInteraction,
    loading,
    cleaning,
    config,
    formValues,
    appliancesValues,
    furnitureItems,
    totalPrice,
    syncCleaningWithRedux,
  ]);

  const progressText = `${Math.min(currentStepIndex + 1, steps.length)}/${
    steps.length || 1
  }`;

  const canGoNext = steps.length > 0 && currentStepIndex < steps.length - 1;

  const goNext = () => {
    if (canGoNext) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

    const goBackStep = useCallback(() => {
    if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => Math.max(0, prev - 1));
        return true;
    }

    navigation.goBack();
    return true;
    }, [currentStepIndex, navigation]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
            goBackStep();
            return true;
            };

            const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress,
            );

            return () => subscription.remove();
        }, [goBackStep]),
        );

  const getFurnitureDefaultValues = service => {
    const values = {};

    (service?.fields || []).forEach(field => {
      if (field.type === 'segmented') {
        values[field.key] = field.default || field.options?.[0]?.value;
      }

      if (field.type === 'counter') {
        values[field.key] = Number(field.default || field.min || 1);
      }

      if (field.type === 'slider') {
        values[field.key] = Number(field.default || field.min || 1);
      }

      if (field.type === 'checkbox' || field.type === 'switch') {
        values[field.key] = Boolean(field.default);
      }
    });

    return values;
  };

  const updateFurnitureField = (key, value) => {
    setFurnitureFieldValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFurnitureOptionLabel = (field, value) => {
    const option = (field?.options || []).find(
      item => String(item.value) === String(value),
    );

    return getLabel(option);
  };

  const calculateFurnitureFieldPrice = (field, values) => {
    if (!field) {
      return 0;
    }

    if (field.type === 'segmented') {
      const value = values[field.key];
      const option = (field.options || []).find(
        item => String(item.value) === String(value),
      );

      return Number(option?.price || 0);
    }

    if (field.type === 'counter' || field.type === 'slider') {
      const value = Number(values[field.key] || 0);
      return value * Number(field.price_per_unit || 0);
    }

    if (field.type === 'checkbox' || field.type === 'switch') {
      const checked = Boolean(values[field.key]);

      if (!checked) {
        return 0;
      }

      if (field.price_per_unit_field) {
        const relatedValue = Number(values[field.price_per_unit_field] || 0);
        return relatedValue * Number(field.price_per_unit || 0);
      }

      return Number(field.price || 0);
    }

    return 0;
  };

  const calculateFurnitureTotal = (service, values) => {
    return (service?.fields || []).reduce((sum, field) => {
      return sum + calculateFurnitureFieldPrice(field, values);
    }, 0);
  };

  const getFurnitureSummary = (service, values) => {
    return (service?.fields || [])
      .map(field => {
        const value = values[field.key];

        if (field.type === 'segmented') {
          return {
            label: getLabel(field),
            value: getFurnitureOptionLabel(field, value),
          };
        }

        if (field.type === 'counter' || field.type === 'slider') {
          return {
            label: getLabel(field),
            value: `${value} ${getUnit(field)}`.trim(),
          };
        }

        if (field.type === 'checkbox' || field.type === 'switch') {
          return {
            label: getLabel(field),
            value: value ? tr('common.yes', 'نعم') : tr('common.no', 'لا'),
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const openFurnitureModal = service => {
    const defaults = getFurnitureDefaultValues(service);

    setSelectedFurnitureService(service);
    setFurnitureFieldValues(defaults);
    setFurnitureModalVisible(true);
  };

  const closeFurnitureModal = () => {
    setSelectedFurnitureService(null);
    setFurnitureFieldValues({});
    setFurnitureModalVisible(false);
  };

  const addFurnitureItem = () => {
    if (!selectedFurnitureService) {
      return;
    }

    markCleaningInteraction();

    const total = calculateFurnitureTotal(
      selectedFurnitureService,
      furnitureFieldValues,
    );

    const summary = getFurnitureSummary(
      selectedFurnitureService,
      furnitureFieldValues,
    );

    const newItem = {
      service_id: selectedFurnitureService.id,
      service_title: getTitle(selectedFurnitureService),
      values: furnitureFieldValues,
      summary,
      total,
    };

    setFurnitureItems(prev => {
      const exists = prev.find(
        item => String(item.service_id) === String(newItem.service_id),
      );

      if (exists) {
        return prev.map(item =>
          String(item.service_id) === String(newItem.service_id)
            ? newItem
            : item,
        );
      }

      return [...prev, newItem];
    });

    closeFurnitureModal();
  };

  const removeFurnitureItem = item => {
    markCleaningInteraction();

    setFurnitureItems(prev =>
      prev.filter(
        current => String(current.service_id) !== String(item.service_id),
      ),
    );
  };

  const submitOrder = () => {
    syncCleaningWithRedux();

    navigation.navigate('OrderReviewScreen', {
      category: apiCategory || category,
      cleaning_details: cleaningDetails,
    });
  };

  const renderProgress = () => {
    return (
      <View style={styles.progressWrap}>
        <AppText style={styles.progressText}>{progressText}</AppText>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  steps.length ? ((currentStepIndex + 1) / steps.length) * 100 : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderSegmented = field => {
    return (
      <View style={styles.fieldBlock}>
        <AppText weight="medium" style={styles.fieldLabel}>
          {getLabel(field)}
        </AppText>

        <View style={styles.segmentedRow}>
          {(field.options || []).map(option => {
            const active = String(formValues[field.key]) === String(option.value);

            return (
              <TouchableOpacity
                key={String(option.value)}
                activeOpacity={0.85}
                style={[styles.segmentItem, active && styles.activeSegmentItem]}
                onPress={() => updateValue(field.key, option.value)}>
                <AppText
                  weight={active ? 'bold' : 'regular'}
                  style={[
                    styles.segmentText,
                    active && styles.activeSegmentText,
                  ]}>
                  {getLabel(option)}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCounter = field => {
    const value = Number(formValues[field.key] || 0);
    const min = Number(field.min || 0);
    const max = Number(field.max || 10);

    return (
      <View style={styles.fieldBlock}>
        <AppText weight="medium" style={styles.fieldLabel}>
          {getLabel(field)}
        </AppText>

        <View style={styles.counterGrid}>
          {Array.from({length: max - min + 1}, (_, index) => min + index).map(
            num => {
              const active = value === num;

              return (
                <TouchableOpacity
                  key={String(num)}
                  activeOpacity={0.85}
                  style={[
                    styles.counterChip,
                    active && styles.activeCounterChip,
                  ]}
                  onPress={() => updateValue(field.key, num)}>
                  <AppText
                    weight={active ? 'bold' : 'regular'}
                    style={[
                      styles.counterText,
                      active && styles.activeCounterText,
                    ]}>
                    {num}
                  </AppText>
                </TouchableOpacity>
              );
            },
          )}
        </View>
      </View>
    );
  };

  const renderSliderFallback = field => {
    const value = Number(formValues[field.key] || field.default || 0);
    const min = Number(field.min || 0);
    const max = Number(field.max || 700);
    const step = Number(field.step || 10);
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

    const decrease = () => {
      updateValue(field.key, Math.max(min, value - step));
    };

    const increase = () => {
      updateValue(field.key, Math.min(max, value + step));
    };

    return (
      <View style={styles.fieldBlock}>
        <View style={styles.fieldHeaderRow}>
          <AppText weight="medium" style={styles.fieldLabel}>
            {getLabel(field)}
          </AppText>

          <AppText weight="bold" style={styles.valueText}>
            {value} {getUnit(field)}
          </AppText>
        </View>

        <View style={styles.sliderFakeRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smallRoundBtn}
            onPress={decrease}>
            <Ionicons name="remove-outline" size={18} color="#3296D9" />
          </TouchableOpacity>

          <View style={styles.fakeSliderTrack}>
            <View
              style={[
                styles.fakeSliderFill,
                {
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smallRoundBtn}
            onPress={increase}>
            <Ionicons name="add-outline" size={18} color="#3296D9" />
          </TouchableOpacity>
        </View>

        <View style={styles.minMaxRow}>
          <AppText style={styles.minMaxText}>{min}</AppText>
          <AppText style={styles.minMaxText}>{max}</AppText>
        </View>
      </View>
    );
  };

  const renderSwitch = field => {
    const value = Boolean(formValues[field.key]);

    return (
      <View style={styles.switchRow}>
        <Switch
          value={value}
          onValueChange={next => updateValue(field.key, next)}
          trackColor={{false: '#E1E1E1', true: '#9FD7F7'}}
          thumbColor={value ? '#3296D9' : '#FFFFFF'}
        />

        <AppText weight="medium" style={styles.switchLabel}>
          {getLabel(field)}
        </AppText>
      </View>
    );
  };

  const renderTextarea = field => {
    return (
      <View style={styles.fieldBlock}>
        <AppText weight="medium" style={styles.fieldLabel}>
          {getLabel(field)}
        </AppText>

        <TextInput
          value={String(formValues[field.key] || '')}
          onChangeText={text => updateValue(field.key, text)}
          placeholder={
            isRTL
              ? field.placeholder_ar || field.placeholder_en || ''
              : field.placeholder_en || field.placeholder_ar || ''
          }
          placeholderTextColor="#A0A0A0"
          multiline
          textAlignVertical="top"
          style={[
            styles.notesInput,
            {
              fontFamily,
              textAlign: 'auto',
            },
          ]}
        />
      </View>
    );
  };

  const renderAppliances = () => {
    const appliances = config?.appliances || [];

    if (!appliances.length) {
      return null;
    }

    return (
      <View style={styles.sectionCard}>
        <AppText weight="bold" style={styles.sectionTitle}>
          {tr('cleaning.appliances', 'الأجهزة الكهربائية')}
        </AppText>

        {appliances.map(item => {
          const qty = Number(appliancesValues[item.id] || 0);

          return (
            <View key={String(item.id)} style={styles.applianceRow}>
              <View style={styles.applianceIcon}>
                <Ionicons name="cube-outline" size={20} color="#3296D9" />
              </View>

              <View style={styles.applianceInfo}>
                <AppText weight="bold" style={styles.applianceTitle}>
                  {getTitle(item)}
                </AppText>

                <AppText style={styles.appliancePrice}>
                  {item.price_per_unit} {currency} / {getUnit(item)}
                </AppText>
              </View>

              <View style={styles.applianceActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.roundAction}
                  onPress={() => updateApplianceQty(item.id, qty + 1)}>
                  <Ionicons name="add-outline" size={16} color="#3296D9" />
                </TouchableOpacity>

                <AppText weight="bold" style={styles.applianceQty}>
                  {qty}
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.roundAction, qty <= 0 && styles.disabledRound]}
                  disabled={qty <= 0}
                  onPress={() => updateApplianceQty(item.id, qty - 1)}>
                  <Ionicons name="remove-outline" size={16} color="#3296D9" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderFurnitureServices = () => {
    const enabled =
      cleaning?.type === 'furniture' ||
      formValues.furniture_enabled === true ||
      currentStep?.key === 'furniture_services';

    if (!enabled) {
      return null;
    }

    const services = config?.furniture_services || [];

    const renderSelectedFurnitureCards = service => {
      const selectedForService = furnitureItems.filter(
        item => String(item.service_id) === String(service.id),
      );

      if (selectedForService.length === 0) {
        return null;
      }

      return (
        <View style={styles.inlineSelectedFurnitureWrap}>
          {selectedForService.map(item => (
            <View key={String(item.service_id)} style={styles.selectedFurnitureCard}>
              <View style={styles.selectedFurnitureIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#3296D9" />
              </View>

              <View style={styles.selectedFurnitureInfo}>
                <AppText weight="bold" style={styles.selectedFurnitureTitle}>
                  {item.service_title}
                </AppText>

                {(item.summary || []).slice(0, 4).map(row => (
                  <AppText
                    key={`${item.service_id}_${row.label}`}
                    style={styles.selectedFurnitureMeta}>
                    {row.label}: {row.value}
                  </AppText>
                ))}
              </View>

              <View style={styles.selectedFurnitureSide}>
                <AppText weight="bold" style={styles.selectedFurniturePrice}>
                  {item.total} {currency}
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => removeFurnitureItem(item)}
                  style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    };

    return (
      <View style={styles.sectionCard}>
        <AppText weight="bold" style={styles.sectionTitle}>
          {tr('cleaning.furniture_cleaning', 'تنظيف المفروشات')}
        </AppText>

        {services.map(item => (
          <View key={String(item.id)} style={styles.furnitureServiceBlock}>
            <View style={styles.furnitureServiceRow}>
              <View style={styles.furnitureIcon}>
                <Ionicons name="bed-outline" size={20} color="#3296D9" />
              </View>

              <AppText weight="bold" style={styles.furnitureServiceTitle}>
                {getTitle(item)}
              </AppText>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.outlineButton}
                onPress={() => openFurnitureModal(item)}>
                <AppText weight="medium" style={styles.outlineButtonText}>
                  {tr('cleaning.show_services', 'عرض الخدمات')}
                </AppText>
              </TouchableOpacity>
            </View>

            {renderSelectedFurnitureCards(item)}
          </View>
        ))}
      </View>
    );
  };

  const renderField = field => {
    if (field.visible_when) {
      const visibleValue = formValues[field.visible_when.field];

      if (visibleValue !== field.visible_when.value) {
        return null;
      }
    }

    if (field.type === 'segmented') {
      return <View key={field.key}>{renderSegmented(field)}</View>;
    }

    if (field.type === 'counter') {
      return <View key={field.key}>{renderCounter(field)}</View>;
    }

    if (field.type === 'slider') {
      return <View key={field.key}>{renderSliderFallback(field)}</View>;
    }

    if (field.type === 'switch') {
      return <View key={field.key}>{renderSwitch(field)}</View>;
    }

    if (field.type === 'textarea') {
      return <View key={field.key}>{renderTextarea(field)}</View>;
    }

    if (field.type === 'appliance_counters') {
      return <View key={field.key}>{renderAppliances()}</View>;
    }

    if (field.type === 'furniture_services') {
      return <View key={field.key}>{renderFurnitureServices()}</View>;
    }

    return null;
  };

  const renderBottomButtonText = () => {
    if (!isLastStep) {
      return tr('cleaning.next', 'الإضافات');
    }

    return tr('services.review_services', 'مراجعة الطلب');
  };

  const handleBottomPress = () => {
    if (!isLastStep) {
      goNext();
      return;
    }

    submitOrder();
  };

  const renderFurnitureSegmentedField = field => {
    return (
      <View key={field.key} style={styles.fieldBlock}>
        <AppText weight="medium" style={styles.fieldLabel}>
          {getLabel(field)}
        </AppText>

        <View style={styles.segmentedRow}>
          {(field.options || []).map(option => {
            const active =
              String(furnitureFieldValues[field.key]) === String(option.value);

            return (
              <TouchableOpacity
                key={String(option.value)}
                activeOpacity={0.85}
                style={[styles.segmentItem, active && styles.activeSegmentItem]}
                onPress={() => updateFurnitureField(field.key, option.value)}>
                <AppText
                  weight={active ? 'bold' : 'regular'}
                  style={[
                    styles.segmentText,
                    active && styles.activeSegmentText,
                  ]}>
                  {getLabel(option)}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFurnitureCounterField = field => {
    const value = Number(furnitureFieldValues[field.key] || 0);
    const min = Number(field.min || 1);
    const max = Number(field.max || 10);

    return (
      <View key={field.key} style={styles.fieldBlock}>
        <AppText weight="medium" style={styles.fieldLabel}>
          {getLabel(field)}
        </AppText>

        <View style={styles.counterGrid}>
          {Array.from({length: max - min + 1}, (_, index) => min + index).map(
            num => {
              const active = value === num;

              return (
                <TouchableOpacity
                  key={String(num)}
                  activeOpacity={0.85}
                  style={[
                    styles.counterChip,
                    active && styles.activeCounterChip,
                  ]}
                  onPress={() => updateFurnitureField(field.key, num)}>
                  <AppText
                    weight={active ? 'bold' : 'regular'}
                    style={[
                      styles.counterText,
                      active && styles.activeCounterText,
                    ]}>
                    {num}
                  </AppText>
                </TouchableOpacity>
              );
            },
          )}
        </View>
      </View>
    );
  };

  const renderFurnitureSliderField = field => {
    const value = Number(furnitureFieldValues[field.key] || field.default || 0);
    const min = Number(field.min || 1);
    const max = Number(field.max || 50);
    const step = Number(field.step || 1);
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

    return (
      <View key={field.key} style={styles.fieldBlock}>
        <View style={styles.fieldHeaderRow}>
          <AppText weight="medium" style={styles.fieldLabel}>
            {getLabel(field)}
          </AppText>

          <AppText weight="bold" style={styles.valueText}>
            {value} {getUnit(field)}
          </AppText>
        </View>

        <View style={styles.sliderFakeRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smallRoundBtn}
            onPress={() =>
              updateFurnitureField(field.key, Math.max(min, value - step))
            }>
            <Ionicons name="remove-outline" size={18} color="#3296D9" />
          </TouchableOpacity>

          <View style={styles.fakeSliderTrack}>
            <View
              style={[
                styles.fakeSliderFill,
                {
                  width: `${Math.max(0, Math.min(100, percent))}%`,
                },
              ]}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smallRoundBtn}
            onPress={() =>
              updateFurnitureField(field.key, Math.min(max, value + step))
            }>
            <Ionicons name="add-outline" size={18} color="#3296D9" />
          </TouchableOpacity>
        </View>

        <View style={styles.minMaxRow}>
          <AppText style={styles.minMaxText}>
            {min}
            {getUnit(field)}
          </AppText>

          <AppText style={styles.minMaxText}>
            {max}
            {getUnit(field)}
          </AppText>
        </View>
      </View>
    );
  };

  const renderFurnitureCheckboxField = field => {
    const checked = Boolean(furnitureFieldValues[field.key]);

    return (
      <TouchableOpacity
        key={field.key}
        activeOpacity={0.85}
        style={styles.checkboxRow}
        onPress={() => updateFurnitureField(field.key, !checked)}>
        <View style={[styles.checkboxBox, checked && styles.checkboxBoxActive]}>
          {checked ? (
            <Ionicons name="checkmark-outline" size={14} color="#FFFFFF" />
          ) : null}
        </View>

        <AppText weight="medium" style={styles.checkboxLabel}>
          {getLabel(field)}
        </AppText>
      </TouchableOpacity>
    );
  };

  const renderFurnitureField = field => {
    if (field.type === 'segmented') {
      return renderFurnitureSegmentedField(field);
    }

    if (field.type === 'counter') {
      return renderFurnitureCounterField(field);
    }

    if (field.type === 'slider') {
      return renderFurnitureSliderField(field);
    }

    if (field.type === 'checkbox' || field.type === 'switch') {
      return renderFurnitureCheckboxField(field);
    }

    return null;
  };

  const renderFurnitureModal = () => {
    if (!selectedFurnitureService) {
      return null;
    }

    const modalTotal = calculateFurnitureTotal(
      selectedFurnitureService,
      furnitureFieldValues,
    );

    return (
      <Modal
        visible={furnitureModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFurnitureModal}>
        <Pressable style={styles.modalOverlay} onPress={closeFurnitureModal}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <AppText weight="bold" style={styles.modalTitle}>
              {getTitle(selectedFurnitureService)}
            </AppText>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}>
              {(selectedFurnitureService.fields || []).map(renderFurnitureField)}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.modalAddButton}
              onPress={addFurnitureItem}>
              <Ionicons name="add-outline" size={18} color="#FFFFFF" />

              <AppText weight="bold" style={styles.modalAddText}>
                {tr('cleaning.add', 'إضافة')}
              </AppText>

              <View style={styles.modalPriceBox}>
                <AppText weight="bold" style={styles.modalPriceText}>
                  {modalTotal} {currency}
                </AppText>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#3296D9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!config || !currentStep) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppHeader title={title} onBack={() => navigation.goBack()} />

          <View style={styles.emptyWrap}>
            <AppText style={styles.emptyText}>
              {tr(
                'cleaning.config_not_available',
                'إعدادات الخدمة غير متاحة حاليًا',
              )}
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader title={title} onBack={goBackStep} />

        {renderProgress()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.stepHeader}>
            <AppText weight="bold" style={styles.stepTitle}>
              {getTitle(currentStep)}
            </AppText>
          </View>

          {(currentStep.fields || []).map(renderField)}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.bottomBar}
          onPress={handleBottomPress}>
          <View style={styles.bottomAction}>
            <Ionicons
              name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
              size={18}
              color="#FFFFFF"
            />

            <AppText weight="bold" style={styles.bottomActionText}>
              {renderBottomButtonText()}
            </AppText>
          </View>

          <View style={styles.bottomPrice}>
            <AppText style={styles.bottomCurrency}>{currency}</AppText>

            <AppText weight="bold" style={styles.bottomPriceText}>
              {totalPrice}
            </AppText>
          </View>
        </TouchableOpacity>

        {renderFurnitureModal()}
      </View>
    </SafeAreaView>
  );
};

export default CleaningScreen;

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
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
  },
  progressWrap: {
    marginTop: 10,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 6,
    textAlign: 'left',
  },
  progressTrack: {
    height: 5,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#F7931E',
  },
  scrollContent: {
    paddingBottom: 95,
  },
  stepHeader: {
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 15,
    color: '#111111',
    textAlign: 'auto',
  },
  sectionCard: {
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    color: '#111111',
    marginBottom: 10,
    textAlign: 'auto',
  },
  fieldBlock: {
    marginTop: 14,
    paddingHorizontal:18
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#111111',
    marginBottom: 10,
    textAlign: 'auto',
  },
  valueText: {
    fontSize: 13,
    color: '#3296D9',
    marginBottom: 10,
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentItem: {
    minHeight: 42,
    minWidth: 94,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  activeSegmentItem: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FE',
  },
  segmentText: {
    fontSize: 13,
    color: '#1F1F1F',
  },
  activeSegmentText: {
    color: '#157FC2',
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  counterChip: {
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activeCounterChip: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FE',
  },
  counterText: {
    fontSize: 13,
    color: '#1F1F1F',
  },
  activeCounterText: {
    color: '#157FC2',
  },
  sliderFakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fakeSliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  fakeSliderFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#3296D9',
  },
  smallRoundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minMaxRow: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  minMaxText: {
    fontSize: 11,
    color: '#999999',
  },
  switchRow: {
    marginTop: 12,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
    textAlign: 'auto',
    marginStart: 10,
  },
  notesInput: {
    minHeight: 110,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111111',
  },
  applianceRow: {
    minHeight: 58,
    borderRadius: 13,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  applianceIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#DFF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applianceInfo: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: 10,
  },
  applianceTitle: {
    fontSize: 13,
    color: '#111111',
    textAlign: 'auto',
  },
  appliancePrice: {
    marginTop: 3,
    fontSize: 11,
    color: '#888888',
    textAlign: 'auto',
  },
  applianceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundAction: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#EAF6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledRound: {
    opacity: 0.45,
  },
  applianceQty: {
    width: 28,
    textAlign: 'center',
    fontSize: 14,
    color: '#111111',
  },
  furnitureServiceBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 8,
    marginBottom: 4,
  },
  furnitureServiceRow: {
    minHeight: 58,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  furnitureIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#DFF1FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  furnitureServiceTitle: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
    textAlign: 'auto',
    marginHorizontal: 10,
  },
  outlineButton: {
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  outlineButtonText: {
    fontSize: 11.5,
    color: '#3296D9',
  },
  inlineSelectedFurnitureWrap: {
    marginStart: 48,
    marginBottom: 4,
  },
  selectedFurnitureCard: {
    minHeight: 72,
    borderRadius: 13,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFurnitureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFurnitureInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  selectedFurnitureTitle: {
    fontSize: 13,
    color: '#111111',
    textAlign: 'auto',
  },
  selectedFurnitureMeta: {
    marginTop: 4,
    fontSize: 11.5,
    color: '#777777',
    textAlign: 'auto',
  },
  selectedFurnitureSide: {
    alignItems: 'flex-end',
  },
  selectedFurniturePrice: {
    fontSize: 12.5,
    color: '#3296D9',
    marginBottom: 4,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    marginTop: 12,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxActive: {
    backgroundColor: '#3296D9',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12.5,
    color: '#111111',
    textAlign: 'auto',
    marginStart: 8,
  },
  bottomBar: {
    position: 'absolute',
    start: 16,
    end: 16,
    bottom: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  bottomAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomActionText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginHorizontal: 6,
  },
  bottomPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomCurrency: {
    fontSize: 12,
    color: '#FFFFFF',
    marginEnd: 4,
  },
  bottomPriceText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopStartRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D1D1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalAddButton: {
    marginTop: 10,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  modalAddText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 6,
  },
  modalPriceBox: {
    position: 'absolute',
    start: 14,
  },
  modalPriceText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
});