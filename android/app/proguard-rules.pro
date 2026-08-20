# ProGuard rules for Wall Drop Android App

# Keep JavascriptInterface methods for WebAppBridge
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Google Mobile Ads / Play Services Ads
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Keep WebAppInterface & AdMobManager
-keep class com.iley.walldrop.** { *; }
