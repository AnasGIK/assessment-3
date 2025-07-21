"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Store = {
  _id: string;
  name: string;
  location: string;
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAPI("/stores", {}, token)
      .then((data) => setStores(data))
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch stores");
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Stores</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {stores.length > 1 &&
              stores.map((store) => (
                <tr key={store._id}>
                  <td>{store.name}</td>
                  <td>{store.location}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
