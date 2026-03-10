let orders = JSON.parse(localStorage.getItem("orders")) || [];

function generateID(){
return "ST" + (orders.length + 1);
}

function saveOrder(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let dress = document.getElementById("dress").value;
let amount = document.getElementById("amount").value;
let paid = document.getElementById("paid").value;
let dueDate = document.getElementById("dueDate").value;
let status = document.getElementById("status").value;

let order = {
id: generateID(),
name: name,
phone: phone,
dress: dress,
amount: amount,
paid: paid,
due: amount - paid,
dueDate: dueDate,
status: status
};

orders.push(order);

localStorage.setItem("orders", JSON.stringify(orders));

alert("Order Saved Successfully");

}

function checkOrder(){

let phone = document.getElementById("search").value;

let orders = JSON.parse(localStorage.getItem("orders")) || [];

let order = orders.find(o => o.phone == phone);

if(order){

document.getElementById("result").innerHTML =
"Order ID: " + order.id + "<br>" +
"Status: " + order.status + "<br>" +
"Collection Date: " + order.dueDate;

}
else{
document.getElementById("result").innerHTML = "Order Not Found";
}

}
