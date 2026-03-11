import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
getFirestore, 
collection, 
addDoc, 
getDocs, 
deleteDoc, 
doc, 
updateDoc,
getDoc
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
  
clearForm()
  
let msg = `Super Tailor
Hello ${name},
Your order for ${dress} has been received.
Delivery Date: ${dueDate}.
Paid ₹${paid}
Due ₹${due}`

sendWhatsApp(phone,msg)

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

clearForm()
  
let msg = `Super Tailor
Hello ${name},
Your order for ${dress} has been received.
Delivery Date: ${dueDate}.
Paid ₹${paid}
Due ₹${due}`

sendWhatsApp(phone,msg)

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

let dateLabel = "Delivery Date"
let dateValue = data.dueDate

if(data.status === "Collected"){
dateLabel = "Collected Date"
dateValue = data.collectedDate
}

resultHTML += `
<div>
<p><b>Name:</b> ${data.name}</p>
<p><b>Dress:</b> ${data.dress}</p>
<p><b>Status:</b> ${data.status}</p>
<p><b>Paid:</b> ₹${data.paid}</p>
<p><b>Due:</b> ₹${data.due}</p>
<p><b>${dateLabel}:</b> ${dateValue}</p>
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
let pending = 0
let collected = 0
let payment = 0

snapshot.forEach((doc)=>{

let d = doc.data()

total++

if(d.status === "Ready"){
ready++
}

if(d.status === "Stitching"){
pending++
}

if(d.status === "Collected"){
collected++
}

if(d.due){
payment += Number(d.due)
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
document.getElementById("pendingOrders").innerText = pending
document.getElementById("collectedOrders").innerText = collected
document.getElementById("pendingPayment").innerText = "₹" + payment


}


window.updateStatus = async function(id,status){

const confirmChange = confirm("Change order status to " + status + "?")

if(!confirmChange){
loadOrders()
return
}

const docRef = doc(db,"orders",id)
const docSnap = await getDoc(docRef)

if(!docSnap.exists()){
alert("Order not found")
return
}

let data = docSnap.data()
let phone = data.phone

let updateData = { status:status }

if(status === "Ready"){

let msg = `Super Tailor
Hello ${data.name},
Your dress is ready for collection.
Please visit the shop.`

sendWhatsApp(phone,msg)

}

if(status === "Collected"){

let today = new Date().toISOString().split("T")[0]

updateData.collectedDate = today

let msg = `Super Tailor
Hello ${data.name},
Thank you for collecting your dress.
Visit again!`

sendWhatsApp(phone,msg)

}else{

updateData.collectedDate = ""

}

await updateDoc(doc(db,"orders",id),updateData)

alert("Status Updated")

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

window.filterStatus = function(){

let filter = document.getElementById("statusFilter").value
let table = document.getElementById("orderTable")
let rows = table.getElementsByTagName("tr")

for(let i=0;i<rows.length;i++){

let statusCell = rows[i].getElementsByTagName("td")[8]

if(statusCell){

let statusSelect = statusCell.querySelector("select")

if(statusSelect){

let statusValue = statusSelect.value

if(filter === "All" || statusValue === filter){
rows[i].style.display = ""
}else{
rows[i].style.display = "none"
}

}

}

}

}

window.loadEditData = async function(){

const id = localStorage.getItem("editID")

if(!id){
console.log("No edit ID found")
return
}

const docRef = doc(db,"orders",id)
const docSnap = await getDoc(docRef)

if(docSnap.exists()){

const data = docSnap.data()

document.getElementById("name").value = data.name
document.getElementById("phone").value = data.phone
document.getElementById("dress").value = data.dress
document.getElementById("amount").value = data.amount
document.getElementById("paid").value = data.paid
document.getElementById("dueDate").value = data.dueDate
document.getElementById("status").value = data.status

}else{

alert("Order not found")

}

}

window.onload = function(){

if(document.getElementById("orderTable")){
loadOrders()
}

if(document.getElementById("name") && localStorage.getItem("editID")){
loadEditData()
}

}

function sendWhatsApp(phone,message){

let url = "https://wa.me/91" + phone + "?text=" + encodeURIComponent(message)

window.open(url,"_blank")

}
window.exportToExcel = function(){

let table = document.querySelector("table")

let html = table.outerHTML

let url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html)

let downloadLink = document.createElement("a")

downloadLink.href = url

downloadLink.download = "Tailor_Orders.xls"

downloadLink.click()

}
function clearForm(){

document.getElementById("name").value = ""
document.getElementById("phone").value = ""
document.getElementById("dress").value = ""
document.getElementById("amount").value = ""
document.getElementById("paid").value = ""
document.getElementById("dueDate").value = ""
document.getElementById("status").value = "Stitching"
document.getElementById("photo").value = ""

}

