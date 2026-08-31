import { NavLink } from "react-router-dom";


const menu = [

{
title:"Dashboard",
path:"/business"
},


{
title:"Branches",
path:"/business/branches"
},


{
title:"Departments",
path:"/business/departments"
},


{
title:"Positions",
path:"/business/positions"
},


{
title:"Employees",
path:"/business/employees"
},


{
title:"Recruitment",
path:"/business/recruitment"
},


{
title:"Attendance",
path:"/business/attendance"
},


{
title:"Payroll",
path:"/business/payroll"
},


{
title:"Analytics",
path:"/business/analytics"
},


{
title:"AI Assistant",
path:"/business/ai"
},


{
title:"Settings",
path:"/business/settings"
}

];


export default function Sidebar(){

return (

<aside className="sidebar">


<h2>
Everyday Connect
</h2>


<p className="business-label">
Business Manager
</p>



{
menu.map(item=>(

<NavLink

key={item.path}

to={item.path}

className={({isActive}) =>
isActive ? "active-link":"sidebar-link"
}

>

{item.title}

</NavLink>


))
}


</aside>


)

}