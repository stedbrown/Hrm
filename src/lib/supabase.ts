import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { sampleRooms, sampleBookings, sampleRoomsWithOccupancy, sampleOccupancyOverview } from "../components/booking/DummyData";
import { addDays, format } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  },
});

export async function fetchRooms() {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number");

    if (error) throw error;
    
    // Se non ci sono dati o ci sono errori, usa i dati di esempio
    if (!data || data.length === 0) {
      console.log("Nessun dato di stanza trovato nel database, utilizzo dati di esempio");
      return sampleRooms;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    console.log("Errore nel recupero delle stanze, utilizzo dati di esempio");
    // In caso di errore, ritorna i dati di esempio
    return sampleRooms;
  }
}

export async function fetchBookings() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id(room_number, room_type)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Se non ci sono dati o ci sono errori, usa i dati di esempio
    if (!data || data.length === 0) {
      console.log("Nessuna prenotazione trovata nel database, utilizzo dati di esempio");
      return sampleBookings;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    console.log("Errore nel recupero delle prenotazioni, utilizzo dati di esempio");
    // In caso di errore, ritorna i dati di esempio
    return sampleBookings;
  }
}

export async function fetchMenuItems() {
  try {
    const { data, error } = await supabase
      .from("restaurant_menu")
      .select("*")
      .order("category");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
}

export async function fetchRestaurantOrders() {
  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .select(
        `
        *,
        order_items:order_items(*, restaurant_menu:menu_item_id(name, category))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    throw error;
  }
}

export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function fetchHotelStats() {
  try {
    // Ottieni statistiche in tempo reale
    const [rooms, bookings] = await Promise.all([
      fetchRooms(),
      fetchBookings(),
    ]);
    
    // Calcola le statistiche effettive
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
    const totalRooms = rooms.length || 1; // Evita divisione per zero
    
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    const pendingArrivals = bookings.filter(booking => {
      const checkInDate = new Date(booking.check_in);
      checkInDate.setHours(0, 0, 0, 0);
      return booking.status === 'confirmed' && checkInDate.getTime() === currentDate.getTime();
    }).length;
    
    const pendingDepartures = bookings.filter(booking => {
      const checkOutDate = new Date(booking.check_out);
      checkOutDate.setHours(0, 0, 0, 0);
      return booking.status === 'confirmed' && checkOutDate.getTime() === currentDate.getTime();
    }).length;
    
    return {
      occupancyRate,
      totalBookings: bookings.length,
      pendingArrivals,
      pendingDepartures,
    };
    
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    throw error;
  }
}

// Variabile per tenere traccia se la tabella settings esiste
let settingsTableExists = false;

export async function fetchHotelName() {
  // Restituiamo direttamente il valore di default
  return "Il Tuo Hotel";
}

export async function fetchUserProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: user.user_metadata?.avatar_url || null,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Recupera informazioni dettagliate su tutte le camere, incluse le prenotazioni
 * attuali e future, con i dettagli dei clienti associati
 * @param startDate Data di inizio per filtrare le prenotazioni future (opzionale)
 * @param endDate Data di fine per filtrare le prenotazioni future (opzionale)
 */
export async function fetchRoomsWithOccupancy(startDate?: string, endDate?: string) {
  try {
    // Ottieni tutte le camere
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number");

    if (roomsError) throw roomsError;

    // Ottieni tutte le prenotazioni con informazioni delle camere
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Costruisci la query per le prenotazioni
    let query = supabase
      .from("bookings")
      .select(`
        id,
        guest_name,
        guest_email,
        room_id,
        check_in,
        check_out,
        status,
        payment_status,
        total_amount,
        created_at
      `)
      .or(`check_out.gte.${currentDate}`); // Prenotazioni attuali o future
    
    // Se sono specificate le date, aggiungi filtri
    if (startDate && endDate) {
      query = query.or(
        `and(check_in.gte.${startDate},check_in.lte.${endDate}),` +
        `and(check_out.gte.${startDate},check_out.lte.${endDate}),` +
        `and(check_in.lte.${startDate},check_out.gte.${endDate})`
      );
    }
    
    const { data: bookings, error: bookingsError } = await query;
    
    if (bookingsError) throw bookingsError;

    // Mappa le prenotazioni alle camere corrispondenti
    const roomsWithOccupancy = rooms?.map(room => {
      // Trova tutte le prenotazioni per questa camera
      const roomBookings = bookings?.filter(booking => booking.room_id === room.id) || [];
      
      // Classifica le prenotazioni
      const currentBooking = roomBookings.find(booking => {
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const today = new Date();
        return checkIn <= today && checkOut >= today;
      });
      
      const futureBookings = roomBookings
        .filter(booking => new Date(booking.check_in) > new Date())
        .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
      
      // Calcola la disponibilità
      const availability = calculateRoomAvailability(room, roomBookings);
      
      return {
        ...room,
        currentBooking,
        futureBookings,
        availability
      };
    });

    // Se non ci sono dati o ci sono errori, usa i dati di esempio
    if (!rooms || rooms.length === 0 || !bookings) {
      console.log("Nessun dato di occupazione trovato nel database, utilizzo dati di esempio");
      return sampleRoomsWithOccupancy;
    }

    return roomsWithOccupancy || [];
  } catch (error) {
    console.error("Error fetching rooms with occupancy:", error);
    console.log("Errore nel recupero dell'occupazione, utilizzo dati di esempio");
    // In caso di errore, ritorna i dati di esempio
    return sampleRoomsWithOccupancy;
  }
}

/**
 * Ottiene i dettagli completi di un cliente e tutte le sue prenotazioni
 * @param guestEmail Email del cliente
 */
export async function fetchGuestDetails(guestEmail: string) {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        rooms:room_id(*)
      `)
      .eq("guest_email", guestEmail)
      .order("check_in", { ascending: false });

    if (error) throw error;

    // Organizza le prenotazioni per passate, presenti e future
    const now = new Date();
    
    const pastBookings = bookings?.filter(
      booking => new Date(booking.check_out) < now
    ) || [];
    
    const currentBookings = bookings?.filter(
      booking => 
        new Date(booking.check_in) <= now && 
        new Date(booking.check_out) >= now
    ) || [];
    
    const futureBookings = bookings?.filter(
      booking => new Date(booking.check_in) > now
    ) || [];

    return {
      email: guestEmail,
      bookings: {
        past: pastBookings,
        current: currentBookings,
        future: futureBookings,
        all: bookings || []
      },
      stats: {
        totalStays: pastBookings.length,
        upcomingStays: futureBookings.length,
        totalSpent: pastBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
      }
    };
  } catch (error) {
    console.error("Error fetching guest details:", error);
    throw error;
  }
}

/**
 * Calcola la disponibilità di una camera nei prossimi giorni
 */
function calculateRoomAvailability(room: any, bookings: any[]) {
  // Creiamo un array con i prossimi 30 giorni
  const next30Days = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Una camera è considerata occupata in una data specifica se:
    // 1. La data è >= alla data di check-in di una prenotazione E
    // 2. La data è < alla data di check-out della stessa prenotazione
    // Questo garantisce che il giorno di check-out la camera sia già disponibile per nuovi ospiti
    const isBooked = bookings.some(booking => 
      dateStr >= booking.check_in && dateStr < booking.check_out
    );
    
    // Controllo se la data è un giorno di check-out (per visualizzazione speciale nell'UI)
    const isCheckoutDay = bookings.some(booking => 
      dateStr === booking.check_out
    );
    
    // Controllo se è anche un giorno di check-in per un'altra prenotazione
    const isAlsoCheckinDay = bookings.some(booking => 
      dateStr === booking.check_in
    );
    
    // Determina lo stato speciale per i giorni di check-out
    let bookingStatus = isBooked ? 'booked' : room.status;
    
    // Se è giorno di check-out ma non di check-in, assegna stato speciale
    if (isCheckoutDay && !isAlsoCheckinDay && !isBooked) {
      bookingStatus = 'checkout_day';
    }
    
    return {
      date: dateStr,
      available: !isBooked && room.status === 'available',
      status: bookingStatus,
      isCheckoutDay: isCheckoutDay,
      isCheckinDay: bookings.some(booking => dateStr === booking.check_in)
    };
  });
  
  return next30Days;
}

/**
 * Ottiene una panoramica dell'occupazione per un periodo specificato
 */
export async function fetchOccupancyOverview(startDate?: string, endDate?: string) {
  try {
    const roomsWithOccupancy = await fetchRoomsWithOccupancy(startDate, endDate);
    
    // Se stiamo usando i dati di esempio, ritorna direttamente l'overview di esempio
    if (roomsWithOccupancy === sampleRoomsWithOccupancy) {
      return sampleOccupancyOverview;
    }
    
    // Se non sono specificate le date, usa il mese corrente
    if (!startDate || !endDate) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      startDate = firstDayOfMonth.toISOString().split('T')[0];
      endDate = lastDayOfMonth.toISOString().split('T')[0];
    }
    
    // Crea un array di tutte le date nel periodo
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      dates.push(new Date(dt).toISOString().split('T')[0]);
    }
    
    // Calcola l'occupazione giornaliera
    const dailyOccupancy = dates.map(date => {
      const totalRooms = roomsWithOccupancy.length;
      const occupiedRooms = roomsWithOccupancy.filter(room => {
        return room.availability.find(a => a.date === date && a.status === 'booked');
      }).length;
      
      return {
        date,
        occupiedRooms,
        totalRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      };
    });
    
    // Calcola statistiche di occupazione complessive
    const averageOccupancy = dailyOccupancy.reduce((sum, day) => sum + day.occupancyRate, 0) / dailyOccupancy.length;
    
    // Identifica le camere più e meno prenotate
    const roomOccupancyCount = roomsWithOccupancy.map(room => {
      const bookedDays = room.availability.filter(a => a.status === 'booked').length;
      return {
        id: room.id,
        roomNumber: room.room_number,
        roomType: room.room_type,
        bookedDays,
        occupancyRate: Math.round((bookedDays / dates.length) * 100)
      };
    });
    
    roomOccupancyCount.sort((a, b) => b.occupancyRate - a.occupancyRate);
    
    return {
      period: {
        startDate,
        endDate,
        totalDays: dates.length
      },
      dailyOccupancy,
      statistics: {
        averageOccupancy: Math.round(averageOccupancy),
        mostBookedRooms: roomOccupancyCount.slice(0, 5),
        leastBookedRooms: roomOccupancyCount.slice(-5).reverse()
      }
    };
  } catch (error) {
    console.error("Error fetching occupancy overview:", error);
    console.log("Errore nel recupero della panoramica di occupazione, utilizzo dati di esempio");
    // In caso di errore, ritorna i dati di esempio
    return sampleOccupancyOverview;
  }
}

// Funzione per recuperare una prenotazione specifica per ID
export const fetchBookingById = async (bookingId: string) => {
  // Se l'ID è 'create', stiamo probabilmente in una pagina di creazione
  // quindi restituiamo null invece di tentare di recuperare una prenotazione
  if (bookingId === 'create') {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          id,
          room_number,
          room_type,
          capacity,
          price_per_night,
          status,
          amenities,
          description
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      // Log più dettagliato per capire meglio l'errore
      console.log(`Prenotazione non trovata con ID: ${bookingId}. Utilizzo dati di esempio.`);
      // Non mostriamo l'errore completo nella console per evitare rumore
      // Fallback ai dati di esempio
      const sampleBooking = sampleBookings.find(b => b.id === bookingId);
      return sampleBooking || null;
    }

    // Se non ci sono dati, verificare nei dati di esempio
    if (!data) {
      console.log(`Nessun dato trovato per la prenotazione con ID: ${bookingId}. Utilizzo dati di esempio.`);
      const sampleBooking = sampleBookings.find(b => b.id === bookingId);
      return sampleBooking || null;
    }

    return data;
  } catch (error) {
    console.log(`Errore nel recupero della prenotazione con ID: ${bookingId}. Utilizzo dati di esempio.`);
    // Fallback ai dati di esempio
    const sampleBooking = sampleBookings.find(b => b.id === bookingId);
    return sampleBooking || null;
  }
};

// Funzione per aggiornare lo stato di una prenotazione
export const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error('Errore nell\'aggiornamento dello stato della prenotazione:', error);
      throw error;
    }

    // Se lo stato è "checked_in", aggiorniamo lo stato della camera a "occupied"
    if (newStatus === 'checked_in') {
      // Prima, recuperiamo la prenotazione per ottenere il room_id
      const booking = await fetchBookingById(bookingId);
      if (booking && booking.room_id) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', booking.room_id);

        if (roomError) {
          console.error('Errore nell\'aggiornamento dello stato della camera:', roomError);
        }
      }
    }

    // Se lo stato è "checked_out", aggiorniamo lo stato della camera a "available" o "cleaning"
    if (newStatus === 'checked_out') {
      // Prima, recuperiamo la prenotazione per ottenere il room_id
      const booking = await fetchBookingById(bookingId);
      if (booking && booking.room_id) {
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'cleaning' })
          .eq('id', booking.room_id);

        if (roomError) {
          console.error('Errore nell\'aggiornamento dello stato della camera:', roomError);
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Errore nell\'aggiornamento dello stato della prenotazione:', error);
    throw error;
  }
};

// Funzione per verificare se una camera è disponibile per date specifiche
export async function isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date) {
  try {
    // Convertiamo le date in stringhe nel formato YYYY-MM-DD per confronti precisi
    const checkInStr = format(checkIn, 'yyyy-MM-dd');
    const checkOutStr = format(checkOut, 'yyyy-MM-dd');
    
    // Recupera tutte le prenotazioni esistenti per questa camera
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('room_id', roomId)
      .or(`status.eq.confirmed,status.eq.pending,status.eq.checked_in`);
      
    if (error) throw error;
    
    // Se non ci sono prenotazioni, la camera è disponibile
    if (!bookings || bookings.length === 0) {
      return true;
    }
    
    // Verifica che non ci siano sovrapposizioni con prenotazioni esistenti
    const hasOverlap = bookings.some(booking => {
      const bookingCheckIn = booking.check_in;
      const bookingCheckOut = booking.check_out;
      
      // Una prenotazione si sovrappone se:
      // 1. Il check-in richiesto è prima del check-out esistente E
      // 2. Il check-out richiesto è dopo il check-in esistente
      return checkInStr < bookingCheckOut && checkOutStr > bookingCheckIn;
    });
    
    // La camera è disponibile se non ci sono sovrapposizioni
    return !hasOverlap;
  } catch (error) {
    console.error("Errore nel controllo disponibilità camera:", error);
    throw error;
  }
}
