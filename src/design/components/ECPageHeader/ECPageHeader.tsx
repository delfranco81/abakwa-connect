import "./ECPageHeader.css";

interface Props{

title:string;

subtitle?:string;

}

export default function ECPageHeader({

title,

subtitle

}:Props){

return(

<div className="ec-page-header">

<h1>{title}</h1>

{subtitle && <p>{subtitle}</p>}

</div>

);

}