import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../api/services';
import { setBrands } from '../store/dataSlice';

export default function Brands() {
  const dispatch = useDispatch();
  const { brands } = useSelector(state => state.data);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', logo: '' });

  const loadBrands = async () => {
    setLoading(true);
    const data = await getBrands();
    dispatch(setBrands(data));
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openModal = (brand = null) => {
    if (brand) {
      setCurrentBrand(brand);
      setFormData({ name: brand.name, description: brand.description || '', logo: brand.logo || '' });
    } else {
      setCurrentBrand(null);
      setFormData({ name: '', description: '', logo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBrand(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentBrand) {
        await updateBrand(currentBrand._id, formData);
      } else {
        await createBrand(formData);
      }
      closeModal();
      loadBrands();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save brand");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteBrand(id);
        loadBrands();
      } catch (error) {
        alert("Failed to delete brand");
      }
    }
  };

  return (
    <div>
      <div className="header-row">
        <h1>Brands</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Add Brand
        </button>
      </div>
      
      <div className="card" style={{ padding: '30px', minHeight: '400px' }}>
        {loading ? <p>Loading...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b._id}>
                  <td>{b.logo ? <img src={b.logo} alt={b.name} style={{height: 40}} /> : 'N/A'}</td>
                  <td>{b.name}</td>
                  <td>{b.description || '-'}</td>
                  <td>
                    <button className="btn" style={{padding: '6px', marginRight: '8px'}} onClick={() => openModal(b)}><Edit2 size={16} /></button>
                    <button className="btn" style={{padding: '6px', color: '#ef4444'}} onClick={() => handleDelete(b._id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No brands found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginTop: 0}}>{currentBrand ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <input className="input" placeholder="Brand Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <textarea className="input" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              <input className="input" placeholder="Logo URL" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} />
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
