export default function Loader() {
  return (
    <div
      className="loader"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="spinner"></div>
      <span>Transcribing audio, please wait...</span>
    </div>
  );
}
