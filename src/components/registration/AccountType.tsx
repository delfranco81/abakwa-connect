type Props = {
  onSelect: (role: "customer" | "business") => void;
};

function AccountType({ onSelect }: Props) {
  return (
    <div>

      <h2>Create an Account</h2>

      <p>Choose how you want to use Abakwa Connect.</p>

      <button onClick={() => onSelect("customer")}>
        👤 I am a Customer
      </button>

      <button onClick={() => onSelect("business")}>
        🏢 I own a Business
      </button>

    </div>
  );
}

export default AccountType;