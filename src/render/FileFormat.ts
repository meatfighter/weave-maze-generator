import { DEFAULT_FILE_FORMAT } from '@/render/RenderOptions';

export enum FileFormat {
    PNG,
    SVG,
    PDF,
    ALL_FORMATS,
}

export function toFileFormat(format: string | undefined): FileFormat {
    if (!format) {
        return DEFAULT_FILE_FORMAT;
    }
    switch (format.trim().toLowerCase()) {
        case 'png':
            return FileFormat.PNG;
        case 'svg':
            return FileFormat.SVG;
        case 'pdf':
            return FileFormat.PDF;
        default:
            return DEFAULT_FILE_FORMAT;
    }
}