function login(){

let u=document.getElementById("username").value;
let p=document.getElementById("password").value;

if(u=="supertailor" && p=="12345"){
window.location="dashboard.html";
}
else{
alert("Wrong Login");
}

}


function saveOrder(){

let id="ST"+Math.floor(Math.random()*10000);

let order={
id:id,
name:document.getElementById("name").value,
phone:document.getElementById("phone").value,
dress:document.getElementById("dress").value,
amount:document.getElementById("amount").value,
paid:document.getElementById("paid").value,
dueDate:document.getElementById("dueDate").value,
status:document.getElementById("status").value
};

localStorage.setItem(order.phone,JSON.stringify(order));

alert("Order Saved. ID: "+id);

}


function checkOrder(){

let search=document.getElementById("search").value;

let data=localStorage.getItem(search);

if(data){

let o=JSON.parse(data);

document.getElementById("result").innerHTML=

"Order ID: "+o.id+"<br>"+
"Name: "+o.name+"<br>"+
"Dress: "+o.dress+"<br>"+
"Amount: "+o.amount+"<br>"+
"Paid: "+o.paid+"<br>"+
"Due Date: "+o.dueDate+"<br>"+
"Status: "+o.status;

}

else{

document.getElementById("result").innerHTML="No Order Found";

}

}
