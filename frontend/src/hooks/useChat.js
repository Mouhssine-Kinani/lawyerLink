import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { chatApi } from "../api/chat.api";

export function useChat() {
  const { token, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((e) => {
    if (e.status === 401) {
      logout();
      return;
    }
    setError(e.message);
  }, [logout]);

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoadingSessions(true);
    try {
      const data = await chatApi.listSessions(token);
      setSessions(data);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingSessions(false);
    }
  }, [token, handleError]);

  const fetchHistory = useCallback(async (sessionId) => {
    if (!token || !sessionId) return;
    setLoadingMessages(true);
    try {
      const data = await chatApi.getHistory(sessionId, token);
      setMessages(data);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingMessages(false);
    }
  }, [token, handleError]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchRecommendations = useCallback(async (sessionId) => {
    if (!token || !sessionId) return;
    setLoadingRecommendations(true);
    try {
      const data = await chatApi.getSessionRecommendations(sessionId, token);
      setRecommendations(data);
    } catch (e) {
      handleError(e);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [token, handleError]);

  useEffect(() => {
    if (activeSessionId) {
      fetchHistory(activeSessionId);
      fetchRecommendations(activeSessionId);
    } else {
      setMessages([]);
      setRecommendations([]);
    }
  }, [activeSessionId, fetchHistory, fetchRecommendations]);

  const createSession = useCallback(async () => {
    if (!token) return null;
    setSending(true);
    try {
      const session = await chatApi.createSession(token);
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      return session;
    } catch (e) {
      handleError(e);
      return null;
    } finally {
      setSending(false);
    }
  }, [token, handleError]);

  const sendMessage = useCallback(async (content) => {
    if (!token || !activeSessionId) return null;
    setSending(true);
    const tempUserMsg = { id: Date.now(), session_id: activeSessionId, sender: "client", content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);
    try {
      const data = await chatApi.sendMessage(activeSessionId, content, token);
      const aiMsg = { id: Date.now() + 1, session_id: activeSessionId, sender: "ai", content: data.ai_response, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      fetchSessions();
      fetchRecommendations(activeSessionId);
      return data;
    } catch (e) {
      handleError(e);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      return null;
    } finally {
      setSending(false);
    }
  }, [token, activeSessionId, fetchSessions, fetchRecommendations, handleError]);

  const deleteSession = useCallback(async (sessionId) => {
    if (!token) return;
    try {
      await chatApi.deleteSession(sessionId, token);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (e) {
      handleError(e);
    }
  }, [token, activeSessionId, handleError]);

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
  }, []);

  return {
    sessions,
    activeSessionId,
    messages,
    recommendations,
    sending,
    loadingSessions,
    loadingMessages,
    loadingRecommendations,
    error,
    createSession,
    sendMessage,
    deleteSession,
    selectSession,
    fetchSessions,
  };
}
