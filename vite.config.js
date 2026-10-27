import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'hotel-pms-api-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = new URL(req.url, 'http://localhost:5175');
          const pathname = url.pathname;

          // 1. Handle POST /reservations/create and POST /api/reservations/create
          if ((pathname === '/reservations/create' || pathname === '/api/reservations/create') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = body ? JSON.parse(body) : {};
                const count = Math.floor(1000 + Math.random() * 9000);
                const ref = `#RES_${count}`;
                const id = `res_${count}`;
                const folioId = `fol_${count}`;

                const baseRate = Number(data.baseRatePerNight || data.rate) || 2500;
                const nights = Number(data.nights) || 1;
                const totalRoomCharges = baseRate * nights;
                const gstRate = baseRate >= 7500 ? 0.18 : 0.12;
                const taxAmount = Math.round(totalRoomCharges * gstRate);
                const totalAmount = totalRoomCharges + taxAmount;
                const paidAmount = Number(data.advanceAmount) || 0;
                const balanceDue = Math.max(0, totalAmount - paidAmount);

                const guestName = data.guestName || `${data.guestTitle || 'Mr.'} ${data.firstName || 'Guest'} ${data.lastName || ''}`.trim();

                const reservation = {
                  id,
                  bookingReference: ref,
                  primaryGuest: {
                    name: guestName,
                    phone: data.guestPhone || data.phone || '+91 9664471637',
                    email: data.guestEmail || data.email || 'guest@hotelastha.com',
                    nationality: data.nationality || 'Indian',
                    idType: data.idType || 'Aadhaar Card',
                    idNumber: data.idNumber || 'XXXX-XXXX-1234',
                    address: data.address || '',
                    city: data.city || 'Jaipur',
                    state: data.state || 'Rajasthan'
                  },
                  roomId: data.roomId || 'rm_102',
                  roomNumber: data.roomNumber || '102',
                  roomTypeId: data.roomTypeId || 'rt_deluxe',
                  ratePlanCode: data.ratePlanCode || 'BAR_EP',
                  checkInDate: data.checkInDate || '2026-10-24',
                  checkOutDate: data.checkOutDate || '2026-10-25',
                  nights,
                  adults: Number(data.adults) || 1,
                  children: Number(data.children) || 0,
                  baseRatePerNight: baseRate,
                  totalRoomCharges,
                  taxAmount,
                  totalAmount,
                  paidAmount,
                  balanceDue,
                  status: (data.status || 'confirmed').toLowerCase(),
                  bookingSource: (data.bookingSource || 'WALK_IN').toUpperCase().replace('-', '_'),
                  marketSegment: data.marketSegment || 'WALK_IN',
                  isVIP: !!data.isVIP,
                  isSingleLady: !!data.isSingleLady,
                  noPosting: !!data.noPosting,
                  isComplimentary: !!data.isComplimentary,
                  notes: data.notes || '',
                  createdAt: new Date().toISOString(),
                  folioId
                };

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(201);
                res.end(JSON.stringify({
                  success: true,
                  message: `Reservation ${ref} confirmed successfully for ${guestName}`,
                  bookingReference: ref,
                  reservation
                }));
              } catch (err) {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          // 2. Handle GET /api/reservations
          if (pathname === '/api/reservations' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200);
            res.end(JSON.stringify({
              endpoint: '/reservations/create',
              status: 'active',
              message: 'Hotel PMS Reservation API ready',
              supportedEndpoints: [
                { method: 'POST', path: '/reservations/create', description: 'Create reservation matching OTAL PMS endpoint' },
                { method: 'POST', path: '/api/reservations/create', description: 'REST API create reservation' },
                { method: 'GET', path: '/api/reservations', description: 'List reservations' }
              ]
            }));
            return;
          }

          next();
        });
      }
    }
  ],
  server: {
    port: 5175,
    open: false
  }
});
