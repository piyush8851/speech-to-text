// src/components/TranscriptionResult.tsx
interface TranscriptionResultProps {
  text: string;
}

export default function TranscriptionResult({
  text,
}: TranscriptionResultProps) {
  return (
    <section className="result-container" aria-live="polite">
      <h2>Transcription Result</h2>
      <p>{text}</p>
    </section>
  );
}
