// src/api.js

const API_BASE_URL = 'http://localhost:3001'; // Puerto correcto según tu backend

export const listMeetings = async () => {
  const response = await fetch(`${API_BASE_URL}/list-meetings`);
  if (!response.ok) {
    throw new Error('No se pudo obtener la lista de reuniones');
  }
  return response.json();
};

export const createMeeting = async (userName = 'Host') => {
  // Para el creador de la reunión, también usar un ID consistente
  const externalUserId = getUserId(userName);
  
  const response = await fetch(`${API_BASE_URL}/create-meeting`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ externalUserId })
  });
  if (!response.ok) {
    throw new Error('No se pudo crear la reunión');
  }
  const data = await response.json();
  console.log('Create meeting response:', data);
  return data;
};

// Generar o recuperar un ID único y persistente para el usuario
const getUserId = (userName) => {
  const storageKey = `chime-user-${userName}`;
  let userId = localStorage.getItem(storageKey);
  
  if (!userId) {
    // Crear un ID único basado en el nombre y timestamp
    userId = `${userName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    localStorage.setItem(storageKey, userId);
    console.log(`Nuevo ID de usuario creado: ${userId}`);
  } else {
    console.log(`ID de usuario recuperado: ${userId}`);
  }
  
  return userId;
};

export const joinMeeting = async (meetingInfo, userName = 'Anonymous') => {
  // Generar un ID consistente para el usuario
  const externalUserId = getUserId(userName);
  
  const response = await fetch(`${API_BASE_URL}/create-attendee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      meetingId: meetingInfo.MeetingId,
      externalUserId: externalUserId 
    }),
  });
  if (!response.ok) {
    throw new Error('No se pudo unir a la reunión');
  }
  const data = await response.json();
  console.log('Join meeting response:', data);
  console.log('Original meeting info:', meetingInfo);
  
  // Tu backend devuelve solo attendee, necesitamos agregar meeting info
  const result = {
    meeting: meetingInfo,
    attendee: data.attendee,
  };
  
  console.log('Final join result:', result);
  return result;
};

// Función para limpiar el ID de usuario (útil para testing)
export const clearUserId = (userName) => {
  const storageKey = `chime-user-${userName}`;
  localStorage.removeItem(storageKey);
  console.log(`ID de usuario limpiado para: ${userName}`);
};