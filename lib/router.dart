import 'package:flutter/material.dart';
import 'home.dart';
import 'widgets/dialog_flow.dart';

const String FACTS_DIALOGFLOW = "FACTS_DIALOGFLOW";

Route<dynamic> generateRoute(RouteSettings routeSettings) {
  switch(routeSettings.name) {
    case '/':
      return MaterialPageRoute(builder: (context) => InfoScreen());
      break;

    case FACTS_DIALOGFLOW:
      return MaterialPageRoute(builder: (context) => GoogleAssistant());
      break;

    default:
      return MaterialPageRoute(builder: (context) => InfoScreen());
  }
}