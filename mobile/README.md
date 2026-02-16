# Network App - React Native Mobile

🎉 **Your mobile app is ready to run!**

## 🚀 Quick Start

### 1. Navigate to mobile directory
``bash
cd c:\Projects\network-app\mobile
```

### 2. Start the development server
```bash
npm start
```

### 3. Run the app
**Three options:**

**A. Physical Device (Easiest)** ⭐
1. Install "Expo Go" app on your phone (App Store or Play Store)
2. Scan the QR code from terminal
3. App opens on your phone!

**B. Android Emulator**
1. Open Android Studio → Virtual Device Manager → Start emulator
2. Press `a` in terminal

**C. iOS Simulator (Mac only)**
1. Press `i` in terminal

---

## ⚙️ Important Configuration

### Update API URL

**Before running, update your computer's local IP address:**

1. Find your local IP:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Edit `src/lib/config.ts`:
   ```typescript
   const ENV = {
     API_URL: 'http://YOUR_IP_HERE:5000/api', // Replace YOUR_IP_HERE
     WS_URL: 'http://YOUR_IP_HERE:5000',
   };
   ```

   Example: If  your IP is `192.168.1.15`:
   ```typescript
   API_URL: 'http://192.168.1.15:5000/api',
   ```

**Why?** `localhost` doesn't work on mobile - it refers to the phone, not your computer!

---

## ✅ What's Working (Sprint 1 - Foundation)

- ✅ Project setup with Expo
- ✅ All dependencies installed
- ✅ Shared code copied from web (types, API, hooks)
- ✅ Authentication service with secure token storage
- ✅ Sign In screen
- ✅ Sign Up screen
- ✅ Protected navigation (auth → main app)
- ✅ Tab navigation (Feed, Profile)
- ✅ Logout functionality

---

## 📱 Testing Authentication

1. **Make sure backend is running:**
   ```bash
   cd c:\Projects\network-app\backend
   npm run dev
   ```

2. **Start mobile app:**
   ```bash
   cd c:\Projects\network-app\mobile
   npm start
   ```

3. **Test flow:**
   - App opens → Sign In screen
   - Tap "Don't have an account? Sign Up"
   - Fill in details → tap "Sign Up"
   - Should navigate to main app (Feed tab)
   - Go to Profile tab → tap "Logout"
   - Should return to Sign In screen ✅

---

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

---

## 📂 Project Structure

```
mobile/
├── App.tsx                          # Main entry point
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SigninScreen.tsx   # ✅ Done
│   │   │   └── SignupScreen.tsx   # ✅ Done
│   │   ├── feed/
│   │   │   └── FeedScreen.tsx     # Placeholder
│   │   └── profile/
│   │       └── ProfileScreen.tsx  # Placeholder
│   ├── navigation/
│   │   ├── AuthNavigator.tsx      # Auth screens
│   │   └── MainNavigator.tsx      # Main app tabs
│   ├── lib/
│   │   ├── config.ts              # API URLs
│   │   ├── apiClient.ts           # Axios instance
│   │   ├── queryClient.ts         # React Query
│   │   └── AuthContext.tsx        # Auth state
│   ├── services/
│   │   └── authService.ts         # Login/signup logic
│   ├── api/                        # ✅ Copied from web
│   ├── types/                      # ✅ Copied from web
│   └── hooks/                      # ✅ Copied from web
│       ├── queries/
│       └── mutations/
```

---

## 🐛 Troubleshooting

### Error: "Network Error" when signing in
- Check backend is running (`npm run dev` in backend folder)
- Update IP address in `src/lib/config.ts`
- Make sure phone and computer are on same WiFi

### QR code doesn't scan
- Ensure phone and computer are on same WiFi network
- Try `npm start --tunnel` (slower but works across networks)

### App crashes on launch
- Run `npm start -- --clear` to clear cache
- Check terminal for error messages

---

## 🎯 Next Steps (Sprint 2: Profiles + Feed)

- [ ] Profile screen with user info
- [ ] Edit profile functionality
- [ ] Posts feed with infinite scroll
- [ ] Like/bookmark buttons
- [ ] Comment functionality

---

## 📝 Notes

- **Hot reload works**: Edit any file → save → app auto-reloads
- **Console logs**: Appear in terminal where you ran `npm start`
- **Debugging**: Press `j` in terminal to open React Native Debugger
- **Reload manually**: Press `r` in terminal or shake physical device

---

**You're all set! 🚀 Run `npm start` and start testing!**
