const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ExportService {
  constructor() {
    this.basePath = process.env.EXPORT_PATH || 'C:\\DRHub-Exports\\';
  }

  async ensureDirectory() {
    const dateFolder = new Date().toISOString().slice(0, 10);
    const fullPath = path.join(this.basePath, dateFolder);
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  }

  async exportBookings() {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true, phoneNumber: true } },
          room: { select: { name: true, capacity: true } },
          payment: { select: { amount: true, status: true } }
        }
      });

      const data = bookings.map(b => ({
        'Booking ID': b.id,
        'Client Name': b.user?.name || '-',
        'Client Email': b.user?.email || '-',
        'Client Phone': b.user?.phoneNumber || '-',
        'Room': b.room?.name || '-',
        'Date': b.date ? new Date(b.date).toLocaleDateString() : '-',
        'Amount (Ksh)': b.payment?.amount || 0,
        'Payment Status': b.payment?.status || 'Pending',
        'Booking Status': b.status
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

      const dir = await this.ensureDirectory();
      const filename = 'bookings_' + Date.now() + '.xlsx';
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: bookings.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exportUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          gender: true,
          occupation: true,
          address: true,
          city: true,
          country: true,
          role: true,
          createdAt: true
        }
      });

      const data = users.map(u => ({
        'User ID': u.id,
        'Name': u.name,
        'Email': u.email,
        'Phone': u.phoneNumber || '-',
        'Gender': u.gender || '-',
        'Occupation': u.occupation || '-',
        'Address': u.address || '-',
        'City': u.city || '-',
        'Country': u.country || '-',
        'Role': u.role,
        'Registered': new Date(u.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      const dir = await this.ensureDirectory();
      const filename = 'users_' + Date.now() + '.xlsx';
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: users.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exportRooms() {
    try {
      const rooms = await prisma.room.findMany();

      const data = rooms.map(r => ({
        'Room ID': r.id,
        'Room Name': r.name,
        'Capacity': r.capacity,
        'Cost (Ksh)': r.cost || '-',
        'Description': r.description || '-',
        'Status': r.isActive ? 'Active' : 'Inactive'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rooms');

      const dir = await this.ensureDirectory();
      const filename = 'rooms_' + Date.now() + '.xlsx';
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: rooms.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async exportAll() {
    console.log('Starting full data export...');
    const results = {
      bookings: await this.exportBookings(),
      users: await this.exportUsers(),
      rooms: await this.exportRooms(),
      timestamp: new Date().toISOString()
    };
    console.log('Full export completed!');
    return results;
  }
}

module.exports = new ExportService();
