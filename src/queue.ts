export default class Queue<T> {
  public elements: T[];
  public name: string;

  constructor(name: string, initialState?: T[]) {
    this.elements = initialState || [];
    this.name = name;
  }

  public async asyncRun(callback: (val: T) => Promise<void>) {
    for (const element of this.elements) {
      await callback(element);
    }
    this.elements = [];
  }

  public async asyncRunAll(callback: (val: T) => Promise<void>) {
    await Promise.all(this.elements.map((el) => callback(el)));
    this.elements = [];
  }

  public add(newEntry: T) {
    this.elements.push(newEntry);
  }

  public length() {
    return this.elements.length;
  }
}
