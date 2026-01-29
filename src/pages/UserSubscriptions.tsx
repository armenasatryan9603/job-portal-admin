import React, { useEffect, useState } from "react";
import { apiService } from "../categories/api";

interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  User: {
    id: number;
    name: string;
    email?: string;
  };
  Plan: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
}

const UserSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadSubscriptions();
  }, [page]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllSubscriptions(page, limit);
      setSubscriptions(data.subscriptions || []);
      setPagination(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !subscriptions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Subscriptions</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <li key={subscription.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {subscription.User.name}
                    </h3>
                    <span
                      className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        subscription.status
                      )}`}
                    >
                      {subscription.status}
                    </span>
                    {subscription.autoRenew && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Auto-Renew
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {subscription.User.email || "No email"}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">
                      {subscription.Plan.name}
                    </span>
                    <span className="ml-2">
                      ({subscription.Plan.price.toLocaleString()}{" "}
                      {subscription.Plan.currency})
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Start:{" "}
                    {new Date(subscription.startDate).toLocaleDateString()} •
                    End: {new Date(subscription.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptions;
