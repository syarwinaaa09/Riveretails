'use client'
import firebase from "firebase/compat/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBgLxGFT5FZoGtVGpjyq2QtOYrol8OqzrM",
    authDomain: "riveretails.firebaseapp.com",
    projectId: "riveretails",
    storageBucket: "riveretails.appspot.com",
    messagingSenderId: "23422915799",
    appId: "1:23422915799:web:4382b990ef3eebd4578c92"
  };

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app()

const db = getFirestore(app);

export default db