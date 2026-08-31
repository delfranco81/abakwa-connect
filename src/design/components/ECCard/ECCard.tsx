import "./ECCard.css";

interface Props{

title?:string;

children:React.ReactNode;

}

export default function ECCard({

title,

children

}:Props){

return(

<div className="ec-card">

{title && <h3>{title}</h3>}

<div>

{children}

</div>

</div>

);

}