import React from 'react';
import { View, Text } from 'react-native';

type Program = {
    title: string;
    description: string;
    price: number;
    duration_minutes: number;
};

interface Props {
    people?: number;
    program?: Program;
    date: string;
    time: string;
    moment: string;
}

const ReservationSummary: React.FC<Props> = ({ people, program, date, time, moment }) => {
    return (
        <View className="gap-4 mt-4">
            {program && (
                <View className="flex-column">
                    <Text className="text-lg font-semibold pl-3">Je réserve</Text>
                    <View className="rounded-2xl overflow-hidden bg-gray-100 shadow py-5 px-4 gap-4">
                        <Text className="text-lg font-bold">{program.title}</Text>
                        <Text className="text-lg font-medium">{program.description}</Text>
                        <Text className="text-lg">{program.price} dh · {program.duration_minutes} min</Text>
                    </View>
                </View>
            )}

            {typeof people === 'number' && (
                <View className="flex-column">
                    <Text className="text-lg font-semibold pl-3">Réservation pour</Text>
                    <View className="rounded-2xl overflow-hidden bg-gray-100 shadow">
                        <View className="py-5 px-3 gap-3">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-bold flex-grow">Nombre de personnes :</Text>
                                <View className="bg-white w-[40] h-[40] p-2 flex-row align-center justify-center">
                                    <Text className="text-xl font-bold">{people}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            <View className="flex-column">
                <Text className="text-lg font-semibold pl-3">Pour le</Text>
                <View className="rounded-2xl overflow-hidden bg-gray-100 shadow">
                    <View className="py-5 px-3 gap-3">
                        <View className="flex-row items-center justify-center gap-2">
                            <Text className="text-base font-bold">{date}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="flex-column">
                <Text className="text-lg font-semibold pl-3">À</Text>
                <View className="rounded-2xl overflow-hidden bg-gray-100 shadow">
                    <View className="py-5 px-3 gap-3">
                        <View className="flex-row items-center gap-4">
                            <View className="bg-danger rounded-2xl py-2 px-3">
                                <Text className="text-base font-semibold text-white">{moment}</Text>
                            </View>
                            <View className="bg-white rounded-2xl py-2 px-3 flex-grow flex-row items-center justify-center">
                                <Text className="text-base font-semibold">{time}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ReservationSummary;
