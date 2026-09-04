const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const indexOfNote = (note: string) => {
  const s = SHARPS.indexOf(note);
  if (s >= 0) return s;
  return FLATS.indexOf(note);
};

export function transposeNote(note: string, semitones: number, useFlats: boolean) {
  const i = indexOfNote(note);
  if (i < 0) return note;
  const next = (((i + semitones) % 12) + 12) % 12;
  return (useFlats ? FLATS : SHARPS)[next];
}

const CHORD_RE = /\b([A-G](?:#|b)?)((?:maj|min|m|sus|dim|aug|add|º|°)?\d*(?:\/[A-G](?:#|b)?)?[^\s]*)/g;

export function transposeChordLine(line: string, semitones: number, useFlats: boolean) {
  return line.replace(CHORD_RE, (match, root: string, rest: string) => {
    const newRoot = transposeNote(root, semitones, useFlats);
    const newRest = rest.replace(/\/([A-G](?:#|b)?)/, (_m, bass: string) =>
      "/" + transposeNote(bass, semitones, useFlats),
    );
    const out = newRoot + newRest;
    // mantém o alinhamento aproximado com a letra
    const diff = match.length - out.length;
    return diff > 0 ? out + " ".repeat(diff) : out;
  });
}
