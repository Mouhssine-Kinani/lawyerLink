from app.chat.config import AI_PROVIDER

if AI_PROVIDER == "gemini":
    from app.chat.gemini_service import (
        get_ai_response,
        extract_legal_specialty,
        extract_location,
        fetch_top_lawyers,
        search_lawyers_for_ai,
        check_and_update_expired_subscriptions,
    )
else:
    from app.chat.service import (
        get_ai_response,
        extract_legal_specialty,
        extract_location,
        fetch_top_lawyers,
        search_lawyers_for_ai,
        check_and_update_expired_subscriptions,
    )