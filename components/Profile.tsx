// src/screens/Profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { launchImageLibrary } from 'react-native-image-picker';
import IcoMoonIcon from '../src/icons/IcoMoonIcon';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { logout } from '../services/auth';
import { clearCachedUser } from '../services/user'; // keep if you rely on it elsewhere
import { getClientProfile, updateClientPhotoBase64, updateClientProfile } from '../services/clients';
import { getToken } from '../services/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Profile: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [photoVersion, setPhotoVersion] = useState<number>(Date.now());

  const [originalFirstName, setOriginalFirstName] = useState('');
  const [originalLastName, setOriginalLastName] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');

const hydrate = useCallback(async () => {
  const token = await getToken();

  if (!token) {
    // user is logged out → wipe UI
    setEmail('');
    setPhone('');
    setFirstName('');
    setLastName('');
    setPhoto(undefined);
    return;
  }

  const user = await getClientProfile();
  if (user) {
    const normalizedPhone =
      user.phone?.startsWith('+') ? user.phone : `+${user.phone || ''}`;

    setEmail(user.email || '');
    setPhone(normalizedPhone);
    setOriginalPhone(normalizedPhone);

    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhoto(user.photo ?? undefined); // 🔴 FIXED FIELD NAME
    setPhotoVersion(Date.now());

    setOriginalFirstName(user.firstName || '');
    setOriginalLastName(user.lastName || '');
  }
}, []);


  // Load from server when this screen mounts AND when it regains focus
  useEffect(() => {
    hydrate();
    const unsub = navigation.addListener('focus', hydrate);
    return unsub;
  }, [hydrate, navigation]);

  const handleLogout = async () => {
    await logout();
    await clearCachedUser?.();
    // wipe local UI instantly
    setEmail(''); setPhone(''); setFirstName(''); setLastName(''); setPhoto(undefined);
    setEditing(false);
    Alert.alert('Déconnecté', 'Vous avez été déconnecté.');
navigation.reset({
  index: 0,
  routes: [{ name: 'Login' }],
});  };

 const handleSave = async () => {
  if (!phone.trim().startsWith('+')) {
    Alert.alert('Numéro WhatsApp invalide', 'Le numéro doit commencer par +');
    return;
  }

  if (!firstName.trim() || !lastName.trim()) {
    Alert.alert('Erreur', 'Veuillez remplir votre nom et prénom.');
    return;
  }

  setLoading(true);

  const result = await updateClientProfile({
    firstName,
    lastName,
    phone,
  });

  setLoading(false);

  if (result.success) {
    Alert.alert('Succès', 'Profil mis à jour.');
    setEditing(false);
    setOriginalFirstName(firstName);
    setOriginalLastName(lastName);
    setOriginalPhone(phone);
  } else {
    Alert.alert('Erreur', result.message);
  }
};


  const handleCancel = () => {
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setPhone(originalPhone);
    setEditing(false);
  };

 const pickImage = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.7,
      includeBase64: true,
    });

    if (!result.assets?.length) return;

    const asset = result.assets[0];

    if (!asset.base64 || !asset.type) {
      Alert.alert('Erreur', "Impossible de lire l'image.");
      return;
    }

    const base64Image = `data:${asset.type};base64,${asset.base64}`;

    setLoading(true);

    const uploadResult = await updateClientPhotoBase64(base64Image);

    setLoading(false);

    if (uploadResult.success) {
      setPhoto(uploadResult.data?.photo ?? undefined);
      setPhotoVersion(Date.now()); // 🔥 FORCE IMAGE REFRESH
      Alert.alert('Succès', 'Photo de profil mise à jour.');
    } else {
      Alert.alert('Erreur', uploadResult.message);
    }
  } catch (e) {
    console.error(e);
    Alert.alert('Erreur', 'Impossible de sélectionner une image.');
  }
};



  return (
    <View className="flex-1 bg-white pt-4 pb-8">
      <View className="flex gap-2.5 items-center mb-9">
        <TouchableOpacity onPress={pickImage}>
          {photo ? (
            <Image
              source={{ uri: `${photo}?v=${photoVersion}` }}
              className="w-[100] h-[100] rounded-full"
            />
          ) : (
            <View className="w-[100] h-[100] rounded-full bg-gray-300 items-center justify-center">
              <IcoMoonIcon name="profile" size={40} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text className="text-lg font-semibold"
          style={{ fontFamily: 'Montserrat-Bold' }}
        >
          {firstName || lastName ? `${firstName} ${lastName}` : 'Bonjour'}
        </Text>

        <TouchableOpacity onPress={pickImage} className="btn-small"
        >
          <Text className="btn-small-text"
            style={{ fontFamily: 'Montserrat-Bold' }}
          >Modifier ma photo de profil</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="flex-row gap-3 mb-3.5 items-center"
        onPress={() => { if (!editing) setEditing(true); }}
        activeOpacity={editing ? 1 : 0.7}
      >
        <Text className="text-base font-bold">Mes coordonnées</Text>
        {!editing && <IcoMoonIcon name="pen" size={20} color="#C53334" />}
      </TouchableOpacity>

      <View className="flex gap-2 mb-6">
        <View className="flex gap-1">
          <Text className="text-sm font-medium">Prénom</Text>
          <TextInput
            value={firstName} editable={editing} onChangeText={setFirstName}
            className="input-base bg-gray-100 text-black" placeholder="Votre prénom" placeholderTextColor="#000"
          />
        </View>

        <View className="flex gap-1">
          <Text className="text-sm font-medium">Nom</Text>
          <TextInput
            value={lastName} editable={editing} onChangeText={setLastName}
            className="input-base bg-gray-100 text-black" placeholder="Votre nom" placeholderTextColor="#000"
          />
        </View>

        <View className="flex gap-1">
          <Text className="text-sm font-medium">E-mail</Text>
          <TextInput value={email} editable={false} className="input-base bg-gray-100 text-black" placeholderTextColor="#000" />
        </View>

        <View className="flex gap-1">
          <Text className="text-sm font-medium">Téléphone</Text>
            <TextInput
              value={phone}
              editable={editing}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="input-base bg-gray-100 text-black"
              placeholder="+216..."
              placeholderTextColor="#000"
            />
        </View>
      </View>

      <View className="flex-column gap-3.5">
        {editing ? (
          <>
            <TouchableOpacity onPress={handleSave} className="btn-primary w-full">
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="btn-primary-text text-center">Enregistrer</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} className="btn-outline w-full">
              <Text className="btn-outline-text text-center">Annuler</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => setPasswordModalVisible(true)} className="btn-primary w-full">
              <Text className="btn-primary-text text-center">Modifier mon mot de passe</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="btn-primary w-full">
              <Text className="btn-primary-text text-center">Déconnexion</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ChangePasswordModal visible={passwordModalVisible} onClose={() => setPasswordModalVisible(false)} />
    </View>
  );
};

export default Profile;
