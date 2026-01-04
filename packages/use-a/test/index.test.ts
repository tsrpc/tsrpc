import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useA } from '../src/index';

describe('useA', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should be a function', () => {
        expect(typeof useA).toBe('function');
    });

    it('should call PackageA, PackageB, PackageB3 and log "useA"', () => {
        useA();

        expect(consoleSpy).toHaveBeenCalledWith('PackageA');
        expect(consoleSpy).toHaveBeenCalledWith('PackageB');
        expect(consoleSpy).toHaveBeenCalledWith('useA');
        expect(consoleSpy).toHaveBeenCalledTimes(3);
    });
});

