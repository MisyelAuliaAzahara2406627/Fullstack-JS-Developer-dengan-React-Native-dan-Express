// Import component React Native
import {
  View,
  Text,
  TextInput,
  Button,
  ToastAndroid,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

// Import hook useState
import React, {useState} from 'react';

// Import React Native Image Picker
import {launchImageLibrary} from 'react-native-image-picker';

// Import API
import Api from '../../services/api';

// Import style
import styles from '../../styles';

// Import handler error
import {handleErrors} from '../../utils/handleErrors';

export default function PostCreate({navigation}) {
  // Init state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState([]);

  // Method handleChoosePhoto
  const handleChoosePhoto = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      // Jika pengguna membatalkan pemilihan gambar
      if (response.didCancel) {
        return;
      }

      // Jika image picker mengalami error
      if (response.errorCode) {
        console.log('Image Picker Error:', response.errorMessage);

        Alert.alert(
          'Gagal Memilih Gambar',
          response.errorMessage || 'Terjadi kesalahan saat membuka galeri.',
        );
        return;
      }

      // Ambil gambar yang dipilih
      const selectedImage = response.assets?.[0];

      if (selectedImage?.uri) {
        setImage(selectedImage);
        setErrors(previousErrors => ({
          ...previousErrors,
          image: null,
        }));
      } else {
        Alert.alert('Info', 'Gambar belum berhasil dipilih.');
      }
    } catch (error) {
      console.log('Error membuka galeri:', error);
      Alert.alert('Error', 'Tidak dapat membuka galeri gambar.');
    }
  };

  // Method storePost
  const storePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Perhatian', 'Title dan Content wajib diisi.');
      return;
    }

    if (!image?.uri) {
      Alert.alert('Perhatian', 'Silakan pilih gambar terlebih dahulu.');
      return;
    }

    const formData = new FormData();

    // Append data
    formData.append('title', title);
    formData.append('content', content);

    // Append image
    formData.append('image', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || `image_${Date.now()}.jpg`,
    });

    try {
      const response = await Api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      ToastAndroid.show(
        'Post Created Successfully!',
        ToastAndroid.LONG,
      );

      navigation.navigate('PostIndex', {
        refresh: Date.now(),
      });
    } catch (error) {
      console.log(
        'Error upload post:',
        error.response?.data || error.message,
      );

      if (error.response?.data) {
        handleErrors(error.response.data, setErrors);
      } else {
        Alert.alert(
          'Upload Gagal',
          'Tidak dapat menghubungi server. Periksa koneksi dan backend.',
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.upload}>
          <Button
            title="Choose Image"
            color="gray"
            onPress={handleChoosePhoto}
          />
        </View>

        {image?.uri && (
          <Image
            source={{uri: image.uri}}
            style={{
              width: 200,
              height: 200,
              alignSelf: 'center',
              marginVertical: 10,
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        )}

        {errors?.image && (
          <Text style={styles.error}>{errors.image}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {errors?.title && (
          <Text style={styles.error}>{errors.title}</Text>
        )}

        <TextInput
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
        />

        {errors?.content && (
          <Text style={styles.error}>{errors.content}</Text>
        )}

        <View style={{padding: 10}}>
          <TouchableOpacity
            style={styles.button}
            onPress={storePost}>
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
