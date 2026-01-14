export function parseTokenFromQrText(text) {
  try {
    const url = new URL(text); // scanned QR is a URL
    const type = url.searchParams.get("type");   // user | trainer
    const token = url.searchParams.get("token"); // token
    if (!token) return null;
    return { token, type };
  } catch {
    return null;
  }
}
