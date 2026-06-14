// Lyriks logo — three stacked bars + "Lyriks.io" wordmark.
// Composed in markup (never an image), per brand rules. `onDark` flips the
// wordmark to white; bars always keep their brand colors.

export default function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className={`lk-logo${onDark ? ' on-dark' : ''}`}>
      <span className="lk-mark">
        <i />
        <i />
        <i />
      </span>
      <span className="lk-word">
        Lyriks<span className="dot">.io</span>
      </span>
    </span>
  )
}
