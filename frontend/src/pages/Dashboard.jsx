import { Link } from "react-router-dom";

import { getDashboardStats } from "../api/dashboard";
import Alert from "../components/Alert";
import Dashboard3D from "../components/Dashboard3D";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

const statLabels = [
  { key: "total_products", label: "Total Products" },
  { key: "total_customers", label: "Total Customers" },
  { key: "total_orders", label: "Total Orders" },
  { key: "low_stock_products", label: "Low Stock Products" },
];

export default function Dashboard() {
  const { data: stats, loading, error } = useAsyncData(getDashboardStats, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="A quick operational snapshot of products, customers, orders, and low-stock inventory."
      />

      {loading ? <LoadingState /> : null}
      <Alert>{error}</Alert>

      {stats ? (
        <div className="stat-grid">
          {statLabels.map((stat) => (
            <article className="stat-card" key={stat.key}>
              <span>{stat.label}</span>
              <strong>{stats[stat.key]}</strong>
            </article>
          ))}
        </div>
      ) : null}

      <div className="dashboard-grid">
        <Dashboard3D />
        <div className="panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/products" className="button button-secondary">
              Manage Products
            </Link>
            <Link to="/customers" className="button button-secondary">
              Manage Customers
            </Link>
            <Link to="/orders" className="button button-primary">
              Create Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
