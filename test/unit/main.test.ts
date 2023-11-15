import { sum } from "../../src/main"

describe('sum', () => {
    it('should sum numbers', () => {
        const actual = sum(1, 1);
        expect(actual).toBe(2);
    })
})