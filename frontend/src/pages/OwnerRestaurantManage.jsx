import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function OwnerRestaurantManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (err) {
        setError("Failed to load restaurant.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/restaurants/${id}`, {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        address: restaurant.address,
        city: restaurant.city,
        description: restaurant.description,
        hours: restaurant.hours,
        amenities: restaurant.amenities,
        pricing_tier: restaurant.pricing_tier,
        contact: restaurant.contact,
        photos: restaurant.photos
      });
      navigate('/owner/dashboard');
    } catch (err) {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!restaurant) return <div style={{ padding: 40 }}>{error || 'Restaurant not found'}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>{restaurant.name} — Manage</h1>
      {error && <div style={{ color: '#c00', marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 700 }}>Description</label>
          <textarea value={restaurant.description || ''} onChange={e => setRestaurant({ ...restaurant, description: e.target.value })} style={{ width: '100%', minHeight: 100 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 700 }}>Hours</label>
          <input value={restaurant.hours || ''} onChange={e => setRestaurant({ ...restaurant, hours: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 700 }}>Amenities (comma separated)</label>
          <input value={restaurant.amenities || ''} onChange={e => setRestaurant({ ...restaurant, amenities: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 700 }}>Contact</label>
          <input value={restaurant.contact || ''} onChange={e => setRestaurant({ ...restaurant, contact: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button disabled={saving} style={{ padding: '10px 16px', background: '#d32323', color: '#fff', border: 'none', borderRadius: 6 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
