import 'package:flutter/material.dart';
import 'package:flutter_aws_chime/models/join_info.model.dart';
import 'api_service.dart';
import 'meeting_view_screen.dart';

class MeetingListScreen extends StatefulWidget {
  const MeetingListScreen({super.key});

  @override
  State<MeetingListScreen> createState() => _MeetingListScreenState();
}

class _MeetingListScreenState extends State<MeetingListScreen> {
  final ChimeApiService _apiService = ChimeApiService();
  late Future<List<MeetingInfo>> _meetingsFuture;

  @override
  void initState() {
    super.initState();
    _loadMeetings();
  }

  void _loadMeetings() {
    setState(() {
      _meetingsFuture = _apiService.listMeetings();
    });
  }

  Future<void> _joinMeeting(MeetingInfo meetingInfo) async {
    try {
      final joinInfo = await _apiService.joinMeeting(meetingInfo);
      Navigator.of(context)
          .push(
            MaterialPageRoute(
              builder: (_) => MeetingViewScreen(joinInfo: joinInfo),
            ),
          )
          .then((_) => _loadMeetings()); // Recargar lista al volver
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error al unirse: $e')));
    }
  }

  Future<void> _createNewMeeting() async {
    try {
      final joinInfo = await _apiService.createMeeting();
      Navigator.of(context)
          .push(
            MaterialPageRoute(
              builder: (_) => MeetingViewScreen(joinInfo: joinInfo),
            ),
          )
          .then((_) => _loadMeetings()); // Recargar lista al volver
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error al crear: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reuniones Activas'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadMeetings),
        ],
      ),
      body: FutureBuilder<List<MeetingInfo>>(
        future: _meetingsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No hay reuniones activas.'));
          }

          final meetings = snapshot.data!;
          return ListView.builder(
            itemCount: meetings.length,
            itemBuilder: (context, index) {
              final meeting = meetings[index];
              return ListTile(
                title: Text(meeting.externalMeetingId),
                subtitle: Text('ID: ${meeting.meetingId}'),
                trailing: const Icon(Icons.arrow_forward_ios),
                onTap: () => _joinMeeting(meeting),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createNewMeeting,
        child: const Icon(Icons.add),
        tooltip: 'Crear Reunión',
      ),
    );
  }
}
