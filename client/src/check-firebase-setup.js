// check-firebase-setup.js
console.log("Checking Firebase Setup...");

// Check environment variables
console.log("\nEnvironment Variables:");
console.log("=====================");
if (typeof process !== "undefined" && process.env) {
  const firebaseVars = Object.keys(process.env)
    .filter(key => key.includes("FIREBASE") || key.includes("VITE_FIREBASE"));
  
  if (firebaseVars.length > 0) {
    console.log("Found Firebase environment variables:", firebaseVars.join(", "));
  } else {
    console.log("No Firebase environment variables found.");
  }
}

// Check frontend configuration
console.log("\nFrontend Configuration:");
console.log("=====================");
if (typeof window !== "undefined" && window.ENV) {
  console.log("window.ENV exists with keys:", Object.keys(window.ENV).join(", "));
  
  if (window.ENV.FIREBASE_CONFIG) {
    console.log("FIREBASE_CONFIG found in window.ENV");
    const configKeys = Object.keys(window.ENV.FIREBASE_CONFIG);
    console.log("FIREBASE_CONFIG keys:", configKeys.join(", "));
    
    // Check for minimal required config
    const requiredKeys = ["apiKey", "authDomain", "projectId"];
    const missingKeys = requiredKeys.filter(key => !configKeys.includes(key) || !window.ENV.FIREBASE_CONFIG[key]);
    
    if (missingKeys.length > 0) {
      console.error("Missing required Firebase config keys:", missingKeys.join(", "));
    } else {
      console.log("All required Firebase config keys present");
    }
  } else {
    console.error("FIREBASE_CONFIG not found in window.ENV");
  }
} else {
  console.error("window.ENV is not defined");
}

// Report on Firebase SDK initialization
try {
  console.log("\nFirebase SDK Status:");
  console.log("==================");
  
  if (typeof firebase !== "undefined") {
    console.log("Firebase SDK is loaded");
    if (firebase.apps && firebase.apps.length > 0) {
      console.log("Firebase has been initialized with", firebase.apps.length, "app(s)");
    } else {
      console.error("Firebase has not been initialized yet");
    }
  } else {
    console.error("Firebase SDK is not loaded");
  }
} catch (error) {
  console.error("Error checking Firebase SDK:", error);
}

console.log("\nSetup check complete. If you see errors above, please fix them to ensure Firebase works correctly.");
