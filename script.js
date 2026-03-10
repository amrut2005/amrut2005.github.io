let orders = JSON.parse(localStorage.getItem("orders")) || [];

function generateID(){
return "ST" + (orders.length + 1);
}

function saveOrder(){

let order = {

id: generateID(),
name: document.getElementById("name").value,
phone: document.getElementById("phone").value,
dress: document.getElementById("dress").value,
amount: document.getElementById("amount").value,
paid: document.getElementById("paid").value,
dueDate: document.getElementById("dueDate").value,
status: document.getElementById("status").value

};

orders.push(order);

localStorage.setItem("orders", JSON.stringify(orders));

alert("Order Saved Successfully");

displayOrders();

}

function displayOrders(){

let table=document.getElementById("orderTable");

if(!table) return;

table.innerHTML="";

orders.forEach(o=>{

table.innerHTML +=

"<tr>"+
"<td>"+o.id+"</td>"+
"<td>"+o.name+"</td>"+
"<td>"+o.phone+"</td>"+
"<td>"+o.dress+"</td>"+
"<td>"+o.amount+"</td>"+
"<td>"+o.paid+"</td>"+
"<td>"+o.dueDate+"</td>"+
"<td>"+o.status+"</td>"+
"</tr>";

});

}

function checkOrder(){

let phone=document.getElementById("search").value;

let orders=JSON.parse(localStorage.getItem("orders")) || [];

let order=orders.find(o=>o.phone==phone);

if(order){

document.getElementById("result").innerHTML=

"Order ID: "+order.id+"<br>"+
"Status: "+order.status+"<br>"+
"Collection Date: "+order.dueDate;

}

else{

document.getElementById("result").innerHTML="Order Not Found";

}

}

displayOrders();
