import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

type Props = {
    isVisible: boolean;
    onKeep: () => void;
    onCancel: () => void;
};

const CancelReservationModal = ({ isVisible, onKeep, onCancel }: Props) => {
    return (
        <Modal isVisible={isVisible} backdropOpacity={0.5}>
            <View className="bg-white rounded-2xl py-12 px-4 items-center">
                <Text className="text-center text-lg font-bold mb-6">
                    Êtes-vous sûr de vouloir annuler{'\n'}votre réservation ?
                </Text>

                <TouchableOpacity
                    className="btn-primary w-full mb-3"
                    onPress={onKeep}>
                    <Text className="btn-primary-text">Garder ma Reza</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="btn-outline w-full"
                    onPress={onCancel}>
                    <Text className="btn-outline-text">Annuler ma Reza</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default CancelReservationModal;
