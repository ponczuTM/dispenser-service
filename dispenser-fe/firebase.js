import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, remove } from "firebase/database"; //MUSI BYĆ onValue

const firebaseConfig = {
  apiKey: "AIzaSyBM2ykHjlP8UnfkPTyeS1cC4Vd6YetamF0",
  authDomain: "mroczkowski-well.firebaseapp.com",
  databaseURL: "https://mroczkowski-well-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mroczkowski-well",
  storageBucket: "mroczkowski-well.appspot.com",
  messagingSenderId: "457568679317",
  appId: "1:457568679317:web:02af2ca8a0efe2a14a729c"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, onValue, remove };
