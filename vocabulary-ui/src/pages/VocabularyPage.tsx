import { useEffect, useState } from "react";
import Header from "../components/Header";
import WordCard from "../components/WordCard";
import SoundQuizActivity from "../components/SoundQuizActivity";
import ListenSpellActivity from "../components/ListenSpellActivity";
import MatchWordsActivity from "../components/MatchWordsActivity";
import { formatBilingualCategory } from "../utils/wordVisuals";
import {
  listLearningLevels,
  listVocabularyCategories,
  listVocabularyWords,
  type LearningLevel,
  type VocabularyCategory,
  type VocabularyWord,
} from "../api/vocabulary";

type ActiveTab = "cards" | "sound-quiz" | "listen-spell" | "matching";

function groupWordsByCategory(
  words: VocabularyWord[],
  categories: VocabularyCategory[],
  selectedCategoryIds: Set<number>,
) {
  const groups = categories
    .filter(
      (category) =>
        selectedCategoryIds.size === 0 || selectedCategoryIds.has(category.id),
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
      words: words.filter((word) => word.categories.includes(category.id)),
    }))
    .filter((group) => group.words.length > 0);

  if (selectedCategoryIds.size === 0) {
    const knownCategoryIds = new Set(categories.map((category) => category.id));
    const uncategorizedWords = words.filter(
      (word) => word.categories.length === 0,
    );
    const otherCategoryWords = words.filter((word) =>
      word.categories.some((categoryId) => !knownCategoryIds.has(categoryId)),
    );
    if (uncategorizedWords.length > 0) {
      groups.push({
        id: 0,
        name: "ఇతర పదాలు (Other Words)",
        words: uncategorizedWords,
      });
    }
    if (otherCategoryWords.length > 0) {
      groups.push({
        id: -1,
        name: "మరిన్ని విభాగాలు (More Categories)",
        words: otherCategoryWords,
      });
    }
  }

  return groups;
}

function categoryAndDescendantIds(
  categories: VocabularyCategory[],
  categoryId: number,
): Set<number> {
  const ids = new Set<number>([categoryId]);
  let foundChild = true;
  while (foundChild) {
    foundChild = false;
    for (const category of categories) {
      if (
        category.parent !== null &&
        ids.has(category.parent) &&
        !ids.has(category.id)
      ) {
        ids.add(category.id);
        foundChild = true;
      }
    }
  }
  return ids;
}

function CategoryTree({
  categories,
  words,
  selectedCategoryIds,
  onChange,
}: {
  categories: VocabularyCategory[];
  words: VocabularyWord[];
  selectedCategoryIds: Set<number>;
  onChange: (ids: Set<number>) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () =>
      new Set(
        categories
          .filter((category) => category.parent === null)
          .map((category) => category.id),
      ),
  );
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedIds((current) =>
        current.size > 0
          ? current
          : new Set(
              categories
                .filter((category) => category.parent === null)
                .map((category) => category.id),
            ),
      );
    }
  }, [categories]);
  const childrenFor = (parentId: number | null) =>
    categories
      .filter((category) => category.parent === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

  const descendantIdsFor = (categoryId: number) =>
    categoryAndDescendantIds(categories, categoryId);
  const wordCountFor = (categoryId: number) => {
    const ids = descendantIdsFor(categoryId);
    return words.filter((word) => word.categories.some((id) => ids.has(id)))
      .length;
  };
  const toggleCategory = (categoryId: number, checked: boolean) => {
    const next = new Set(selectedCategoryIds);
    for (const id of descendantIdsFor(categoryId)) {
      if (checked) next.add(id);
      else next.delete(id);
    }
    onChange(next);
  };
  const toggleExpanded = (categoryId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const renderNode = (category: VocabularyCategory) => {
    const children = childrenFor(category.id);
    const bilingual = formatBilingualCategory(category.name);
    const descendantIds = descendantIdsFor(category.id);
    const selectedDescendantCount = [...descendantIds].filter((id) =>
      selectedCategoryIds.has(id),
    ).length;
    const checked = selectedDescendantCount === descendantIds.size;
    const partiallyChecked = selectedDescendantCount > 0 && !checked;
    return (
      <li key={category.id}>
        <div className="category-tree-node">
          {children.length > 0 ? (
            <button
              type="button"
              className="category-tree-toggle"
              onClick={() => toggleExpanded(category.id)}
              aria-expanded={expandedIds.has(category.id)}
              aria-label={`${expandedIds.has(category.id) ? "Collapse" : "Expand"} ${bilingual.combined}`}
            >
              {expandedIds.has(category.id) ? "▾" : "▸"}
            </button>
          ) : (
            <span className="category-tree-toggle-spacer" />
          )}
          <label className="category-tree-label">
            <input
              type="checkbox"
              checked={checked}
              ref={(input) => {
                if (input) input.indeterminate = partiallyChecked;
              }}
              onChange={(event) =>
                toggleCategory(category.id, event.target.checked)
              }
            />
            <span>{bilingual.combined}</span>
            <small>{wordCountFor(category.id)}</small>
          </label>
        </div>
        {children.length > 0 && expandedIds.has(category.id) && (
          <ul>{children.map(renderNode)}</ul>
        )}
      </li>
    );
  };

  return (
    <section
      className="category-tree"
      aria-label="Browse vocabulary by category"
    >
      <div className="category-tree-heading">
        <strong>Browse vocabulary by category</strong>
        <button
          type="button"
          className="category-tree-clear"
          onClick={() => onChange(new Set())}
        >
          Clear selection
        </button>
      </div>
      <div className="category-tree-actions">
        <span>
          {selectedCategoryIds.size === 0
            ? "All categories selected"
            : `${selectedCategoryIds.size} categories selected`}
        </span>
      </div>
      <ul>{childrenFor(null).map(renderNode)}</ul>
    </section>
  );
}

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cards");
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [levels, setLevels] = useState<LearningLevel[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedLevel, setSelectedLevel] = useState("");
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const loadWords = async () => {
    try {
      setWords(await listVocabularyWords(query));
      setError("");
    } catch {
      setError("Could not load vocabulary right now.");
    }
  };

  useEffect(() => {
    loadWords();
    Promise.all([listVocabularyCategories(), listLearningLevels()])
      .then(([categoryResults, levelResults]) => {
        setCategories(categoryResults);
        setLevels(levelResults);
      })
      .catch(() =>
        setFilterError(
          "Could not load vocabulary levels and categories right now.",
        ),
      );
  }, []);

  const visibleWords = words.filter(
    (word) =>
      (!selectedLevel || word.levels.includes(Number(selectedLevel))) &&
      (selectedCategoryIds.size === 0 ||
        word.categories.some((categoryId) =>
          selectedCategoryIds.has(categoryId),
        )),
  );
  const visibleLevels = selectedLevel
    ? levels.filter((level) => level.id === Number(selectedLevel))
    : levels;
  const wordGroups = visibleLevels
    .map((level) => {
      const levelWords = visibleWords.filter((word) =>
        word.levels.includes(level.id),
      );
      return {
        id: level.id,
        name: level.name,
        categories: groupWordsByCategory(
          levelWords,
          categories,
          selectedCategoryIds,
        ),
      };
    })
    .filter((group) => group.categories.length > 0);

  const unassignedLevelWords = visibleWords.filter(
    (word) =>
      word.levels.length === 0 ||
      (!selectedLevel &&
        !levels.some((level) => word.levels.includes(level.id))),
  );
  if (unassignedLevelWords.length > 0 && !selectedLevel) {
    const noLevelWords = unassignedLevelWords.filter(
      (word) => word.levels.length === 0,
    );
    const otherLevelWords = unassignedLevelWords.filter(
      (word) => word.levels.length > 0,
    );
    const categoriesWithoutLevel = groupWordsByCategory(
      noLevelWords,
      categories,
      selectedCategoryIds,
    );
    if (otherLevelWords.length > 0) {
      categoriesWithoutLevel.push(
        ...groupWordsByCategory(
          otherLevelWords,
          categories,
          selectedCategoryIds,
        ),
      );
    }
    if (categoriesWithoutLevel.length > 0) {
      if (noLevelWords.length > 0) {
        wordGroups.push({
          id: 0,
          name: "All Levels • అన్ని స్థాయిలు",
          categories: groupWordsByCategory(
            noLevelWords,
            categories,
            selectedCategoryIds,
          ),
        });
      }
      if (otherLevelWords.length > 0) {
        wordGroups.push({
          id: -1,
          name: "Other levels",
          categories: groupWordsByCategory(
            otherLevelWords,
            categories,
            selectedCategoryIds,
          ),
        });
      }
    }
  }

  return (
    <div className="page-shell vocabulary-shell">
      <Header />
      <main className="dash-shell vocabulary-page">
        {/* Top Header Banner */}
        <header className="dash-header compact vocabulary-hero-header">
          <div>
            <p className="brand light">🌱 Word Garden • పదాల తోట</p>
            <h1>Telugu Vocabulary for Children • తెలుగు పదాలు</h1>
            <p>
              Listen to authentic Telugu sounds, discover bilingual word cards,
              and build your Telugu vocabulary with fun interactive activities!
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
              className={`vocabulary-mode-tab ${activeTab === "cards" ? "active" : ""}`}
              onClick={() => setActiveTab("cards")}
            >
              <span className="tab-icon">🌱</span>
              <span>Word Cards • పదాల కార్డులు</span>
              <span className="tab-count-pill">{visibleWords.length}</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === "sound-quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("sound-quiz")}
            >
              <span className="tab-icon">🎧</span>
              <span>Listen &amp; Identify • విని గుర్తించండి</span>
              <span className="tab-badge-new">Play</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === "listen-spell" ? "active" : ""}`}
              onClick={() => setActiveTab("listen-spell")}
            >
              <span className="tab-icon">🧩</span>
              <span>Listen &amp; Spell • విని రాయండి</span>
            </button>
            <button
              type="button"
              className={`vocabulary-mode-tab ${activeTab === "matching" ? "active" : ""}`}
              onClick={() => setActiveTab("matching")}
            >
              <span className="tab-icon">🔗</span>
              <span>Match Words • జతపరచండి</span>
              <span className="tab-badge-new">New</span>
            </button>
          </nav>
        </div>

        {/* Tab 1: Word Cards Explorer */}
        {activeTab === "cards" && (
          <section className="dash-panel vocabulary-content-panel">
            {/* Quick Activity Promo Banner */}
            <div className="activity-promo-card">
              <div className="promo-text">
                <span className="promo-icon">🎧</span>
                <div>
                  <strong>Ready to test your Telugu listening ears?</strong>
                  <p>
                    Hear mystery Telugu sounds and match them with colourful
                    picture cards!
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="home-btn"
                onClick={() => setActiveTab("sound-quiz")}
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
                onKeyDown={(event) => event.key === "Enter" && loadWords()}
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
            </div>

            <CategoryTree
              categories={categories}
              words={words}
              selectedCategoryIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
            />

            {error && <p className="error">{error}</p>}
            {filterError && <p className="error">{filterError}</p>}

            {wordGroups.length === 0 ? (
              <p className="vocabulary-empty">
                No Telugu words match these filters.
              </p>
            ) : (
              <div className="vocabulary-groups">
                {wordGroups.map((level) => (
                  <section className="vocabulary-level" key={level.id}>
                    <h2 className="vocabulary-level-title">
                      <span>🏷️</span> {level.name}
                    </h2>
                    {level.categories.map((category) => {
                      const bilingual = formatBilingualCategory(category.name);
                      return (
                        <section
                          className="vocabulary-category"
                          key={category.id}
                        >
                          <div className="vocabulary-category-header">
                            <div className="vocabulary-category-titles">
                              <h3 className="vocabulary-category-title telugu-script">
                                {bilingual.telugu}
                              </h3>
                              {bilingual.english &&
                                bilingual.english !== bilingual.telugu && (
                                  <span className="vocabulary-category-english">
                                    ({bilingual.english})
                                  </span>
                                )}
                            </div>
                            <span className="vocabulary-category-count">
                              {category.words.length} word
                              {category.words.length === 1 ? "" : "s"}
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
                      );
                    })}
                  </section>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Sound Quiz Activity */}
        {activeTab === "sound-quiz" && (
          <section className="dash-panel vocabulary-content-panel">
            <SoundQuizActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab("cards")}
            />
          </section>
        )}

        {/* Tab 3: Listen & Spell Activity */}
        {activeTab === "listen-spell" && (
          <section className="dash-panel vocabulary-content-panel">
            <ListenSpellActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab("cards")}
            />
          </section>
        )}

        {/* Tab 4: Match Words Activity */}
        {activeTab === "matching" && (
          <section className="dash-panel vocabulary-content-panel">
            <MatchWordsActivity
              words={words}
              categories={categories}
              onBackToCards={() => setActiveTab("cards")}
            />
          </section>
        )}
      </main>
    </div>
  );
}
