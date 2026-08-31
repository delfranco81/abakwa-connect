import "./KPICards.css";

const cards = [

{
title:"Revenue",
value:"FCFA 1,250,000",
change:"+18%"
},

{
title:"Customers",
value:"482",
change:"+12%"
},

{
title:"Employees",
value:"17",
change:"15 Active"
},

{
title:"Bookings",
value:"38",
change:"Today"
}

];

export default function KPICards(){

return(

<div className="kpi-grid">

{cards.map(card=>(

<div className="kpi-card" key={card.title}>

<h4>{card.title}</h4>

<h2>{card.value}</h2>

<p>{card.change}</p>

</div>

))}

</div>

)

}