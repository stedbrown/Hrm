import { addDays, subDays, format } from "date-fns";

// Ottieni data corrente e formattala come stringa nel formato YYYY-MM-DD
const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

// Dati di esempio per le camere
export const sampleRooms = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    room_number: "101",
    room_type: "Standard",
    capacity: 2,
    price_per_night: 99.99,
    status: "occupied",
    amenities: ["WiFi", "TV", "AC"],
    description: "Camera standard confortevole con due letti singoli, perfetta per brevi soggiorni."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    room_number: "102",
    room_type: "Deluxe",
    capacity: 2,
    price_per_night: 149.99,
    status: "available",
    amenities: ["WiFi", "TV", "AC", "Mini Bar"],
    description: "Camera deluxe con letto matrimoniale e vista sulla città. Include servizi premium."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174003",
    room_number: "201",
    room_type: "Suite",
    capacity: 4,
    price_per_night: 249.99,
    status: "available",
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
    description: "Suite elegante con camera da letto separata, soggiorno spazioso e balcone privato."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174004",
    room_number: "202",
    room_type: "Suite Familiare",
    capacity: 5,
    price_per_night: 299.99,
    status: "reserved",
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Kitchen"],
    description: "Spaziosa suite per famiglie con cucina, perfetta per soggiorni prolungati con i bambini."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174005",
    room_number: "301",
    room_type: "Penthouse",
    capacity: 6,
    price_per_night: 499.99,
    status: "maintenance",
    amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony", "Kitchen", "Jacuzzi"],
    description: "Lussuosa penthouse all'ultimo piano con vista panoramica, jacuzzi privata e servizi esclusivi."
  },
];

// Dati di esempio per le prenotazioni
export const sampleBookings = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    guest_name: "Mario Rossi",
    guest_email: "mario.rossi@example.com",
    room_id: "123e4567-e89b-12d3-a456-426614174001",
    check_in: formatDate(today),
    check_out: formatDate(addDays(today, 3)),
    status: "confirmed",
    total_amount: 299.97,
    payment_status: "paid",
    created_at: subDays(today, 5).toISOString(),
    rooms: {
      room_number: "101",
      room_type: "Standard"
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    guest_name: "Giulia Verdi",
    guest_email: "giulia.verdi@example.com",
    room_id: "123e4567-e89b-12d3-a456-426614174002",
    check_in: formatDate(addDays(today, 7)),
    check_out: formatDate(addDays(today, 10)),
    status: "confirmed",
    total_amount: 449.97,
    payment_status: "paid",
    created_at: subDays(today, 2).toISOString(),
    rooms: {
      room_number: "102",
      room_type: "Deluxe"
    }
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    guest_name: "Franco Bianchi",
    guest_email: "franco.bianchi@example.com",
    room_id: "123e4567-e89b-12d3-a456-426614174003",
    check_in: formatDate(addDays(today, 30)),
    check_out: formatDate(addDays(today, 35)),
    status: "confirmed",
    total_amount: 1249.95,
    payment_status: "pending",
    created_at: subDays(today, 1).toISOString(),
    rooms: {
      room_number: "201",
      room_type: "Suite"
    }
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    guest_name: "Anna Neri",
    guest_email: "anna.neri@example.com",
    room_id: "123e4567-e89b-12d3-a456-426614174004",
    check_in: formatDate(subDays(today, 10)),
    check_out: formatDate(subDays(today, 5)),
    status: "completed",
    total_amount: 1499.95,
    payment_status: "paid",
    created_at: subDays(today, 15).toISOString(),
    rooms: {
      room_number: "202",
      room_type: "Suite Familiare"
    }
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    guest_name: "Luca Gialli",
    guest_email: "luca.gialli@example.com",
    room_id: "123e4567-e89b-12d3-a456-426614174005",
    check_in: formatDate(subDays(today, 40)),
    check_out: formatDate(subDays(today, 35)),
    status: "completed",
    total_amount: 2499.95,
    payment_status: "paid",
    created_at: subDays(today, 45).toISOString(),
    rooms: {
      room_number: "301",
      room_type: "Penthouse"
    }
  }
];

// Dati di esempio per l'occupazione delle camere
export const sampleRoomsWithOccupancy = sampleRooms.map(room => {
  // Identifica le prenotazioni relative a questa camera
  const roomBookings = sampleBookings
    .filter(booking => booking.room_id === room.id)
    .map(booking => ({
      id: booking.id,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      check_in: booking.check_in,
      check_out: booking.check_out,
      status: booking.status,
      payment_status: booking.payment_status,
      total_amount: booking.total_amount,
      created_at: booking.created_at
    }));
  
  // Identifica prenotazione corrente (se esiste)
  const todayStr = formatDate(today);
  const currentBooking = roomBookings.find(booking => 
    booking.check_in <= todayStr && booking.check_out >= todayStr
  );
  
  // Filtra prenotazioni future
  const futureBookings = roomBookings
    .filter(booking => booking.check_in > todayStr)
    .sort((a, b) => a.check_in.localeCompare(b.check_in));
  
  // Calcola disponibilità nei prossimi 30 giorni
  const availability = Array.from({ length: 30 }, (_, i) => {
    const date = formatDate(addDays(today, i));
    const isBooked = roomBookings.some(
      booking => date >= booking.check_in && date < booking.check_out
    );
    
    return {
      date,
      available: !isBooked && room.status === 'available',
      status: isBooked ? 'booked' : room.status
    };
  });
  
  return {
    ...room,
    currentBooking,
    futureBookings,
    availability
  };
});

// Dati di esempio per l'occupazione generale
export const sampleOccupancyOverview = {
  period: {
    startDate: formatDate(today),
    endDate: formatDate(addDays(today, 30)),
    totalDays: 30
  },
  dailyOccupancy: Array.from({ length: 30 }, (_, i) => {
    const date = formatDate(addDays(today, i));
    // Simula diversi livelli di occupazione nei giorni
    const occupancyRate = Math.floor(Math.random() * 61) + 20; // 20-80%
    const totalRooms = sampleRooms.length;
    const occupiedRooms = Math.round((occupancyRate * totalRooms) / 100);
    
    return {
      date,
      occupiedRooms,
      totalRooms,
      occupancyRate
    };
  }),
  statistics: {
    averageOccupancy: 65, // Valore medio simulato
    mostBookedRooms: [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        roomNumber: "101",
        roomType: "Standard",
        bookedDays: 20,
        occupancyRate: 67
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174004",
        roomNumber: "202", 
        roomType: "Suite Familiare",
        bookedDays: 18,
        occupancyRate: 60
      }
    ],
    leastBookedRooms: [
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        roomNumber: "102",
        roomType: "Deluxe",
        bookedDays: 5,
        occupancyRate: 17
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174005",
        roomNumber: "301",
        roomType: "Penthouse",
        bookedDays: 8,
        occupancyRate: 27
      }
    ]
  }
}; 