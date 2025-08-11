import 'package:flutter/material.dart';
import 'package:flutter_aws_chime/models/join_info.model.dart';
import 'package:flutter_aws_chime/views/meeting.view.dart';
import 'api_service.dart';

class MeetingViewScreen extends StatelessWidget {
  final JoinInfo joinInfo;

  const MeetingViewScreen({super.key, required this.joinInfo});

  @override
  Widget build(BuildContext context) {
    final api = ChimeApiService();

    Future<void> confirmAndEnd() async {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Terminar reunión'),
          content: const Text(
            'Esto finalizará la reunión para todos. ¿Continuar?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('Terminar'),
            ),
          ],
        ),
      );
      if (confirmed != true) return;

      try {
        await api.endMeeting(joinInfo.meeting.meetingId);
        if (context.mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Reunión terminada')));
          Navigator.of(context).pop();
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('No se pudo terminar la reunión: $e')),
          );
        }
      }
    }

    Future<void> leave() async {
      // Notificar al backend que este usuario abandona la reunión (opcional pero recomendado)
      try {
        await api.leaveMeeting(
          meetingId: joinInfo.meeting.meetingId,
          attendeeId: joinInfo.attendee.attendeeId,
        );
      } catch (e) {
        // No bloquear la salida si el backend falla; solo notificar.
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('No se pudo notificar la salida: $e')),
          );
        }
      } finally {
        if (context.mounted) {
          Navigator.of(context).pop();
        }
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(joinInfo.meeting.externalMeetingId),
        actions: [
          IconButton(
            tooltip: 'Salir',
            icon: const Icon(Icons.exit_to_app),
            onPressed: leave,
          ),
          IconButton(
            tooltip: 'Terminar para todos',
            icon: const Icon(Icons.stop_circle_outlined),
            onPressed: confirmAndEnd,
          ),
        ],
      ),
      // El widget de la librería se encarga de todo
      body: MeetingView(joinInfo),
    );
  }
}
