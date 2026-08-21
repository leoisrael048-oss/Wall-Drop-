plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.iley.walldrop"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.iley.walldrop"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            // Production AdMob IDs (Policy notice: do not click live ads during manual testing)
            manifestPlaceholders["admobAppId"] = "ca-app-pub-4632188788602851~8680031794"
            buildConfigField("String", "ADMOB_APP_ID", "\"ca-app-pub-4632188788602851~8680031794\"")
            buildConfigField("String", "INTERSTITIAL_AD_ID", "\"ca-app-pub-4632188788602851/4357643400\"")
            buildConfigField("String", "REWARDED_AD_ID", "\"ca-app-pub-4632188788602851/8895654217\"")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            manifestPlaceholders["admobAppId"] = "ca-app-pub-4632188788602851~8680031794"
            buildConfigField("String", "ADMOB_APP_ID", "\"ca-app-pub-4632188788602851~8680031794\"")
            buildConfigField("String", "INTERSTITIAL_AD_ID", "\"ca-app-pub-4632188788602851/4357643400\"")
            buildConfigField("String", "REWARDED_AD_ID", "\"ca-app-pub-4632188788602851/8895654217\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.webkit:webkit:1.10.0")
    
    // Google Mobile Ads SDK for AdMob
    implementation("com.google.android.gms:play-services-ads:23.0.0")

    // Firebase BoM & Services (Leaderboard & Offline Persistence)
    implementation(platform("com.google.firebase:firebase-bom:32.8.0"))
    implementation("com.google.firebase:firebase-database-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
}
