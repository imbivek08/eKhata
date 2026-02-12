import { addCustomer } from '@/database';
import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

export default function AddCustomerModal({
  visible,
  onClose,
  onCustomerAdded,
}: AddCustomerModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(t('addCustomer', 'permissionNeeded'), t('addCustomer', 'permissionMessage'));
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(t('addCustomer', 'addPhoto'), '', [
      { text: t('addCustomer', 'takePhoto'), onPress: () => pickImage(true) },
      { text: t('addCustomer', 'chooseGallery'), onPress: () => pickImage(false) },
      { text: t('common', 'cancel'), style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common', 'error'), t('addCustomer', 'nameRequired'));
      return;
    }

    setSaving(true);
    try {
      await addCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        photo_uri: photoUri || undefined,
      });
      setName('');
      setPhone('');
      setPhotoUri(null);
      onCustomerAdded();
      onClose();
    } catch (error) {
      Alert.alert(t('common', 'error'), t('addCustomer', 'failedToAdd'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setPhotoUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <MaterialIcons name="person-add" size={20} color="#fff" />
              </View>
              <Text style={styles.title}>{t('addCustomer', 'title')}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Photo */}
            <TouchableOpacity style={styles.photoButton} onPress={showImagePicker}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <MaterialIcons name="camera-alt" size={28} color="#94A3B8" />
                  <Text style={styles.photoPlaceholderLabel}>{t('addCustomer', 'addPhoto')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Name */}
            <Text style={styles.label}>{t('addCustomer', 'nameStar')}</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="person" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={t('addCustomer', 'nameInput')}
                placeholderTextColor="#CBD5E1"
                autoFocus
                editable={!saving}
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>{t('addCustomer', 'phoneOptional')}</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('addCustomer', 'phoneInput')}
                placeholderTextColor="#CBD5E1"
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{saving ? t('common', 'saving') : t('addCustomer', 'saveCustomer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#4A90D9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 16,
  },
  photoButton: {
    alignItems: 'center',
    marginVertical: 8,
  },
  photoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#4A90D9',
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoPlaceholderLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#4A90D9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
