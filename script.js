import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
getFirestore, 
collection, 
addDoc, 
getDocs, 
deleteDoc, 
doc, 
updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const name = document.getElementById("name").value
const phone = document.getElementById("phone").value
const dress = document.getElementById("dress").value
const amount = Number(document.getElementById("amount").value)
const paid = Number(document.getElementById("paid").value)
const dueDate = document.getElementById("dueDate").value
const status = document.getElementById("status").value

const photoFile = document.getElementById("photo").files[0]

let photoData = ""

if(photoFile){

const reader = new FileReader()

reader.onload = async function(){

photoData = reader.result

const due = amount - paid

await addDoc(collection(db,"orders"),{
name,
phone,
dress,
amount,
paid,
due,
dueDate,
status,
photo:photoData
})

alert("Order Saved")

loadOrders()

}

reader.readAsDataURL(photoFile)

}else{

const due = amount - paid

await addDoc(collection(db,"orders"),{
name,
phone,
dress,
amount,
paid,
due,
dueDate,
status
})

alert("Order Saved")

loadOrders()

}

}

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
async function loadOrders(){

const snapshot = await getDocs(collection(db,"orders"))

let table = ""

let total = 0
let ready = 0
let pendingOrders = 0
let pendingPayment = 0

snapshot.forEach((doc)=>{

let d = doc.data()

total++

if(d.status === "Ready"){
ready++
}else{
pendingOrders++
}

if(d.due){
pendingPayment += Number(d.due)
}

table += `
<tr>

<td>${d.name}</td>
<td>${d.phone}</td>
<td>${d.dress}</td>
<td>${d.amount}</td>
<td>${d.paid}</td>
<td>${d.due}</td>
<td>${d.dueDate}</td>
<td>${d.collectedDate ? d.collectedDate : "-"}</td>

<td>

<select style="width:110px" onchange="updateStatus('${doc.id}',this.value)">

<option ${d.status=="Stitching"?"selected":""}>Stitching</option>
<option ${d.status=="Ready"?"selected":""}>Ready</option>
<option ${d.status=="Collected"?"selected":""}>Collected</option>

</select>

</td>

<td>
${d.photo ? `<img src="${d.photo}" width="60">` : ""}
</td>

<td>
<button onclick="editOrder('${doc.id}')">Edit</button>
</td>

<td>
<button onclick="deleteOrder('${doc.id}')">Delete</button>
</td>

</tr>
`

})

document.getElementById("orderTable").innerHTML = table

document.getElementById("totalOrders").innerText = total
document.getElementById("readyOrders").innerText = ready
document.getElementById("pendingOrders").innerText = pendingOrders
document.getElementById("pendingPayment").innerText = "₹" + pendingPayment

}


window.updateStatus = async function(id,status){

const confirmChange = confirm("Change order status to " + status + "?")

if(!confirmChange){
loadOrders()
return
}

let updateData = { status:status }

if(status === "Collected"){

let today = new Date().toISOString().split("T")[0]

updateData.collectedDate = today

}

await updateDoc(doc(db,"orders",id),updateData)

alert("Status Updated Successfully")

loadOrders()

}

window.editOrder = function(id){

const confirmEdit = confirm("Edit this customer order?")

if(!confirmEdit) return

localStorage.setItem("editID",id)

window.location="edit.html"

}

window.updateOrder = async function(){

let id = localStorage.getItem("editID")

let name = document.getElementById("name").value
let phone = document.getElementById("phone").value
let dress = document.getElementById("dress").value
let amount = Number(document.getElementById("amount").value)
let paid = Number(document.getElementById("paid").value)
let dueDate = document.getElementById("dueDate").value
let status = document.getElementById("status").value

let due = amount - paid

await updateDoc(doc(db,"orders",id),{

name:name,
phone:phone,
dress:dress,
amount:amount,
paid:paid,
due:due,
dueDate:dueDate,
status:status

})

alert("Order Updated")

window.location="dashboard.html"

}
window.deleteOrder = async function(id){

const confirmDelete = confirm("Delete this order?")

if(!confirmDelete) return

await deleteDoc(doc(db,"orders",id))

alert("Order Deleted")

loadOrders()

}

loadOrders()

window.searchOrders = function(){

let input = document.getElementById("searchInput").value.toLowerCase()

let rows = document.querySelectorAll("#orderTable tr")

rows.forEach(row => {

let text = row.innerText.toLowerCase()

if(text.includes(input)){
row.style.display = ""
}else{
row.style.display = "none"
}

})

}

