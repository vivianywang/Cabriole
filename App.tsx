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
    FlatList, // Rendering long lists of data
	TouchableOpacity,
	RefreshControl,
	TextInput
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([
	 {
    id: '1',
    sellerName: 'Viviona Tang',
    itemName: 'Pointe Shoes',
    lastMessage: 'Is this still available?',
    timestamp: new Date().toISOString(),
    unread: 2,
    messages: [
      { id: '1', text: 'Hi! Is this still available?', sender: 'buyer', timestamp: new Date().toISOString() },
      { id: '2', text: 'Yes it is! Would you like to meet up?', sender: 'seller', timestamp: new Date().toISOString() }
    ]
  }
]);
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

	const filteredImages = images.filter((img: any) => {
		if (!searchQuery) return true;
		return img.description?.toLowerCase().includes(searchQuery.toLowerCase());
	});


	// Render image list item
	// Add chat button to your renderItem function
	const renderItem = ({ item }: { item: any }) => {
		const filename = (item.uri || item).split('/').pop();
		return (
			<View style={{ flexDirection: 'row', margin: 1, alignItems: 'center', gap: 5 }}>
				<Image style={{ width: 80, height: 80 }} source={{ uri: item.uri || item }} />
				<Text style={{ flex: 1 }}>{filename}</Text>
				<Ionicons.Button name="chatbubbles" onPress={() => openChat(item)} />
				<Ionicons.Button name="cloud-upload" onPress={() => uploadImage(item.uri || item)} />
				<Ionicons.Button name="trash" onPress={() => deleteImage(item.uri || item)} />
			</View>
		);
	};

// Add these helper functions inside your App component
const openChat = (item: any) => {
  // Find or create chat for this item
  const existingChat = chats.find(c => c.itemName === (item.description || 'Item'));
  if (existingChat) {
    setSelectedChat(existingChat);
  } else {
    const newChat = {
      id: Date.now().toString(),
      sellerName: 'Seller',
      itemName: item.description || 'Item',
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unread: 0,
      messages: []
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
  }
  setShowChat(true);
};

const sendMessage = (chatId: string, text: string) => {
  const newMessage = {
    id: Date.now().toString(),
    text,
    sender: 'buyer', // or 'seller' depending on user
    timestamp: new Date().toISOString()
  };

  setChats(chats.map(chat => {
    if (chat.id === chatId) {
      return {
        ...chat,
        messages: [...chat.messages, newMessage],
        lastMessage: text,
        timestamp: new Date().toISOString()
      };
    }
    return chat;
  }));
};

// Chat List Component
const ChatList = () => {
  return (
    <View style={styles.chatListContainer}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderTitle}>Messages</Text>
        <TouchableOpacity onPress={() => setShowChat(false)}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatListItem}
            onPress={() => setSelectedChat(item)}
          >
            <View style={styles.chatListAvatar}>
              <Ionicons name="person-circle" size={50} color="#ccc" />
            </View>
            <View style={styles.chatListContent}>
              <View style={styles.chatListHeader}>
                <Text style={styles.chatListName}>{item.sellerName}</Text>
                <Text style={styles.chatListTime}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.chatListItem}>{item.itemName}</Text>
              <Text style={styles.chatListMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Individual Chat Component
const ChatScreen = ({ chat }: { chat: any }) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      sendMessage(chat.id, messageText);
      setMessageText('');
    }
  };

  return (
    <View style={styles.chatScreen}>
      <View style={styles.chatScreenHeader}>
        <TouchableOpacity onPress={() => setSelectedChat(null)}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.chatScreenHeaderInfo}>
          <Text style={styles.chatScreenTitle}>{chat.sellerName}</Text>
          <Text style={styles.chatScreenSubtitle}>{chat.itemName}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowChat(false)}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chat.messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'buyer' ? styles.messageBuyer : styles.messageSeller
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
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
			<TouchableOpacity
				style={styles.chatIconButton}
				onPress={() => setShowChat(true)}
			>
				<Ionicons name="chatbubbles" size={28} color="#007AFF" />
				{chats.filter(c => c.unread > 0).length > 0 && (
					<View style={styles.chatBadge}>
						<Text style={styles.chatBadgeText}>
							{chats.reduce((sum, c) => sum + c.unread, 0)}
						</Text>
					</View>
				)}
			</TouchableOpacity>
		<View style={styles.searchContainer}>
			<TextInput
				style={styles.searchInput}
				placeholder="Search clothing..."
				value={searchQuery}
				onChangeText={setSearchQuery}
			/>
		</View>
		<FlatList data={filteredImages} renderItem={renderItem} />
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
const saveImageWithDetails = async (metadata: any) => {
  await ensureDirExists();
  const filename = new Date().getTime() + '.jpeg';
  const dest = imgDir + filename;
  await FileSystem.copyAsync({ from: currentImageUri, to: dest });
  
  // Save metadata alongside image 
  const imageData = {
    uri: dest,
    ...metadata
  };
  
  setImages([...images, imageData]);
  setShowMetadataForm(false);
};

const MetadataForm = () => {
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');

  return (
    <View style={styles.modalOverlay}>
      <View style={StyleSheet.absoluteFill}>
        {selectedChat ? <ChatScreen chat={selectedChat} /> : <ChatList />}
      </View>
    </View>
    )}
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
          onPress={() => saveImageWithDetails({ price, tags, description, size })}
        />
        <Button title="Cancel" onPress={() => setShowMetadataForm(false)} />
        </View>
      </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 10
  },
  searchInput: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10
  },
  // Metadata form styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  // Chat styles
  chatListContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  chatHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  chatListItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  chatListAvatar: {
    marginRight: 12
  },
  chatListContent: {
    flex: 1
  },
  chatListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  chatListName: {
    fontSize: 16,
    fontWeight: '600'
  },
  chatListTime: {
    fontSize: 12,
    color: '#999'
  },
  chatListMessage: {
    fontSize: 14,
    color: '#666'
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#fff'
  },
  chatScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12
  },
  chatScreenHeaderInfo: {
    flex: 1
  },
  chatScreenTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  chatScreenSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  messageList: {
    flex: 1,
    padding: 15
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8
  },
  messageBuyer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF'
  },
  messageSeller: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB'
  },
  messageText: {
    fontSize: 16,
    color: '#fff'
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
    color: '#fff'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    gap: 10
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100
  },
  sendButton: {
    padding: 8
  },
  chatIconButton: {
    position: 'absolute',
    top: 20,
    right: 20
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  }
});