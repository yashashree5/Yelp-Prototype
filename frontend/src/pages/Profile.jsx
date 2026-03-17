import { useState, useEffect } from "react";
import { api } from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const resP = await api.get("/users/me");
      setProfile(resP.data);

      const resPrefs = await api.get("/preferences");
      setPrefs(resPrefs.data || {});

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleProfileUpdate(e) {
    e.preventDefault();
    try {
      await api.put("/users/me", profile);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePrefsUpdate(e) {
    e.preventDefault();
    try {
      await api.put("/preferences", prefs);
      alert("Preferences updated!");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleProfileUpdate}>
        <input className="form-control mb-2" placeholder="Name" value={profile.name || ""} onChange={e => setProfile({...profile, name:e.target.value})}/>
        <input className="form-control mb-2" placeholder="Email" value={profile.email || ""} onChange={e => setProfile({...profile, email:e.target.value})}/>
        <button className="btn btn-primary">Update Profile</button>
      </form>

      <h3 className="mt-4">Preferences</h3>
      <form onSubmit={handlePrefsUpdate}>
        <input className="form-control mb-2" placeholder="Cuisines" value={prefs.cuisines || ""} onChange={e => setPrefs({...prefs, cuisines:e.target.value})}/>
        <input className="form-control mb-2" placeholder="Price range" value={prefs.price_range || ""} onChange={e => setPrefs({...prefs, price_range:e.target.value})}/>
        <button className="btn btn-success">Update Preferences</button>
      </form>
    </div>
  );
}