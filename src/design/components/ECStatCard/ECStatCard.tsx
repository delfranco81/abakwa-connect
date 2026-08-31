import "./ECStatCard.css";

interface Props{

title:string;

value:string|number;

icon?:string;

}

export default function ECStatCard({

title,

value,

icon

}:Props){

return(

<div className="ec-stat-card">

<div>

<h4>{title}</h4>

<h2>{value}</h2>

</div>

<div>

{icon}

</div>

</div>

);

}