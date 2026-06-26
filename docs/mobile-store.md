# App Store & Play Store checklist

Use this after Capacitor is configured and tested on devices.

## Before submission

- [ ] Production Vercel deploy is live with HTTPS
- [ ] `CAPACITOR_SERVER_URL` set to production URL and `npm run cap:sync` run
- [ ] Privacy policy live at `/privacy`
- [ ] Supabase Auth redirect URLs include production domain
- [ ] Camera/mic permissions tested in counseling video session

## Google Play

1. Open project: `npm run cap:android`
2. **Build → Generate Signed Bundle / APK** → Android App Bundle (AAB)
3. Create app in [Google Play Console](https://play.google.com/console)
4. Provide privacy policy URL: `https://your-app.vercel.app/privacy`
5. Complete Data safety form (account info, wellbeing content, camera/mic for video)
6. Upload AAB to internal testing track first

## Apple App Store

Requires Mac with Xcode.

1. Open project: `npm run cap:ios`
2. Set **Signing & Capabilities** (Team, Bundle ID `com.safevoice.app`)
3. **Product → Archive** → Distribute to App Store Connect
4. Privacy policy URL: `https://your-app.vercel.app/privacy`
5. Declare camera and microphone usage (counseling video)
6. App Review note: *Student wellbeing platform with AI chat and live counseling video; content served from secure HTTPS backend.*

## Device test checklist

1. App opens landing page from Vercel
2. Student login → dashboard
3. AI chat send/receive
4. Book counseling session
5. Join Jitsi video (camera + mic work)
6. Faculty login → join same session
7. Android hardware back button navigates history
