export default function TerminalShell({title, children, controls}) {
    return (
        <section className="Terminal-container" aria-label="Terminal interactiva">
            <div className="Terminal-header">
                <div className="Terminal-controls" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="Terminal-title">
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="Terminal-output" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
                {children}
            </div>
            {controls}
        </section>
    );
}
