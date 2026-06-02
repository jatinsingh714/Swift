import { Link, useParams } from "react-router-dom";

import { getCustomers } from "../api/customers";
import { getOrder } from "../api/orders";
import { getProducts } from "../api/products";
import Alert from "../components/Alert";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

export default function OrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error } = useAsyncData(() => getOrder(id), [id]);
  const { data: products } = useAsyncData(getProducts, []);
  const { data: customers } = useAsyncData(getCustomers, []);

  const customer = customers?.find((item) => item.id === order?.customer_id);

  return (
    <div className="page-stack">
      <PageHeader
        title={`Order #${id}`}
        description="Complete order information with products, quantities, and total amount."
        actions={
          <Link to="/orders" className="button button-secondary">
            Back to Orders
          </Link>
        }
      />

      {loading ? <LoadingState /> : null}
      <Alert>{error}</Alert>

      {order ? (
        <>
          <div className="detail-grid">
            <article className="stat-card">
              <span>Customer</span>
              <strong>{customer?.full_name || `Customer #${order.customer_id}`}</strong>
              <small>Assigned account</small>
            </article>
            <article className="stat-card">
              <span>Total Amount</span>
              <strong>${order.total_amount}</strong>
              <small>Captured order value</small>
            </article>
            <article className="stat-card">
              <span>Created</span>
              <strong>{new Date(order.created_at).toLocaleString()}</strong>
              <small>Local timestamp</small>
            </article>
          </div>

          <section className="panel table-panel">
            <div className="table-toolbar">
              <div>
                <span className="eyebrow">Line Items</span>
                <h3>Products</h3>
              </div>
              <span className="status-badge status-live">{order.items?.length || 0} products</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{getProductName(products, item.product_id)}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price}</td>
                      <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function getProductName(products, productId) {
  return products?.find((product) => product.id === productId)?.name || `Product #${productId}`;
}
