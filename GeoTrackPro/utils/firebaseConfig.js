//firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Update with correct details
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXXXXXX"
};     

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
