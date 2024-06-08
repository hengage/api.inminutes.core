import { sum } from "./sum";


describe("sum module", () => {
  test.only("adds 1 + 2 to equal 3", () => {
    expect(sum(1, 2)).toBeNull();
  });
});
