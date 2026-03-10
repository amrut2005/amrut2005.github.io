let orders = JSON.parse(localStorage.getItem("orders")) || [];

function generateID(){
return "ST" + (orders.length + 1).toString().padStart(4,"0");
}

function saveOrder(){

let photoInput=document.getElementById("photo");

let reader=new FileReader();

reader.onload=function(){

let order={

id:generateID(),
name:document.getElementById("name").value,
phone:document.getElementById("phone").value,
dress:document.getElementById("dress").value,
amount:document.getElementById("amount").value,
paid:document.getElementById("paid").value,
due:document.getElementById("amount").value - document.getElementById("paid").value,
dueDate:document.getElementById("dueDate").value,
status:document.getElementById("status").value,
photo:reader.result

};

orders.push(order);

localStorage.setItem("orders",JSON.stringify(orders));

displayOrders();

alert("Order Saved");

};

if(photoInput.files[0]){
reader.readAsDataURL(photoInput.files[0]);
}
else{
reader.onload();
}

}

function displayOrders(){

let table=document.getElementById("orderTable");

table.innerHTML=

`<tr>

<th>ID</th>
<th>Name</th>
<th>Phone</th>
<th>Dress</th>
<th>Total</th>
<th>Paid</th>
<th>Due</th>
<th>Due Date</th>
<th>Status</th>
<th>Photo</th>
<th>Action</th>
</tr>`;

orders.forEach((o,index)=>{

table.innerHTML+=

`<tr>

<td>${o.id}</td>
<td>${o.name}</td>
<td>${o.phone}</td>
<td>${o.dress}</td>
<td>${o.amount}</td>
<td>${o.paid}</td>
<td>${o.due}</td>
<td>${o.dueDate}</td>
<td>${o.status}</td>
<td><img src="${o.photo}"></td>
<td><button onclick="deleteOrder(${index})">Delete</button></td>
</tr>`;

});

}

function deleteOrder(i){

orders.splice(i,1);

localStorage.setItem("orders",JSON.stringify(orders));

displayOrders();

}

function searchCustomer(){

let value=document.getElementById("searchBar").value.toLowerCase();

let rows=document.querySelectorAll("#orderTable tr");

rows.forEach(row=>{

if(row.innerText.toLowerCase().includes(value)){
row.style.display="";
}
else{
row.style.display="none";
}

});

}

displayOrders();
