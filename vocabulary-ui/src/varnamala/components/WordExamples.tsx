import { useEffect, useState } from 'react'
import type { TeluguWordExample } from '../data/teluguWordExamples'

type WordExamplesProps = {
  words: TeluguWordExample[]
}

export function WordExamples({ words }: WordExamplesProps) {
  const pageSize = 4
  const [startIndex, setStartIndex] = useState(0)
  const visibleWords = words.slice(startIndex, startIndex + pageSize)
  const canGoBack = startIndex > 0
  const canGoForward = startIndex + pageSize < words.length

  useEffect(() => {
    setStartIndex(0)
  }, [words])

  return (
    <section className="word-examples" aria-labelledby="word-examples-title">
      <div className="word-examples-heading">
        <div>
          <p className="eyebrow">Look and remember</p>
          <h2 id="word-examples-title">Words that start with {words[0]?.title.charAt(0)}</h2>
        </div>
        <span className="word-examples-script">అ · a</span>
      </div>
      {words.length > pageSize && (
        <div className="word-examples-controls" aria-label="Word examples navigation">
          <span>{startIndex + 1}–{Math.min(startIndex + pageSize, words.length)} of {words.length}</span>
          <div>
            <button
              className="word-examples-arrow"
              type="button"
              onClick={() => setStartIndex(Math.max(0, startIndex - pageSize))}
              disabled={!canGoBack}
              aria-label="Show previous words"
            >
              ←
            </button>
            <button
              className="word-examples-arrow"
              type="button"
              onClick={() => setStartIndex(Math.min(words.length - pageSize, startIndex + pageSize))}
              disabled={!canGoForward}
              aria-label="Show more words"
            >
              →
            </button>
          </div>
        </div>
      )}
      <div className="word-example-grid">
        {visibleWords.map((word) => (
          <article className="word-example-card" key={word.title}>
            <div className="word-example-image" role="img" aria-label={word.imageLabel}>
              <span aria-hidden="true">{word.emoji}</span>
            </div>
            <h3>{word.title}</h3>
            <p>{word.meaning}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
