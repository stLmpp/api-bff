export class HttpClientResponse<T> extends Response {
  override json(): Promise<T> {
    return super.json();
  }
}
