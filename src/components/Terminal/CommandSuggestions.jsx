export default function CommandSuggestions({commands, onSelect}) {
    if (!commands.length) {
        return null;
    }

    return (
        <div className="Terminal-suggestions" id="Terminal-command-suggestions">
            {commands.map(({name}) => (
                <button
                    key={name}
                    type="button"
                    onClick={() => onSelect(name)}
                >
                    {name}
                </button>
            ))}
        </div>
    );
}
