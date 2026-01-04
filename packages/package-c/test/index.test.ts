import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PackageC, PackageC2 } from '../src/index';

describe('PackageC', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageC).toBe('function');
    });

    it('should call console.log with "PackageC"', () => {
        PackageC();
        expect(consoleSpy).toHaveBeenCalledWith('PackageC');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

describe('PackageC2', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageC2).toBe('function');
    });

    it('should call console.log with "PackageC2"', () => {
        PackageC2();
        expect(consoleSpy).toHaveBeenCalledWith('PackageC2');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

