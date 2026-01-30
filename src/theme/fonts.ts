import { Platform, Text, TextInput } from 'react-native';

const fontFamily = Platform.select({
  ios: 'Montserrat-Regular',
  android: 'Montserrat-Regular',
});

// ⛔ TypeScript workaround
(Text as any).defaultProps = (Text as any).defaultProps || {};
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};

(Text as any).defaultProps.style = [{ fontFamily }];
(TextInput as any).defaultProps.style = [{ fontFamily }];
