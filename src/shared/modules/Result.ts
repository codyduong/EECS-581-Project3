export default abstract class Result<T, E> {
  protected value: T | E;
  public constructor(value: T | E) {
    this.value = value;
  }
  public abstract unwrap(): T;
}
