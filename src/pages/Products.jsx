import { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, createProduct, updateProduct, getBrands } from '../api/services';
import { setProducts, setBrands } from '../store/dataSlice';

export default function Products() {
  const dispatch = useDispatch();
  const { products, brands } = useSelector(state => state.data);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const initialForm = {
    sku: '', name: '', brand: '', category: 'Male', price: '', mrp: '', stockQuantity: '', image: '', description: '', movement: '', caseSize: '', waterResistance: '', bestSeller: false
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    const [pData, bData] = await Promise.all([getProducts(), getBrands()]);
    dispatch(setProducts(pData));
    dispatch(setBrands(bData));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({ 
        sku: product.sku, name: product.name, brand: product.brand, category: product.category, price: product.price, mrp: product.mrp || '', stockQuantity: product.stockQuantity, image: product.image, description: product.description || '', movement: product.movement || '', caseSize: product.caseSize || '', waterResistance: product.waterResistance || '', bestSeller: product.bestSeller || false
      });
    } else {
      setCurrentProduct(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price), stockQuantity: Number(formData.stockQuantity) };
      if (payload.mrp) {
        payload.mrp = Number(payload.mrp);
      } else {
        delete payload.mrp;
      }
      
      ['description', 'movement', 'caseSize', 'waterResistance'].forEach(field => {
        if (payload[field] === '') {
          delete payload[field];
        }
      });

      if (currentProduct) {
        delete payload.sku;
        await updateProduct(currentProduct.sku, payload);
      } else {
        await createProduct(payload);
      }
      closeModal();
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    }
  };

  return (
    <div>
      <div className="header-row">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Add Product
        </button>
      </div>
      
      <div className="card" style={{ padding: '30px', minHeight: '400px' }}>
        {loading ? <p>Loading...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td><img src={p.image} alt={p.name} style={{height: 40, width: 40, objectFit: 'cover', borderRadius: 4}} /></td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <button className="btn" style={{padding: '6px'}} onClick={() => openModal(p)}><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center'}}>No products found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ overflowY: 'auto', padding: '20px' }}>
          <div className="modal-content" style={{ maxWidth: '600px', margin: 'auto' }}>
            <h2 style={{marginTop: 0}}>{currentProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input className="input" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} disabled={!!currentProduct} required />
                <input className="input" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                
                <select className="input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                </select>

                <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <input type="number" className="input" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                <input type="number" className="input" placeholder="MRP" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} />
                
                <input type="number" className="input" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} required />
                <input className="input" placeholder="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required />
                
                <input className="input" placeholder="Movement" value={formData.movement} onChange={e => setFormData({...formData, movement: e.target.value})} />
                <input className="input" placeholder="Case Size" value={formData.caseSize} onChange={e => setFormData({...formData, caseSize: e.target.value})} />
                
                <input className="input" placeholder="Water Resistance" value={formData.waterResistance} onChange={e => setFormData({...formData, waterResistance: e.target.value})} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
                  <input type="checkbox" checked={formData.bestSeller} onChange={e => setFormData({...formData, bestSeller: e.target.checked})} />
                  Best Seller
                </label>
              </div>
              
              <textarea className="input" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
