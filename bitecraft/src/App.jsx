import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

async function apiRequest(path, signal) {
  const response = await fetch(`${API_BASE}/${path}`, { signal });
  if (!response.ok) {
    throw new Error("The recipe service could not be reached. Please try again.");
  }
  return response.json();
}

function readSavedMeals() {
  try {
    return JSON.parse(localStorage.getItem("bitecraft-saved") || "[]");
  } catch {
    return [];
  }
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 8.8 2.3Z" /></svg>;
  if (name === "arrow") return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></svg>;
  if (name === "clock") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
  return null;
}

function MealCard({ meal, saved, onOpen, onSave }) {
  return (
    <article className="meal-card">
      <button className="meal-image-button" onClick={() => onOpen(meal)} aria-label={`View ${meal.strMeal} recipe`}>
        <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" />
        <span className="image-overlay">View recipe <Icon name="arrow" size={15} /></span>
      </button>
      <button
        className={`save-button ${saved ? "is-saved" : ""}`}
        onClick={() => onSave(meal)}
        aria-label={saved ? `Remove ${meal.strMeal} from saved recipes` : `Save ${meal.strMeal}`}
        title={saved ? "Remove from saved" : "Save recipe"}
      >
        <Icon name="heart" size={18} />
      </button>
      <div className="meal-info">
        <span className="meal-kicker">THE DAILY TABLE</span>
        <h3>{meal.strMeal}</h3>
        <button className="text-link" onClick={() => onOpen(meal)}>Explore recipe <Icon name="arrow" size={15} /></button>
      </div>
    </article>
  );
}

function RecipeModal({ meal, onClose, onSave, saved }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    apiRequest(`lookup.php?i=${encodeURIComponent(meal.idMeal)}`, controller.signal)
      .then((data) => {
        if (!data.meals?.[0]) throw new Error("Recipe details are not available right now.");
        setDetails(data.meals[0]);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Unable to load this recipe.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [meal.idMeal]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const ingredients = useMemo(() => {
    if (!details) return [];
    return Array.from({ length: 20 }, (_, index) => {
      const ingredient = details[`strIngredient${index + 1}`]?.trim();
      const measure = details[`strMeasure${index + 1}`]?.trim();
      return ingredient ? { ingredient, measure } : null;
    }).filter(Boolean);
  }, [details]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title">
        <button className="modal-close" onClick={onClose} aria-label="Close recipe"><Icon name="close" /></button>
        <div className="modal-image">
          <img src={meal.strMealThumb} alt={meal.strMeal} />
          <span className="modal-image-label">BITECRAFT RECIPE</span>
        </div>
        <div className="modal-content">
          <div className="modal-heading">
            <div>
              <span className="eyebrow">A GOOD THING TO MAKE</span>
              <h2 id="recipe-title">{meal.strMeal}</h2>
              {details && <div className="recipe-meta">
                {details.strArea && <span><Icon name="globe" size={14} /> {details.strArea}</span>}
                {details.strCategory && <span>{details.strCategory}</span>}
              </div>}
            </div>
            <button className={`save-button modal-save ${saved ? "is-saved" : ""}`} onClick={() => onSave(details || meal)} aria-label="Save recipe"><Icon name="heart" /></button>
          </div>
          {loading && <div className="detail-loading"><span className="spinner" /> Gathering the ingredients…</div>}
          {error && <p className="error-message">{error}</p>}
          {details && <>
            <div className="ingredients-block">
              <h3>What you'll need <span>{ingredients.length} ingredients</span></h3>
              <div className="ingredient-list">
                {ingredients.map((item) => <div className="ingredient" key={item.ingredient}><span>{item.ingredient}</span><small>{item.measure}</small></div>)}
              </div>
            </div>
            <div className="instructions-block">
              <h3>Let's make it</h3>
              {(details.strInstructions || "").split(/\r?\n/).filter((line) => line.trim()).map((line, index) => (
                <p key={index}><span className="step-number">{String(index + 1).padStart(2, "0")}</span>{line.trim()}</p>
              ))}
            </div>
            {details.strSource && <a className="source-link" href={details.strSource} target="_blank" rel="noreferrer">Original recipe source <Icon name="arrow" size={14} /></a>}
          </>}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [meals, setMeals] = useState([]);
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState("discover");
  const [savedMeals, setSavedMeals] = useState(readSavedMeals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest("categories.php", controller.signal)
      .then((data) => {
        const nextCategories = data.categories || [];
        setCategories(nextCategories);
        const preferred = nextCategories.find((item) => item.strCategory === "Seafood") || nextCategories[0];
        if (preferred) setCategory(preferred.strCategory);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("We couldn't load recipe categories. Check your connection and try again.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!category) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      const endpoint = query.trim()
        ? `search.php?s=${encodeURIComponent(query.trim())}`
        : `filter.php?c=${encodeURIComponent(category)}`;
      apiRequest(endpoint, controller.signal)
        .then((data) => setMeals(data.meals || []))
        .catch((err) => {
          if (err.name !== "AbortError") setError(err.message || "Something went wrong while loading recipes.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, query.trim() ? 320 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, query]);

  useEffect(() => {
    localStorage.setItem("bitecraft-saved", JSON.stringify(savedMeals));
  }, [savedMeals]);

  const visibleMeals = useMemo(() => {
    if (activeView === "saved") {
      return savedMeals.filter((meal) => meal.strMeal.toLowerCase().includes(query.trim().toLowerCase()));
    }
    return meals;
  }, [activeView, meals, savedMeals, query]);

  const toggleSaved = (meal) => {
    setSavedMeals((current) => {
      const exists = current.some((item) => item.idMeal === meal.idMeal);
      return exists ? current.filter((item) => item.idMeal !== meal.idMeal) : [meal, ...current];
    });
  };

  const isSaved = (meal) => savedMeals.some((item) => item.idMeal === meal.idMeal);

  const pickRandom = async () => {
    setRandomLoading(true);
    try {
      const data = await apiRequest("random.php");
      if (data.meals?.[0]) setSelectedMeal(data.meals[0]);
    } catch {
      setError("We couldn't find a surprise recipe just now. Please try again.");
    } finally {
      setRandomLoading(false);
    }
  };

  const openMeal = (meal) => setSelectedMeal(meal);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="BiteCraft home"><span className="wordmark-mark">b.</span>bitecraft<span className="wordmark-dot">.</span></a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#about">Our approach</a>
        </nav>
        <button className="saved-nav" onClick={() => setActiveView(activeView === "saved" ? "discover" : "saved")}>
          <Icon name="heart" size={17} /> Saved <span>{savedMeals.length}</span>
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> GOOD FOOD, LESS GUESSWORK</div>
            <h1>Find your next<br /><em>favourite meal.</em></h1>
            <p>Explore recipes from around the world, find something delicious, and keep the ones you want to make again.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#discover">Explore recipes <Icon name="arrow" size={16} /></a>
              <button className="button button-light" onClick={pickRandom} disabled={randomLoading}>
                <Icon name="spark" size={16} /> {randomLoading ? "Finding a surprise…" : "Surprise me"}
              </button>
            </div>
            <div className="hero-note"><span className="online-dot" /> Powered by live recipe data</div>
          </div>
          <div className="hero-art" aria-label="Food photography collage">
            <div className="hero-photo hero-photo-main"><img src="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/large" alt="Freshly prepared meal" /></div>
            <div className="hero-photo hero-photo-small"><img src="https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg/large" alt="Colourful plated food" /></div>
            <div className="hero-sticker"><span>made with</span><strong>curiosity<br />& a little salt</strong><span className="sticker-star">✳</span></div>
            <div className="hero-art-caption">A world of flavour, one recipe at a time.</div>
          </div>
        </section>

        <section className="discover-section" id="discover">
          <div className="section-intro">
            <div><span className="eyebrow">THE RECIPE COLLECTION</span><h2>{activeView === "saved" ? "Your saved table." : "What sounds good?"}</h2><p>{activeView === "saved" ? "The recipes you want to come back to." : "Pick a category or search for a dish to get inspired."}</p></div>
            <div className="collection-count"><strong>{activeView === "saved" ? savedMeals.length : visibleMeals.length}</strong><span>{activeView === "saved" ? "SAVED RECIPES" : "RECIPES FOUND"}</span></div>
          </div>

          <div className="search-row">
            <label className="search-box"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by recipe name…" aria-label="Search recipes" /><kbd>/</kbd></label>
            {activeView === "saved" && <button className="clear-saved" onClick={() => setActiveView("discover")}>Back to discover</button>}
          </div>

          {activeView === "discover" && <div className="category-row" aria-label="Recipe categories">
            {categories.map((item) => <button key={item.idCategory} className={`category-chip ${category === item.strCategory && !query.trim() ? "active" : ""}`} onClick={() => { setQuery(""); setCategory(item.strCategory); }}>{item.strCategory}</button>)}
          </div>}

          {error && <div className="error-banner"><span>{error}</span><button onClick={() => { setError(""); setCategory((current) => current || "Seafood"); }}>Try again</button></div>}

          {loading && activeView === "discover" ? <div className="meal-grid">{Array.from({ length: 6 }, (_, index) => <div className="meal-skeleton" key={index}><div /><span /><i /></div>)}</div> :
            visibleMeals.length > 0 ? <div className="meal-grid">
              {visibleMeals.map((meal) => <MealCard key={meal.idMeal} meal={meal} saved={isSaved(meal)} onOpen={openMeal} onSave={toggleSaved} />)}
            </div> :
            <div className="empty-state"><span className="empty-icon">✳</span><h3>{activeView === "saved" ? "Your saved list is ready for a first recipe." : "No recipes found just yet."}</h3><p>{activeView === "saved" ? "Tap the heart on any recipe to keep it close." : "Try another search or choose a different category."}</p>{activeView === "saved" && <button className="button button-dark" onClick={() => setActiveView("discover")}>Browse recipes <Icon name="arrow" size={15} /></button>}</div>}
        </section>

        <section className="about-strip" id="about">
          <div className="about-number">01 <span>—</span> THE IDEA</div>
          <div><span className="eyebrow">A LITTLE INSPIRATION GOES A LONG WAY</span><h2>Good food starts<br />with a good idea.</h2></div>
          <p>BiteCraft is a small recipe discovery experience built around a simple thought: finding what to cook should feel as enjoyable as making it. Search, explore, save, and let the next meal find you.</p>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top"><span className="wordmark-mark">b.</span>bitecraft<span className="wordmark-dot">.</span></a>
        <p>Recipe data provided by <a href="https://www.themealdb.com/" target="_blank" rel="noreferrer">TheMealDB</a>.</p>
        <span>Made for curious appetites ✳</span>
      </footer>

      {selectedMeal && <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} onSave={toggleSaved} saved={isSaved(selectedMeal)} />}
    </div>
  );
}
