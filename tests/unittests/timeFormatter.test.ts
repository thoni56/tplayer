import { formatTime } from "../../src/models/timeFormatter";

describe('TimeFormatter', () => {
    it('should format 0 as 0:00', () => {
        expect(formatTime(0)).toBe("0:00")
    }),
        it('should format 60 as 1:00', () => {
            expect(formatTime(60)).toBe("1:00")
        }),
        it('should format 30 as 0:30', () => {
            expect(formatTime(30)).toBe("0:30")
        }),
        it('should format 3601 as 1:00:01', () => {
            expect(formatTime(3601)).toBe("1:00:01")
        })
})