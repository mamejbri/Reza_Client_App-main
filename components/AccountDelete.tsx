import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { requestAccountDeletion } from '../services/clients';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DeletionRequestScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Message requis', 'Veuillez écrire votre demande.');
            return;
        }

        try {
            setLoading(true);

            await requestAccountDeletion({ reason: message });

            setLoading(false);

            Alert.alert(
                'Demande envoyée',
                'Votre demande de suppression a été transmise avec succès.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            setLoading(false);
            Alert.alert('Erreur', "Impossible d'envoyer la demande.");
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-white px-5 pt-6"
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            {/* Title */}
            <Text
                className="text-xl mb-6"
                style={{ fontFamily: 'Montserrat-Bold' }}
            >
                Droit à la suppression
            </Text>

            {/* Section */}
            <Text
                className="text-lg mb-3"
                style={{ fontFamily: 'Montserrat-Bold' }}
            >
                Envoyer une demande
            </Text>

            {/* Description */}
            <Text className="text-base text-gray-600 mb-4 leading-6">
                Si vous souhaitez faire une demande concernant la suppression de votre
                compte, veuillez écrire votre message ci-dessous. Notre équipe
                examinera votre demande et vous répondra dans les plus brefs délais.
            </Text>

            <Text className="text-base text-gray-600 mb-6">
                Appuyez sur <Text style={{ fontFamily: 'Montserrat-Bold' }}>
                    « Contacter le support »
                </Text>{' '}
                pour l’envoyer.
            </Text>

            {/* Input */}
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Votre message..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="bg-gray-100 rounded-xl p-4 mb-6 text-black"
                style={{ minHeight: 120 }}
            />

            {/* Button */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="bg-gray-300 rounded-full py-4"
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text
                        className="text-center text-base"
                        style={{ fontFamily: 'Montserrat-Bold' }}
                    >
                        Contacter le support
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

export default DeletionRequestScreen;