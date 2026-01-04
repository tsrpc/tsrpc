import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PackageB, PackageB2 } from '../src/index';

describe('PackageB', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageB).toBe('function');
    });

    it('should call console.log with "PackageB"', () => {
        PackageB();
        expect(consoleSpy).toHaveBeenCalledWith('PackageB');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

describe('PackageB2', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageB2).toBe('function');
    });

    it('should call console.log with "PackageB2"', () => {
        PackageB2();
        expect(consoleSpy).toHaveBeenCalledWith('PackageB2');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

