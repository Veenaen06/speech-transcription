from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Transcription
from .serializers import TranscriptionSerializer

import datetime
import os

from google import genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status



class TranscriptionViewSet(viewsets.ModelViewSet):
    queryset = Transcription.objects.all().order_by("-created_at")
    serializer_class = TranscriptionSerializer
    permission_classes = [AllowAny]

@api_view(["POST"])
@permission_classes([AllowAny])
def create_live_token(request):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return Response(
            {"error": "GEMINI_API_KEY is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        client = genai.Client(api_key=api_key)

        expires_at = (
            datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(minutes=30)
        )

        token = client.auth_tokens.create(
            config={
                "uses": 1,
                "expire_time": expires_at,
                "live_connect_constraints": {
                    "model": "gemini-3.5-transcribe-live",
                    "config": {
                        "response_modalities": ["TEXT"],
                        "input_audio_transcription": {
                            "language_codes": [],
                        },
                    },
                },
            }
        )

        return Response({"token": token.name})

    except Exception:
        return Response(
            {"error": "Could not create a Gemini Live token. Check your API access and server logs."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
