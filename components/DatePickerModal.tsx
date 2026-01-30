import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onSelectDate: (dateISO: string) => void;
    selectedDate: string | null;
};

const DatePickerModal = ({ isVisible, onClose, onSelectDate, selectedDate }: Props) => {
    const generateDateOptions = () => {
        const days = [];
        const today = dayjs();

        for (let i = 0; i < 10; i++) {
            const date = today.add(i, 'day');
            const iso = date.format('YYYY-MM-DD');
            const label = i === 0
                ? `Aujourd’hui. ${date.format('D MMM')}`
                : date.format('ddd. D MMM YYYY');

            days.push({ label, iso });
        }

        return days;
    };

    return (
        <Modal isVisible={isVisible} backdropOpacity={0.5} onBackdropPress={onClose}>
            <View className="bg-white rounded-2xl py-8 px-4">
                <Text className="text-center text-lg font-bold mb-4">Disponibilité</Text>

                <ScrollView style={{ maxHeight: 92 }} className="py-4">
                    {generateDateOptions().map(({ label, iso }, index) => (
                        <TouchableOpacity
                            key={index}
                            className="my-2 items-center"
                            onPress={() => onSelectDate(iso)}
                        >
                            <Text className={`text-2xl font-semibold text-center ${selectedDate === iso ? 'text-red-500' : 'text-black'}`}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );
};

export default DatePickerModal;
