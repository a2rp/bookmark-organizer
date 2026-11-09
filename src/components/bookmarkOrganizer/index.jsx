import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiBookmark,
    FiCheck,
    FiCopy,
    FiDownload,
    FiExternalLink,
    FiHeart,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import styles from "./styles.module.css";

const seed = [
    { id: "a", title: "The Shape of Color", url: "https://www.are.na", group: "Design", note: "A living library for visual research", favorite: true },
    { id: "b", title: "A List Apart", url: "https://alistapart.com", group: "Read later", note: "Thoughtful writing about web design", favorite: false },
    { id: "c", title: "Good Morning", url: "https://www.goodmorningshop.com", group: "Inspiration", note: "Objects made for everyday rituals", favorite: true },
    { id: "d", title: "Taste Journal", url: "https://www.seriouseats.com", group: "Recipes", note: "Reliable recipes and cooking guides", favorite: false },
    { id: "e", title: "The Creative Independent", url: "https://thecreativeindependent.com", group: "Read later", note: "Conversations about creative practice", favorite: false },
    { id: "f", title: "Type Foundry Index", url: "https://www.fontshare.com", group: "Design", note: "A small shelf of type to explore", favorite: false },
];
const groups = ["Design", "Read later", "Inspiration", "Recipes"];
const storageKey = "bookmark-organizer-v1";

function isBookmark(item) {
    if (!item || typeof item !== "object") return false;
    if (["id", "title", "url", "group", "note"].some((key) => typeof item[key] !== "string")) return false;
    if (typeof item.favorite !== "boolean") return false;

    try {
        const url = new URL(item.url);
        return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
    } catch {
        return false;
    }
}

function loadItems() {
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === null) return seed;
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter(isBookmark) : seed;
    } catch {
        return seed;
    }
}

function hostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return "new link";
    }
}

function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `bookmark-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const BookmarkOrganizer = () => {
    const [items, setItems] = useState(loadItems);
    const [group, setGroup] = useState("All links");
    const [query, setQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState({ title: "", url: "", group: groups[0], note: "" });
    const [removing, setRemoving] = useState(null);
    const [message, setMessage] = useState("");
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);
    const lastFocusRef = useRef(null);

    const allGroups = useMemo(
        () => [...new Set([...groups, ...items.map((item) => item.group)])],
        [items],
    );
    const visible = useMemo(() => items.filter((item) => {
        const inGroup = group === "All links" || (group === "Favorites" ? item.favorite : item.group === group);
        return inGroup && [item.title, item.url, item.note, item.group].join(" ").toLowerCase().includes(query.toLowerCase());
    }), [items, group, query]);
    const favoriteCount = items.filter((item) => item.favorite).length;

    const saveItems = (nextItems) => {
        setItems(nextItems);
        try {
            localStorage.setItem(storageKey, JSON.stringify(nextItems));
            return true;
        } catch {
            return false;
        }
    };

    const closeRemoveDialog = useCallback(() => {
        setRemoving(null);
        requestAnimationFrame(() => {
            if (lastFocusRef.current?.isConnected) lastFocusRef.current.focus();
            else document.getElementById("library-heading")?.focus();
        });
    }, []);

    useEffect(() => {
        if (!removing) return undefined;
        cancelRef.current?.focus();
        const onKey = (event) => {
            if (event.key === "Escape") {
                closeRemoveDialog();
                return;
            }
            if (event.key !== "Tab") return;

            const focusable = [...(dialogRef.current?.querySelectorAll("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? [])];
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [removing, closeRemoveDialog]);

    const addItem = (event) => {
        event.preventDefault();
        let url = form.url.trim();
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        try {
            const parsed = new URL(url);
            if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) throw new Error("Invalid protocol");
            url = parsed.href;
        } catch {
            setMessage("Enter a valid HTTP or HTTPS web address.");
            return;
        }

        const nextItems = [{
            ...form,
            title: form.title.trim() || hostname(url),
            url,
            id: createId(),
            favorite: false,
        }, ...items];
        const saved = saveItems(nextItems);
        setForm({ title: "", url: "", group: groups[0], note: "" });
        setFormOpen(false);
        setMessage(saved
            ? "Bookmark saved to this browser."
            : "Bookmark added for this session only; browser storage is unavailable.");
    };

    const exportItems = () => {
        const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "bookmark-library.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };

    const copyUrl = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            setMessage("Link copied.");
        } catch {
            setMessage("Clipboard access is unavailable.");
        }
    };

    const toggleFavorite = (item) => {
        const nextItems = items.map((saved) => saved.id === item.id ? { ...saved, favorite: !saved.favorite } : saved);
        const saved = saveItems(nextItems);
        setMessage(saved ? "" : "Change saved for this session only; browser storage is unavailable.");
    };

    const removeItem = () => {
        if (!removing) return;
        const nextItems = items.filter((item) => item.id !== removing.id);
        const saved = saveItems(nextItems);
        setRemoving(null);
        setMessage(saved
            ? "Bookmark removed."
            : "Bookmark removed for this session only; browser storage is unavailable.");
        requestAnimationFrame(() => {
            if (lastFocusRef.current?.isConnected) lastFocusRef.current.focus();
            else document.getElementById("library-heading")?.focus();
        });
    };

    return <section className={styles.workspace} id="library">
        <div className={styles.heading}>
            <div>
                <p className={styles.label}>A quiet corner of the internet</p>
                <h1 id="library-heading" tabIndex={-1}>Keep the good links.</h1>
                <p className={styles.intro}>A personal shelf for pages worth finding again.</p>
            </div>
            <button className={styles.primary} type="button" onClick={() => setFormOpen(!formOpen)}>
                <FiPlus />{formOpen ? "Close form" : "Add bookmark"}
            </button>
        </div>

        <div className={styles.stats} id="collections">
            <div><span>Saved links</span><strong>{items.length.toString().padStart(2, "0")}</strong></div>
            <div><span>Collections</span><strong>{allGroups.length.toString().padStart(2, "0")}</strong></div>
            <div><span>Favorites</span><strong>{favoriteCount.toString().padStart(2, "0")}</strong></div>
            <button type="button" onClick={exportItems}><FiDownload /> Export library</button>
        </div>

        {formOpen && <form className={styles.form} onSubmit={addItem}>
            <div className={styles.formTitle}>
                <strong>Save a new link</strong>
                <button type="button" onClick={() => setFormOpen(false)} aria-label="Close form"><FiX /></button>
            </div>
            <div className={styles.fields}>
                <label>Page title<input maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A name you will remember" /></label>
                <label>Web address<input required type="text" inputMode="url" maxLength={2048} value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="example.com/article" /></label>
                <label>Collection<select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}>{allGroups.map((name) => <option key={name}>{name}</option>)}</select></label>
                <label>Note<input maxLength={300} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Why save it?" /></label>
            </div>
            <button className={styles.primary} type="submit"><FiCheck /> Save bookmark</button>
        </form>}

        <div className={styles.layout}>
            <aside className={styles.sidebar} aria-label="Bookmark collections">
                <p>Browse <span>{items.length}</span></p>
                {["All links", "Favorites", ...allGroups].map((name) => <button className={group === name ? styles.selected : ""} type="button" aria-pressed={group === name} key={name} onClick={() => setGroup(name)}>
                    <span><FiBookmark />{name}</span>
                    <small>{name === "All links" ? items.length : name === "Favorites" ? favoriteCount : items.filter((item) => item.group === name).length}</small>
                </button>)}
                <div className={styles.local}><i />Saved in this browser</div>
            </aside>

            <div className={styles.collection}>
                <div className={styles.toolbar}>
                    <div><p className={styles.label}>Your collection</p><h2>{group}</h2></div>
                    <label className={styles.search}><FiSearch /><span className={styles.srOnly}>Search bookmarks</span><input placeholder="Search links" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
                </div>
                {message && <p className={styles.message} role="status">{message}<button type="button" onClick={() => setMessage("")} aria-label="Dismiss"><FiX /></button></p>}
                {visible.length ? <div className={styles.grid}>{visible.map((item, index) => <article className={styles.card} key={item.id}>
                    <div className={[styles.art, styles[`art${index % 4}`]].join(" ")}>
                        <span>{hostname(item.url).slice(0, 1).toUpperCase()}</span>
                        <button type="button" onClick={() => toggleFavorite(item)} aria-label={(item.favorite ? "Remove " : "Add ") + item.title + " from favorites"}><FiHeart fill={item.favorite ? "currentColor" : "none"} /></button>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.meta}><span>{item.group}</span><small>{hostname(item.url)}</small></div>
                        <h3>{item.title}</h3>
                        <p>{item.note || "Saved for another time."}</p>
                        <div className={styles.actions}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">Open link <FiExternalLink /></a>
                            <button type="button" onClick={() => copyUrl(item.url)} aria-label={`Copy ${item.title} address`}><FiCopy /></button>
                            <button type="button" onClick={(event) => { lastFocusRef.current = event.currentTarget; setRemoving(item); }} aria-label={`Delete ${item.title}`}><FiTrash2 /></button>
                        </div>
                    </div>
                </article>)}</div> : <div className={styles.empty}><FiBookmark /><h3>No links found</h3><p>Try another search or add a page to this collection.</p></div>}
            </div>
        </div>

        {removing && <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) closeRemoveDialog(); }}>
            <section className={styles.dialog} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="remove-heading" aria-describedby="remove-description">
                <span><FiTrash2 /></span>
                <h2 id="remove-heading">Remove this bookmark?</h2>
                <p id="remove-description"><strong>{removing.title}</strong> will be removed from this browser's library.</p>
                <div>
                    <button type="button" ref={cancelRef} onClick={closeRemoveDialog}>Keep bookmark</button>
                    <button type="button" onClick={removeItem}>Remove link</button>
                </div>
            </section>
        </div>}
    </section>;
};

export default BookmarkOrganizer;
