# 📱 Reza — React Native App

This is a mobile app built using **React Native**, bootstrapped with [`@react-native-community/cli`](https://github.com/react-native-community/cli), and connected to a **mock backend** via [`json-server`](https://github.com/typicode/json-server).

> ⚠️ **Note:** This app currently supports **Android only**. iOS support will be added in a future update.

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Quartium/RezaVP.git
cd RezaVP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Your Environment File
Copy the example file:

```bash
cp .env.example .env
```

Edit the `.env` file and replace the IP with your local IP:

```bash
API_BASE_URL=http://192.168.1.x:3000
```
> **This will be used as your API root in development**

## 📡 Mock Backend with JSON Server
This app uses [`json-server`](https://github.com/typicode/json-server) to simulate a backend.

```bash
npx json-server --watch db.json --port 3000
```

This will serve mock API routes like:

- `GET /users`

- `POST /users`

- `GET /users?email=...&password=...`

The server will run at:

```bash
http://localhost:3000
```

If testing on a real device, replace localhost in your .env with your local IP address (e.g., http://192.168.1.17:3000).

## 📱 Running the App

### 1. Start Metro Bundler

```bash
npx react-native start
```

### 2. Run on Android

Make sure an Android emulator or device is connected:

```bash
npx react-native run-android
```

> **You can also use Android Studio to run the app visually.**

## 💡 Dev Tips

Use `.env` for `API_BASE_URL` and never commit it — use `.env.example` instead

Restart Metro bundler after updating `.env`:

```bash
npx react-native start --reset-cache
```

**Android**:
- Press the <kbd>R</kbd> key twice for Fast Reload.
- Dev Menu accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

## 🧩 Troubleshooting

- Make sure your environment is set up: https://reactnative.dev/docs/environment-setup

- Ensure `json-server` is running before using the app

- Check that your device can access your local IP

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)

- [React Navigation](https://reactnavigation.org/)

- [JSON Server Docs](https://github.com/typicode/json-server)

- [react-native-dotenv](https://github.com/goatandsheep/react-native-dotenv)

## 👨‍💻 Author & License

Made with ❤️ by [Quartium](https://github.com/Quartium)

Licensed under the MIT License