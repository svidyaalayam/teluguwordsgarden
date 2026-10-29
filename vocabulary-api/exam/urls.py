from django.urls import path
from . import views

urlpatterns = [
    path('papers/', views.ExamPaperListView.as_view(), name='exam-paper-list'),
    path('papers/<slug:slug>/', views.ExamPaperDetailView.as_view(), name='exam-paper-detail'),
    path('papers/<slug:slug>/start/', views.StartAttemptView.as_view(), name='exam-start'),
    path('attempts/<int:pk>/', views.AttemptDetailView.as_view(), name='exam-attempt-detail'),
    path('attempts/<int:pk>/answer/', views.SubmitAnswerView.as_view(), name='exam-submit-answer'),
    path('attempts/<int:pk>/submit/', views.SubmitExamView.as_view(), name='exam-submit'),
    path('attempts/<int:pk>/result/', views.ExamResultView.as_view(), name='exam-result'),
]
