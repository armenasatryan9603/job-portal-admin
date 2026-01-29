import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../categories/api";
import type { User, UsersResponse } from "../types";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deletedFilter, setDeletedFilter] = useState("");
  const [pagination, setPagination] = useState<
    UsersResponse["pagination"] | null
  >(null);

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, deletedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers(
        page,
        limit,
        search || undefined,
        roleFilter || undefined,
        deletedFilter || undefined
      );
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPage(1);
  };

  const handleDeletedFilter = (deleted: string) => {
    setDeletedFilter(deleted);
    setPage(1);
  };

  if (loading && !users.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={deletedFilter}
              onChange={(e) => handleDeletedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Users</option>
              <option value="false">Active Users</option>
              <option value="true">Soft Deleted</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                to={`/users/${user.id}`}
                className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatarUrl ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email || user.phone || "No contact info"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    {user.verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    {user.deletedAt && (() => {
                      const deletedDate = new Date(user.deletedAt);
                      const daysSinceDeleted = Math.floor((Date.now() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isNearExpiry = daysSinceDeleted >= 80;
                      return (
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isNearExpiry 
                              ? "bg-orange-100 text-orange-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            Deleted {daysSinceDeleted} days ago
                          </span>
                          {isNearExpiry && (
                            <span className="text-xs text-orange-600 mt-1">
                              Near 90-day expiry
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <div className="text-sm text-gray-500">
                      Credits: {user.creditBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
