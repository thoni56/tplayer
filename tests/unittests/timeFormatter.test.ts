import { formatTime } from "../../src/models/timeFormatter";

describe('TimeFormatter', () => {
    it('should format 0 as 0:00', () => {
        expect(formatTime(0)).toBe("0:00")
    })
})