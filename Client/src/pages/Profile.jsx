import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserById, updateUserProfile, deleteUserAccount } from '../api/users';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    fetchUserById(user.id)
      .then((res) => {
        const u = res.data.data;
        setForm({ name: u.name, email: u.email, password: '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setFetching(false));
  }, [user]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const res = await updateUserProfile(user.id, payload);
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setForm(f => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUserAccount(user.id);
      logout();
      toast.success('Account deleted');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: '' }); };

  if (fetching) return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="card space-y-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-dark border border-brand-border flex items-center justify-center text-xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-brand-muted text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input type="text" value={form.name} onChange={set('name')} className="input" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="label">New Password <span className="text-brand-muted font-normal">(leave blank to keep current)</span></label>
            <input type="password" value={form.password} onChange={set('password')} className="input" placeholder="••••••••" />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card border-red-500/20">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-brand-muted text-sm mb-4">Once you delete your account, there is no going back.</p>
        <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-sm px-4 py-2">
          Delete Account
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="card max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-brand-muted text-sm mb-6">This will permanently delete your account and all data.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
