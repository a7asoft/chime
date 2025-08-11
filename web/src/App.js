// src/App.js

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles, lightTheme, darkTheme } from 'amazon-chime-sdk-component-library-react';
import { listMeetings, createMeeting, joinMeeting } from './api';
import MeetingView from './MeetingView';
import './App.css';

function App() {
  const [meetings, setMeetings] = useState([]);
  const [joinInfo, setJoinInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingMeeting, setPendingMeeting] = useState(null);

  // Cargar la lista de reuniones al iniciar
  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const meetingList = await listMeetings();
      setMeetings(meetingList);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateMeeting = async () => {
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const newJoinInfo = await createMeeting(userName);
      setJoinInfo(newJoinInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingInfo) => {
    if (!userName.trim()) {
      setPendingMeeting(meetingInfo);
      setShowNameModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      const newJoinInfo = await joinMeeting(meetingInfo, userName);
      setJoinInfo(newJoinInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!userName.trim()) return;
    
    setShowNameModal(false);
    if (pendingMeeting) {
      await handleJoinMeeting(pendingMeeting);
      setPendingMeeting(null);
    }
  };
  
  // Si tenemos joinInfo, mostramos la reunión. Si no, la lista.
  if (joinInfo) {
    return (
      <ThemeProvider theme={lightTheme}> {/* Se puede usar lightTheme o darkTheme de la librería */}
        <GlobalStyles />
        <MeetingView joinInfo={joinInfo} onLeave={() => {
          setJoinInfo(null); // Limpiamos para volver a la lista
          fetchMeetings(); // Recargamos la lista
        }} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <GlobalStyles />
      <div className="app-container">
        <div className="header">
          <h1>🎥 Chime Video Meetings</h1>
          <div className="header-controls">
            <input
              type="text"
              placeholder="Tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="name-input"
            />
            <button 
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="theme-toggle"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        
        <div className="actions">
          <button 
            onClick={handleCreateMeeting} 
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? '⏳ Creando...' : '➕ Crear Nueva Reunión'}
          </button>
          <button 
            onClick={fetchMeetings} 
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? '⏳ Cargando...' : '🔄 Refrescar'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        <div className="meetings-grid">
          {meetings.length === 0 && !isLoading ? (
            <div className="empty-state">
              <h3>📭 No hay reuniones disponibles</h3>
              <p>Crea una nueva reunión para comenzar</p>
            </div>
          ) : (
            meetings.map(meeting => (
              <div key={meeting.MeetingId} className="meeting-card">
                <div className="meeting-info">
                  <h3>📹 {meeting.ExternalMeetingId}</h3>
                  <p>👥 {meeting.attendeeCount || 0} participantes</p>
                  <p>🌍 {meeting.MediaRegion}</p>
                </div>
                <button 
                  onClick={() => handleJoinMeeting(meeting)}
                  disabled={isLoading}
                  className="btn btn-join"
                >
                  🚀 Unirse
                </button>
              </div>
            ))
          )}
        </div>
        
        {showNameModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>👤 Ingresa tu nombre</h3>
              <input
                type="text"
                placeholder="Tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="name-input"
                autoFocus
              />
              <div className="modal-actions">
                <button onClick={() => setShowNameModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button 
                  onClick={handleNameSubmit} 
                  disabled={!userName.trim()}
                  className="btn btn-primary"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;