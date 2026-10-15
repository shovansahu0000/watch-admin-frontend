import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TicketPercent } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/services';
import { setCoupons } from '../store/dataSlice';

export default function Coupons() {
  const dispatch = useDispatch();
  const { coupons } = useSelector((state) => state.data);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiresAt: '',
    isActive: true
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      dispatch(setCoupons(data || []));
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setCurrentCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
        isActive: coupon.isActive ?? true
      });
    } else {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      const dateStr = nextMonth.toISOString().split('T')[0];

      setCurrentCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiresAt: dateStr,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        isActive: formData.isActive
      };

      if (currentCoupon) {
        await updateCoupon(currentCoupon._id, payload);
      } else {
        await createCoupon(payload);
      }
      closeModal();
      loadCoupons();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      try {
        await deleteCoupon(id);
        loadCoupons();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  return (
    <div>
      <div className="header-row">
        <div>
          <h1>Coupons</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Manage discount codes, percentage vouchers, and expiration dates.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      <div className="card" style={{ padding: '30px', minHeight: '400px' }}>
        {loading ? (
          <p>Loading coupons...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Expires On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons && coupons.length > 0 ? (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiresAt) <= new Date();
                  const isActive = c.isActive && !isExpired;

                  return (
                    <tr key={c._id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: '#60a5fa',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem'
                          }}
                        >
                          {c.code}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {c.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} OFF`}
                      </td>
                      <td>
                        {new Date(c.expiresAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        {isActive ? (
                          <span
                            style={{
                              color: '#10b981',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            {isExpired ? 'Expired' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn"
                          style={{ padding: '6px', marginRight: '8px' }}
                          title="Edit Coupon"
                          onClick={() => openModal(c)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn"
                          style={{ padding: '6px', color: '#ef4444' }}
                          title="Delete Coupon"
                          onClick={() => handleDelete(c._id, c.code)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    <TicketPercent size={36} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No coupons created yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {currentCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Coupon Code
                </label>
                <input
                  className="input"
                  placeholder="e.g. LUXURY20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  disabled={!!currentCoupon}
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    opacity: currentCoupon ? 0.7 : 1,
                    cursor: currentCoupon ? 'not-allowed' : 'text'
                  }}
                />
                {currentCoupon && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                    Coupon codes cannot be renamed. To change the code, create a new one.
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Discount Type
                </label>
                <select
                  className="input"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  className="input"
                  type="number"
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  min="1"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Expiry Date
                </label>
                <input
                  className="input"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <label htmlFor="coupon-active" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  Active
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (currentCoupon ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
