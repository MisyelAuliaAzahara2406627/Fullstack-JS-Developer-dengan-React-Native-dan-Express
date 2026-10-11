// import component React Native
import {
  View,
  Text,
  TextInput,
  Button,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';

// import hook useState & useEffect
import React, {useState, useEffect} from 'react';

// import react native image picker
import {launchImageLibrary} from 'react-native-image-picker';

// import api
import Api from '../../services/api';

// import style
import styles from '../../styles';

// import handler error
import {handleErrors} from '../../utils/handleErrors';

export default function PostEdit({route, navigation}) {
  // get ID
  const {id} = route.params;

  // init state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState([]);

  // method fetchDetailPost
  const fetchDetailPost = async () => {
    try {
      const response = await Api.get(`/api/posts/${id}`);

      setTitle(response.data.data.title ?? '');
      setContent(response.data.data.content ?? '');
    } catch (error) {
      console.log('Error mengambil detail post:', error);
      ToastAndroid.show(
        'Gagal mengambil data post!',
        ToastAndroid.LONG,
      );
    }
  };

  // hook useEffect
  useEffect(() => {
  const fetchDetailPost = async () => {
    try {
      const response = await Api.get(`/api/posts/${id}`);

      setTitle(response.data.data.title ?? '');
      setContent(response.data.data.content ?? '');
    } catch (error) {
      console.log('Error mengambil detail post:', error);
      ToastAndroid.show(
        'Gagal mengambil data post!',
        ToastAndroid.LONG,
      );
    }
  };

  fetchDetailPost();
}, [id]);
  // method handleChoosePhoto
  const handleChoosePhoto = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        console.log('Image picker error:', response.errorMessage);
        ToastAndroid.show(
          'Gagal membuka galeri gambar!',
          ToastAndroid.LONG,
        );
        return;
      }

      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    } catch (error) {
      console.log('Error memilih gambar:', error);
      ToastAndroid.show(
        'Gagal membuka galeri gambar!',
        ToastAndroid.LONG,
      );
    }
  };

  // method updatePost
  const updatePost = async () => {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', content);

    // tambahkan gambar jika pengguna memilih gambar baru
    if (image?.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'photo.jpg',
      });
    }

    try {
      await Api.put(`/api/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      ToastAndroid.show(
        'Post Updated Successfully!',
        ToastAndroid.LONG,
      );

      navigation.navigate('PostIndex');
    } catch (error) {
      console.log('Error update post:', error);

      if (error.response?.data) {
        handleErrors(error.response.data, setErrors);
      } else {
        ToastAndroid.show(
          'Gagal memperbarui post!',
          ToastAndroid.LONG,
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

        {image?.fileName && (
          <Text>{image.fileName}</Text>
        )}

        {errors?.image && (
          <Text style={styles.error}>{errors.image}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={value => setTitle(value)}
        />

        {errors?.title && (
          <Text style={styles.error}>{errors.title}</Text>
        )}

        <TextInput
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChangeText={value => setContent(value)}
          multiline
        />

        {errors?.content && (
          <Text style={styles.error}>{errors.content}</Text>
        )}

        <TouchableOpacity
            style={styles.button}
            onPress={updatePost}>
            <Text style={styles.buttonText}>UPDATE</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}
