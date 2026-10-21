
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TranscriptionViewSet, create_live_token

router = DefaultRouter()
router.register(
    r"transcriptions",
    TranscriptionViewSet,
    basename="transcription",
)

urlpatterns = [
    path("", include(router.urls)),
    path("live-token/", create_live_token, name="live-token"),
]
