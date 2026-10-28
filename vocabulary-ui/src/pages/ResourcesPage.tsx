import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import {
  listResourceCategories,
  listResources,
  type LearningResource,
  type ResourceCategory,
} from '../api/vocabulary'

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<LearningResource | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listResources(), listResourceCategories()])
      .then(([resourceItems, categoryItems]) => {
        setResources(resourceItems)
        setCategories(categoryItems)
      })
      .catch(() => setError('Resources could not be loaded right now. Please try again shortly.'))
  }, [])

  const visibleResources = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    return resources.filter(resource =>
      (!selectedCategory || resource.category === selectedCategory)
      && (!search || [resource.title, resource.description, resource.author, resource.category_name]
        .join(' ').toLocaleLowerCase().includes(search)),
    )
  }, [resources, selectedCategory, query])

  const categoryCount = (categoryId: number) => resources.filter(resource => resource.category === categoryId).length

  return (
    <div className="page-shell resources-page">
      <Header />
      <main className="resources-shell">
        <section className="resources-hero">
          <p className="resources-eyebrow">📚 తెలుగు వనరులు</p>
          <h1>Learning resources for every reader</h1>
          <p>Explore story books, epics, satakams, Balamukundam textbooks, worksheets and more. Select a book to read its PDF preview here.</p>
        </section>

        <section className="resources-toolbar" aria-label="Resource filters">
          <label className="sr-only" htmlFor="resource-search">Search resources</label>
          <input id="resource-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, authors, or categories…" />
          <span>{visibleResources.length} resource{visibleResources.length === 1 ? '' : 's'}</span>
        </section>

        {categories.length > 0 && (
          <nav className="resource-category-tabs" aria-label="Resource categories">
            <button type="button" className={!selectedCategory ? 'active' : ''} onClick={() => setSelectedCategory(null)}>All resources <small>{resources.length}</small></button>
            {categories.map(category => (
              <button key={category.id} type="button" className={selectedCategory === category.id ? 'active' : ''} onClick={() => setSelectedCategory(category.id)}>
                {category.name} <small>{categoryCount(category.id)}</small>
              </button>
            ))}
          </nav>
        )}

        {error && <p className="error">{error}</p>}
        {!error && visibleResources.length === 0 && <p className="resources-empty">No resources match this selection yet.</p>}
        <section className="resource-grid" aria-live="polite">
          {visibleResources.map(resource => (
            <article className="resource-card" key={resource.id}>
              <div className="resource-card-top"><span>PDF</span><p>{resource.category_name}</p></div>
              <h2>{resource.title}</h2>
              {resource.description && <p className="resource-description">{resource.description}</p>}
              {resource.author && <p className="resource-author">By {resource.author}</p>}
              <button type="button" className="resource-preview-button" onClick={() => setPreview(resource)}>Preview PDF <span>→</span></button>
            </article>
          ))}
        </section>
      </main>

      {preview && (
        <div className="resource-preview-overlay" role="dialog" aria-modal="true" aria-labelledby="resource-preview-title">
          <section className="resource-preview-dialog">
            <header>
              <div><p>{preview.category_name}</p><h2 id="resource-preview-title">{preview.title}</h2></div>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close preview">×</button>
            </header>
            <iframe title={`${preview.title} PDF preview`} src={preview.preview_url} allow="autoplay" />
            <footer><a href={preview.preview_url} target="_blank" rel="noreferrer">Open in a new tab ↗</a></footer>
          </section>
        </div>
      )}
    </div>
  )
}
