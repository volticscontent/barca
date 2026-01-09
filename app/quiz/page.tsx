import Quiz from '@/app/components/Quiz/Quiz'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz Officiel PSG - Trouvez Votre Maillot Idéal',
  description: 'Répondez à quelques questions pour découvrir votre maillot parfait et débloquer une offre exclusive.',
}

export default function QuizPage() {
  return <Quiz />
}
