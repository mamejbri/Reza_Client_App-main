import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { updatePassword } from '../services/auth';

type ChangePasswordModalProps = {
    visible: boolean;
    onClose: () => void;
};

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        const result = await updatePassword(currentPassword, newPassword);
        setLoading(false);

        if (result.success) {
            Alert.alert('Succès', 'Mot de passe modifié.');
            onClose();
        } else {
            Alert.alert('Erreur', result.error || 'Erreur lors de la mise à jour.');
        }
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            style={{ justifyContent: 'flex-end', margin: 0 }}
        >
            <View style={styles.modal}>
                <View className="flex gap-2">
                    <View className="flex gap-1">
                        <Text className="text-sm font-medium">Mot de passe actuel</Text>
                        <TextInput
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            className="input-base mb-4"
                            placeholderTextColor="#000" />
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-sm font-medium">Nouveau mot de passe</Text>
                        <TextInput
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            className="input-base mb-4"
                            placeholderTextColor="#000" />
                    </View>
                    <View className="flex gap-1">
                        <Text className="text-sm font-medium">Vérification nouveau mot de passe</Text>
                        <TextInput
                            secureTextEntry
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            className="input-base"
                            placeholderTextColor="#000" />
                    </View>
                </View>

                <TouchableOpacity onPress={handleSubmit} className="btn-primary mt-6">
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="btn-primary-text text-center">Enregistrer</Text>
                    )}
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
});

export default ChangePasswordModal;
