import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function HomePage() {
  return (
    <div className="page-shell learning-home">
      <Header />
      <main className="learning-home-content">
        <section className="learning-home-hero">
          <p className="learning-home-kicker">బాలముకుందము · Telugu Learning</p>
          <h1>Learn Telugu, one letter and one word at a time.</h1>
          <p>
            A friendly place for children to practise Telugu letters, sounds, writing, and everyday vocabulary.
          </p>
        </section>
        <section className="learning-home-cards" aria-label="Learning activities">
          <article className="learning-home-card">
            <span className="learning-home-icon">అ</span>
            <h2>Varnamala</h2>
            <p>Explore Telugu and Hindi letters, listen to sounds, watch stroke order, and practise tracing.</p>
            <Link className="home-btn" to="/varnamala">Start alphabet learning</Link>
          </article>
          <article className="learning-home-card">
            <span className="learning-home-icon">🌱</span>
            <h2>Word Garden</h2>
            <p>Discover Telugu words through picture cards, category browsing, and fun listening activities.</p>
            <Link className="home-btn" to="/word-garden">Explore Word Garden</Link>
          </article>
          <article className="learning-home-card">
            <span className="learning-home-icon">📚</span>
            <h2>Resources</h2>
            <p>Read textbooks, stories, epics, satakams and printable worksheets in one place.</p>
            <Link className="home-btn" to="/resources">Browse resources</Link>
          </article>
          <article className="learning-home-card">
            <span className="learning-home-icon">📝</span>
            <h2>Exams</h2>
            <p>Test your Telugu knowledge with interactive multiple-choice examinations.</p>
            <Link className="home-btn" to="/exam/level-1-achulu">Take Level 1 Exam</Link>
          </article>
        </section>
      </main>
    </div>
  )
}
