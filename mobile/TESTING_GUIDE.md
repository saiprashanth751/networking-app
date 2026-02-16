# 🎉 What's Working Now - Testing Guide

## ✅ Sprint 2 Progress: Feed & Profile

### Features You Can Test Right Now

#### 1. **Authentication** (from Sprint 1)
- [x] Sign up with new account
- [x] Sign in with existing account  
- [x] Token persists across app restarts
- [x] Logout functionality

#### 2. **Feed Screen** (NEW!)
- [x] View all posts from backend
- [x] Infinite scroll (loads more as you scroll down)
- [x] Pull to refresh
- [x] Like posts (tap heart icon)
- [x] Bookmark posts (tap bookmark icon)
- [x] See post media (images)
- [x] See post categories
- [x] Loading states
- [x] Empty state if no posts

#### 3. **Profile Screen** (NEW!)
- [x] View your profile info
- [x] Profile picture or initials
- [x] Bio, department, graduation year
- [x] Social links (LinkedIn, GitHub, LeetCode)
- [x] Stats (posts, followers, following) - showing 0 for now
- [x] Logout button

---

## 📱 How to Test

### Make Sure Backend is Running
```bash
cd c:\Projects\network-app\backend
npm run dev
```

### Mobile App Should Already Be Running
The app should have auto-reloaded on your phone after the code changes.

If not:
- Press `r` in the terminal (where `npm start` is running)
- Or shake your phone → tap "Reload"

---

## 🧪 Test Scenarios

### Scenario 1: Feed with Posts

**Prerequisites**: Have some posts in your database

1. Open app → should see Sign In screen
2. Sign in with your account
3. App navigates to **Feed tab**
4. Should see list of posts with:
   - Author name and avatar
   - Post title and content
   - Categories
   - Like/comment/bookmark counts
   - Images (if post has media)

5. **Test infinite scroll**:
   - Scroll to bottom
   - Should load more posts automatically

6. **Test pull-to-refresh**:
   - Pull down from top
   - Should show loading spinner
   - Should refresh posts

7. **Test like**:
   - Tap heart icon on any post
   - Should turn red (❤️)
   - Like count should increment
   - Tap again → should turn white (🤍)
   - Like count should decrement

8. **Test bookmark**:
   - Tap bookmark icon
   - Should toggle between 📑 and 🔖
   - Bookmark count should update

### Scenario 2: Profile

1. Tap **Profile** tab at bottom
2. Should see:
   - Your profile picture or initials
   - Your name and email
   - Bio (if you have one)
   - Department, graduation year, minor
   - Social links (if you added any)

3. **Test logout**:
   - Tap "Logout" button at bottom
   - Should return to Sign In screen
   - Try opening app again → should still be logged out ✅

### Scenario 3: Empty Feed

**Prerequisites**: Database has no posts

1. Sign in
2. Feed shows: "No posts yet - Be the first to create a post!"

---

## 🐛 Troubleshooting

### Posts not loading?

**Check backend connection:**
1. Make sure `src/lib/config.ts` has correct IP address
2. Backend must be running on that IP:5000
3. Check backend logs for errors

**Quick test API is reachable:**
```bash
# In terminal, from mobile directory
node -e "fetch('http://YOUR_IP:5000/api/posts').then(r => r.json()).then(console.log)"
```

### "Network Error" when liking/bookmarking?

- Make sure you're logged in (have a valid token)
- Check backend logs
- Try logging out and back in

### App crashes?

- Check terminal for error messages
- Try: `npm start -- --clear`
- Reload app with `r` in terminal

---

## 🎯 What's Next (Still TODO)

From Sprint 2:
- [ ] Edit Profile screen
- [ ] View other users' profiles
- [ ] Follow/unfollow functionality
- [ ] Search screen
- [ ] Post detail screen with comments

Want me to continue building these, or test what's done first?

---

## 💡 Tips

- **Hot reload is working**: Edit any file → save → app reloads automatically
- **Console logs**: Show in terminal where `npm start` is running
- **React Query DevTools**: All the hooks from web work the same!
- **Optimistic updates**: Like/bookmark changes happen instantly, even before backend responds

---

**Test it out and let me know if you see any issues or want to continue building!** 🚀
