import { useLocation } from 'react-router-dom'

// Re-mounts its content on every route change so the .page-enter animation (see index.css) plays each time.
export default function PageTransition({ children }) {
    const { pathname } = useLocation()

    return (
        <div key={pathname} className="page-enter">
            {children}
        </div>
    )
}