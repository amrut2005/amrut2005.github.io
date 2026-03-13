import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
getFirestore, 
collection, 
addDoc, 
getDocs, 
deleteDoc, 
doc, 
updateDoc,
getDoc,
query,
orderBy
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

async function uploadToCloudinary(file){

const url = "https://api.cloudinary.com/v1_1/dijuztwnr/image/upload"

const formData = new FormData()

formData.append("file", file)
formData.append("upload_preset", "tailor_photos")

const res = await fetch(url,{
method:"POST",
body:formData
})

const data = await res.json()

return data.secure_url

}

async function saveHistory(action, orderNo, name){

const now = new Date().toLocaleString()

await addDoc(collection(db,"history"),{
action: action,
orderNo: orderNo,
name: name,
time: now
})

}

async function getNextOrderNo(){

const snapshot = await getDocs(collection(db,"orders"))

let maxNo = 0

snapshot.forEach((doc)=>{

let data = doc.data()

let num = Number(data.orderNo)

if(num > maxNo){
maxNo = num
}

})

return maxNo + 1

}




/* SAVE ORDER */

window.saveOrder = async function(){

let orderNo = document.getElementById("orderNo").value

if(!orderNo){
orderNo = await getNextOrderNo()
}

const name = document.getElementById("name").value
const phone = document.getElementById("phone").value
const dress = document.getElementById("dress").value
const amount = Number(document.getElementById("amount").value)
const paid = Number(document.getElementById("paid").value)
const dueDate = document.getElementById("dueDate").value
const status = document.getElementById("status").value

const photoFile = document.getElementById("photo").files[0]

let photoURL = ""

if(photoFile){
photoURL = await uploadToCloudinary(photoFile)
}

const due = amount - paid

await addDoc(collection(db,"orders"),{
orderNo,
name,
phone,
dress,
amount,
paid,
due,
dueDate,
status,
photo: photoURL
})

await saveHistory("New Order Created",orderNo,name)

alert("Order Saved")

clearForm()

let link = `https://amrut2005.github.io/track.html?phone=${phone}`

let msg = `Super Tailor

Hello ${name},

Your order has been successfully received.

Dress: ${dress}
Delivery Date: ${dueDate}

Total Amount: ₹${amount}
Paid: ₹${paid}
Pending Payment: ₹${due}

Track your order status here:
${link}

Thank you for choosing Super Tailor.`

sendWhatsApp(phone,msg)

loadOrders()

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
updateProgress(data.status)
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

let orders = []

snapshot.forEach((doc)=>{
let d = doc.data()
d.id = doc.id
orders.push(d)
})

/* SORT ORDERS */
orders.sort((a,b)=> (b.orderNo || 0) - (a.orderNo || 0))

/* NOW BUILD TABLE */
orders.forEach((d)=>{

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

<td>${d.orderNo || "-"}</td>
<td>${d.name}</td>
<td>${d.phone}</td>
<td>${d.dress}</td>
<td>${d.amount}</td>
<td>${d.paid}</td>
<td>${d.due}</td>
<td>${d.dueDate}</td>
<td>${d.collectedDate ? d.collectedDate : "-"}</td>

<td>
<select style="width:110px" onchange="updateStatus('${d.id}',this.value)">
<option ${d.status=="Stitching"?"selected":""}>Stitching</option>
<option ${d.status=="Ready"?"selected":""}>Ready</option>
<option ${d.status=="Collected"?"selected":""}>Collected</option>
</select>
</td>

<td>
${d.photo ? `<a href="${d.photo}" target="_blank">
<img src="${d.photo}" style="width:80px;height:80px;object-fit:cover;border-radius:6px;">
</a>` : ""}
</td>

<td>
<button onclick="editOrder('${d.id}')">Edit</button>
</td>

<td>
<button onclick="deleteOrder('${d.id}')">Delete</button>
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

let link = `https://amrut2005.github.io/track.html?phone=${phone}`

let msg = `Super Tailor

Hello ${data.name},

Your dress (${data.dress}) is ready for collection.

Total Amount: ₹${data.amount}
Paid: ₹${data.paid}
Pending Payment: ₹${data.due}

Check your order status here:
${link}

Thank you!`

sendWhatsApp(phone,msg)

}

if(status === "Collected"){

let today = new Date().toISOString().split("T")[0]

updateData.collectedDate = today

let msg = ""

if(data.due == 0){

msg = `Super Tailor

Hello ${data.name},

Thank you for collecting your dress (${data.dress}).

Your bill is fully completed.

We appreciate your visit.
Please visit again!`

}else{

msg = `Super Tailor

Hello ${data.name},

Thank you for collecting your dress (${data.dress}).

Total Amount: ₹${data.amount}
Paid: ₹${data.paid}
Pending Payment: ₹${data.due}

Kindly clear the pending amount when possible.

Thank you!`

}

sendWhatsApp(phone,msg)


}else{

updateData.collectedDate = ""

}

await updateDoc(doc(db,"orders",id),updateData)

await saveHistory("Status Changed to " + status, data.orderNo, data.name)

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

const docRef = doc(db,"orders",id)
const docSnap = await getDoc(docRef)

let orderNo = ""

if(docSnap.exists()){
orderNo = docSnap.data().orderNo
}

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

await saveHistory("Order Edited", orderNo, name)

alert("Order Updated")

window.location="dashboard.html"

}
window.deleteOrder = async function(id){

const confirmDelete = confirm("Delete this order?")

if(!confirmDelete) return

const docSnap = await getDoc(doc(db,"orders",id))
const data = docSnap.data()

await saveHistory("Order Deleted", data.orderNo, data.name)

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

// Dashboard page
if(document.getElementById("orderTable")){
loadOrders()
clearForm()
}

// Edit page
if(window.location.pathname.includes("edit.html")){
loadEditData()
}
// History table
if(document.getElementById("historyTable")){
loadHistory()
}

// Track page
const params = new URLSearchParams(window.location.search)
const phone = params.get("phone")

if(phone && document.getElementById("phone")){
document.getElementById("phone").value = phone
checkStatus()
}

}


async function loadHistory(){

const q = query(collection(db,"history"), orderBy("time","desc"))
const snapshot = await getDocs(q)

let table = ""

snapshot.forEach((doc)=>{

let d = doc.data()

table += `
<tr>
<td>${d.time}</td>
<td>${d.orderNo}</td>
<td>${d.name}</td>
<td>${d.action}</td>
</tr>
`

})

document.getElementById("historyTable").innerHTML = table

}

function sendWhatsApp(phone,message){

let url = "https://wa.me/91" + phone + "?text=" + encodeURIComponent(message)

window.open(url,"_blank")

}

window.exportToExcel = function(){

let table = document.getElementById("orderTable").rows

let data = `
<table border="1">
<tr>
<th>Order No</th>
<th>Name</th>
<th>Phone</th>
<th>Dress</th>
<th>Amount</th>
<th>Paid</th>
<th>Due</th>
<th>Due Date</th>
<th>Collected Date</th>
<th>Status</th>
</tr>
`

for(let i=0;i<table.length;i++){

let cells = table[i].cells

let status = cells[9].querySelector("select").value

data += `
<tr>
<td>${cells[0].innerText}</td>
<td>${cells[1].innerText}</td>
<td>${cells[2].innerText}</td>
<td>${cells[3].innerText}</td>
<td>${cells[4].innerText}</td>
<td>${cells[5].innerText}</td>
<td>${cells[6].innerText}</td>
<td>${cells[7].innerText}</td>
<td>${cells[8].innerText}</td>
<td>${status}</td>
</tr>
`

}
  

data += "</table>"

let url = "data:application/vnd.ms-excel," + encodeURIComponent(data)

let link = document.createElement("a")

link.href = url
link.download = "Tailor_Orders.xls"

link.click()

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

window.clearHistory = async function(){

let code = prompt("Enter 6 digit secret code")

if(code !== "776013"){
alert("Wrong Secret Code")
return
}

const snapshot = await getDocs(collection(db,"history"))

snapshot.forEach(async (docu)=>{
await deleteDoc(doc(db,"history",docu.id))
})

alert("History Cleared")

loadHistory()

}

window.logout = function(){

const confirmLogout = confirm("Are you sure you want to logout?")

if(!confirmLogout){
return
}

localStorage.removeItem("tailorLogin")

window.location = "login.html"

}

function updateProgress(status){

document.querySelectorAll(".step").forEach(step=>{
step.classList.remove("active")
})

document.getElementById("step1").classList.add("active")

if(status === "Stitching"){
document.getElementById("step2").classList.add("active")
}

if(status === "Ready"){
document.getElementById("step2").classList.add("active")
document.getElementById("step3").classList.add("active")
}

if(status === "Collected"){
document.getElementById("step2").classList.add("active")
document.getElementById("step3").classList.add("active")
document.getElementById("step4").classList.add("active")
}

}
