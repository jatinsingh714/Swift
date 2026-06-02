import { Link } from "react-router-dom";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { getApiError } from "../api/client";
import { getCustomers } from "../api/customers";
import { createOrder, deleteOrder, getOrders } from "../api/orders";
import { getProducts } from "../api/products";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

const defaultValues = {
  customer_id: "",
  items: [{ product_id: "", quantity: 1 }],
};

export default function Orders() {
  const { data: orders, loading, error, reload } = useAsyncData(getOrders, []);
  const { data: customers } = useAsyncData(getCustomers, []);
  const { data: products, reload: reloadProducts } = useAsyncData(getProducts, []);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const [message, setMessage] = useState(null);

  async function onSubmit(values) {
    setMessage(null);
    try {
      await createOrder({
        customer_id: Number(values.customer_id),
        items: values.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });
      reset(defaultValues);
      setMessage({ type: "success", text: "Order created successfully." });
      await reload();
      await reloadProducts();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function handleDelete(id) {
    setMessage(null);
    try {
      await deleteOrder(id);
      setMessage({ type: "success", text: "Order deleted successfully." });
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Orders" description="Create orders and review order history." />

      <div className="grid-two">
        <form className="panel form-panel" onSubmit={handleSubmit(onSubmit)}>
          <h3>Create Order</h3>
          <label>
            Customer
            <select {...register("customer_id", { required: "Customer is required." })}>
              <option value="">Select customer</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
            <span>{errors.customer_id?.message}</span>
          </label>
          <div className="order-items">
            {fields.map((field, index) => (
              <div className="order-item-row" key={field.id}>
                <label>
                  Product
                  <select {...register(`items.${index}.product_id`, { required: "Product is required." })}>
                    <option value="">Select product</option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.quantity_in_stock} in stock)
                      </option>
                    ))}
                  </select>
                  <span>{errors.items?.[index]?.product_id?.message}</span>
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    {...register(`items.${index}.quantity`, {
                      required: "Quantity is required.",
                      min: { value: 1, message: "Quantity must be at least 1." },
                    })}
                  />
                  <span>{errors.items?.[index]?.quantity?.message}</span>
                </label>
                {fields.length > 1 ? (
                  <button type="button" className="button button-ghost button-small" onClick={() => remove(index)}>
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => append({ product_id: "", quantity: 1 })}
          >
            Add Product
          </button>
          <button className="button button-primary" disabled={isSubmitting}>
            Create Order
          </button>
          <Alert type={message?.type}>{message?.text}</Alert>
        </form>

        <section className="panel table-panel">
          <div className="table-toolbar">
            <div>
              <span className="eyebrow">Fulfillment</span>
              <h3>Orders Table</h3>
            </div>
            <span className="status-badge status-live">Live orders</span>
          </div>
          {loading ? <LoadingState /> : null}
          <Alert>{error}</Alert>
          {!loading && !orders?.length ? <EmptyState label="No orders yet." /> : null}
          {orders?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="table-title">#{order.id}</strong>
                      </td>
                      <td>{getCustomerName(customers, order.customer_id)}</td>
                      <td>
                        <strong>${order.total_amount}</strong>
                      </td>
                      <td>
                        <span className="status-badge">{order.items?.length || 0} items</span>
                      </td>
                      <td className="table-actions">
                        <Link className="button button-secondary button-small" to={`/orders/${order.id}`}>
                          Details
                        </Link>
                        <button className="button button-danger button-small" onClick={() => handleDelete(order.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function getCustomerName(customers, customerId) {
  return customers?.find((customer) => customer.id === customerId)?.full_name || `Customer #${customerId}`;
}
