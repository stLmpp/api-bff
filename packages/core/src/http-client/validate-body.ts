export function validate_body(body: unknown): string | null {
  if (body == null) {
    return null;
  }
  if (Buffer.isBuffer(body)) {
    return validate_body(body.toString());
  }
  if (typeof body === 'string') {
    try {
      JSON.parse(body);
      return body;
    } catch {
      return null;
    }
  }
  try {
    return JSON.stringify(body);
  } catch {
    return null;
  }
}
