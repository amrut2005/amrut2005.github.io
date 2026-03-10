import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALE38Zrz2YCXaGOjm2T_2Kb1z7W5Xr4D0",
  authDomain: "super-tailor-776013.firebaseapp.com",
  projectId: "super-tailor-776013",
  storageBucket: "super-tailor-776013.firebasestorage.app",
  messagingSenderId: "184580969162",
  appId: "1:184580969162:web:35d6bdfce01dc541d51a33"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.saveOrder = async function () {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const dress = document.getElementById("dress").value;
  const amount = Number(document.getElementById("amount").value);
  const paid = Number(document.getElementById("paid").value);
  const dueDate = document.getElementById("dueDate").value;
  const status = document.getElementById("status").value;

  const due = amount - paid;

  try {

    await addDoc(collection(db, "orders"), {
      name: name,
      phone: phone,
      dress: dress,
      amount: amount,
      paid: paid,
      due: due,
      dueDate: dueDate,
      status: status
    });

    alert("Order Saved Successfully");

  } catch (error) {
    console.error("Error:", error);
    alert("Error saving order");
  }
};
