Screenshot capture was requested for both mobile and web views.

During this session:

- initial automated captures were blank because the web bundle was failing on a missing `ChoiceChipGroup` component
- the missing component was restored
- follow-up screenshot regeneration was skipped in-session before verified replacements were captured

Regenerate screenshots after starting the app successfully:

- web desktop: capture the Today screen on `http://localhost:8083`
- mobile: capture the same Today screen from Expo Go or a mobile-width browser session
