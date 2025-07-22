"use client";
import { fetchAPI } from "@/lib/api";
import { useEffect, useState } from "react";

type WalkInLog = {
  _id: string;
  timestamp: string;
  estimatedCustomerCount: number;
  store: {
    name: string;
  };
};

export default function WalkinLogsPage() {
  const [logs, setLogs] = useState<WalkInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        const data = await fetchAPI("/auth/analytics/walkins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLogs(data.walkInLogs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Walk-In Logs</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && logs.length === 0 && <p>No walk-in logs found.</p>}

      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log._id} className="card bg-base-100 shadow-md p-4">
            <p className="text-lg font-semibold">
              {log.estimatedCustomerCount} customers
            </p>
            <p className="text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </p>
            {log.store?.name && (
              <p className="text-sm text-gray-600">Store: {log.store.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
