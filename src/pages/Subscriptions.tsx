import React, { useEffect, useState } from "react";
import { apiService } from "../categories/api";

interface SubscriptionPlan {
  id: number;
  name: string;
  nameEn?: string;
  nameRu?: string;
  nameHy?: string;
  description?: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  durationDays: number;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
  features?: any;
  featuresDescription?: Array<{ key: string; label: string }>;
}

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

interface MarketSubscription {
  id: number;
  marketId: number;
  userId: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  User: {
    id: number;
    name: string;
    email?: string;
  };
  Market: {
    id: number;
    name: string;
    nameEn?: string;
    nameRu?: string;
    nameHy?: string;
  };
  SubscriptionPlan: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
}

const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [marketSubscriptions, setMarketSubscriptions] = useState<MarketSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "users" | "markets">("plans");
  const [userSubsPage, setUserSubsPage] = useState(1);
  const [marketSubsPage, setMarketSubsPage] = useState(1);
  const [userSubsPagination, setUserSubsPagination] = useState<any>(null);
  const [marketSubsPagination, setMarketSubsPagination] = useState<any>(null);
  const [markingExpired, setMarkingExpired] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "cancelled">("all");
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    nameRu: "",
    nameHy: "",
    description: "",
    descriptionEn: "",
    descriptionRu: "",
    descriptionHy: "",
    price: "",
    oldPrice: "",
    currency: "AMD",
    durationDays: "",
    isRecurring: false,
    isActive: true,
    features: {
      unlimitedApplications: false,
      publishPermanentOrders: false,
      publishMarkets: false,
    },
  });

  useEffect(() => {
    loadPlans();
    loadUserSubscriptions();
    loadMarketSubscriptions();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      loadUserSubscriptions();
    }
  }, [userSubsPage]);

  useEffect(() => {
    if (activeTab === "markets") {
      loadMarketSubscriptions();
    }
  }, [marketSubsPage]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllPlansAdmin();
      setPlans(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const data = await apiService.getAllSubscriptions(userSubsPage, 20);
      setUserSubscriptions(data.subscriptions || []);
      setUserSubsPagination(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user subscriptions");
    }
  };

  const loadMarketSubscriptions = async () => {
    try {
      const data = await apiService.getAllMarketSubscriptions(marketSubsPage, 20);
      setMarketSubscriptions(data.subscriptions || []);
      setMarketSubsPagination(data);
    } catch (err: any) {
      setError(err.message || "Failed to load market subscriptions");
    }
  };

  const handleCancelUserSubscription = async (subscriptionId: number) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }
    try {
      await apiService.cancelUserSubscription(subscriptionId);
      loadUserSubscriptions();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to cancel subscription");
    }
  };

  const handleExtendUserSubscription = async (subscriptionId: number) => {
    const days = window.prompt("Enter number of days to extend:");
    if (!days || isNaN(parseInt(days))) {
      return;
    }
    try {
      await apiService.extendUserSubscription(subscriptionId, parseInt(days));
      loadUserSubscriptions();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to extend subscription");
    }
  };

  const handleCancelMarketSubscription = async (subscriptionId: number) => {
    if (!window.confirm("Are you sure you want to cancel this market subscription?")) {
      return;
    }
    try {
      await apiService.cancelMarketSubscription(subscriptionId);
      loadMarketSubscriptions();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to cancel market subscription");
    }
  };

  const handleExtendMarketSubscription = async (subscriptionId: number) => {
    const days = window.prompt("Enter number of days to extend:");
    if (!days || isNaN(parseInt(days))) {
      return;
    }
    try {
      await apiService.extendMarketSubscription(subscriptionId, parseInt(days));
      loadMarketSubscriptions();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to extend market subscription");
    }
  };

  const handleMarkExpiredSubscriptions = async () => {
    if (!window.confirm("This will mark all expired subscriptions (with endDate < now) as expired. Continue?")) {
      return;
    }
    try {
      setMarkingExpired(true);
      const result = await apiService.markExpiredSubscriptions();
      alert(`Success! ${result.message || `Marked ${result.total || 0} subscription(s) as expired`}`);
      // Reload subscriptions to show updated statuses
      loadUserSubscriptions();
      loadMarketSubscriptions();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to mark expired subscriptions");
    } finally {
      setMarkingExpired(false);
    }
  };

  // Helper function to check if subscription is actually expired (even if status is still "active")
  const isActuallyExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  // Helper function to get days remaining/expired
  const getDaysStatus = (endDate: string): { text: string; color: string; isExpired: boolean; daysRemaining: number } => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)} day(s) ago`, color: "text-red-600", isExpired: true, daysRemaining: diffDays };
    } else if (diffDays === 0) {
      return { text: "Expires today", color: "text-orange-600", isExpired: false, daysRemaining: 0 };
    } else if (diffDays <= 7) {
      return { text: `Expires in ${diffDays} day(s)`, color: "text-orange-600", isExpired: false, daysRemaining: diffDays };
    } else {
      return { text: `${diffDays} days remaining`, color: "text-gray-600", isExpired: false, daysRemaining: diffDays };
    }
  };

  // Helper function to check if subscription is expiring soon (≤7 days or expires today)
  const isExpiringSoon = (endDate: string): boolean => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Handler to send expiration notification
  const handleSendExpirationNotification = async (userId: number, userName: string, endDate: string, planName: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let daysText = "";
    if (diffDays === 0) {
      daysText = "today";
    } else if (diffDays === 1) {
      daysText = "in 1 day";
    } else {
      daysText = `in ${diffDays} days`;
    }

    const title = "Subscription Expiring Soon";
    const message = `Hello ${userName},\n\nYour subscription "${planName}" is expiring ${daysText}. Please renew your subscription to continue enjoying all the benefits.\n\nThank you for being with us!`;

    if (!window.confirm(`Send expiration notification to ${userName}?`)) {
      return;
    }

    try {
      await apiService.sendNotification(userId, title, message, "admin");
      alert(`Notification sent successfully to ${userName}`);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    }
  };

  // Filter subscriptions based on status filter
  const filterSubscriptions = <T extends { status: string; endDate: string }>(subscriptions: T[]): T[] => {
    if (statusFilter === "all") {
      return subscriptions;
    }
    return subscriptions.filter((sub) => {
      if (statusFilter === "expired") {
        // Include both status="expired" and actually expired (endDate < now)
        return sub.status === "expired" || isActuallyExpired(sub.endDate);
      }
      return sub.status === statusFilter;
    });
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      nameEn: "",
      nameRu: "",
      nameHy: "",
      description: "",
      descriptionEn: "",
      descriptionRu: "",
      descriptionHy: "",
      price: "",
      oldPrice: "",
      currency: "AMD",
      durationDays: "",
      isRecurring: false,
      isActive: true,
      features: {
        unlimitedApplications: false,
        publishPermanentOrders: false,
        publishMarkets: false,
      },
    });
    setShowForm(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      nameEn: plan.nameEn || "",
      nameRu: plan.nameRu || "",
      nameHy: plan.nameHy || "",
      description: plan.description || "",
      descriptionEn: "",
      descriptionRu: "",
      descriptionHy: "",
      price: plan.price.toString(),
      oldPrice: plan.oldPrice ? plan.oldPrice.toString() : "",
      currency: plan.currency,
      durationDays: plan.durationDays.toString(),
      isRecurring: plan.isRecurring,
      isActive: plan.isActive,
      features: plan.features || {
        unlimitedApplications: false,
        publishPermanentOrders: false,
        publishMarkets: false,
      },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
      };
      
      // Handle oldPrice: convert empty string to null, otherwise parse as float
      if (formData.oldPrice === "" || formData.oldPrice === null || formData.oldPrice === undefined) {
        data.oldPrice = null;
      } else {
        data.oldPrice = parseFloat(formData.oldPrice);
      }

      if (editingPlan) {
        await apiService.updateSubscriptionPlan(editingPlan.id, data);
      } else {
        await apiService.createSubscriptionPlan(data);
      }

      setShowForm(false);
      setEditingPlan(null);
      loadPlans();
    } catch (err: any) {
      setError(err.message || "Failed to save subscription plan");
    }
  };

  if (loading && !plans.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading subscription plans...</div>
      </div>
    );
  }

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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions Management</h1>
        {activeTab === "plans" && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Plan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("plans")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plans"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Subscriptions
          </button>
          <button
            onClick={() => setActiveTab("markets")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "markets"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Market Subscriptions
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <>
          {showForm && (
        <div className="bg-white shadow rounded-lg mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingPlan ? "Edit Plan" : "Create Plan"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Price (optional, for discount display)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.oldPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Leave empty if no discount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="AMD">AMD</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, durationDays: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.unlimitedApplications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          unlimitedApplications: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Unlimited order applications (no credit cost)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.publishPermanentOrders}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          publishPermanentOrders: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Publish permanent/bookable orders
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.features.publishMarkets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          publishMarkets: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Publish markets/services
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Recurring</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingPlan ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {plans.map((plan) => (
                <li key={plan.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {plan.name}
                        </h3>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            plan.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                        {plan.isRecurring && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {plan.description}
                      </p>
                      <div className="mt-2 text-sm text-gray-600">
                        {plan.oldPrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold line-through text-gray-400">
                              {plan.oldPrice.toLocaleString()} {plan.currency}
                            </span>
                            <span className="font-semibold text-green-600">
                              {plan.price.toLocaleString()} {plan.currency}
                            </span>
                            <span className="ml-2">for {plan.durationDays} days</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-semibold">
                              {plan.price.toLocaleString()} {plan.currency}
                            </span>
                            <span className="ml-2">for {plan.durationDays} days</span>
                          </>
                        )}
                      </div>
                      {/* Features Mapping */}
                      {plan.featuresDescription && plan.featuresDescription.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">
                            Features:
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {plan.featuresDescription.map((feature, idx) => (
                              <li key={idx}>{feature.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(!plan.featuresDescription || plan.featuresDescription.length === 0) && (
                        <div className="mt-2 text-xs text-gray-400 italic">
                          No features defined
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="ml-4 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* User Subscriptions Tab */}
      {activeTab === "users" && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={handleMarkExpiredSubscriptions}
              disabled={markingExpired}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {markingExpired ? "Marking..." : "Mark Expired Subscriptions"}
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filterSubscriptions(userSubscriptions).map((subscription) => {
                const daysStatus = getDaysStatus(subscription.endDate);
                const actuallyExpired = isActuallyExpired(subscription.endDate);
                return (
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
                      {actuallyExpired && subscription.status === "active" && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                          ⚠️ Actually Expired
                        </span>
                      )}
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
                    <div className={`mt-1 text-xs font-medium ${daysStatus.color}`}>
                      {daysStatus.text}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {subscription.status === "active" && (
                      <>
                        <button
                          onClick={() => handleCancelUserSubscription(subscription.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleExtendUserSubscription(subscription.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Extend
                        </button>
                      </>
                    )}
                    {subscription.status === "active" && isExpiringSoon(subscription.endDate) && (
                      <button
                        onClick={() => handleSendExpirationNotification(
                          subscription.User.id,
                          subscription.User.name,
                          subscription.endDate,
                          subscription.Plan.name
                        )}
                        className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                        title="Send expiration reminder notification"
                      >
                        📧 Notify
                      </button>
                    )}
                  </div>
                </div>
                  </li>
                );
              })}
            </ul>
          </div>
          {userSubsPagination && userSubsPagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-center items-center space-x-2">
              <button
                onClick={() => setUserSubsPage(userSubsPage - 1)}
                disabled={userSubsPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {userSubsPage} of {userSubsPagination.totalPages}
              </span>
              <button
                onClick={() => setUserSubsPage(userSubsPage + 1)}
                disabled={userSubsPage >= userSubsPagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Market Subscriptions Tab */}
      {activeTab === "markets" && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={handleMarkExpiredSubscriptions}
              disabled={markingExpired}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {markingExpired ? "Marking..." : "Mark Expired Subscriptions"}
            </button>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filterSubscriptions(marketSubscriptions).map((subscription) => {
                const daysStatus = getDaysStatus(subscription.endDate);
                const actuallyExpired = isActuallyExpired(subscription.endDate);
                return (
                  <li key={subscription.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {subscription.Market.name || subscription.Market.nameEn || `Market #${subscription.Market.id}`}
                      </h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          subscription.status
                        )}`}
                      >
                        {subscription.status}
                      </span>
                      {actuallyExpired && subscription.status === "active" && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                          ⚠️ Actually Expired
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Owner: {subscription.User.name} ({subscription.User.email || "No email"})
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">
                        {subscription.SubscriptionPlan.name}
                      </span>
                      <span className="ml-2">
                        ({subscription.SubscriptionPlan.price.toLocaleString()}{" "}
                        {subscription.SubscriptionPlan.currency})
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Start:{" "}
                      {new Date(subscription.startDate).toLocaleDateString()} •
                      End: {new Date(subscription.endDate).toLocaleDateString()}
                    </div>
                    <div className={`mt-1 text-xs font-medium ${daysStatus.color}`}>
                      {daysStatus.text}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {subscription.status === "active" && (
                      <>
                        <button
                          onClick={() => handleCancelMarketSubscription(subscription.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleExtendMarketSubscription(subscription.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Extend
                        </button>
                      </>
                    )}
                    {subscription.status === "active" && isExpiringSoon(subscription.endDate) && (
                      <button
                        onClick={() => handleSendExpirationNotification(
                          subscription.User.id,
                          subscription.User.name,
                          subscription.endDate,
                          subscription.SubscriptionPlan.name
                        )}
                        className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
                        title="Send expiration reminder notification"
                      >
                        📧 Notify
                      </button>
                    )}
                  </div>
                </div>
              </li>
                );
              })}
            </ul>
          </div>
          {marketSubsPagination && marketSubsPagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-center items-center space-x-2">
              <button
                onClick={() => setMarketSubsPage(marketSubsPage - 1)}
                disabled={marketSubsPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {marketSubsPage} of {marketSubsPagination.totalPages}
              </span>
              <button
                onClick={() => setMarketSubsPage(marketSubsPage + 1)}
                disabled={marketSubsPage >= marketSubsPagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Subscriptions;
