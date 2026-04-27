const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ExportService {
  constructor() {
    // Base export path - configure this to client's folder
    this.basePath = process.env.EXPORT_PATH || 'C:\\DRHub-Exports\\';
  }

  /**
   * Ensure export directory exists
   */
  async ensureDirectory() {
    const dateFolder = new Date().toISOString().slice(0, 10);
    const fullPath = path.join(this.basePath, dateFolder);
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  }

  /**
   * Export Bookings to Excel
   */
  async exportBookings() {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true, phoneNumber: true } },
          room: { select: { name: true, capacity: true } },
          payment: { select: { amount: true, status: true, providerRef: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const data = bookings.map(b => ({
        'Booking ID': b.id,
        'Reference': b.reference || '-',
        'Client Name': b.user?.name || '-',
        'Client Email': b.user?.email || '-',
        'Client Phone': b.user?.phoneNumber || '-',
        'Room': b.room?.name || '-',
        'Date': b.date ? new Date(b.date).toLocaleDateString() : '-',
        'Time Slot': b.slot || '-',
        'Number of Attendees': b.numberOfAttendees || '-',
        'Total Cost (Ksh)': b.payment?.amount || 0,
        'Payment Status': b.payment?.status || 'Pending',
        'Transaction Ref': b.payment?.providerRef || '-',
        'Booking Status': b.status,
        'Created At': new Date(b.createdAt).toLocaleString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

      const dir = await this.ensureDirectory();
      const filename = `bookings_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      console.log(`✅ Bookings exported: ${filepath}`);
      return { success: true, filepath, count: bookings.length };
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export Users/Clients to Excel
   */
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
          status: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const data = users.map(u => ({
        'User ID': u.id,
        'Name': u.name,
        'Email': u.email,
        'Phone': u.phoneNumber || '-',
        'Gender': u.gender || '-',
        'Occupation': u.occupation || '-',
        'Role': u.role,
        'Status': u.status,
        'Registered': new Date(u.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      const dir = await this.ensureDirectory();
      const filename = `users_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: users.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export Rooms to Excel
   */
  async exportRooms() {
    try {
      const rooms = await prisma.room.findMany({
        orderBy: { name: 'asc' }
      });

      const data = rooms.map(r => ({
        'Room ID': r.id,
        'Room Name': r.name,
        'Capacity': r.capacity,
        'Cost (Ksh)': r.cost || '-',
        'Description': r.description || '-',
        'Status': r.isActive ? 'Active' : 'Inactive',
        'Created': new Date(r.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rooms');

      const dir = await this.ensureDirectory();
      const filename = `rooms_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: rooms.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export Leads/Contacts to Excel
   */
  async exportLeads() {
    try {
      const leads = await prisma.lead?.findMany({
        orderBy: { createdAt: 'desc' }
      }) || [];

      const data = leads.map(l => ({
        'Lead ID': l.id,
        'Name': l.name || '-',
        'Phone': l.phone || '-',
        'Email': l.email || '-',
        'Stage': l.stage || 'New',
        'Notes': l.note || '-',
        'Created': new Date(l.createdAt).toLocaleDateString()
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      const dir = await this.ensureDirectory();
      const filename = `leads_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      const filepath = path.join(dir, filename);
      
      XLSX.writeFile(wb, filepath);
      
      return { success: true, filepath, count: leads.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export All Data
   */
  async exportAll() {
    console.log('🚀 Starting full data export...');
    const results = {
      bookings: await this.exportBookings(),
      users: await this.exportUsers(),
      rooms: await this.exportRooms(),
      leads: await this.exportLeads(),
      timestamp: new Date().toISOString()
    };
    console.log('✅ Full export completed!');
    return results;
  }

  /**
   * Get export files list
   */
  async getExportFiles() {
    try {
      const files = [];
      const dirs = await fs.readdir(this.basePath);
      
      for (const dir of dirs) {
        const dirPath = path.join(this.basePath, dir);
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
          const exports = await fs.readdir(dirPath);
          for (const file of exports) {
            files.push({
              name: file,
              path: path.join(dirPath, file),
              date: dir,
              size: (await fs.stat(path.join(dirPath, file))).size
            });
          }
        }
      }
      
      return files.sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }
}

module.exports = new ExportService();
