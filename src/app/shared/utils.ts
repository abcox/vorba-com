export const getSessionId = (): string => {
    let sessionId = localStorage.getItem('quizSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('quizSessionId', sessionId);
    }
    return sessionId;
}

export const clearSessionId = (): void => {
    localStorage.removeItem('quizSessionId');
}
