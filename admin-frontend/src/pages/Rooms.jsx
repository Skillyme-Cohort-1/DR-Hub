import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

import { BACKEND_URL } from '../utils/constants.jsx';

const API_URL = `${BACKEND_URL}/api/rooms`;

export default function Rooms() {
  const { token } = useAuth();  // Get the auth token
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', capacity: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  // Helper function to get headers with auth token
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const loadRooms = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {  // Fixed: removed extra slash
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: formData.name,
          capacity: parseInt(formData.capacity),
          description: formData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Room created!');
        setFormData({ name: '', capacity: '', description: '' });
        loadRooms();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateRoom = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {  // Fixed: removed /admin/rooms
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: formData.name,
          capacity: parseInt(formData.capacity),
          description: formData.description
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Room updated!');
        setEditingId(null);
        setFormData({ name: '', capacity: '', description: '' });
        loadRooms();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deleteRoom = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {  // Fixed: removed /admin/rooms
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        alert('Room deleted!');
        loadRooms();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const editRoom = (room) => {
    setEditingId(room.id);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      description: room.description || ''
    });
  };

  if (loading) return <div className="p-8 text-center">Loading rooms...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Room Management</h1>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Room' : 'Add New Room'}
        </h2>
        <form onSubmit={editingId ? (e) => { e.preventDefault(); updateRoom(editingId); } : createRoom}>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Room Name"
              className="border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Capacity"
              className="border p-2 rounded"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              className="border p-2 rounded col-span-2"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="mt-4 space-x-2">
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
              {editingId ? 'Update Room' : 'Create Room'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', capacity: '', description: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-orange-600 mb-2">{room.name}</h3>
            <p className="text-gray-600 mb-2">👥 Capacity: {room.capacity} people</p>
            <p className="text-gray-500 mb-4">{room.description || 'No description'}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => editRoom(room)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteRoom(room.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
