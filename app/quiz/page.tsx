import Quiz from '@/app/components/Quiz/Quiz'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz Oficial FC Barcelona - Desbloquea tu Oferta de Campeón',
  description: 'Responde a unas preguntas para demostrar que eres un verdadero culé y desbloquea el precio exclusivo de la camiseta oficial 2026.',
}

export default function QuizPage() {
  return <Quiz />
}
