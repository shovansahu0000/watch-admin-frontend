import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, getBrands } from '../api/services';
import { setProducts, setBrands } from '../store/dataSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { products, brands } = useSelector(state => state.data);

  useEffect(() => {
    const fetchData = async () => {
      if (products.length === 0) {
        getProducts().then(res => dispatch(setProducts(res)));
      }
      if (brands.length === 0) {
        getBrands().then(res => dispatch(setBrands(res)));
      }
    };
    fetchData();
  }, [dispatch, products.length, brands.length]);

  return (
    <div>
      <div className="header-row">
        <h1>Overview</h1>
      </div>

      <div className="card-grid">
        <div className="stat-card card">
          <span className="stat-title">Active Products</span>
          <span className="stat-value">{products.length}</span>
        </div>
        <div className="stat-card card">
          <span className="stat-title">Brands</span>
          <span className="stat-value">{brands.length}</span>
        </div>
      </div>
    </div>
  );
}
