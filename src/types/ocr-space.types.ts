export interface OcrParsedResult {
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
}

export interface OcrSuccessResponse {
    OCRExitCode: number;
    IsErroredOnProcessing: boolean;
    ParsedResults: OcrParsedResult[];
    ErrorMessage: string[];
    ErrorDetails: string;
    SearchablePDFURL: string;
    ProcessingTimeInMilliseconds: string;
}

export interface OcrErrorResponse {
    OCRExitCode: number;
    IsErroredOnProcessing: boolean;
    ErrorMessage: string[];
    ErrorDetails: string;
}

export type OcrApiResponse = OcrSuccessResponse | OcrErrorResponse;