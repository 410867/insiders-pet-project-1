import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth";

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      nav("/trips");
    } catch (err) {
      console.error(err);
      alert("Помилка реєстрації");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Зареєструватися</button>
    </form>
  );
}
