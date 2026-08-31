import "./ECButton.css";

interface ECButtonProps {

    children: React.ReactNode;

    onClick?: () => void;

    type?: "button" | "submit";

    variant?: "primary" | "secondary" | "danger";

    disabled?: boolean;

}

export default function ECButton({

    children,

    onClick,

    type="button",

    variant="primary",

    disabled=false

}:ECButtonProps){

    return(

        <button

            className={`ec-button ${variant}`}

            onClick={onClick}

            type={type}

            disabled={disabled}

        >

            {children}

        </button>

    );

}