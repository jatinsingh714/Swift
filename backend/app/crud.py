from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from . import models, schemas

LOW_STOCK_THRESHOLD = 5


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product SKU already exists.",
        ) from exc
    db.refresh(db_product)
    return db_product


def get_products(db: Session) -> list[models.Product]:
    return list(db.scalars(select(models.Product).order_by(models.Product.id.desc())))


def get_product(db: Session, product_id: int) -> models.Product:
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


def update_product(
    db: Session,
    product_id: int,
    product_update: schemas.ProductUpdate,
) -> models.Product:
    product = get_product(db, product_id)
    for key, value in product_update.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product SKU already exists.",
        ) from exc
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()


def create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer email already exists.",
        ) from exc
    db.refresh(db_customer)
    return db_customer


def get_customers(db: Session) -> list[models.Customer]:
    return list(db.scalars(select(models.Customer).order_by(models.Customer.id.desc())))


def get_customer(db: Session, customer_id: int) -> models.Customer:
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()


def create_order(db: Session, order: schemas.OrderCreate) -> models.Order:
    customer = db.get(models.Customer, order.customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    product_ids = [item.product_id for item in order.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate products are not allowed in a single order.",
        )

    products = {
        product.id: product
        for product in db.scalars(
            select(models.Product).where(models.Product.id.in_(product_ids))
        )
    }

    missing_ids = sorted(set(product_ids) - set(products.keys()))
    if missing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Products not found: {missing_ids}",
        )

    total_amount = Decimal("0.00")
    db_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
    db.add(db_order)
    db.flush()

    for item in order.items:
        product = products[item.product_id]
        if product.quantity_in_stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.sku}.",
            )
        product.quantity_in_stock -= item.quantity
        unit_price = Decimal(product.price)
        total_amount += unit_price * item.quantity
        db.add(
            models.OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
        )

    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    return get_order(db, db_order.id)


def get_orders(db: Session) -> list[models.Order]:
    return list(
        db.scalars(
            select(models.Order)
            .options(selectinload(models.Order.items))
            .order_by(models.Order.id.desc())
        )
    )


def get_order(db: Session, order_id: int) -> models.Order:
    order = db.scalar(
        select(models.Order)
        .options(selectinload(models.Order.items))
        .where(models.Order.id == order_id)
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return order


def delete_order(db: Session, order_id: int) -> None:
    order = get_order(db, order_id)
    db.delete(order)
    db.commit()


def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    total_products = db.scalar(select(func.count(models.Product.id))) or 0
    total_customers = db.scalar(select(func.count(models.Customer.id))) or 0
    total_orders = db.scalar(select(func.count(models.Order.id))) or 0
    low_stock_products = (
        db.scalar(
            select(func.count(models.Product.id)).where(
                models.Product.quantity_in_stock <= LOW_STOCK_THRESHOLD
            )
        )
        or 0
    )
    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
    )
