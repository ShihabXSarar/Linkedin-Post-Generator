/**
 * LinkedIn Post Generator — Frontend Logic
 * Handles form submission, API calls, UI state management, and interactions.
 */

(() => {
    "use strict";

    // ── DOM References ──────────────────────────────────────────────
    const form          = document.getElementById("generate-form");
    const topicInput    = document.getElementById("topic");
    const languageInput = document.getElementById("language");
    const topicCount    = document.getElementById("topic-count");
    const btnGenerate   = document.getElementById("btn-generate");
    const btnText       = btnGenerate.querySelector(".btn-text");

    // Output states
    const emptyState    = document.getElementById("empty-state");
    const loadingState  = document.getElementById("loading-state");
    const resultState   = document.getElementById("result-state");
    const errorState    = document.getElementById("error-state");
    const resultMeta    = document.getElementById("result-meta");
    const resultContent = document.getElementById("result-content");
    const errorText     = document.getElementById("error-text");

    // Action buttons
    const btnCopy       = document.getElementById("btn-copy");
    const btnRegenerate = document.getElementById("btn-regenerate");

    // Pipeline steps
    const stepPrompt    = document.getElementById("step-prompt");
    const stepLLM       = document.getElementById("step-llm");
    const stepParser    = document.getElementById("step-parser");

    // Toast
    const toast         = document.getElementById("toast");

    const MAX_TOPIC_LENGTH = 200;

    // ── Helpers ─────────────────────────────────────────────────────

    /** Show one output state, hide the rest. */
    function showState(state) {
        [emptyState, loadingState, resultState, errorState].forEach((el) => {
            el.classList.toggle("hidden", el !== state);
        });
    }

    /** Animate pipeline steps sequentially. */
    function animatePipeline(phase) {
        const steps = [stepPrompt, stepLLM, stepParser];
        steps.forEach((s) => s.classList.remove("active", "done"));

        if (phase === "prompt") {
            stepPrompt.classList.add("active");
        } else if (phase === "llm") {
            stepPrompt.classList.add("done");
            stepLLM.classList.add("active");
        } else if (phase === "parser") {
            stepPrompt.classList.add("done");
            stepLLM.classList.add("done");
            stepParser.classList.add("active");
        } else if (phase === "done") {
            steps.forEach((s) => s.classList.add("done"));
        } else {
            // reset — do nothing
        }
    }

    /** Show toast message. */
    function showToast(message, duration = 2500) {
        toast.textContent = message;
        toast.classList.remove("hidden");
        // Force reflow so transition replays
        void toast.offsetWidth;
        toast.classList.add("visible");

        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => toast.classList.add("hidden"), 350);
        }, duration);
    }

    // ── Character Counter ───────────────────────────────────────────
    topicInput.addEventListener("input", () => {
        const len = topicInput.value.length;
        topicCount.textContent = `${len} / ${MAX_TOPIC_LENGTH}`;
        if (len > MAX_TOPIC_LENGTH) {
            topicCount.style.color = "var(--error)";
        } else {
            topicCount.style.color = "";
        }
    });

    // ── Form Submission ─────────────────────────────────────────────
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        generatePost();
    });

    async function generatePost() {
        const topic = topicInput.value.trim();
        const language = languageInput.value;

        // Validate
        if (!topic) {
            showToast("Please enter a topic.");
            topicInput.focus();
            return;
        }
        if (topic.length > MAX_TOPIC_LENGTH) {
            showToast("Topic is too long. Keep it under 200 characters.");
            topicInput.focus();
            return;
        }

        // Disable form
        btnGenerate.disabled = true;
        btnText.textContent = "Generating…";

        // Show loading state + animate pipeline
        showState(loadingState);
        animatePipeline("prompt");

        // Simulate staged pipeline with small delays for UX
        setTimeout(() => animatePipeline("llm"), 600);

        try {
            const response = await fetch("/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, language }),
            });

            // Pipeline: parser stage
            animatePipeline("parser");

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.detail || `Server error (${response.status})`);
            }

            const data = await response.json();

            // Small delay for parser animation to be visible
            await new Promise((r) => setTimeout(r, 400));
            animatePipeline("done");

            // Display result
            renderResult(data);
        } catch (err) {
            animatePipeline("reset");
            showState(errorState);
            errorText.textContent = err.message || "Something went wrong. Please try again.";
        } finally {
            btnGenerate.disabled = false;
            btnText.textContent = "Generate Post";
        }
    }

    /** Render the generated post into the output card. */
    function renderResult(data) {
        // Meta tags
        resultMeta.innerHTML = `
            <span class="meta-tag">📝 ${escapeHtml(data.topic)}</span>
            <span class="meta-tag">🌐 ${escapeHtml(data.language)}</span>
        `;

        // Post content
        resultContent.textContent = data.post;

        showState(resultState);
    }

    /** Basic HTML escaping. */
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Copy to Clipboard ───────────────────────────────────────────
    btnCopy.addEventListener("click", async () => {
        const text = resultContent.textContent;
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            showToast("Copied to clipboard!");
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            showToast("Copied to clipboard!");
        }
    });

    // ── Regenerate ──────────────────────────────────────────────────
    btnRegenerate.addEventListener("click", () => {
        generatePost();
    });
})();
