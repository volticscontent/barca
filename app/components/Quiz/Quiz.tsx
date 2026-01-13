"use client"

import React from "react"
import { questions } from "./data"
import { usePixelLoader, useQuizLogic, useQuizTimer } from "./hooks"
import { 
  QuizStartScreen, 
  QuizQuestionScreen, 
  QuizCompletedScreen 
} from "./ui"

// Declare tipos globais para os pixels
declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void };
    pixelId?: string;
  }
}

export default function PSGQuiz() {
  // Logic Hook
  const { state, actions } = useQuizLogic();
  
  // Timer Hook
  const progressValue = useQuizTimer(
    state.gameStarted, 
    state.quizCompleted, 
    state.currentQuestion, 
    actions.handleAnswer
  );

  // Pixel Loader Hook
  usePixelLoader();

  // Render Start Screen
  if (!state.gameStarted) {
    return (
      <QuizStartScreen 
        onStart={actions.handleStartQuiz}
        isLoading={state.isLoading}
        showUSPPanel={state.showUSPPanel}
        onUSPClose={actions.handleUSPClose}
      />
    );
  }

  // Render Completed Screen
  if (state.quizCompleted) {
    return (
      <QuizCompletedScreen 
        correctAnswers={state.correctAnswers}
        onBuyClick={actions.handleBuyNowClick}
        showUSPPanel={state.showUSPPanel}
        onUSPClose={actions.handleUSPClose}
      />
    );
  }

  // Render Question Screen
  return (
    <QuizQuestionScreen 
      question={questions[state.currentQuestion]}
      selectedAnswer={state.selectedAnswer}
      onAnswerChange={actions.setSelectedAnswer}
      onConfirm={actions.handleAnswer}
      isSubmitting={state.isSubmitting}
      progressValue={progressValue}
      correctAnswers={state.correctAnswers}
      showNotification={state.showNotification}
      onNotificationClose={() => actions.setShowNotification(false)}
      showUSPPanel={state.showUSPPanel}
      onUSPClose={actions.handleUSPClose}
    />
  );
}
