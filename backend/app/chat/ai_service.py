from app.chat.config import AI_PROVIDER

if AI_PROVIDER == "gemini":
    from app.chat.gemini.service import (
        get_ai_response,
        extract_legal_specialty,
        extract_location,
        fetch_top_lawyers,
        search_lawyers_for_ai,
        check_and_update_expired_subscriptions,
    )
elif AI_PROVIDER == "grok":
    from app.chat.grok.service import (
        get_ai_response,
        extract_legal_specialty,
        extract_location,
        fetch_top_lawyers,
        search_lawyers_for_ai,
        check_and_update_expired_subscriptions,
    )
else:
    from app.chat.ollama.service import (
        get_ai_response,
        extract_legal_specialty,
        extract_location,
        fetch_top_lawyers,
        search_lawyers_for_ai,
        check_and_update_expired_subscriptions,
    )
