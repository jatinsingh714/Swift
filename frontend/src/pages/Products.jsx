import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createProduct, deleteProduct, getProducts, updateProduct } from "../api/products";
import { getApiError } from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import useAsyncData from "../hooks/useAsyncData";

const defaultValues = {
  name: "",
  sku: "",
  price: "",
  quantity_in_stock: "",
};

export default function Products() {
  const { data: products, loading, error, reload } = useAsyncData(getProducts, []);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });
  const editingId = watch("id");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!editingId) return;
    const selected = products?.find((product) => product.id === Number(editingId));
    if (selected) {
      setValue("name", selected.name);
      setValue("sku", selected.sku);
      setValue("price", selected.price);
      setValue("quantity_in_stock", selected.quantity_in_stock);
    }
  }, [editingId, products, setValue]);

  async function onSubmit(values) {
    setMessage(null);
    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      price: Number(values.price),
      quantity_in_stock: Number(values.quantity_in_stock),
    };

    try {
      if (values.id) {
        await updateProduct(values.id, payload);
        setMessage({ type: "success", text: "Product updated successfully." });
      } else {
        await createProduct(payload);
        setMessage({ type: "success", text: "Product created successfully." });
      }
      reset(defaultValues);
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function handleDelete(id) {
    setMessage(null);
    try {
      await deleteProduct(id);
      setMessage({ type: "success", text: "Product deleted successfully." });
      await reload();
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  function startEdit(product) {
    reset({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Products"
        description="Create, update, and track product inventory."
      />

      <div className="grid-two">
        <form className="panel form-panel" onSubmit={handleSubmit(onSubmit)}>
          <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
          <input type="hidden" {...register("id")} />
          <label>
            Product Name
            <input {...register("name", { required: "Product name is required." })} />
            <span>{errors.name?.message}</span>
          </label>
          <label>
            SKU
            <input {...register("sku", { required: "SKU is required." })} />
            <span>{errors.sku?.message}</span>
          </label>
          <label>
            Price
            <input
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required.",
                min: { value: 0.01, message: "Price must be greater than zero." },
              })}
            />
            <span>{errors.price?.message}</span>
          </label>
          <label>
            Quantity In Stock
            <input
              type="number"
              {...register("quantity_in_stock", {
                required: "Quantity is required.",
                min: { value: 0, message: "Stock cannot be negative." },
              })}
            />
            <span>{errors.quantity_in_stock?.message}</span>
          </label>
          <div className="form-actions">
            <button className="button button-primary" disabled={isSubmitting}>
              {editingId ? "Update Product" : "Create Product"}
            </button>
            {editingId ? (
              <button type="button" className="button button-ghost" onClick={() => reset(defaultValues)}>
                Cancel
              </button>
            ) : null}
          </div>
          <Alert type={message?.type}>{message?.text}</Alert>
        </form>

        <section className="panel table-panel">
          <h3>Product Table</h3>
          {loading ? <LoadingState /> : null}
          <Alert>{error}</Alert>
          {!loading && !products?.length ? <EmptyState label="No products yet." /> : null}
          {products?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>${product.price}</td>
                      <td>{product.quantity_in_stock}</td>
                      <td className="table-actions">
                        <button className="button button-small" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button className="button button-danger button-small" onClick={() => handleDelete(product.id)}>
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
