import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon, Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, createProduct, updateProduct, deleteProduct, getBrands } from '../api/services';
import { setProducts, setBrands } from '../store/dataSlice';

export default function Products() {
  const dispatch = useDispatch();
  const { products, brands } = useSelector(state => state.data);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const brandOptions = useMemo(() => {
    const set = new Set();
    if (Array.isArray(brands)) {
      brands.forEach(b => {
        if (b?.name) set.add(b.name.trim());
      });
    }
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p?.brand) set.add(p.brand.trim());
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const query = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      if (selectedBrand !== 'all') {
        if (!p.brand || p.brand.trim().toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      if (query) {
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(query) : false;
        if (!nameMatch && !skuMatch) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedBrand, searchQuery]);

  const initialForm = {
    sku: '', name: '', brand: '', category: 'Male', price: '', mrp: '', stockQuantity: '', description: '', movement: '', caseSize: '', waterResistance: '', bestSeller: false
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState({ front: null, left: null, right: null });
  const [imagePreviews, setImagePreviews] = useState({ front: '', left: '', right: '' });

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
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        mrp: product.mrp || '',
        stockQuantity: product.stockQuantity,
        description: product.description || '',
        movement: product.movement || '',
        caseSize: product.caseSize || '',
        waterResistance: product.waterResistance || '',
        bestSeller: product.bestSeller || false
      });
      setImageFiles({ front: null, left: null, right: null });
      setImagePreviews({
        front: product.images?.front || product.image || '',
        left: product.images?.left || '',
        right: product.images?.right || ''
      });
    } else {
      setCurrentProduct(null);
      setFormData(initialForm);
      setImageFiles({ front: null, left: null, right: null });
      setImagePreviews({ front: '', left: '', right: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleImageChange = (view, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP, etc.)');
      return;
    }

    setImageFiles(prev => ({ ...prev, [view]: file }));
    setImagePreviews(prev => ({ ...prev, [view]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentProduct) {
      if (!imageFiles.front || !imageFiles.left || !imageFiles.right) {
        alert('All 3 images (Front View, Left View, and Right View) are required to create a watch.');
        return;
      }
    } else {
      if (!imagePreviews.front && !imageFiles.front) {
        alert('Front View image is required.');
        return;
      }
      if (!imagePreviews.left && !imageFiles.left) {
        alert('Left View image is required.');
        return;
      }
      if (!imagePreviews.right && !imageFiles.right) {
        alert('Right View image is required.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('brand', formData.brand);
      formPayload.append('category', formData.category);
      formPayload.append('price', Number(formData.price));
      if (formData.mrp && String(formData.mrp).trim() !== '') {
        formPayload.append('mrp', Number(formData.mrp));
      } else if (currentProduct) {
        formPayload.append('mrp', '');
      }
      formPayload.append('stockQuantity', Number(formData.stockQuantity));
      formPayload.append('bestSeller', formData.bestSeller);

      ['description', 'movement', 'caseSize', 'waterResistance'].forEach(field => {
        if (formData[field] && formData[field].trim() !== '') {
          formPayload.append(field, formData[field].trim());
        } else if (currentProduct) {
          formPayload.append(field, '');
        }
      });

      if (currentProduct) {
        if (imageFiles.front) formPayload.append('front', imageFiles.front);
        if (imageFiles.left) formPayload.append('left', imageFiles.left);
        if (imageFiles.right) formPayload.append('right', imageFiles.right);

        await updateProduct(currentProduct.sku, formPayload);
      } else {
        formPayload.append('sku', formData.sku);
        formPayload.append('front', imageFiles.front);
        formPayload.append('left', imageFiles.left);
        formPayload.append('right', imageFiles.right);

        await createProduct(formPayload);
      }

      closeModal();
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sku, name) => {
    if (window.confirm(`Are you sure you want to delete watch "${name}" (${sku})? This will also remove all 3 images from Cloudinary.`)) {
      try {
        await deleteProduct(sku);
        loadData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const imageConfig = [
    { key: 'front', label: 'Front View (Primary)' },
    { key: 'left', label: 'Left View' },
    { key: 'right', label: 'Right View' },
  ];

  return (
    <div>
      <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1>Products</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '580px', margin: '0 12px' }}>
          <div style={{ minWidth: '160px', flex: '0 0 auto' }}>
            <select
              className="input"
              style={{
                height: '40px',
                padding: '6px 12px',
                fontSize: '0.88rem',
                backgroundColor: 'var(--card-bg, #1a2234)',
                cursor: 'pointer'
              }}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              className="input"
              style={{
                height: '40px',
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '12px',
                fontSize: '0.88rem',
                backgroundColor: 'var(--card-bg, #1a2234)'
              }}
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {(selectedBrand !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              style={{
                height: '40px',
                padding: '0 12px',
                fontSize: '0.82rem',
                whiteSpace: 'nowrap',
                color: 'var(--text-secondary)'
              }}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => openModal()} style={{ flexShrink: 0 }}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="card" style={{ padding: '30px', minHeight: '400px' }}>
        {loading ? <p>Loading...</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Images</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <img
                        src={p.images?.front || p.image || '/placeholder-watch.png'}
                        alt={`${p.name} Front`}
                        title="Front View"
                        style={{ height: 42, width: 42, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }}
                      />
                      {p.images?.left && (
                        <img
                          src={p.images.left}
                          alt={`${p.name} Left`}
                          title="Left View"
                          style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: 4, opacity: 0.85, border: '1px solid var(--border-color)' }}
                        />
                      )}
                      {p.images?.right && (
                        <img
                          src={p.images.right}
                          alt={`${p.name} Right`}
                          title="Right View"
                          style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: 4, opacity: 0.85, border: '1px solid var(--border-color)' }}
                        />
                      )}
                    </div>
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.brand}</td>
                  <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" style={{ padding: '6px' }} onClick={() => openModal(p)} title="Edit Watch">
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn"
                        style={{ padding: '6px', color: '#f87171' }}
                        onClick={() => handleDelete(p.sku, p.name)}
                        title="Delete Watch & Cloudinary Images"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    {products.length === 0
                      ? 'No products found.'
                      : 'No products match the selected filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ overflowY: 'auto', padding: '20px' }}>
          <div className="modal-content" style={{ maxWidth: '780px', margin: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>{currentProduct ? 'Edit Product' : 'Add New Watch'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SKU *</label>
                  <input className="input" placeholder="e.g. ROLEX-SUB-01" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} disabled={!!currentProduct} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Watch Name *</label>
                  <input className="input" placeholder="e.g. Submariner Date" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Brand *</label>
                  <select className="input" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} required>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Category *</label>
                  <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Selling Price (₹) *</label>
                  <input type="number" className="input" placeholder="Price in ₹" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>MRP (₹)</label>
                  <input type="number" className="input" placeholder="MRP in ₹" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Stock Quantity *</label>
                  <input type="number" className="input" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} required />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Movement</label>
                  <input className="input" placeholder="e.g. Automatic, Quartz" value={formData.movement} onChange={e => setFormData({ ...formData, movement: e.target.value })} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Case Size</label>
                  <input className="input" placeholder="e.g. 41mm" value={formData.caseSize} onChange={e => setFormData({ ...formData, caseSize: e.target.value })} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Water Resistance</label>
                  <input className="input" placeholder="e.g. 300m / 1000ft" value={formData.waterResistance} onChange={e => setFormData({ ...formData, waterResistance: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '5px', padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} color="var(--accent-color)" />
                    Watch Images (3 Required Views: Left, Front, Right)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Max 10MB each · Cloudinary uploaded
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {imageConfig.map(({ key, label }) => {
                    const hasPreview = !!imagePreviews[key];
                    const hasNewFile = !!imageFiles[key];

                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          background: 'var(--card-bg)',
                          padding: '12px',
                          borderRadius: '8px',
                          border: hasNewFile ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {label}
                          </span>
                          {hasNewFile && (
                            <span style={{ fontSize: '0.68rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                              New file
                            </span>
                          )}
                        </div>
                        <div
                          onClick={() => document.getElementById(`upload-${key}`).click()}
                          style={{
                            height: '140px',
                            width: '100%',
                            background: '#090d16',
                            borderRadius: '6px',
                            border: hasPreview ? '1px solid var(--border-color)' : '1px dashed #475569',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          {hasPreview ? (
                            <>
                              <img
                                src={imagePreviews[key]}
                                alt={label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.45)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  color: '#fff',
                                  fontSize: '0.8rem',
                                  fontWeight: 500,
                                  gap: '6px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                              >
                                <Upload size={16} /> Click to replace
                              </div>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '10px' }}>
                              <Upload size={24} style={{ marginBottom: '6px', opacity: 0.7 }} />
                              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 500 }}>Click to upload</p>
                              <p style={{ margin: '3px 0 0', fontSize: '0.68rem', opacity: 0.6 }}>JPG, PNG, WEBP</p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`upload-${key}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg,image/avif"
                          style={{ display: 'none' }}
                          onChange={e => handleImageChange(key, e)}
                        />

                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.78rem',
                            justifyContent: 'center',
                            borderStyle: 'dashed'
                          }}
                          onClick={() => document.getElementById(`upload-${key}`).click()}
                        >
                          <Upload size={13} />
                          {hasPreview ? 'Change Image' : 'Select Image'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={formData.bestSeller}
                  onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.95rem' }}>Mark as Best Seller (Featured Watch)</span>
              </label>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  className="input"
                  placeholder="Detailed description of the luxury watch..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Uploading & Saving...
                    </>
                  ) : (
                    'Save Watch'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
