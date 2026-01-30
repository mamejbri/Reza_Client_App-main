import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import customParse from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParse);

/** "2025-04-15" -> "mardi 15 avr. 2025" (always FR) */
export const isoToFrDisplay = (iso: string) =>
    dayjs(iso).locale('fr').format('dddd D MMM YYYY');

/** accepts Date object or ISO -> ISO "YYYY-MM-DD" */
export const toISO = (d: string | Date) =>
    dayjs(d).format('YYYY-MM-DD');
