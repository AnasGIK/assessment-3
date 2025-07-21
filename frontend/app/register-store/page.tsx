"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function RegisterManagerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "store-manager",
    store: "", // optional for now
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await fetchAPI(
        "/auth/register-store-manager",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        getToken()!
      );
      setSuccess("Store Manager registered!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-100 shadow-lg p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">
          Register Store Manager
        </h2>
        {success && <div className="text-green-500 text-sm">{success}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          name="name"
          placeholder="Name"
          className="input input-bordered w-full"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary w-full" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}
