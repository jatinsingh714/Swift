import { useState } from "react";
import { useForm } from "react-hook-form";

import { getApiError } from "../api/client";
import { createCustomer, deleteCustomer, getCustomers } from "../api/customers";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

const defaultValues = {
  full_name: "",
  email: "",
  phone: "",
};

export default function Customers() {
  const { data: customers, loading, error, reload } = useAsyncData(getCustomers, []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });
  const [message, setMessage] = useState(null);

  async function onSubmit(values) {
    setMessage(null);
    try {
      await createCustomer({
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      reset(defaultValues);
      setMessage({ type: "success", text: "Customer created successfully." });
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function handleDelete(id) {
    setMessage(null);
    try {
      await deleteCustomer(id);
      setMessage({ type: "success", text: "Customer deleted successfully." });
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Customers" description="Add customers and manage the customer list." />
      <div className="grid-two">
        <form className="panel form-panel" onSubmit={handleSubmit(onSubmit)}>
          <h3>Add Customer</h3>
          <label>
            Full Name
            <input {...register("full_name", { required: "Full name is required." })} />
            <span>{errors.full_name?.message}</span>
          </label>
          <label>
            Email
            <input
              type="email"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            <span>{errors.email?.message}</span>
          </label>
          <label>
            Phone
            <input {...register("phone", { required: "Phone is required." })} />
            <span>{errors.phone?.message}</span>
          </label>
          <button className="button button-primary" disabled={isSubmitting}>
            Create Customer
          </button>
          <Alert type={message?.type}>{message?.text}</Alert>
        </form>

        <section className="panel table-panel">
          <h3>Customer Table</h3>
          {loading ? <LoadingState /> : null}
          <Alert>{error}</Alert>
          {!loading && !customers?.length ? <EmptyState label="No customers yet." /> : null}
          {customers?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <button className="button button-danger button-small" onClick={() => handleDelete(customer.id)}>
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
