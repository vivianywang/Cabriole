// Import hooks
import React, { useState, useEffect } from 'react'
import {
    Button, // Handle touch interactions
    Image, // Display types of images
    View, // Container for UI elements
    StyleSheet, // Manage visuals in an organised manner
    ActivityIndicator, // Inform user that task is in progress
    SafeAreaView, // Render content within safe boundaries
    Text, // Displaying + styling text
    FlatList // Rendering long lists of data
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Access system's UI to select media from device's library/taking photo
import * as FileSystem from 'expo-file-system'; // Provides access to local file system
import Ionicons from '@expo/vector-icons/Ionicons'; // Add vector icons

const imgDir = (FileSystem.documentDirectory || '') + 'images/';

const ensureDirExists = async () => {
	const dirInfo = await FileSystem.getInfoAsync(imgDir); 
	if (!dirInfo.exists) {
		await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
	}
};

export default function App() {
	const [uploading, setUploading] = useState(false);
	const [images, setImages] = useState<any[]>([]);

	// Load images on startup
	useEffect(() => {
		loadImages();
	}, []);

	// Load images from file system
	const loadImages = async () => {
		await ensureDirExists();
		const files = await FileSystem.readDirectoryAsync(imgDir);
		if (files.length > 0) {
			setImages(files.map((f) => imgDir + f));
		}
	};

	// Select image from library or camera
	const selectImage = async (useLibrary: boolean) => {
		let result;
		const options: ImagePicker.ImagePickerOptions = {
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.75
		};

		if (useLibrary) {
			result = await ImagePicker.launchImageLibraryAsync(options);
		} else {
			await ImagePicker.requestCameraPermissionsAsync();
			result = await ImagePicker.launchCameraAsync(options);
		}

		// Save image if not cancelled
		if (!result.canceled) {
			saveImage(result.assets[0].uri);
		}
	};

	// Save image to file system
	const saveImage = async (uri: string) => {
		await ensureDirExists();
		const filename = new Date().getTime() + '.jpeg';
		const dest = imgDir + filename;
		await FileSystem.copyAsync({ from: uri, to: dest });
		setImages([...images, dest]);
	};

	// Upload image to server
	const uploadImage = async (uri: string) => {
		setUploading(true);

		await FileSystem.uploadAsync('http://192.168.1.52:8888/upload.php', uri, {
			httpMethod: 'POST',
			uploadType: FileSystem.FileSystemUploadType.MULTIPART, 

			fieldName: 'file'
		});

		setUploading(false);
	};

	// Delete image from file system
	const deleteImage = async (uri: string) => {
		await FileSystem.deleteAsync(uri);
		setImages(images.filter((i) => i !== uri));
	};

	// Render image list item
	const renderItem = ({ item }: { item: any }) => {
		const filename = item.split('/').pop();
		return (
			<View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
				<Image style={{ width: 80, height: 80 }} source={{ uri: item }} />
				<Text style={{ flex: 1 }}>{filename}</Text>
				<Ionicons.Button name="cloud-upload" onPress={() => uploadImage(item)} />
				<Ionicons.Button name="trash" onPress={() => deleteImage(item)} />
			</View>
		);
	};

return (
	<SafeAreaView style={{ flex: 1, gap: 20 }}>
		<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 20 }}>
			<Button title="Photo Library" onPress={() => selectImage(true)} />
			<Button title="Capture Image" onPress={() => selectImage(false)} />
		</View>

		<Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '500' }}>My Images</Text>
		<FlatList data={images} renderItem={renderItem} />
		{showMetadataForm && <MetadataForm />}

		{uploading && (
			<View
				style={[
					StyleSheet.absoluteFill,
					{
						backgroundColor: 'rgba(0,0,0,0.4)',
						alignItems: 'center',
						justifyContent: 'center'
					}
				]}
			>
				<ActivityIndicator color="#fff" animating size="large" />
			</View>
		)}
	</SafeAreaView>
);
}

const [showMetadataForm, setShowMetadataForm] = useState(false);
const [currentImageUri, setCurrentImageUri] = useState('');

// Modified saveImage to show form first
const saveImageWithMetadata = async (uri: string) => {
  setCurrentImageUri(uri);
  setShowMetadataForm(true);
};

// Save with metadata
const saveImage = async (metadata: any) => {
  await ensureDirExists();
  const filename = new Date().getTime() + '.jpeg';
  const dest = imgDir + filename;
  await FileSystem.copyAsync({ from: currentImageUri, to: dest });
  
  // Save metadata alongside image (you could use AsyncStorage or a JSON file)
  const imageData = {
    uri: dest,
    ...metadata
  };
  
  setImages([...images, imageData]);
  setShowMetadataForm(false);
};

if (!result.canceled) {
  saveImageWithMetadata(result.assets[0].uri); // Changed this line
}

const MetadataForm = () => {
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add Details</Text>
        
        <TextInput
          placeholder="Price ($)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        
        <TextInput
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, { height: 80 }]}
        />
        
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {['S', 'M', 'L', 'XL'].map(s => (
            <Button
              key={s}
              title={s}
              onPress={() => setSize(s)}
              color={size === s ? '#007AFF' : '#999'}
            />
          ))}
        </View>
        
        <Button
          title="Save"
          onPress={() => saveImage({ price, tags, description, size })}
        />
        <Button title="Cancel" onPress={() => setShowMetadataForm(false)} />
      </View>
    </View>
  );
};