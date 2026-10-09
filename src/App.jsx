import { useEffect, useState } from "react";
import BookmarkOrganizer from "./components/bookmarkOrganizer/index.jsx";
import BackToTop from "./components/backToTop/index.jsx";
import SiteFooter from "./components/siteFooter/index.jsx";
import SiteHeader from "./components/siteHeader/index.jsx";
import styles from "./App.module.css";

const App = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const updateVisibility = () => setShowBackToTop(window.scrollY > 50);
        window.addEventListener("scroll", updateVisibility, { passive: true });
        updateVisibility();
        return () => window.removeEventListener("scroll", updateVisibility);
    }, []);

    return (
        <div className={styles.appShell} id="top">
            <SiteHeader title="Bookmark Library" mark="B" repoUrl="https://github.com/a2rp/bookmark-organizer" navItems={[["Library", "#library"], ["Collections", "#collections"]]} />
            <main className={styles.pageContent}><BookmarkOrganizer /></main>
            <SiteFooter repoUrl="https://github.com/a2rp/bookmark-organizer" />
            <BackToTop visible={showBackToTop} />
        </div>
    );
};

export default App;
