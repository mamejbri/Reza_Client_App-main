import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from './selection.json';

const IcoMoonIcon = createIconSetFromIcoMoon(
  icoMoonConfig,
  'IcoMoon',
  'icomoon.ttf'
);

export default IcoMoonIcon;