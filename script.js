import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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



/* SAVE ORDER */

window.saveOrder = async function(){

const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;
const dress = document.getElementById("dress").value;
const amount = Number(document.getElementById("amount").value);
const paid = Number(document.getElementById("paid").value);
const dueDate = document.getElementById("dueDate").value;
const status = document.getElementById("status").value;

const due = amount - paid;

await addDoc(collection(db,"orders"),{
name:name,
phone:phone,
dress:dress,
amount:amount,
paid:paid,
due:due,
dueDate:dueDate,
status:status
});

alert("Order Saved Successfully");

};



/* CUSTOMER CHECK STATUS */

window.checkStatus = async function(){

const phone = document.getElementById("searchPhone").value;

const snapshot = await getDocs(collection(db,"orders"));

let resultHTML = "";

snapshot.forEach((doc)=>{

const data = doc.data();

if(data.phone == phone){

resultHTML += `
<div>
<p><b>Name:</b> ${data.name}</p>
<p><b>Dress:</b> ${data.dress}</p>
<p><b>Status:</b> ${data.status}</p>
<p><b>Paid:</b> ₹${data.paid}</p>
<p><b>Due:</b> ₹${data.due}</p>
<p><b>Delivery Date:</b> ${data.dueDate}</p>
<hr>
</div>
`;

}

});

if(resultHTML === ""){
resultHTML = "No order found";
}

document.getElementById("result").innerHTML = resultHTML;

};
