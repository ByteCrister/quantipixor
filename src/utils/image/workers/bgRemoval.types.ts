export interface BgRemovalWorkerRequest {
  id: string;
  type: "removeBackground";
  imageData: ArrayBuffer;
  mimeType: string;
  fileName: string;
}

export interface BgRemovalWorkerSuccessResponse {
  id: string;
  type: "success";
  resultBase64: string;
}

export interface BgRemovalWorkerErrorResponse {
  id: string;
  type: "error";
  error: string;
  isOutOfMemory?: boolean;
}

export interface BgRemovalWorkerLoadingResponse {
  type: "loading";
  status?: string;
}

export interface BgRemovalWorkerLoadingProgressResponse {
  type: "loadingProgress";
  progress?: unknown;
}

export interface BgRemovalWorkerLoadingCompleteResponse {
  type: "loadingComplete";
}

export interface BgRemovalWorkerLoadingErrorResponse {
  type: "loadingError";
  error?: string;
}

export type BgRemovalWorkerResponse =
  | BgRemovalWorkerSuccessResponse
  | BgRemovalWorkerErrorResponse
  | BgRemovalWorkerLoadingResponse
  | BgRemovalWorkerLoadingProgressResponse
  | BgRemovalWorkerLoadingCompleteResponse
  | BgRemovalWorkerLoadingErrorResponse;
