// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALE38Zrz2YCXaGOjm2T_2Kb1z7W5Xr4D0",
  authDomain: "super-tailor-776013.firebaseapp.com",
  projectId: "super-tailor-776013",
  storageBucket: "super-tailor-776013.firebasestorage.app",
  messagingSenderId: "184580969162",
  appId: "1:184580969162:web:35d6bdfce01dc541d51a33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SAVE ORDER (Admin)
window.saveOrder = async function () {

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const dress = document.getElementById("dress").value;
  const amount = document.getElementById("amount").value;
  const paid = document.getElementById("paid").value;
  const dueDate = document.getElementById("dueDate").value;
  const status = document.getElementById("status").value;

  const due = amount - paid;

  try {
    await addDoc(collection(db, "orders"), {
      name,
      phone,
      dress,
      amount,
      paid,
      due,
      dueDate,
      status
    });

    alert("Order Saved Successfully");

  } catch (error) {
    console.error(error);
  }
};

// CUSTOMER STATUS CHECK
window.checkStatus = async function () {

  const phone = document.getElementById("searchPhone").value;

  const q = query(collection(db, "orders"), where("phone", "==", phone));
  const querySnapshot = await getDocs(q);

  let output = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    output += `
      <p><b>Name:</b> ${data.name}</p>
      <p><b>Dress:</b> ${data.dress}</p>
      <p><b>Amount:</b> ${data.amount}</p>
      <p><b>Paid:</b> ${data.paid}</p>
      <p><b>Due:</b> ${data.due}</p>
      <p><b>Due Date:</b> ${data.dueDate}</p>
      <p><b>Status:</b> ${data.status}</p>
      <hr>
    `;
  });

  document.getElementById("result").innerHTML = output || "No order found";
};
