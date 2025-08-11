import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import {
  ChimeSDKMeetingsClient,
  CreateMeetingCommand,
  CreateAttendeeCommand,
  DeleteMeetingCommand,
  DeleteAttendeeCommand, // ← AGREGADO: Import faltante
} from "@aws-sdk/client-chime-sdk-meetings";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria para las reuniones activas
const activeMeetings = new Map();
// NUEVO: Almacenamiento para attendees por reunión y usuario
const meetingAttendees = new Map(); // meetingId -> Map(userId -> attendeeInfo)

// Cliente Chime
const chimeClient = new ChimeSDKMeetingsClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Endpoint para crear reunión + primer participante (host)
 */
app.post("/create-meeting", async (req, res) => {
  const { hostUserId } = req.body; // NUEVO: Recibir userId del host
  
  console.log("\n=== CREAR REUNIÓN ===");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  try {
    const meetingCommand = {
      ClientRequestToken: uuidv4(),
      MediaRegion: "us-east-1",
      ExternalMeetingId: `Reunion-${Math.random().toString(36).substring(2, 7)}`,
    };
    
    console.log("🚀 Creando reunión con comando:", JSON.stringify(meetingCommand, null, 2));
    
    const meetingResponse = await chimeClient.send(
      new CreateMeetingCommand(meetingCommand)
    );

    console.log("✅ Respuesta de crear reunión:", JSON.stringify(meetingResponse, null, 2));
    
    const meetingInfo = meetingResponse.Meeting;
    const finalHostUserId = hostUserId || `host-${uuidv4().substring(0, 8)}`;

    // Crear primer asistente (host)
    const attendeeCommand = {
      MeetingId: meetingInfo.MeetingId,
      ExternalUserId: finalHostUserId,
    };
    
    console.log("👤 Creando host attendee con comando:", JSON.stringify(attendeeCommand, null, 2));
    
    const attendeeResponse = await chimeClient.send(
      new CreateAttendeeCommand(attendeeCommand)
    );
    
    console.log("✅ Respuesta de crear host attendee:", JSON.stringify(attendeeResponse, null, 2));
    
    // Guardar la reunión en nuestra lista
    activeMeetings.set(meetingInfo.MeetingId, meetingInfo);
    
    // NUEVO: Inicializar almacenamiento de attendees para esta reunión
    meetingAttendees.set(meetingInfo.MeetingId, new Map());
    const attendees = meetingAttendees.get(meetingInfo.MeetingId);
    attendees.set(finalHostUserId, attendeeResponse.Attendee);
    
    console.log("💾 Reunión guardada en memoria:", meetingInfo.MeetingId);
    console.log("💾 Host attendee guardado:", finalHostUserId, "→", attendeeResponse.Attendee.AttendeeId);
    
    const responseData = {
      meeting: meetingInfo,
      attendee: attendeeResponse.Attendee,
    };
    
    console.log("📤 Enviando respuesta:", JSON.stringify(responseData, null, 2));
    console.log("=== FIN CREAR REUNIÓN ===\n");

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error creando reunión:", error);
    console.log("=== FIN CREAR REUNIÓN (ERROR) ===\n");
    res.status(500).json({ error: error.message });
  }
});

/**
 * MEJORADO: Endpoint para unir usuarios a una reunión (evita duplicados)
 */
app.post("/join-meeting", async (req, res) => {
  const { meetingId, userId } = req.body;
  
  console.log("\n=== UNIRSE A REUNIÓN ===");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  if (!meetingId || !userId) {
    console.log("❌ Faltan parámetros requeridos");
    console.log("=== FIN UNIRSE A REUNIÓN (ERROR) ===\n");
    return res.status(400).json({ 
      error: "meetingId y userId son requeridos" 
    });
  }

  // Verificar que la reunión exista
  if (!activeMeetings.has(meetingId)) {
    console.log("❌ Reunión no encontrada:", meetingId);
    console.log("📋 Reuniones activas:", Array.from(activeMeetings.keys()));
    console.log("=== FIN UNIRSE A REUNIÓN (ERROR) ===\n");
    return res.status(404).json({ error: "La reunión no existe o ha finalizado." });
  }

  try {
    // Inicializar almacenamiento de attendees si no existe
    if (!meetingAttendees.has(meetingId)) {
      meetingAttendees.set(meetingId, new Map());
    }
    
    const attendees = meetingAttendees.get(meetingId);
    console.log("👥 Attendees actuales en la reunión:", Array.from(attendees.keys()));
    
    // Verificar si el usuario ya tiene un attendee en esta reunión
    if (attendees.has(userId)) {
      const existingAttendee = attendees.get(userId);
      console.log("🔄 Usuario reutilizando attendee existente:");
      console.log("   - UserId:", userId);
      console.log("   - AttendeeId:", existingAttendee.AttendeeId);
      console.log("   - Attendee completo:", JSON.stringify(existingAttendee, null, 2));
      
      const responseData = {
        attendee: existingAttendee,
        isRejoining: true,
        message: "Reutilizando attendee existente"
      };
      
      console.log("📤 Enviando respuesta (reutilización):", JSON.stringify(responseData, null, 2));
      console.log("=== FIN UNIRSE A REUNIÓN (REUTILIZACIÓN) ===\n");
      
      return res.json(responseData);
    }

    // Crear nuevo attendee solo si no existe
    const attendeeCommand = {
      MeetingId: meetingId,
      ExternalUserId: userId,
    };
    
    console.log("👤 Creando nuevo attendee con comando:", JSON.stringify(attendeeCommand, null, 2));
    
    const attendeeResponse = await chimeClient.send(
      new CreateAttendeeCommand(attendeeCommand)
    );
    
    console.log("✅ Respuesta de crear attendee:", JSON.stringify(attendeeResponse, null, 2));

    // Guardar el attendee en nuestro cache
    attendees.set(userId, attendeeResponse.Attendee);
    
    console.log("💾 Attendee guardado en memoria:", userId, "→", attendeeResponse.Attendee.AttendeeId);
    console.log("👥 Attendees actualizados:", Array.from(attendees.keys()));

    const responseData = {
      attendee: attendeeResponse.Attendee,
      isRejoining: false,
      message: "Nuevo attendee creado"
    };
    
    console.log("📤 Enviando respuesta:", JSON.stringify(responseData, null, 2));
    console.log("=== FIN UNIRSE A REUNIÓN ===\n");

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error al unirse a la reunión:", error);
    console.log("=== FIN UNIRSE A REUNIÓN (ERROR) ===\n");
    res.status(500).json({ error: error.message });
  }
});

/**
 * LEGACY: Mantener compatibilidad con el endpoint original
 */
app.post("/create-attendee", async (req, res) => {
  const { meetingId } = req.body;
  
  console.log("\n=== CREAR ATTENDEE (LEGACY) ===");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  if (!meetingId) {
    console.log("❌ meetingId es requerido");
    console.log("=== FIN CREAR ATTENDEE (ERROR) ===\n");
    return res.status(400).json({ error: "meetingId es requerido" });
  }

  if (!activeMeetings.has(meetingId)) {
    console.log("❌ Reunión no encontrada:", meetingId);
    console.log("=== FIN CREAR ATTENDEE (ERROR) ===\n");
    return res.status(404).json({ error: "La reunión no existe o ha finalizado." });
  }

  try {
    const userId = `user-${uuidv4().substring(0, 8)}`;
    const attendeeCommand = {
      MeetingId: meetingId,
      ExternalUserId: userId,
    };
    
    console.log("👤 Creando attendee legacy con comando:", JSON.stringify(attendeeCommand, null, 2));
    
    const attendeeResponse = await chimeClient.send(
      new CreateAttendeeCommand(attendeeCommand)
    );
    
    console.log("✅ Respuesta de crear attendee legacy:", JSON.stringify(attendeeResponse, null, 2));
    console.log("⚠️  ADVERTENCIA: Este endpoint no guarda en cache, puede crear duplicados");

    const responseData = {
      attendee: attendeeResponse.Attendee,
    };
    
    console.log("📤 Enviando respuesta:", JSON.stringify(responseData, null, 2));
    console.log("=== FIN CREAR ATTENDEE (LEGACY) ===\n");

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error creando asistente:", error);
    console.log("=== FIN CREAR ATTENDEE (ERROR) ===\n");
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener la lista de reuniones activas
app.get("/list-meetings", (req, res) => {
  console.log("\n=== LISTAR REUNIONES ===");
  console.log("📋 Reuniones en memoria:", Array.from(activeMeetings.keys()));
  
  const meetingsArray = Array.from(activeMeetings.values()).map(meeting => {
    const attendeeCount = meetingAttendees.has(meeting.MeetingId) ? 
      meetingAttendees.get(meeting.MeetingId).size : 0;
    
    const attendeesList = meetingAttendees.has(meeting.MeetingId) ?
      Array.from(meetingAttendees.get(meeting.MeetingId).keys()) : [];
    
    console.log(`📊 Reunión ${meeting.MeetingId}:`);
    console.log(`   - Attendees: ${attendeeCount}`);
    console.log(`   - Lista: [${attendeesList.join(', ')}]`);
    
    return {
      ...meeting,
      attendeeCount,
      attendeesList // Agregar lista de attendees para debug
    };
  });
  
  console.log("📤 Enviando respuesta:", JSON.stringify(meetingsArray, null, 2));
  console.log("=== FIN LISTAR REUNIONES ===\n");
  
  res.json(meetingsArray);
});

/**
 * CORREGIDO: Endpoint para que un usuario abandone una reunión
 */
app.post("/leave-meeting", async (req, res) => {
  const { meetingId, attendeeId, userId } = req.body;
  
  console.log("\n=== SALIR DE REUNIÓN ===");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  if (!meetingId || !attendeeId) {
    console.log("❌ Faltan parámetros requeridos");
    console.log("=== FIN SALIR DE REUNIÓN (ERROR) ===\n");
    return res.status(400).json({ 
      error: "meetingId y attendeeId son requeridos" 
    });
  }

  if (!activeMeetings.has(meetingId)) {
    console.log("❌ Reunión no encontrada:", meetingId);
    console.log("=== FIN SALIR DE REUNIÓN (ERROR) ===\n");
    return res.status(404).json({ error: "La reunión no existe." });
  }

  try {
    const deleteCommand = {
      MeetingId: meetingId,
      AttendeeId: attendeeId,
    };
    
    console.log("🗑️ Eliminando attendee con comando:", JSON.stringify(deleteCommand, null, 2));
    
    // CORREGIDO: Usar DeleteAttendeeCommand para eliminar realmente el attendee
    const deleteResponse = await chimeClient.send(
      new DeleteAttendeeCommand(deleteCommand)
    );
    
    console.log("✅ Respuesta de eliminar attendee:", JSON.stringify(deleteResponse, null, 2));

    // Limpiar de nuestro cache local si tenemos el userId
    if (userId && meetingAttendees.has(meetingId)) {
      const attendees = meetingAttendees.get(meetingId);
      console.log("👥 Attendees antes de eliminar:", Array.from(attendees.keys()));
      attendees.delete(userId);
      console.log("👥 Attendees después de eliminar:", Array.from(attendees.keys()));
      console.log(`💾 Usuario ${userId} (${attendeeId}) eliminado de la reunión ${meetingId}`);
    } else {
      console.log(`💾 Attendee ${attendeeId} eliminado de la reunión ${meetingId}`);
    }
    
    const responseData = { 
      success: true, 
      message: "Usuario eliminado de la reunión exitosamente",
      meetingId: meetingId,
      attendeeId: attendeeId
    };
    
    console.log("📤 Enviando respuesta:", JSON.stringify(responseData, null, 2));
    console.log("=== FIN SALIR DE REUNIÓN ===\n");
    
    res.json(responseData);
  } catch (error) {
    console.error("❌ Error al eliminar attendee:", error);
    console.log("=== FIN SALIR DE REUNIÓN (ERROR) ===\n");
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint para cerrar/finalizar una reunión completamente
 */
app.delete("/end-meeting", async (req, res) => {
  const { meetingId } = req.body;
  
  console.log("\n=== FINALIZAR REUNIÓN ===");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));
  
  if (!meetingId) {
    console.log("❌ meetingId es requerido");
    console.log("=== FIN FINALIZAR REUNIÓN (ERROR) ===\n");
    return res.status(400).json({ error: "meetingId es requerido" });
  }

  if (!activeMeetings.has(meetingId)) {
    console.log("❌ Reunión no encontrada:", meetingId);
    console.log("📋 Reuniones activas:", Array.from(activeMeetings.keys()));
    console.log("=== FIN FINALIZAR REUNIÓN (ERROR) ===\n");
    return res.status(404).json({ error: "La reunión no existe o ya ha finalizado." });
  }

  try {
    const deleteCommand = {
      MeetingId: meetingId,
    };
    
    console.log("🗑️ Eliminando reunión con comando:", JSON.stringify(deleteCommand, null, 2));
    
    // Mostrar estado antes de eliminar
    if (meetingAttendees.has(meetingId)) {
      console.log("👥 Attendees en la reunión antes de eliminar:", Array.from(meetingAttendees.get(meetingId).keys()));
    }
    
    // Eliminar la reunión de AWS Chime
    const deleteResponse = await chimeClient.send(
      new DeleteMeetingCommand(deleteCommand)
    );
    
    console.log("✅ Respuesta de eliminar reunión:", JSON.stringify(deleteResponse, null, 2));

    // Limpiar de nuestros almacenamientos locales
    activeMeetings.delete(meetingId);
    meetingAttendees.delete(meetingId);
    
    console.log(`💾 Reunión ${meetingId} eliminada de memoria local`);
    console.log("📋 Reuniones activas restantes:", Array.from(activeMeetings.keys()));
    
    const responseData = { 
      success: true, 
      message: "Reunión finalizada exitosamente",
      meetingId: meetingId 
    };
    
    console.log("📤 Enviando respuesta:", JSON.stringify(responseData, null, 2));
    console.log("=== FIN FINALIZAR REUNIÓN ===\n");
    
    res.json(responseData);
  } catch (error) {
    console.error("❌ Error finalizando reunión:", error);
    console.log("=== FIN FINALIZAR REUNIÓN (ERROR) ===\n");
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});