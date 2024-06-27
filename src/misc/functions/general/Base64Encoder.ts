export default function Base64Utf8Encoder (str: string): string {
  const bytes = new TextEncoder().encode(str)
  const binaryString = Array.from(bytes, (byte) => {
    return String.fromCodePoint(byte)
  }).join('')
  return btoa(binaryString)
}
