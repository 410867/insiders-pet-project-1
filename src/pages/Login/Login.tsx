import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/trips");
    } catch (err) {
      console.error(err);
      alert("Помилка входу");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Увійти</button>
    </form>
  );
}
