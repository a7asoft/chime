// src/MeetingView.js

import React, { useState, useEffect, useRef } from 'react';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration
} from 'amazon-chime-sdk-js';
import './MeetingView.css';

const MeetingView = ({ joinInfo, onLeave }) => {
  console.log('MeetingView joinInfo:', joinInfo);
  
  if (!joinInfo || !joinInfo.meeting || !joinInfo.attendee) {
    return (
      <div className="meeting-error">
        <h3>❌ Error de conexión</h3>
        <p>No se pudo obtener la información de la reunión</p>
        <button onClick={onLeave} className="btn btn-primary">Volver</button>
      </div>
    );
  }

  return <ChimeMeeting joinInfo={joinInfo} onLeave={onLeave} />;
};

const ChimeMeeting = ({ joinInfo, onLeave }) => {
  const [meetingSession, setMeetingSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [showControls, setShowControls] = useState(true);
  const [videoTiles, setVideoTiles] = useState(new Map());
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');
  const [selectedVideoInput, setSelectedVideoInput] = useState('');
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const videoElementRef = useRef(null);
  const audioElementRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        console.log('Initializing Chime meeting directly...');
        
        // Crear configuración de la sesión
        const logger = new ConsoleLogger('ChimeMeeting', LogLevel.INFO);
        const deviceController = new DefaultDeviceController(logger);
        
        const configuration = new MeetingSessionConfiguration(
          joinInfo.meeting,
          joinInfo.attendee
        );
        
        const session = new DefaultMeetingSession(
          configuration,
          logger,
          deviceController
        );
        
        setMeetingSession(session);
        
        // Configurar observadores de audio/video
        const audioVideoObserver = {
          audioVideoDidStart: () => {
            console.log('Audio/Video started - Meeting connected!');
            setIsConnected(true);
          },
          audioVideoDidStop: (sessionStatus) => {
            console.log('Audio/Video stopped:', sessionStatus);
            setIsConnected(false);
          },
          connectionDidBecomePoor: () => {
            console.log('Connection became poor');
          },
          connectionDidSuggestStopVideo: () => {
            console.log('Connection suggests stopping video');
          },
          videoSendDidBecomeUnavailable: () => {
            console.log('Video send became unavailable');
          }
        };
        
        session.audioVideo.addObserver(audioVideoObserver);
        
        // Configurar roster correctamente
        const rosterCallback = (roster) => {
          console.log('Roster updated - Raw roster:', roster);
          console.log('Roster keys count:', Object.keys(roster).length);
          
          // Filtrar solo participantes realmente presentes
          const attendeeList = Object.keys(roster)
            .filter(attendeeId => {
              const attendee = roster[attendeeId];
              // Solo incluir si el participante está presente y tiene datos válidos
              return attendee && attendee.externalUserId && attendee.externalUserId !== '';
            })
            .map(attendeeId => ({
              attendeeId,
              externalUserId: roster[attendeeId].externalUserId,
              name: roster[attendeeId].externalUserId || 'Usuario'
            }));
          
          console.log('Filtered attendee list:', attendeeList);
          console.log('Final attendee count:', attendeeList.length);
          
          // Evitar duplicados por externalUserId
          const uniqueAttendees = attendeeList.reduce((acc, current) => {
            const existing = acc.find(item => item.externalUserId === current.externalUserId);
            if (!existing) {
              acc.push(current);
            }
            return acc;
          }, []);
          
          console.log('Unique attendees:', uniqueAttendees);
          setAttendees(uniqueAttendees);
        };
        
        session.audioVideo.realtimeSubscribeToAttendeeIdPresence(rosterCallback);
        
        // También suscribirse a cambios de volumen para detectar participantes activos
        session.audioVideo.realtimeSubscribeToVolumeIndicator(
          joinInfo.attendee.attendeeId,
          (attendeeId, volume, muted, signalStrength) => {
            console.log(`Volume for ${attendeeId}: ${volume}, muted: ${muted}`);
          }
        );
        
        // Iniciar la sesión
        await session.audioVideo.start();
        console.log('Meeting session started successfully');
        
        // Forzar actualización del estado de conexión después de un breve delay
        setTimeout(() => {
          console.log('Forcing connection state update');
          setIsConnected(true);
        }, 2000);
        
        // Configurar audio y video correctamente
        if (audioElementRef.current) {
          session.audioVideo.bindAudioElement(audioElementRef.current);
        }
        
        // Configurar video tiles correctamente - versión optimizada
        const videoTileObserver = {
          videoTileDidUpdate: (tileState) => {
            console.log('Video tile updated:', tileState.tileId, 'Local:', tileState.localTile, 'Bound:', tileState.boundVideoElement);
            
            if (tileState.localTile) {
              // Video local - asegurar binding correcto
              if (videoElementRef.current && !tileState.boundVideoElement) {
                try {
                  session.audioVideo.bindVideoElement(tileState.tileId, videoElementRef.current);
                  console.log('Local video bound to element successfully');
                } catch (error) {
                  console.error('Error binding local video:', error);
                }
              }
            } else {
              // Video remoto - evitar duplicados y limpiar elementos previos
              setVideoTiles(prev => {
                // Si ya existe, no crear uno nuevo
                if (prev.has(tileState.tileId)) {
                  console.log('Remote tile already exists, updating:', tileState.tileId);
                  return prev;
                }
                
                console.log('Creating new remote video tile:', tileState.tileId);
                const newTiles = new Map(prev);
                
                // Crear elemento de video solo si no existe
                newTiles.set(tileState.tileId, {
                  ...tileState,
                  videoElement: null // Se creará en el render
                });
                
                return newTiles;
              });
            }
          },
          videoTileWasRemoved: (tileId) => {
            console.log('Video tile removed:', tileId);
            setVideoTiles(prev => {
              const newTiles = new Map(prev);
              const tile = newTiles.get(tileId);
              if (tile && tile.videoElement) {
                // Desconectar antes de remover
                try {
                  session.audioVideo.unbindVideoElement(tileId);
                } catch (error) {
                  console.warn('Error unbinding video element:', error);
                }
                tile.videoElement.remove();
              }
              newTiles.delete(tileId);
              return newTiles;
            });
          }
        };
        
        session.audioVideo.addObserver(videoTileObserver);
        
        // Listar y configurar dispositivos
        await loadDevices(session);
        
        // Iniciar dispositivos de audio y video
        try {
          // Iniciar audio por defecto y asegurar transmisión
          const audioInputDevices = await session.audioVideo.listAudioInputDevices();
          if (audioInputDevices.length > 0) {
            await session.audioVideo.startAudioInput(audioInputDevices[0].deviceId);
            setSelectedAudioInput(audioInputDevices[0].deviceId);
            
            // Asegurar que el audio esté desmutado para transmisión
            session.audioVideo.realtimeUnmuteLocalAudio();
            setIsAudioEnabled(true);
            
            console.log('Audio input started and unmuted for transmission:', audioInputDevices[0].label);
          }
          
          // Configurar salida de audio
          const audioOutputDevices = await session.audioVideo.listAudioOutputDevices();
          if (audioOutputDevices.length > 0 && audioElementRef.current) {
            await session.audioVideo.chooseAudioOutput(audioOutputDevices[0].deviceId);
            setSelectedAudioOutput(audioOutputDevices[0].deviceId);
            console.log('Audio output set:', audioOutputDevices[0].label);
          }
          
          // Iniciar video por defecto y asegurar transmisión
          const videoInputDevices = await session.audioVideo.listVideoInputDevices();
          if (videoInputDevices.length > 0) {
            await session.audioVideo.startVideoInput(videoInputDevices[0].deviceId);
            setSelectedVideoInput(videoInputDevices[0].deviceId);
            setIsVideoEnabled(true);
            console.log('Video input started:', videoInputDevices[0].label);
            
            // Asegurar que el video local se transmita y se muestre
            setTimeout(async () => {
              try {
                await session.audioVideo.startLocalVideoTile();
                console.log('Local video tile started for transmission');
                
                // Múltiples intentos de binding para asegurar que funcione
                const bindLocalVideo = () => {
                  if (videoElementRef.current) {
                    const localTile = session.audioVideo.getLocalVideoTile();
                    if (localTile) {
                      const tileId = localTile.state().tileId;
                      try {
                        session.audioVideo.bindVideoElement(tileId, videoElementRef.current);
                        console.log('Local video successfully bound with tileId:', tileId);
                        
                        // Verificar que el elemento tenga stream
                        setTimeout(() => {
                          if (videoElementRef.current && !videoElementRef.current.srcObject) {
                            console.log('Retrying local video binding...');
                            session.audioVideo.bindVideoElement(tileId, videoElementRef.current);
                          }
                        }, 1000);
                      } catch (error) {
                        console.error('Error binding local video:', error);
                      }
                    }
                  }
                };
                
                // Intentar binding múltiples veces
                setTimeout(bindLocalVideo, 500);
                setTimeout(bindLocalVideo, 1500);
                setTimeout(bindLocalVideo, 3000);
                
              } catch (error) {
                console.warn('Could not start local video tile:', error);
              }
            }, 1000);
          }
        } catch (mediaError) {
          console.warn('Could not start media devices:', mediaError);
        }
        
      } catch (error) {
        console.error('Error initializing meeting:', error);
      }
    };
    
    initializeMeeting();
    
    return () => {
      if (meetingSession) {
        meetingSession.audioVideo.stop();
      }
    };
  }, [joinInfo]);

  const loadDevices = async (session) => {
    try {
      const audioInputDevices = await session.audioVideo.listAudioInputDevices();
      const audioOutputDevices = await session.audioVideo.listAudioOutputDevices();
      const videoInputDevices = await session.audioVideo.listVideoInputDevices();
      
      setAudioDevices({
        inputs: audioInputDevices,
        outputs: audioOutputDevices
      });
      setVideoDevices(videoInputDevices);
      
      console.log('Devices loaded:', {
        audioInputs: audioInputDevices.length,
        audioOutputs: audioOutputDevices.length,
        videoInputs: videoInputDevices.length
      });
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const handleLeave = async () => {
    if (meetingSession) {
      await meetingSession.audioVideo.stop();
    }
    onLeave();
  };

  const toggleAudio = async () => {
    if (!meetingSession?.audioVideo) return;
    
    try {
      if (isAudioEnabled) {
        meetingSession.audioVideo.realtimeMuteLocalAudio();
        console.log('Audio muted - stopping transmission');
      } else {
        meetingSession.audioVideo.realtimeUnmuteLocalAudio();
        console.log('Audio unmuted - starting transmission');
      }
      setIsAudioEnabled(!isAudioEnabled);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  const toggleVideo = async () => {
    if (!meetingSession?.audioVideo) return;
    
    try {
      if (isVideoEnabled) {
        await meetingSession.audioVideo.stopVideoInput();
        meetingSession.audioVideo.stopLocalVideoTile();
        console.log('Video stopped - stopping transmission');
      } else {
        const deviceId = selectedVideoInput || (videoDevices.length > 0 ? videoDevices[0].deviceId : null);
        if (deviceId) {
          await meetingSession.audioVideo.startVideoInput(deviceId);
          await meetingSession.audioVideo.startLocalVideoTile();
          console.log('Video started with device:', deviceId, '- starting transmission');
        }
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const changeAudioInput = async (deviceId) => {
    if (!meetingSession?.audioVideo) return;
    
    try {
      await meetingSession.audioVideo.startAudioInput(deviceId);
      setSelectedAudioInput(deviceId);
      console.log('Audio input changed to:', deviceId);
    } catch (error) {
      console.error('Error changing audio input:', error);
    }
  };

  const changeAudioOutput = async (deviceId) => {
    if (!meetingSession?.audioVideo) return;
    
    try {
      await meetingSession.audioVideo.chooseAudioOutput(deviceId);
      setSelectedAudioOutput(deviceId);
      console.log('Audio output changed to:', deviceId);
    } catch (error) {
      console.error('Error changing audio output:', error);
    }
  };

  const changeVideoInput = async (deviceId) => {
    if (!meetingSession?.audioVideo) return;
    
    try {
      if (isVideoEnabled) {
        await meetingSession.audioVideo.startVideoInput(deviceId);
      }
      setSelectedVideoInput(deviceId);
      console.log('Video input changed to:', deviceId);
    } catch (error) {
      console.error('Error changing video input:', error);
    }
  };

  useEffect(() => {
    let timer;
    if (showControls) {
      timer = setTimeout(() => setShowControls(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [showControls]);

  return (
    <div 
      className="meeting-container"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Audio element for Chime */}
      <audio ref={audioElementRef} autoPlay />
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="connection-status">
          <div className="connecting-spinner"></div>
          <p>Conectando a la reunión...</p>
        </div>
      )}
      
      {/* Video Grid */}
      <div className="video-container">
        <div className="video-grid">
          {/* Video Local */}
          <div className="video-tile local-tile">
            <video 
              ref={videoElementRef}
              autoPlay
              muted
              playsInline
              className="local-video"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
                transform: 'scaleX(-1)', // Efecto espejo para video local
                display: isVideoEnabled ? 'block' : 'none'
              }}
            />
            {!isVideoEnabled && (
              <div className="video-placeholder">
                <div className="avatar-large">
                  👤
                </div>
                <p>Cámara desactivada</p>
              </div>
            )}
            <div className="video-label">Tú (Local)</div>
          </div>
          
          {/* Videos Remotos */}
          {Array.from(videoTiles.values()).map((tile) => (
            <div key={tile.tileId} className="video-tile remote-tile">
              <video
                ref={(videoEl) => {
                  if (videoEl && !tile.videoElement) {
                    try {
                      meetingSession.audioVideo.bindVideoElement(tile.tileId, videoEl);
                      console.log('Remote video bound directly to element:', tile.tileId);
                      // Actualizar el tile con el elemento
                      setVideoTiles(prev => {
                        const newTiles = new Map(prev);
                        const existingTile = newTiles.get(tile.tileId);
                        if (existingTile) {
                          existingTile.videoElement = videoEl;
                        }
                        return newTiles;
                      });
                    } catch (error) {
                      console.error('Error binding remote video:', error);
                    }
                  }
                }}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000'
                }}
              />
              <div className="video-label">
                Participante {tile.attendeeId?.slice(-8) || 'Remoto'}
              </div>
            </div>
          ))}
          
          {/* Placeholder si no hay videos remotos */}
          {videoTiles.size === 0 && isConnected && (
            <div className="video-tile placeholder-tile">
              <div className="video-placeholder">
                <div className="avatar-large">
                  👥
                </div>
                <p>Esperando otros participantes...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Participants Sidebar */}
      <div className="participants-sidebar">
        <div className="participants-header">
          <h3>👥 Participantes ({attendees.length})</h3>
          <button 
            className="device-settings-btn"
            onClick={() => setShowDeviceSettings(!showDeviceSettings)}
            title="Configurar dispositivos"
          >
            ⚙️
          </button>
        </div>
        
        {/* Panel de configuración de dispositivos */}
        {showDeviceSettings && (
          <div className="device-settings">
            <h4>🎤 Audio</h4>
            <div className="device-group">
              <label>Micrófono:</label>
              <select 
                value={selectedAudioInput} 
                onChange={(e) => changeAudioInput(e.target.value)}
              >
                {audioDevices.inputs?.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Micrófono ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="device-group">
              <label>Altavoces:</label>
              <select 
                value={selectedAudioOutput} 
                onChange={(e) => changeAudioOutput(e.target.value)}
              >
                {audioDevices.outputs?.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Altavoz ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
            
            <h4>📹 Video</h4>
            <div className="device-group">
              <label>Cámara:</label>
              <select 
                value={selectedVideoInput} 
                onChange={(e) => changeVideoInput(e.target.value)}
              >
                {videoDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Cámara ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="participants-list">
          {isConnected ? (
            attendees.length > 0 ? (
              attendees.map((attendee, index) => (
                <div key={attendee.attendeeId || index} className="participant-item">
                  <div className="participant-avatar">
                    {attendee.name?.charAt(0)?.toUpperCase() || '👤'}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">
                      {attendee.name || 'Usuario'}
                    </span>
                    <span className="participant-status">
                      🟢 Conectado
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-participants">
                <p>Solo tú en la reunión</p>
              </div>
            )
          ) : (
            <div className="no-participants">
              <p>Conectando participantes...</p>
            </div>
          )}
        </div>
        
        <div className="meeting-info">
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'connecting'}`}></span>
            <span>{isConnected ? 'Conectado' : 'Conectando...'}</span>
          </div>
        </div>
      </div>
      
      {/* Control Bar */}
      <div className={`controls-overlay ${showControls ? 'visible' : ''}`}>
        <div className="meeting-controls">
          <button 
            className={`control-btn ${isAudioEnabled ? 'active' : 'muted'}`}
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>
          
          <button 
            className={`control-btn video-btn ${!isVideoEnabled ? 'muted' : ''}`}
            onClick={toggleVideo}
            title={isVideoEnabled ? 'Desactivar cámara' : 'Activar cámara'}
          >
            📹
          </button>
          
          <button 
            className="control-btn leave-btn"
            onClick={handleLeave}
            title="Salir de la reunión"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingView;