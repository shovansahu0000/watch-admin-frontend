import apiClient from './axiosClient';

// Brands
export async function getBrands() {
  const res = await apiClient.get('/brands');
  return res.data.data.brands;
}

export async function createBrand(brand) {
  const res = await apiClient.post('/brands/admin', brand);
  return res.data;
}

export async function updateBrand(id, brand) {
  const res = await apiClient.put(`/brands/admin/${id}`, brand);
  return res.data;
}

export async function deleteBrand(id) {
  const res = await apiClient.delete(`/brands/admin/${id}`);
  return res.data;
}

// Products
export async function getProducts() {
  const res = await apiClient.get('/products');
  return res.data.data.products;
}

export async function createProduct(product) {
  const res = await apiClient.post('/products/admin', product);
  return res.data;
}

export async function updateProduct(sku, product) {
  const res = await apiClient.put(`/products/admin/${sku}`, product);
  return res.data;
}

export async function deleteProduct(sku) {
  const res = await apiClient.delete(`/products/admin/${sku}`);
  return res.data;
}

// Coupons
export async function getCoupons() {
  const res = await apiClient.get('/coupons/admin');
  return res.data.data.coupons;
}

export async function createCoupon(coupon) {
  const res = await apiClient.post('/coupons/admin', coupon);
  return res.data;
}

export async function updateCoupon(id, coupon) {
  const res = await apiClient.put(`/coupons/admin/${id}`, coupon);
  return res.data;
}

export async function deleteCoupon(id) {
  const res = await apiClient.delete(`/coupons/admin/${id}`);
  return res.data;
}

