export const API_BASE_URL = "http://localhost:8000";

export const AI_API_URL = "https://aide-sdlc-backend.imagine.tech/api/v1/brownfield/chat/completions";
export const AI_API_TOKEN = "KweLXzd0x44fUg4C5fCiLokClOJudap99Oz2tnUIK7Jr5DgVo34n38mI7p34fzABDfUnXYl7kgh3JQogw6Xolk6vKDpaRbDT09M487rYsAuK9JWJABwZ0lL7wc6CuJ7VSLeZzfDP1eiQWp3IJ46zr5sqESZxQxH6zoImyw3YVTuI8DrFzeQxRkcPP0kb7D4vo6FqfPiMwvHR69GvCtuQNsfdERsibCAhuCGKFQxFUJPzOKZjxSl8bHYOVWzRgRB7iHeB2UXmsVHaZdetSSXyeEpBpPZ2pOe0ex8gSEvROvML";
export const AI_MODEL = "giga-brain";

export const STORAGE_KEY = {
    LATEST_RESULT: 'latestAnalysisResult',
    SCAN_HISTORY: 'scanHistory',
    SETTINGS: 'userSettings'
} as const;