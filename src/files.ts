import { basename } from 'path';

export function extractFilenameWithoutExtension(fullPath: string): string {
    const filenameWithExtension = basename(fullPath);
    const dotIndex = filenameWithExtension.lastIndexOf('.');
    if (dotIndex < 0) {
        return filenameWithExtension;
    }
    return filenameWithExtension.substring(0, dotIndex);
}

export function extractFilenameExtension(fullPath: string): string {
    const filenameWithExtension = basename(fullPath);
    const dotIndex = filenameWithExtension.lastIndexOf('.');
    if (dotIndex < 0) {
        return filenameWithExtension;
    }
    return filenameWithExtension.substring(dotIndex + 1);
}