import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PackageA, PackageA2 } from '../src/index';

describe('PackageA', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageA).toBe('function');
    });

    it('should call console.log with "PackageA"', () => {
        PackageA();
        expect(consoleSpy).toHaveBeenCalledWith('PackageA');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

describe('PackageA2', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof PackageA2).toBe('function');
    });

    it('should call console.log with "PackageA2"', () => {
        PackageA2();
        expect(consoleSpy).toHaveBeenCalledWith('PackageA2');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
});

