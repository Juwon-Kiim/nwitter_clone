import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe9CCPXOQeEh8Ut8n7pqb5Maq47UHwuTc",
  authDomain: "nwitter-47171.firebaseapp.com",
  projectId: "nwitter-47171",
  storageBucket: "nwitter-47171.appspot.com",
  messagingSenderId: "479152931158",
  appId: "1:479152931158:web:20c9c14a5d86edd56716f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
