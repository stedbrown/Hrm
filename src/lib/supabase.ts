import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { addDays, format } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function fetchRooms() {
  try {
    console.log("Recupero le camere dal database...");
    
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number");

    if (error) {
      console.error("Errore nella query Supabase:", error);
      throw error;
    }
    
    console.log(`Camere recuperate dal database: ${data?.length || 0} camere trovate`);
    
    // Restituisci sempre un array (vuoto se non ci sono dati)
    return data || [];
    
  } catch (error) {
    console.error("Errore nel recupero delle camere:", error);
    
    // Verifica se l'errore è relativo alla connessione al database
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    
    console.log("Errore nel recupero delle camere, restituisco un array vuoto");
    // In caso di errore, restituisci un array vuoto
    return [];
  }
}

export async function fetchBookings() {
  try {
    console.log("Tentativo di recuperare le prenotazioni dal database...");
    
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id(room_number, room_type)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore nella query Supabase:", error);
      throw error;
    }
    
    // Log dei dati recuperati
    console.log(`Prenotazioni recuperate dal database: ${data?.length || 0} prenotazioni trovate`);
    
    // Restituisci sempre un array (vuoto se non ci sono dati)
    return data || [];
    
  } catch (error) {
    console.error("Errore nel recupero delle prenotazioni:", error);
    
    // Verifica se l'errore è relativo alla connessione al database
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    
    console.log("Errore nel recupero delle prenotazioni, restituisco un array vuoto");
    // In caso di errore, restituisci SEMPRE un array vuoto, MAI dati di esempio
    return [];
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
    console.log("Recupero statistiche dell'hotel...");
    
    // Forza una nuova richiesta al database per assicurarsi di ottenere dati aggiornati
    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("*");
      
    if (roomsError) {
      console.error("Errore nel recupero delle camere:", roomsError);
      throw roomsError;
    }
    
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*");
      
    if (bookingsError) {
      console.error("Errore nel recupero delle prenotazioni:", bookingsError);
      throw bookingsError;
    }
    
    // Utilizza i dati ottenuti direttamente dalla query
    const rooms = roomsData || [];
    const bookings = bookingsData || [];
    
    console.log(`Statistiche dirette dal DB: ${rooms.length} camere, ${bookings.length} prenotazioni`);
    
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
    
    const stats = {
      occupancyRate,
      totalBookings: bookings.length,
      pendingArrivals,
      pendingDepartures,
    };
    
    console.log("Statistiche calcolate:", stats);
    
    return stats;
    
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    // In caso di errore, restituisci statistiche predefinite con valori a zero
    return {
      occupancyRate: 0,
      totalBookings: 0,
      pendingArrivals: 0,
      pendingDepartures: 0,
    };
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
    console.log("Recupero camere con occupazione dal database...");
    // Ottieni tutte le camere
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number");

    if (roomsError) {
      console.error("Errore nel recupero delle camere:", roomsError);
      throw roomsError;
    }

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
        adults,
        children,
        notes,
        created_at
      `)
      .or(`check_out.gte.${currentDate}`); // Prenotazioni attuali o future

    // Se sono specificate le date, filtra ulteriormente
    if (startDate) {
      query = query.or(`check_in.gte.${startDate}`);
    }
    if (endDate) {
      query = query.lt('check_in', endDate);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Errore nel recupero delle prenotazioni:", bookingsError);
      throw bookingsError;
    }

    console.log(`Recuperate ${rooms?.length || 0} camere e ${bookings?.length || 0} prenotazioni`);

    // Restituisci i dati vuoti se non ci sono camere
    if (!rooms || rooms.length === 0) {
      console.log("Nessuna camera trovata nel database");
      return [];
    }

    // Calcola la disponibilità per ciascuna camera
    const roomsWithOccupancy = rooms.map(room => {
      const roomBookings = bookings?.filter(booking => booking.room_id === room.id) || [];
      return {
        ...room,
        bookings: roomBookings,
        availability: calculateRoomAvailability(room, roomBookings)
      };
    });

    return roomsWithOccupancy;
  } catch (error) {
    console.error("Errore nel recupero delle camere con occupazione:", error);
    
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    
    // In caso di errore, restituisci un array vuoto
    return [];
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
    console.log("Recupero panoramica occupazione...");
    const roomsWithOccupancy = await fetchRoomsWithOccupancy(startDate, endDate);
    
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
    
    // Calcola le statistiche mensili
    const totalDays = dailyOccupancy.length;
    const totalOccupiedRoomDays = dailyOccupancy.reduce((sum, day) => sum + day.occupiedRooms, 0);
    const totalPossibleRoomDays = dailyOccupancy.reduce((sum, day) => sum + day.totalRooms, 0);
    
    const monthlyStats = {
      averageOccupancyRate: totalPossibleRoomDays > 0 
        ? Math.round((totalOccupiedRoomDays / totalPossibleRoomDays) * 100)
        : 0,
      peakDay: [...dailyOccupancy].sort((a, b) => b.occupancyRate - a.occupancyRate)[0],
      lowestDay: [...dailyOccupancy].sort((a, b) => a.occupancyRate - b.occupancyRate)[0],
    };
    
    return {
      startDate,
      endDate,
      dailyOccupancy,
      monthlyStats
    };
  } catch (error) {
    console.error("Errore nel recupero della panoramica di occupazione:", error);
    
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    
    // In caso di errore, restituisci dei dati vuoti
    return {
      startDate: startDate || '',
      endDate: endDate || '',
      dailyOccupancy: [],
      monthlyStats: {
        averageOccupancyRate: 0,
        peakDay: null,
        lowestDay: null
      }
    };
  }
}

// Funzione per recuperare una prenotazione specifica per ID
export const fetchBookingById = async (bookingId: string) => {
  try {
    console.log(`Tentativo di recuperare la prenotazione con ID: ${bookingId}`);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms:room_id(room_number, room_type)
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      // Se l'errore è "not found", restituisci null invece di lanciare un errore
      if (error.code === 'PGRST116') {
        console.log(`Prenotazione con ID ${bookingId} non trovata`);
        return null;
      }
      console.error(`Errore nel recupero della prenotazione con ID ${bookingId}:`, error);
      throw error;
    }

    console.log(`Prenotazione con ID ${bookingId} recuperata:`, data);
    return data;
  } catch (error) {
    console.error(`Errore durante il recupero della prenotazione:`, error);
    
    if (error instanceof Error) {
      console.error("Dettagli errore:", error.message);
    }
    
    // Se c'è un errore, restituisci null (prenotazione non trovata)
    return null;
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
    
    console.log(`Verifica disponibilità camera ${roomId} dal ${checkInStr} al ${checkOutStr}`);
    
    // Prima verifichiamo lo stato attuale della camera
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('status')
      .eq('id', roomId)
      .single();
      
    if (roomError) {
      console.error("Errore nel recupero dello stato della camera:", roomError);
      throw roomError;
    }
    
    // Se la camera non è disponibile (es. in manutenzione), non è prenotabile
    if (roomData && roomData.status !== 'available' && roomData.status !== 'reserved') {
      console.log(`Camera ${roomId} non disponibile, stato attuale: ${roomData.status}`);
      return false;
    }
    
    // Recupera tutte le prenotazioni esistenti per questa camera
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in, check_out, status')
      .eq('room_id', roomId)
      .or(`status.eq.confirmed,status.eq.pending,status.eq.checked_in`);
      
    if (error) {
      console.error("Errore nel recupero delle prenotazioni:", error);
      throw error;
    }
    
    // Se non ci sono prenotazioni, la camera è disponibile
    if (!bookings || bookings.length === 0) {
      console.log(`Nessuna prenotazione trovata per la camera ${roomId}, è disponibile`);
      return true;
    }
    
    console.log(`Trovate ${bookings.length} prenotazioni per la camera ${roomId}`);
    
    // Verifica che non ci siano sovrapposizioni con prenotazioni esistenti
    const hasOverlap = bookings.some(booking => {
      const bookingCheckIn = booking.check_in;
      const bookingCheckOut = booking.check_out;
      
      // Una prenotazione si sovrappone se:
      // 1. Il check-in richiesto è prima del check-out esistente E
      // 2. Il check-out richiesto è dopo il check-in esistente
      const overlap = checkInStr < bookingCheckOut && checkOutStr > bookingCheckIn;
      
      if (overlap) {
        console.log(`Sovrapposizione trovata con prenotazione esistente: ${bookingCheckIn} - ${bookingCheckOut}`);
      }
      
      return overlap;
    });
    
    // La camera è disponibile se non ci sono sovrapposizioni
    const isAvailable = !hasOverlap;
    console.log(`Camera ${roomId} disponibile: ${isAvailable}`);
    return isAvailable;
  } catch (error) {
    console.error("Errore nel controllo disponibilità camera:", error);
    throw error;
  }
}

// Funzione per eliminare una prenotazione dal database
export const deleteBooking = async (bookingId: string) => {
  try {
    console.log(`Tentativo di eliminare la prenotazione con ID: ${bookingId}`);
    
    // Prima recuperiamo la prenotazione per ottenere il room_id
    const booking = await fetchBookingById(bookingId);
    
    if (!booking) {
      console.error(`Prenotazione con ID ${bookingId} non trovata`);
      throw new Error("Prenotazione non trovata");
    }
    
    // Elimina la prenotazione dal database
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);
    
    if (error) {
      console.error(`Errore nell'eliminazione della prenotazione con ID ${bookingId}:`, error);
      throw error;
    }
    
    console.log(`Prenotazione con ID ${bookingId} eliminata con successo`);
    
    // Se la camera era riservata per questa prenotazione, aggiorna lo stato a "available"
    if (booking.room_id) {
      // Verifica se non ci sono altre prenotazioni attive per questa camera
      const { data: otherBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', booking.room_id)
        .in('status', ['confirmed', 'checked_in', 'pending'])
        .neq('id', bookingId);
      
      if (checkError) {
        console.error(`Errore nella verifica di altre prenotazioni per la camera:`, checkError);
      } else if (!otherBookings || otherBookings.length === 0) {
        // Se non ci sono altre prenotazioni attive, imposta la camera come disponibile
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', booking.room_id);
        
        if (roomError) {
          console.error(`Errore nell'aggiornamento dello stato della camera:`, roomError);
        } else {
          console.log(`Stato della camera ${booking.room_id} aggiornato a "available"`);
        }
      }
    }
    
    // Emetti un evento personalizzato per notificare che una prenotazione è stata eliminata
    const event = new CustomEvent('bookingDeleted', { detail: { bookingId } });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error(`Errore nell'eliminazione della prenotazione:`, error);
    throw error;
  }
};
