import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';

const CATEGORIES = ['Costume', 'Dancewear', 'Shoes', 'Accessories', 'Other'];

export default function PostScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions Required', 'We need camera and photo library permissions to let you add photos.');
      }
    }
  };

  const pickImage = async (useCamera = false) => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 photos per post');
      return;
    }
    try {
      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, aspect: [4, 3], quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, aspect: [4, 3], quality: 0.8, allowsMultipleSelection: true,
        });
      }
      if (!result.canceled && result.assets?.length > 0) {
        const newImages = result.assets.slice(0, 5 - images.length);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index) => setImages(images.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (images.length === 0) { Alert.alert('Error', 'Please add at least one photo'); return; }
    if (!name.trim()) { Alert.alert('Error', 'Please enter an item name'); return; }
    if (!category) { Alert.alert('Error', 'Please select a category'); return; }
    if (!price.trim() || isNaN(parseFloat(price))) { Alert.alert('Error', 'Please enter a valid price'); return; }

    setLoading(true);
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const post = {
        id: Date.now().toString(),
        userId: userData?.id || 'anonymous',
        userName: userData?.name || 'Anonymous',
        userEmail: userData?.email || '',
        images: images.map(img => img.uri),
        name: name.trim(),
        category,
        description: description.trim(),
        size: size.trim(),
        price: parseFloat(price),
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      const postsString = await AsyncStorage.getItem('posts');
      const existingPosts = postsString ? JSON.parse(postsString) : [];
      await AsyncStorage.setItem('posts', JSON.stringify([post, ...existingPosts]));
      Alert.alert('Success!', 'Your item is now listed.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage(true) },
      { text: 'Choose from Library', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Listing</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Photos */}
          <Text style={styles.sectionLabel}>PHOTOS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            <View style={styles.imageRow}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={showImageOptions}>
                  <Text style={styles.addImagePlus}>+</Text>
                  <Text style={styles.addImageLabel}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          <Text style={styles.hint}>{images.length}/5 photos added</Text>

          {/* Item Name */}
          <Text style={styles.sectionLabel}>ITEM NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Blue Tutu, Pointe Shoes..."
            placeholderTextColor="#C4B5D4"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />

          {/* Category */}
          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price & Size row */}
          <View style={styles.rowInputs}>
            <View style={styles.rowInputGroup}>
              <Text style={styles.sectionLabel}>PRICE</Text>
              <View style={styles.priceWrapper}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#C4B5D4"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>
            </View>
            <View style={styles.rowInputGroup}>
              <Text style={styles.sectionLabel}>SIZE</Text>
              <TextInput
                style={styles.input}
                placeholder="S, M, 8..."
                placeholderTextColor="#C4B5D4"
                value={size}
                onChangeText={setSize}
                maxLength={20}
              />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item, condition, measurements..."
            placeholderTextColor="#C4B5D4"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Post Item</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: CREAM,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontSize: 26, color: PURPLE, fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE, letterSpacing: 0.5 },
  content: { padding: 20, paddingBottom: 50 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#aaa',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginTop: 22, marginBottom: 10,
  },
  imageScroll: { marginBottom: 6 },
  imageRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  imageWrapper: { position: 'relative' },
  image: { width: 110, height: 110, borderRadius: 12, backgroundColor: PURPLE_LIGHT },
  removeBtn: {
    position: 'absolute', top: -8, right: -8,
    backgroundColor: '#C026D3', width: 26, height: 26,
    borderRadius: 13, justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  removeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', lineHeight: 18 },
  addImageBtn: {
    width: 110, height: 110, borderRadius: 12,
    borderWidth: 2, borderColor: PURPLE, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: PURPLE_LIGHT,
  },
  addImagePlus: { fontSize: 36, color: PURPLE, fontWeight: '300' },
  addImageLabel: { fontSize: 11, color: PURPLE, marginTop: 4, fontWeight: '600' },
  hint: { fontSize: 12, color: '#C4B5D4', marginTop: 4 },
  input: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 12, fontSize: 15, borderWidth: 1.5, borderColor: BORDER, color: '#1a1a1a',
  },
  textArea: { height: 100, paddingTop: 13 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff',
  },
  categoryChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  categoryChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  categoryChipTextActive: { color: '#fff', fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: 12 },
  rowInputGroup: { flex: 1 },
  priceWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER, paddingHorizontal: 12,
  },
  pricePrefix: { fontSize: 15, color: PURPLE, fontWeight: '700', marginRight: 4 },
  priceInput: { flex: 1, fontSize: 15, color: '#1a1a1a', paddingVertical: 13 },
  submitButton: {
    backgroundColor: PURPLE, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 28,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  cancelButton: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#C4B5D4', fontSize: 15, fontWeight: '500' },
});