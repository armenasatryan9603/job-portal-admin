import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../categories/api";
import type { User } from "../types";
import UserForm from "../components/UserForm";
import SendNotification from "../components/SendNotification";
import SendMessage from "../components/SendMessage";

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserById(parseInt(id!));
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<User>) => {
    await apiService.updateUser(parseInt(id!), data);
    await loadUser();
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!user.deletedAt) {
      alert('User must be soft-deleted first before permanent deletion.');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete user "${user.name}" (ID: ${user.id})? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await apiService.deleteUser(user.id);
      alert('User has been permanently deleted.');
      navigate('/users');
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading user...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/users")}
          className="text-indigo-600 hover:text-indigo-900 mb-4"
        >
          ← Back to Users
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              {user.avatarUrl ? (
                <img
                  className="h-16 w-16 rounded-full mr-4"
                  src={user.avatarUrl}
                  alt={user.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                  <span className="text-gray-600 text-2xl font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-500">
                  {user.email || user.phone || "No contact info"}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!user.deletedAt && (
                <>
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Send Notification
                  </button>
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Send Message
                  </button>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editing ? "Cancel Edit" : "Edit User"}
                  </button>
                </>
              )}
              {user.deletedAt && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : "Permanently Delete User"}
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <UserForm
              user={user}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.email || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.phone || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Verified</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      No
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Credit Balance
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.creditBalance.toFixed(2)}
                </dd>
              </div>
              {user.location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.location}
                  </dd>
                </div>
              )}
              {user.experienceYears && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Experience Years
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.experienceYears}
                  </dd>
                </div>
              )}
              {user.priceMin && user.priceMax && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Price Range
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.priceMin} - {user.priceMax} {user.currency || ""} /{" "}
                    {user.rateUnit || ""}
                  </dd>
                </div>
              )}
              {user.bio && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.bio}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Created At
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </dd>
              </div>
              {user.deletedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Deleted At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {new Date(user.deletedAt).toLocaleString()}
                    </span>
                  </dd>
                </div>
              )}
              {user._count && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Activity
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user._count.Orders} orders, {user._count.Proposals}{" "}
                    proposals, {user._count.Reviews} reviews
                  </dd>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNotificationModal && (
        <SendNotification
          userId={user.id}
          userName={user.name}
          onSuccess={loadUser}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {showMessageModal && (
        <SendMessage
          userId={user.id}
          userName={user.name}
          onSuccess={loadUser}
          onClose={() => setShowMessageModal(false)}
        />
      )}
    </div>
  );
};

export default UserDetail;
