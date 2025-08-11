import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_aws_chime/models/join_info.model.dart';

class ChimeApiService {
  // ⚠️ USA LA IP DE TU PC, NO LOCALHOST
  final String _baseUrl = 'http://192.168.0.105:3001';

  Future<List<MeetingInfo>> listMeetings() async {
    final response = await http.get(Uri.parse('$_baseUrl/list-meetings'));
    if (response.statusCode == 200) {
      final List<dynamic> meetingsJson = json.decode(response.body);
      return meetingsJson.map((json) => MeetingInfo.fromJson(json)).toList();
    } else {
      throw Exception('Fallo al cargar la lista de reuniones');
    }
  }

  Future<JoinInfo> createMeeting() async {
    final response = await http.post(Uri.parse('$_baseUrl/create-meeting'));
    if (response.statusCode == 200) {
      final jsonBody = json.decode(response.body);
      return JoinInfo(
        MeetingInfo.fromJson(jsonBody['meeting']),
        AttendeeInfo.fromJson(jsonBody['attendee']),
      );
    } else {
      throw Exception('Fallo al crear la reunión');
    }
  }

  Future<JoinInfo> joinMeeting(MeetingInfo meetingInfo) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/create-attendee'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'meetingId': meetingInfo.meetingId}),
    );
    if (response.statusCode == 200) {
      final jsonBody = json.decode(response.body);
      //prin response json
      print("response json in json format: $jsonBody");
      // Combinamos la info de la reunión que ya teníamos con la del nuevo asistente
      return JoinInfo(meetingInfo, AttendeeInfo.fromJson(jsonBody['attendee']));
    } else {
      throw Exception('Fallo al unirse a la reunión');
    }
  }

  // Terminar la reunión para todos (requiere endpoint en el backend)
  // Backend: DELETE /end-meeting { meetingId }
  Future<void> endMeeting(String meetingId) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/end-meeting'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'meetingId': meetingId}),
    );
    if (response.statusCode != 200) {
      throw Exception('Fallo al terminar la reunión');
    }
  }

  // Salir de la reunión sólo este asistente (requiere endpoint en el backend si deseas limpiar estado)
  // Sugerencia backend: POST /leave-meeting { meetingId, attendeeId }
  Future<void> leaveMeeting({
    required String meetingId,
    required String attendeeId,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/leave-meeting'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'meetingId': meetingId, 'attendeeId': attendeeId}),
    );
    if (response.statusCode != 200) {
      throw Exception('Fallo al salir de la reunión');
    }
  }
}
