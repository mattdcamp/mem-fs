import { sum } from "../../src/main";

describe('sum2', () => {
    it('should sum2 numbers', () => {
        const actual = sum(1, 1);
        expect(actual).toBe(2);
    })
});