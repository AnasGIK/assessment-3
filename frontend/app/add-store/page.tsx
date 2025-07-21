"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AddStorePage() {
  const [managers, setManagers] = useState<
    { _id: string; email: string; name: string }[]
  >([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    floor: 1,
    manager: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch all StoreManagers to populate dropdown
    fetchAPI("/auth/store-managers", {}, token)
      .then((data) => setManagers(data.managers || []))
      .catch((error) => setError("Failed to load managers" + error.message));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await fetchAPI(
        "/stores",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        token!
      );
      setSuccess("Store created successfully");
      setForm({ name: "", category: "", floor: 1, manager: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Store</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-500 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Store Name"
          className="input input-bordered w-full"
          value={form.name}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          className="select select-bordered w-full"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          <option value="fashion">Fashion</option>
          <option value="electronics">Electronics</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="food">Food</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>

        <input
          name="floor"
          type="number"
          min={1}
          placeholder="Floor Number"
          className="input input-bordered w-full"
          value={form.floor}
          onChange={handleChange}
          required
        />

        <select
          name="manager"
          className="select select-bordered w-full"
          value={form.manager}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Manager
          </option>
          {managers.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-primary w-full">
          Create Store
        </button>
      </form>
    </div>
  );
}
