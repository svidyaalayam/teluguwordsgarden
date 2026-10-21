import { useEffect, useState } from 'react'
import Header from '../components/Header'
import WordCard from '../components/WordCard'
import SoundQuizActivity from '../components/SoundQuizActivity'
import ListenSpellActivity from '../components/ListenSpellActivity'
import MatchWordsActivity from '../components/MatchWordsActivity'
import { formatBilingualCategory } from '../utils/wordVisuals'
import {
  listLearningLevels,
  listVocabularyCategories,
  listVocabularyWords,
  type LearningLevel,
  type VocabularyCategory,
  type VocabularyWord,
} from '../api/vocabulary'

type ActiveTab = 'cards' | 'sound-quiz' | 'listen-spell' | 'matching'

function groupWordsByCategory(
  words: VocabularyWord[],
  categories: VocabularyCategory[],
  selectedCategory: string,
) {
  const groups = categories
    .filter(category => !selectedCategory || category.id === Number(selectedCategory))
    .map(category => ({
      id: category.id,
      name: category.name,
      words: words.filter(word => word.categories.includes(category.id)),
    }))
    .filter(group => group.words.length > 0)

  if (!selectedCategory) {
    const knownCategoryIds = new Set(categories.map(category => category.id))
    const uncategorizedWords = words.filter(word => word.categories.length === 0)
    const otherCategoryWords = words.filter(word =>
      word.categories.some(categoryId => !knownCategoryIds.has(categoryId)),
    )
    if (uncategorizedWords.length > 0) {
      groups.push({ id: 0, name: 'ఇతర పదాలు (Other Words)', words: uncategorizedWords })
    }
    if (otherCategoryWords.length > 0) {
      groups.push({ id: -1, name: 'మరిన్ని విభాగాలు (More Categories)', words: otherCategoryWords })
    }
  }

  return groups
}

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cards')
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [categories, setCategories] = useState<VocabularyCategory[]>([])
  const [levels, setLevels] = useState<LearningLevel[]>([])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')

  const loadWords = async () => {
    try {
      setWords(await listVocabularyWords(query))
      setError('')
    } catch {
      setError('Could not load vocabulary right now.')
    }
  }

  useEffect(() => {
    loadWords()
    Promise.all([listVocabularyCategories(), listLearningLevels()])
      .then(([categoryResults, levelResults]) => {
        setCategories(categoryResults)
        setLevels(levelResults)
      })
      .catch(() => setFilterError('Could not load vocabulary levels and categories right now.'))
  }, [])

  const visibleWords = words.filter(word =>
    (!selectedLevel || word.levels.includes(Number(selectedLevel))) &&
    (!selectedCategory || word.categories.includes(Number(selectedCategory))),
  )
  const visibleLevels = selectedLevel
    ? levels.filter(level => level.id === Number(selectedLevel))
    : levels
  const wordGroups = visibleLevels.map(level => {
    const levelWords = visibleWords.filter(word => word.levels.includes(level.id))
    return {
      id: level.id,
      name: level.name,
      categories: groupWordsByCategory(levelWords, categories, selectedCategory),
    }
  }).filter(group => group.categories.length > 0)

  const unassignedLevelWords = visibleWords.filter(word =>
    word.levels.length === 0 || (!selectedLevel && !levels.some(level => word.levels.includes(level.id))),
  )
  if (unassignedLevelWords.length > 0 && !selectedLevel) {
    const noLevelWords = unassignedLevelWords.filter(word => word.levels.length === 0)
    const otherLevelWords = unassignedLevelWords.filter(word => word.levels.length > 0)
    const categoriesWithoutLevel = groupWordsByCategory(noLevelWords, categories, selectedCategory)
    if (otherLevelWords.length > 0) {
      categoriesWithoutLevel.push(...groupWordsByCategory(otherLevelWords, categories, selectedCategory))
    }
    if (categoriesWithoutLevel.length > 0) {
      if (noLevelWords.length > 0) {
        wordGroups.push({ id: 0, name: 'All Levels • అన్ని స్థాయిలు', categories: groupWordsByCategory(noLevelWords, categories, selectedCategory) })
      }
      if (otherLevelWords.length > 0) {
        wordGroups.push({ id: -1, name: 'Other levels', categories: groupWordsByCategory(otherLevelWords, categories, selectedCategory) })
      }
    }
  }

  return (
    <div className="page-shell">
      <Header />
      <main className="dash-shell vocabulary-page">
        {/* Top Header Banner */}
        <header className="dash-header compact vocabulary-hero-header">
          <div>
            <p className="brand light">🌱 Word Garden • పదాల తోట</p>
            <h1>Telugu Vocabulary for UK Learners • తెలుగు పదాలు</h1>
            <p>
              Listen to authentic Telugu sounds, discover bilingual word cards, and build your Telugu vocabulary with fun interactive activities!
            </p>
          </div>

          <div className="vocabulary-quick-stats">
            <div className="quick-stat-item">
              <span className="quick-stat-num">{words.length}</span>
              <span className="quick-stat-label">Telugu Words</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-num">{categories.length}</span>
              <span className="quick-stat-label">Bilingual Categories</span>
            </div>
          </div>
        </header>

        {/* Mode Switcher Tabs */}
        <div className="vocabulary-mode-tabs-container">
          <nav className="vocabulary-mode-tabs" aria-label="Vocabulary modes">
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === 'cards' ? 'active' : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              <span className="tab-icon">🌱</span>
              <span>Word Cards • పదాల కార్డులు</span>
              <span className="tab-count-pill">{visibleWords.length}</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === 'sound-quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('sound-quiz')}
            >
              <span className="tab-icon">🎧</span>
              <span>Listen &amp; Identify • విని గుర్తించండి</span>
              <span className="tab-badge-new">Play</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === 'listen-spell' ? 'active' : ''}`}
              onClick={() => setActiveTab('listen-spell')}
            >
              <span className="tab-icon">🧩</span>
              <span>Listen &amp; Spell • విని రాయండి</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === 'matching' ? 'active' : ''}`}
              onClick={() => setActiveTab('matching')}
            >
              <span className="tab-icon">🔗</span>
              <span>Match Words • జతపరచండి</span>
              <span className="tab-badge-new">New</span>
            </button>
          </nav>
        </div>

        {/* Tab 1: Word Cards Explorer */}
        {activeTab === 'cards' && (
          <section className="dash-panel vocabulary-content-panel">
            {/* Quick Activity Promo Banner */}
            <div className="activity-promo-card">
              <div className="promo-text">
                <span className="promo-icon">🎧</span>
                <div>
                  <strong>Ready to test your Telugu listening ears?</strong>
                  <p>Hear mystery Telugu sounds and match them with colourful picture cards!</p>
                </div>
              </div>
              <button
                type="button"
                className="home-btn"
                onClick={() => setActiveTab('sound-quiz')}
              >
                Start Listening Game ➔
              </button>
            </div>

            <div className="vocabulary-toolbar">
              <label className="sr-only" htmlFor="word-search">
                Find a Telugu word or English meaning
              </label>
              <input
                id="word-search"
                className="data-table-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && loadWords()}
                placeholder="Search Telugu, English, or Transliteration (e.g. పిల్లి, cat, pilli)…"
              />
              <button type="button" className="home-btn" onClick={loadWords}>
                Search
              </button>
              <label className="vocabulary-filter">
                Level
                <select
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value)}
                >
                  <option value="">All levels • అన్ని స్థాయిలు</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="vocabulary-filter">
                Category
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="">All categories • అన్ని విభాగాలు ({categories.length})</option>
                  {categories.map((category) => {
                    const bilingual = formatBilingualCategory(category.name)
                    return (
                      <option key={category.id} value={category.id}>
                        {bilingual.combined}
                      </option>
                    )
                  })}
                </select>
              </label>
            </div>

            {error && <p className="error">{error}</p>}
            {filterError && <p className="error">{filterError}</p>}

            {wordGroups.length === 0 ? (
              <p className="vocabulary-empty">No Telugu words match these filters.</p>
            ) : (
              <div className="vocabulary-groups">
                {wordGroups.map((level) => (
                  <section className="vocabulary-level" key={level.id}>
                    <h2 className="vocabulary-level-title">
                      <span>🏷️</span> {level.name}
                    </h2>
                    {level.categories.map((category) => {
                      const bilingual = formatBilingualCategory(category.name)
                      return (
                        <section className="vocabulary-category" key={category.id}>
                          <div className="vocabulary-category-header">
                            <div className="vocabulary-category-titles">
                              <h3 className="vocabulary-category-title telugu-script">
                                {bilingual.telugu}
                              </h3>
                              {bilingual.english && bilingual.english !== bilingual.telugu && (
                                <span className="vocabulary-category-english">
                                  ({bilingual.english})
                                </span>
                              )}
                            </div>
                            <span className="vocabulary-category-count">
                              {category.words.length} word{category.words.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="word-cards-grid">
                            {category.words.map((word) => (
                              <WordCard
                                key={word.id}
                                word={word}
                                categoryName={bilingual.combined}
                              />
                            ))}
                          </div>
                        </section>
                      )
                    })}
                  </section>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Sound Quiz Activity */}
        {activeTab === 'sound-quiz' && (
          <section className="dash-panel vocabulary-content-panel">
            <SoundQuizActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab('cards')}
            />
          </section>
        )}

        {/* Tab 3: Listen & Spell Activity */}
        {activeTab === 'listen-spell' && (
          <section className="dash-panel vocabulary-content-panel">
            <ListenSpellActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab('cards')}
            />
          </section>
        )}

        {/* Tab 4: Match Words Activity */}
        {activeTab === 'matching' && (
          <section className="dash-panel vocabulary-content-panel">
            <MatchWordsActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab('cards')}
            />
          </section>
        )}
      </main>
    </div>
  )
}
