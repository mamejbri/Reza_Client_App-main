import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (isoDate: string) => void;
  selectedDate?: string;
  disabledDates?: string[];

  // ✅ NEW
  minDate?: Date;
  maxDate?: Date;
}


const CustomCalendarModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  disabledDates = [],
  minDate,
  maxDate,
}) => {
  const todayStr = dayjs().format('YYYY-MM-DD');

  // Map of disabled days -> react-native-calendars shape
  const disabledMap = useMemo(() => {
    return disabledDates.reduce((acc, d) => {
      acc[d] = { disabled: true, disableTouchEvent: true };
      return acc;
    }, {} as Record<string, { disabled: true; disableTouchEvent: true }>);
  }, [disabledDates]);

  // Figure out which months have at least one enabled day (in the next 365 days)
  const enabledMonths = useMemo(() => {
    const set = new Set<string>();
    const range = 365;
    const today = dayjs().startOf('day');

    for (let i = 0; i < range; i++) {
      const d = today.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
     const isOutOfRange =
        (minDateStr && d.isBefore(minDateStr, 'day')) ||
        (maxDateStr && d.isAfter(maxDateStr, 'day'));

      if (!disabledMap[key] && !isOutOfRange) {
        set.add(d.format('YYYY-MM'));
      }
    }
    return set;
  }, [disabledMap]);

  const [currentMonth, setCurrentMonth] = useState(
    dayjs(selectedDate ?? todayStr).format('YYYY-MM'),
  );
  const curMonthDayjs = dayjs(currentMonth + '-01');

  const monthKey = (d: dayjs.Dayjs) => d.format('YYYY-MM');
  const leftMonth = curMonthDayjs.subtract(1, 'month');
  const rightMonth = curMonthDayjs.add(1, 'month');
  const minDateStr = minDate ? dayjs(minDate).format('YYYY-MM-DD') : null;
  const maxDateStr = maxDate ? dayjs(maxDate).format('YYYY-MM-DD') : null;
  const disableLeft =
    (minDateStr && leftMonth.endOf('month').isBefore(minDateStr, 'day')) ||
    !enabledMonths.has(monthKey(leftMonth));

  const disableRight =
    (maxDateStr && rightMonth.startOf('month').isAfter(maxDateStr, 'day')) ||
    !enabledMonths.has(monthKey(rightMonth));


  const markedDates = useMemo(
    () => ({
      ...disabledMap,
      ...(selectedDate
        ? {
            [selectedDate]: {
              selected: true,
              selectedColor: '#000',
              selectedTextColor: '#fff',
            },
          }
        : {}),
    }),
    [disabledMap, selectedDate],
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
      backdropOpacity={0.4}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: 32,
          width: '100%',
        }}
      >
        <Calendar
          minDate={minDateStr ?? undefined}
          maxDate={maxDateStr ?? undefined}
          firstDay={1}
          enableSwipeMonths
          hideExtraDays
          monthFormat="MMMM yyyy"
          disableAllTouchEventsForDisabledDays
          markedDates={markedDates}
          disableArrowLeft={disableLeft}
          disableArrowRight={disableRight}
          onPressArrowLeft={(subtractMonth) => {
            if (disableLeft) return;
            subtractMonth();
            setCurrentMonth(monthKey(curMonthDayjs.subtract(1, 'month')));
          }}
          onPressArrowRight={(addMonth) => {
            if (disableRight) return;
            addMonth();
            setCurrentMonth(monthKey(curMonthDayjs.add(1, 'month')));
          }}
          onMonthChange={(d: { dateString?: string; year?: number; month?: number }) => {
            // TS-safe month update (some type defs mark props as optional)
            if (d?.dateString) {
              setCurrentMonth(dayjs(d.dateString).format('YYYY-MM'));
            } else if (d?.year && d?.month) {
              const ds = `${d.year}-${String(d.month).padStart(2, '0')}-01`;
              setCurrentMonth(dayjs(ds).format('YYYY-MM'));
            }
          }}
          renderArrow={(direction) => {
            const isDisabled =
              (direction === 'left' && disableLeft) ||
              (direction === 'right' && disableRight);

            return (
              <View
                className={`w-[32px] h-[32px] rounded-full justify-center items-center ${
                  isDisabled ? 'bg-[#F0F0F0]' : 'bg-[#F7F7F7]'
                }`}
              >
                <Text
                  className={`${
                    isDisabled ? 'text-[#D9D9D9]' : 'text-black'
                  } text-[16px] font-bold`}
                >
                  {direction === 'left' ? '<' : '>'}
                </Text>
              </View>
            );
          }}
          // TS note: dayComponent's "date" can be undefined in type defs; guard it.
          dayComponent={({ date, state }) => {
            if (state === 'disabled' || !date || !date.dateString) {
              return <View style={{ width: 32, height: 32, margin: 6 }} />;
            }

            const dayStr: string = date.dateString;
            const isDisabled =
            !!disabledMap[dayStr] ||
            (minDateStr && dayjs(dayStr).isBefore(minDateStr, 'day')) ||
            (maxDateStr && dayjs(dayStr).isAfter(maxDateStr, 'day'));

            const isSelected = dayStr === selectedDate;
            const isToday = dayStr === todayStr;

            let bg = '#C53334',
              txt = '#fff';
            if (isDisabled) {
              bg = '#D9D9D9';
              txt = '#fff';
            } else if (isSelected) {
              bg = '#000';
              txt = '#fff';
            } else if (isToday) {
              bg = '#F7F7F7';
              txt = '#C53334';
            }

            const pick = () => {
              if (isDisabled) return;
              onSelectDate(dayStr);
              onClose();
            };

            return (
              <TouchableOpacity
                disabled={isDisabled}
                onPress={pick}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 6,
                  marginVertical: 6,
                }}
              >
                <Text style={{ color: txt, fontSize: 16, fontWeight: '400' }}>
                  {date.day}
                </Text>
              </TouchableOpacity>
            );
          }}
          theme={{
            calendarBackground: '#ffffff',
            textMonthFontWeight: '800',
            textMonthFontSize: 20,
            textDayHeaderFontSize: 16,
            textDayHeaderFontWeight: '400',
            textDayFontSize: 16,
          }}
        />
      </View>
    </Modal>
  );
};

export default CustomCalendarModal;
