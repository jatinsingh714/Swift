import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getDashboardStats } from "../api/dashboard";
import Alert from "../components/Alert";
import Dashboard3D from "../components/Dashboard3D";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

const statLabels = [
  { key: "total_products", label: "Total Products", icon: "▦", tone: "blue" },
  { key: "total_customers", label: "Total Customers", icon: "◉", tone: "teal" },
  { key: "total_orders", label: "Total Orders", icon: "↗", tone: "indigo" },
  { key: "low_stock_products", label: "Low Stock Products", icon: "!", tone: "cyan" },
];

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let frame = 0;
    const totalFrames = 36;

    function tick() {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplay(Math.round(target * progress));
      if (frame < totalFrames) requestAnimationFrame(tick);
    }

    tick();
  }, [value]);

  return display.toLocaleString();
}

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
            <article className={`stat-card stat-card-${stat.tone}`} key={stat.key}>
              <div className="stat-card-top">
                <span>{stat.label}</span>
                <i aria-hidden="true">{stat.icon}</i>
              </div>
              <strong>
                <AnimatedNumber value={stats[stat.key]} />
              </strong>
              <small>Synced from live records</small>
            </article>
          ))}
        </div>
      ) : null}

      <div className="dashboard-grid">
        <Dashboard3D />
        <div className="panel">
          <span className="eyebrow">Control Center</span>
          <h3>Quick Actions</h3>
          <p className="panel-copy">
            Jump into the core operational workflows without losing context.
          </p>
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
