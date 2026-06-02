import * as ImagePicker from 'expo-image-picker';

const requestPermission = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return permission.granted;
};

export const pickSingleImage = async () => {
  const granted = await requestPermission();
  if (!granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
};

export const pickMultipleImages = async () => {
  const granted = await requestPermission();
  if (!granted) {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.85,
    selectionLimit: 4,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => asset.uri).filter(Boolean);
};
